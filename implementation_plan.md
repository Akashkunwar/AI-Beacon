# Module 02 — LLM Training Pipeline: Implementation Plan

## Goal

Build Module 02 of AiViz — "How LLMs Are Trained" — a 10-step interactive visual walkthrough of the LLM training pipeline, from data collection to deployment. This involves prerequisite fixes to the existing codebase, then 12 sequential build prompts.

---

## Phase 0 — Prerequisites (done immediately, no separate prompt needed)

These fixes are applied before any Module 02 code is written.

---

### Shared Nav Component

#### [NEW] [Nav.tsx](file:///Users/kunwar/Documents/Code/AiViz/src/components/shared/Nav.tsx)

Extract the [Nav](file:///Users/kunwar/Documents/Code/AiViz/src/pages/Home.tsx#47-155) component from [Home.tsx](file:///Users/kunwar/Documents/Code/AiViz/src/pages/Home.tsx) into a shared component that both [Home.tsx](file:///Users/kunwar/Documents/Code/AiViz/src/pages/Home.tsx) and the new `Training.tsx` page can import. The [Nav](file:///Users/kunwar/Documents/Code/AiViz/src/pages/Home.tsx#47-155) already works — it reads `NAV_LINKS` and renders sticky header with logo + links. Make `NAV_LINKS` part of the shared module.

- Update `Training` link in `NAV_LINKS`: `to: '/training'`, `live: true`
- On the Training page, the "Training" link should show as active (add optional `activeRoute` prop)

#### [MODIFY] [Home.tsx](file:///Users/kunwar/Documents/Code/AiViz/src/pages/Home.tsx)

- Remove inline [Nav](file:///Users/kunwar/Documents/Code/AiViz/src/pages/Home.tsx#47-155) component and `NAV_LINKS` array
- Import [Nav](file:///Users/kunwar/Documents/Code/AiViz/src/pages/Home.tsx#47-155) from `@/components/shared/Nav`
- Update `MODULES` array: set Module 02 `status: 'live'`, `to: '/training'`

#### [MODIFY] [App.tsx](file:///Users/kunwar/Documents/Code/AiViz/src/App.tsx)

- Add lazy import for `Training` page
- Add `<Route path="/training" element={<Training />} />`

---

### SKILL.md Palette Fix

#### [MODIFY] [SKILL.md](file:///Users/kunwar/Documents/Code/AiViz/.agents/skills/aiviz_frontend/SKILL.md)

Update the palette table in §2 to match actual [tokens.css](file:///Users/kunwar/Documents/Code/AiViz/src/tokens.css) values:
- `--muted`: `#999999` → `#737373`
- `--secondary`: `#666666` → `#4d4d4d`

Add a note about the `--viz-*` data-viz palette and its usage rule:
- **UI shell**: greyscale only
- **Charts, graphs, data visualizations**: `--viz-*` tokens allowed

---

### Extended Grey Scale Tokens

#### [MODIFY] [tokens.css](file:///Users/kunwar/Documents/Code/AiViz/src/tokens.css)

Add extended grey scale tokens needed for multi-segment charts:

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
```

---

### SKILL.md Route Table Update

#### [MODIFY] [SKILL.md](file:///Users/kunwar/Documents/Code/AiViz/.agents/skills/aiviz_frontend/SKILL.md)

Add `/training` to the route table in §11:

| Route | Component | Notes |
|---|---|---|
| `/training` | `Training.tsx` | Module 02: LLM Training Pipeline |

---

## Phase 1–12 — Sequential Build Prompts

Below are the **12 prompts** to execute in sequence. Each prompt is self-contained — you paste it as your next message and I'll build that step.

---

## PROMPT 00 — Module Shell & Routing

> **What it builds:** `Training.tsx` page, sidebar navigation, step content area, step footer, keyboard navigation, mobile responsive layout
>
> **Files created:** `src/pages/Training.tsx`
>
> **Files modified:** None (prerequisites already handled Nav, App.tsx)

```
Build the Module 02 shell page at src/pages/Training.tsx for the
"How LLMs Are Trained" module.

IMPORTANT: Read these files first before writing any code:
- src/tokens.css (all styling values)
- src/components/shared/Nav.tsx (site-wide nav — import and use it)
- src/pages/Home.tsx (visual reference for consistency)
- .agents/skills/aiviz_frontend/SKILL.md (coding standards)
- .agents/workflows/implement_aiviz_component.md (workflow)

DESIGN RULES (apply to everything):
- All styling from src/tokens.css only. No hardcoded values.
- Greyscale only for UI shell. --viz-* tokens only inside charts/graphs.
- --font-sans for UI text, --font-mono for labels/step numbers/tags/code.
- Named exports only. Functional components only.
- Wrap content in ErrorBoundary.
- Respect prefers-reduced-motion.
- Use Framer Motion for transitions.

WHAT TO BUILD:

1. Page layout with two zones:
   LEFT SIDEBAR (240px, fixed on desktop):
     - Import and use Nav from @/components/shared/Nav (renders at top)
     - Module title: "How LLMs Are Trained"
       font-mono, var(--text-xs), var(--muted), uppercase, tracking-wider
     - 10 step nav items:
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
     - Inactive: color var(--secondary), no border
     - font-mono, var(--text-xs), padding var(--s3) var(--s4)
     - Sidebar bg: var(--bg-panel), border-right: 1px solid var(--stroke)
     - On mobile (<720px): sidebar collapses to horizontal scrollable
       pill row at top of content area

   MAIN CONTENT AREA (flex: 1):
     - Render currently active step component
     - Padding: var(--s7) var(--s6)
     - Background: var(--bg)
     - Step transition: content fades out (opacity 1→0, 80ms)
       then new content fades in (opacity 0→1, 200ms, translateY 10→0)

2. Step state: activeStep (0–9) in React state or URL search param.
   Clicking sidebar item sets activeStep.
   Keyboard: arrow left/right navigate steps.
   Each step receives: stepNumber, totalSteps, onNext, onPrev

3. Step footer (bottom of main content):
   Left: "← Previous" (hidden on step 0)
   Center: "Step N of 10" — font-mono, var(--text-xs), var(--muted)
   Right: "Next →" (hidden on step 9)
   Button style: btn-secondary class
   Border-top: 1px solid var(--stroke), padding-top var(--s5),
   margin-top var(--s7)

4. For now, each step renders a placeholder:
   "Step 01 — Data Collection — content coming soon"
   font-mono, var(--text-sm), var(--muted), centered

5. Export the Training component as a named export.

VERIFICATION: After building, confirm:
- TypeScript compiles: npx tsc --noEmit
- Module loads at /training in the browser
- Sidebar navigation works (click + keyboard arrows)
- Step footer shows correct step count
- Mobile view shows horizontal pill nav
- Nav shows "Training" as active link
```

---

## PROMPT 01 — Step 01: Data Collection & Curation

> **What it builds:** Interactive data mix bar chart, data quality cards, deduplication demo
>
> **Files created:** `src/components/training/Step01DataCollection.tsx`

```
Build Step 01 of Module 02 (Training) in AiViz.
Step name: "Data Collection & Curation"

IMPORTANT: Read these files first:
- src/tokens.css (all styling)
- src/pages/Training.tsx (step shell — your component receives
  stepNumber, totalSteps, onNext, onPrev props)
- .agents/skills/aiviz_frontend/SKILL.md (coding standards)

DESIGN RULES:
- All styling from src/tokens.css only. No hardcoded values.
- UI shell (text, borders, cards): greyscale only.
- Charts/data viz: may use --viz-* tokens from tokens.css.
- --font-sans for UI, --font-mono for labels/stats/code.
- Wrap in ErrorBoundary. Respect prefers-reduced-motion.

Create: src/components/training/Step01DataCollection.tsx

SECTION 1 — OVERVIEW:
  Section label (mono): "STEP 01 — DATA COLLECTION"
  Headline: "Before a single weight is updated, a model needs data."
  Body (2–3 sentences): explain Common Crawl, books, code, Wikipedia.
  font-sans, var(--text-sm), var(--weight-light), var(--secondary),
  line-height var(--lead-body)

SECTION 2 — INTERACTIVE DATA MIX VISUALIZATION:
  Horizontal stacked bar showing typical LLM data mix:
    Web (Common Crawl)    67%
    Books                 15%
    Code (GitHub)          8%
    Wikipedia              4%
    Scientific papers      3%
    Other curated          3%

  Bar: full width, height 48px.
  Use different shades from the extended grey scale + existing palette:
    Web:        var(--ink)
    Books:      var(--grey-700)
    Code:       var(--secondary)
    Wikipedia:  var(--muted)
    Papers:     var(--stroke-dark)
    Other:      var(--grey-300)
  Border-radius: var(--r-sm) on ends.
  Hover tooltip: bg var(--bg-panel), border 1px solid var(--stroke-dark),
  border-radius var(--r-md), padding var(--s3) var(--s4),
  font-mono, var(--text-xs), var(--primary)

  Below bar: legend row.
  Each item: 12×12px colour square + source name + percentage.
  font-mono, var(--text-xs), var(--secondary), flex-wrap, gap var(--s5)

SECTION 3 — DATA QUALITY APPROACHES:
  4 cards in 2×2 grid:

  Card 1: "Quantity First"
    Used by: GPT-3, early LLaMA
    "Maximize tokens. Minimal filtering."
    Tag: "Traditional"

  Card 2: "Quality Filtering"
    Used by: RefinedWeb (Falcon), C4
    "Aggressive dedup and perplexity-based filtering."
    Tag: "Improved"

  Card 3: "Textbook Quality"
    Used by: Phi-1, Phi-2 (Microsoft)
    "Synthetic 'textbook-quality' data. 6B tokens outperform
     models trained on 300B+ noisy tokens."
    Tag: "Alternative"

  Card 4: "Synthetic Data"
    Used by: Gemini, Yi, Mistral
    "Generate training data using existing LLMs."
    Tag: "Modern"

  Card style: bg var(--bg-panel), border-radius var(--r-lg),
  padding var(--s5), no border
  Tag: font-mono, var(--text-2xs), var(--muted), bg var(--bg-raised),
  border-radius var(--r-pill), padding 2px 8px
  On mobile: single column stack.

SECTION 4 — DEDUPLICATION DEMO:
  Two text blocks side by side:
    Left: "Raw data — contains duplicates" (6-8 lines, some duplicated)
    Right: "After deduplication" (duplicates removed)
  Duplicate lines: bg var(--bg-raised) + "DUPLICATE" mono badge
  Button between them: "Run Deduplication →" (btn-secondary)
  On click: animate duplicates fading out, right side populating.
  Below: stat chips in a row:
    [ CommonCrawl: 3.3T tokens raw ]
    [ After dedup: ~900B tokens ]
    [ 73% reduction ]
  Chip: font-mono, var(--text-xs), bg var(--bg-panel),
  border 1px solid var(--stroke), border-radius var(--r-pill),
  padding var(--s2) var(--s5)

REGISTER: Replace Step 01 placeholder in Training.tsx.
VERIFY: npx tsc --noEmit passes. Component renders in browser.
```

---

## PROMPT 02 — Step 02: Tokenizer Training

> **Files created:** `src/components/training/Step02Tokenizer.tsx`

```
Build Step 02 of Module 02 (Training): "Tokenizer Training"

Read first: src/tokens.css, src/pages/Training.tsx,
.agents/skills/aiviz_frontend/SKILL.md

DESIGN RULES: Same as all training steps — tokens.css only, greyscale
UI, --viz-* for charts only, font-sans/mono, ErrorBoundary,
prefers-reduced-motion.

Create: src/components/training/Step02Tokenizer.tsx

SECTION 1 — OVERVIEW:
  Label: "STEP 02 — TOKENIZER TRAINING"
  Headline: "Text can't enter a neural network. Tokens can."
  Body: The tokenizer is trained before the model, frozen for training.

SECTION 2 — LIVE BPE MERGE VISUALIZER:
  Starting string: "lowest lower newest"
  Display as individual character pills (mono, bg var(--bg-panel),
  border 1px solid var(--stroke), border-radius var(--r-sm))

  "Step through merges" button (btn-secondary).
  On click: highlight most frequent pair in var(--ink) bg +
  var(--text-inverse) text, merge into single pill.

  Merge history panel below:
    "e + s → es  (frequency: 8)" per line.
    font-mono, var(--text-xs), var(--secondary)

  Vocab size counter: "Vocabulary size: 27 → 28 → ..." updating.

  Pre-compute the merge sequence. BPE on "lowest lower newest":
  full character set → merge "lo" → merge "es" → merge "er" → etc.
  Show at least 6 merge steps.

SECTION 3 — ALGORITHM COMPARISON:
  Three-column layout (single column on mobile):

  BPE (Byte Pair Encoding)
    Used by: GPT-2, GPT-3, GPT-4, LLaMA
    "Iteratively merge the most frequent adjacent byte pair."
    Tag: "Most common"

  SentencePiece + Unigram LM
    Used by: T5, Gemma, XLNet (Google)
    "Probabilistic model. Optimizes corpus likelihood."
    Tag: "Google standard"

  Tiktoken (cl100k)
    Used by: GPT-4
    "BPE on bytes. 100,277 vocab. No unknown tokens."
    Tag: "OpenAI"

  Same card style as Step 01 approach cards.

SECTION 4 — TOKENIZER COMPARISON:
  Text input area with placeholder "Type text to compare…"
  Three toggle pills: "BPE-32k" / "cl100k" / "SentencePiece"
  Show pre-computed example tokenizations for 3–4 sample strings.
  When user types custom text, show approximate chunking
  (split by common patterns — spaces, punctuation, subword heuristics).
  Display as mono pills. Below each: token count + chars/token ratio.
  Note: "This is a simplified simulation."
  font-mono, var(--text-xs), var(--muted)

REGISTER: Replace placeholder in Training.tsx.
VERIFY: npx tsc --noEmit. Renders in browser. BPE animation works.
```

---

## PROMPT 03 — Step 03: Architecture Design

> **Files created:** `src/components/training/Step03Architecture.tsx`

```
Build Step 03 of Module 02 (Training): "Architecture Design"

Read first: src/tokens.css, src/pages/Training.tsx,
.agents/skills/aiviz_frontend/SKILL.md

DESIGN RULES: tokens.css only, greyscale UI, --viz-* for charts,
ErrorBoundary, prefers-reduced-motion.

Create: src/components/training/Step03Architecture.tsx

SECTION 1 — OVERVIEW:
  Label: "STEP 03 — ARCHITECTURE DESIGN"
  Headline: "Every parameter is a decision. Decisions here can't be undone."
  Body: Architecture is locked before training. Changing it = start over.

SECTION 2 — INTERACTIVE ARCHITECTURE CONFIGURATOR:
  Left side — sliders/selectors:
    - n_layers: 12 to 96, step 12
    - d_model: 512, 1024, 2048, 4096, 8192
    - n_heads: 8, 16, 32, 64
    - d_ff: auto = 4 × d_model (read-only display)
    - Attention: toggle MHA / GQA / MQA
      (GQA shows sub-selector for KV heads)
    - Position encoding: dropdown — RoPE / ALiBi / Learned / Sinusoidal
    - Normalization: toggle — Pre-LN (RMSNorm) / Post-LN / RMSNorm
    - Activation: toggle — SwiGLU / GELU / ReLU

  Right side — live stats updating as sliders move:
    Total parameters (B/M suffix)
    Attention parameters
    FFN parameters
    KV Cache per token (MB)
    Context memory at 4k tokens (GB)
    Approx training FLOPs (order of magnitude)

  Formulas:
    Attention params per layer = 4 × d_model² (for MHA)
    FFN params per layer = 2 × d_model × d_ff (+ gate for SwiGLU = 3×)
    Total ≈ n_layers × (attn + ffn) + vocab embeddings
    KV cache per token = 2 × n_kv_heads × d_head × 2 bytes (BF16)

  Below stats: "Similar to: GPT-2 (117M)" — match by param count.
  "● live" badge in top right of stats panel.

  On mobile: stack vertically (sliders on top, stats below).

SECTION 3 — ATTENTION TYPE EXPLAINER:
  Three cards: MHA / GQA / MQA
  Each with SVG diagram (greyscale) showing Q/K/V head mapping:
    MHA: 8Q → 8K, 8V (full)
    GQA: 8Q → 2K, 2V (grouped)
    MQA: 8Q → 1K, 1V (single KV)
  Below: KV cache bar comparison (MHA=100%, GQA=25%, MQA=12.5%)

SECTION 4 — ARCHITECTURE EVOLUTION TIMELINE:
  Vertical timeline:
    2017  Original Transformer  Post-LN, MHA, Sinusoidal, GELU
    2019  GPT-2                 Pre-LN, MHA, Learned, GELU
    2020  GPT-3                 Pre-LN, MHA, Learned, GELU (175B)
    2022  PaLM                  Pre-LN, MQA, RoPE, SwiGLU
    2023  LLaMA                 Pre-LN, MHA→GQA, RoPE, SwiGLU, RMSNorm
    2023  Mistral               Pre-LN, GQA, RoPE, SwiGLU, Sliding Window
    2024  LLaMA 3               Pre-LN, GQA, RoPE, SwiGLU, 128k vocab

  Timeline: 1px solid var(--stroke), 8px circles var(--ink).

REGISTER: Replace placeholder in Training.tsx.
VERIFY: npx tsc --noEmit. Param counter calculates correctly.
```

---

## PROMPT 04 — Step 04: Pre-Training

> **Files created:** `src/components/training/Step04PreTraining.tsx`

```
Build Step 04 of Module 02 (Training): "Pre-Training"

Read first: src/tokens.css, src/pages/Training.tsx, SKILL.md

Create: src/components/training/Step04PreTraining.tsx

SECTION 1 — OVERVIEW:
  Label: "STEP 04 — PRE-TRAINING"
  Headline: "Trillions of tokens. Weeks of compute. One objective:
  predict the next token."
  Body: CLM objective, cross-entropy loss, massive scale.

SECTION 2 — ANIMATED LOSS CURVE:
  SVG line chart, full width, 220px height.
  bg var(--bg-panel), border-radius var(--r-lg), padding var(--s5)
  X-axis: 0–100k steps. Y-axis: 0–4.0.
  Loss curve: stroke var(--ink), stroke-width 2.
    Formula: 3.8 × e^(-0.00003x) + 0.8 + subtle noise.
  Validation loss: stroke var(--stroke-dark), stroke-width 1.5, dashed.
  Grid: dashed 1px var(--stroke). Axis labels: mono, xs, muted.

  Controls: "▶ Animate" (draws curve left→right), speed "1×/5×/20×",
  reset "↺". All btn-secondary.

  Annotations at key points: "Initial fast descent" (5k),
  "Warmup complete" (30k), "Cosine decay begins" (70k).

  prefers-reduced-motion: show static completed curve.

SECTION 3 — SCALING LAWS CALCULATOR:
  Title: "Chinchilla Optimal Compute Allocation"
  Single slider: Compute Budget (1e18 to 1e24 FLOPs).
  Display: "6×10²³ FLOPs" formatted.
  Live output in 2×2 cards:
    Optimal params: "6.7B"
    Optimal tokens: "133B"
    Chinchilla ratio: "~20 tokens/param"
    Est GPU-days (A100): calculated
  Formula: N_opt = 0.5 × (C/6)^0.5
  Note below: "Based on Hoffmann et al. 2022"

SECTION 4 — OPTIMIZATION TECHNIQUES:
  Tab row: FlashAttention / Mixed Precision / ZeRO / Grad Checkpoint
  Active tab: bg var(--ink), color var(--text-inverse)
  Each tab shows: 2–3 sentence explanation + key stat.
    FlashAttention: "2–4× faster. Same math."  "2–4× speedup"
    Mixed Precision: "Half memory."  "2× memory reduction"
    ZeRO Stage 3: "Shard everything."  "Linear memory scaling"
    Gradient Checkpoint: "Recompute activations."  "60–70% memory reduction"

REGISTER + VERIFY: npx tsc --noEmit. Animation works. Calculator updates.
```

---

## PROMPT 05 — Step 05: Training Evaluation

> **Files created:** `src/components/training/Step05Evaluation.tsx`

```
Build Step 05 of Module 02 (Training): "Evaluation During Training"

Read first: src/tokens.css, Training.tsx, SKILL.md

Create: src/components/training/Step05Evaluation.tsx

SECTION 1 — OVERVIEW:
  Label: "STEP 05 — EVALUATION DURING TRAINING"
  Headline: "Training isn't a black box. Every step is measured."

SECTION 2 — LIVE TRAINING DASHBOARD:
  4 metric panels in 2×2 grid. "▶ Simulate" button starts sim.
  Values update every 500ms with pre-computed trajectories.

  Panel 1 — Training Loss: large mono number (e.g. "2.847"),
    mini sparkline (last 20 values), trend arrow.
  Panel 2 — Gradient Norm: large number, threshold line at 1.0,
    "CLIPPING ACTIVE" badge when exceeded.
  Panel 3 — Perplexity: large number, "exp(loss)" note, sparkline.
  Panel 4 — Validation Loss: large number, gap indicator "Δ +0.165",
    "possible overfitting" badge when gap is large.

  Panel style: bg var(--bg-panel), r-lg, padding s5.
  Large number: font-mono, text-3xl, weight-semibold, ink.
  Title: font-mono, text-xs, muted, uppercase.

  Cleanup: clear interval on unmount. Add pause button.

SECTION 3 — ANOMALY DETECTOR:
  Title: "Common Training Failures"
  4 buttons: "Loss Spike" / "Loss Plateau" / "Gradient Explosion" / "Divergence"
  On click: show annotated SVG loss curve with failure pattern highlighted.
  Each failure has cause text explanation.
  Active button: bg var(--ink), color var(--text-inverse).

REGISTER + VERIFY: npx tsc --noEmit. Simulation runs and pauses correctly.
```

---

## PROMPT 06 — Step 06: Supervised Fine-Tuning

> **Files created:** `src/components/training/Step06SFT.tsx`

```
Build Step 06 of Module 02 (Training): "Supervised Fine-Tuning"

Read first: src/tokens.css, Training.tsx, SKILL.md

Create: src/components/training/Step06SFT.tsx

SECTION 1 — OVERVIEW:
  Label: "STEP 06 — SUPERVISED FINE-TUNING"
  Headline: "A pre-trained model knows language. SFT teaches it to
  follow instructions."

SECTION 2 — DATASET EXPLORER:
  Paginated list of 8 sample (prompt, response) pairs.
  Each row: prompt text left, response text right in panels.
  Token count below each. Pagination: "← 1 / 8 →".

SECTION 3 — SFT vs PRE-TRAINING OBJECTIVE:
  Side-by-side token sequences:
    CLM: every token highlighted (loss on all)
    SFT: only response tokens highlighted (var(--ink) bg,
    var(--text-inverse) text), prompt tokens dimmed.
  Label: "Gradients only flow through response tokens."

SECTION 4 — LORA EXPLAINER:
  Title: "LoRA — Fine-tune with 0.01% of the parameters"
  SVG diagram: W (large matrix, frozen) + A×B (thin matrices, trainable)
  Rank selector: toggle 4/8/16/32/64.
  Live stats: trainable params, original params, compression %.
  QLoRA callout: "Fine-tune a 65B model on a single 48GB GPU."
  Left border 3px solid var(--ink).

REGISTER + VERIFY: npx tsc --noEmit. Rank selector updates stats.
```

---

## PROMPT 07 — Step 07: Alignment (Split into Sub-Components)

> **Files created:**
> - `src/components/training/Step07Alignment.tsx` (wrapper + method selector)
> - `src/components/training/alignment/RLHFPanel.tsx`
> - `src/components/training/alignment/DPOPanel.tsx`
> - `src/components/training/alignment/CAIPanel.tsx`
> - `src/components/training/alignment/RLAIFPanel.tsx`

```
Build Step 07 of Module 02 (Training): "Alignment"
This step covers RLHF, DPO, Constitutional AI, and RLAIF.

Read first: src/tokens.css, Training.tsx, SKILL.md

IMPORTANT: This step is complex. Split into sub-components:
- src/components/training/Step07Alignment.tsx (wrapper + selector)
- src/components/training/alignment/RLHFPanel.tsx
- src/components/training/alignment/DPOPanel.tsx
- src/components/training/alignment/CAIPanel.tsx
- src/components/training/alignment/RLAIFPanel.tsx

WRAPPER (Step07Alignment.tsx):
  Label: "STEP 07 — ALIGNMENT"
  Headline: "Getting the model to do what you actually want."
  Body: After SFT, the model may still be harmful or unhelpful.

  Method selector — 4 toggle buttons:
    "RLHF" / "DPO" / "Constitutional AI" / "RLAIF"
  Active: bg var(--ink), color var(--text-inverse), r-md
  Below each: descriptor — "Traditional" / "Modern" / "Anthropic" / "Scalable"
  Render the corresponding panel component based on selection.

RLHF PANEL:
  Three-step pipeline (horizontal): A→B→C
    A: "Human Annotators Rank Responses"
    B: "Train Reward Model"
    C: "PPO Loop" with KL penalty formula
  "Problems with RLHF" collapsible section with 4 bullets.

DPO PANEL:
  Side-by-side: RLHF pipeline (3 boxes) vs DPO (1 box, others crossed out)
  DPO loss: chosen ↑ / rejected ↓ boxes.
  Variants table: DPO / IPO / KTO / ORPO / SimPO
    Columns: Method | Key difference | Needs paired data?

CAI PANEL:
  Two-phase flow: SL-CAI (4 steps) + RL-CAI.
  Constitution excerpt shown. Interactive walkthrough:
  "Walk through the critique" button steps through sequence.

RLAIF PANEL:
  Two-column: Human Annotators vs LLM Judge.
  Tradeoff table: Cost / Speed / Quality ceiling.

REGISTER + VERIFY: npx tsc --noEmit. All 4 panels switch correctly.
```

---

## PROMPT 08 — Step 08: Benchmarking

> **Files created:** `src/components/training/Step08Benchmarking.tsx`

```
Build Step 08 of Module 02 (Training): "Evaluation & Benchmarking"

Read first: src/tokens.css, Training.tsx, SKILL.md

Create: src/components/training/Step08Benchmarking.tsx

SECTION 1 — OVERVIEW:
  Label: "STEP 08 — EVALUATION & BENCHMARKING"
  Headline: "A model is only as good as what you can measure."

SECTION 2 — BENCHMARK EXPLORER:
  6 cards in 3×2 grid (single column mobile):
    MMLU: "57 subjects. Multiple choice." Type: Knowledge, 14,079 Q
    HumanEval: "Python code completion." Type: Coding, 164 Q
    MATH: "Competition math." Type: Reasoning, 12,500 Q
    GPQA: "Graduate-level science." Type: Expert, 448 Q
    MT-Bench: "Multi-turn conversation." Type: Instruction, 80 Q
    TruthfulQA: "Avoids human falsehoods?" Type: Honesty, 817 Q
  Card + two chips per card (type + question count).

SECTION 3 — SCORE COMPARISON BAR CHART:
  Title: "How models compare"
  Horizontal bars for 6 models (MMLU scores):
    GPT-4: 86.4%, Claude 3: 82.1%, LLaMA 3 70B: 79.3%,
    Mixtral: 70.6%, GPT-3.5: 70.0%, LLaMA 3 8B: 66.6%
  Bar: bg var(--ink), proportional width. Hover: bg var(--primary).
  Benchmark selector pills: MMLU / HumanEval / MATH
  (pre-set data for each).
  "Module 03" link: if /benchmarks doesn't exist, inline toast.

REGISTER + VERIFY: npx tsc --noEmit. Benchmark tabs switch data.
```

---

## PROMPT 09 — Step 09: Inference Optimization

> **Files created:** `src/components/training/Step09Inference.tsx`

```
Build Step 09 of Module 02 (Training): "Inference Optimization"

Read first: src/tokens.css, Training.tsx, SKILL.md

Create: src/components/training/Step09Inference.tsx

SECTION 1 — OVERVIEW:
  Label: "STEP 09 — INFERENCE OPTIMIZATION"
  Headline: "A trained model is often too large and slow for real use."

SECTION 2 — QUANTIZATION VISUALIZER:
  Precision slider with 5 stops: FP32 → BF16 → INT8 → INT4(GPTQ) → NF4
  Live 2×2 stats panel:
    Bits/weight: 32/16/8/4/4
    Memory (7B): 28/14/7/3.5/3.5 GB
    Quality bar: proportional fill, bg var(--ink)
    Run on: hardware required
  NF4 note about information-theoretically optimal representation.

SECTION 3 — SPECULATIVE DECODING ANIMATION:
  "▶ Simulate" button.
  Row 1: draft model proposes 4 tokens (mono pills, appear sequentially)
  Row 2: verifier checks — accepted (var(--ink) bg) or rejected
  (strikethrough, var(--muted)).
  Result: "3 of 4 accepted. Effective speedup: ~3×"
  prefers-reduced-motion: show final state immediately.

SECTION 4 — OPTIMIZATION COMPARISON TABLE:
  4×4 table: Technique / Memory saving / Speed gain / Quality cost
  Rows: INT8 / INT4 / Distillation / Speculative Decoding
  Quality cost shown as mono pills: "Low" / "Medium" / "High"

REGISTER + VERIFY: npx tsc --noEmit. Slider and animation work.
```

---

## PROMPT 10 — Step 10: Deployment

> **Files created:** `src/components/training/Step10Deployment.tsx`

```
Build Step 10 of Module 02 (Training): "Deployment"

Read first: src/tokens.css, Training.tsx, SKILL.md

Create: src/components/training/Step10Deployment.tsx

SECTION 1 — OVERVIEW:
  Label: "STEP 10 — DEPLOYMENT"
  Headline: "The model is ready. Now it needs to serve millions of requests."

SECTION 2 — INFERENCE PIPELINE FLOW:
  Vertical flow diagram: User Request → Load Balancer →
  Inference Server → Model → KV Cache → Safety Filter → Response
  Each node: bg var(--bg-panel), border 1px solid var(--stroke), r-md.
  Hover tooltips with one-sentence explanations.

SECTION 3 — KEY CONCEPTS:
  4 cards in 2×2 grid: KV Cache, Continuous Batching, PagedAttention, Streaming
  Each with stat: font-mono, text-lg, weight-semibold, ink.

SECTION 4 — FULL PIPELINE RECAP:
  Vertical timeline of all 10 stages with annotations.
  Step 10 highlighted: bg var(--bg-raised), weight-medium.
  Closing text + "Go to Benchmarks →" button (btn-primary).
  If /benchmarks doesn't exist: inline toast "Coming soon."

REGISTER + VERIFY: npx tsc --noEmit. All 10 steps navigable end-to-end.
```

---

## PROMPT 11 — Final Audit & Polish

> **What it does:** Audits all training components for design system compliance, tests end-to-end navigation, verifies mobile layouts.

```
Final audit of Module 02 (Training) in AiViz.

1. DESIGN TOKEN AUDIT:
   Scan every file in src/components/training/ and src/pages/Training.tsx.
   Find ANY hardcoded colour, font-size, spacing, border-radius, or
   shadow value that does not use a src/tokens.css variable.
   Fix all violations. List every change made.

2. CONSISTENCY CHECK:
   - Verify every step uses the same section label format
   - Verify card styles match across all steps
   - Verify button styles use btn-primary/btn-secondary classes
   - Verify font usage: --font-sans for UI, --font-mono for labels/code

3. MOBILE RESPONSIVENESS:
   - Verify sidebar collapses to horizontal pills on mobile
   - Verify 2-column grids become single column below 720px
   - Verify touch targets ≥ 44px on mobile
   - Verify side-by-side layouts stack vertically

4. ACCESSIBILITY:
   - Every section has aria-labelledby
   - Every interactive element is keyboard navigable
   - Every visualization has aria-label
   - prefers-reduced-motion disables all animations

5. NAVIGATION:
   - All 10 steps load via sidebar click
   - Keyboard left/right works through all steps
   - Step footer "Previous" / "Next" works correctly
   - Home page Module 02 card links to /training
   - Nav bar shows "Training" as active on /training

VERIFY:
- npx tsc --noEmit
- npx vitest run (all existing tests still pass)
- Visual check at 375px, 768px, and 1440px widths
```

---

## Verification Plan

### Automated Tests
| Check | Command |
|---|---|
| TypeScript compiles | `npx tsc --noEmit` |
| Existing tests pass | `npx vitest run` |

### Manual Verification (after each prompt)
1. Open `http://localhost:5173/training` in browser
2. Click through all completed steps in the sidebar
3. Use keyboard arrows to navigate between steps
4. Resize browser to mobile width (375px) — verify layout collapses
5. Check that the Home page (`/`) shows Module 02 as "live" with a working link

### End-to-End Verification (after Prompt 11)
1. Navigate from Home → Training → all 10 steps → back to Home
2. Test every interactive element in each step (sliders, buttons, animations)
3. Verify at 375px / 768px / 1440px widths
4. Run Lighthouse audit on `/training` — target 90+ on all scores
