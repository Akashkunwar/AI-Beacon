// src/lib/mathEngine/positional.ts
// Sinusoidal positional encoding

import { Tensor } from './tensor';

/**
 * Sinusoidal positional encoding as described in "Attention Is All You Need".
 *
 * PE(pos, 2i)   = sin(pos / 10000^(2i / d_model))
 * PE(pos, 2i+1) = cos(pos / 10000^(2i / d_model))
 *
 * @param nTokens - number of token positions
 * @param dModel  - embedding dimension
 * @returns         Tensor of shape (nTokens, dModel) with label 'PE'
 */
export function sinusoidalPE(nTokens: number, dModel: number): Tensor {
    const pe = new Float32Array(nTokens * dModel);
    for (let pos = 0; pos < nTokens; pos++) {
        for (let i = 0; i < dModel; i++) {
            // Even dims → sin, odd dims → cos
            const angle = pos / Math.pow(10000, (2 * Math.floor(i / 2)) / dModel);
            pe[pos * dModel + i] = i % 2 === 0 ? Math.sin(angle) : Math.cos(angle);
        }
    }
    return new Tensor(pe, [nTokens, dModel], 'PE');
}

/**
 * Apply positional encoding to an embedding tensor.
 * X_pos = X_embed + PE
 *
 * @param X      - embedding tensor, shape (nTokens, dModel)
 * @param dModel - embedding dimension (must match X.shape[1])
 * @returns        X_pos tensor, shape (nTokens, dModel)
 */
export function applyPositionalEncoding(X: Tensor, dModel?: number): {
    PE: Tensor;
    X_pos: Tensor;
} {
    if (X.shape.length !== 2) {
        throw new Error(`applyPositionalEncoding: X must be 2D, got ${X.shapeStr()}`);
    }
    const nTokens = X.shape[0];
    const d = dModel ?? X.shape[1];
    const PE = sinusoidalPE(nTokens, d);
    const X_pos = X.add(PE);
    X_pos.label; // label is kept from add(); we rename below
    return {
        PE,
        X_pos: new Tensor(X_pos.data, X_pos.shape as number[], 'X_pos'),
    };
}
