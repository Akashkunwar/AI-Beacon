// src/__tests__/mathEngine/normalization.test.ts
// Unit tests for layerNorm and GELU activation

import { describe, it, expect } from 'vitest';
import { layerNorm, initLayerNormParams } from '@/lib/mathEngine/normalization';
import { gelu, geluScalar, relu } from '@/lib/mathEngine/activations';
import { Tensor } from '@/lib/mathEngine/tensor';

const TOL = 1e-4;
const close = (a: number, b: number, tol = TOL) => Math.abs(a - b) < tol;

// ── LayerNorm ─────────────────────────────────────────────────────────────────

describe('layerNorm', () => {
    it('output has mean ≈ 0 per row', () => {
        const x = Tensor.fromArray([
            [1, 2, 3, 4, 5, 6, 7, 8],
            [10, 20, 30, 40, 50, 60, 70, 80],
        ]);
        const out = layerNorm(x);
        for (let r = 0; r < 2; r++) {
            let mean = 0;
            for (let c = 0; c < 8; c++) mean += out.get(r, c);
            mean /= 8;
            expect(Math.abs(mean)).toBeLessThan(1e-4);
        }
    });

    it('output has variance ≈ 1 per row (default γ=1, β=0)', () => {
        const x = Tensor.fromArray([
            [1, 2, 3, 4],
            [100, 200, 300, 400],
        ]);
        const out = layerNorm(x);
        for (let r = 0; r < 2; r++) {
            const rows = [out.get(r, 0), out.get(r, 1), out.get(r, 2), out.get(r, 3)];
            const mean = rows.reduce((a, b) => a + b, 0) / 4;
            const variance = rows.reduce((acc, v) => acc + (v - mean) ** 2, 0) / 4;
            expect(close(variance, 1.0, 0.01)).toBe(true);
        }
    });

    it('returns new tensor, does not mutate input', () => {
        const x = Tensor.fromArray([[1, 2, 3, 4]]);
        layerNorm(x);
        expect(x.get(0, 0)).toBe(1);
    });

    it('with gamma=2, output variance scales accordingly', () => {
        const x = Tensor.fromArray([[1, 2, 3, 4]]);
        const { gamma, beta } = initLayerNormParams(4);
        const gamma2 = gamma.scale(2); // γ = 2 everywhere
        const out = layerNorm(x, 1e-5, gamma2, beta);
        // mean should still be ≈ 0
        const mean = (out.get(0, 0) + out.get(0, 1) + out.get(0, 2) + out.get(0, 3)) / 4;
        expect(Math.abs(mean)).toBeLessThan(1e-4);
        // variance should be ≈ 4 (scaled by γ²=4)
        const rows = [out.get(0, 0), out.get(0, 1), out.get(0, 2), out.get(0, 3)];
        const variance = rows.reduce((acc, v) => acc + (v - mean) ** 2, 0) / 4;
        expect(close(variance, 4.0, 0.01)).toBe(true);
    });

    it('throws for non-2D input', () => {
        const x = Tensor.from1D([1, 2, 3]);
        expect(() => layerNorm(x)).toThrow();
    });

    it('handles identical-value rows gracefully (no NaN)', () => {
        const x = Tensor.fromArray([[5, 5, 5, 5]]);
        const out = layerNorm(x);
        for (let c = 0; c < 4; c++) {
            expect(isNaN(out.get(0, c))).toBe(false);
        }
    });
});

describe('initLayerNormParams', () => {
    it('returns gamma=ones and beta=zeros', () => {
        const { gamma, beta } = initLayerNormParams(8);
        expect(gamma.shape).toEqual([8]);
        expect(beta.shape).toEqual([8]);
        for (let i = 0; i < 8; i++) {
            expect(gamma.data[i]).toBe(1);
            expect(beta.data[i]).toBe(0);
        }
    });
});

// ── GELU ─────────────────────────────────────────────────────────────────────

describe('GELU', () => {
    it('geluScalar(0) ≈ 0', () => {
        expect(Math.abs(geluScalar(0))).toBeLessThan(1e-6);
    });

    it('geluScalar(1) ≈ 0.8413', () => {
        // Golden: PyTorch gelu(1.0) ≈ 0.8413
        expect(close(geluScalar(1.0), 0.8413, 5e-4)).toBe(true);
    });

    it('geluScalar(-1) ≈ -0.1587', () => {
        // Golden: PyTorch gelu(-1.0) ≈ -0.1587
        expect(close(geluScalar(-1.0), -0.1587, 5e-4)).toBe(true);
    });

    it('GELU(x) > 0 for positive x', () => {
        for (const x of [0.5, 1, 2, 5]) {
            expect(geluScalar(x)).toBeGreaterThan(0);
        }
    });

    it('GELU(x) < 0 for small negative x', () => {
        expect(geluScalar(-0.5)).toBeLessThan(0);
    });

    it('gelu tensor preserves shape', () => {
        const x = Tensor.fromArray([[1, -1, 0.5, -0.5]]);
        const out = gelu(x);
        expect(out.shape).toEqual([1, 4]);
    });

    it('gelu tensor does not mutate input', () => {
        const x = Tensor.fromArray([[1, 2]]);
        gelu(x);
        expect(x.get(0, 0)).toBe(1);
    });

    it('gelu matches formula: 0.5·x·(1 + tanh(√(2/π)·(x + 0.044715x³)))', () => {
        const x = 0.7;
        const K = Math.sqrt(2 / Math.PI);
        const expected = 0.5 * x * (1 + Math.tanh(K * (x + 0.044715 * x * x * x)));
        expect(close(geluScalar(x), expected)).toBe(true);
    });
});

// ── ReLU ─────────────────────────────────────────────────────────────────────

describe('relu', () => {
    it('passes positive values unchanged', () => {
        const x = Tensor.fromArray([[1, 2, 3]]);
        const out = relu(x);
        expect(out.toArray()).toEqual([1, 2, 3]);
    });

    it('zeros out negative values', () => {
        const x = Tensor.fromArray([[-1, 0, 2, -5]]);
        const out = relu(x);
        expect(out.get(0, 0)).toBe(0);
        expect(out.get(0, 1)).toBe(0);
        expect(out.get(0, 2)).toBe(2);
        expect(out.get(0, 3)).toBe(0);
    });
});
