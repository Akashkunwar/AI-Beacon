// src/__tests__/mathEngine/tensor.test.ts
// Unit tests for the Tensor class

import { describe, it, expect } from 'vitest';
import { Tensor, LCG, softmax1D } from '@/lib/mathEngine/tensor';

const TOL = 1e-5;
const close = (a: number, b: number, tol = TOL) => Math.abs(a - b) < tol;

// ── LCG PRNG ─────────────────────────────────────────────────────────────────

describe('LCG PRNG', () => {
    it('produces values in [0, 1)', () => {
        const rng = new LCG(42);
        for (let i = 0; i < 100; i++) {
            const v = rng.next();
            expect(v).toBeGreaterThanOrEqual(0);
            expect(v).toBeLessThan(1);
        }
    });

    it('is deterministic for the same seed', () => {
        const rng1 = new LCG(99);
        const rng2 = new LCG(99);
        for (let i = 0; i < 20; i++) {
            expect(rng1.next()).toBe(rng2.next());
        }
    });

    it('produces different sequences for different seeds', () => {
        const rng1 = new LCG(1);
        const rng2 = new LCG(2);
        const first1 = rng1.next();
        const first2 = rng2.next();
        expect(first1).not.toBe(first2);
    });
});

// ── Tensor factories ─────────────────────────────────────────────────────────

describe('Tensor.zeros', () => {
    it('creates a tensor of zeros with correct shape', () => {
        const t = Tensor.zeros([3, 4]);
        expect(t.shape).toEqual([3, 4]);
        expect(t.data.length).toBe(12);
        for (let i = 0; i < 12; i++) expect(t.data[i]).toBe(0);
    });

    it('stores label correctly', () => {
        const t = Tensor.zeros([2, 2], 'myLabel');
        expect(t.label).toBe('myLabel');
    });
});

describe('Tensor.ones', () => {
    it('creates a tensor of ones with correct shape', () => {
        const t = Tensor.ones([2, 3]);
        expect(t.shape).toEqual([2, 3]);
        for (let i = 0; i < 6; i++) expect(t.data[i]).toBe(1);
    });
});

describe('Tensor.randn', () => {
    it('is deterministic for the same seed', () => {
        const t1 = Tensor.randn([4, 4], 42);
        const t2 = Tensor.randn([4, 4], 42);
        for (let i = 0; i < t1.data.length; i++) {
            expect(t1.data[i]).toBe(t2.data[i]);
        }
    });

    it('has correct shape', () => {
        const t = Tensor.randn([3, 5], 7);
        expect(t.shape).toEqual([3, 5]);
        expect(t.data.length).toBe(15);
    });

    it('has roughly zero mean over many samples', () => {
        const t = Tensor.randn([100, 100], 1);
        const { mean } = t.stats();
        expect(Math.abs(mean)).toBeLessThan(0.1);
    });
});

describe('Tensor.fromArray', () => {
    it('builds a 2D tensor correctly', () => {
        const t = Tensor.fromArray([[1, 2, 3], [4, 5, 6]]);
        expect(t.shape).toEqual([2, 3]);
        expect(t.get(0, 0)).toBe(1);
        expect(t.get(0, 2)).toBe(3);
        expect(t.get(1, 0)).toBe(4);
        expect(t.get(1, 2)).toBe(6);
    });
});

describe('Tensor.from1D', () => {
    it('builds a 1D tensor', () => {
        const t = Tensor.from1D([1, 2, 3, 4]);
        expect(t.shape).toEqual([4]);
        expect(t.get1D(2)).toBe(3);
    });
});

// ── Shape mismatch in constructor ─────────────────────────────────────────────

describe('Tensor constructor', () => {
    it('throws on shape/data mismatch', () => {
        expect(() => new Tensor(new Float32Array(6), [2, 4])).toThrow();
    });

    it('stores a unique id', () => {
        const t1 = Tensor.zeros([2, 2]);
        const t2 = Tensor.zeros([2, 2]);
        expect(t1.id).not.toBe(t2.id);
    });
});

// ── toMatrix and toArray ──────────────────────────────────────────────────────

describe('toMatrix', () => {
    it('converts 2D tensor to nested array', () => {
        const t = Tensor.fromArray([[1, 2], [3, 4]]);
        const m = t.toMatrix();
        expect(m).toEqual([[1, 2], [3, 4]]);
    });

    it('throws for non-2D tensor', () => {
        const t = Tensor.from1D([1, 2, 3]);
        expect(() => t.toMatrix()).toThrow();
    });
});

describe('shapeStr', () => {
    it('formats shape as string', () => {
        expect(Tensor.zeros([4, 8]).shapeStr()).toBe('(4, 8)');
        expect(Tensor.zeros([16]).shapeStr()).toBe('(16)');
    });
});

// ── matmul ────────────────────────────────────────────────────────────────────

describe('Tensor.matmul', () => {
    it('(2,3) × (3,4) → (2,4)', () => {
        // A = [[1,2,3],[4,5,6]] (2×3)
        // B = [[7,8],[9,10],[11,12]] col-major reading but we specify row-major
        // B (3×2) — but we want (3×4) so let's use simple known values:
        // A (2×3), B (3×4) where B is all ones → each output row = sum of A row
        const A = Tensor.fromArray([
            [1, 2, 3],
            [4, 5, 6]
        ]);
        const B = Tensor.fromArray([
            [1, 0, 0, 1],
            [0, 1, 0, 1],
            [0, 0, 1, 1],
        ]); // (3, 4)

        const C = A.matmul(B);
        expect(C.shape).toEqual([2, 4]);
        // Row 0: [1,2,3] × columns = [1,2,3,1+2+3] = [1,2,3,6]
        expect(close(C.get(0, 0), 1)).toBe(true);
        expect(close(C.get(0, 1), 2)).toBe(true);
        expect(close(C.get(0, 2), 3)).toBe(true);
        expect(close(C.get(0, 3), 6)).toBe(true);
        // Row 1: [4,5,6] × columns = [4,5,6,4+5+6] = [4,5,6,15]
        expect(close(C.get(1, 0), 4)).toBe(true);
        expect(close(C.get(1, 1), 5)).toBe(true);
        expect(close(C.get(1, 2), 6)).toBe(true);
        expect(close(C.get(1, 3), 15)).toBe(true);
    });

    it('throws on dimension mismatch', () => {
        const A = Tensor.zeros([2, 3]);
        const B = Tensor.zeros([4, 5]); // inner dims 3 ≠ 4
        expect(() => A.matmul(B)).toThrow(/mismatch/i);
    });

    it('throws on non-2D input', () => {
        const A = Tensor.from1D([1, 2, 3]);
        const B = Tensor.zeros([3, 2]);
        expect(() => A.matmul(B)).toThrow();
    });

    it('(1,1) × (1,1) identity', () => {
        const A = Tensor.fromArray([[3]]);
        const B = Tensor.fromArray([[2]]);
        const C = A.matmul(B);
        expect(C.get(0, 0)).toBeCloseTo(6, 5);
    });
});

// ── scale ─────────────────────────────────────────────────────────────────────

describe('Tensor.scale', () => {
    it('multiplies all elements by scalar', () => {
        const t = Tensor.fromArray([[1, 2], [3, 4]]);
        const s = t.scale(2);
        expect(s.get(0, 0)).toBe(2);
        expect(s.get(0, 1)).toBe(4);
        expect(s.get(1, 0)).toBe(6);
        expect(s.get(1, 1)).toBe(8);
    });

    it('does not mutate original tensor', () => {
        const t = Tensor.fromArray([[1, 2]]);
        t.scale(10);
        expect(t.get(0, 0)).toBe(1);
    });
});

// ── add ───────────────────────────────────────────────────────────────────────

describe('Tensor.add', () => {
    it('element-wise addition of same-shape tensors', () => {
        const A = Tensor.fromArray([[1, 2], [3, 4]]);
        const B = Tensor.fromArray([[5, 6], [7, 8]]);
        const C = A.add(B);
        expect(C.get(0, 0)).toBe(6);
        expect(C.get(0, 1)).toBe(8);
        expect(C.get(1, 0)).toBe(10);
        expect(C.get(1, 1)).toBe(12);
    });

    it('1D add works', () => {
        const a = Tensor.from1D([1, 2, 3]);
        const b = Tensor.from1D([4, 5, 6]);
        const c = a.add(b);
        expect(c.toArray()).toEqual([5, 7, 9]);
    });

    it('does not mutate inputs', () => {
        const A = Tensor.fromArray([[1, 2]]);
        const B = Tensor.fromArray([[3, 4]]);
        A.add(B);
        expect(A.get(0, 0)).toBe(1);
    });
});

// ── transpose ─────────────────────────────────────────────────────────────────

describe('Tensor.transpose', () => {
    it('transposes a 2D matrix', () => {
        const A = Tensor.fromArray([[1, 2, 3], [4, 5, 6]]); // (2, 3)
        const AT = A.transpose(0, 1); // (3, 2)
        expect(AT.shape).toEqual([3, 2]);
        expect(AT.get(0, 0)).toBe(1);
        expect(AT.get(0, 1)).toBe(4);
        expect(AT.get(1, 0)).toBe(2);
        expect(AT.get(1, 1)).toBe(5);
        expect(AT.get(2, 0)).toBe(3);
        expect(AT.get(2, 1)).toBe(6);
    });

    it('double transpose returns original values', () => {
        const A = Tensor.fromArray([[1, 2, 3], [4, 5, 6]]);
        const ATT = A.transpose(0, 1).transpose(0, 1);
        expect(ATT.shape).toEqual([2, 3]);
        expect(ATT.get(0, 0)).toBe(1);
        expect(ATT.get(1, 2)).toBe(6);
    });
});

// ── reshape ───────────────────────────────────────────────────────────────────

describe('Tensor.reshape', () => {
    it('reshapes to compatible shape', () => {
        const t = Tensor.fromArray([[1, 2, 3], [4, 5, 6]]); // (2,3)
        const r = t.reshape([3, 2]);
        expect(r.shape).toEqual([3, 2]);
        expect(r.data.length).toBe(6);
    });

    it('throws on incompatible reshape', () => {
        const t = Tensor.zeros([2, 3]);
        expect(() => t.reshape([2, 4])).toThrow();
    });
});

// ── row ───────────────────────────────────────────────────────────────────────

describe('Tensor.row', () => {
    it('slices the correct row as 1D tensor', () => {
        const t = Tensor.fromArray([[1, 2, 3], [4, 5, 6]]);
        const r = t.row(1);
        expect(r.shape).toEqual([3]);
        expect(r.toArray()).toEqual([4, 5, 6]);
    });

    it('throws on out-of-bounds row', () => {
        const t = Tensor.fromArray([[1, 2]]);
        expect(() => t.row(5)).toThrow();
    });
});

// ── softmax1D helper ──────────────────────────────────────────────────────────

describe('softmax1D', () => {
    it('sums to 1', () => {
        const probs = softmax1D([1, 2, 3, 4]);
        const sum = probs.reduce((a, b) => a + b, 0);
        expect(close(sum, 1.0)).toBe(true);
    });

    it('all values are positive', () => {
        const probs = softmax1D([-100, 0, 100]);
        expect(probs.every(p => p > 0)).toBe(true);
    });

    it('is numerically stable with large values', () => {
        const probs = softmax1D([1000, 1001, 1002]);
        const sum = probs.reduce((a, b) => a + b, 0);
        expect(close(sum, 1.0)).toBe(true);
    });

    it('temperature=0.1 makes distribution sharper', () => {
        const logits = [1, 2, 3];
        const sharp = softmax1D(logits, 0.1);
        const flat = softmax1D(logits, 10);
        // sharp max should be higher than flat max
        expect(Math.max(...sharp)).toBeGreaterThan(Math.max(...flat));
    });
});

// ── Tensor.softmax ────────────────────────────────────────────────────────────

describe('Tensor.softmax', () => {
    it('row-wise softmax: each row sums to 1', () => {
        const t = Tensor.fromArray([[1, 2, 3], [4, 5, 6]]);
        const s = t.softmax(1);
        expect(s.shape).toEqual([2, 3]);
        // Row 0
        const row0Sum = s.get(0, 0) + s.get(0, 1) + s.get(0, 2);
        expect(close(row0Sum, 1.0)).toBe(true);
        // Row 1
        const row1Sum = s.get(1, 0) + s.get(1, 1) + s.get(1, 2);
        expect(close(row1Sum, 1.0)).toBe(true);
    });
});

// ── layerNorm ─────────────────────────────────────────────────────────────────

describe('Tensor.layerNorm', () => {
    it('output has mean ≈ 0 per row', () => {
        const t = Tensor.fromArray([[1, 2, 3, 4], [10, 20, 30, 40]]);
        const norm = t.layerNorm();
        for (let r = 0; r < 2; r++) {
            const row = [norm.get(r, 0), norm.get(r, 1), norm.get(r, 2), norm.get(r, 3)];
            const mean = row.reduce((a, b) => a + b, 0) / row.length;
            expect(Math.abs(mean)).toBeLessThan(1e-4);
        }
    });

    it('output has variance ≈ 1 per row (with default γ=1, β=0)', () => {
        const t = Tensor.fromArray([[1, 2, 3, 4], [10, 20, 30, 40]]);
        const norm = t.layerNorm();
        for (let r = 0; r < 2; r++) {
            const row = [norm.get(r, 0), norm.get(r, 1), norm.get(r, 2), norm.get(r, 3)];
            const mean = row.reduce((a, b) => a + b, 0) / row.length;
            const variance = row.reduce((acc, v) => acc + (v - mean) ** 2, 0) / row.length;
            expect(close(variance, 1.0, 0.01)).toBe(true);
        }
    });

    it('does not mutate original tensor', () => {
        const t = Tensor.fromArray([[4, 5, 6, 7]]);
        t.layerNorm();
        expect(t.get(0, 0)).toBe(4);
    });
});

// ── argmax ────────────────────────────────────────────────────────────────────

describe('Tensor.argmax', () => {
    it('returns index of max value', () => {
        const t = Tensor.from1D([0.1, 0.5, 0.3, 0.9, 0.2]);
        expect(t.argmax()).toBe(3);
    });
});

// ── stats ─────────────────────────────────────────────────────────────────────

describe('Tensor.stats', () => {
    it('computes correct mean and min/max', () => {
        const t = Tensor.fromArray([[1, 2], [3, 4]]);
        const s = t.stats();
        expect(close(s.mean, 2.5)).toBe(true);
        expect(s.min).toBe(1);
        expect(s.max).toBe(4);
    });
});
