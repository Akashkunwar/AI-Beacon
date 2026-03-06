// src/components/educational/ConceptCard.tsx
// Collapsible educational card with step-specific explanations.

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PipelineStep } from '@/lib/store/types';

// ─── ConceptCard Content Database ─────────────────────────────────────────

interface ConceptContent {
    what: string;
    why: string;
    realDimensions: string;
    gotcha: string;
    pytorch: string;
}

const CONCEPT_CONTENT: Partial<Record<PipelineStep, ConceptContent>> = {
    [PipelineStep.INPUT]: {
        what: 'Raw text is the unprocessed string you type — letters, spaces, punctuation. The model cannot read text directly; it needs numbers.',
        why: 'Language models are fundamentally mathematical functions. Before any computation can happen, natural language must be converted into a structured numerical representation. This step is the starting point of that journey.',
        realDimensions: 'GPT-2 accepts up to 1,024 tokens. LLaMA-3 supports 8,192 tokens (context length). AI Beacon uses max 8 tokens for clarity.',
        gotcha: 'Punctuation, capitalization, and whitespace all affect tokenization. "cat" and "Cat" may map to different token IDs in real models.',
        pytorch: `# No computation here — just the raw string
input_text = "The cat sat"`,
    },
    [PipelineStep.TOKENIZE]: {
        what: 'Tokenization splits the input string into chunks called "tokens" — in this demo, simply words. Each token is a discrete unit the model processes.',
        why: 'Computers process numbers, not text. Splitting text into tokens lets each piece be independently embedded into a vector space. The vocabulary defines the set of all possible tokens the model knows.',
        realDimensions: 'GPT-2 vocabulary: 50,257 tokens (BPE). LLaMA-3: 128,000 tokens. AI Beacon uses a demo 512-token word vocabulary.',
        gotcha: 'Real models use BPE (Byte-Pair Encoding) or SentencePiece — subword tokenization. "unhappiness" might split into ["un", "happiness"] or even ["▁un", "happiness"] depending on the tokenizer.',
        pytorch: `import tiktoken
enc = tiktoken.get_encoding("gpt2")
tokens = enc.encode("The cat sat")
# → [464, 3797, 3332]  (GPT-2 token IDs)`,
    },
    [PipelineStep.TOKEN_IDS]: {
        what: 'Each token string is looked up in the vocabulary to get an integer ID — its unique "address" in the model\'s dictionary.',
        why: 'The embedding layer is a lookup table: given an ID, it returns a dense vector. Integer IDs are indices into this table. Without IDs, we cannot do the lookup.',
        realDimensions: 'GPT-2: "the" → token 464. LLaMA-3: "the" → token 279. AI Beacon: "the" → token 1. Each tokenizer has its own mapping.',
        gotcha: 'Unknown words not in the vocabulary get mapped to <unk> (ID 0). Proper BPE tokenizers virtually eliminate this — they decompose unknowns into subword pieces.',
        pytorch: `# Vocabulary lookup
vocab = {"the": 1, "cat": 485, "sat": 229}
ids = [vocab.get(tok, 0) for tok in tokens]
# → [1, 485, 229]`,
    },
    [PipelineStep.EMBEDDING]: {
        what: 'Each token ID is used to index into a learned embedding matrix W_e ∈ ℝ^(|V| × d_model), selecting a d_model-dimensional dense vector for each token.',
        why: 'Similar words end up close together in embedding space — the model learns that "king" and "queen" are related, or that "cat" and "dog" are both animals. This geometric structure is what enables reasoning.',
        realDimensions: 'GPT-2: d_model=768. LLaMA-3-8B: d_model=4096. AI Beacon: d_model=8 (adjustable 4–64).',
        gotcha: 'Embeddings are learned during training — they start random and gradually encode semantic meaning via backprop. AI Beacon uses random toy weights.',
        pytorch: `embedding = nn.Embedding(vocab_size, d_model)
X = embedding(token_ids)  # (n, d_model)`,
    },
    [PipelineStep.POSITIONAL_ENCODING]: {
        what: 'Sinusoidal position vectors are added to token embeddings, injecting information about each token\'s position in the sequence.',
        why: 'Self-attention is permutation-invariant — "cat sat" and "sat cat" would produce identical outputs without positional info. PE encodes order so the model knows position 0 ≠ position 1.',
        realDimensions: 'GPT-2 uses learned positional embeddings (same shape as token embeddings). Modern models (LLaMA-3) use RoPE (Rotary Position Embeddings). AI Beacon uses original Vaswani sinusoidal PE.',
        gotcha: 'Sinusoidal PE allows the model to generalize to sequence lengths longer than seen during training — unlike learned PEs, which cannot.',
        pytorch: `# PE(pos, 2i)   = sin(pos / 10000^(2i/d_model))
# PE(pos, 2i+1) = cos(pos / 10000^(2i/d_model))
X_pos = X + positional_encoding(n, d_model)`,
    },
    [PipelineStep.ATTENTION]: {
        what: 'Each token creates Query, Key, and Value vectors. Queries are matched against Keys (dot product) to produce attention weights, which weight a sum of Values.',
        why: 'Attention lets every token directly attend to every other token — "sat" can look at "cat" to understand the subject. This global context is what makes transformers so powerful.',
        realDimensions: 'GPT-2: 12 attention heads, d_head=64, d_model=768. LLaMA-3-8B: 32 heads, d_head=128, d_model=4096. AI Beacon: 1 head (MVP).',
        gotcha: 'Queries and Keys must be divided by √d_k before softmax — without this scaling, dot products grow large and softmax saturates (gradients vanish).',
        pytorch: `Q = X @ W_Q  # (n, d_head)
K = X @ W_K  # (n, d_head)
scores = Q @ K.T / sqrt(d_k)
weights = softmax(scores + mask)
output = weights @ V`,
    },
    [PipelineStep.RESIDUAL]: {
        what: 'The original input X_pos is added to the attention output: X_res = X_pos + attn_output. This is called a residual or skip connection.',
        why: '"Gradient highway" — skip connections allow gradients to flow directly from output to input during backprop, enabling very deep networks to train effectively. Without them, deep networks suffer from vanishing gradients.',
        realDimensions: 'Used identically at every layer in every transformer. GPT-2 has 12 layers, LLaMA-3-8B has 32 layers — each has a residual connection after attention and after FFN.',
        gotcha: 'For residual addition to work, attention output must have the same shape as the input: (n, d_model). This is why the "output projection" W_O is necessary.',
        pytorch: `X_res = X_pos + attn_output  # elementwise add, same shape`,
    },
    [PipelineStep.LAYER_NORM]: {
        what: 'Each vector in the sequence is independently normalized to have zero mean and unit variance, then scaled by learned parameters γ and β.',
        why: 'Deep networks are sensitive to the scale of activations. LayerNorm stabilizes training by ensuring each layer receives similarly-scaled inputs, preventing exploding/vanishing activations.',
        realDimensions: 'Applied after every attention and FFN block. GPT-2: before attention (Pre-LN). Original "Attention is All You Need": after (Post-LN). AI Beacon: Post-LN.',
        gotcha: 'LayerNorm normalizes per-token (over d_model dimension). BatchNorm normalizes per-dimension (over batch) — confusingly different! Transformers use LayerNorm.',
        pytorch: `layer_norm = nn.LayerNorm(d_model)
X_norm = layer_norm(X_res)  # mean≈0, std≈1 per token`,
    },
    [PipelineStep.FFN]: {
        what: 'Two linear layers with GELU activation in between: X_ff = W2 · GELU(W1 · X_norm). The hidden dimension is 4× larger than d_model.',
        why: 'While attention captures relationships between tokens, FFN allows each token to process learned patterns independently. FFN layers are where "facts" are thought to be stored in LLMs.',
        realDimensions: 'GPT-2: d_ff=3072 (4×768). LLaMA-3-8B: d_ff=14336 (~3.5×4096) using SwiGLU. AI Beacon: d_ff=4×d_model.',
        gotcha: 'GELU is preferred over ReLU in modern transformers — it\'s smoother and allows small negative values to pass through. LLaMA uses SwiGLU, an even more expressive variant.',
        pytorch: `W1 = nn.Linear(d_model, d_ff)
W2 = nn.Linear(d_ff, d_model)
X_ff = W2(F.gelu(W1(X_norm)))`,
    },
    [PipelineStep.LM_HEAD]: {
        what: 'A final linear layer projects the hidden state to logits (one per vocabulary token): logits = X_last @ W_lm. Only the last token\'s representation is used for next-token prediction.',
        why: 'The LM head converts the model\'s internal representation back into the vocabulary space — producing a score for every possible next token. Higher score = model thinks it\'s more likely.',
        realDimensions: 'GPT-2: W_lm ∈ ℝ^(768 × 50257). LLaMA-3-8B: ℝ^(4096 × 128000). Often tied (shared weights) with the embedding matrix.',
        gotcha: 'Only the LAST token\'s hidden state predicts the next token. All other positions are "wasted" on autoregressive prediction of preceding tokens (used during training).',
        pytorch: `lm_head = nn.Linear(d_model, vocab_size, bias=False)
logits = lm_head(X_ff[-1])  # last token → (vocab_size,)`,
    },
    [PipelineStep.SOFTMAX]: {
        what: 'Logits are converted to a probability distribution via softmax: P(token) = exp(logit/T) / Σ exp(logit/T). Temperature T controls "sharpness".',
        why: 'Raw logits are unnormalized scores. Softmax converts them to probabilities that sum to 1, allowing interpretation as "probability of next token = X".',
        realDimensions: 'Same operation in all transformers. The probability distribution is over the full vocabulary: 50K+ entries for GPT, 128K for LLaMA.',
        gotcha: 'Temperature T=1 = standard softmax. T<1 = sharper (greedy-like). T>1 = flatter (more random). T→0 = argmax. T→∞ = uniform distribution.',
        pytorch: `probs = F.softmax(logits / temperature, dim=-1)
# probs.sum() ≈ 1.0`,
    },
    [PipelineStep.SAMPLING]: {
        what: 'Greedy sampling selects the token with the highest probability: next_token = argmax(probs). This is the simplest but not always the best strategy.',
        why: 'This is the final output — the model\'s prediction of the next word. In real text generation, this token is appended to the input and the process repeats (auto-regressive generation).',
        realDimensions: 'Real models use top-k (k=50), top-p (p=0.9), or temperature sampling for diversity. Beam search evaluates multiple sequences. AI Beacon uses greedy (MVP).',
        gotcha: 'Greedy sampling can get stuck in repetitive loops. "I love love love love love..." This is why real inference uses top-k/p sampling or repetition penalties.',
        pytorch: `# Greedy (MVP)
next_token_id = probs.argmax().item()
# Top-k (production)
top_k = torch.topk(probs, k=50)
next_token_id = top_k.indices[torch.multinomial(top_k.values, 1)]`,
    },
};

// ─── ConceptCard Props ────────────────────────────────────────────────────

interface ConceptCardProps {
    stepId: PipelineStep;
    defaultExpanded?: boolean;
}

// ─── ConceptCard ──────────────────────────────────────────────────────────

export function ConceptCard({ stepId, defaultExpanded = false }: ConceptCardProps) {
    const [expanded, setExpanded] = useState(defaultExpanded);
    const content = CONCEPT_CONTENT[stepId];

    if (!content) return null;

    return (
        <div
            style={{
                background: 'var(--bg-panel)',
                border: '1px solid var(--stroke)',
                borderRadius: '10px',
                overflow: 'hidden',
            }}
        >
            {/* Header — always visible */}
            <button
                onClick={() => setExpanded((v) => !v)}
                aria-expanded={expanded}
                aria-controls="concept-card-body"
                style={{
                    width: '100%',
                    padding: '12px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    gap: '8px',
                    textAlign: 'left',
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '14px' }}>📖</span>
                    <span style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '11px',
                        color: 'var(--secondary)',
                        letterSpacing: '0.06em',
                        textTransform: 'uppercase',
                        fontWeight: 600,
                    }}>
                        Concept
                    </span>
                </div>
                <motion.span
                    animate={{ rotate: expanded ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    style={{
                        display: 'inline-block',
                        color: 'var(--muted)',
                        fontSize: '14px',
                        flexShrink: 0,
                    }}
                >
                    ▼
                </motion.span>
            </button>

            {/* Body — collapsible */}
            <AnimatePresence initial={false}>
                {expanded && (
                    <motion.div
                        id="concept-card-body"
                        key="body"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: 'easeOut' }}
                        style={{ overflow: 'hidden' }}
                    >
                        <div style={{
                            padding: '0 16px 16px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '12px',
                        }}>
                            {/* What */}
                            <div>
                                <p style={sectionLabelStyle}>What it does</p>
                                <p style={bodyTextStyle}>{content.what}</p>
                            </div>

                            {/* Why */}
                            <div>
                                <p style={sectionLabelStyle}>Why it matters</p>
                                <p style={bodyTextStyle}>{content.why}</p>
                            </div>

                            {/* Real dimensions */}
                            <div style={{
                                padding: '8px 10px',
                                background: 'var(--bg)',
                                border: '1px solid var(--stroke-dark)',
                                borderRadius: '6px',
                            }}>
                                <p style={{ ...sectionLabelStyle, color: 'var(--ink)' }}>
                                    Real model dimensions
                                </p>
                                <p style={{ ...bodyTextStyle, color: 'var(--secondary)' }}>
                                    {content.realDimensions}
                                </p>
                            </div>

                            {/* Gotcha */}
                            <div style={{
                                padding: '8px 10px',
                                background: 'var(--bg)',
                                border: '1px solid var(--stroke-dark)',
                                borderRadius: '6px',
                            }}>
                                <p style={{ ...sectionLabelStyle, color: 'var(--ink)' }}>
                                    ⚠ Common gotcha
                                </p>
                                <p style={{ ...bodyTextStyle, color: 'var(--secondary)' }}>
                                    {content.gotcha}
                                </p>
                            </div>

                            {/* PyTorch */}
                            <div>
                                <p style={sectionLabelStyle}>PyTorch equivalent</p>
                                <pre style={{
                                    fontFamily: 'var(--font-mono)',
                                    fontSize: '11px',
                                    color: 'var(--ink)',
                                    background: 'var(--bg-raised)',
                                    border: '1px solid var(--bg-raised)',
                                    borderRadius: '6px',
                                    padding: '8px 10px',
                                    whiteSpace: 'pre-wrap',
                                    wordBreak: 'break-word',
                                    margin: 0,
                                    lineHeight: 1.6,
                                }}>
                                    {content.pytorch}
                                </pre>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// ─── Local styles ──────────────────────────────────────────────────────────

const sectionLabelStyle: React.CSSProperties = {
    fontFamily: 'var(--font-mono)',
    fontSize: '10px',
    color: 'var(--secondary)',
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    fontWeight: 600,
    marginBottom: '4px',
};

const bodyTextStyle: React.CSSProperties = {
    fontSize: '12px',
    color: 'var(--secondary)',
    lineHeight: 1.65,
};
