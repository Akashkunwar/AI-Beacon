# 🚀 AI Beacon — Step-by-Step Build Guide

> Each step is self-contained, testable, and deployable.
> Complete one step at a time. Verify it works. Then move to the next.
> **Total steps: 11**

---

## Step 1: Project Scaffolding & Design System

### What You Build
- Initialize Vite + React + TypeScript project
- Install dependencies: Zustand, Framer Motion, Tailwind CSS
- Set up folder structure from `technical_specs.md` (empty placeholder files)
- Configure design system: CSS tokens, fonts, base styles in `index.css`
- Create shared components: `GlassCard`, `Badge`, `ErrorBoundary`
- Configure Vite for path aliases (`@/`)
- Verify project builds and runs locally

### Deliverables
- Working dev server (`npm run dev`) showing a blank page with correct dark background (`#050d1a`)
- All CSS design tokens defined and working
- `GlassCard` component renders correctly with glow hover effect
- Folder structure created per technical_specs.md

### Testing
- `npm run dev` starts without errors
- `npm run build` produces static output in `dist/`
- GlassCard renders with correct styling

### Sample Prompt
```
Implement Step 1 from STEPS.md: Project Scaffolding & Design System.

Read the PRD, technical_specs.md, SKILL.md, and workflow before starting. 
Initialize the Vite project, install all MVP dependencies, set up the full
folder structure, create the design system in index.css, and build the shared
components (GlassCard, Badge, ErrorBoundary). Verify the project builds and
the dev server runs. The page should show the #050d1a dark background.
```

---

## Step 2: Landing Page

### What You Build
- `LandingPage.tsx` — Hero page with bioluminescent aesthetic
- Animated background (CSS gradients + subtle Framer Motion particles)
- Hero section: tagline *"See how AI thinks — one matrix at a time"*
- "What is AI Beacon?" section with animated preview placeholder
- "Who is it for?" — 4 persona cards using `GlassCard`
- "How it works" — 3-step visual summary
- "Start Exploring →" CTA button
- Footer with credits
- Responsive: mobile, tablet, desktop breakpoints
- SEO: proper `<title>`, meta tags, Open Graph
- React Router setup: `/` (landing) and `/simulator` (placeholder)

### Deliverables
- Stunning landing page that "wows" at first glance
- Responsive across mobile/tablet/desktop
- CTA navigates to `/simulator` (blank page for now)

### Testing
- Visual check: page looks premium on desktop and mobile
- All links work
- Lighthouse SEO score > 90
- No console errors

### Sample Prompt
```
Implement Step 2 from STEPS.md: Landing Page.

Read STEPS.md, PRD (Section 5.1), technical_specs.md, and SKILL.md.
Build the landing page with bioluminescent deep-sea aesthetic. Include:
hero section, what-is-this section, persona cards, how-it-works, CTA button,
and footer. Set up React Router for / and /simulator routes. Make it fully
responsive. Add SEO meta tags. The design must look premium and stunning.
```

---

## Step 3: Simulator Shell & Layout

### What You Build
- `SimulatorPage.tsx` — Three-column layout (Control Panel | Pipeline Canvas | Inspector)
- `SimulatorShell.tsx` — Layout orchestrator with responsive breakpoints
- `ControlPanel.tsx` — Left sidebar skeleton (sections for Input, Model Config, Playback)
- `PipelineCanvas.tsx` — Central area with step indicator dots/cards
- `PlaybackControls.tsx` — Prev/Step/Play/Pause/Reset buttons (UI only, no logic yet)
- `ModeToggle.tsx` — Simple ↔ Advanced toggle (UI only)
- `ModelConfigForm.tsx` — d_model, n_heads inputs (UI only, no state yet)
- Responsive: mobile bottom drawer, tablet 2-col, desktop 3-col
- Header bar with logo, mode toggle, config/help buttons

### Deliverables
- Simulator page with working three-column layout
- All control UI elements visible and styled
- Layout adapts correctly at all 3 breakpoints
- Pipeline canvas shows placeholder step indicators

### Testing
- Resize browser: layout transitions correctly at 768px and 1280px breakpoints
- All buttons render with correct styling
- No overflow or layout break on any viewport

### Sample Prompt
```
Implement Step 3 from STEPS.md: Simulator Shell & Layout.

Read STEPS.md, PRD (Sections 5.2, 5.3, 6), and technical_specs.md.
Build SimulatorShell with three-column responsive layout. Create ControlPanel,
PipelineCanvas, PlaybackControls, ModeToggle, and ModelConfigForm as UI shells.
No state logic yet — just the visual structure. Test all 3 breakpoints.
```

---

## Step 4: Math Engine & Tensor Core

### What You Build
- `Tensor` class (`lib/mathEngine/tensor.ts`) — full implementation
- `matmul.ts` — matrix multiplication with shape assertions
- `softmax.ts` — softmax with temperature, logsumexp stability
- `normalization.ts` — layer normalization (γ, β, ε)
- `activations.ts` — GELU activation function
- `positional.ts` — sinusoidal positional encoding
- `vocab.ts` — demo vocabulary (~500 tokens)
- `wordSplit.ts` — whitespace tokenizer
- `sampling.ts` — greedy sampling (argmax)
- Deterministic LCG PRNG for weight initialization
- **Unit tests for every math function** with golden values

### Deliverables
- Complete math engine with all MVP operations
- All operations are pure functions returning new Tensors
- All unit tests pass

### Testing
- `npx vitest run` — all tests pass
- Test cases include:
  - Tensor creation, shape tracking, `toMatrix()`
  - matmul: `(2,3) × (3,4) → (2,4)` with known result
  - softmax: output sums to 1.0, matches PyTorch
  - LayerNorm: output has mean ≈ 0, std ≈ 1
  - Sinusoidal PE: correct sin/cos pattern
  - GELU: matches approximation formula
  - Dimension mismatch throws descriptive error

### Sample Prompt
```
Implement Step 4 from STEPS.md: Math Engine & Tensor Core.

Read STEPS.md, technical_specs.md (Sections 4, 5), and SKILL.md.
Implement the full Tensor class, all math operations (matmul, softmax,
layerNorm, GELU, sinusoidal PE), the word-split tokenizer, demo vocabulary,
and greedy sampling. All functions must be pure and return new Tensors.
Write comprehensive unit tests with Vitest. Run all tests and verify they pass.
```

---

## Step 5: State Management & Step Machine

### What You Build
- `simulatorStore.ts` — Zustand store with full `SimulatorState`
- `stepMachine.ts` — step execution engine (`executeStep` switch)
- `types.ts` — all TypeScript interfaces and enums
- Connect store to step forward/backward/reset actions
- Implement snapshot/undo history for `stepBackward`
- Wire up `ModelConfigForm` to store (d_model, n_heads, seed)
- Wire up `PlaybackControls` to store actions
- Wire up text input to store
- "Play All" with `setInterval` at configurable speed

### Deliverables
- Fully functional state management
- Can step forward through all 12 steps (data computes correctly)
- Can step backward (restores previous state)
- Reset clears everything
- Config changes update store
- Play All auto-advances through steps

### Testing
- Step forward from input to sampling: each step produces correct tensor shapes
- Step backward restores exact previous state
- Reset clears all tensors, returns to Step 0
- Play All advances through all steps and stops
- Config change (d_model) correctly propagates to tensor dimensions
- Vitest tests for store actions

### Sample Prompt
```
Implement Step 5 from STEPS.md: State Management & Step Machine.

Read STEPS.md, technical_specs.md (Sections 3, 6), and SKILL.md.
Create the Zustand store, step execution engine, and all TypeScript types.
Wire controls (PlaybackControls, ModelConfigForm, text input) to the store.
Implement step forward/backward/reset with snapshot history.
Implement Play All with setInterval. Write tests for store actions.
```

---

## Step 6: Pipeline Steps 1–3 (Input → Tokenization → Token IDs)

### What You Build
- `StepRouter.tsx` — renders the active step component
- `RawInputStep.tsx` — text input with glowing cursor, character count, sample sentence buttons, max 8 words enforced
- `TokenizationStep.tsx` — animated token tiles splitting from input string, each with unique hue, vocabulary size badge
- `TokenIDStep.tsx` — tokens gain ID badges below them, vocab table highlight, arrow animation
- `ConceptCard.tsx` — collapsible explanation card (used in all steps)
- `TooltipEngine.tsx` — hover tooltips on step headers
- Step transition animations (Framer Motion)
- Flow arrows between steps

### Deliverables
- User types text, clicks Step → sees animated tokens appear
- Clicks Step again → tokens gain ID numbers
- Each step has a ConceptCard with explanation
- Hover step header → tooltip with description
- Animations are smooth and styled to bioluminescent theme

### Testing
- Type "The cat sat" → 3 tokens appear with correct splits
- Token IDs map correctly to vocabulary
- ConceptCards expand/collapse
- Tooltips show on hover
- Animations complete without jank
- Works on mobile layout

### Sample Prompt
```
Implement Step 6 from STEPS.md: Pipeline Steps 1–3 (Input, Tokenization, Token IDs).

Read STEPS.md, PRD (Section 3 pipeline table), technical_specs.md, and SKILL.md.
Build StepRouter, RawInputStep, TokenizationStep, TokenIDStep, ConceptCard,
and TooltipEngine. Wire to the Zustand store. Animate token tiles and ID badges
with Framer Motion. Add concept cards and tooltips. Test with sample inputs.
```

---

## Step 7: Pipeline Steps 4–5 (Embedding → Positional Encoding)

### What You Build
- `EmbeddingStep.tsx` — Simple Mode: each token "gets colored" (vector bars). Show resulting `X` matrix shape label
- `PositionalEncodingStep.tsx` — Simple Mode: show PE being added to embeddings. Sinusoidal wave visual (CSS/SVG). Before/after comparison
- `VectorBar.tsx` — horizontal bar chart showing vector values (color intensity = magnitude)
- `ShapeLabel.tsx` — tensor shape annotation component `(4, 8) float32`
- Flow animations: token pills → embedding lookup → colored bars → PE addition

### Deliverables
- Embedding step shows each token's vector as colored bars
- PE step shows sinusoidal addition
- Shape labels visible on all tensors
- Smooth animations between steps

### Testing
- Embedding vectors have correct shape `(n, d_model)`
- PE values follow sin/cos pattern
- X_pos = X_embed + PE (verify numerically by checking actual tensor values)
- Visual: bars render, shapes display correctly
- Works on mobile

### Sample Prompt
```
Implement Step 7 from STEPS.md: Pipeline Steps 4–5 (Embedding, Positional Encoding).

Read STEPS.md, technical_specs.md (Sections 5.3, 5.6), PRD, and SKILL.md.
Build EmbeddingStep and PositionalEncodingStep for Simple Mode. Create VectorBar
and ShapeLabel visualizer components. Show embedding lookup and PE addition with
animations. Verify tensor shapes and values are mathematically correct.
```

---

## Step 8: Pipeline Step 6 (Self-Attention)

### What You Build
- `AttentionStep.tsx` — the most complex step, split into sub-views:
  - **6a: Q/K/V Projections** — three lanes showing X_pos multiplied by W_Q, W_K, W_V
  - **6b: Scaled Dot-Product** — Q·Kᵀ/√d_k scores, softmax → attention weights
  - **6c: Causal Mask** — upper triangle mask visualization (MVP: always on)
  - **6d: Output** — attention weights × V → output
- `AttentionHeatmap.tsx` — attention weight visualization (React + inline styles for MVP, D3 in Phase 2)
- Educational: explain why √d_k scaling, what attention weights mean, causal masking
- Single-head only for MVP

### Deliverables
- Full attention computation visualized across sub-steps
- Attention heatmap shows which tokens attend to which
- Causal mask visually greys out future positions
- ConceptCard explains attention mechanism
- All tensor shapes correct 

### Testing
- Attention scores shape: `(n, n)`
- Attention weights sum to 1 per row
- Masked positions have weight 0
- Output shape: `(n, d_head)` = `(n, d_model)` for single-head
- Heatmap renders correctly
- Works on mobile

### Sample Prompt
```
Implement Step 8 from STEPS.md: Pipeline Step 6 (Self-Attention).

Read STEPS.md, technical_specs.md (Section 5.1), PRD, and SKILL.md.
Build AttentionStep with sub-views for QKV projections, scaled dot-product,
causal masking, and output computation. Create AttentionHeatmap visualizer.
Single-head only. Add educational concept cards explaining attention.
Verify all tensor shapes and attention weight properties.
```

---

## Step 9: Pipeline Steps 7–9 (Residual → LayerNorm → FFN)

### What You Build
- `ResidualStep.tsx` — two parallel tracks (input + attention output) merging at a `+` node. "Gradient highway" concept
- `LayerNormStep.tsx` — before/after bar charts showing normalization. Mean/std annotations. γ, β parameters
- `FFNStep.tsx` — wide→narrow→wide funnel visualization. GELU activation curve. Expansion ratio `d_ff = 4 × d_model`
- Educational: why residuals matter, why normalize, what FFN does

### Deliverables
- Residual add visualized with merging tracks
- LayerNorm shows clear normalization effect
- FFN shows expansion/compression with activation
- All concept cards present

### Testing
- Residual: X_res = X_pos + attn_output (verify values)
- LayerNorm: output mean ≈ 0, std ≈ 1 per row
- FFN: output shape `(n, d_model)`, hidden shape `(n, 4*d_model)`
- Works on mobile

### Sample Prompt
```
Implement Step 9 from STEPS.md: Pipeline Steps 7–9 (Residual, LayerNorm, FFN).

Read STEPS.md, technical_specs.md, PRD, and SKILL.md.
Build ResidualStep, LayerNormStep, and FFNStep. Visualize residual add,
normalization effect, and FFN expansion/compression. Add educational concept
cards. Verify mathematical correctness of all computations.
```

---

## Step 10: Pipeline Steps 10–12 (LM Head → Softmax → Sampling)

### What You Build
- `LMHeadStep.tsx` — final linear projection to vocabulary logits. Bar chart of top-20 logits sorted. Last token highlighted
- `SoftmaxStep.tsx` — logits → probabilities. Temperature slider (live update). Show sum=1.000 badge. Top-5 tokens labeled
- `SamplingStep.tsx` — greedy selection (argmax). Arrow points to selected token. Generated token displayed prominently
- `NumberDisplay.tsx` — animated number display for probability values

### Deliverables
- Full pipeline from input to generated next token works end-to-end
- Temperature slider changes probability distribution in real-time
- Selected token clearly indicated
- "The model predicts the next word is: ___" display

### Testing
- Logits shape: `(|V|,)` — one score per vocab token
- Probabilities sum to 1.0
- Temperature=0.1: distribution very peaked; Temperature=2.0: very flat
- Greedy always selects highest probability
- Full pipeline end-to-end: type "The cat" → get a predicted next token
- Works on mobile

### Sample Prompt
```
Implement Step 10 from STEPS.md: Pipeline Steps 10–12 (LM Head, Softmax, Sampling).

Read STEPS.md, technical_specs.md, PRD, and SKILL.md.
Build LMHeadStep, SoftmaxStep, and SamplingStep. Show logits bar chart,
softmax probabilities with temperature slider, and greedy token selection.
Create NumberDisplay component for animated values. Test full end-to-end
pipeline: input text → predicted next token.
```

---

## Step 11: Polish, Accessibility, Onboarding & Deployment

### What You Build
- `OnboardingTour.tsx` — 5-step guided tour on first visit (localStorage)
- Keyboard navigation: Tab through all controls and steps
- `aria-label` on all interactive elements and visualizations
- `prefers-reduced-motion` media query: disable all animations
- Error boundaries on every pipeline step
- Loading states and skeleton UIs
- Vercel Analytics integration (optional)
- Performance audit and optAI Beaconation (lazy loading, memoization)
- Cross-browser testing (Chrome, Firefox, Safari)
- Final Vercel deployment configuration

### Deliverables
- Onboarding tour works on first visit, can be skipped, doesn't show again
- Full keyboard accessibility
- Animations disabled when `prefers-reduced-motion: reduce`
- Graceful error handling (no blank screens on math errors)
- Lighthouse scores: Performance > 90, Accessibility > 90, SEO > 90
- Deployed and live on Vercel

### Testing
- First visit: tour appears. Refresh: tour doesn't appear
- Tab through entire app: all elements reachable
- Enable reduced motion in OS: no animations
- Trigger a math error (e.g., bad input): error boundary catches it
- Lighthouse audit passes all thresholds
- Test on Chrome, Firefox, Safari
- Vercel deployment is live and accessible

### Sample Prompt
```
Implement Step 11 from STEPS.md: Polish, Accessibility, Onboarding & Deployment.

Read STEPS.md, PRD (Sections 5.4, 8), technical_specs.md, and SKILL.md.
Build OnboardingTour component. Add keyboard navigation and aria-labels
throughout. Implement prefers-reduced-motion. Add error boundaries to all
pipeline steps. Set up Vercel deployment. Run Lighthouse and fix any issues
until all scores > 90. Test on Chrome, Firefox, and Safari.
```

---

## Step Dependencies

```
Step 1 (Scaffold) ──→ Step 2 (Landing) ──→ Step 3 (Shell)
                                                  │
                      Step 4 (Math Engine) ───────┤
                                                  ↓
                      Step 5 (State/Store) ──→ Step 6 (Steps 1-3)
                                                  │
                      Step 7 (Steps 4-5) ←────────┤
                                                  ↓
                      Step 8 (Attention) ──→ Step 9 (Res+LN+FFN)
                                                  │
                      Step 10 (LM+Soft+Sample) ←──┘
                                                  │
                      Step 11 (Polish+Deploy) ←───┘
```

> **Note:** Steps 3 and 4 can technically be done in parallel, but doing them sequentially is recommended to avoid merge complexity.
