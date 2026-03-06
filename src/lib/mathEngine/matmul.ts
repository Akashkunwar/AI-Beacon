// src/lib/mathEngine/matmul.ts
// Matrix multiplication with shape assertions
// (m, k) × (k, n) → (m, n)

import { Tensor } from './tensor';

/**
 * Matrix multiplication of two 2D tensors.
 * Asserts inner dimensions match and throws a descriptive error if not.
 *
 * @param A - shape (m, k)
 * @param B - shape (k, n)
 * @returns   shape (m, n)
 */
export function matmul(A: Tensor, B: Tensor): Tensor {
    return A.matmul(B);
}

/**
 * Batched embedding lookup: given row indices, returns stacked rows.
 * X = W_e[ids]  where W_e ∈ R^{|V| × d_model}
 *
 * @param ids    - array of integer token IDs
 * @param We     - embedding weight matrix, shape (|V|, d_model)
 * @returns        shape (n_tokens, d_model)
 */
export function embeddingLookup(
    ids: number[],
    We: Tensor
): Tensor {
    if (We.shape.length !== 2) {
        throw new Error(`embeddingLookup: weight matrix must be 2D, got ${We.shapeStr()}`);
    }
    const [vocabSize, dModel] = We.shape;
    const nTokens = ids.length;
    const result = new Float32Array(nTokens * dModel);

    for (let i = 0; i < nTokens; i++) {
        const id = ids[i];
        if (id < 0 || id >= vocabSize) {
            throw new Error(
                `embeddingLookup: token id ${id} out of range [0, ${vocabSize})`
            );
        }
        for (let j = 0; j < dModel; j++) {
            result[i * dModel + j] = We.data[id * dModel + j];
        }
    }

    return new Tensor(result, [nTokens, dModel], 'X_embed');
}

/**
 * Convenience: create embedding weight matrix and lookup in one call.
 * W_e generated deterministically from seed.
 *
 * @param ids    - token IDs
 * @param dModel - embedding dimension
 * @param seed   - PRNG seed
 * @param vocabSize - vocabulary size
 */
export function embeddingLookupWithWeights(
    ids: number[],
    dModel: number,
    seed: number,
    vocabSize: number = 512
): { We: Tensor; X: Tensor } {
    const We = Tensor.randn([vocabSize, dModel], seed, 'W_e');
    const X = embeddingLookup(ids, We);
    return { We, X };
}
