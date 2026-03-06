// src/lib/mathEngine/tensor.ts
// Core Tensor class — all operations return NEW Tensor instances (immutable)

/**
 * LCG (Linear Congruential Generator) PRNG.
 * Deterministic, seeded random number generator.
 * Returns values in [0, 1).
 */
export class LCG {
    private state: number;

    constructor(seed: number) {
        this.state = seed >>> 0; // ensure 32-bit unsigned
    }

    /** Returns a float in [0, 1) */
    next(): number {
        // LCG parameters from Numerical Recipes
        this.state = ((1664525 * this.state + 1013904223) & 0xffffffff) >>> 0;
        return this.state / 0x100000000;
    }

    /** Returns a standard-normal sample via Box-Muller transform */
    randn(): number {
        const u1 = Math.max(this.next(), 1e-10);
        const u2 = this.next();
        return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    }
}

// ── Tensor class ──────────────────────────────────────────────────────────────

export class Tensor {
    readonly id: string;
    readonly label: string;
    readonly shape: readonly number[];
    readonly data: Float32Array;

    constructor(data: Float32Array, shape: number[], label: string = '') {
        if (data.length !== shape.reduce((a, b) => a * b, 1)) {
            throw new Error(
                `Tensor shape mismatch: data has ${data.length} elements but shape ${JSON.stringify(shape)} requires ${shape.reduce((a, b) => a * b, 1)}`
            );
        }
        this.id = crypto.randomUUID();
        this.data = data;
        this.shape = Object.freeze([...shape]);
        this.label = label;
    }

    // ── Factory methods ──────────────────────────────────────────────────────

    /** Create a tensor filled with zeros */
    static zeros(shape: number[], label?: string): Tensor {
        const size = shape.reduce((a, b) => a * b, 1);
        return new Tensor(new Float32Array(size), shape, label);
    }

    /** Create a tensor filled with ones */
    static ones(shape: number[], label?: string): Tensor {
        const size = shape.reduce((a, b) => a * b, 1);
        return new Tensor(new Float32Array(size).fill(1), shape, label);
    }

    /**
     * Create a tensor with values sampled from N(0, 1) using LCG PRNG.
     * Deterministic for the same seed.
     */
    static randn(shape: number[], seed: number, label?: string): Tensor {
        const size = shape.reduce((a, b) => a * b, 1);
        const prng = new LCG(seed);
        const data = new Float32Array(size);
        for (let i = 0; i < size; i++) {
            data[i] = prng.randn();
        }
        return new Tensor(data, shape, label);
    }

    /**
     * Create a 2D tensor from a nested number array.
     * @param data - row-major 2D array
     */
    static fromArray(data: number[][], label?: string): Tensor {
        const rows = data.length;
        const cols = data[0]?.length ?? 0;
        const flat = new Float32Array(rows * cols);
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                flat[r * cols + c] = data[r][c];
            }
        }
        return new Tensor(flat, [rows, cols], label);
    }

    /**
     * Create a 1D tensor from a flat number array.
     */
    static from1D(data: number[], label?: string): Tensor {
        return new Tensor(new Float32Array(data), [data.length], label);
    }

    // ── Shape helpers ─────────────────────────────────────────────────────────

    get ndim(): number {
        return this.shape.length;
    }

    get size(): number {
        return this.data.length;
    }

    /** Returns shape as a string, e.g. "(4, 8)" */
    shapeStr(): string {
        return `(${this.shape.join(', ')})`;
    }

    // ── Element accessors ─────────────────────────────────────────────────────

    /** Get element at [row, col] for 2D tensors */
    get(row: number, col: number): number {
        if (this.shape.length !== 2) {
            throw new Error(`get(row, col) requires 2D tensor, got shape ${this.shapeStr()}`);
        }
        return this.data[row * this.shape[1] + col];
    }

    /** Get element at [idx] for 1D tensors */
    get1D(idx: number): number {
        if (this.shape.length !== 1) {
            throw new Error(`get1D(idx) requires 1D tensor, got shape ${this.shapeStr()}`);
        }
        return this.data[idx];
    }

    /** Convert to a row-major nested array for rendering */
    toMatrix(): number[][] {
        if (this.shape.length !== 2) {
            throw new Error(`toMatrix() requires 2D tensor, got shape ${this.shapeStr()}`);
        }
        const [rows, cols] = this.shape;
        const result: number[][] = [];
        for (let r = 0; r < rows; r++) {
            const row: number[] = [];
            for (let c = 0; c < cols; c++) {
                row.push(this.data[r * cols + c]);
            }
            result.push(row);
        }
        return result;
    }

    /** Convert to a 1D number array */
    toArray(): number[] {
        return Array.from(this.data);
    }

    // ── Stats ─────────────────────────────────────────────────────────────────

    stats(): { mean: number; std: number; min: number; max: number } {
        const n = this.data.length;
        if (n === 0) return { mean: 0, std: 0, min: 0, max: 0 };
        let sum = 0, sumSq = 0, min = this.data[0], max = this.data[0];
        for (let i = 0; i < n; i++) {
            const v = this.data[i];
            sum += v;
            sumSq += v * v;
            if (v < min) min = v;
            if (v > max) max = v;
        }
        const mean = sum / n;
        const std = Math.sqrt(Math.max(0, sumSq / n - mean * mean));
        return { mean, std, min, max };
    }

    // ── Operations (all return new Tensor — NEVER mutate) ─────────────────────

    /**
     * Matrix multiplication: (m, k) × (k, n) → (m, n)
     * Asserts inner dimensions match.
     */
    matmul(other: Tensor): Tensor {
        if (this.shape.length !== 2 || other.shape.length !== 2) {
            throw new Error(
                `matmul requires 2D tensors, got ${this.shapeStr()} and ${other.shapeStr()}`
            );
        }
        const [m, k] = this.shape;
        const [k2, n] = other.shape;
        if (k !== k2) {
            throw new Error(
                `matmul dimension mismatch: ${this.shapeStr()} × ${other.shapeStr()} — inner dims ${k} ≠ ${k2}`
            );
        }
        const result = new Float32Array(m * n);
        // (m,k) × (k,n) → (m,n)
        for (let i = 0; i < m; i++) {
            for (let j = 0; j < n; j++) {
                let sum = 0;
                for (let l = 0; l < k; l++) {
                    sum += this.data[i * k + l] * other.data[l * n + j];
                }
                result[i * n + j] = sum;
            }
        }
        this._warnNaN(result);
        return new Tensor(result, [m, n], `${this.label}·${other.label}`);
    }

    /**
     * Element-wise add. Supports broadcasting:
     * - (m, n) + (m, n) → (m, n)
     * - (m, n) + (1, n) → (m, n)  [row broadcast]
     * - (m, n) + (m, 1) → (m, n)  [col broadcast]
     */
    add(other: Tensor): Tensor {
        // Simple case: same shape
        if (this.shape.length === other.shape.length &&
            this.shape.every((d, i) => d === other.shape[i])) {
            const result = new Float32Array(this.data.length);
            for (let i = 0; i < this.data.length; i++) {
                result[i] = this.data[i] + other.data[i];
            }
            return new Tensor(result, [...this.shape], this.label);
        }

        // 2D + 2D with broadcasting
        if (this.shape.length === 2 && other.shape.length === 2) {
            const [m, n] = this.shape;
            const [om, on] = other.shape;

            if ((om !== m && om !== 1) || (on !== n && on !== 1)) {
                throw new Error(
                    `add broadcast shape mismatch: ${this.shapeStr()} + ${other.shapeStr()}`
                );
            }
            const result = new Float32Array(m * n);
            for (let i = 0; i < m; i++) {
                for (let j = 0; j < n; j++) {
                    const ai = i * n + j;
                    const bi = (om === 1 ? 0 : i) * on + (on === 1 ? 0 : j);
                    result[ai] = this.data[ai] + other.data[bi];
                }
            }
            return new Tensor(result, [m, n], this.label);
        }

        // 1D + 1D
        if (this.shape.length === 1 && other.shape.length === 1) {
            if (this.shape[0] !== other.shape[0]) {
                throw new Error(
                    `add shape mismatch: ${this.shapeStr()} + ${other.shapeStr()}`
                );
            }
            const result = new Float32Array(this.data.length);
            for (let i = 0; i < this.data.length; i++) {
                result[i] = this.data[i] + other.data[i];
            }
            return new Tensor(result, [...this.shape], this.label);
        }

        throw new Error(
            `add unsupported shapes: ${this.shapeStr()} + ${other.shapeStr()}`
        );
    }

    /** Element-wise subtract */
    sub(other: Tensor): Tensor {
        return this.add(other.scale(-1));
    }

    /** Scalar multiply: every element × s */
    scale(s: number): Tensor {
        const result = new Float32Array(this.data.length);
        for (let i = 0; i < this.data.length; i++) {
            result[i] = this.data[i] * s;
        }
        return new Tensor(result, [...this.shape], this.label);
    }

    /** Element-wise multiply */
    mul(other: Tensor): Tensor {
        if (!this.shape.every((d, i) => d === other.shape[i])) {
            throw new Error(
                `mul shape mismatch: ${this.shapeStr()} * ${other.shapeStr()}`
            );
        }
        const result = new Float32Array(this.data.length);
        for (let i = 0; i < this.data.length; i++) {
            result[i] = this.data[i] * other.data[i];
        }
        return new Tensor(result, [...this.shape], this.label);
    }

    /**
     * Softmax along a dimension with optional temperature scaling.
     * Uses logsumexp trick for numerical stability.
     * Only supports dim=0 (1D) and dim=1 (2D, row-wise).
     */
    softmax(dim: number = 1, temp: number = 1.0): Tensor {
        if (this.shape.length === 1) {
            // 1D softmax
            const result = softmax1D(Array.from(this.data), temp);
            return new Tensor(new Float32Array(result), [...this.shape], this.label);
        }

        if (this.shape.length === 2 && dim === 1) {
            // Row-wise softmax
            const [rows, cols] = this.shape;
            const result = new Float32Array(rows * cols);
            for (let r = 0; r < rows; r++) {
                const row = Array.from(this.data.slice(r * cols, (r + 1) * cols));
                const sm = softmax1D(row, temp);
                for (let c = 0; c < cols; c++) {
                    result[r * cols + c] = sm[c];
                }
            }
            return new Tensor(result, [rows, cols], this.label);
        }

        throw new Error(`softmax: unsupported shape ${this.shapeStr()} with dim=${dim}`);
    }

    /**
     * Layer normalization over the last dimension.
     * LayerNorm(x) = γ · (x - μ) / √(σ² + ε) + β
     * γ initialized to 1, β to 0.
     */
    layerNorm(eps: number = 1e-5, gamma?: Tensor, beta?: Tensor): Tensor {
        if (this.shape.length !== 2) {
            throw new Error(`layerNorm requires 2D tensor, got ${this.shapeStr()}`);
        }
        const [rows, cols] = this.shape;
        const result = new Float32Array(rows * cols);

        for (let r = 0; r < rows; r++) {
            let mean = 0;
            for (let c = 0; c < cols; c++) {
                mean += this.data[r * cols + c];
            }
            mean /= cols;

            let variance = 0;
            for (let c = 0; c < cols; c++) {
                const diff = this.data[r * cols + c] - mean;
                variance += diff * diff;
            }
            variance /= cols;
            const invStd = 1 / Math.sqrt(variance + eps);

            for (let c = 0; c < cols; c++) {
                const normalized = (this.data[r * cols + c] - mean) * invStd;
                const g = gamma ? gamma.data[c] : 1.0;
                const b = beta ? beta.data[c] : 0.0;
                result[r * cols + c] = g * normalized + b;
            }
        }
        return new Tensor(result, [rows, cols], 'LayerNorm');
    }

    /**
     * Transpose two dimensions.
     * For 2D: transpose(0, 1) swaps rows and cols.
     */
    transpose(dim0: number, dim1: number): Tensor {
        if (this.shape.length !== 2) {
            throw new Error(`transpose currently supports 2D tensors only, got ${this.shapeStr()}`);
        }
        if (dim0 === 0 && dim1 === 1) {
            const [rows, cols] = this.shape;
            const result = new Float32Array(rows * cols);
            for (let r = 0; r < rows; r++) {
                for (let c = 0; c < cols; c++) {
                    result[c * rows + r] = this.data[r * cols + c];
                }
            }
            return new Tensor(result, [cols, rows], `${this.label}ᵀ`);
        }
        throw new Error(`transpose(${dim0}, ${dim1}) not supported for shape ${this.shapeStr()}`);
    }

    /**
     * Reshape to a new shape, must have same total number of elements.
     */
    reshape(newShape: number[]): Tensor {
        const newSize = newShape.reduce((a, b) => a * b, 1);
        if (newSize !== this.data.length) {
            throw new Error(
                `reshape: cannot reshape ${this.shapeStr()} (${this.data.length} elements) to ${JSON.stringify(newShape)} (${newSize} elements)`
            );
        }
        return new Tensor(new Float32Array(this.data), newShape, this.label);
    }

    /**
     * Slice a single row from a 2D tensor, returning a 1D tensor of shape [cols].
     */
    row(i: number): Tensor {
        if (this.shape.length !== 2) {
            throw new Error(`row() requires 2D tensor, got ${this.shapeStr()}`);
        }
        const [rows, cols] = this.shape;
        if (i < 0 || i >= rows) {
            throw new Error(`row(${i}) out of bounds for shape ${this.shapeStr()}`);
        }
        const result = this.data.slice(i * cols, (i + 1) * cols);
        return new Tensor(new Float32Array(result), [cols], `${this.label}[${i}]`);
    }

    /**
     * Argmax: returns the index of the maximum value.
     * For 1D tensors only.
     */
    argmax(): number {
        if (this.shape.length !== 1) {
            throw new Error(`argmax() requires 1D tensor, got ${this.shapeStr()}`);
        }
        let maxIdx = 0;
        let maxVal = this.data[0];
        for (let i = 1; i < this.data.length; i++) {
            if (this.data[i] > maxVal) {
                maxVal = this.data[i];
                maxIdx = i;
            }
        }
        return maxIdx;
    }

    /** Apply element-wise function, returns new Tensor */
    map(fn: (v: number) => number, label?: string): Tensor {
        const result = new Float32Array(this.data.length);
        for (let i = 0; i < this.data.length; i++) {
            result[i] = fn(this.data[i]);
        }
        return new Tensor(result, [...this.shape], label ?? this.label);
    }

    // ── Private helpers ───────────────────────────────────────────────────────

    private _warnNaN(data: Float32Array): void {
        for (let i = 0; i < data.length; i++) {
            if (isNaN(data[i])) {
                console.warn(`[Tensor] NaN detected in operation result`);
                return;
            }
        }
    }
}

// ── Standalone softmax helper ──────────────────────────────────────────────────

/**
 * Numerically stable softmax with temperature scaling.
 * Uses the logsumexp trick: subtract max before exponentiating.
 */
export function softmax1D(logits: number[], temp: number = 1.0): number[] {
    const scaled = logits.map(l => l / temp);
    const maxVal = Math.max(...scaled);
    const exps = scaled.map(l => Math.exp(l - maxVal));
    const sum = exps.reduce((a, b) => a + b, 0);
    return exps.map(e => e / sum);
}
