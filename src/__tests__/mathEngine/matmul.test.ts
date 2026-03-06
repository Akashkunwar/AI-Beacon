// src/__tests__/mathEngine/matmul.test.ts
// Unit tests for matmul, embeddingLookup, embeddingLookupWithWeights

import { describe, it, expect } from 'vitest';
import { matmul, embeddingLookup, embeddingLookupWithWeights } from '@/lib/mathEngine/matmul';
import { Tensor } from '@/lib/mathEngine/tensor';

const TOL = 1e-5;
const close = (a: number, b: number) => Math.abs(a - b) < TOL;

describe('matmul', () => {
    it('(2,3) × (3,4) → (2,4) with known result', () => {
        // A = [[1,0,0],[0,1,0]] (2×3)
        // B = [[1,2,3,4],[5,6,7,8],[9,10,11,12]] (3×4)
        // Row 0 of C = A[0] dot cols of B = [1,2,3,4]
        // Row 1 of C = A[1] dot cols of B = [5,6,7,8]
        const A = Tensor.fromArray([[1, 0, 0], [0, 1, 0]]);
        const B = Tensor.fromArray([
            [1, 2, 3, 4],
            [5, 6, 7, 8],
            [9, 10, 11, 12],
        ]);
        const C = matmul(A, B);
        expect(C.shape).toEqual([2, 4]);
        expect(close(C.get(0, 0), 1)).toBe(true);
        expect(close(C.get(0, 3), 4)).toBe(true);
        expect(close(C.get(1, 0), 5)).toBe(true);
        expect(close(C.get(1, 3), 8)).toBe(true);
    });

    it('identity matrix preserves the other matrix', () => {
        const I = Tensor.fromArray([[1, 0], [0, 1]]);
        const A = Tensor.fromArray([[3, 4], [5, 6]]);
        const C = matmul(I, A);
        expect(close(C.get(0, 0), 3)).toBe(true);
        expect(close(C.get(0, 1), 4)).toBe(true);
        expect(close(C.get(1, 0), 5)).toBe(true);
        expect(close(C.get(1, 1), 6)).toBe(true);
    });

    it('throws descriptive error on dimension mismatch', () => {
        const A = Tensor.zeros([2, 3]);
        const B = Tensor.zeros([4, 2]);
        expect(() => matmul(A, B)).toThrow(/mismatch/i);
    });
});

describe('embeddingLookup', () => {
    it('looks up rows from the embedding matrix correctly', () => {
        // 4 tokens, d_model=3
        const We = Tensor.fromArray([
            [0.1, 0.2, 0.3],  // token 0
            [0.4, 0.5, 0.6],  // token 1
            [0.7, 0.8, 0.9],  // token 2
            [1.0, 1.1, 1.2],  // token 3
        ]);
        const ids = [2, 0, 3, 1];
        const X = embeddingLookup(ids, We);
        expect(X.shape).toEqual([4, 3]);
        // Row 0 = token 2
        expect(close(X.get(0, 0), 0.7)).toBe(true);
        expect(close(X.get(0, 1), 0.8)).toBe(true);
        // Row 1 = token 0
        expect(close(X.get(1, 0), 0.1)).toBe(true);
        // Row 3 = token 1
        expect(close(X.get(3, 0), 0.4)).toBe(true);
    });

    it('throws for out-of-range token ID', () => {
        const We = Tensor.fromArray([[1, 2], [3, 4]]);
        expect(() => embeddingLookup([5], We)).toThrow();
    });
});

describe('embeddingLookupWithWeights', () => {
    it('returns correct shapes', () => {
        const result = embeddingLookupWithWeights([0, 1, 2], 8, 42);
        expect(result.We.shape).toEqual([512, 8]);
        expect(result.X.shape).toEqual([3, 8]);
    });

    it('is deterministic for same seed', () => {
        const r1 = embeddingLookupWithWeights([0, 1], 8, 99);
        const r2 = embeddingLookupWithWeights([0, 1], 8, 99);
        expect(r1.X.get(0, 0)).toBe(r2.X.get(0, 0));
    });
});
