// src/lib/mathEngine/attention.ts
// Scaled dot-product self-attention with optional causal masking

import { Tensor } from './tensor';

/**
 * Scaled dot-product attention.
 * Attention(Q, K, V) = softmax(QKᵀ / √d_k) · V
 *
 * @param Q    - query tensor,   shape (n, d_k)
 * @param K    - key tensor,     shape (n, d_k)
 * @param V    - value tensor,   shape (n, d_v)
 * @param mask - optional causal mask tensor, shape (n, n); 1 = masked position
 * @returns      { scores, weights, output }
 */
export function scaledDotProductAttention(
    Q: Tensor,
    K: Tensor,
    V: Tensor,
    mask?: Tensor
): { scores: Tensor; weights: Tensor; output: Tensor } {
    if (Q.shape.length !== 2 || K.shape.length !== 2 || V.shape.length !== 2) {
        throw new Error(
            `scaledDotProductAttention: Q, K, V must be 2D. Got ${Q.shapeStr()}, ${K.shapeStr()}, ${V.shapeStr()}`
        );
    }
    const dK = Q.shape[1];

    // Compute scores: (n, d_k) × (d_k, n) → (n, n)
    const scores = Q.matmul(K.transpose(0, 1)).scale(1 / Math.sqrt(dK));

    // Apply causal mask: add large negative to masked positions
    const maskedScores = mask
        ? applyMask(scores, mask)
        : scores;

    // Softmax over last dimension (row-wise): (n, n) → (n, n)
    const weights = maskedScores.softmax(1);

    // Output: (n, n) × (n, d_v) → (n, d_v)
    const output = weights.matmul(V);

    return {
        scores: new Tensor(scores.data, scores.shape as number[], 'scores'),
        weights: new Tensor(weights.data, weights.shape as number[], 'attn_weights'),
        output: new Tensor(output.data, output.shape as number[], 'attn_output'),
    };
}

/**
 * Build a causal (autoregressive) mask for a sequence of length n.
 * Upper triangle (future positions) is 1, lower triangle is 0.
 * Mask values are added as -1e9 before softmax.
 *
 * Shape: (n, n)
 */
export function causalMask(n: number): Tensor {
    const data = new Float32Array(n * n);
    for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
            // mask future positions: j > i
            data[i * n + j] = j > i ? 1 : 0;
        }
    }
    return new Tensor(data, [n, n], 'causal_mask');
}

/**
 * Apply a binary mask to scores: masked positions receive -1e9
 * (which becomes ~0 after softmax).
 */
function applyMask(scores: Tensor, mask: Tensor): Tensor {
    if (scores.shape[0] !== mask.shape[0] || scores.shape[1] !== mask.shape[1]) {
        throw new Error(
            `applyMask: shape mismatch — scores ${scores.shapeStr()}, mask ${mask.shapeStr()}`
        );
    }
    const result = new Float32Array(scores.data.length);
    for (let i = 0; i < scores.data.length; i++) {
        result[i] = scores.data[i] + mask.data[i] * -1e9;
    }
    return new Tensor(result, scores.shape as number[], 'masked_scores');
}

/**
 * Compute Q, K, V projections from input X and weight matrices.
 *
 * @param X_pos - input tensor, shape (n, d_model)
 * @param WQ    - query weight,  shape (d_model, d_k)
 * @param WK    - key weight,    shape (d_model, d_k)
 * @param WV    - value weight,  shape (d_model, d_v)
 * @returns       { Q, K, V }
 */
export function qkvProjections(
    X_pos: Tensor,
    WQ: Tensor,
    WK: Tensor,
    WV: Tensor
): { Q: Tensor; K: Tensor; V: Tensor } {
    const Q = new Tensor(X_pos.matmul(WQ).data, [X_pos.shape[0], WQ.shape[1]], 'Q');
    const K = new Tensor(X_pos.matmul(WK).data, [X_pos.shape[0], WK.shape[1]], 'K');
    const V = new Tensor(X_pos.matmul(WV).data, [X_pos.shape[0], WV.shape[1]], 'V');
    return { Q, K, V };
}
