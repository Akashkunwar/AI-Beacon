// src/lib/mathEngine/softmax.ts
// Softmax with temperature and logsumexp stability

import { Tensor, softmax1D } from './tensor';

/**
 * Apply softmax to a 1D logits array with temperature scaling.
 * Uses the logsumexp trick for numerical stability.
 *
 * @param logits - raw unnormalized scores
 * @param temp   - temperature (default 1.0); lower → sharper, higher → flatter
 * @returns        probability array summing to 1.0
 */
export function softmax(logits: number[], temp: number = 1.0): number[] {
    return softmax1D(logits, temp);
}

/**
 * Apply softmax to a Tensor, returning a new Tensor.
 *
 * @param tensor - 1D or 2D tensor of logits
 * @param dim    - dimension to apply softmax over (default 1 for 2D row-wise)
 * @param temp   - temperature scaling
 */
export function softmaxTensor(tensor: Tensor, dim: number = 1, temp: number = 1.0): Tensor {
    return tensor.softmax(dim, temp);
}

/**
 * Compute log-softmax (numerically stable).
 * log_softmax(x) = x - log(sum(exp(x)))
 *
 * @param logits - raw scores array
 * @param temp   - temperature scaling
 */
export function logSoftmax(logits: number[], temp: number = 1.0): number[] {
    const scaled = logits.map(l => l / temp);
    const maxVal = Math.max(...scaled);
    const shiftedExp = scaled.map(l => Math.exp(l - maxVal));
    const logSumExp = Math.log(shiftedExp.reduce((a, b) => a + b, 0)) + maxVal;
    return scaled.map(l => l - logSumExp);
}
