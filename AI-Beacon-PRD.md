# AI Beacon — Product Requirements Document

> **Product name:** AI Beacon  
> **Deployment:** Cloudflare Pages (static, zero-backend)  
> **Design:** Minimal Monochrome Light — greyscale UI, no decorative color in shell; data visualizations use a separate `--viz-*` token set.

---

## 1. Product Overview

### 1.1 Vision

**AI Beacon** is a free, browser-native, zero-backend interactive toolkit that helps anyone — from a high school student to a senior ML engineer — understand how transformer-based Large Language Models work. Users can step through the internal mechanics of inference (tokenization, embedding, attention, sampling) and explore how LLMs are trained, benchmarked, and deployed. Key flows are computed or illustrated live in the browser with clear visualizations and minimal handwaving.

**Core thesis:** Understanding comes from doing and seeing. Users type their own text in the simulator, configure toy models, and follow training and benchmarking concepts through structured, interactive modules.

### 1.2 Target Users

| Persona | Goal |
|--------|-----|
| **Curious beginner** | Understand what an LLM “does” without the math |
| **CS student** | Validate understanding of transformers, visualize attention |
| **AI engineer** | Prototype intuitions, explain concepts to colleagues |
| **Educator** | Live classroom demo or reference tool |
| **Technical PM** | Build a mental model of LLM internals without code |

### 1.3 Key Differentiators

- **No installation.** Open in browser, start learning.
- **Live computation (simulator).** Numbers are real — computed from user input with toy dimensions.
- **Multi-module.** Simulator, Training walkthrough, Timeline, Benchmarks, Automation Clock — one coherent platform.
- **Step control.** Go forward, inspect, go back. No passive video.
- **Mathematically honest.** In the simulator, shapes and operations match what frameworks like PyTorch do at equivalent dimensions.

### 1.4 Competitive Landscape

| Tool | Limitation | AI Beacon advantage |
|------|------------|----------------------|
| Jay Alammar’s blog | Static images | Live computation, user’s own input |
| Andrej Karpathy’s minGPT | Code-only, terminal | Visual, browser-native |
| BertViz | Requires running model | Pure frontend, no model download |
| 3Blue1Brown videos | Passive | Interactive, pauseable, configurable |
| Hugging Face Spaces | Black box, often needs GPU | Toy math engine, instant |

---

## 2. Tech Stack

| Layer | Choice | Rationale |
|-------|--------|-----------|
| **Framework** | Vite 6 + React 19 | Light static SPA; no SSR overhead |
| **Language** | TypeScript 5+ (strict) | Type safety for tensor shapes and app logic |
| **State** | Zustand 5 | Minimal, performant global state |
| **Animation** | Framer Motion 11 | React-friendly animations, layout transitions |
| **Styling** | CSS custom properties (tokens) + Tailwind 4 | Design tokens in `src/tokens.css`; no hardcoded colors in UI |
| **Deployment** | Cloudflare Pages (static) | Free tier, instant deploys |
| **Testing** | Vitest + React Testing Library | Fast unit and component tests |

**Math (simulator):** Custom pure-TypeScript tensor and transformer math (no `mathjs`). Toy dimensions only (e.g. `d_model ≤ 64`, `n_tokens ≤ 12`) so everything runs instantly in the browser.

---

## 3. Platform Modules and Routes

| Module | Route | Description |
|--------|--------|-------------|
| **Home** | `/` | Hero, module grid, automation teaser, pipeline preview |
| **Transformer Simulator** | `/transformer-simulator` | Step-through transformer forward pass: raw text → tokenization → embedding → PE → attention → residual → layer norm → FFN → LM head → softmax → sampling. Custom math engine; shapes and values visible. |
| **Training Pipeline** | `/transformer-training-simulator` | 10-step interactive walkthrough: data collection, tokenizer, architecture, pre-training, evaluation, SFT, alignment (RLHF, DPO, etc.), benchmarking, inference, deployment. |
| **Timeline** | `/timeline` | Chronological view of LLM releases, research papers, and AI tools. Filter by model family, parameters, context, open-source status. |
| **Benchmarks** | `/benchmarks` | Curated leaderboard and charts: MMLU, HumanEval, GSM8K, Arena ELO, pricing, speed. Value maps, radar comparisons, glossary, sources. |
| **Automation Clock** | `/automation-clock` | Sector-wise view of AI automation impact over time (software, healthcare, finance, legal, etc.) with milestones and job-impact visualizations. |
| **About** | `/about` | Mission, deployment info, links. |

---

## 4. Transformer Simulator — Pipeline Steps

The simulator walks through 12 steps of a transformer forward pass. Each step has explanation, input/output shapes, and visualization (simple and/or advanced).

| Step | Name | Input shape | Output shape |
|------|------|-------------|--------------|
| 1 | Raw text input | — | `string` |
| 2 | Tokenization | `string` | `string[]` |
| 3 | Token ID mapping | `string[]` | `(n,) int` |
| 4 | Embedding lookup | `(n,) int` | `(n, d_model)` |
| 5 | Positional encoding | `(n, d_model)` | `(n, d_model)` |
| 6 | Self-attention | `(n, d_model)` | `(n, d_model)` |
| 7 | Residual connection | `(n, d_model)` × 2 | `(n, d_model)` |
| 8 | Layer normalization | `(n, d_model)` | `(n, d_model)` |
| 9 | Feed-forward network | `(n, d_model)` | `(n, d_model)` |
| 10 | LM head (final linear) | `(n, d_model)` | `(|V|,)` |
| 11 | Softmax + temperature | `(|V|,)` | `(|V|,)` |
| 12 | Sampling | `(|V|,)` | `int` (token id) |

Full mathematical breakdowns, data structures, and implementation details are in [AI-Beacon-Technical-Specs.md](./AI-Beacon-Technical-Specs.md).

---

## 5. Design System — Minimal Monochrome Light

- **UI shell:** Greyscale only. Tokens in `src/tokens.css`: `--bg`, `--bg-panel`, `--stroke`, `--primary`, `--ink`, `--muted`, etc. No color on nav, cards, text, or borders.
- **Data visualizations:** Charts, heatmaps, vector bars may use `--viz-*` tokens. Clear separation between UI and viz.
- **Typography:** `var(--font-sans)` for body, `var(--font-mono)` for code and labels.
- **Motion:** Respect `prefers-reduced-motion`; use token-based durations and eases.

---

## 6. User Controls (Simulator)

- **Model config:** `d_model` (4–64), `n_heads` (1–4, must divide `d_model`), `max_tokens` (2–12). Single layer in MVP.
- **Playback:** Previous step, Next step, Play all, Pause, Reset. Optional speed (slow / normal / fast).
- **Mode:** Simple (visual metaphors) vs Advanced (matrices, shapes, equations) where implemented.

---

## 7. Non-Functional Requirements

- **Performance:** Lazy-loaded step components; tensor caps (`d_model ≤ 64`, `n_tokens ≤ 12`).
- **Accessibility:** Keyboard navigation, `aria-label` on visualizations, `prefers-reduced-motion` support, semantic HTML.
- **Browser support:** Latest two versions of Chrome, Firefox, Safari.
- **SEO:** Per-page `<title>` and meta; Open Graph where applicable; single `<h1>` per page.

---

## 8. Documentation for Contributors

- **Product vision, personas, pipeline, design:** This document (AI-Beacon-PRD.md).
- **Code structure, data structures, tokens, math:** [AI-Beacon-Technical-Specs.md](./AI-Beacon-Technical-Specs.md).

Contributions should align with the PRD and technical specs and follow existing patterns (tokens, named exports, accessibility, tests).
