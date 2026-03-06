---
name: Frontend Development Standards for AiViz
description: Rules and standards for developing the frontend of the LLM Visualizer (DEPTH) project.
---

# Frontend Development Standards for AiViz (DEPTH)

Always read the PRD (`LLM Visualizer PRD.md`), `technical_specs.md`, and `STEPS.md` before starting any work.

---

## 1. Tech Stack

| Layer | Choice | Notes |
|---|---|---|
| Framework | **Vite 6 + React 19** | Not Next.js — we're a pure static SPA |
| Language | **TypeScript 5+ (strict)** | No `any` types. Strong typing for all interfaces, props, state |
| State | **Zustand 5** | Global simulation state. No prop drilling. Keep state flat |
| Animation | **Framer Motion 11** | All MVP animations. GSAP added in Phase 2 only |
| Styling | **CSS custom properties (tokens) + inline style objects** | Design tokens in `src/tokens.css`, imported by `src/index.css`. No Tailwind utility classes on new code. |
| Testing | **Vitest + React Testing Library** | Unit tests for math, component tests for UI |
| Deployment | **Vercel** | Static export, zero backend |

**NOT in MVP:** D3.js, GSAP, KaTeX, mathjs, Playwright. These arrive in Phase 2+.

---

## 2. Design Aesthetic — Minimal Monochrome Light

The project uses a strictly **greyscale light** design system. There is zero colour in the UI — no blue, no cyan, no teal, no purple, no pink, no green.

### Palette (from `src/tokens.css`)
| Token | Value | Use |
|---|---|---|
| `--bg` | `#f9f9f9` | Page background |
| `--bg-panel` | `#f2f2f2` | Card / section surface |
| `--bg-raised` | `#ebebeb` | Hover, active background |
| `--stroke` | `#e0e0e0` | Dividers |
| `--stroke-dark` | `#c8c8c8` | Visible borders |
| `--muted` | `#737373` | Secondary metadata |
| `--secondary` | `#4d4d4d` | Descriptions, captions |
| `--primary` | `#1a1a1a` | Body text |
| `--ink` | `#0d0d0d` | Headings, emphasis |
| `--bg-inverse` | `#0d0d0d` | Dark button background |
| `--text-inverse` | `#f9f9f9` | Text on dark background |

### Typography
- **Body font:** `'Geist'`, system-ui, sans-serif → `var(--font-sans)`
- **Mono font:** `'Geist Mono'`, 'Courier New', monospace → `var(--font-mono)`
- Token file: `src/tokens.css` (imported by `src/index.css`)

### Visual Principles
- **Quiet utility** — everything serves a purpose, nothing decorates
- Panels use `var(--bg-panel)`, `1px solid var(--stroke)`, `var(--r-lg)`, `var(--shadow-soft)`
- **No glow, no blur, no glassmorphism** — backdrop-filter is not used
- **No gradients, no patterns, no textures** — except the SVG arc in the Automation Clock
- Hover states: `background → var(--bg-raised)`, `color → var(--ink)`, never coloured
- Active/selected states: `background: var(--bg-inverse)`, `color: var(--text-inverse)` (dark chip)
- Token chips / labels: `var(--font-mono)`, `var(--text-xs)`, `var(--bg-inverse)` + `var(--text-inverse)`
- Shadows: only `var(--shadow-soft)` (resting) or `var(--shadow-lift)` (hover lift)

### Data-Viz Palette
Tokens prefixed `--viz-*` are defined in `src/tokens.css` alongside the greyscale palette.

**Usage rule — strict separation:**
- **UI shell** (nav, cards, text, borders, buttons): greyscale tokens only (`--bg`, `--stroke`, `--ink`, `--muted`, etc.)
- **Charts, graphs, heatmaps, vector bars, data visualizations**: `--viz-*` tokens allowed

Never use `--viz-*` colors on structural UI elements.

### Animations
- Ease function: `var(--ease-out)` for all transitions; `var(--ease-spring)` only for physical interactions
- Durations: `var(--dur-fast)` (150ms), `var(--dur-base)` (220ms), `var(--dur-slow)` (350ms)
- Hero / section entry: stagger fade-up (`opacity 0 → 1`, `translateY(14px) → 0`)
- Respect `prefers-reduced-motion` — disable all animations, show static output

---

## 3. Component Architecture

### File Structure
```
src/components/
├── core/          # Shell, canvas, step router — top-level orchestrators
├── controls/      # User inputs, config, playback buttons
├── pipeline/      # One component per LLM pipeline step (lazy loaded)
├── visualizers/   # Reusable viz: heatmaps, bars, badges, arrows
├── educational/   # Tooltips, concept cards, onboarding tour
└── shared/        # PanelCard, Badge, ErrorBoundary, NumberDisplay
```

### Rules
- **Functional components only** — no class components
- **One component per file** — named export matching filename
- **Small and focused** — each component does one thing
- **Separate logic from UI** — custom hooks for complex state, pure components for rendering
- **Lazy load pipeline steps:** `React.lazy(() => import('./AttentionStep'))`
- **Primary container card:** use `PanelCard` (previously `GlassCard`) — light panel with token-based border and shadow

### Naming Conventions
- **Components:** PascalCase (`TokenBadge.tsx`)
- **Hooks:** camelCase with `use` prefix (`useSimulatorStore.ts`)
- **Utils/math:** camelCase (`matmul.ts`, `softmax.ts`)
- **Types/interfaces:** PascalCase, prefixed with `I` only if needed for disambiguation
- **CSS classes:** kebab-case — use sparingly; prefer inline style tokens (`panel-card`, `badge`)
- **Constants:** UPPER_SNAKE_CASE (`MAX_TOKENS`, `VOCAB_SIZE`)

### CSS / Styling Rules
- **All values must reference a token variable** — no raw hex, no raw px/rem for colours or spacing
- Allowed raw values: `50%`, `100%`, `auto`, `0`, `none`, `transparent`, `inherit`
- Use `src/tokens.css` as the single source of truth — never define a colour outside it
- Inline `style={{ }}` objects are the standard; avoid class-based utility systems

### Exports
- Use **named exports** everywhere (no default exports)
- Barrel exports (`index.ts`) only at the `components/shared/` and `lib/mathEngine/` levels

---

## 4. State Management

- **Zustand store** in `src/lib/store/simulatorStore.ts` — single source of truth
- Keep state **flat** — avoid deeply nested objects
- **Never mutate** — always spread or create new objects
- Use **selectors** for derived state (`computedSlices.ts`)
- Step snapshots enable **undo/redo** — deep clone tensors on every step forward

---

## 5. Math Engine Rules

- **All functions are pure** — same input → same output, no side effects
- **Never mutate a Tensor** — all operations return new `Tensor` instances
- **Shape assertions** — every matmul checks inner dimensions match, throws descriptive error
- **NaN guards** — check for NaN after operations, log warning
- **Deterministic randomness** — LCG PRNG seeded from `config.seed`
- **Document shapes in comments:** `// (m,k) × (k,n) → (m,n)`
- **Toy dimensions only:** `d_model ≤ 64`, `n_tokens ≤ 12`

---

## 6. Performance

- Wrap visualization components in `React.memo`
- Use `useMemo` for tensor computations and `useCallback` for handlers
- Avoid inline object creation in JSX (breaks memoization)
- Lazy load all pipeline step components
- Framer Motion: use `layout` animations sparingly — they can be expensive
- `prefers-reduced-motion` → disable all animations, show static output

---

## 7. Accessibility

- All interactive elements must be **keyboard navigable** (Tab + Enter/Space)
- All visualizations must have **`aria-label`** describing the content
- Every interactive element needs: `hover` background shift, `focus` 2px outline (`var(--stroke-dark)`, offset 2px), `active` weight or bg shift
- Respect **`prefers-reduced-motion`** media query
- Use **semantic HTML** (`<section>`, `<article>`, `<nav>`, `<main>`)
- Every `<img>` or visual-only element needs `alt` text or `aria-hidden="true"`

---

## 8. Error Handling

- Wrap every pipeline step component in `<ErrorBoundary>`
- Math errors (dimension mismatch, NaN) → show friendly message, offer "Reset to previous step"
- Config validation (d_model not divisible by n_heads) → show inline error with suggested values
- Never show a blank screen — always provide recovery path

---

## 9. Testing

- **Math engine:** Vitest unit tests with known golden values (compare against PyTorch output)
- **Tolerance:** `1e-5` absolute tolerance for all float comparisons
- **Components:** React Testing Library for render + interaction tests
- **Test file location:** `src/__tests__/` mirroring `src/lib/` structure
- **Run:** `npx vitest run` — all tests must pass before marking a step complete

---

## 10. Responsive Design

| Breakpoint | Layout | Notes |
|---|---|---|
| `< 480px` | Single column, `--text-hero` = 2.6rem | Section padding halved |
| `< 720px` | Single column, hero text scales, nav collapses (logo + 1 CTA only) | Controls in bottom drawer |
| `720–1280px` | Two columns | Controls + canvas, no separate inspector |
| `> 1280px` | Three columns | Full layout: controls, canvas, inspector |

- **Mobile-first** — design for smallest screen, enhance upward
- Pipeline steps become vertical card stack on mobile
- Touch targets ≥ 44px on mobile

---

## 11. Link Between Routing and Pages

| Route | Component | Notes |
|---|---|---|
| `/` | `Home.tsx` | New homepage — nav, hero, module grid, clock teaser, footer |
| `/simulator` | `SimulatorPage.tsx` | Transformer visualizer shell |
| `/training` | `Training.tsx` | LLM Training Pipeline — 10-step interactive walkthrough |
