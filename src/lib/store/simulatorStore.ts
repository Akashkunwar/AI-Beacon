// src/lib/store/simulatorStore.ts
// Zustand global store — single source of truth for all simulator state.
//
// Key design decisions:
//  - Snapshot history enables stepBackward (undo)
//  - Play All uses a module-level interval ref to avoid Zustand re-render loop
//  - updateConfig / setInput reset tensor state (pipeline invalidated)

import { create } from 'zustand';
import { PipelineStep, PIPELINE_STEP_LAST, PLAY_SPEEDS, DEFAULT_CONFIG } from './types';
import type { SimulatorState, TensorRegistry, StepSnapshot, ModelConfig, AppMode, PlaySpeed, SamplingMethod } from './types';
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
    samplingMethod: 'greedy' as SamplingMethod,
    topK: 5,
    temperature: 1.0,
    inputText: 'The cat sat',
    currentStep: PipelineStep.INPUT,
    stepHistory: [] as StepSnapshot[],
    isPlaying: false,
    playSpeed: 'normal' as PlaySpeed,
    tensors: EMPTY_TENSORS,
    stepError: null as string | null,
};

/** State reset shared by every action that invalidates the pipeline. */
const CLEARED = {
    currentStep: PipelineStep.INPUT,
    tensors: EMPTY_TENSORS,
    stepHistory: [] as StepSnapshot[],
    isPlaying: false,
    stepError: null,
};

// ── Store ────────────────────────────────────────────────────────────────────

export const useSimulatorStore = create<SimulatorState>((set, get) => ({
    ...INITIAL_STATE,

    // ── stepForward ──────────────────────────────────────────────────────────
    stepForward: () => {
        const state = get();
        const { currentStep, tensors, config, inputText, temperature, samplingMethod, topK } = state;

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
            newTensors = executeStep(nextStep, { config, tensors, inputText, temperature, samplingMethod, topK });
        } catch (err) {
            // Stop playing and tell the user why the step could not run
            clearPlayInterval();
            set({ isPlaying: false, stepError: err instanceof Error ? err.message : String(err) });
            return;
        }

        // 3. Update store
        set({
            currentStep: nextStep,
            tensors: newTensors,
            stepHistory: [...state.stepHistory, snapshot],
            stepError: null,
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
            stepError: null,
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
        set(CLEARED);
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

        set({ ...CLEARED, config: newConfig });
    },

    // ── setInput ──────────────────────────────────────────────────────────────
    // Input change invalidates the pipeline — reset to INPUT step.
    setInput: (text: string) => {
        clearPlayInterval();
        set({ ...CLEARED, inputText: text });
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

    // ── setTemperature / setSampling ─────────────────────────────────────────
    // Re-run softmax and sampling in place (current tensors and undo history),
    // so the user stays on the step they are looking at.
    setTemperature: (temp: number) => {
        set({ temperature: temp });
        recomputePrediction(get, set);
    },

    setSampling: (method: SamplingMethod, topK?: number) => {
        set({ samplingMethod: method, ...(topK !== undefined ? { topK } : {}) });
        recomputePrediction(get, set);
    },

    // ── goToStep ─────────────────────────────────────────────────────────────
    goToStep: (target: PipelineStep) => {
        clearPlayInterval();
        set({ isPlaying: false });
        const { currentStep, stepHistory } = get();
        if (target === currentStep) return;

        if (target < currentStep) {
            // History holds one snapshot per completed step, in order.
            const idx = stepHistory.findIndex((h) => h.step === target);
            if (idx === -1) return;
            set({
                currentStep: target,
                tensors: stepHistory[idx].tensors,
                stepHistory: stepHistory.slice(0, idx),
                stepError: null,
            });
            return;
        }

        while (get().currentStep < target) {
            const before = get().currentStep;
            get().stepForward();
            if (get().currentStep === before) break; // step failed; stepError is set
        }
    },

    // ── appendPrediction ─────────────────────────────────────────────────────
    // Autoregressive generation in one click: add the chosen token to the text
    // and run the pipeline again from the start.
    appendPrediction: () => {
        const { tensors, inputText } = get();
        const token = tensors.sampling?.selected_token;
        if (!token || token === '<unk>') return;
        const glue = /^[.,!?;:']$/.test(token) ? '' : ' ';
        get().setInput(`${inputText.trimEnd()}${glue}${token}`);
        get().goToStep(PIPELINE_STEP_LAST);
    },
}));

// ── Helpers ─────────────────────────────────────────────────────────────────

type Get = () => SimulatorState;
type Set = (partial: Partial<SimulatorState>) => void;

function recomputePrediction(get: Get, set: Set) {
    const s = get();
    const redo = (t: TensorRegistry): TensorRegistry => {
        if (!t.softmax || !t.lm_head) return t;
        const ctx = { config: s.config, inputText: s.inputText, temperature: s.temperature, samplingMethod: s.samplingMethod, topK: s.topK };
        let next = executeStep(PipelineStep.SOFTMAX, { ...ctx, tensors: t });
        if (t.sampling) next = executeStep(PipelineStep.SAMPLING, { ...ctx, tensors: next });
        return next;
    };
    set({
        tensors: redo(s.tensors),
        stepHistory: s.stepHistory.map((h) => ({ ...h, tensors: redo(h.tensors) })),
    });
}
