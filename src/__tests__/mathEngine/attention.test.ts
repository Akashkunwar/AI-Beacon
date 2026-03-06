// src/__tests__/mathEngine/attention.test.ts
// Unit tests for attention, positional encoding, sampling, and tokenizer

import { describe, it, expect } from 'vitest';
import { scaledDotProductAttention, causalMask, qkvProjections } from '@/lib/mathEngine/attention';
import { sinusoidalPE, applyPositionalEncoding } from '@/lib/mathEngine/positional';
import { greedySample, greedySampleLogits, topK } from '@/lib/mathEngine/sampling';
import { wordSplit } from '@/lib/tokenizer/wordSplit';
import { tokenToId, idToToken, tokensToIds, idsToTokens, VOCAB_SIZE } from '@/lib/tokenizer/vocab';
import { Tensor } from '@/lib/mathEngine/tensor';

const TOL = 1e-5;
const close = (a: number, b: number, tol = TOL) => Math.abs(a - b) < tol;

// ── Scaled Dot-Product Attention ──────────────────────────────────────────────

describe('scaledDotProductAttention', () => {
    it('output has correct shapes', () => {
        const n = 4, dk = 8, dv = 8;
        const Q = Tensor.randn([n, dk], 1);
        const K = Tensor.randn([n, dk], 2);
        const V = Tensor.randn([n, dv], 3);
        const { scores, weights, output } = scaledDotProductAttention(Q, K, V);
        expect(scores.shape).toEqual([n, n]);
        expect(weights.shape).toEqual([n, n]);
        expect(output.shape).toEqual([n, dv]);
    });

    it('attention weights sum to 1 per row (no mask)', () => {
        const n = 3, dk = 4;
        const Q = Tensor.randn([n, dk], 10);
        const K = Tensor.randn([n, dk], 11);
        const V = Tensor.randn([n, dk], 12);
        const { weights } = scaledDotProductAttention(Q, K, V);
        for (let r = 0; r < n; r++) {
            let rowSum = 0;
            for (let c = 0; c < n; c++) rowSum += weights.get(r, c);
            expect(close(rowSum, 1.0, 1e-4)).toBe(true);
        }
    });

    it('causal mask: upper triangle is ≈ 0 after softmax', () => {
        const n = 4, dk = 8;
        const Q = Tensor.randn([n, dk], 5);
        const K = Tensor.randn([n, dk], 6);
        const V = Tensor.randn([n, dk], 7);
        const mask = causalMask(n);
        const { weights } = scaledDotProductAttention(Q, K, V, mask);
        // weights[i,j] should be ≈ 0 for j > i
        for (let i = 0; i < n; i++) {
            for (let j = i + 1; j < n; j++) {
                expect(weights.get(i, j)).toBeLessThan(1e-3);
            }
        }
    });

    it('attention weights still sum to 1 with causal mask', () => {
        const n = 4, dk = 8;
        const Q = Tensor.randn([n, dk], 20);
        const K = Tensor.randn([n, dk], 21);
        const V = Tensor.randn([n, dk], 22);
        const mask = causalMask(n);
        const { weights } = scaledDotProductAttention(Q, K, V, mask);
        for (let r = 0; r < n; r++) {
            let rowSum = 0;
            for (let c = 0; c < n; c++) rowSum += weights.get(r, c);
            expect(close(rowSum, 1.0, 1e-4)).toBe(true);
        }
    });

    it('throws on non-2D input', () => {
        const Q = Tensor.from1D([1, 2, 3]);
        const K = Tensor.from1D([1, 2, 3]);
        const V = Tensor.from1D([1, 2, 3]);
        expect(() => scaledDotProductAttention(Q, K, V)).toThrow();
    });
});

describe('causalMask', () => {
    it('has correct shape', () => {
        const mask = causalMask(4);
        expect(mask.shape).toEqual([4, 4]);
    });

    it('upper triangle is 1, lower triangle and diagonal are 0', () => {
        const mask = causalMask(4);
        // diagonal (i, i) → 0
        for (let i = 0; i < 4; i++) {
            expect(mask.get(i, i)).toBe(0);
        }
        // upper triangle (j > i) → 1
        expect(mask.get(0, 1)).toBe(1);
        expect(mask.get(0, 3)).toBe(1);
        // lower triangle (j < i) → 0
        expect(mask.get(1, 0)).toBe(0);
        expect(mask.get(3, 2)).toBe(0);
    });
});

describe('qkvProjections', () => {
    it('produces correct shapes', () => {
        const n = 3, dModel = 8, dK = 4;
        const X = Tensor.randn([n, dModel], 1);
        const WQ = Tensor.randn([dModel, dK], 2);
        const WK = Tensor.randn([dModel, dK], 3);
        const WV = Tensor.randn([dModel, dK], 4);
        const { Q, K, V } = qkvProjections(X, WQ, WK, WV);
        expect(Q.shape).toEqual([n, dK]);
        expect(K.shape).toEqual([n, dK]);
        expect(V.shape).toEqual([n, dK]);
    });
});

// ── Sinusoidal Positional Encoding ────────────────────────────────────────────

describe('sinusoidalPE', () => {
    it('has correct shape', () => {
        const pe = sinusoidalPE(5, 8);
        expect(pe.shape).toEqual([5, 8]);
    });

    it('position 0 has sin(0)=0 at even dims and cos(0)=1 at odd dims', () => {
        const pe = sinusoidalPE(3, 8);
        // PE(0, 0) = sin(0 / 10000^0) = sin(0) = 0
        expect(close(pe.get(0, 0), 0)).toBe(true);
        // PE(0, 1) = cos(0 / 10000^0) = cos(0) = 1
        expect(close(pe.get(0, 1), 1)).toBe(true);
        // PE(0, 2) = sin(0 / 10000^(2/8)) = sin(0) = 0
        expect(close(pe.get(0, 2), 0)).toBe(true);
    });

    it('values are bounded in [-1, 1]', () => {
        const pe = sinusoidalPE(12, 16);
        const { min, max } = pe.stats();
        expect(min).toBeGreaterThanOrEqual(-1 - 1e-6);
        expect(max).toBeLessThanOrEqual(1 + 1e-6);
    });

    it('is deterministic (no randomness)', () => {
        const pe1 = sinusoidalPE(4, 8);
        const pe2 = sinusoidalPE(4, 8);
        for (let i = 0; i < pe1.data.length; i++) {
            expect(pe1.data[i]).toBe(pe2.data[i]);
        }
    });

    it('odd dims are cosines (not sines)', () => {
        const pe = sinusoidalPE(3, 4);
        // PE(pos=1, dim=1) = cos(1 / 10000^0) = cos(1) ≈ 0.5403
        expect(close(pe.get(1, 1), Math.cos(1), 1e-4)).toBe(true);
        // PE(pos=1, dim=0) = sin(1 / 10000^0) = sin(1) ≈ 0.8415
        expect(close(pe.get(1, 0), Math.sin(1), 1e-4)).toBe(true);
    });

    it('applyPositionalEncoding: X_pos = X_embed + PE', () => {
        const nTokens = 3, dModel = 4;
        const X = Tensor.zeros([nTokens, dModel]);
        const { PE, X_pos } = applyPositionalEncoding(X, dModel);
        expect(PE.shape).toEqual([nTokens, dModel]);
        expect(X_pos.shape).toEqual([nTokens, dModel]);
        // X is zeros, so X_pos should equal PE
        for (let i = 0; i < nTokens; i++) {
            for (let j = 0; j < dModel; j++) {
                expect(close(X_pos.get(i, j), PE.get(i, j))).toBe(true);
            }
        }
    });
});

// ── Greedy Sampling ───────────────────────────────────────────────────────────

describe('greedySample', () => {
    it('selects the highest probability token', () => {
        const probs = Tensor.from1D([0.1, 0.05, 0.6, 0.25]);
        expect(greedySample(probs)).toBe(2);
    });

    it('throws for non-1D tensor', () => {
        const t = Tensor.fromArray([[0.5, 0.5]]);
        expect(() => greedySample(t)).toThrow();
    });
});

describe('greedySampleLogits', () => {
    it('returns argmax of logits', () => {
        const logits = Tensor.from1D([1.0, 5.0, 3.0, 2.0]);
        expect(greedySampleLogits(logits)).toBe(1);
    });
});

describe('topK', () => {
    it('returns top k tokens sorted by probability', () => {
        const probs = Tensor.from1D([0.1, 0.5, 0.3, 0.08, 0.02]);
        const top = topK(probs, 3);
        expect(top.length).toBe(3);
        expect(top[0].id).toBe(1); // highest prob = 0.5
        expect(top[1].id).toBe(2); // second = 0.3
        expect(top[2].id).toBe(0); // third = 0.1
        // Sorted descending
        for (let i = 0; i < top.length - 1; i++) {
            expect(top[i].prob).toBeGreaterThanOrEqual(top[i + 1].prob);
        }
    });
});

// ── Tokenizer ────────────────────────────────────────────────────────────────

describe('wordSplit tokenizer', () => {
    it('splits on whitespace', () => {
        expect(wordSplit('The cat sat')).toEqual(['the', 'cat', 'sat']);
    });

    it('handles multiple spaces', () => {
        expect(wordSplit('hello   world')).toEqual(['hello', 'world']);
    });

    it('lowercases tokens', () => {
        expect(wordSplit('Hello World')).toEqual(['hello', 'world']);
    });

    it('trims leading and trailing whitespace', () => {
        expect(wordSplit('  hello  ')).toEqual(['hello']);
    });

    it('returns empty array for blank input', () => {
        expect(wordSplit('')).toEqual([]);
        expect(wordSplit('   ')).toEqual([]);
    });

    it('handles single word', () => {
        expect(wordSplit('transformer')).toEqual(['transformer']);
    });
});

describe('vocabulary', () => {
    it('VOCAB_SIZE is 512', () => {
        expect(VOCAB_SIZE).toBe(512);
    });

    it('tokenToId returns 0 for unknown tokens', () => {
        expect(tokenToId('xyzzy_not_in_vocab')).toBe(0);
    });

    it('tokenToId finds known tokens', () => {
        // 'the' is token 1 in our vocab
        expect(tokenToId('the')).toBeGreaterThan(0);
    });

    it('idToToken round-trips with tokenToId', () => {
        const token = 'the';
        const id = tokenToId(token);
        expect(idToToken(id)).toBe(token);
    });

    it('idToToken returns <unk> for out-of-range id', () => {
        expect(idToToken(-1)).toBe('<unk>');
        expect(idToToken(9999)).toBe('<unk>');
    });

    it('tokensToIds converts array of tokens', () => {
        const tokens = ['the', 'cat', 'sat'];
        const ids = tokensToIds(tokens);
        expect(ids.length).toBe(3);
        expect(ids.every(id => id >= 0)).toBe(true);
    });

    it('idsToTokens converts array of ids', () => {
        const ids = [1, 2, 3];
        const tokens = idsToTokens(ids);
        expect(tokens.length).toBe(3);
        expect(tokens.every(t => typeof t === 'string')).toBe(true);
    });
});
