// src/lib/store/simulatorStore.ts
// Zustand global store — single source of truth for all simulator state.
//
// Key design decisions:
//  - Snapshot history enables stepBackward (undo)
//  - Play All uses a module-level interval ref to avoid Zustand re-render loop
//  - updateConfig / setInput reset tensor state (pipeline invalidated)

import { create } from 'zustand';
import { PipelineStep, PIPELINE_STEP_LAST, PLAY_SPEEDS, DEFAULT_CONFIG } from './types';
import type { SimulatorState, TensorRegistry, StepSnapshot, ModelConfig, AppMode, PlaySpeed } from './types';
import { executeStep, configHash } from './stepMachine';

// Module-level interval ref — NOT in Zustand state (avoids render loops)
let _playInterval: ReturnType<typeof setInterval> | null = null;

const clearPlayInterval = () => {
    if (_playInterval !== null) {
        clearInterval(_playInterval);
        _playInterval = null;
    }
};

// Empty tensor registry (pre-step state)
const EMPTY_TENSORS: TensorRegistry = {};

// ── Initial state (data) ────────────────────────────────────────────────────

const INITIAL_STATE = {
    config: DEFAULT_CONFIG,
    mode: 'simple' as AppMode,
    tokenizerType: 'word_split' as const,
    peType: 'sinusoidal' as const,
    activationFn: 'gelu' as const,
    samplingMethod: 'greedy' as const,
    temperature: 1.0,
    inputText: 'The cat sat',
    currentStep: PipelineStep.INPUT,
    stepHistory: [] as StepSnapshot[],
    isPlaying: false,
    playSpeed: 'normal' as PlaySpeed,
    tensors: EMPTY_TENSORS,
};

// ── Store ────────────────────────────────────────────────────────────────────

export const useSimulatorStore = create<SimulatorState>((set, get) => ({
    ...INITIAL_STATE,

    // ── stepForward ──────────────────────────────────────────────────────────
    stepForward: () => {
        const state = get();
        const { currentStep, tensors, config, inputText, temperature } = state;

        // Guard: cannot go past last step
        if (currentStep >= PIPELINE_STEP_LAST) return;

        const nextStep = (currentStep + 1) as PipelineStep;

        // 1. Snapshot current state for undo
        const snapshot: StepSnapshot = {
            step: currentStep,
            tensors,       // reference — tensors are immutable (new objects per step)
            timestamp: Date.now(),
            configHash: configHash(config),
        };

        // 2. Execute the next step (may throw on bad input)
        let newTensors: TensorRegistry;
        try {
            newTensors = executeStep(nextStep, { config, tensors, inputText, temperature });
        } catch (err) {
            console.error('[AI Beacon] Step execution failed:', err);
            // Stop playing if an error occurs
            clearPlayInterval();
            set({ isPlaying: false });
            return;
        }

        // 3. Update store
        set({
            currentStep: nextStep,
            tensors: newTensors,
            stepHistory: [...state.stepHistory, snapshot],
        });

        // 4. Auto-stop play if we just reached the last step
        if (nextStep >= PIPELINE_STEP_LAST) {
            clearPlayInterval();
            set({ isPlaying: false });
        }
    },

    // ── stepBackward ─────────────────────────────────────────────────────────
    stepBackward: () => {
        const { stepHistory, isPlaying } = get();

        // Stop any active play
        if (isPlaying) {
            clearPlayInterval();
        }

        if (stepHistory.length === 0) return;

        // Pop last snapshot
        const history = [...stepHistory];
        const last = history.pop()!;

        set({
            currentStep: last.step,
            tensors: last.tensors,
            stepHistory: history,
            isPlaying: false,
        });
    },

    // ── playAll ──────────────────────────────────────────────────────────────
    playAll: () => {
        const state = get();

        // Already at the end — nothing to play
        if (state.currentStep >= PIPELINE_STEP_LAST) return;

        // Already playing — no-op (user should pause first)
        if (state.isPlaying) return;

        set({ isPlaying: true });

        const delay = PLAY_SPEEDS[get().playSpeed];

        _playInterval = setInterval(() => {
            const current = get();

            if (current.currentStep >= PIPELINE_STEP_LAST) {
                clearPlayInterval();
                set({ isPlaying: false });
                return;
            }

            // Re-read playSpeed each tick so speed changes apply immediately
            current.stepForward();
        }, delay);
    },

    // ── pause ─────────────────────────────────────────────────────────────────
    pause: () => {
        clearPlayInterval();
        set({ isPlaying: false });
    },

    // ── reset ─────────────────────────────────────────────────────────────────
    reset: () => {
        clearPlayInterval();
        set({
            currentStep: PipelineStep.INPUT,
            tensors: EMPTY_TENSORS,
            stepHistory: [],
            isPlaying: false,
        });
    },

    // ── updateConfig ──────────────────────────────────────────────────────────
    // Config changes invalidate all computed tensors — reset to INPUT.
    updateConfig: (patch: Partial<ModelConfig>) => {
        clearPlayInterval();
        const { config } = get();
        const newConfig = { ...config, ...patch };

        // Auto-derive dFF
        if (patch.dModel !== undefined) {
            newConfig.dFF = patch.dModel * 4;
        }

        set({
            config: newConfig,
            currentStep: PipelineStep.INPUT,
            tensors: EMPTY_TENSORS,
            stepHistory: [],
            isPlaying: false,
        });
    },

    // ── setInput ──────────────────────────────────────────────────────────────
    // Input change invalidates the pipeline — reset to INPUT step.
    setInput: (text: string) => {
        clearPlayInterval();
        set({
            inputText: text,
            currentStep: PipelineStep.INPUT,
            tensors: EMPTY_TENSORS,
            stepHistory: [],
            isPlaying: false,
        });
    },

    // ── setMode ───────────────────────────────────────────────────────────────
    setMode: (mode: AppMode) => {
        set({ mode });
    },

    // ── setPlaySpeed ─────────────────────────────────────────────────────────
    // Update speed. If currently playing: restart the interval at new speed.
    setPlaySpeed: (speed: PlaySpeed) => {
        set({ playSpeed: speed });

        const { isPlaying } = get();
        if (isPlaying) {
            clearPlayInterval();
            // Restart with new delay
            _playInterval = setInterval(() => {
                const current = get();
                if (current.currentStep >= PIPELINE_STEP_LAST) {
                    clearPlayInterval();
                    set({ isPlaying: false });
                    return;
                }
                current.stepForward();
            }, PLAY_SPEEDS[speed]);
        }
    },

    // ── setTemperature ────────────────────────────────────────────────────────
    // Changing temperature re-runs softmax/sampling if already past those steps.
    setTemperature: (temp: number) => {
        set({ temperature: temp });

        // If softmax or sampling step was already run, rewind to SOFTMAX and re-execute
        const { currentStep, stepHistory } = get();
        if (currentStep >= PipelineStep.SOFTMAX) {
            // Find the snapshot just before SOFTMAX step
            const history = [...stepHistory];
            while (history.length > 0) {
                const last = history[history.length - 1];
                if (last.step < PipelineStep.SOFTMAX) break;
                history.pop();
            }
            if (history.length > 0 || stepHistory[0]?.step === PipelineStep.SOFTMAX) {
                // Restore to pre-softmax state and let user re-advance
                const preStep = history[history.length - 1];
                if (preStep) {
                    set({
                        currentStep: PipelineStep.LM_HEAD,
                        tensors: preStep.tensors,
                        stepHistory: history,
                    });
                }
            }
        }
    },
}));
