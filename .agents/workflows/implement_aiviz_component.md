---
description: How to implement a new frontend component for the AiViz LLM Visualizer
---

# Workflow: Implementing an AiViz Component

Follow these steps when building any new component or feature for DEPTH.

## 0. Read the Docs First
// turbo-all
- Review `STEPS.md` to understand which step you're implementing.
- Review the relevant section of `LLM Visualizer PRD.md`.
- Review `technical_specs.md` for data structures and code patterns.
- Review `SKILL.md` for coding standards — **especially §2 (Monochrome Light aesthetic) and §3 (no raw values rule)**.
- **Check the current phase.** Do NOT implement Phase 2+ features in MVP.

## 1. Understand the Math (if applicable)
- If the step involves tensor operations, read the math spec in `technical_specs.md`.
- Implement the **pure math function** in `src/lib/mathEngine/` first.
- Write **Vitest unit tests** with golden values before moving to UI.
- Document tensor shapes in comments: `// (m,k) × (k,n) → (m,n)`.
- Ensure functions never mutate input Tensors.

## 2. Define State Dependencies
- Identify which parts of the Zustand `simulatorStore` this component reads/writes.
- Use Zustand **selectors** to subscribe only to needed state slices.
- Complex local state → `useReducer`.
- Ensure component handles resizing (debounced `ResizeObserver` if layout-dependent).

## 3. Build the UI
- Follow the **Minimal Monochrome Light** aesthetic — see `SKILL.md §2`.
  - **Zero colour.** No blue, no cyan, no teal, no purple, no green, no pink.
  - All backgrounds: `var(--bg)`, `var(--bg-panel)`, or `var(--bg-raised)`.
  - All text: `var(--ink)`, `var(--primary)`, `var(--secondary)`, or `var(--muted)`.
  - All borders: `1px solid var(--stroke)` or `1px solid var(--stroke-dark)`.
  - All shadows: `var(--shadow-soft)` (resting) or `var(--shadow-lift)` (hover).
  - No `backdrop-filter`, no `blur()`, no gradients, no glow `box-shadow`.
- **No raw values.** Every `padding`, `margin`, `font-size`, `color`, `radius`, `shadow`, and `transition`
  must reference a token variable from `src/tokens.css`. The only exceptions: `0`, `50%`, `100%`, `auto`, `none`.
- Use `PanelCard` (or `GlassCard` with light tokens) from `src/components/shared/`.
- **Active / selected states:** `background: var(--bg-inverse)`, `color: var(--text-inverse)` (dark chip).
  Never use a coloured highlight.
- **Token chips / node labels:** `font-family: var(--font-mono)`, `font-size: var(--text-xs)`,
  `background: var(--bg-inverse)`, `color: var(--text-inverse)`.
- Use **semantic HTML** (`<section>`, `<article>`) and `aria-label` attributes.
- Ensure the component works at **all breakpoints** (480px, 720px, 1280px+).
- Touch targets ≥ 44px on mobile.

## 4. Add Animations
- Use **Framer Motion 11** for all MVP animations.
- Common patterns:
  - `AnimatePresence` for step enter/exit
  - `motion.div` with `layout` for reflow
  - `initial` / `animate` / `exit` for transitions
  - Ease: `var(--ease-out)` for standard transitions; `var(--ease-spring)` only for physical interactions
  - Stagger fade-up for list/grid reveals: `opacity 0 → 1`, `translateY(14px) → 0`
- Wrap animated visualizations in `React.memo` with `useCallback`/`useMemo`.
- Respect `prefers-reduced-motion` — conditionally disable animations.

## 5. Add Educational Content
- Add a `ConceptCard` (collapsible) with:
  - What this step does (1 sentence)
  - Why it matters (2 sentences)
  - Real LLM comparison (GPT-2 vs LLaMA-3 dimensions)
- Add `TooltipEngine` triggers on step headers and key UI elements.
- Simple Mode: use narrative text, not numbers.

## 6. Add Error Handling
- Wrap the component in `<ErrorBoundary>`.
- Guard against math failures (NaN, dimension mismatch).
- Show user-friendly error message with "Reset" button on failure.
- Validate user inputs (e.g., d_model divisible by n_heads).

## 7. Test & Verify
- **Math:** `npx vitest run` — all tests pass.
- **Rendering:** component renders without errors at all breakpoints.
- **State:** step forward/backward works correctly with this component.
- **Accessibility:** keyboard navigable (Tab + Enter), `aria-labels` present.
- **Performance:** no jank on animations at `d_model=64`.
- **Immutability:** verify no tensor mutation (step backward restores exact prior state).
- **Theme check:** no raw colour values anywhere in the file; no glow, no blur.
