// src/lib/store/stepMachine.ts
// Step execution engine: pure function that computes the tensor output for each pipeline step.
// All steps are deterministic given the same config + seed.

import { Tensor } from '@/lib/mathEngine/tensor';
import { qkvProjections, scaledDotProductAttention, causalMask } from '@/lib/mathEngine/attention';
import { applyPositionalEncoding } from '@/lib/mathEngine/positional';
import { layerNorm, initLayerNormParams } from '@/lib/mathEngine/normalization';
import { gelu } from '@/lib/mathEngine/activations';
import { greedySample } from '@/lib/mathEngine/sampling';
import { wordSplit } from '@/lib/tokenizer/wordSplit';
import { tokensToIds, idToToken, VOCAB_SIZE } from '@/lib/tokenizer/vocab';
import { PipelineStep, type TensorRegistry, type SimulatorState } from './types';

// ── Seed offsets per weight matrix (so each has different random values) ─────
const SEED_EMBED = 0;
const SEED_WQ = 1;
const SEED_WK = 2;
const SEED_WV = 3;
const SEED_WO = 4;
const SEED_W1 = 5;
const SEED_W2 = 6;
const SEED_WLM = 7;

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
): TensorRegistry {
    const { config, tensors, inputText, temperature } = state;
    const { dModel, seed } = config;

    switch (step) {
        // ── Step 0: INPUT — no tensor computation needed ─────────────────────
        case PipelineStep.INPUT:
            return tensors;

        // ── Step 1: TOKENIZE — whitespace split ──────────────────────────────
        case PipelineStep.TOKENIZE: {
            const raw = wordSplit(inputText);
            if (raw.length === 0) {
                throw new Error('Input text is empty — please type something before stepping forward.');
            }
            return { ...tensors, tokens: { raw } };
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

        // ── Step 5: ATTENTION — QKV projections + scaled dot-product attention ─
        case PipelineStep.ATTENTION: {
            const X_pos = tensors.posenc?.X_pos;
            if (!X_pos) throw new Error('ATTENTION requires positional encodings (Step 4 not run).');

            const n = X_pos.shape[0];
            const dHead = Math.floor(dModel / config.nHeads); // d_k = d_v = d_model for single head MVP

            // Weight matrices: (dModel, dHead)
            const WQ = Tensor.randn([dModel, dHead], seed + SEED_WQ, 'WQ');
            const WK = Tensor.randn([dModel, dHead], seed + SEED_WK, 'WK');
            const WV = Tensor.randn([dModel, dHead], seed + SEED_WV, 'WV');
            // Output projection: (dHead, dModel)
            const WO = Tensor.randn([dHead, dModel], seed + SEED_WO, 'WO');

            // Q, K, V projections: each (n, dHead)
            const { Q, K, V } = qkvProjections(X_pos, WQ, WK, WV);

            // Causal mask: (n, n) — upper triangle is 1 (masked)
            const mask = causalMask(n);

            // Scaled dot-product: scores (n,n), weights (n,n), output (n,dHead)
            const { scores, weights, output } = scaledDotProductAttention(Q, K, V, mask);

            // Output projection: (n, dHead) × (dHead, dModel) → (n, dModel)
            const multihead_out = new Tensor(
                output.matmul(WO).data,
                [n, dModel],
                'attn_out'
            );

            return {
                ...tensors,
                attention: { WQ, WK, WV, WO, Q, K, V, scores, weights, output, multihead_out },
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

        // ── Step 8: FFN — W1, GELU, W2 ─────────────────────────────────────
        case PipelineStep.FFN: {
            const X_norm = tensors.layernorm?.X_norm;
            if (!X_norm) throw new Error('FFN requires layer norm (Step 7 not run).');
            const dFF = config.dFF; // 4 × dModel

            // (dModel, dFF) and (dFF, dModel)
            const W1 = Tensor.randn([dModel, dFF], seed + SEED_W1, 'W1');
            const W2 = Tensor.randn([dFF, dModel], seed + SEED_W2, 'W2');

            // FFN(x) = W2 · GELU(x · W1)
            // (n, dModel) × (dModel, dFF) → (n, dFF)
            const hidden = gelu(X_norm.matmul(W1));
            const ffnOutput = new Tensor(
                hidden.matmul(W2).data,
                [X_norm.shape[0], dModel],
                'ffn_out'
            );

            return { ...tensors, ffn: { W1, W2, hidden, output: ffnOutput } };
        }

        // ── Step 9: LM_HEAD — project last token to vocab logits ──────────────
        case PipelineStep.LM_HEAD: {
            const ffnOut = tensors.ffn?.output;
            if (!ffnOut) throw new Error('LM_HEAD requires FFN output (Step 8 not run).');

            // (dModel, |V|) projection matrix
            const W_lm = Tensor.randn([dModel, VOCAB_SIZE], seed + SEED_WLM, 'W_lm');

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

        // ── Step 11: SAMPLING — argmax greedy selection ───────────────────────
        case PipelineStep.SAMPLING: {
            const probs = tensors.softmax?.probs;
            if (!probs) throw new Error('SAMPLING requires softmax probabilities (Step 10 not run).');
            const selected_id = greedySample(probs);
            const selected_token = idToToken(selected_id);
            return { ...tensors, sampling: { selected_id, selected_token } };
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
