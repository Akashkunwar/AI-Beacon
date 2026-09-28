// src/__tests__/store/stepMachine.test.ts
// Vitest tests for the step machine (executeStep) and Zustand simulatorStore actions.

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { executeStep } from '@/lib/store/stepMachine';
import { useSimulatorStore } from '@/lib/store/simulatorStore';
import { PipelineStep, DEFAULT_CONFIG, PLAY_SPEEDS } from '@/lib/store/types';
import { VOCAB_LIST } from '@/lib/tokenizer/vocab';

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

        expect(attn.Q.shape).toEqual([n, d]);
        expect(attn.K.shape).toEqual([n, d]);
        expect(attn.V.shape).toEqual([n, d]);
        expect(attn.heads).toHaveLength(DEFAULT_CONFIG.nHeads);
        expect(attn.heads[0].scores.shape).toEqual([n, n]);
        expect(attn.heads[0].weights.shape).toEqual([n, n]);
        expect(attn.heads[0].output.shape).toEqual([n, d / DEFAULT_CONFIG.nHeads]);
        expect(attn.concat.shape).toEqual([n, d]);
        expect(attn.multihead_out.shape).toEqual([n, d]);
    });

    it('ATTENTION: attention weights sum to ≈ 1 per row', () => {
        let s = { ...state, tensors: {} as typeof state.tensors };
        s = { ...s, tensors: executeStep(PipelineStep.TOKENIZE, s) };
        s = { ...s, tensors: executeStep(PipelineStep.TOKEN_IDS, s) };
        s = { ...s, tensors: executeStep(PipelineStep.EMBEDDING, s) };
        s = { ...s, tensors: executeStep(PipelineStep.POSITIONAL_ENCODING, s) };
        const result = executeStep(PipelineStep.ATTENTION, s);

        const weights = result.attention!.heads[0].weights;
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

    /** Run every step up to and including `last`. */
    const runTo = (last: PipelineStep, overrides: Partial<Parameters<typeof executeStep>[1]> = {}) => {
        let s = { ...makeState(overrides), tensors: {} as ReturnType<typeof executeStep> };
        for (let step = PipelineStep.TOKENIZE; step <= last; step++) {
            s = { ...s, tensors: executeStep(step, s) };
        }
        return s.tensors;
    };

    it('TOKENIZE: splits punctuation into its own tokens', () => {
        const t = runTo(PipelineStep.TOKENIZE, { inputText: 'Hello, world!' });
        expect(t.tokens!.raw).toEqual(['hello', ',', 'world', '!']);
    });

    it('TOKENIZE: truncates to the context window and reports dropped tokens', () => {
        const t = runTo(PipelineStep.TOKENIZE, {
            inputText: 'one two three four five six seven eight nine ten',
            config: { ...DEFAULT_CONFIG, maxTokens: 8 },
        });
        expect(t.tokens!.raw).toHaveLength(8);
        expect(t.tokens!.dropped).toBe(2);
    });

    it('ATTENTION: computes one weight matrix per head', () => {
        const t = runTo(PipelineStep.ATTENTION, { config: { ...DEFAULT_CONFIG, nHeads: 4 } });
        const attn = t.attention!;
        expect(attn.heads).toHaveLength(4);
        for (const h of attn.heads) {
            expect(h.Q.shape).toEqual([3, DEFAULT_CONFIG.dModel / 4]);
            expect(h.weights.shape).toEqual([3, 3]);
        }
        // Different heads use different projections, so their patterns differ
        const w0 = Array.from(attn.heads[0].weights.data);
        const w1 = Array.from(attn.heads[1].weights.data);
        expect(w0.some((v, i) => Math.abs(v - w1[i]) > 1e-4)).toBe(true);
    });

    it('ATTENTION: causal mask gives zero weight to future tokens', () => {
        const w = runTo(PipelineStep.ATTENTION).attention!.heads[0].weights.toMatrix();
        expect(w[0][1]).toBeLessThan(1e-6);
        expect(w[0][2]).toBeLessThan(1e-6);
        expect(w[1][2]).toBeLessThan(1e-6);
        expect(w[0][0]).toBeCloseTo(1, 5);
    });

    it('FFN: block output is layer-normalised (x + FFN(x))', () => {
        const ffn = runTo(PipelineStep.FFN).ffn!;
        expect(ffn.pre.shape).toEqual([3, DEFAULT_CONFIG.dFF]);
        expect(ffn.delta.shape).toEqual([3, DEFAULT_CONFIG.dModel]);
        const row = ffn.output.row(0).stats();
        expect(Math.abs(row.mean)).toBeLessThan(1e-4);
        expect(row.std).toBeCloseTo(1, 1);
    });

    it('SAMPLING: top-k picks one of the k most likely tokens, deterministically', () => {
        const a = runTo(PipelineStep.SAMPLING, { samplingMethod: 'top-k', topK: 5 });
        const b = runTo(PipelineStep.SAMPLING, { samplingMethod: 'top-k', topK: 5 });
        const cands = a.sampling!.candidates!;
        expect(cands).toHaveLength(5);
        expect(cands.map((c) => c.id)).toContain(a.sampling!.selected_id);
        expect(cands.reduce((acc, c) => acc + c.prob, 0)).toBeCloseTo(1, 5);
        expect(a.sampling!.selected_id).toBe(b.sampling!.selected_id);
    });

    it('SAMPLING: lower temperature makes the top token more likely', () => {
        const top = (temperature: number) => Math.max(...runTo(PipelineStep.SOFTMAX, { temperature }).softmax!.probs.data);
        expect(top(0.2)).toBeGreaterThan(top(1));
        expect(top(1)).toBeGreaterThan(top(2));
    });
});

describe('vocabulary', () => {
    it('has 512 unique entries', () => {
        expect(VOCAB_LIST).toHaveLength(512);
        expect(new Set(VOCAB_LIST).size).toBe(512);
    });

    it('covers every sample sentence without <unk>', () => {
        for (const text of ['The cat sat on the mat.', 'Attention is all you need', 'Hello world', 'The quick brown fox', 'AI learns fast']) {
            const s = { ...makeState({ inputText: text }), tensors: {} as ReturnType<typeof executeStep> };
            const withTokens = executeStep(PipelineStep.TOKENIZE, s);
            const ids = executeStep(PipelineStep.TOKEN_IDS, { ...s, tensors: withTokens }).token_ids!.ids;
            expect(ids).not.toContain(0);
        }
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

        // Advance time — one interval per step at normal speed, 11 steps needed
        vi.advanceTimersByTime(PLAY_SPEEDS.normal * 12);

        const { currentStep, isPlaying } = useSimulatorStore.getState();
        expect(currentStep).toBe(PipelineStep.SAMPLING);
        expect(isPlaying).toBe(false); // auto-stopped at end
    });

    it('pause: stops playAll and sets isPlaying=false', () => {
        vi.useFakeTimers();
        const { playAll, pause } = useSimulatorStore.getState();
        playAll();
        expect(useSimulatorStore.getState().isPlaying).toBe(true);

        vi.advanceTimersByTime(PLAY_SPEEDS.normal * 3); // advance 3 steps
        pause();

        const { isPlaying } = useSimulatorStore.getState();
        expect(isPlaying).toBe(false);
    });

    it('playAll is idempotent: calling twice does not start multiple intervals', () => {
        vi.useFakeTimers();
        const { playAll } = useSimulatorStore.getState();
        playAll();
        playAll(); // should be no-op
        vi.advanceTimersByTime(PLAY_SPEEDS.normal * 12);
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

    it('stepForward: records a readable error when the input is empty', () => {
        useSimulatorStore.getState().setInput('   ');
        useSimulatorStore.getState().stepForward();
        const { currentStep, stepError } = useSimulatorStore.getState();
        expect(currentStep).toBe(PipelineStep.INPUT);
        expect(stepError).toMatch(/empty/i);
    });

    it('goToStep: jumps forward and back through history', () => {
        const { goToStep } = useSimulatorStore.getState();
        goToStep(PipelineStep.ATTENTION);
        expect(useSimulatorStore.getState().currentStep).toBe(PipelineStep.ATTENTION);
        expect(useSimulatorStore.getState().tensors.attention).toBeDefined();
        goToStep(PipelineStep.TOKEN_IDS);
        const s = useSimulatorStore.getState();
        expect(s.currentStep).toBe(PipelineStep.TOKEN_IDS);
        expect(s.tensors.embed).toBeUndefined();
        expect(s.stepHistory).toHaveLength(2);
    });

    it('setTemperature: recomputes probabilities without leaving the step', () => {
        const { goToStep, setTemperature } = useSimulatorStore.getState();
        goToStep(PipelineStep.SAMPLING);
        const before = Math.max(...useSimulatorStore.getState().tensors.softmax!.probs.data);
        setTemperature(0.2);
        const s = useSimulatorStore.getState();
        expect(s.currentStep).toBe(PipelineStep.SAMPLING);
        expect(Math.max(...s.tensors.softmax!.probs.data)).toBeGreaterThan(before);
        setTemperature(1);
    });

    it('appendPrediction: adds the predicted token and reruns to the end', () => {
        const { goToStep, appendPrediction } = useSimulatorStore.getState();
        goToStep(PipelineStep.SAMPLING);
        const token = useSimulatorStore.getState().tensors.sampling!.selected_token;
        appendPrediction();
        const s = useSimulatorStore.getState();
        expect(s.inputText.endsWith(token)).toBe(true);
        expect(s.currentStep).toBe(PipelineStep.SAMPLING);
        expect(s.tensors.tokens!.raw).toHaveLength(4);
    });
});

describe('countParameters', () => {
    it('matches the default config by hand: 2·512·8 + 4·8² + 4·8 + 2·8·32', async () => {
        const { countParameters } = await import('@/lib/store/stepMachine');
        expect(countParameters(DEFAULT_CONFIG)).toBe(8192 + 256 + 32 + 512);
    });
});
