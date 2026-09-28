// src/lib/mathEngine/sampling.ts
// Next-token selection: greedy (argmax) and seeded top-k sampling.

import { LCG, Tensor } from './tensor';

/**
 * Greedy sampling: select the token with the highest probability.
 * Returns the index (token ID) of the maximum value in the probability array.
 *
 * @param probs - probability tensor, shape (|V|,)
 * @returns       index of the maximum probability
 */
export function greedySample(probs: Tensor): number {
    if (probs.shape.length !== 1) {
        throw new Error(`greedySample: expected 1D tensor, got ${probs.shapeStr()}`);
    }
    return probs.argmax();
}

/**
 * Greedy sampling from raw logits (applies argmax directly, skipping softmax).
 * Equivalent to temperature→0 sampling.
 *
 * @param logits - raw logit tensor, shape (|V|,)
 * @returns        index of the maximum logit
 */
export function greedySampleLogits(logits: Tensor): number {
    if (logits.shape.length !== 1) {
        throw new Error(`greedySampleLogits: expected 1D tensor, got ${logits.shapeStr()}`);
    }
    return logits.argmax();
}

/**
 * Top-K tokens by probability for display purposes.
 *
 * @param probs  - probability tensor, shape (|V|,)
 * @param k      - number of top tokens to return
 * @returns        array of {id, prob} sorted descending by prob
 */
export function topK(probs: Tensor, k: number): Array<{ id: number; prob: number }> {
    if (probs.shape.length !== 1) {
        throw new Error(`topK: expected 1D tensor, got ${probs.shapeStr()}`);
    }
    const n = probs.data.length;
    const indices: number[] = Array.from({ length: n }, (_, i) => i);
    indices.sort((a, b) => probs.data[b] - probs.data[a]);
    return indices.slice(0, k).map(id => ({ id, prob: probs.data[id] }));
}

/**
 * Top-k sampling: keep the k most likely tokens, renormalise their
 * probabilities to sum to 1, then draw one at random. `seed` makes the draw
 * reproducible; `k = 1` is equivalent to greedy decoding.
 *
 * @returns the chosen id plus the renormalised candidate list
 */
export function topKSample(
    probs: Tensor,
    k: number,
    seed: number,
): { id: number; candidates: Array<{ id: number; prob: number }> } {
    const top = topK(probs, Math.max(1, Math.min(k, probs.data.length)));
    const total = top.reduce((a, t) => a + t.prob, 0) || 1;
    const candidates = top.map((t) => ({ id: t.id, prob: t.prob / total }));
    const r = new LCG(seed).next();
    let acc = 0;
    for (const c of candidates) {
        acc += c.prob;
        if (r < acc) return { id: c.id, candidates };
    }
    return { id: candidates[candidates.length - 1].id, candidates };
}
