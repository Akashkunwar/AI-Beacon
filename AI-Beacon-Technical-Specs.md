# AI Beacon — Technical Specification

> Architecture, design system and data model. Product intent: [AI-Beacon-PRD.md](./AI-Beacon-PRD.md). Data rules: [docs/DATA-GUIDE.md](./docs/DATA-GUIDE.md).

## 1. Overview

A static single-page app: Vite 6, React 19, TypeScript (strict), React Router 7. There is no backend. Pages are lazy-loaded routes; large datasets, the 12 simulator steps and the 10 training stages are further split into on-demand chunks.

```text
src/
├── App.tsx                    # Routes (lazy), error boundary, loading fallback
├── main.tsx                   # Fonts, global CSS, router + helmet providers
├── tokens.css                 # Design tokens, light + dark
├── index.css                  # Reset and shared component classes
├── pages/                     # Home, Timeline, SimulatorPage, Training, BenchmarksPage,
│                              # AutomationClockPage, About, NotFound
├── components/
│   ├── shared/                # Nav, Footer, PageHeader/SectionHeader, ButtonLink, Icons,
│   │                          # ThemeToggle, Reveal, ErrorBoundary
│   ├── common/                # SEO (title/meta/OG/JSON-LD), ScrollToTop, SkipToMain
│   ├── home/HeroAttention     # Live attention grid computed by the simulator engine
│   ├── timeline/              # TimelineCanvas, TimelineFilters, TimelineTable, TimelineDetail
│   ├── core/                  # SimulatorShell (layout, rail, inspector, drawers), StepRouter
│   ├── controls/              # ModeToggle, ModelSettings, PlaybackControls
│   ├── pipeline/              # 12 *Step components, StepKit primitives, stepUtils
│   ├── educational/           # ConceptCard ("Go deeper"), LearningGuide
│   ├── training/              # stages.ts (metadata), Stage* components, TrainingKit, format
│   ├── benchmarks/            # Leaderboard, Progress, ScoreVsPrice, ModelCompare, Glossary, Sources
│   ├── automation/            # ImpactExplorer
│   └── charts/                # chartKit (tooltip + CSS), LineChart
├── config/                    # modules.ts (module registry), site.ts (URLs)
├── data/                      # Datasets and typed loaders (see §5)
├── hooks/                     # useTheme, useReducedMotion, useWidth
├── lib/
│   ├── mathEngine/            # Tensor, matmul, attention, softmax, layer norm, GELU, sampling
│   ├── store/                 # types, stepMachine (pure), simulatorStore (Zustand)
│   └── tokenizer/             # 512-token vocabulary, word + punctuation tokenizer
└── utils/                     # timeline.ts (dates, formatting, layout), vizColor.ts
```

`src/config/modules.ts` is the single registry of module names, numbers, routes and summaries used by the nav, home page, footer, About and 404.

## 2. Design system

### Tokens (`src/tokens.css`)

| Group | Tokens |
|---|---|
| Surfaces | `--bg`, `--bg-panel`, `--bg-raised`, `--bg-sunken`, `--bg-inverse`, `--overlay` |
| Text | `--ink` (strongest), `--primary`, `--secondary`, `--muted`, `--text-inverse` |
| Lines | `--stroke`, `--stroke-dark`, `--focus-ring` |
| Status | `--success`, `--warning`, `--danger`, `--link` |
| Data | `--viz-1`…`--viz-5` (categorical, fixed order), `--viz-neg` (negative pole), `--viz-heat-lo/-hi` (sequential), `--viz-grid`, `--viz-on-fill`, plus derived mixes |
| Type | `--font-sans` (Geist), `--font-mono` (Geist Mono), `--text-2xs`…`--text-3xl`, weights, tracking, leading |
| Space & shape | `--s1`…`--s8`, `--r-xs`…`--r-xl`, `--r-pill`, shadows, `--nav-height`, container widths |
| Motion | `--dur-fast/-base`, `--ease-out` |

Dark mode is a second set of the same tokens under `:root[data-theme='dark']`. An inline script in `index.html` sets `data-theme` before first paint from `localStorage['ai-beacon-theme']`, falling back to `prefers-color-scheme`; `useTheme()` keeps it in sync. Components use tokens only — no raw colours.

The categorical palette was validated for colour-vision deficiencies against both surfaces. Charts follow the same rules everywhere: thin marks, 2 px lines, legends for two or more series, direct labels only where useful, a tooltip layer, and no dual axes. `utils/vizColor.ts` provides `tint`, `heat` and `signed` (diverging) colour helpers built on `color-mix()`.

### Shared classes (`src/index.css`)

`.page`, `.container(-wide|-narrow)`, `.section`, `.eyebrow`, `.card(-pad|-interactive)`, `.btn(-primary|-secondary|-ghost|-sm)`, `.icon-btn`, `.segmented` (tabs/radios via `aria-selected|pressed|checked`), `.pill`, `.chip`, `.input`, `.select`, `.field-label`, `.table-wrap` + `.data-table`, `.skeleton`, `.sr-only`. Component-specific CSS is colocated in a `<style>` block per component with a short class prefix.

## 3. Simulator (Module 02)

### Engine

- `lib/mathEngine/tensor.ts` — immutable `Tensor` (Float32Array + shape) with matmul, add, scale, softmax (with temperature), layer norm, transpose, row slicing, and a seeded LCG (`Tensor.randn(shape, seed)`).
- `lib/mathEngine/attention.ts` — Q/K/V projections, scaled dot-product attention with causal mask, `splitHeads` / `concatHeads`.
- `lib/mathEngine/sampling.ts` — `greedySample`, `topK`, seeded `topKSample`.
- `lib/tokenizer` — lowercase words and single punctuation marks; 512 unique tokens, ID 0 = `<unk>`.

### Step machine (`lib/store/stepMachine.ts`)

`executeStep(step, state)` is a pure function that returns a new `TensorRegistry`. The model is one post-LN block with weights initialised as `N(0,1)/√fan_in` from fixed seed offsets:

```text
X      = W_e[ids] + PE                                   (n, d)
A      = concat_h softmax(Q_h K_hᵀ/√d_h + mask) V_h · W_O  (n, d)
H      = LayerNorm(X + A)
out    = LayerNorm(H + GELU(H W₁) W₂)                    d_ff = 4d
logits = out[n−1] · W_lm                                 (512)
p      = softmax(logits / T)
next   = argmax(p)  or  top-k draw (seeded)
```

`countParameters(config)` reports the model size shown in the UI.

### Store (`lib/store/simulatorStore.ts`)

Zustand state: `config`, `mode` (`simple`/`advanced`), `inputText`, `currentStep`, `stepHistory` (snapshots for undo), `tensors`, `stepError`, `temperature`, `samplingMethod`, `topK`, play state. Actions: `stepForward`, `stepBackward`, `goToStep`, `playAll`/`pause`/`reset`, `updateConfig` and `setInput` (both reset the run), `setTemperature` and `setSampling` (recompute softmax/sampling in place, including history), `appendPrediction` (append the token and rerun to the end).

### UI

`SimulatorShell` lays out the step rail + settings, the scrollable step area (scroll reset per step), and the "data so far" inspector; below 1280 px the inspector and below 1024 px the settings move into drawers and the rail becomes a horizontal strip. ←/→ step through the pipeline. Each step uses `StepKit`: `StepFrame`, `Panel`, `Callout`, `Formula`, `Shapes` and `Advanced` (Advanced-only), `Facts`, `TokenPicker`, `MatrixGrid` (diverging or heat grid with hover readout and causal masking), `BarList`, `DimBars`.

## 4. Training module (Module 03)

`components/training/stages.ts` defines the ten stages (`id`, `title`, `phase`, `lede`, `goal`, `how`, `watch`). `pages/Training.tsx` reads `?stage=` from the URL, renders the sticky phase rail (strip on small screens), the stage header and "at a glance" box, the lazy stage component, and prev/next links. `TrainingKit` provides `Block`, `Note`, `Steps`, `StatGrid`, `Sources`, `Tabs`, `CardGrid`; `charts/LineChart` provides responsive line charts with crosshair tooltips, reference lines and shaded bands.

Computations in stages are real where it matters: BPE merges on the Sennrich et al. corpus, parameter / KV-cache / 6·N·D compute formulas reproducing published model sizes, Chinchilla-optimal allocation (`N = √(C/120)`, `D = 20N`), weight-memory and KV-cache work counts. Simulated curves (loss, training run, failure modes) are labelled as illustrative.

## 5. Data model

| File | Shape | Notes |
|---|---|---|
| `LLM_Timeline_Dataset.json` | `{ metadata, models: ModelEntry[] }` | Types in `data/timeline.ts`; categories, modalities and field rules in the data guide |
| `Research_Papers_Dataset.json` | `{ metadata, papers: PaperEntry[] }` | Every paper has a `paper_url` and `category` |
| `AI_Tools_Dataset.json` | `{ metadata, tools: ToolEntry[] }` | `group`, optional `date_precision: 'month'` |
| `datasetMeta.ts` | counts + `lastUpdated` | Home/About counters; tested against the JSON |
| `benchmarkData.ts` | `METRICS`, `BENCHMARK_MODELS`, `NEWEST_MODELS`, `LIVE_LEADERBOARDS` | Per-model `source`; scores as published |
| `impactData.ts` | `EVIDENCE`, `EXPOSURE_DEFINITIONS`, `SECTORS`, `MILESTONES` | Sector index is editorial and labelled as such |
| `tokenizerSamples.ts` | real GPT-2 / GPT-4 / GPT-4o tokenizations | Generated with `gpt-tokenizer` |

`data/timeline.ts` loads each timeline dataset with a cached dynamic import and normalises records into a common `TimelineItem` (`kind`, `slug`, `name`, `org`, `date`, `category`, `openSource`, `meta`, `haystack`). `utils/timeline.ts` parses dates as UTC (no off-by-one in western time zones) and computes a density-aware layout so cards never overlap.

## 6. Routing, SEO and URL state

| Route | Page | URL state |
|---|---|---|
| `/` | Home | — |
| `/timeline` | Timeline | `tab`, `q`, `org`, `type`, `modality`, `license`, `from`, `to`, `item` |
| `/transformer-simulator` | How LLMs Work | — (store) |
| `/transformer-training-simulator` | How AI Is Trained | `stage` |
| `/benchmarks` | Benchmarks | — |
| `/automation-clock` | AI Impact Index | — |
| `/about` | About | — |
| `*` | NotFound (noindex) | — |

`SEO` sets the title (`… | AI Beacon`), description, canonical URL, Open Graph/Twitter tags (image: `public/og-image.png`) and optional JSON-LD. `public/sitemap.xml` lists every route and training stage.

## 7. Quality

| Command | Covers |
|---|---|
| `npm run typecheck` | `tsc -b`, strict mode |
| `npm run lint` | ESLint 9 flat config: `@eslint/js`, `typescript-eslint`, React Hooks, React Refresh |
| `npm test` | Vitest (jsdom): tensor maths, attention, softmax, normalisation, the step machine and store, vocabulary, and dataset integrity |
| `npm run check` | All three |
| `npm run build` | Typecheck + production build |

## 8. Accessibility

Skip link, one `<h1>` per page, labelled landmarks, keyboard-operable tabs, sliders and dialogs (focus trap and Escape in the timeline detail dialog), visible focus rings, `aria-live` readouts for step changes and chart hovers, text alternatives on charts, and animations disabled under `prefers-reduced-motion`.
