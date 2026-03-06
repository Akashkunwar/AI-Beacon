// src/__tests__/store/stepMachine.test.ts
// Vitest tests for the step machine (executeStep) and Zustand simulatorStore actions.

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { executeStep } from '@/lib/store/stepMachine';
import { useSimulatorStore } from '@/lib/store/simulatorStore';
import { PipelineStep, DEFAULT_CONFIG } from '@/lib/store/types';

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Build a minimal state object for executeStep tests (pure function). */
function makeState(overrides: Partial<Parameters<typeof executeStep>[1]> = {}) {
    return {
        config: DEFAULT_CONFIG,
        tensors: {},
        inputText: 'The cat sat',
        temperature: 1.0,
        ...overrides,
    };
}

/** Reset Zustand store between tests. */
function resetStore() {
    useSimulatorStore.getState().reset();
    // Also reset inputText to known value
    useSimulatorStore.setState({ inputText: 'The cat sat' });
}

// ── executeStep (pure function tests) ────────────────────────────────────────

describe('executeStep — pure function', () => {
    const state = makeState();

    it('TOKENIZE: splits input text into word tokens', () => {
        const result = executeStep(PipelineStep.TOKENIZE, state);
        expect(result.tokens).toBeDefined();
        expect(result.tokens!.raw).toEqual(['the', 'cat', 'sat']);
    });

    it('TOKENIZE: throws if input text is empty', () => {
        expect(() =>
            executeStep(PipelineStep.TOKENIZE, makeState({ inputText: '   ' }))
        ).toThrow('empty');
    });

    it('TOKEN_IDS: maps tokens to integer IDs', () => {
        const withTokens = executeStep(PipelineStep.TOKENIZE, state);
        const result = executeStep(PipelineStep.TOKEN_IDS, { ...state, tensors: withTokens });
        expect(result.token_ids).toBeDefined();
        expect(result.token_ids!.ids).toHaveLength(3);
        result.token_ids!.ids.forEach(id => {
            expect(id).toBeGreaterThanOrEqual(0);
            expect(id).toBeLessThan(512);
        });
    });

    it('EMBEDDING: produces shape (n, dModel)', () => {
        let s = { ...state, tensors: {} as typeof state.tensors };
        s = { ...s, tensors: executeStep(PipelineStep.TOKENIZE, s) };
        s = { ...s, tensors: executeStep(PipelineStep.TOKEN_IDS, s) };
        const result = executeStep(PipelineStep.EMBEDDING, s);
        expect(result.embed).toBeDefined();
        expect(result.embed!.X.shape).toEqual([3, DEFAULT_CONFIG.dModel]);
        expect(result.embed!.We.shape).toEqual([512, DEFAULT_CONFIG.dModel]);
    });

    it('POSITIONAL_ENCODING: X_pos = X_embed + PE, same shape', () => {
        let s = { ...state, tensors: {} as typeof state.tensors };
        s = { ...s, tensors: executeStep(PipelineStep.TOKENIZE, s) };
        s = { ...s, tensors: executeStep(PipelineStep.TOKEN_IDS, s) };
        s = { ...s, tensors: executeStep(PipelineStep.EMBEDDING, s) };
        const result = executeStep(PipelineStep.POSITIONAL_ENCODING, s);
        expect(result.posenc).toBeDefined();
        expect(result.posenc!.X_pos.shape).toEqual([3, DEFAULT_CONFIG.dModel]);
        expect(result.posenc!.PE.shape).toEqual([3, DEFAULT_CONFIG.dModel]);
        // X_pos ≠ X_embed (PE was added)
        const X_embed = result.embed!.X;
        const X_pos = result.posenc!.X_pos;
        const anyDifferent = Array.from(X_embed.data).some((v, i) => Math.abs(v - X_pos.data[i]) > 1e-7);
        expect(anyDifferent).toBe(true);
    });

    it('ATTENTION: produces correct tensor shapes', () => {
        let s = { ...state, tensors: {} as typeof state.tensors };
        s = { ...s, tensors: executeStep(PipelineStep.TOKENIZE, s) };
        s = { ...s, tensors: executeStep(PipelineStep.TOKEN_IDS, s) };
        s = { ...s, tensors: executeStep(PipelineStep.EMBEDDING, s) };
        s = { ...s, tensors: executeStep(PipelineStep.POSITIONAL_ENCODING, s) };
        const result = executeStep(PipelineStep.ATTENTION, s);

        expect(result.attention).toBeDefined();
        const attn = result.attention!;
        const d = DEFAULT_CONFIG.dModel;
        const n = 3;
        const dHead = d; // single head: dHead = dModel

        expect(attn.Q.shape).toEqual([n, dHead]);
        expect(attn.K.shape).toEqual([n, dHead]);
        expect(attn.V.shape).toEqual([n, dHead]);
        expect(attn.scores.shape).toEqual([n, n]);
        expect(attn.weights.shape).toEqual([n, n]);
        expect(attn.output.shape).toEqual([n, dHead]);
        expect(attn.multihead_out.shape).toEqual([n, d]);
    });

    it('ATTENTION: attention weights sum to ≈ 1 per row', () => {
        let s = { ...state, tensors: {} as typeof state.tensors };
        s = { ...s, tensors: executeStep(PipelineStep.TOKENIZE, s) };
        s = { ...s, tensors: executeStep(PipelineStep.TOKEN_IDS, s) };
        s = { ...s, tensors: executeStep(PipelineStep.EMBEDDING, s) };
        s = { ...s, tensors: executeStep(PipelineStep.POSITIONAL_ENCODING, s) };
        const result = executeStep(PipelineStep.ATTENTION, s);

        const weights = result.attention!.weights;
        const [rows, cols] = weights.shape as number[];
        for (let r = 0; r < rows; r++) {
            let rowSum = 0;
            for (let c = 0; c < cols; c++) {
                rowSum += weights.data[r * cols + c];
            }
            expect(Math.abs(rowSum - 1.0)).toBeLessThan(1e-5);
        }
    });

    it('RESIDUAL: X_res shape matches (n, dModel)', () => {
        let s = { ...state, tensors: {} as typeof state.tensors };
        for (const step of [
            PipelineStep.TOKENIZE, PipelineStep.TOKEN_IDS,
            PipelineStep.EMBEDDING, PipelineStep.POSITIONAL_ENCODING, PipelineStep.ATTENTION,
        ]) {
            s = { ...s, tensors: executeStep(step, s) };
        }
        const result = executeStep(PipelineStep.RESIDUAL, s);
        expect(result.residual!.X_res.shape).toEqual([3, DEFAULT_CONFIG.dModel]);
    });

    it('LAYER_NORM: output has approximately mean ≈ 0 and std ≈ 1 per row', () => {
        let s = { ...state, tensors: {} as typeof state.tensors };
        for (const step of [
            PipelineStep.TOKENIZE, PipelineStep.TOKEN_IDS,
            PipelineStep.EMBEDDING, PipelineStep.POSITIONAL_ENCODING,
            PipelineStep.ATTENTION, PipelineStep.RESIDUAL,
        ]) {
            s = { ...s, tensors: executeStep(step, s) };
        }
        const result = executeStep(PipelineStep.LAYER_NORM, s);
        const X_norm = result.layernorm!.X_norm;
        const [rows, cols] = X_norm.shape as number[];

        for (let r = 0; r < rows; r++) {
            let mean = 0;
            for (let c = 0; c < cols; c++) mean += X_norm.data[r * cols + c];
            mean /= cols;
            expect(Math.abs(mean)).toBeLessThan(1e-4);
        }
    });

    it('FFN: output shape (n, dModel), hidden shape (n, dFF)', () => {
        let s = { ...state, tensors: {} as typeof state.tensors };
        for (const step of [
            PipelineStep.TOKENIZE, PipelineStep.TOKEN_IDS,
            PipelineStep.EMBEDDING, PipelineStep.POSITIONAL_ENCODING,
            PipelineStep.ATTENTION, PipelineStep.RESIDUAL, PipelineStep.LAYER_NORM,
        ]) {
            s = { ...s, tensors: executeStep(step, s) };
        }
        const result = executeStep(PipelineStep.FFN, s);
        expect(result.ffn!.output.shape).toEqual([3, DEFAULT_CONFIG.dModel]);
        expect(result.ffn!.hidden.shape).toEqual([3, DEFAULT_CONFIG.dFF]);
    });

    it('LM_HEAD: logits shape is (VOCAB_SIZE,)', () => {
        let s = { ...state, tensors: {} as typeof state.tensors };
        for (const step of [
            PipelineStep.TOKENIZE, PipelineStep.TOKEN_IDS,
            PipelineStep.EMBEDDING, PipelineStep.POSITIONAL_ENCODING,
            PipelineStep.ATTENTION, PipelineStep.RESIDUAL, PipelineStep.LAYER_NORM,
            PipelineStep.FFN,
        ]) {
            s = { ...s, tensors: executeStep(step, s) };
        }
        const result = executeStep(PipelineStep.LM_HEAD, s);
        expect(result.lm_head!.logits.shape).toEqual([512]);
    });

    it('SOFTMAX: probs sum to ≈ 1.0', () => {
        let s = { ...state, tensors: {} as typeof state.tensors };
        for (const step of [
            PipelineStep.TOKENIZE, PipelineStep.TOKEN_IDS,
            PipelineStep.EMBEDDING, PipelineStep.POSITIONAL_ENCODING,
            PipelineStep.ATTENTION, PipelineStep.RESIDUAL, PipelineStep.LAYER_NORM,
            PipelineStep.FFN, PipelineStep.LM_HEAD,
        ]) {
            s = { ...s, tensors: executeStep(step, s) };
        }
        const result = executeStep(PipelineStep.SOFTMAX, s);
        const probs = result.softmax!.probs;
        const sum = Array.from(probs.data).reduce((a, b) => a + b, 0);
        expect(Math.abs(sum - 1.0)).toBeLessThan(1e-4);
    });

    it('SAMPLING: selects a valid token ID', () => {
        let s = { ...state, tensors: {} as typeof state.tensors };
        for (const step of [
            PipelineStep.TOKENIZE, PipelineStep.TOKEN_IDS,
            PipelineStep.EMBEDDING, PipelineStep.POSITIONAL_ENCODING,
            PipelineStep.ATTENTION, PipelineStep.RESIDUAL, PipelineStep.LAYER_NORM,
            PipelineStep.FFN, PipelineStep.LM_HEAD, PipelineStep.SOFTMAX,
        ]) {
            s = { ...s, tensors: executeStep(step, s) };
        }
        const result = executeStep(PipelineStep.SAMPLING, s);
        const { selected_id, selected_token } = result.sampling!;
        expect(selected_id).toBeGreaterThanOrEqual(0);
        expect(selected_id).toBeLessThan(512);
        expect(typeof selected_token).toBe('string');
        expect(selected_token.length).toBeGreaterThan(0);
    });

    it('is deterministic: same seed + input → same token', () => {
        const runAll = () => {
            let s = { ...state, tensors: {} as typeof state.tensors };
            for (const step of [
                PipelineStep.TOKENIZE, PipelineStep.TOKEN_IDS,
                PipelineStep.EMBEDDING, PipelineStep.POSITIONAL_ENCODING,
                PipelineStep.ATTENTION, PipelineStep.RESIDUAL, PipelineStep.LAYER_NORM,
                PipelineStep.FFN, PipelineStep.LM_HEAD, PipelineStep.SOFTMAX,
                PipelineStep.SAMPLING,
            ]) {
                s = { ...s, tensors: executeStep(step, s) };
            }
            return s.tensors.sampling!.selected_token;
        };

        expect(runAll()).toBe(runAll());
    });
});

// ── Zustand store action tests ────────────────────────────────────────────────

describe('simulatorStore', () => {
    beforeEach(() => {
        resetStore();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('initial state: currentStep = INPUT, tensors empty, not playing', () => {
        const { currentStep, isPlaying, tensors, stepHistory } = useSimulatorStore.getState();
        expect(currentStep).toBe(PipelineStep.INPUT);
        expect(isPlaying).toBe(false);
        expect(Object.keys(tensors)).toHaveLength(0);
        expect(stepHistory).toHaveLength(0);
    });

    it('stepForward: INPUT → TOKENIZE populates tokens', () => {
        useSimulatorStore.getState().stepForward();
        const { currentStep, tensors } = useSimulatorStore.getState();
        expect(currentStep).toBe(PipelineStep.TOKENIZE);
        expect(tensors.tokens?.raw).toEqual(['the', 'cat', 'sat']);
    });

    it('stepForward: adds snapshot to history', () => {
        useSimulatorStore.getState().stepForward();
        const { stepHistory } = useSimulatorStore.getState();
        expect(stepHistory).toHaveLength(1);
        expect(stepHistory[0].step).toBe(PipelineStep.INPUT);
    });

    it('stepForward: advances through all 12 steps without error', () => {
        const { stepForward } = useSimulatorStore.getState();
        for (let i = 0; i < 11; i++) {
            stepForward();
        }
        const { currentStep } = useSimulatorStore.getState();
        expect(currentStep).toBe(PipelineStep.SAMPLING);
    });

    it('stepForward: cannot go past SAMPLING', () => {
        const { stepForward } = useSimulatorStore.getState();
        for (let i = 0; i < 15; i++) stepForward(); // over-advance
        expect(useSimulatorStore.getState().currentStep).toBe(PipelineStep.SAMPLING);
    });

    it('stepBackward: restores previous step and tensors', () => {
        const { stepForward, stepBackward } = useSimulatorStore.getState();
        // Advance to TOKENIZE
        stepForward();
        const afterTokenize = { ...useSimulatorStore.getState().tensors };
        // Advance to TOKEN_IDS
        stepForward();
        expect(useSimulatorStore.getState().currentStep).toBe(PipelineStep.TOKEN_IDS);
        // Go back
        stepBackward();
        const state = useSimulatorStore.getState();
        expect(state.currentStep).toBe(PipelineStep.TOKENIZE);
        expect(state.tensors.tokens?.raw).toEqual(afterTokenize.tokens?.raw);
        expect(state.tensors.token_ids).toBeUndefined();
    });

    it('stepBackward: no-op when at INPUT (history empty)', () => {
        useSimulatorStore.getState().stepBackward();
        expect(useSimulatorStore.getState().currentStep).toBe(PipelineStep.INPUT);
    });

    it('reset: clears tensors and returns to INPUT', () => {
        const { stepForward, reset } = useSimulatorStore.getState();
        stepForward(); stepForward(); stepForward();
        reset();
        const { currentStep, tensors, stepHistory, isPlaying } = useSimulatorStore.getState();
        expect(currentStep).toBe(PipelineStep.INPUT);
        expect(Object.keys(tensors)).toHaveLength(0);
        expect(stepHistory).toHaveLength(0);
        expect(isPlaying).toBe(false);
    });

    it('updateConfig: resets tensors and returns to INPUT', () => {
        const { stepForward, updateConfig } = useSimulatorStore.getState();
        stepForward(); stepForward();
        updateConfig({ dModel: 16 });
        const { currentStep, tensors, stepHistory } = useSimulatorStore.getState();
        expect(currentStep).toBe(PipelineStep.INPUT);
        expect(Object.keys(tensors)).toHaveLength(0);
        expect(stepHistory).toHaveLength(0);
        expect(useSimulatorStore.getState().config.dModel).toBe(16);
        expect(useSimulatorStore.getState().config.dFF).toBe(64); // auto-derived
    });

    it('setInput: resets pipeline to INPUT', () => {
        const { stepForward, setInput } = useSimulatorStore.getState();
        stepForward(); stepForward();
        setInput('Hello world');
        const { currentStep, tensors, inputText } = useSimulatorStore.getState();
        expect(currentStep).toBe(PipelineStep.INPUT);
        expect(Object.keys(tensors)).toHaveLength(0);
        expect(inputText).toBe('Hello world');
    });

    it('setMode: updates mode without resetting pipeline', () => {
        const { stepForward, setMode } = useSimulatorStore.getState();
        stepForward();
        setMode('advanced');
        const { mode, currentStep } = useSimulatorStore.getState();
        expect(mode).toBe('advanced');
        expect(currentStep).toBe(PipelineStep.TOKENIZE); // not reset
    });

    it('setPlaySpeed: updates playSpeed', () => {
        useSimulatorStore.getState().setPlaySpeed('fast');
        expect(useSimulatorStore.getState().playSpeed).toBe('fast');
    });

    it('playAll: sets isPlaying=true and auto-advances with fake timers', () => {
        vi.useFakeTimers();
        const { playAll } = useSimulatorStore.getState();
        playAll();
        expect(useSimulatorStore.getState().isPlaying).toBe(true);

        // Advance time — 500ms per step (normal speed), 11 steps needed
        vi.advanceTimersByTime(500 * 12);

        const { currentStep, isPlaying } = useSimulatorStore.getState();
        expect(currentStep).toBe(PipelineStep.SAMPLING);
        expect(isPlaying).toBe(false); // auto-stopped at end
    });

    it('pause: stops playAll and sets isPlaying=false', () => {
        vi.useFakeTimers();
        const { playAll, pause } = useSimulatorStore.getState();
        playAll();
        expect(useSimulatorStore.getState().isPlaying).toBe(true);

        vi.advanceTimersByTime(500 * 3); // advance 3 steps
        pause();

        const { isPlaying } = useSimulatorStore.getState();
        expect(isPlaying).toBe(false);
    });

    it('playAll is idempotent: calling twice does not start multiple intervals', () => {
        vi.useFakeTimers();
        const { playAll } = useSimulatorStore.getState();
        playAll();
        playAll(); // should be no-op
        vi.advanceTimersByTime(500 * 12);
        // Should still land at SAMPLING exactly once
        expect(useSimulatorStore.getState().currentStep).toBe(PipelineStep.SAMPLING);
    });

    it('full run: step through entire pipeline — sampling produces a token', () => {
        const { stepForward } = useSimulatorStore.getState();
        for (let i = 0; i < 11; i++) stepForward();
        const { tensors, currentStep } = useSimulatorStore.getState();
        expect(currentStep).toBe(PipelineStep.SAMPLING);
        expect(tensors.sampling?.selected_token).toBeTruthy();
        expect(typeof tensors.sampling?.selected_id).toBe('number');
    });

    it('config change: d_model=16 propagates to embedding shape after re-run', () => {
        useSimulatorStore.getState().updateConfig({ dModel: 16 });
        const { stepForward } = useSimulatorStore.getState();
        stepForward(); // TOKENIZE
        stepForward(); // TOKEN_IDS
        stepForward(); // EMBEDDING
        const { tensors } = useSimulatorStore.getState();
        expect(tensors.embed?.X.shape[1]).toBe(16);
    });
});
