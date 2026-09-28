// src/lib/store/stepMachine.ts
// Step execution engine: pure function that computes the tensor output for each pipeline step.
// All steps are deterministic given the same config + seed.
//
// The model is one post-LN transformer block, as in the original Transformer paper:
//   X   = Embed(ids) + PE
//   A   = MultiHeadAttention(X)          (causal)
//   H   = LayerNorm(X + A)
//   out = LayerNorm(H + FFN(H))
//   logits = out[last] · W_lm
// Weights are random (untrained) and scaled by 1/√fan_in, as in standard initialisation.

import { Tensor } from '@/lib/mathEngine/tensor';
import { qkvProjections, scaledDotProductAttention, causalMask, splitHeads, concatHeads } from '@/lib/mathEngine/attention';
import { applyPositionalEncoding } from '@/lib/mathEngine/positional';
import { layerNorm, initLayerNormParams } from '@/lib/mathEngine/normalization';
import { gelu } from '@/lib/mathEngine/activations';
import { greedySample, topKSample } from '@/lib/mathEngine/sampling';
import { wordSplit } from '@/lib/tokenizer/wordSplit';
import { tokensToIds, idToToken, VOCAB_SIZE } from '@/lib/tokenizer/vocab';
import { PipelineStep, type AttentionHead, type TensorRegistry, type SimulatorState } from './types';

// ── Seed offsets per weight matrix (so each has different random values) ─────
const SEED_EMBED = 0;
const SEED_WQ = 1;
const SEED_WK = 2;
const SEED_WV = 3;
const SEED_WO = 4;
const SEED_W1 = 5;
const SEED_W2 = 6;
const SEED_WLM = 7;

/** Random weight matrix scaled by 1/√fan_in so activations keep a sensible size. */
function initWeight(shape: [number, number], seed: number, label: string): Tensor {
    return Tensor.randn(shape, seed, label).scale(1 / Math.sqrt(shape[0]));
}

// ── Embedding lookup ───────────────────────────────────────────────────────────
// W_e ∈ R^{|V| × dModel} — row i is the embedding vector for token i.
// Shape (n, dModel) returned for ids.

function embeddingLookup(
    ids: number[],
    dModel: number,
    seed: number
): { We: Tensor; X: Tensor } {
    // Build entire embedding matrix deterministically
    const We = Tensor.randn([VOCAB_SIZE, dModel], seed + SEED_EMBED, 'We');
    // Scale to unit variance: divide by sqrt(dModel)
    const scale = 1 / Math.sqrt(dModel);
    const WeScaled = We.scale(scale);

    // Pick rows for each token ID
    const n = ids.length;
    const xData = new Float32Array(n * dModel);
    for (let i = 0; i < n; i++) {
        const id = Math.max(0, Math.min(ids[i], VOCAB_SIZE - 1));
        for (let d = 0; d < dModel; d++) {
            xData[i * dModel + d] = WeScaled.data[id * dModel + d];
        }
    }
    return {
        We: WeScaled,
        X: new Tensor(xData, [n, dModel], 'X_embed'),
    };
}

// ── Step execution (pure function) ────────────────────────────────────────────

/**
 * Execute a single pipeline step given the current state.
 * Returns a new TensorRegistry that includes the results of this step,
 * preserving all previously computed tensors.
 *
 * This is a pure function — no side effects.
 */
export function executeStep(
    step: PipelineStep,
    state: Pick<SimulatorState, 'config' | 'tensors' | 'inputText' | 'temperature'>
        & Partial<Pick<SimulatorState, 'samplingMethod' | 'topK'>>
): TensorRegistry {
    const { config, tensors, inputText, temperature, samplingMethod = 'greedy', topK: k = 5 } = state;
    const { dModel, seed } = config;

    switch (step) {
        // ── Step 0: INPUT — no tensor computation needed ─────────────────────
        case PipelineStep.INPUT:
            return tensors;

        // ── Step 1: TOKENIZE — words + punctuation, truncated to the context window
        case PipelineStep.TOKENIZE: {
            const all = wordSplit(inputText);
            if (all.length === 0) {
                throw new Error('Input text is empty — please type something before stepping forward.');
            }
            const raw = all.slice(0, config.maxTokens);
            return { ...tensors, tokens: { raw, dropped: all.length - raw.length } };
        }

        // ── Step 2: TOKEN_IDS — vocab lookup ─────────────────────────────────
        case PipelineStep.TOKEN_IDS: {
            const raw = tensors.tokens?.raw;
            if (!raw) throw new Error('TOKEN_IDS requires tokenization first (Step 1 not run).');
            const ids = tokensToIds(raw);
            return { ...tensors, token_ids: { ids } };
        }

        // ── Step 3: EMBEDDING — lookup rows from We ───────────────────────────
        case PipelineStep.EMBEDDING: {
            const ids = tensors.token_ids?.ids;
            if (!ids) throw new Error('EMBEDDING requires token IDs (Step 2 not run).');
            const embedResult = embeddingLookup(ids, dModel, seed);
            return { ...tensors, embed: embedResult };
        }

        // ── Step 4: POSITIONAL_ENCODING — X_pos = X_embed + PE ───────────────
        case PipelineStep.POSITIONAL_ENCODING: {
            const X = tensors.embed?.X;
            if (!X) throw new Error('POSITIONAL_ENCODING requires embeddings (Step 3 not run).');
            const { PE, X_pos } = applyPositionalEncoding(X, dModel);
            return { ...tensors, posenc: { PE, X_pos } };
        }

        // ── Step 5: ATTENTION — multi-head causal self-attention ─────────────
        case PipelineStep.ATTENTION: {
            const X_pos = tensors.posenc?.X_pos;
            if (!X_pos) throw new Error('ATTENTION requires positional encodings (Step 4 not run).');
            if (dModel % config.nHeads !== 0) {
                throw new Error(`d_model (${dModel}) must be divisible by the number of heads (${config.nHeads}).`);
            }

            const n = X_pos.shape[0];

            // Projections for all heads at once: (dModel, dModel). Head h uses
            // columns [h·d_head, (h+1)·d_head) of each matrix.
            const WQ = initWeight([dModel, dModel], seed + SEED_WQ, 'WQ');
            const WK = initWeight([dModel, dModel], seed + SEED_WK, 'WK');
            const WV = initWeight([dModel, dModel], seed + SEED_WV, 'WV');
            const WO = initWeight([dModel, dModel], seed + SEED_WO, 'WO');

            const { Q, K, V } = qkvProjections(X_pos, WQ, WK, WV);
            const mask = causalMask(n);

            const Qs = splitHeads(Q, config.nHeads, 'Q');
            const Ks = splitHeads(K, config.nHeads, 'K');
            const Vs = splitHeads(V, config.nHeads, 'V');
            const heads: AttentionHead[] = Qs.map((Qh, h) => {
                const { scores, weights, output } = scaledDotProductAttention(Qh, Ks[h], Vs[h], mask);
                return { Q: Qh, K: Ks[h], V: Vs[h], scores, weights, output };
            });

            // Concatenate head outputs and mix them with W_O: (n, dModel) × (dModel, dModel)
            const concat = concatHeads(heads.map((h) => h.output));
            const multihead_out = new Tensor(concat.matmul(WO).data, [n, dModel], 'attn_out');

            return {
                ...tensors,
                attention: { WQ, WK, WV, WO, Q, K, V, heads, concat, multihead_out },
            };
        }

        // ── Step 6: RESIDUAL — X_res = X_pos + attn_out ──────────────────────
        case PipelineStep.RESIDUAL: {
            const X_pos = tensors.posenc?.X_pos;
            const attn_out = tensors.attention?.multihead_out;
            if (!X_pos || !attn_out) throw new Error('RESIDUAL requires attention output (Step 5 not run).');
            const X_res = new Tensor(X_pos.add(attn_out).data, X_pos.shape as number[], 'X_res');
            return { ...tensors, residual: { X_res } };
        }

        // ── Step 7: LAYER_NORM — normalize each row ───────────────────────────
        case PipelineStep.LAYER_NORM: {
            const X_res = tensors.residual?.X_res;
            if (!X_res) throw new Error('LAYER_NORM requires residual (Step 6 not run).');
            const { gamma, beta } = initLayerNormParams(dModel);
            const X_norm = layerNorm(X_res, 1e-5, gamma, beta);
            return { ...tensors, layernorm: { X_norm, gamma, beta } };
        }

        // ── Step 8: FFN — W1 → GELU → W2, then add & normalise ──────────────
        case PipelineStep.FFN: {
            const X_norm = tensors.layernorm?.X_norm;
            if (!X_norm) throw new Error('FFN requires layer norm (Step 7 not run).');
            const dFF = config.dFF; // 4 × dModel
            const n = X_norm.shape[0];

            const W1 = initWeight([dModel, dFF], seed + SEED_W1, 'W1');
            const W2 = initWeight([dFF, dModel], seed + SEED_W2, 'W2');

            // FFN(x) = GELU(x · W1) · W2 — applied to every token independently
            const pre = new Tensor(X_norm.matmul(W1).data, [n, dFF], 'ffn_pre');
            const hidden = gelu(pre);
            const delta = new Tensor(hidden.matmul(W2).data, [n, dModel], 'ffn_delta');

            // Second residual connection + LayerNorm closes the block
            const { gamma, beta } = initLayerNormParams(dModel);
            const output = new Tensor(layerNorm(X_norm.add(delta), 1e-5, gamma, beta).data, [n, dModel], 'block_out');

            return { ...tensors, ffn: { W1, W2, pre, hidden, delta, output } };
        }

        // ── Step 9: LM_HEAD — project last token to vocab logits ──────────────
        case PipelineStep.LM_HEAD: {
            const ffnOut = tensors.ffn?.output;
            if (!ffnOut) throw new Error('LM_HEAD requires the block output (Step 8 not run).');

            // (dModel, |V|) projection matrix
            const W_lm = initWeight([dModel, VOCAB_SIZE], seed + SEED_WLM, 'W_lm');

            // Use the LAST token's hidden state: (1, dModel)
            const lastToken = ffnOut.row(ffnOut.shape[0] - 1).reshape([1, dModel]);

            // (1, dModel) × (dModel, |V|) → (1, |V|) → flatten to (|V|,)
            const logitsRaw = lastToken.matmul(W_lm);
            const logits = logitsRaw.reshape([VOCAB_SIZE]);

            return { ...tensors, lm_head: { W_lm, logits } };
        }

        // ── Step 10: SOFTMAX — logits → probabilities ─────────────────────────
        case PipelineStep.SOFTMAX: {
            const logits = tensors.lm_head?.logits;
            if (!logits) throw new Error('SOFTMAX requires LM head output (Step 9 not run).');
            const probs = logits.softmax(0, temperature);
            return { ...tensors, softmax: { probs } };
        }

        // ── Step 11: SAMPLING — greedy argmax or seeded top-k ────────────────
        case PipelineStep.SAMPLING: {
            const probs = tensors.softmax?.probs;
            if (!probs) throw new Error('SAMPLING requires softmax probabilities (Step 10 not run).');
            if (samplingMethod === 'top-k') {
                // Seed varies with the text so repeated generations draw differently
                const drawSeed = seed * 7919 + inputText.length * 104729 + (tensors.tokens?.raw.length ?? 0);
                const { id, candidates } = topKSample(probs, k, drawSeed);
                return {
                    ...tensors,
                    sampling: { selected_id: id, selected_token: idToToken(id), prob: probs.data[id], method: 'top-k', candidates },
                };
            }
            const selected_id = greedySample(probs);
            return {
                ...tensors,
                sampling: { selected_id, selected_token: idToToken(selected_id), prob: probs.data[selected_id], method: 'greedy' },
            };
        }

        default:
            return tensors;
    }
}

// ── Config hash helper ────────────────────────────────────────────────────────

/**
 * A cheap config hash for the StepSnapshot — used to detect if config changed.
 */
export function configHash(config: SimulatorState['config']): string {
    return `${config.dModel}-${config.nHeads}-${config.seed}-${config.maxTokens}`;
}

/**
 * Number of learned parameters in the simulated model: embedding table,
 * attention projections, two layer norms, the feed-forward network and the
 * output (LM head) matrix. No biases, matching the step machine.
 */
export function countParameters(config: SimulatorState['config']): number {
    const { dModel: d, dFF } = config;
    const embedding = VOCAB_SIZE * d;
    const attention = 4 * d * d;
    const layerNorms = 2 * 2 * d;
    const ffn = 2 * d * dFF;
    const lmHead = d * VOCAB_SIZE;
    return embedding + attention + layerNorms + ffn + lmHead;
}
