# 🌊 AI Beacon — LLM Visualizer PRD

> **Codename:** `AI Beacon` — *Deep Exploration of Probabilistic Transformer Heuristics*
> **Version:** 2.0.0
> **Status:** Approved — Ready for Step-by-Step Implementation
> **Deployment:** Vercel (static, zero-backend)
> **Design Aesthetic:** Bioluminescent Deep Sea — dark ocean floor (`#050d1a`), glowing cyan neural pathways, organic fluid animations, phosphorescent data particles

---

## 1. Product Overview

### 1.1 Vision

**AI Beacon** is a free, browser-native, zero-backend interactive simulator that lets anyone — from a high school student to a senior ML engineer — step through the internal mechanics of a transformer-based Large Language Model. Every matrix multiply, every softmax, every positional embedding is computed live in the browser using toy dimensions, rendered as glowing, animated visual artifacts.

**Core thesis:** Understanding comes from doing, not watching. Users type their own text, configure their own model, and watch their sentence flow through Q/K/V projections, attention, layer norm, and sampling — with every number visible, every shape labeled, and every equation hoverable.

### 1.2 Target Users

| Persona | Goal |
|---|---|
| **Curious Beginner** | Understand what an LLM "does" without the math |
| **CS Student** | Validate understanding of transformers, visualize attention |
| **AI Engineer** | Prototype intuitions, explain concepts to colleagues |
| **Educator** | Live classroom demo or reference tool |
| **Technical PM** | Build mental model of LLM internals without code |

### 1.3 Key Differentiators

- **No installation.** Open browser, start learning.
- **Live computation.** Numbers are real — computed from user input with toy weights.
- **Bi-modal learning.** Simple Mode (visual metaphors) and Advanced Mode (matrices, equations).
- **Step control.** Go forward, inspect, go back. No passive video.
- **Mathematically honest.** Shapes and outputs match what PyTorch produces at equivalent dimensions.

### 1.4 Competitive Landscape

| Tool | Limitation | AI Beacon Advantage |
|---|---|---|
| Jay Alammar's Blog | Static images | Live computation, user's own input |
| Andrej Karpathy's minGPT | Code-only, terminal | Visual, browser-native |
| BertViz | Requires running model | Pure frontend, no model download |
| 3Blue1Brown Videos | Passive | Interactive, pauseable, configurable |
| HuggingFace Spaces | Black box, needs GPU | Toy math engine, instant |

---

## 2. Tech Stack

| Layer | Choice | Rationale |
|---|---|---|
| **Framework** | Vite 6 + React 19 | Lightest static SPA setup; no SSR overhead |
| **Language** | TypeScript 5+ (strict) | Type safety for tensor shapes |
| **State** | Zustand 5 | Minimal, performant global state |
| **Animation** | Framer Motion 11 | React-native spring animations, layout transitions |
| **Styling** | Tailwind CSS 4 + CSS custom properties | Rapid prototyping + design tokens |
| **Deployment** | Vercel (static) | Free tier, instant deploys, analytics |
| **Testing** | Vitest + React Testing Library | Fast unit + component tests |

### Phase 2 Additions (not in MVP)
- **D3.js v7** — matrix heatmaps, attention grids, sinusoid charts
- **GSAP 3** — complex timeline sequencing
- **KaTeX** — LaTeX equation rendering
- **Playwright** — E2E browser tests

> **Note:** `mathjs` is NOT used. All tensor math is a custom pure-TypeScript implementation at toy dimensions (d_model ≤ 64). This keeps the bundle small and the math transparent.

---

## 3. LLM Pipeline — Steps Overview

The simulator walks through 15 steps of a transformer forward pass. Each step has: mathematical explanation, input/output shapes, visualization for both Simple and Advanced modes, and educational tooltips.

| Step | Name | MVP? | Input Shape | Output Shape |
|---|---|---|---|---|
| 1 | Raw Text Input | ✅ | — | `string` |
| 2 | Tokenization | ✅ | `string` | `string[]` |
| 3 | Token ID Mapping | ✅ | `string[]` | `(n,) int` |
| 4 | Embedding Lookup | ✅ | `(n,) int` | `(n, d_model)` |
| 5 | Positional Encoding | ✅ | `(n, d_model)` | `(n, d_model)` |
| 6 | Self-Attention | ✅ | `(n, d_model)` | `(n, d_model)` |
| 7 | Residual Connection | ✅ | `(n, d_model)` × 2 | `(n, d_model)` |
| 8 | Layer Normalization | ✅ | `(n, d_model)` | `(n, d_model)` |
| 9 | Feed-Forward Network | ✅ | `(n, d_model)` | `(n, d_model)` |
| 10 | LM Head (Final Linear) | ✅ | `(n, d_model)` | `(|V|,)` |
| 11 | Softmax + Temperature | ✅ | `(|V|,)` | `(|V|,)` |
| 12 | Sampling | ✅ | `(|V|,)` | `int` |
| 13 | Autoregressive Loop | Phase 2 | — | — |
| 14 | KV Cache (Conceptual) | Phase 2 | — | — |
| 15 | Dropout (Training Mode) | Phase 2 | — | — |

> Full mathematical breakdowns, equations, and implementation details for each step are in [technical_specs.md](./technical_specs.md).

---

## 4. Dual Mode UI

### 4.1 Simple Mode (Default)

**Philosophy:** Concepts through metaphor, color, and motion. No numbers, no matrices.

- Tokens are glowing pills flowing through the pipeline
- Embedding = "each token gets a unique color"
- Attention = lines connecting tokens (thickness = weight)
- FFN = "tokens pass through a filter" (funnel shape)
- Sampling = "spotlight on vocabulary — which word comes next?"
- Narrative text auto-scrolls at bottom explaining each step
- No heatmaps, no numbers — just visual flow

### 4.2 Advanced Mode (Phase 2)

**Philosophy:** Full numerical transparency for engineers.

- Matrix heatmaps for every tensor (color coded: negative → zero → positive)
- Shape labels on every tensor: `(4, 8) float32`
- Hover any matrix cell: tooltip with exact value, row/col index
- Hover step header: equation popover (KaTeX)
- Export tensor state as JSON
- "Freeze" button to halt animation and inspect

---

## 5. Page Structure

### 5.1 Landing Page

A hero landing page is the entry point (not the simulator directly):

- **Hero section:** Animated bioluminescent background with tagline: *"See how AI thinks — one matrix at a time"*
- **What is this?** — Brief explanation with animated preview
- **Who is it for?** — Persona cards (Beginner, Student, Engineer, Educator)
- **How it works** — 3-step summary with icons
- **"Start Exploring →"** CTA button → navigates to simulator
- **Footer:** Credits, GitHub link, "Built with ❤️ for learning"

### 5.2 Simulator Layout

```
┌──────────────────────────────────────────────────────────────────┐
│  AI Beacon [logo]          [Simple ↔ Advanced]     [⚙ Config] [?]   │
├──────────┬───────────────────────────────────────┬───────────────┤
│ Control  │         Pipeline Canvas               │  Inspector    │
│  Panel   │                                       │  Panel        │
│ (280px)  │    (fluid, full remaining width)      │  (320px)      │
│          │                                       │               │
│ ─ Input  │  [Step 1] → [Step 2] → [Step 3] → …  │  Step details │
│ ─ Model  │                                       │  Shapes       │
│ ─ Attn   │  Active step: expanded view           │  Equations    │
│ ─ Smpl   │                                       │               │
│          ├───────────────────────────────────────┤               │
│          │  [◀◀ Back] [▶ Step] [▶▶ Play] [↺]    │               │
└──────────┴───────────────────────────────────────┴───────────────┘
```

### 5.3 Responsive Strategy

| Breakpoint | Layout |
|---|---|
| `< 768px` | Single column. Pipeline scrolls vertically. Controls collapse to bottom drawer. Inspector hidden (inline on tap). |
| `768–1280px` | Two columns (controls + canvas). Inspector hidden, appears inline. |
| `> 1280px` | Full three-column layout. |

**Mobile-first approach:** The pipeline becomes a vertical scrolling card stack on mobile. Each step is a full-width card. Swipe or tap to advance.

### 5.4 Onboarding Tour

On first visit (tracked via `localStorage`):
1. "Welcome to AI Beacon!" — overlay explaining the tool
2. "Type your sentence here" — highlights input box
3. "Click Step to advance" — highlights playback controls
4. "Hover anything for details" — highlights tooltip areas
5. "Switch to Advanced Mode when ready" — highlights mode toggle

Skip button always visible. Tour state persisted.

---

## 6. User Controls

### 6.1 Model Configuration

| Parameter | Options | Default | Constraints |
|---|---|---|---|
| `d_model` | 4, 8, 16, 32, 64 | 8 | Must be divisible by `n_heads` |
| `n_heads` | 1, 2, 4 | 1 (MVP) | ≤ 4, must divide `d_model` |
| `n_layers` | 1 | 1 (locked MVP) | — |
| `max_tokens` | 2–12 | 8 | Performance cap |

### 6.2 Pipeline Toggles (MVP defaults bolded)

- **Tokenizer:** **Word Split** · WordPiece · BPE · SentencePiece *(Phase 2)*
- **Positional Encoding:** **Sinusoidal** · Learned · RoPE · ALiBi *(Phase 2)*
- **Activation:** **GELU** · ReLU · SwiGLU · GLU *(Phase 2)*
- **Sampling:** **Greedy** · Top-k · Top-p · Beam Search *(Phase 2)*
- **Temperature:** Slider 0.1–2.0, default 1.0

### 6.3 Playback

- **◀◀ Prev Step** — Restores previous snapshot from undo stack
- **▶ Step** — Computes next step, pushes snapshot, animates
- **▶▶ Play All** — Auto-advances at configurable speed
- **■ Pause** — Freezes mid-animation
- **↺ Reset** — Clears all tensors, returns to Step 0, keeps config
- **Speed:** Slow (3×) · Normal (1×) · Fast (0.3×)

---

## 7. Educational Features

### 7.1 Tooltip System (three tiers)

1. **Shape Labels** — Always visible in Advanced Mode near matrices: `(4, 8) float32`
2. **Concept Tooltips** — Hover step header: equation, explanation, "why it matters"
3. **Cell Tooltips** — Hover heatmap cell: exact value, row/col, token mapping

### 7.2 Concept Cards

Each step has a collapsible card with:
- What it does (1 sentence)
- Why it matters (2 sentences)
- Real LLM dimensions (GPT-2 vs LLaMA-3 comparison)
- Common gotchas
- PyTorch equivalent code (copyable)

### 7.3 Shape Tracking Panel

Collapsible right-panel section showing all tensor shapes at current state. Click any row to highlight that tensor in the pipeline.

---

## 8. Non-Functional Requirements

### 8.1 Performance

- Initial JS bundle: < 150KB gzipped (hard limit: 250KB)
- Load time: < 2s on fast connection, < 4s on 4G
- 60fps animations on M1 MacBook; graceful degradation on low-end devices
- All step components lazy-loaded via `React.lazy()`
- Tensor computations capped: `d_model ≤ 64`, `n_tokens ≤ 12`

### 8.2 Accessibility

- All heatmaps have `aria-label` with shape and value summary
- Color scale uses both hue AND luminance (color-blind safe)
- All interactive elements keyboard-navigable (Tab + Enter)
- `prefers-reduced-motion`: disable all animations, show static states
- Simple Mode text descriptions serve as implicit alt-text
- React error boundaries wrap every pipeline step component

### 8.3 Browser Support

Chrome, Firefox, Safari — latest 2 versions. No IE.

### 8.4 Analytics

Vercel Analytics (free tier) for:
- Page views, unique visitors
- Most-used pipeline steps (custom events)
- Simple vs Advanced mode usage split
- Average session duration

### 8.5 SEO

- Proper `<title>` and `<meta description>` on landing page
- Open Graph tags for social sharing
- Single `<h1>` per page
- Semantic HTML throughout

---

## 9. Roadmap

### MVP — Phase 1

**Scope:** Landing page + simulator with 12 steps, single-head, Simple Mode only, word-split tokenizer, sinusoidal PE, GELU, greedy sampling.

**Acceptance Criteria:**
- User visits landing page, clicks "Start Exploring"
- Types a ≤ 8-word sentence
- Clicks "Play All" and watches 12 steps animate
- Hovers any step for tooltip
- Steps backward to revisit attention
- Works on Chrome/Firefox/Safari (latest 2)
- Loads in < 2s, passes Lighthouse > 90
- Fully responsive on mobile

### Phase 2 (post-MVP)

- Advanced Mode (matrices, heatmaps, equations, KaTeX)
- Multi-head attention (1–4 heads)
- BPE and WordPiece tokenizers
- RoPE and ALiBi positional encodings
- Top-k, Top-p sampling + temperature slider
- Autoregressive loop (Steps 13–14)
- D3.js heatmaps, GSAP timeline animations
- Full tooltip system (cell-level hover)
- Performance comparison panel

### Future Ideas (unscoped)

- KV Cache visualization
- Beam search sampling
- SwiGLU/GLU activations
- Multi-layer support (2–3 layers)
- Gradient flow visualization (conceptual)
- Tensor JSON export
- Shareable URLs (config in hash)
- Training visualization mode
- Attention pattern gallery

---

## 10. Risks & Mitigations

| Risk | Severity | Mitigation |
|---|---|---|
| **Math incorrectness** | HIGH | Unit tests with PyTorch golden values; tolerance 1e-5 |
| **UX overwhelm** | HIGH | Default Simple Mode; only active step expanded; onboarding tour |
| **Scope creep** | HIGH | Hard phase gates; feature flags; nothing from Phase 2 in MVP |
| **Browser performance** | MEDIUM | Hard caps on dimensions; memoized renders; lazy loading |
| **Tokenizer fidelity** | LOW | Label as "Demo BPE (simplified)"; link to real tokenizer tools |
| **Accessibility gaps** | MEDIUM | ARIA labels; keyboard nav; `prefers-reduced-motion`; color-blind safe scales |
