# AI Beacon — Product Requirements

> **Status:** current as of 28 September 2026 · **Hosting:** static site (Cloudflare Pages) · **Licence:** MIT

## 1. Vision

AI Beacon is a free, open-source, browser-only guide to how modern AI works. Anyone — a curious teenager, a product manager, a CS student, an ML engineer, a teacher — should be able to open it, understand what a large language model does, and check every claim against a primary source.

**Principles**

1. **Learn by doing.** Every module has something to type, drag, click or compare. Explanations sit next to the thing they explain.
2. **Honest by default.** Real computations where possible; figures from primary sources with links; illustrative content labelled as such; unknown values left blank.
3. **Plain language first, depth on demand.** Lead with an everyday explanation; put maths, shapes and code behind *Advanced* mode or "Go deeper".
4. **Zero friction.** No account, no install, no backend, no tracking. Works on a phone.
5. **Easy to keep current.** Data lives in typed files with automated integrity tests and a written data guide.

## 2. Audience

| Persona | Needs | Where they start |
|---|---|---|
| Curious beginner | What an LLM does, without maths | Home → How LLMs Work (Simple) |
| Student | Intuition for tokens, attention, training | How LLMs Work → How AI Is Trained |
| Engineer | Concrete numbers: shapes, KV cache, compute, benchmarks | Advanced mode, architecture calculator, Benchmarks |
| Educator | Classroom demos with shareable links | Simulator, training stages (`?stage=`), timeline filters in the URL |
| Decision-maker | What models can do, cost, and effect on work | Benchmarks, AI & Jobs |

## 3. Modules

| # | Module | Route | Must do |
|---|---|---|---|
| — | Home | `/` | Explain the site in one screen; live attention grid; suggested learning path; latest releases |
| 01 | AI Timeline | `/timeline` | Models, papers and tools on one zoomable, non-overlapping timeline plus a sortable table; filters (search, company, type, modality, licence, years) and the open item synced to the URL; detail dialog with specs, lineage and sources |
| 02 | How LLMs Work | `/transformer-simulator` | 12-step forward pass of a one-block transformer computed live (see §4); jump to any step; Simple/Advanced modes; settings for width, heads, context window and seed; append the predicted token and rerun |
| 03 | How AI Is Trained | `/transformer-training-simulator` | Ten stages (data → tokenizer → architecture → pre-training → monitoring → fine-tuning → feedback & RL → evaluation → efficiency → deployment), each with goal / how / watch-out, at least one interactive element, and sources; each stage addressable by `?stage=` |
| 04 | Benchmarks | `/benchmarks` | Lab-reported scores on current benchmarks with per-model sources; leaderboard, progress over time, score vs price, head-to-head compare, glossary with caveats, and links to live leaderboards |
| 05 | AI Impact Index | `/automation-clock` | Evidence cards from major studies with links; why estimates differ; an explicitly illustrative sector scenario explorer; methodology |
| — | About | `/about` | Methodology, data review dates, how to report errors, licence |

## 4. Simulator specification

A single post-LN transformer block, as in *Attention Is All You Need*, with random weights (scaled by 1/√fan-in) and a 512-token word-and-punctuation vocabulary.

| # | Step | Output |
|---|---|---|
| 1 | Input text | string |
| 2 | Tokenization (lowercase words + punctuation, truncated to the context window) | `n` tokens |
| 3 | Token IDs | `(n)` |
| 4 | Embedding lookup | `(n, d_model)` |
| 5 | Sinusoidal positional encoding | `(n, d_model)` |
| 6 | Multi-head causal self-attention (heads split and concatenated, then W_O) | `(n, d_model)`; per-head weights `(n, n)` |
| 7 | Residual connection | `(n, d_model)` |
| 8 | Layer normalization | `(n, d_model)` |
| 9 | Feed-forward (GELU, 4× width) + residual + layer norm | `(n, d_model)` |
| 10 | LM head on the last token | `(512)` logits |
| 11 | Softmax with temperature (recomputed in place) | `(512)` probabilities |
| 12 | Greedy or seeded top-k sampling | one token |

Settings: `d_model` ∈ {4, 8, 16, 32, 64}; heads ∈ {1, 2, 4} dividing `d_model`; context window ∈ {4, 8, 12}; seed. Changing a setting rebuilds the model and restarts at step 1. The UI must state clearly that weights are untrained and the prediction is meaningless.

## 5. Content and data requirements

- Every numeric claim about a real model, study or product links to a primary source (see `docs/DATA-GUIDE.md`).
- Datasets carry a review date shown on the site; the homepage counters must match the datasets (enforced by tests).
- Illustrative visuals (simulated training runs, the jobs scenario index, example model outputs) are labelled where they appear.

## 6. Design

"Refined Monochrome": a greyscale interface in light and dark themes (following the system setting until the user chooses), Geist and Geist Mono type, generous spacing, and colour reserved for data. Charts use a colour-blind-checked categorical palette with legends and tooltips; values are never encoded by colour alone. See the technical spec for tokens.

## 7. Non-functional requirements

| Area | Requirement |
|---|---|
| Performance | Route-level code splitting; datasets, simulator steps and training stages load on demand |
| Accessibility | Keyboard operation (including ←/→ step navigation), visible focus, labelled controls and charts, one `<h1>` per page, `prefers-reduced-motion` respected, sufficient contrast in both themes |
| Responsiveness | Usable from 360 px wide; no horizontal page scroll |
| SEO | Per-page title, description, canonical URL, Open Graph image, structured data, sitemap |
| Privacy | No cookies, analytics or third-party requests at runtime (fonts are self-hosted) |
| Quality | `npm run check` (typecheck, ESLint, Vitest) and `npm run build` pass on every change |

## 8. Out of scope

User accounts, server-side inference, running trained model weights, and real-time benchmark scraping.
