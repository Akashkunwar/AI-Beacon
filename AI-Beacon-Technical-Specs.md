# AI Beacon — Technical Specifications

> Code-level specifications, data structures, component architecture, and implementation details for AI Beacon.  
> Product vision and design intent: [AI-Beacon-PRD.md](./AI-Beacon-PRD.md).

---

## 1. Project Structure

```
AI-Beacon/
├── index.html
├── vite.config.ts
├── tsconfig.json
├── package.json
├── AI-Beacon-PRD.md
├── AI-Beacon-Technical-Specs.md
│
├── public/
│   ├── favicon.svg
│   ├── robots.txt
│   └── sitemap.xml
│
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── index.css              # Imports tokens.css, global reset
│   ├── tokens.css             # Single source of truth: palette, type, spacing, motion
│   │
│   ├── pages/
│   │   ├── Home.tsx
│   │   ├── SimulatorPage.tsx
│   │   ├── Training.tsx
│   │   ├── Timeline.tsx
│   │   ├── BenchmarksPage.tsx
│   │   ├── AutomationClockPage.tsx
│   │   ├── About.tsx
│   │   └── NotFound.tsx
│   │
│   ├── components/
│   │   ├── core/
│   │   │   ├── SimulatorShell.tsx
│   │   │   ├── PipelineCanvas.tsx
│   │   │   └── StepRouter.tsx
│   │   ├── controls/
│   │   │   ├── ControlPanel.tsx
│   │   │   ├── ModelConfigForm.tsx
│   │   │   ├── PlaybackControls.tsx
│   │   │   └── ModeToggle.tsx
│   │   ├── pipeline/
│   │   │   ├── RawInputStep.tsx … SamplingStep.tsx  (12 steps)
│   │   ├── visualizers/
│   │   │   ├── MatrixHeatmap.tsx, VectorBar.tsx, AttentionHeatmap.tsx
│   │   │   ├── TokenBadge.tsx, ShapeLabel.tsx, FlowArrow.tsx
│   │   ├── educational/
│   │   │   ├── TooltipEngine.tsx, ConceptCard.tsx, OnboardingTour.tsx
│   │   │   ├── HeroVisual.tsx, ScaleVisual.tsx, OpenSourceVisual.tsx
│   │   ├── training/          # Step01DataCollection … Step10Deployment, alignment panels
│   │   ├── timeline/          # TimelineHeader, TimelineCanvas, TimelineTable, TimelinePopup, TimelineNode
│   │   ├── benchmarks/        # BenchmarkLeaderboard, ValueMap, SpeedChart, RadarComparison, etc.
│   │   ├── automation/        # YearSlider, SectorCard, ImpactMetric, MilestoneTimeline, etc.
│   │   ├── shared/
│   │   │   ├── Nav.tsx, Footer.tsx, GlassCard.tsx, Badge.tsx
│   │   │   ├── NumberDisplay.tsx, ErrorBoundary.tsx
│   │   │   ├── PrimaryButton.tsx, SecondaryButton.tsx, index.ts
│   │   └── common/
│   │       ├── SEO.tsx, ScrollToTop.tsx, SkipToMain.tsx
│   │
│   ├── config/
│   │   └── site.ts            # baseUrl, githubUrl, ogImageUrl
│   ├── data/
│   │   ├── benchmarkData.ts
│   │   ├── automationData.ts
│   │   ├── LLM_Timeline_Dataset.json
│   │   ├── Research_Papers_Dataset.json
│   │   └── AI_Tools_Dataset.json
│   ├── hooks/
│   │   └── useReducedMotion.ts
│   ├── lib/
│   │   ├── mathEngine/
│   │   │   ├── tensor.ts, matmul.ts, attention.ts, softmax.ts
│   │   │   ├── positional.ts, normalization.ts, activations.ts, sampling.ts
│   │   │   └── index.ts
│   │   ├── tokenizer/
│   │   │   ├── wordSplit.ts, vocab.ts
│   │   └── store/
│   │       ├── simulatorStore.ts, stepMachine.ts, types.ts
│   ├── utils/
│   │   ├── timeline.ts, interpolationUtils.ts
│   ├── types/
│   │   └── vite-env.d.ts
│   └── __tests__/
│       ├── setup.ts
│       ├── mathEngine/        # tensor, matmul, attention, softmax, normalization, embedding_pe_integration
│       └── store/             # stepMachine
```

---

## 2. Design System Tokens

All visual values come from **`src/tokens.css`** (imported by `src/index.css`). No hardcoded colors, spacing, or typography in components.

### UI shell (greyscale only)

| Token | Purpose |
|-------|--------|
| `--bg`, `--bg-panel`, `--bg-raised` | Backgrounds |
| `--stroke`, `--stroke-dark` | Borders, dividers |
| `--muted`, `--secondary`, `--primary`, `--ink` | Text hierarchy |
| `--bg-inverse`, `--text-inverse` | Dark buttons, chips |
| `--font-sans`, `--font-mono` | Typography |
| `--text-xs` … `--text-hero` | Type scale |
| `--s1` … `--s8` | Spacing |
| `--r-sm` … `--r-pill` | Border radius |
| `--shadow-soft`, `--shadow-lift` | Shadows |
| `--ease-out`, `--dur-fast/base/slow` | Motion |

### Data visualizations only

Use **only** in charts, heatmaps, vector bars, and data UI — never on nav, cards, or body text:

- `--viz-1` … `--viz-5` (categorical series)
- `--viz-neg`, `--viz-pos-lo/hi`, `--viz-neg-lo/hi`
- `--viz-heat-lo/hi`, `--viz-accent`, `--viz-bar-top`, `--viz-bar-rest`
- `--viz-residual-pos/neg`, `--viz-sampling-*`, etc.

### Rules

- UI shell: greyscale tokens only.
- Data viz: `--viz-*` (and grey scale extended where needed).
- Respect `prefers-reduced-motion`; use token durations.

---

## 3. Core Type Definitions

See **`src/lib/store/types.ts`** for:

- **PipelineStep** enum (INPUT … SAMPLING)
- **StepMeta** (label, shortLabel, requires, description, educationalNote)
- **ModelConfig** (dModel, nHeads, nLayers, maxTokens, dFF, seed)
- **SimulatorState** (config, mode, currentStep, stepHistory, tensors, actions)
- **StepSnapshot** (for undo/redo)
- **TensorRegistry** (embed, posenc, attention, residual, layernorm, ffn, lm_head, softmax, sampling, etc.)

Tokenizer, PE, activation, and sampling types are constrained in MVP (e.g. `word_split`, `sinusoidal`, `gelu`, `greedy`).

---

## 4. Tensor and Math Engine

- **`src/lib/mathEngine/tensor.ts`:** `Tensor` class — `Float32Array`, immutable operations (matmul, add, scale, softmax, layerNorm, reshape, transpose, row). Factory: `zeros`, `randn`, `fromArray`. Deterministic RNG from `config.seed`.
- **No `mathjs`.** All operations are custom; toy dimensions only (`d_model ≤ 64`, `n_tokens ≤ 12`).
- **Key modules:** `matmul.ts`, `attention.ts`, `softmax.ts`, `positional.ts`, `normalization.ts`, `activations.ts`, `sampling.ts`.

Step execution is implemented in **`src/lib/store/stepMachine.ts`**: each step computes the next tensor state; the Zustand store keeps history for step-back and reset.

---

## 5. Routing

| Path | Page |
|------|------|
| `/` | Home |
| `/transformer-simulator` | SimulatorPage |
| `/transformer-training-simulator` | Training |
| `/timeline` | Timeline |
| `/benchmarks` | BenchmarksPage |
| `/automation-clock` | AutomationClockPage |
| `/about` | About |
| `/404`, `*` | NotFound |

---

## 6. Error Handling and Accessibility

- **ErrorBoundary** wraps pipeline step components; shows a friendly message and “Reset to previous step” where applicable.
- Math guards: dimension checks in matmul; NaN checks; caps on dimensions with clear user messages.
- **Accessibility:** Keyboard navigation, `aria-label` on visualizations, focus styles, `prefers-reduced-motion` support, semantic HTML.

---

## 7. Build and Test

```bash
npm install
npm run dev      # Vite dev server
npm run build    # tsc -b && vite build
npm run preview  # Serve dist locally
npm run lint     # ESLint
npm run test     # Vitest
```

Deploy `dist/` to Cloudflare Pages (or any static host). Path alias `@/` → `src/`.

---

## 8. References

- Product vision and modules: [AI-Beacon-PRD.md](./AI-Beacon-PRD.md)
- Design tokens: `src/tokens.css`
- Site config (base URL, GitHub, OG): `src/config/site.ts`
