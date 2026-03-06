// src/lib/mathEngine/activations.ts
// GELU activation function (and ReLU for completeness)

import { Tensor } from './tensor';

/**
 * GELU activation (Gaussian Error Linear Unit).
 * Approximation: GELU(x) = 0.5x(1 + tanh(√(2/π)(x + 0.044715x³)))
 * Matches PyTorch's gelu (tanh approximation).
 *
 * @param x - scalar input
 */
export function geluScalar(x: number): number {
    const K = Math.sqrt(2 / Math.PI);
    const inner = K * (x + 0.044715 * x * x * x);
    return 0.5 * x * (1 + Math.tanh(inner));
}

/**
 * Apply GELU element-wise to a Tensor.
 * Returns a new Tensor with the same shape.
 *
 * @param x - input tensor (any shape)
 */
export function gelu(x: Tensor): Tensor {
    return x.map(geluScalar, 'gelu');
}

/**
 * ReLU activation: max(0, x).
 * Included for reference; MVP uses GELU.
 *
 * @param x - input tensor
 */
export function relu(x: Tensor): Tensor {
    return x.map(v => Math.max(0, v), 'relu');
}
