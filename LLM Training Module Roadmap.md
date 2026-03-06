# AiViz — Module 02: How LLMs Are Trained
## Complete Build Roadmap + Per-Step AI Agent Prompts

---

> **How to use this document**
> This file is your complete build plan for Module 02 of AiViz.
> It is divided into two parts:
>
> - **Part A — The Training Roadmap**: Every step of LLM training from scratch,
>   including traditional paths and modern alternatives introduced by different labs.
>   Read this to understand what you are building.
>
> - **Part B — AI Agent Prompts**: One ready-to-paste prompt per step.
>   Each prompt tells your AI agent exactly what to build, how it should look,
>   and where every design decision must come from.
>
> **Critical rule that applies to every single prompt in this document:**
> All styling must use only token variables from `src/tokens.css`.
> No hardcoded colours, fonts, spacing, or radii anywhere.
> If a new visual value is needed that does not exist in tokens.css, add it
> to tokens.css first, then use it. Never inline it.

---

## GLOBAL DESIGN RULES
## (Read before giving any prompt to an AI agent)

These rules apply to every step, every component, every file in this module.
Paste these at the top of every agent session as a reminder.

```
DESIGN SYSTEM RULES — NON-NEGOTIABLE FOR ALL WORK ON THIS PROJECT

1. TOKENS FIRST
   Every colour, font, size, spacing, radius, shadow, and timing value
   must come from src/tokens.css. Read that file before writing any CSS.
   If a value you need does not exist in tokens.css, add it there first,
   then use the variable. Never hardcode any visual value anywhere.

2. COLOUR
   Greyscale only. No colour anywhere.
   The full palette lives in src/tokens.css under the Palette section.
   Use --ink for highest emphasis, --primary for body, --secondary for
   descriptions, --muted for metadata. Background shifts (--bg-panel,
   --bg-raised) create depth — not colour, not shadows with colour.

3. TYPOGRAPHY
   --font-sans  (Geist) for all headings, body, UI text.
   --font-mono  (Geist Mono) for labels, tags, step numbers, code,
                stats, technical metadata, and anything monospaced.
   No other font. Ever.

4. CONSISTENCY
   This module must look and feel identical to Module 01 (LLM Explainer).
   Same nav, same section structure, same card style, same button style,
   same hover behaviour, same animation timing. A user switching between
   modules should feel zero visual discontinuity.

5. INTERACTIVE BEFORE STATIC
   Every step should have something the user can manipulate, toggle,
   hover, or input. A static diagram is a last resort.

6. NO DECORATION
   No gradients. No coloured glows. No icons used decoratively.
   No shadows with colour tints. The only shadow tokens allowed are
   --shadow-soft and --shadow-lift, both defined in tokens.css.
```

---

# PART A — THE COMPLETE LLM TRAINING ROADMAP

---

## Overview

Training a large language model is a multi-stage pipeline. Each stage
transforms the model in a specific way. The stages below are ordered
as they actually happen — you cannot skip steps or reorder them.

For each stage, this document lists:
- What the stage does
- The traditional approach
- Modern alternatives introduced by different labs
- What the interactive visualization should show

---

## THE FULL PIPELINE AT A GLANCE

```
STAGE 01  →  Data Collection & Curation
STAGE 02  →  Tokenizer Training
STAGE 03  →  Model Architecture Design
STAGE 04  →  Pre-Training (Next Token Prediction)
STAGE 05  →  Evaluation During Training
STAGE 06  →  Supervised Fine-Tuning (SFT)
STAGE 07  →  Alignment
              ├── Traditional: RLHF (Reinforcement Learning from Human Feedback)
              ├── Alternative: DPO (Direct Preference Optimization)
              ├── Alternative: RLAIF (RL from AI Feedback)
              └── Alternative: Constitutional AI (Anthropic)
STAGE 08  →  Evaluation & Benchmarking
STAGE 09  →  Inference Optimization
              ├── Quantization
              ├── Distillation
              └── Speculative Decoding
STAGE 10  →  Deployment
```

---

## STAGE 01 — Data Collection & Curation

### What it is
Before a single weight is initialized, a model needs data.
Modern LLMs train on trillions of tokens scraped from the internet,
books, code, scientific papers, and curated datasets.

### Traditional approach
- Crawl the web (Common Crawl)
- Download books (Books1, Books2, Project Gutenberg)
- Download code (GitHub)
- Download Wikipedia
- Concatenate everything with minimal filtering

### Modern alternatives
- **Quality filtering over quantity** (Phi series — Microsoft):
  Small, heavily curated datasets of "textbook-quality" synthetic data
  outperform massive noisy datasets. Phi-1 trained on 6B tokens and
  matched models trained on 300B+ tokens on coding benchmarks.
- **Deduplication at scale** (C4, RefinedWeb — Falcon):
  Aggressive deduplication significantly improves training efficiency
  and reduces memorization of private data.
- **Data mixing recipes** (LLaMA 2 — Meta):
  Carefully controlled ratios of different data sources tuned per
  downstream capability goal.
- **Synthetic data generation** (Mistral, Yi, Gemini):
  Using existing LLMs to generate training data for the next generation.

### Visualization ideas
- Interactive data source breakdown pie (greyscale segments)
- Slider showing how data mix ratio affects downstream capability
- Before/after deduplication: show duplicate examples side by side
- Token counter showing how many tokens different sources contribute

---

## STAGE 02 — Tokenizer Training

### What it is
Text cannot enter a neural network directly. A tokenizer converts
raw text into integer IDs. The tokenizer is trained separately,
before the main model, and is frozen for the entire model training.

### Traditional approach
- **BPE (Byte Pair Encoding)** — GPT-2, GPT-3, GPT-4, LLaMA
  Starts with individual characters, iteratively merges the most
  frequent adjacent pairs until vocab size is reached.
- Vocab size: typically 32,000 – 100,000 tokens

### Modern alternatives
- **SentencePiece + Unigram LM** (T5, Gemma — Google):
  Probabilistic tokenizer that optimizes the likelihood of a corpus
  under a unigram language model. More principled than BPE.
- **Byte-level BPE** (GPT-2 onwards):
  Operates on raw bytes rather than characters, handles any Unicode
  without unknown tokens.
- **Tiktoken** (OpenAI):
  Faster BPE implementation with cl100k_base (100,277 vocab) used
  in GPT-4, allowing more efficient encoding of non-English text.
- **Character-level** (rare, used in early models):
  Every character is a token. Simple but produces very long sequences.

### Visualization ideas
- Live text input showing tokenization in real time (connect to Module 01)
- Vocabulary browser: show token frequency distribution
- Comparison toggle: same sentence tokenized by BPE vs SentencePiece vs cl100k
- Merge tree visualization for BPE

---

## STAGE 03 — Model Architecture Design

### What it is
Before training, the model's architecture must be defined.
This sets the number of parameters, layers, and attention heads —
decisions that cannot be changed after training begins.

### Traditional approach
- **Original Transformer** (Vaswani et al., 2017):
  Encoder-Decoder architecture for sequence-to-sequence tasks.
- **Decoder-only GPT-style** (most modern LLMs):
  Only the decoder stack. Causal (left-to-right) self-attention.
  Used by GPT, LLaMA, Mistral, Falcon, Claude, Gemini.

### Architecture decisions and alternatives
- **Attention mechanism**:
  - MHA (Multi-Head Attention) — original
  - GQA (Grouped Query Attention) — LLaMA 2/3, Mistral: fewer KV heads,
    faster inference, less memory
  - MQA (Multi-Query Attention) — PaLM: single KV head, even faster
- **Position encoding**:
  - Learned absolute — GPT-2
  - Sinusoidal — original Transformer
  - RoPE (Rotary Position Embedding) — LLaMA, Mistral, Gemma: better
    length generalization
  - ALiBi — MPT: attention bias instead of embedding, no extra params
- **Normalization**:
  - Post-LN (original) — less stable training
  - Pre-LN — GPT-3: more stable, now standard
  - RMSNorm — LLaMA: simpler, faster, no mean subtraction
- **Activation function**:
  - ReLU — original
  - GELU — GPT-2/3
  - SwiGLU — LLaMA, PaLM: gated variant, consistently better
- **Mixture of Experts (MoE)**:
  - Mixtral (Mistral AI): 8 expert FFN layers, only 2 active per token.
    56B total params, 12B active. Dense performance at sparse cost.
  - GPT-4 rumoured to use MoE

### Visualization ideas
- Architecture config panel: sliders for layers, heads, d_model, d_ff
- Live parameter counter updating as sliders move
- Attention type toggle (MHA / GQA / MQA) showing KV cache size change
- MoE diagram showing expert routing for a given token

---

## STAGE 04 — Pre-Training

### What it is
The core training stage. The model learns to predict the next token
in a sequence, processed over trillions of tokens. This is where
most compute is spent — weeks to months on thousands of GPUs.

### Traditional approach
- **Causal Language Modeling (CLM)**:
  Given tokens [t1, t2, ..., tn], predict t_{n+1}.
  Loss = average cross-entropy over all positions.
- Optimizer: AdamW with cosine learning rate schedule and warmup
- Batch size: very large (millions of tokens per step)
- Hardware: thousands of A100/H100 GPUs in parallel

### Modern alternatives & improvements
- **Chinchilla scaling laws** (DeepMind, 2022):
  Showed most models were undertrained. Optimal: equal compute budget
  split between model size and training tokens. Changed how every lab
  sizes their models. LLaMA was built on this insight.
- **FlashAttention** (Dao et al., 2022/2023):
  IO-aware attention algorithm. Same math, 2-4x faster, much less
  memory. Now used by virtually every serious training run.
- **Gradient checkpointing**:
  Trade compute for memory: recompute activations during backward pass
  instead of storing them. Allows larger batch sizes.
- **Mixed precision training** (BF16/FP16 + FP32 master weights):
  Standard practice since GPT-3. BF16 preferred over FP16 for stability.
- **Distributed training strategies**:
  - Data parallelism (simplest)
  - Tensor parallelism (split layers across GPUs)
  - Pipeline parallelism (split layers sequentially)
  - ZeRO (DeepSpeed): shards optimizer states, gradients, parameters
- **Continued pre-training on domain data**:
  Start from a general model, continue training on code/math/medical data.
  More efficient than training from scratch.

### Visualization ideas
- Live loss curve animating during "training" with configurable steps
- Learning rate schedule visualizer (warmup + cosine decay)
- Scaling law calculator: input FLOP budget, output optimal model size
  and token count using Chinchilla formula
- Gradient flow diagram through transformer layers
- Distributed training topology selector (data / tensor / pipeline / ZeRO)

---

## STAGE 05 — Evaluation During Training

### What it is
Training runs are monitored continuously. Multiple metrics are tracked
to detect instabilities, inform learning rate decisions, and decide
when to stop or checkpoint.

### What gets measured
- **Training loss**: primary signal, should decrease smoothly
- **Validation loss**: on a held-out set, tracks generalization
- **Gradient norm**: spikes indicate instability
- **Perplexity**: exp(loss), more interpretable than raw loss
- **Downstream task benchmarks** (every N steps):
  MMLU, HumanEval, HellaSwag, ARC — sampled periodically

### Signs of training problems
- **Loss spike**: sudden increase, often from bad data batch or LR too high
- **Loss plateau**: learning rate too low or model capacity hit
- **Gradient explosion**: norm spikes, often need gradient clipping
- **Loss divergence**: training becomes unstable, run must be restarted

### Visualization ideas
- Dual-axis chart: training loss + validation loss over steps
- Gradient norm chart with threshold line
- Perplexity progress bar
- Benchmark score tracker updating across checkpoints
- Loss spike detector with annotations explaining common causes

---

## STAGE 06 — Supervised Fine-Tuning (SFT)

### What it is
After pre-training, the model knows language but doesn't know how to
follow instructions. SFT teaches it to respond to prompts in a
structured, helpful way using a smaller curated dataset of
(prompt, ideal response) pairs.

### Traditional approach
- Collect 10,000 – 100,000 high-quality prompt/response pairs
- Fine-tune the pre-trained model on this data
- Same CLM objective, but only on response tokens (not the prompt)
- Dataset sources: human-written responses, filtered from existing data

### Modern alternatives
- **FLAN (Instruction tuning at scale)** (Google):
  Fine-tune on hundreds of NLP tasks phrased as instructions.
  Shown to dramatically improve zero-shot performance.
- **Self-Instruct** (Stanford/UW):
  Use the model itself to generate instruction-following examples,
  then filter and fine-tune on them. Bootstrap from a weak model.
- **Alpaca** (Stanford):
  52K instructions generated by GPT-3.5 using Self-Instruct.
  Showed small models could be instruction-tuned cheaply.
- **LoRA (Low-Rank Adaptation)** (Hu et al., 2021):
  Instead of fine-tuning all weights, inject trainable low-rank
  matrices into attention layers. 10,000x fewer trainable params.
  Used by virtually all open-source fine-tuning today.
- **QLoRA** (Dettmers et al., 2023):
  Quantize base model to 4-bit NF4, add LoRA adapters in BF16.
  Fine-tune a 65B model on a single 48GB GPU. Game-changing.

### Visualization ideas
- Dataset explorer: browse sample prompt/response pairs
- SFT loss curve vs pre-training loss curve comparison
- LoRA rank visualizer: show how low-rank matrices approximate full weight update
- Parameter count comparison: full fine-tune vs LoRA vs QLoRA
- Response quality before/after SFT for the same prompt

---

## STAGE 07A — Alignment: RLHF (Traditional)

### What it is
Reinforcement Learning from Human Feedback. The model learns to produce
responses that humans prefer. Introduced in InstructGPT (OpenAI, 2022)
and used in GPT-4, Claude 1/2, and many others.

### The three-step RLHF process
1. **Reward model training**:
   Collect pairs of model responses. Human annotators rank them.
   Train a reward model to predict human preference scores.
2. **RL fine-tuning with PPO**:
   Use Proximal Policy Optimization to fine-tune the SFT model.
   The reward model scores each response; PPO maximizes that score.
3. **KL divergence penalty**:
   Penalize the model for drifting too far from the SFT model.
   Prevents reward hacking (finding degenerate high-reward outputs).

### Problems with RLHF
- Reward model can be gamed (reward hacking)
- PPO is unstable and sensitive to hyperparameters
- Requires running two large models simultaneously (policy + reward)
- Human annotation is expensive and inconsistent
- Difficult to scale

### Visualization ideas
- Three-stage flow diagram: SFT model → reward model training → PPO loop
- Human preference annotation simulator: rank two responses
- Reward score distribution before and after RL
- KL divergence penalty curve showing policy drift constraint
- PPO loss components breakdown

---

## STAGE 07B — Alignment: DPO (Modern Alternative)

### What it is
Direct Preference Optimization (Rafailov et al., 2023).
Achieves the same alignment goal as RLHF without a reward model
or RL training loop. Instead, directly optimizes the policy on
preference pairs. Now used by LLaMA 3, Mistral, Zephyr, and many others.

### How it differs from RLHF
- No separate reward model needed
- No PPO, no RL loop
- One training objective directly on the (prompt, chosen, rejected) triplet
- Mathematically equivalent to RLHF under certain assumptions
- Significantly simpler, more stable, cheaper to run

### DPO loss intuition
Increase the log probability of chosen responses.
Decrease the log probability of rejected responses.
Weighted by how much the model currently prefers one over the other.

### Modern variants of DPO
- **IPO (Identity Preference Optimization)**: fixes overfitting issues in DPO
- **KTO (Kahneman-Tversky Optimization)** (Ethayarajh et al., 2023):
  Does not require paired preferences — only (prompt, response, label:good/bad).
  More data efficient than DPO.
- **ORPO** (Hong et al., 2024):
  Combines SFT and alignment into a single training stage.
  No separate SFT step needed. Faster and simpler.
- **SimPO** (Meng et al., 2024):
  Reference-free DPO variant. No base model needed during training.

### Visualization ideas
- Side-by-side: RLHF pipeline vs DPO pipeline — show how many fewer
  components DPO needs
- DPO loss surface: show how chosen/rejected log probs move during training
- Dataset format viewer: (prompt, chosen, rejected) triplets
- Variant comparison table: RLHF vs DPO vs KTO vs ORPO vs SimPO

---

## STAGE 07C — Alignment: Constitutional AI (Anthropic)

### What it is
Constitutional AI (Bai et al., 2022) — Anthropic's alignment method.
Instead of human preference labels, a set of written principles
(a "constitution") guides the model to critique and revise its own outputs.

### The two-phase process
1. **SL-CAI (Supervised Learning CAI)**:
   - Generate responses to harmful prompts
   - Have the model critique its own responses against the constitution
   - Have the model revise the response based on the critique
   - Fine-tune on the revised responses
2. **RL-CAI (RL with AI Feedback)**:
   - Generate response pairs
   - Use the model itself (not humans) to label which response better
     follows the constitution
   - Train a preference model on these AI-generated labels
   - Run RLHF with this AI-generated reward model

### Why it matters
- Reduces dependence on human labelling at scale
- Makes alignment criteria explicit and auditable
- Shows the model can reason about its own outputs
- Foundation for Claude's training methodology

### Visualization ideas
- Constitution principle list with interactive critique example
- Critique → revision loop for a sample harmful prompt
- CAI vs standard RLHF: data source comparison
- Self-critique chain: show 3 rounds of revision for one response

---

## STAGE 07D — Alignment: RLAIF (Alternative)

### What it is
Reinforcement Learning from AI Feedback (Lee et al., 2023 — Google).
Uses an LLM (often a larger, more capable one) to generate preference
labels instead of humans. Similar to Constitutional AI but more general.

### How it works
- Generate response pairs from the policy model
- Ask a "judge" LLM to score which response is better
- Use these scores to train a reward model
- Run PPO as in standard RLHF

### Advantages over RLHF
- No human annotation cost
- Scales as LLM quality improves
- Can be run continuously as models improve

### Limitations
- AI judge can have its own biases and blind spots
- Judge model quality ceiling limits alignment quality
- Less transparent than Constitutional AI

---

## STAGE 08 — Evaluation & Benchmarking

### What it is
After alignment, the model is evaluated systematically across
a standard suite of benchmarks before release. This stage
overlaps with Module 03 (Benchmarks) of AiViz.

### Key benchmarks
- **MMLU** (Massive Multitask Language Understanding):
  57 subjects, multiple choice. Tests broad knowledge.
- **HumanEval**: 164 Python coding problems. Tests functional correctness.
- **MATH**: 12,500 competition math problems. Tests reasoning.
- **GPQA**: Graduate-level science questions. Tests deep expertise.
- **MT-Bench**: Multi-turn conversation quality. GPT-4 as judge.
- **TruthfulQA**: Tests whether model avoids common human falsehoods.
- **BIG-Bench Hard**: Tasks that previous LLMs consistently failed.

### Visualization ideas
- Radar chart showing model scores across all benchmarks (greyscale)
- Benchmark drill-down: click a benchmark to see example questions
- Score history: how the same benchmark scores changed across model versions
- Score vs compute plot: efficiency of different model families

---

## STAGE 09 — Inference Optimization

### What it is
A trained model is often too large and slow for production deployment.
Inference optimization reduces memory footprint and increases throughput
without (significantly) degrading quality.

### Quantization
Reduce the precision of model weights:
- **FP32** → **FP16/BF16**: Standard. Minimal quality loss.
- **INT8** (LLM.int8() — Bitsandbytes): 2x memory reduction.
- **INT4 / NF4** (GPTQ, AWQ, QLoRA): 4x memory reduction.
  A 70B model fits on 2x RTX 3090 instead of 8x A100.
- **GGUF** (llama.cpp): CPU-friendly quantization format.
  Runs 7B models on a MacBook.

### Knowledge Distillation
Train a smaller "student" model to mimic a larger "teacher" model:
- Student matches teacher's output distribution, not just hard labels
- DistilBERT: 40% smaller, 60% faster, retains 97% of BERT performance
- TinyLLaMA: 1.1B params trained on 3T tokens, mimicking LLaMA 2

### Speculative Decoding
Use a small "draft" model to propose multiple tokens at once.
The large "verifier" model checks them in parallel.
Accepted tokens are free — significant speedup with identical output.
Used in Gemini and internally at many labs.

### Other techniques
- **KV Cache**: Store computed key/value pairs, avoid recomputation
- **Continuous batching**: Process multiple requests without padding waste
- **PagedAttention** (vLLM): Virtual memory management for KV cache

### Visualization ideas
- Weight precision slider: FP32 → INT4, show memory and quality change
- Distillation diagram: teacher output distribution vs student learning
- Speculative decoding animation: draft tokens, verify, accept/reject
- Throughput comparison bar chart across optimization methods

---

## STAGE 10 — Deployment

### What it is
The final stage. The optimized model is served to users.
Deployment involves infrastructure decisions that affect latency,
throughput, cost, and reliability.

### Key concepts
- **Inference servers**: vLLM, TGI (HuggingFace), TensorRT-LLM (NVIDIA)
- **Context window management**: KV cache limits max context
- **Load balancing**: distributing requests across model replicas
- **Streaming**: returning tokens as they are generated (not waiting for full response)
- **Safety layers**: output filtering, prompt injection detection

---

# PART B — AI AGENT PROMPTS

---

> **Instructions for use:**
> Each prompt below is self-contained. Paste it directly into your AI agent
> along with the current codebase. The agent will build that specific step.
> Complete them in order — later steps may depend on components from earlier ones.

---

## PROMPT 00 — MODULE SHELL & ROUTING

*Run this first. Creates the module scaffold before any step is built.*

```
You are building Module 02 of AiViz — "How LLMs Are Trained."

This prompt creates the shell: routing, page layout, navigation state,
and the step-by-step progress structure. No content yet — just the scaffold.

════════════════════════════════════════════════════════
DESIGN RULES — READ BEFORE WRITING ANY CODE
════════════════════════════════════════════════════════

All styling must come from src/tokens.css. Read that file completely
before writing a single CSS property. No hardcoded values anywhere.
No colour anywhere except greyscale values defined in tokens.css.
Font: --font-sans for all UI. --font-mono for labels, step numbers,
tags, metadata, code. Identical visual language to Module 01.

════════════════════════════════════════════════════════
WHAT TO BUILD
════════════════════════════════════════════════════════

1. Create src/pages/Training.tsx (or wherever routing points for /training)

2. Create a route in the router for /training pointing to this page.

3. The page layout has two zones:
   LEFT SIDEBAR (240px wide, fixed on desktop):
     - Module title: "How LLMs Are Trained"
       font-mono, var(--text-xs), var(--muted), uppercase, tracking-wider
     - Vertical list of all 10 steps as nav items:
         01  Data Collection
         02  Tokenizer Training
         03  Architecture Design
         04  Pre-Training
         05  Training Evaluation
         06  Supervised Fine-Tuning
         07  Alignment
         08  Benchmarking
         09  Inference Optimization
         10  Deployment
     - Active step: bg var(--bg-raised), color var(--ink),
       weight var(--weight-medium), left border 2px solid var(--ink)
     - Inactive steps: color var(--secondary), no border
     - font-mono, var(--text-xs), padding var(--s3) var(--s4)
     - Sidebar bg: var(--bg-panel), border-right: 1px solid var(--stroke)
     - On mobile: sidebar collapses to a horizontal scrollable pill row
       at the top of the content area

   MAIN CONTENT AREA (flex: 1):
     - Shows the currently active step component
     - Padding: var(--s7) var(--s6)
     - Background: var(--bg)
     - On step change: content fades out (opacity 1→0, 80ms) then
       new content fades in (opacity 0→1, 200ms, translateY 10px→0)

4. Step state management:
     - activeStep: number (0–9), stored in React state or URL param
     - Clicking a sidebar item sets activeStep
     - Keyboard: left/right arrow keys navigate between steps
     - Each step component receives: stepNumber, totalSteps, onNext, onPrev

5. Navigation integration:
     Update the main nav (already exists) so "Training" link is active
     when on /training. Remove the "soon" badge from Training nav item.
     Do not change any other nav item.

6. Step footer (inside main content area, bottom):
     Left:  "← Previous" button (if not first step)
     Center: "Step N of 10" — font-mono, var(--text-xs), var(--muted)
     Right: "Next →" button (if not last step)
     Button style: outline button from tokens.css conventions
     Border-top: 1px solid var(--stroke), padding-top var(--s5),
     margin-top var(--s7)

════════════════════════════════════════════════════════
DO NOT BUILD YET
════════════════════════════════════════════════════════

Do not build any step content components yet.
Each step has its own prompt. For now, render a placeholder
for each step that just shows the step number and name.

Placeholder style:
  font-mono, var(--text-sm), var(--muted), centered in content area.
  "Step 01 — Data Collection — content coming soon"

════════════════════════════════════════════════════════
CHANGELOG FORMAT
════════════════════════════════════════════════════════

When done, list:
  CREATED:   [files created]
  MODIFIED:  [files changed and why]
  NOT TOUCHED: [simulation files left alone]
```

---

## PROMPT 01 — STEP 01: DATA COLLECTION & CURATION

```
You are building Step 01 of Module 02 (Training) in AiViz.
Step name: "Data Collection & Curation"

════════════════════════════════════════════════════════
DESIGN RULES
════════════════════════════════════════════════════════

All styling from src/tokens.css only. No hardcoded values.
Greyscale only. --font-sans for UI, --font-mono for labels/code/stats.
Match the visual language of Module 01 exactly.
If you need a new token value, add it to src/tokens.css first.

════════════════════════════════════════════════════════
WHAT TO BUILD
════════════════════════════════════════════════════════

Create: src/components/training/Step01DataCollection.tsx

This component teaches how training data is collected and curated.

── SECTION 1: OVERVIEW ──────────────────────────────────

Section label (mono): "STEP 01 — DATA COLLECTION"
Headline: "Before a single weight is updated, a model needs data."
Body text (2–3 sentences explaining Common Crawl, books, code, Wikipedia).
font-sans, var(--text-sm), var(--weight-light), var(--secondary),
var(--lead-body)

── SECTION 2: INTERACTIVE DATA MIX VISUALIZATION ────────

This is the main interactive element. Show a horizontal stacked
bar representing the data mix for a typical large LLM.

Default data sources and approximate percentages:
  Web (Common Crawl)    67%
  Books                 15%
  Code (GitHub)         8%
  Wikipedia             4%
  Scientific papers     3%
  Other curated         3%

Visual:
  Single horizontal bar, full width of content area, height 48px
  Each segment is a different shade of grey:
    Web:        var(--ink)
    Books:      var(--primary)
    Code:       #444444   (add to tokens.css as --grey-700)
    Wikipedia:  var(--secondary)
    Papers:     var(--muted)
    Other:      var(--stroke-dark)
  Border-radius: var(--r-sm) on left edge of first, right edge of last
  On hover over each segment: show a tooltip with source name
  and percentage. Tooltip style: bg var(--bg-panel), border 1px solid
  var(--stroke-dark), border-radius var(--r-md), padding var(--s3) var(--s4),
  font-mono, var(--text-xs), var(--primary)

Below the bar: legend row
  Each legend item: coloured square (12x12px) + source name + percentage
  font-mono, var(--text-xs), var(--secondary)
  Layout: flex, flex-wrap, gap var(--s5)

── SECTION 3: DATA QUALITY APPROACHES ──────────────────

Show 4 cards in a 2×2 grid representing different philosophies:

  Card 1: "Quantity First"
    Used by: GPT-3, early LLaMA
    "Maximize tokens. Minimal filtering. The model will figure it out."
    Tag: "Traditional"

  Card 2: "Quality Filtering"
    Used by: RefinedWeb (Falcon), C4
    "Aggressive deduplication and perplexity-based filtering.
     Less data, better data."
    Tag: "Improved"

  Card 3: "Textbook Quality"
    Used by: Phi-1, Phi-2 (Microsoft)
    "Synthetic 'textbook-quality' data. 6B tokens outperform
     models trained on 300B+ noisy tokens."
    Tag: "Alternative"

  Card 4: "Synthetic Data"
    Used by: Gemini, Yi, Mistral
    "Generate training data using existing LLMs. Bootstrap
     the next generation from the current one."
    Tag: "Modern"

Card style: bg var(--bg-panel), border-radius var(--r-lg),
padding var(--s5), no border
Tag style: font-mono, var(--text-2xs), var(--muted), bg var(--bg-raised),
border-radius var(--r-pill), padding 2px 8px
Heading: var(--text-base), var(--weight-semibold), var(--ink)
"Used by" line: font-mono, var(--text-xs), var(--muted)
Body: var(--text-sm), var(--weight-light), var(--secondary)

── SECTION 4: DEDUPLICATION DEMO ───────────────────────

Show two text blocks side by side:
  Left block: "Raw data — contains duplicates"
    Show 6–8 lines of text where some lines are duplicated
    (use realistic-looking but fake web text)
    Duplicate lines highlighted with bg var(--bg-raised)
    and a small "DUPLICATE" mono badge
  Right block: "After deduplication"
    Same list with duplicates removed
    Lines appear in sequence, no highlights

A button between them: "Run Deduplication →"
On click: animate lines from left disappearing and right block populating
Button: outline style from tokens.css conventions

Below: one stat chip row:
  [ CommonCrawl: 3.3T tokens raw ]
  [ After dedup: ~900B tokens ]
  [ 73% reduction ]
Chip style: font-mono, var(--text-xs), bg var(--bg-panel),
border 1px solid var(--stroke), border-radius var(--r-pill),
padding var(--s2) var(--s5)

════════════════════════════════════════════════════════
TOKENS TO ADD (if not already in src/tokens.css)
════════════════════════════════════════════════════════

Add these to src/tokens.css under a "Grey Scale Extended" comment:
  --grey-900: #111111;
  --grey-800: #1f1f1f;
  --grey-700: #444444;
  --grey-600: #555555;
  --grey-400: #aaaaaa;
  --grey-300: #cccccc;
  --grey-200: #dddddd;
  --grey-100: #eeeeee;

Use these for multi-segment charts and visualizations where
you need more than the 8 base palette tokens.

════════════════════════════════════════════════════════
REGISTER THE COMPONENT
════════════════════════════════════════════════════════

Replace the Step 01 placeholder in Training.tsx with this component.
```

---

## PROMPT 02 — STEP 02: TOKENIZER TRAINING

```
You are building Step 02 of Module 02 (Training) in AiViz.
Step name: "Tokenizer Training"

════════════════════════════════════════════════════════
DESIGN RULES
════════════════════════════════════════════════════════

All styling from src/tokens.css only. No hardcoded values.
Greyscale only. --font-sans for UI, --font-mono for tokens/code/stats.
Visually identical language to all other steps in this module.
If you need a new token, add to src/tokens.css first.

════════════════════════════════════════════════════════
WHAT TO BUILD
════════════════════════════════════════════════════════

Create: src/components/training/Step02Tokenizer.tsx

── SECTION 1: OVERVIEW ──────────────────────────────────

Section label (mono): "STEP 02 — TOKENIZER TRAINING"
Headline: "Text can't enter a neural network. Tokens can."
Body: explain that the tokenizer is trained before the main model
and frozen for the entire training run. 2–3 sentences.

── SECTION 2: LIVE BPE MERGE VISUALIZER ─────────────────

This is the main interactive. Animate the BPE algorithm on a
short example string.

Starting string: "lowest lower newest"
Display it as individual characters, each in a mono pill:
  [ l ][ o ][ w ][ e ][ s ][ t ] ... etc.

Show a "Step through merges" button.
On each click, highlight the most frequent adjacent pair in
var(--ink) background + var(--text-inverse) text, then merge
them into a single pill.

Show a panel below: "Merge history"
  Each merge rule listed as: "e + s → es  (frequency: 8)"
  font-mono, var(--text-xs), var(--secondary)

Show a counter: "Vocabulary size: 27 → 28 → ..." updating each merge.

After all merges done, show final token pills for the original string
with the actual tokens highlighted in different grey intensities.

── SECTION 3: ALGORITHM COMPARISON ──────────────────────

Three-column layout, one column per algorithm:

  BPE (Byte Pair Encoding)
    Used by: GPT-2, GPT-3, GPT-4, LLaMA
    "Iteratively merge the most frequent adjacent byte pair."
    Complexity: O(n²) per merge step
    Tag: "Most common"

  SentencePiece + Unigram LM
    Used by: T5, Gemma, XLNet (Google)
    "Probabilistic model. Optimizes corpus likelihood.
     Handles any language without pre-tokenization."
    Tag: "Google standard"

  Tiktoken (cl100k)
    Used by: GPT-4, Claude (similar)
    "BPE on bytes. 100,277 vocab. Efficient multilingual encoding.
     Unknown tokens are impossible."
    Tag: "OpenAI"

Same card style as Step 01. Use "Used by" mono label above heading.

── SECTION 4: TOKENIZER COMPARISON TOOL ────────────────

Input: textarea (same style as Module 01 tokenizer input)
Placeholder: "Type text to compare tokenizations…"
Vocab selector: three toggle pills — "BPE-32k" / "cl100k" / "SentencePiece"
Simulated output: show the same text tokenized differently
(approximate — show visually different chunking even if not exact)

Display tokens as mono pills (same style as Module 01).
Below each tokenization: token count + chars/token ratio.
Show which is more efficient for the entered text.

Note below: "This is a simplified simulation. Actual tokenization
requires the full trained vocabulary file."
font-mono, var(--text-xs), var(--muted)

════════════════════════════════════════════════════════
REGISTER THE COMPONENT
════════════════════════════════════════════════════════

Replace the Step 02 placeholder in Training.tsx with this component.
```

---

## PROMPT 03 — STEP 03: ARCHITECTURE DESIGN

```
You are building Step 03 of Module 02 (Training) in AiViz.
Step name: "Architecture Design"

════════════════════════════════════════════════════════
DESIGN RULES
════════════════════════════════════════════════════════

All styling from src/tokens.css only. No hardcoded values.
Greyscale only. --font-sans for UI, --font-mono for labels/numbers.
Match the visual language of all other training steps exactly.

════════════════════════════════════════════════════════
WHAT TO BUILD
════════════════════════════════════════════════════════

Create: src/components/training/Step03Architecture.tsx

── SECTION 1: OVERVIEW ──────────────────────────────────

Section label: "STEP 03 — ARCHITECTURE DESIGN"
Headline: "Every parameter is a decision. Decisions made here can't be undone."
Body: 2–3 sentences. Architecture is fixed before training. Changing it
means starting over. This is the most expensive mistake you can make.

── SECTION 2: INTERACTIVE ARCHITECTURE CONFIGURATOR ─────

This is the main interactive. An architecture config panel.

Left side: sliders/selectors for:
  - Number of layers (n_layers): 12 to 96, step 12
  - Model dimension (d_model): 512, 1024, 2048, 4096, 8192
  - Attention heads (n_heads): 8, 16, 32, 64
  - FFN dimension (d_ff): auto-calculated as 4 × d_model (show as read-only)
  - Attention type: toggle — MHA / GQA / MQA
    (GQA: shows "KV heads" sub-selector appearing when GQA selected)
  - Positional encoding: dropdown — RoPE / ALiBi / Learned / Sinusoidal
  - Normalization: toggle — Pre-LN (RMSNorm) / Post-LN / RMSNorm
  - Activation: toggle — SwiGLU / GELU / ReLU

Right side: live stats panel updating as sliders move:
  Total parameters:        [calculated and displayed with B/M suffix]
  Attention parameters:    [calculated]
  FFN parameters:          [calculated]
  KV Cache per token:      [in MB, calculated from d_model and n_heads]
  Context memory (4k tok): [in GB]
  Approx. training FLOPs:  [rough order of magnitude]

  All stats: font-mono, var(--text-sm), var(--ink)
  Labels: font-mono, var(--text-xs), var(--muted)
  Live badge: "● live" in top right of stats panel

Below stats: "Similar to:" — show which real model the config resembles
based on parameter count and architecture choices.
Examples: "Similar to GPT-2 (117M)" or "Similar to LLaMA 7B"
font-mono, var(--text-xs), var(--secondary)

Slider/control style:
  Labels: font-mono, var(--text-xs), var(--muted), uppercase
  Values: font-mono, var(--text-sm), var(--ink), var(--weight-medium)
  Slider track: bg var(--stroke), height 2px, border-radius var(--r-pill)
  Slider thumb: bg var(--ink), 14px circle, no border
  Toggle pills: same style as Step 01 approach cards but smaller

── SECTION 3: ATTENTION TYPE EXPLAINER ──────────────────

Three cards: MHA / GQA / MQA
Each shows a simple diagram (built in SVG, greyscale only):
  Q heads:  circles in a row
  K heads:  circles below, with lines showing which Q attends to which K
  V heads:  same as K

  MHA: 8Q → 8K → 8V (full)
  GQA: 8Q → 2K → 2V (grouped, 4 Q per KV group)
  MQA: 8Q → 1K → 1V (single KV)

Below diagram: "KV cache size:" + relative comparison
  MHA: ████████ 100%
  GQA: ██       25%
  MQA: █        12.5%
  Bars: bg var(--ink), bg var(--bg-raised) for remainder

Used by line: font-mono, var(--text-xs), var(--muted)

── SECTION 4: ARCHITECTURE CHOICES TIMELINE ─────────────

A simple vertical timeline showing how architecture choices
evolved across major models:

  2017  Original Transformer  Post-LN, MHA, Sinusoidal, GELU
  2019  GPT-2                 Pre-LN, MHA, Learned, GELU
  2020  GPT-3                 Pre-LN, MHA, Learned, GELU (175B)
  2022  PaLM                  Pre-LN, MQA, RoPE, SwiGLU
  2023  LLaMA                 Pre-LN, MHA→GQA, RoPE, SwiGLU, RMSNorm
  2023  Mistral               Pre-LN, GQA, RoPE, SwiGLU, Sliding Window
  2024  LLaMA 3               Pre-LN, GQA, RoPE, SwiGLU, 128k vocab

Timeline line: 1px solid var(--stroke), vertical
Each node: 8px circle, bg var(--ink)
Year: font-mono, var(--text-xs), var(--muted)
Model name: font-sans, var(--text-sm), var(--weight-medium), var(--ink)
Details: font-mono, var(--text-xs), var(--secondary)

════════════════════════════════════════════════════════
REGISTER THE COMPONENT
════════════════════════════════════════════════════════

Replace the Step 03 placeholder in Training.tsx with this component.
```

---

## PROMPT 04 — STEP 04: PRE-TRAINING

```
You are building Step 04 of Module 02 (Training) in AiViz.
Step name: "Pre-Training"

════════════════════════════════════════════════════════
DESIGN RULES
════════════════════════════════════════════════════════

All styling from src/tokens.css only. No hardcoded values.
Greyscale only. No colour anywhere. --font-sans for UI,
--font-mono for all numbers, labels, code, stats.
Match the visual language of all other training steps exactly.

════════════════════════════════════════════════════════
WHAT TO BUILD
════════════════════════════════════════════════════════

Create: src/components/training/Step04PreTraining.tsx

── SECTION 1: OVERVIEW ──────────────────────────────────

Label: "STEP 04 — PRE-TRAINING"
Headline: "Trillions of tokens. Weeks of compute. One objective: predict the next token."
Body: 2–3 sentences. CLM objective, cross-entropy loss, scale.

── SECTION 2: ANIMATED LOSS CURVE ───────────────────────

A line chart showing a typical pre-training loss curve.
Built with SVG or a lightweight canvas. No external chart libraries.

Chart area: full width, 220px height
bg var(--bg-panel), border-radius var(--r-lg), padding var(--s5)

X-axis: Training steps (0 to 100k), labeled in 20k increments
Y-axis: Loss (0 to 4.0), labeled in 0.5 increments
Axis lines: 1px var(--stroke)
Axis labels: font-mono, var(--text-xs), var(--muted)
Grid lines: 1px var(--stroke), dashed

Loss curve line: stroke var(--ink), stroke-width 2, no fill
  Starts at ~3.8, curves down following roughly: 4 × e^(-0.00003x) + 0.8
  Add subtle realistic noise

Validation loss: stroke var(--stroke-dark), stroke-width 1.5, dashed

Controls below chart:
  "▶ Animate" button — animates the curve drawing from left to right
  Speed toggle: "1×" / "5×" / "20×"
  Reset button: "↺"
  Button style: outline style from tokens.css conventions

Annotation markers on the curve (appear at correct x positions):
  At step ~5,000:   "Initial fast descent"
  At step ~30,000:  "Learning rate warmup complete"
  At step ~70,000:  "Cosine decay begins"
  Annotation style: font-mono, var(--text-xs), var(--muted),
  small vertical line from point to label

── SECTION 3: SCALING LAWS CALCULATOR ───────────────────

Title: "Chinchilla Optimal Compute Allocation"
Subtitle: "Given a compute budget, find the optimal model size and token count."

Input: a single slider "Compute Budget (FLOPs)"
  Range: 1e18 to 1e24 (displayed as: "1 ExaFLOP" to "1 ZettaFLOP")
  Show current value as formatted string: "6×10²³ FLOPs"

Output (updates live):
  Optimal model parameters:  "6.7B"
  Optimal training tokens:   "133B"
  Chinchilla ratio:          "~20 tokens per parameter"
  Estimated GPU-days (A100): calculated value

All outputs: font-mono, var(--text-xl), var(--weight-semibold), var(--ink)
Labels: font-mono, var(--text-xs), var(--muted)
Output cards: 2×2 grid, bg var(--bg-panel), border-radius var(--r-lg),
padding var(--s5)

Note: "Based on Hoffmann et al. 2022 (Chinchilla). Formula: N_opt = 0.5 × (C/6)^0.5"
font-mono, var(--text-xs), var(--muted)

── SECTION 4: OPTIMIZATION TECHNIQUES ──────────────────

A horizontal tab row (not cards): FlashAttention / Mixed Precision / ZeRO / Gradient Checkpointing
Tab style: font-mono, var(--text-xs), padding var(--s2) var(--s4)
Active: bg var(--ink), color var(--text-inverse), border-radius var(--r-sm)
Inactive: color var(--secondary)

Each tab reveals a short explanation panel (2–3 sentences) + one key stat:
  FlashAttention:           "2–4× faster attention. Same math."     Stat: "2–4× speedup"
  Mixed Precision (BF16):   "Half memory. Negligible quality loss."  Stat: "2× memory reduction"
  ZeRO Stage 3:             "Shard everything across GPUs."         Stat: "Linear memory scaling"
  Gradient Checkpointing:   "Recompute activations. Trade time for memory." Stat: "60–70% memory reduction"

Panel: bg var(--bg-panel), border-radius var(--r-lg), padding var(--s5)
Stat: font-mono, var(--text-2xl), var(--weight-semibold), var(--ink)
Body: var(--text-sm), var(--weight-light), var(--secondary)

════════════════════════════════════════════════════════
REGISTER THE COMPONENT
════════════════════════════════════════════════════════

Replace the Step 04 placeholder in Training.tsx with this component.
```

---

## PROMPT 05 — STEP 05: TRAINING EVALUATION

```
You are building Step 05 of Module 02 (Training) in AiViz.
Step name: "Evaluation During Training"

════════════════════════════════════════════════════════
DESIGN RULES
════════════════════════════════════════════════════════

All styling from src/tokens.css only. No hardcoded values.
Greyscale only. --font-sans for UI, --font-mono for all metrics/numbers.
Consistent with all other training steps.

════════════════════════════════════════════════════════
WHAT TO BUILD
════════════════════════════════════════════════════════

Create: src/components/training/Step05Evaluation.tsx

── SECTION 1: OVERVIEW ──────────────────────────────────

Label: "STEP 05 — EVALUATION DURING TRAINING"
Headline: "Training isn't a black box. Every step is measured."
Body: Explain that training runs are monitored in real time.
Multiple signals determine whether training is healthy or needs intervention.

── SECTION 2: LIVE TRAINING DASHBOARD ───────────────────

A simulated training monitor dashboard. Four metric panels in a 2×2 grid.
A "▶ Simulate training run" button starts the simulation.
All values update every 500ms with realistic pre-computed trajectories.

Panel 1: Training Loss
  Large number: e.g. "2.847" updating each tick
  Mini sparkline chart below (last 20 values)
  Line: stroke var(--ink), stroke-width 1.5
  Trend indicator: ↓ green replaced with → grey arrow token
    Use: ↓ var(--ink) when decreasing, — var(--muted) when flat

Panel 2: Gradient Norm
  Large number: e.g. "0.423"
  Threshold line shown on mini chart at 1.0 (dashed, var(--stroke-dark))
  If norm exceeds threshold: panel bg shifts to var(--bg-raised),
  a mono badge appears: "CLIPPING ACTIVE"

Panel 3: Perplexity
  Large number: e.g. "17.3"
  Formula note: "exp(loss)" — font-mono, var(--text-xs), var(--muted)
  Mini sparkline

Panel 4: Validation Loss
  Large number: e.g. "3.012"
  Gap indicator: "Δ +0.165 vs train" — font-mono, var(--text-xs), var(--muted)
  When gap is large: show "possible overfitting" mono badge

Panel style:
  bg var(--bg-panel), border-radius var(--r-lg), padding var(--s5)
  Large number: font-mono, var(--text-3xl), var(--weight-semibold), var(--ink)
  Panel title: font-mono, var(--text-xs), var(--muted), uppercase, tracking-wider

── SECTION 3: ANOMALY DETECTOR ──────────────────────────

Title: "Common Training Failures"
Subtitle: "Click each to see what it looks like on the loss curve."

Four failure mode buttons in a row:
  "Loss Spike"  |  "Loss Plateau"  |  "Gradient Explosion"  |  "Divergence"

On click: show the corresponding annotated loss curve below (SVG chart,
same style as Step 04 loss chart), with the failure pattern highlighted
using a dashed box annotation and a short explanation.

  Loss Spike:         Sudden upward jump at one step, then recovery
                      Cause: "Bad data batch or learning rate too high"
  Loss Plateau:       Flat line for many steps
                      Cause: "LR too low, or model at capacity"
  Gradient Explosion: Spike to very high loss (near 4.0), no recovery
                      Cause: "LR too high, clip threshold too permissive"
  Divergence:         Loss goes to NaN / Inf, line disappears
                      Cause: "Numerical instability, usually BF16 overflow"

Cause text: font-mono, var(--text-xs), var(--secondary)
Buttons: outline style, mono font, active: bg var(--ink), color var(--text-inverse)

════════════════════════════════════════════════════════
REGISTER THE COMPONENT
════════════════════════════════════════════════════════

Replace the Step 05 placeholder in Training.tsx with this component.
```

---

## PROMPT 06 — STEP 06: SUPERVISED FINE-TUNING

```
You are building Step 06 of Module 02 (Training) in AiViz.
Step name: "Supervised Fine-Tuning (SFT)"

════════════════════════════════════════════════════════
DESIGN RULES
════════════════════════════════════════════════════════

All styling from src/tokens.css only. No hardcoded values.
Greyscale only. Consistent with all training steps.

════════════════════════════════════════════════════════
WHAT TO BUILD
════════════════════════════════════════════════════════

Create: src/components/training/Step06SFT.tsx

── SECTION 1: OVERVIEW ──────────────────────────────────

Label: "STEP 06 — SUPERVISED FINE-TUNING"
Headline: "A pre-trained model knows language. SFT teaches it to follow instructions."
Body: After pre-training, the model predicts text but doesn't respond helpfully
to prompts. SFT trains it on curated prompt/response pairs. 2–3 sentences.

── SECTION 2: DATASET EXPLORER ──────────────────────────

Show a paginated list of 8 sample (prompt, response) pairs.
Use realistic but fake training examples — avoid copyrighted content.

Each row:
  Left: "Prompt" label (mono, muted) + prompt text in a light panel
  Right: "Response" label (mono, muted) + response text in a light panel
  Both panels: bg var(--bg-panel), border-radius var(--r-md), padding var(--s4)
  Prompt text: var(--text-sm), var(--primary)
  Response text: var(--text-sm), var(--secondary), var(--weight-light)
  Below: token count for each — font-mono, var(--text-xs), var(--muted)
  Row separator: 1px var(--stroke)

Pagination: "← 1 / 8 →", font-mono, var(--text-xs), centered below list

Example prompts (write realistic equivalents):
  "Explain recursion in Python to a beginner."
  "What is the capital of New Zealand?"
  "Write a haiku about machine learning."
  "Summarize the following paragraph: [paragraph text]"
  ...and 4 more

── SECTION 3: SFT vs PRE-TRAINING OBJECTIVE ────────────

Side-by-side comparison:

  Pre-training CLM:
    Input: "The cat sat on the"
    Target: predict ALL next tokens (loss on full sequence)
    Loss applied to: [highlighted in var(--bg-raised)] every token

  SFT Fine-tuning:
    Input: "[INST] What is a cat? [/INST]"
    Response: "A cat is a small domesticated feline..."
    Loss applied to: [highlighted in var(--ink) + var(--text-inverse)]
                     response tokens only — not the prompt tokens

Show this visually as a token sequence with colour-coded (greyscale)
regions: prompt tokens (dim, var(--stroke-dark) border), 
response tokens (dark, var(--ink) bg + var(--text-inverse) text).
Label below: "Gradients only flow through response tokens."
font-mono, var(--text-xs), var(--muted)

── SECTION 4: LORA EXPLAINER ────────────────────────────

Title: "LoRA — Fine-tune with 0.01% of the parameters"
Body (2 sentences): Instead of updating all weights, LoRA injects small
trainable matrices into attention layers. The original weights are frozen.

Visual diagram (SVG, greyscale):
  Full weight matrix W (large grey rectangle, 8×8 dots grid)
  Arrow: "frozen"
  Plus sign
  Two thin rectangles: A (8×2) and B (2×8) — filled with var(--ink)
  Arrow: "trainable"
  Equals sign
  W + AB (result rectangle, same size as W)

Below diagram:
  Rank selector: "Rank r =" with toggle: 4 / 8 / 16 / 32 / 64
  Updates live:
    Trainable params: "8,192" (changes with rank)
    Original params:  "65,536"
    Compression:      "87.5% reduction"

All in font-mono, var(--text-sm), var(--ink) for numbers,
var(--text-xs), var(--muted) for labels.

Sub-section: QLoRA one-liner
"QLoRA extends LoRA with 4-bit quantization of the base model.
 Result: fine-tune a 65B model on a single 48GB GPU."
font-sans, var(--text-sm), var(--weight-light), var(--secondary)
bg var(--bg-panel), border-radius var(--r-lg), padding var(--s5)
Left border: 3px solid var(--ink)

════════════════════════════════════════════════════════
REGISTER THE COMPONENT
════════════════════════════════════════════════════════

Replace the Step 06 placeholder in Training.tsx with this component.
```

---

## PROMPT 07 — STEP 07: ALIGNMENT

```
You are building Step 07 of Module 02 (Training) in AiViz.
Step name: "Alignment" — covering RLHF, DPO, Constitutional AI, RLAIF.

════════════════════════════════════════════════════════
DESIGN RULES
════════════════════════════════════════════════════════

All styling from src/tokens.css only. No hardcoded values.
Greyscale only. Consistent with all training steps.

════════════════════════════════════════════════════════
WHAT TO BUILD
════════════════════════════════════════════════════════

Create: src/components/training/Step07Alignment.tsx

This is the most complex step. It has a method selector at the top
and shows different content for each alignment method.

── TOP: METHOD SELECTOR ────────────────────────────────

Label: "STEP 07 — ALIGNMENT"
Headline: "Getting the model to do what you actually want."
Body (2 sentences): After SFT, the model responds to instructions but
may still be harmful, dishonest, or unhelpful. Alignment trains it
to behave according to human values and preferences.

Method selector — four large toggle buttons in a row:
  "RLHF"  |  "DPO"  |  "Constitutional AI"  |  "RLAIF"
Active: bg var(--ink), color var(--text-inverse), border-radius var(--r-md)
Inactive: bg var(--bg-panel), color var(--secondary), border 1px solid var(--stroke)
Below each label: one-word descriptor in mono muted — "Traditional" / "Modern" / "Anthropic" / "Scalable"

── RLHF PANEL (default visible) ────────────────────────

Three-step pipeline diagram (horizontal, desktop; vertical, mobile):

Step A: "Collect Preferences"
  Box: bg var(--bg-panel), border-radius var(--r-lg), padding var(--s5)
  Icon substitute (no icons): large mono number "A"
  Title: "Human Annotators Rank Responses"
  Body: "Two responses shown. Human picks the better one. Repeat 10,000+ times."
  Below: "Dataset: (prompt, response_a, response_b, preferred)"
  font-mono, var(--text-xs), var(--muted)

Arrow between steps: "→" in var(--muted)

Step B: "Train Reward Model"
  Title: "Reward Model"
  Body: "A separate model trained to predict human preference scores."
  Below: "Input: prompt + response → Output: scalar score"
  font-mono, var(--text-xs), var(--muted)

Step C: "PPO Fine-Tuning"
  Title: "PPO Loop"
  Body: "Policy generates responses. Reward model scores them.
         PPO maximizes reward while KL penalty prevents reward hacking."
  Below: "Loss: -reward + β × KL(policy || SFT_model)"
  font-mono, var(--text-xs), var(--muted)

Below pipeline: "Problems with RLHF" — collapsible section
  Bullet points (use custom mono dashes, no unicode bullets):
    — Reward model can be gamed (reward hacking)
    — PPO is unstable and hard to tune
    — Requires running two large models simultaneously
    — Human annotation is expensive and inconsistent
  Each bullet: font-mono, var(--text-xs), var(--secondary)

── DPO PANEL ────────────────────────────────────────────

Comparison diagram: RLHF pipeline (left) vs DPO (right)
RLHF side: show all three boxes with connecting arrows
DPO side: show a single box "Direct Optimization" with X marks over
          the reward model box and PPO box (X = "×", font-mono, var(--muted))

DPO loss explanation:
  Show the intuition as two labelled boxes:
  [ Chosen response ]   → ↑ "increase log probability"
  [ Rejected response ] → ↓ "decrease log probability"
  With a note: "Weighted by how wrong the model currently is."
  font-mono, var(--text-xs), var(--muted)

DPO variants table:
  4 rows: DPO / IPO / KTO / ORPO / SimPO
  Columns: Method | Key difference | Needs paired data?
  Table: bg var(--bg-panel), border-radius var(--r-lg)
  All font-mono, var(--text-xs)
  Header: var(--muted), uppercase
  Cells: var(--primary) for method name, var(--secondary) for content
  Row separator: 1px var(--stroke)

── CONSTITUTIONAL AI PANEL ──────────────────────────────

Two-phase flow:

Phase 1 — SL-CAI:
  Step 1: "Generate response to harmful prompt"
  Step 2: "Critique response against constitution principles"
    Show a simulated constitution excerpt:
    "Choose the response that is least likely to contain harmful
     or unethical content." — font-mono, var(--text-xs), italic, var(--secondary)
  Step 3: "Revise response based on critique"
  Step 4: "Fine-tune on revised responses"

Phase 2 — RL-CAI:
  Same flow as RLHF but reward model is replaced with "AI Feedback"
  badge (show the AI icon substitute as: "AI" in a mono pill)

Interactive demo:
  Show a static harmful prompt, an initial response, a critique, and
  a revised response in a vertical flow. Each in a card panel.
  Button "Walk through the critique" steps through the sequence.

── RLAIF PANEL ──────────────────────────────────────────

Simple comparison: Human labels (RLHF) vs AI labels (RLAIF)
Show as a two-column layout:
  Left: "Human Annotators" — slow, expensive, inconsistent
  Right: "LLM Judge" — fast, scalable, biased differently

Tradeoff table: 3 rows (Cost / Speed / Quality ceiling)
Same table style as DPO variants.

════════════════════════════════════════════════════════
REGISTER THE COMPONENT
════════════════════════════════════════════════════════

Replace the Step 07 placeholder in Training.tsx with this component.
```

---

## PROMPT 08 — STEP 08: BENCHMARKING

```
You are building Step 08 of Module 02 (Training) in AiViz.
Step name: "Evaluation & Benchmarking"

════════════════════════════════════════════════════════
DESIGN RULES
════════════════════════════════════════════════════════

All styling from src/tokens.css only. No hardcoded values.
Greyscale only. This step should tease Module 03 (Benchmarks)
while standing alone as useful content. Link to /benchmarks
where relevant, but that route may not exist yet — use a
disabled state if so.

════════════════════════════════════════════════════════
WHAT TO BUILD
════════════════════════════════════════════════════════

Create: src/components/training/Step08Benchmarking.tsx

── SECTION 1: OVERVIEW ──────────────────────────────────

Label: "STEP 08 — EVALUATION & BENCHMARKING"
Headline: "A model is only as good as what you can measure."
Body: 2 sentences. Describe that benchmarking runs throughout training
and is the primary way to compare models.

── SECTION 2: BENCHMARK EXPLORER ────────────────────────

Six benchmark cards in a 3×2 grid:

  MMLU          "57 academic subjects. Multiple choice."
                Type: Knowledge     Questions: 14,079

  HumanEval     "Python function completion. Tested by running code."
                Type: Coding        Questions: 164

  MATH          "Competition math. From AMC to AIME difficulty."
                Type: Reasoning     Questions: 12,500

  GPQA          "Graduate-level biology, chemistry, physics."
                Type: Expert        Questions: 448

  MT-Bench      "Multi-turn conversation. GPT-4 as judge."
                Type: Instruction    Questions: 80

  TruthfulQA    "Does the model parrot human falsehoods?"
                Type: Honesty       Questions: 817

Card style: bg var(--bg-panel), border-radius var(--r-lg), padding var(--s5)
Benchmark name: var(--text-base), var(--weight-semibold), var(--ink)
Description: var(--text-sm), var(--weight-light), var(--secondary)
Two chips below: Type chip + Questions chip
  font-mono, var(--text-xs), var(--muted), bg var(--bg-raised),
  border-radius var(--r-pill), padding 2px 8px

── SECTION 3: SCORE COMPARISON BAR CHART ────────────────

Title: "How models compare on MMLU"
Show horizontal bar chart for 6 models (approximate real scores):

  GPT-4         86.4%
  Claude 3      82.1%
  LLaMA 3 70B   79.3%
  Mixtral 8x7B  70.6%
  LLaMA 3 8B    66.6%
  GPT-3.5       70.0%

Each bar:
  Label left: model name — font-mono, var(--text-xs), var(--secondary),
              width 120px fixed
  Bar: height 20px, bg var(--ink), border-radius var(--r-sm) right side
       Width proportional to score (max width = 100% of chart area)
  Score right: font-mono, var(--text-xs), var(--ink), var(--weight-medium)
  Row spacing: var(--s3) between rows
  On hover: bar bg shifts to var(--primary), row bg shifts to var(--bg-panel)

Benchmark selector below title: tab pills for MMLU/HumanEval/MATH
  (scores update — use pre-set data for each benchmark)

Note: "Scores as of Q1 2026. See full leaderboard in Module 03."
  font-mono, var(--text-xs), var(--muted)
  "Module 03" styled as a link (underline offset 3px, color var(--secondary))
  Clicking it: if /benchmarks exists, navigate; else show inline toast:
  "Benchmarks module coming soon." font-mono, var(--text-xs), var(--muted)

════════════════════════════════════════════════════════
REGISTER THE COMPONENT
════════════════════════════════════════════════════════

Replace the Step 08 placeholder in Training.tsx with this component.
```

---

## PROMPT 09 — STEP 09: INFERENCE OPTIMIZATION

```
You are building Step 09 of Module 02 (Training) in AiViz.
Step name: "Inference Optimization"

════════════════════════════════════════════════════════
DESIGN RULES
════════════════════════════════════════════════════════

All styling from src/tokens.css only. No hardcoded values.
Greyscale only. Consistent with all training steps.

════════════════════════════════════════════════════════
WHAT TO BUILD
════════════════════════════════════════════════════════

Create: src/components/training/Step09Inference.tsx

── SECTION 1: OVERVIEW ──────────────────────────────────

Label: "STEP 09 — INFERENCE OPTIMIZATION"
Headline: "A trained model is often too large and slow for real use."
Body: 2–3 sentences. The gap between a trained model and a
deployable model requires quantization, distillation, and
other techniques to make it practical.

── SECTION 2: QUANTIZATION VISUALIZER ───────────────────

Title: "Weight Precision"
Subtitle: "Reducing precision reduces memory. At some point, quality degrades."

A precision slider with 5 stops:
  FP32  →  BF16  →  INT8  →  INT4(GPTQ)  →  INT4(NF4/QLoRA)

For each stop, show a live-updating panel with 4 stats:
  Bits per weight:    32 / 16 / 8 / 4 / 4
  Memory (7B model):  28GB / 14GB / 7GB / 3.5GB / 3.5GB*
  Relative quality:   ████████ 100% / ████████ 99.5% / ███████ 98% / ██████ 96% / ██████ 95%
  Run on:             "8× A100" / "2× A100" / "1× A100" / "1× RTX 3090" / "1× RTX 3090"

Quality bar:
  Filled portion: bg var(--ink), height 8px, border-radius var(--r-pill)
  Empty portion:  bg var(--bg-raised)
  Width proportional to quality %

All stats: font-mono, var(--text-sm), var(--ink), var(--weight-medium)
Labels: font-mono, var(--text-xs), var(--muted)
Stats in 2×2 grid of small cards: bg var(--bg-panel), 
border-radius var(--r-md), padding var(--s4)

*NF4 note: "NF4 uses information-theoretically optimal 4-bit representation
for normally distributed weights (QLoRA)."
font-mono, var(--text-xs), var(--muted)

── SECTION 3: SPECULATIVE DECODING ANIMATION ────────────

Title: "Speculative Decoding"
Body (2 sentences): A small draft model proposes multiple tokens at once.
The large verifier model checks them in parallel. Accepted tokens are free.

Animation (runs on button press "▶ Simulate"):

Show two rows of token boxes:
  Row 1: "Draft model" — 4 token boxes appear quickly one by one
    Each box: font-mono, var(--text-xs), bg var(--bg-panel),
    border 1px solid var(--stroke), border-radius var(--r-sm),
    padding var(--s2) var(--s3)
    Token labels: realistic word fragments

  Pause. Then:

  Row 2: "Verifier checks" — each draft token gets a verdict:
    Accepted: bg var(--ink), color var(--text-inverse)
    Rejected: border 1px solid var(--stroke-dark), text var(--muted),
              strikethrough style text-decoration

  Show a count at the end:
    "3 of 4 tokens accepted. 1 resampled."
    "Effective speedup: ~3×"
  font-mono, var(--text-xs), var(--secondary)

Button style: outline style from tokens.css. Resets on each click.

── SECTION 4: OPTIMIZATION COMPARISON TABLE ────────────

Title: "Which technique for which situation?"

Table: 4 rows × 4 columns
Columns: Technique | Memory saving | Speed gain | Quality cost
Rows:    Quantization INT8 / INT4 / Distillation / Speculative Decoding

Table style: full width, bg var(--bg-panel), border-radius var(--r-lg)
Header: font-mono, var(--text-xs), var(--muted), uppercase, bg var(--bg-raised)
Cells: font-mono, var(--text-xs), var(--primary), padding var(--s3) var(--s4)
Row dividers: 1px var(--stroke)
For quality cost: use "Low" / "Medium" / "High" — each a mono pill

════════════════════════════════════════════════════════
REGISTER THE COMPONENT
════════════════════════════════════════════════════════

Replace the Step 09 placeholder in Training.tsx with this component.
```

---

## PROMPT 10 — STEP 10: DEPLOYMENT

```
You are building Step 10 of Module 02 (Training) in AiViz.
Step name: "Deployment"

════════════════════════════════════════════════════════
DESIGN RULES
════════════════════════════════════════════════════════

All styling from src/tokens.css only. No hardcoded values.
Greyscale only. This is the final step — give it a sense of
completion without being decorative. Quiet, confident, done.

════════════════════════════════════════════════════════
WHAT TO BUILD
════════════════════════════════════════════════════════

Create: src/components/training/Step10Deployment.tsx

── SECTION 1: OVERVIEW ──────────────────────────────────

Label: "STEP 10 — DEPLOYMENT"
Headline: "The model is ready. Now it needs to serve millions of requests."
Body: 2–3 sentences on the gap between a trained model and a production API.

── SECTION 2: INFERENCE PIPELINE FLOW ───────────────────

Horizontal flow diagram (SVG or HTML flex), showing:

  User Request
    ↓
  Load Balancer
    ↓
  Inference Server (vLLM / TGI / TensorRT-LLM)
    ↓
  Model (quantized, sharded across GPUs)
    ↓
  KV Cache
    ↓
  Safety Filter
    ↓
  Streamed Response

Each node: bg var(--bg-panel), border-radius var(--r-md),
padding var(--s3) var(--s5), border 1px solid var(--stroke)
Node label: font-mono, var(--text-xs), var(--primary)
Sub-label (where applicable): font-mono, var(--text-2xs), var(--muted)
Arrows: "↓" in var(--muted) centered between nodes

On hover over each node: show a tooltip with a one-sentence explanation.
Tooltip style: consistent with rest of module.

── SECTION 3: KEY CONCEPTS ──────────────────────────────

Four concept cards in 2×2 grid:

  KV Cache
    "Stores computed key/value pairs so previous tokens aren't
     recomputed at each step. Essential for long contexts."
    Stat: "Grows linearly with context length"

  Continuous Batching
    "Process multiple requests without padding. Fill GPU 
     as soon as a sequence finishes. Maximizes throughput."
    Stat: "2–5× higher throughput vs static batching"

  PagedAttention (vLLM)
    "Virtual memory for the KV cache. Eliminate fragmentation.
     Serve 24× more requests on the same hardware."
    Stat: "vLLM — 24× throughput vs HuggingFace"

  Streaming Tokens
    "Return tokens to the user as they are generated.
     Perceived latency drops dramatically. Standard everywhere."
    Stat: "Time-to-first-token: <200ms"

Card style: same as previous steps.
Stat: font-mono, var(--text-lg), var(--weight-semibold), var(--ink)
Body: var(--text-sm), var(--weight-light), var(--secondary)

── SECTION 4: FULL PIPELINE RECAP ──────────────────────

Title: "The complete journey — from raw data to deployed model."

A condensed vertical timeline showing all 10 stages:
  01  Data Collection
  02  Tokenizer Training
  03  Architecture Design
  04  Pre-Training         ← "Most compute. Weeks to months."
  05  Training Evaluation
  06  Supervised Fine-Tuning
  07  Alignment            ← "RLHF, DPO, or Constitutional AI"
  08  Benchmarking
  09  Inference Optimization
  10  Deployment           ← "You are here."

Each stage as a compact row:
  Left: mono number
  Center: stage name — var(--text-sm), var(--primary)
  Right: annotation (where present) — font-mono, var(--text-xs), var(--muted)
  Row height: var(--s6)
  Separator: 1px var(--stroke)
  Step 10 row: bg var(--bg-raised), font-weight var(--weight-medium)

Below timeline:
  "You've seen the full pipeline. Explore how models are
   evaluated against each other in the Benchmarks module."
  font-sans, var(--text-sm), var(--weight-light), var(--secondary)
  margin-bottom var(--s4)

  Button: "Go to Benchmarks →"
    Primary button style (bg-inverse).
    If /benchmarks route exists: navigate to it.
    If not yet built: show a toast: "Coming soon" (same inline toast
    style used in Step 08).

════════════════════════════════════════════════════════
REGISTER THE COMPONENT
════════════════════════════════════════════════════════

Replace the Step 10 placeholder in Training.tsx with this component.
This is the last step. Confirm all 10 steps are registered and
the sidebar navigation works end-to-end.
```

---

## APPENDIX — TOKENS TO ADD FOR THIS MODULE

*Add these to `src/tokens.css` before starting. Some prompts reference them.*

```css
/* ── Grey Scale Extended (for multi-segment charts) ── */
--grey-900: #111111;
--grey-800: #1f1f1f;
--grey-700: #444444;
--grey-600: #555555;
--grey-400: #aaaaaa;
--grey-300: #cccccc;
--grey-200: #dddddd;
--grey-100: #eeeeee;

/* ── Chart-specific ── */
--chart-line:       var(--ink);
--chart-line-alt:   var(--stroke-dark);
--chart-grid:       var(--stroke);
--chart-axis:       var(--muted);
--chart-bar-active: var(--ink);
--chart-bar-bg:     var(--bg-raised);

/* ── Timeline ── */
--timeline-line:    var(--stroke);
--timeline-node:    var(--ink);
--timeline-node-bg: var(--bg);
```

---

## APPENDIX — BUILD ORDER

```
Run prompts in this order:

  PROMPT 00  →  Module shell + routing + sidebar
  PROMPT 01  →  Step 01: Data Collection
  PROMPT 02  →  Step 02: Tokenizer
  PROMPT 03  →  Step 03: Architecture
  PROMPT 04  →  Step 04: Pre-Training
  PROMPT 05  →  Step 05: Evaluation
  PROMPT 06  →  Step 06: SFT
  PROMPT 07  →  Step 07: Alignment
  PROMPT 08  →  Step 08: Benchmarking
  PROMPT 09  →  Step 09: Inference Optimization
  PROMPT 10  →  Step 10: Deployment

After all steps are complete, run one final prompt:

  FINAL PASS → "Audit every file in src/components/training/ for
  any hardcoded colour, font, or spacing values that do not
  reference src/tokens.css. Fix all violations. Output a list
  of every change made."
```

---

*End of document. Total steps: 10. Total agent prompts: 12 (including shell + final audit).*
