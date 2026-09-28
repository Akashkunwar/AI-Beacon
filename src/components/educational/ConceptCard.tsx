// src/components/educational/ConceptCard.tsx
// Collapsible "Go deeper" card for each simulator step: why the step exists,
// how real models differ from this demo, a common misconception, and (in
// Advanced mode) the equivalent PyTorch code.

import { useId, useState } from 'react';
import { PipelineStep } from '@/lib/store/types';
import { useSimulatorStore } from '@/lib/store/simulatorStore';

interface ConceptContent {
    why: string;
    realModels: string;
    gotcha: string;
    pytorch: string;
}

const CONCEPT_CONTENT: Record<PipelineStep, ConceptContent> = {
    [PipelineStep.INPUT]: {
        why: 'A language model is a mathematical function: it can only work with numbers. The next four steps turn your text into numbers the network can compute with.',
        realModels: 'The amount of text a model can read at once is its context window. GPT-2 (2019) read 1,024 tokens; Llama 3.1 reads 128K; several 2026 frontier models read a million or more. This demo reads at most 8 tokens so every number stays visible.',
        gotcha: 'Capitalisation, spacing and punctuation all change how real tokenizers split text, so “Cat”, “ cat” and “cat” can become different tokens.',
        pytorch: `# No computation yet — just a string
text = "The cat sat"`,
    },
    [PipelineStep.TOKENIZE]: {
        why: 'The model has a fixed vocabulary of pieces it knows. Tokenization cuts any text into those pieces so each one can be looked up.',
        realModels: 'Real models use subword tokenizers (BPE or SentencePiece): common words are one token, rare words are split into parts. GPT-2 has 50,257 tokens and Llama 3 has 128,256. In English, one token is roughly ¾ of a word on average.',
        gotcha: 'Token counts, not word counts, decide cost and context limits. Code, numbers and non-English text often need many more tokens per word.',
        pytorch: `import tiktoken
enc = tiktoken.get_encoding("gpt2")
enc.encode("The cat sat")   # → [464, 3797, 3332]`,
    },
    [PipelineStep.TOKEN_IDS]: {
        why: 'The next step is a table lookup, and tables are indexed by numbers. Each token’s ID is simply its row number in the vocabulary.',
        realModels: 'Every tokenizer has its own numbering. In GPT-2, “The” is 464 and “ cat” (with a leading space) is 3797. In this demo “the” is 1.',
        gotcha: 'This demo maps unknown words to <unk> (ID 0). Byte-level tokenizers used by modern models can represent any text, so they never need an unknown token.',
        pytorch: `vocab = {"the": 1, "cat": 459, "sat": 490}
ids = [vocab.get(tok, 0) for tok in tokens]   # → [1, 459, 490]`,
    },
    [PipelineStep.EMBEDDING]: {
        why: 'An ID is just a label. An embedding is a list of numbers the network can compute with. During training these vectors are adjusted so tokens used in similar ways end up with similar vectors.',
        realModels: 'GPT-2 small uses 768 numbers per token; Llama 3 8B uses 4,096. Its embedding table alone is 128,256 × 4,096 ≈ 525 million parameters. This demo uses 4–64 numbers per token.',
        gotcha: 'The embedding table is learned, not designed by hand. Here it is random, so similar words do not have similar vectors yet.',
        pytorch: `embed = nn.Embedding(vocab_size, d_model)
X = embed(token_ids)          # (n, d_model)`,
    },
    [PipelineStep.POSITIONAL_ENCODING]: {
        why: 'Attention on its own ignores order — “dog bites man” and “man bites dog” would look identical. Adding a position signal lets the model tell them apart.',
        realModels: 'The original Transformer (2017) used the sine/cosine pattern shown here. GPT-2 learned a position table instead. Most current open models (Llama, Qwen, Mistral) use rotary position embeddings (RoPE), which rotate the query and key vectors inside attention.',
        gotcha: 'Being able to compute positions beyond the training length does not mean the model works well there. Long-context models need special training to use far-away positions reliably.',
        pytorch: `# PE(pos, 2i)   = sin(pos / 10000^(2i/d_model))
# PE(pos, 2i+1) = cos(pos / 10000^(2i/d_model))
X = X + positional_encoding(n, d_model)`,
    },
    [PipelineStep.ATTENTION]: {
        why: 'This is the only step where tokens exchange information. It lets “sat” pull in information from “cat”, which is how context shapes meaning.',
        realModels: 'GPT-2 small has 12 heads of 64 dimensions per layer. Llama 3 8B has 32 query heads of 128 dimensions that share 8 key/value heads (grouped-query attention), repeated in each of its 32 layers. This demo has 1–4 heads in a single layer.',
        gotcha: 'Attention weights show where information flows, not why the model made a decision. Reading them as explanations is a common over-interpretation.',
        pytorch: `Q, K, V = X @ W_Q, X @ W_K, X @ W_V          # (n, d_model)
Q, K, V = [t.view(n, n_heads, d_head).transpose(0, 1) for t in (Q, K, V)]
scores  = Q @ K.transpose(-2, -1) / d_head ** 0.5
scores  = scores.masked_fill(causal_mask, float("-inf"))
weights = scores.softmax(dim=-1)              # (n_heads, n, n)
out     = (weights @ V).transpose(0, 1).reshape(n, d_model) @ W_O`,
    },
    [PipelineStep.RESIDUAL]: {
        why: 'Adding the input back means each layer only has to learn a small change, and the original information is never lost. This “shortcut” is what makes networks with dozens of layers trainable.',
        realModels: 'Every attention and feed-forward sub-layer has one. GPT-2 small stacks 12 blocks, Llama 3 8B has 32 and GPT-3 has 96 — each with two residual connections.',
        gotcha: 'Addition only works if both tensors have the same shape, which is why attention ends with the W_O projection back to d_model.',
        pytorch: `X = X + attention(X)   # same shape in, same shape out`,
    },
    [PipelineStep.LAYER_NORM]: {
        why: 'Values can drift larger or smaller as they pass through layers. Normalising keeps every token’s vector in a predictable range, which keeps training stable.',
        realModels: 'The original Transformer normalised after each sub-layer (post-norm, as here). GPT-2 and most later models normalise before it (pre-norm). Llama, Qwen and Mistral use RMSNorm, a cheaper variant that skips subtracting the mean.',
        gotcha: 'Layer norm works per token, across that token’s numbers. Batch norm, common in image models, works across examples instead.',
        pytorch: `norm = nn.LayerNorm(d_model)
X = norm(X)   # each row: mean ≈ 0, std ≈ 1, then × γ + β`,
    },
    [PipelineStep.FFN]: {
        why: 'Attention moves information between tokens; the feed-forward network then transforms each token on its own. Most of a model’s parameters live here, and research links many stored facts and patterns to these layers.',
        realModels: 'GPT-2 expands 768 → 3,072 → 768 with GELU. Llama 3 8B expands 4,096 → 14,336 using SwiGLU, a gated variant. Many 2025–2026 models use mixture-of-experts: many FFNs per layer, with only a few active for each token.',
        gotcha: 'The activation function (GELU here) is what makes the network non-linear. Without it, the two matrices would collapse into one and the layer could only compute straight-line functions.',
        pytorch: `ffn = nn.Sequential(nn.Linear(d_model, 4 * d_model), nn.GELU(),
                    nn.Linear(4 * d_model, d_model))
X = norm2(X + ffn(X))   # second residual + layer norm`,
    },
    [PipelineStep.LM_HEAD]: {
        why: 'The final vector of the last token has to become a vote for every possible next token. One matrix multiplication produces a score (logit) for each word in the vocabulary.',
        realModels: 'GPT-2’s output matrix is 768 × 50,257. Many models reuse the embedding table here (weight tying) to save parameters.',
        gotcha: 'During generation only the last position’s scores are used. During training, every position predicts its own next token at the same time, so no work is wasted.',
        pytorch: `lm_head = nn.Linear(d_model, vocab_size, bias=False)
logits = lm_head(X[-1])      # (vocab_size,)`,
    },
    [PipelineStep.SOFTMAX]: {
        why: 'Scores can be any number. Softmax turns them into probabilities between 0 and 1 that add up to 1, so the model’s preferences can be compared and sampled.',
        realModels: 'Identical in every model, just over a larger vocabulary. Chat products expose temperature as a setting; low values make answers more predictable, high values more varied.',
        gotcha: 'Temperature does not change which token scores highest — it only sharpens (T < 1) or flattens (T > 1) the distribution. T = 0 is treated as “always pick the top token”.',
        pytorch: `probs = torch.softmax(logits / temperature, dim=-1)
probs.sum()   # → 1.0`,
    },
    [PipelineStep.SAMPLING]: {
        why: 'Generation is a loop: pick a token, append it, run the whole model again. Every word of a chatbot’s reply comes from repeating these twelve steps.',
        realModels: 'Most products sample instead of always taking the top token, usually with top-p (nucleus) sampling plus temperature. Reasoning models may generate thousands of hidden tokens before the visible answer.',
        gotcha: 'Always picking the most likely token (greedy) tends to produce repetitive, bland text; a little randomness usually reads better.',
        pytorch: `next_id = probs.argmax()                                 # greedy
top = torch.topk(probs, k=5)                             # top-k
next_id = top.indices[torch.multinomial(top.values, 1)]`,
    },
};

export function ConceptCard({ stepId, defaultExpanded = false }: { stepId: PipelineStep; defaultExpanded?: boolean }) {
    const [expanded, setExpanded] = useState(defaultExpanded);
    const advanced = useSimulatorStore((s) => s.mode === 'advanced');
    const bodyId = useId();
    const c = CONCEPT_CONTENT[stepId];

    return (
        <section className="cc">
            <button type="button" className="cc-toggle" onClick={() => setExpanded((v) => !v)} aria-expanded={expanded} aria-controls={bodyId}>
                <span className="cc-title">Go deeper</span>
                <span className="cc-sub">Why this step exists · real models · a common misconception</span>
                <span className="cc-chev" aria-hidden="true">{expanded ? '−' : '+'}</span>
            </button>
            {expanded && (
                <div id={bodyId} className="cc-body">
                    <div className="cc-item">
                        <h4>Why it matters</h4>
                        <p>{c.why}</p>
                    </div>
                    <div className="cc-item">
                        <h4>In real models</h4>
                        <p>{c.realModels}</p>
                    </div>
                    <div className="cc-item">
                        <h4>Common misconception</h4>
                        <p>{c.gotcha}</p>
                    </div>
                    {advanced ? (
                        <div className="cc-item">
                            <h4>In PyTorch</h4>
                            <pre>{c.pytorch}</pre>
                        </div>
                    ) : (
                        <p className="cc-hint">Switch to Advanced mode to see the equivalent PyTorch code.</p>
                    )}
                </div>
            )}
            <style>{`
                .cc { border: 1px solid var(--stroke); border-radius: var(--r-lg); background: var(--bg-panel); }
                .cc-toggle { width: 100%; display: grid; grid-template-columns: auto 1fr auto; align-items: baseline; gap: var(--s3); padding: var(--s3) var(--s4); text-align: left; }
                .cc-title { font-size: var(--text-sm); font-weight: var(--weight-semibold); color: var(--ink); }
                .cc-sub { font-size: var(--text-xs); color: var(--muted); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
                .cc-chev { font-family: var(--font-mono); color: var(--muted); font-size: var(--text-md); line-height: 1; }
                .cc-toggle:hover .cc-chev { color: var(--ink); }
                .cc-body { padding: 0 var(--s4) var(--s4); display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 240px), 1fr)); gap: var(--s4); border-top: 1px solid var(--stroke); padding-top: var(--s4); }
                .cc-item h4 { font-size: var(--text-2xs); font-family: var(--font-mono); text-transform: uppercase; letter-spacing: var(--tracking-wide); color: var(--muted); margin-bottom: 4px; font-weight: var(--weight-medium); }
                .cc-item p { font-size: var(--text-sm); color: var(--secondary); line-height: var(--lead-body); }
                .cc-item pre { font-family: var(--font-mono); font-size: var(--text-2xs); line-height: 1.7; background: var(--bg-sunken); border: 1px solid var(--stroke); border-radius: var(--r-sm); padding: var(--s2) var(--s3); white-space: pre-wrap; word-break: break-word; color: var(--ink); }
                .cc-hint { font-size: var(--text-xs); color: var(--muted); align-self: end; }
                @media (max-width: 639px) { .cc-sub { display: none; } }
            `}</style>
        </section>
    );
}
