// src/__tests__/mathEngine/softmax.test.ts
// Unit tests for softmax functions

import { describe, it, expect } from 'vitest';
import { softmax, softmaxTensor, logSoftmax } from '@/lib/mathEngine/softmax';
import { Tensor } from '@/lib/mathEngine/tensor';

const TOL = 1e-5;
const close = (a: number, b: number, tol = TOL) => Math.abs(a - b) < tol;

describe('softmax', () => {
    it('output sums to 1.0', () => {
        const probs = softmax([1, 2, 3, 4]);
        const sum = probs.reduce((a, b) => a + b, 0);
        expect(close(sum, 1.0)).toBe(true);
    });

    it('all values are in (0, 1)', () => {
        const probs = softmax([1, 2, 3, 4]);
        for (const p of probs) {
            expect(p).toBeGreaterThan(0);
            expect(p).toBeLessThan(1);
        }
    });

    it('largest logit gets highest probability', () => {
        const probs = softmax([1, 2, 10, 3]);
        const maxIdx = probs.indexOf(Math.max(...probs));
        expect(maxIdx).toBe(2);
    });

    it('is numerically stable with large values (logsumexp trick)', () => {
        const probs = softmax([1000, 1001, 1002]);
        const sum = probs.reduce((a, b) => a + b, 0);
        expect(close(sum, 1.0)).toBe(true);
        expect(isNaN(probs[0])).toBe(false);
    });

    it('handles uniform logits (all equal probabilities)', () => {
        const probs = softmax([5, 5, 5, 5]);
        for (const p of probs) {
            expect(close(p, 0.25)).toBe(true);
        }
    });

    it('temperature < 1 makes distribution sharper', () => {
        const logits = [1, 2, 3];
        const sharp = softmax(logits, 0.1);
        const normal = softmax(logits, 1.0);
        expect(Math.max(...sharp)).toBeGreaterThan(Math.max(...normal));
        // Still sums to 1
        expect(close(sharp.reduce((a, b) => a + b, 0), 1.0)).toBe(true);
    });

    it('temperature > 1 makes distribution flatter', () => {
        const logits = [1, 2, 3];
        const flat = softmax(logits, 10.0);
        const normal = softmax(logits, 1.0);
        expect(Math.max(...flat)).toBeLessThan(Math.max(...normal));
        expect(close(flat.reduce((a, b) => a + b, 0), 1.0)).toBe(true);
    });

    it('single element returns [1.0]', () => {
        const probs = softmax([42]);
        expect(close(probs[0], 1.0)).toBe(true);
    });

    // Golden value test (matches Python: scipy.special.softmax([1.0, 2.0, 3.0]))
    it('matches PyTorch golden values for [1.0, 2.0, 3.0] at temp=1', () => {
        const probs = softmax([1.0, 2.0, 3.0]);
        // scipy: [0.09003057, 0.24472847, 0.66524096]
        expect(close(probs[0], 0.09003057, 1e-5)).toBe(true);
        expect(close(probs[1], 0.24472847, 1e-5)).toBe(true);
        expect(close(probs[2], 0.66524096, 1e-5)).toBe(true);
    });
});

describe('softmaxTensor', () => {
    it('row-wise softmax: each row sums to 1', () => {
        const t = Tensor.fromArray([[2, 1, 0.1], [1, 3, 5]]);
        const s = softmaxTensor(t, 1);
        for (let r = 0; r < 2; r++) {
            const rowSum = s.get(r, 0) + s.get(r, 1) + s.get(r, 2);
            expect(close(rowSum, 1.0)).toBe(true);
        }
    });
});

describe('logSoftmax', () => {
    it('exp(logSoftmax) equals softmax', () => {
        const logits = [1, 2, 3];
        const logProbs = logSoftmax(logits);
        const probs = softmax(logits);
        for (let i = 0; i < logits.length; i++) {
            expect(close(Math.exp(logProbs[i]), probs[i])).toBe(true);
        }
    });
});
