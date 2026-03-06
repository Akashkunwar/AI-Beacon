// src/lib/mathEngine/normalization.ts
// Layer normalization: LayerNorm(x) = γ · (x - μ) / √(σ² + ε) + β

import { Tensor } from './tensor';

/**
 * Layer normalization applied to the last dimension of a 2D tensor.
 * μ and σ² are computed per row (over d_model dimension).
 * γ (scale) initialized to ones, β (bias) initialized to zeros.
 *
 * @param x     - input tensor, shape (n_tokens, d_model)
 * @param eps   - small constant for numerical stability (default 1e-5)
 * @param gamma - optional learned scale, shape (d_model,) — defaults to ones
 * @param beta  - optional learned bias,  shape (d_model,) — defaults to zeros
 * @returns       normalized tensor, shape (n_tokens, d_model)
 */
export function layerNorm(
    x: Tensor,
    eps: number = 1e-5,
    gamma?: Tensor,
    beta?: Tensor
): Tensor {
    if (x.shape.length !== 2) {
        throw new Error(`layerNorm: input must be 2D, got shape ${x.shapeStr()}`);
    }
    const dModel = x.shape[1];
    if (gamma && gamma.shape[0] !== dModel) {
        throw new Error(`layerNorm: gamma shape ${gamma.shapeStr()} must match d_model=${dModel}`);
    }
    if (beta && beta.shape[0] !== dModel) {
        throw new Error(`layerNorm: beta shape ${beta.shapeStr()} must match d_model=${dModel}`);
    }
    return x.layerNorm(eps, gamma, beta);
}

/**
 * Create initialized LayerNorm parameters (γ=1, β=0) for a given d_model.
 */
export function initLayerNormParams(dModel: number): { gamma: Tensor; beta: Tensor } {
    return {
        gamma: Tensor.ones([dModel], 'gamma'),
        beta: Tensor.zeros([dModel], 'beta'),
    };
}
