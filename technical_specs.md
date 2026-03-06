# 🔧 DEPTH — Technical Specifications

> This document contains all code-level specifications, data structures, component architecture, and implementation details for the DEPTH LLM Visualizer.
> The product requirements and design intent live in [LLM Visualizer PRD.md](./LLM%20Visualizer%20PRD.md).

---

## 1. Project Structure

```
depth-llm-visualizer/
├── index.html
├── vite.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── package.json
│
├── public/
│   └── favicon.svg
│
├── src/
│   ├── main.tsx                          # React entry point
│   ├── App.tsx                           # Router: Landing ↔ Simulator
│   ├── index.css                         # Tailwind directives + design tokens
│   │
│   ├── pages/
│   │   ├── LandingPage.tsx               # Hero, personas, CTA
│   │   └── SimulatorPage.tsx             # Main simulator shell
│   │
│   ├── components/
│   │   ├── core/
│   │   │   ├── SimulatorShell.tsx        # Three-column layout orchestrator
│   │   │   ├── PipelineCanvas.tsx        # Main visualization area
│   │   │   └── StepRouter.tsx            # Renders active step component
│   │   │
│   │   ├── controls/
│   │   │   ├── ControlPanel.tsx          # Left sidebar: all user controls
│   │   │   ├── ModelConfigForm.tsx       # d_model, n_heads inputs
│   │   │   ├── PlaybackControls.tsx      # Step forward/back, play, reset
│   │   │   └── ModeToggle.tsx            # Simple ↔ Advanced switch
│   │   │
│   │   ├── pipeline/
│   │   │   ├── RawInputStep.tsx          # Step 1: Text input
│   │   │   ├── TokenizationStep.tsx      # Step 2: Tokenization
│   │   │   ├── TokenIDStep.tsx           # Step 3: Token ID mapping
│   │   │   ├── EmbeddingStep.tsx         # Step 4: Embedding lookup
│   │   │   ├── PositionalEncodingStep.tsx # Step 5: Positional encoding
│   │   │   ├── AttentionStep.tsx         # Step 6: Self-attention (sub-steps)
│   │   │   ├── ResidualStep.tsx          # Step 7: Residual add
│   │   │   ├── LayerNormStep.tsx         # Step 8: Layer normalization
│   │   │   ├── FFNStep.tsx              # Step 9: Feed-forward network
│   │   │   ├── LMHeadStep.tsx           # Step 10: Final linear projection
│   │   │   ├── SoftmaxStep.tsx          # Step 11: Softmax + temperature
│   │   │   └── SamplingStep.tsx         # Step 12: Sampling
│   │   │
│   │   ├── visualizers/
│   │   │   ├── MatrixHeatmap.tsx         # Color-coded matrix display
│   │   │   ├── VectorBar.tsx             # Horizontal bar for vector values
│   │   │   ├── AttentionHeatmap.tsx      # Attention weight visualization
│   │   │   ├── TokenBadge.tsx            # Token pill with hover info
│   │   │   ├── ShapeLabel.tsx            # Tensor shape annotation
│   │   │   └── FlowArrow.tsx            # Animated arrow between steps
│   │   │
│   │   ├── educational/
│   │   │   ├── TooltipEngine.tsx         # Context-aware tooltip system
│   │   │   ├── ConceptCard.tsx           # Expandable explanation card
│   │   │   └── OnboardingTour.tsx        # First-visit guided walkthrough
│   │   │
│   │   └── shared/
│   │       ├── GlassCard.tsx             # Glassmorphic container
│   │       ├── NumberDisplay.tsx         # Animated number with precision
│   │       ├── Badge.tsx                 # Status badges
│   │       └── ErrorBoundary.tsx         # Catches math/render errors per step
│   │
│   ├── lib/
│   │   ├── mathEngine/
│   │   │   ├── tensor.ts                 # Tensor class with shape tracking
│   │   │   ├── matmul.ts                 # Matrix multiplication
│   │   │   ├── attention.ts              # QKV, scaled dot-product, masking
│   │   │   ├── positional.ts             # Sinusoidal PE
│   │   │   ├── normalization.ts          # LayerNorm
│   │   │   ├── activations.ts            # GELU (MVP), ReLU
│   │   │   ├── sampling.ts              # Greedy (MVP)
│   │   │   └── softmax.ts               # Softmax + temperature
│   │   │
│   │   ├── tokenizer/
│   │   │   ├── wordSplit.ts              # Whitespace tokenizer (MVP)
│   │   │   └── vocab.ts                  # Demo vocabulary (~500 tokens)
│   │   │
│   │   └── store/
│   │       ├── simulatorStore.ts         # Zustand store: all global state
│   │       ├── stepMachine.ts            # Step FSM: transitions, history
│   │       └── types.ts                  # All shared TypeScript interfaces
│   │
│   └── __tests__/
│       ├── mathEngine/
│       │   ├── tensor.test.ts
│       │   ├── matmul.test.ts
│       │   ├── attention.test.ts
│       │   ├── softmax.test.ts
│       │   └── normalization.test.ts
│       └── store/
│           └── stepMachine.test.ts
│
└── .agents/
    ├── skills/aiviz_frontend/SKILL.md
    └── workflows/implement_aiviz_component.md
```

---

## 2. Design System Tokens

```css
/* src/index.css — Design Tokens */

:root {
  /* Base colors */
  --color-bg-base:        #050d1a;   /* deep ocean floor */
  --color-bg-surface:     #0a1929;   /* slightly lighter surface */
  --color-bg-glass:       rgba(10, 25, 41, 0.7);
  --color-border:         rgba(0, 229, 255, 0.12);
  --color-border-glow:    rgba(0, 229, 255, 0.4);

  /* Accent colors */
  --color-primary:        #00e5ff;   /* bioluminescent cyan */
  --color-secondary:      #00b8a9;   /* deep teal */
  --color-accent:         #7c4dff;   /* deep sea purple */
  --color-warm:           #f06292;   /* anemone pink (warnings) */
  --color-success:        #69f0ae;   /* phosphorescent green */

  /* Text */
  --color-text-primary:   #e8f4fd;
  --color-text-secondary: #8badc0;
  --color-text-muted:     #445566;

  /* Glows */
  --glow-sm:   0 0 8px rgba(0, 229, 255, 0.3);
  --glow-md:   0 0 16px rgba(0, 229, 255, 0.5);
  --glow-lg:   0 0 32px rgba(0, 229, 255, 0.4), 0 0 64px rgba(0, 229, 255, 0.2);

  /* Fonts */
  --font-mono: 'JetBrains Mono', 'Fira Code', monospace;
  --font-body: -apple-system, BlinkMacSystemFont, 'Inter', sans-serif;
}
```

### GlassCard Component Styles

```css
.glass-card {
  background: rgba(10, 25, 41, 0.65);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(0, 229, 255, 0.12);
  border-radius: 12px;
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,0.05),
    0 4px 24px rgba(0, 0, 0, 0.4);
}

.glass-card:hover {
  border-color: rgba(0, 229, 255, 0.3);
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.05), 0 4px 24px rgba(0,0,0,0.4), var(--glow-sm);
}

.step-card.active {
  border-color: rgba(0, 229, 255, 0.5);
  box-shadow: var(--glow-md), 0 8px 32px rgba(0,0,0,0.5);
}

.token-badge {
  background: rgba(0, 229, 255, 0.1);
  border: 1px solid rgba(0, 229, 255, 0.3);
  border-radius: 6px;
  padding: 4px 10px;
  font-family: var(--font-mono);
  font-size: 13px;
  color: #00e5ff;
  text-shadow: 0 0 8px rgba(0, 229, 255, 0.5);
}
```

---

## 3. Core Type Definitions

```typescript
// src/lib/store/types.ts

// ── Pipeline Steps ──
export enum PipelineStep {
  INPUT = 0,
  TOKENIZE = 1,
  TOKEN_IDS = 2,
  EMBEDDING = 3,
  POSITIONAL_ENCODING = 4,
  ATTENTION = 5,
  RESIDUAL = 6,
  LAYER_NORM = 7,
  FFN = 8,
  LM_HEAD = 9,
  SOFTMAX = 10,
  SAMPLING = 11,
}

export interface StepMeta {
  label: string;
  shortLabel: string;
  requires: PipelineStep[];
  description: string;         // one-line for Simple Mode
  educationalNote: string;     // why this step matters
}

// ── Model Config ──
export interface ModelConfig {
  dModel: number;              // 4 | 8 | 16 | 32 | 64 (default: 8)
  nHeads: number;              // 1 | 2 | 4 (default: 1 for MVP)
  nLayers: number;             // 1 (locked for MVP)
  maxTokens: number;           // 2–12 (default: 8)
  dFF: number;                 // auto: 4 × dModel
  seed: number;                // weight init seed for reproducibility
}

// ── Tokenizer / Encoding / Activation / Sampling ──
export type TokenizerType = 'word_split';                        // MVP
export type PositionalEncodingType = 'sinusoidal';               // MVP
export type ActivationFn = 'gelu';                               // MVP
export type SamplingMethod = 'greedy';                           // MVP

// ── Simulator State ──
export interface SimulatorState {
  // Config
  config: ModelConfig;
  mode: 'simple' | 'advanced';
  tokenizerType: TokenizerType;
  peType: PositionalEncodingType;
  activationFn: ActivationFn;
  samplingMethod: SamplingMethod;
  temperature: number;

  // Input
  inputText: string;

  // Step machine
  currentStep: PipelineStep;
  stepHistory: StepSnapshot[];
  isPlaying: boolean;
  playSpeed: 'slow' | 'normal' | 'fast';

  // Computed tensors (populated as steps execute)
  tensors: TensorRegistry;

  // Actions
  stepForward: () => void;
  stepBackward: () => void;
  playAll: () => void;
  pause: () => void;
  reset: () => void;
  updateConfig: (patch: Partial<ModelConfig>) => void;
  setInput: (text: string) => void;
}

export interface StepSnapshot {
  step: PipelineStep;
  tensors: TensorRegistry;
  timestamp: number;
  configHash: string;
}

// ── Tensor Registry ──
export type TensorRegistry = {
  tokens?: { raw: string[]; };
  token_ids?: { ids: number[]; };
  embed?: { We: Tensor; X: Tensor; };
  posenc?: { PE: Tensor; X_pos: Tensor; };
  attention?: {
    WQ: Tensor; WK: Tensor; WV: Tensor; WO: Tensor;
    Q: Tensor; K: Tensor; V: Tensor;
    scores: Tensor; weights: Tensor;
    output: Tensor; multihead_out: Tensor;
  };
  residual?: { X_res: Tensor; };
  layernorm?: { X_norm: Tensor; gamma: Tensor; beta: Tensor; };
  ffn?: { W1: Tensor; W2: Tensor; hidden: Tensor; output: Tensor; };
  lm_head?: { W_lm: Tensor; logits: Tensor; };
  softmax?: { probs: Tensor; };
  sampling?: { selected_id: number; selected_token: string; };
};
```

---

## 4. Tensor Class

```typescript
// src/lib/mathEngine/tensor.ts

export class Tensor {
  readonly id: string;
  readonly label: string;
  readonly shape: readonly number[];
  readonly data: Float32Array;

  constructor(data: Float32Array, shape: number[], label: string = '') {
    this.id = crypto.randomUUID();
    this.data = data;
    this.shape = Object.freeze(shape);
    this.label = label;
  }

  // ── Factory methods ──
  static zeros(shape: number[], label?: string): Tensor
  static randn(shape: number[], seed: number, label?: string): Tensor  // LCG PRNG
  static fromArray(data: number[][], label?: string): Tensor

  // ── Operations (all return NEW Tensor, never mutate) ──
  matmul(other: Tensor): Tensor           // (m,k) × (k,n) → (m,n)
  add(other: Tensor): Tensor              // elementwise add (broadcasting)
  scale(s: number): Tensor                // scalar multiply
  softmax(dim: number, temp?: number): Tensor
  layerNorm(eps?: number): Tensor
  reshape(newShape: number[]): Tensor
  transpose(dim0: number, dim1: number): Tensor
  row(i: number): Tensor                  // slice single row

  // ── Accessors ──
  get(row: number, col: number): number
  toMatrix(): number[][]                  // for rendering
  shapeStr(): string                      // "(4, 8)"
  stats(): { mean: number; std: number; min: number; max: number }
}
```

**Key design decisions:**
- All operations return new `Tensor` instances — **immutability** is critical for undo/redo.
- Deterministic random via LCG PRNG keyed on `config.seed` — same input = same output.
- `Float32Array` for memory efficiency, though at toy dimensions it barely matters.
- No `mathjs` dependency — all operations hand-implemented for transparency and bundle size.

---

## 5. Math Engine — Key Algorithms

### 5.1 Attention

```typescript
// src/lib/mathEngine/attention.ts
export function scaledDotProductAttention(
  Q: Tensor, K: Tensor, V: Tensor,
  mask?: Tensor
): { scores: Tensor; weights: Tensor; output: Tensor } {
  const dk = Q.shape[1];
  const scores = Q.matmul(K.transpose(0, 1)).scale(1 / Math.sqrt(dk));
  const maskedScores = mask
    ? scores.add(mask.scale(-1e9))
    : scores;
  const weights = maskedScores.softmax(1);
  const output = weights.matmul(V);
  return { scores, weights, output };
}
```

### 5.2 Softmax with Temperature

```typescript
// src/lib/mathEngine/softmax.ts
export function softmax(logits: number[], temp: number = 1.0): number[] {
  const scaled = logits.map(l => l / temp);
  const maxVal = Math.max(...scaled);
  const exps = scaled.map(l => Math.exp(l - maxVal));  // logsumexp trick
  const sum = exps.reduce((a, b) => a + b, 0);
  return exps.map(e => e / sum);
}
```

### 5.3 Sinusoidal Positional Encoding

```typescript
// src/lib/mathEngine/positional.ts
export function sinusoidalPE(nTokens: number, dModel: number): Tensor {
  const pe = new Float32Array(nTokens * dModel);
  for (let pos = 0; pos < nTokens; pos++) {
    for (let i = 0; i < dModel; i++) {
      const angle = pos / Math.pow(10000, (2 * Math.floor(i / 2)) / dModel);
      pe[pos * dModel + i] = i % 2 === 0 ? Math.sin(angle) : Math.cos(angle);
    }
  }
  return new Tensor(pe, [nTokens, dModel], 'PE');
}
```

### 5.4 Layer Normalization

```typescript
// LayerNorm(x) = γ · (x - μ) / √(σ² + ε) + β
// μ, σ² computed over d_model dimension
// γ initialized to 1, β to 0 (learnable in real models)
```

### 5.5 GELU Activation

```typescript
// GELU(x) = 0.5x(1 + tanh(√(2/π)(x + 0.044715x³)))
```

### 5.6 Embedding Lookup

```typescript
// X = W_e[ids]  where W_e ∈ R^{|V| × d_model}
// W_e generated deterministically from seed
```

---

## 6. Step Execution Engine

```typescript
// src/lib/store/stepMachine.ts
function executeStep(step: PipelineStep, state: SimulatorState): TensorRegistry {
  const { config, tensors, inputText, tokenizerType } = state;

  switch (step) {
    case PipelineStep.TOKENIZE:
      return { ...tensors, tokens: { raw: wordSplit(inputText) } };

    case PipelineStep.TOKEN_IDS:
      const ids = tensors.tokens!.raw.map(tokenToId);
      return { ...tensors, token_ids: { ids } };

    case PipelineStep.EMBEDDING:
      const embedResult = embeddingLookup(tensors.token_ids!.ids, config.dModel, config.seed);
      return { ...tensors, embed: embedResult };

    case PipelineStep.POSITIONAL_ENCODING:
      const PE = sinusoidalPE(tensors.embed!.X.shape[0], config.dModel);
      const X_pos = tensors.embed!.X.add(PE);
      return { ...tensors, posenc: { PE, X_pos } };

    // ... remaining steps follow same pattern
  }
}
```

**Step forward action in Zustand:**

```typescript
stepForward: () => {
  const { currentStep, tensors, config } = get();

  // 1. Snapshot for undo
  const snapshot = { step: currentStep, tensors: structuredClone(tensors), timestamp: Date.now() };

  // 2. Execute next step
  const nextStep = currentStep + 1;
  const newTensors = executeStep(nextStep, get());

  // 3. Update state
  set({
    currentStep: nextStep,
    tensors: newTensors,
    stepHistory: [...get().stepHistory, snapshot]
  });
}
```

---

## 7. Animation Strategy

### MVP: Framer Motion Only

All MVP animations use Framer Motion's declarative API:

```typescript
// Step transition
<AnimatePresence mode="wait">
  <motion.div
    key={currentStep}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.4, ease: "easeOut" }}
  >
    <StepRouter step={currentStep} />
  </motion.div>
</AnimatePresence>

// Token badge entrance
<motion.span
  layout
  initial={{ scale: 0, opacity: 0 }}
  animate={{ scale: 1, opacity: 1 }}
  transition={{ type: "spring", stiffness: 300, damping: 25 }}
>
  {token}
</motion.span>

// Flow arrow (SVG path drawing)
<motion.path
  d={arrowPath}
  initial={{ pathLength: 0 }}
  animate={{ pathLength: 1 }}
  transition={{ duration: 0.6 }}
/>
```

### Speed Multipliers

| Speed | Transition Duration | Inter-step Delay |
|---|---|---|
| Slow | 1.2s × 3 = 3.6s | 1500ms |
| Normal | 1.2s × 1 = 1.2s | 500ms |
| Fast | 1.2s × 0.3 = 0.36s | 100ms |

---

## 8. Error Handling

```typescript
// src/components/shared/ErrorBoundary.tsx
// Wraps each pipeline step. On error:
// 1. Shows a friendly message: "Oops! This computation hit an issue."
// 2. Shows the error type (e.g., "Dimension mismatch: (4,8) × (3,4)")
// 3. Offers "Reset to previous step" button
// 4. Logs error for debugging

// Math guards in tensor.ts:
// - matmul: assert inner dimensions match, throw descriptive error
// - NaN check: after every operation, warn if NaN detected
// - Shape bounds: reject d_model > 64 or n_tokens > 12 with user message
```

---

## 9. Project Setup

```bash
# 1. Initialize
npm create vite@latest depth-llm-visualizer -- --template react-ts
cd depth-llm-visualizer

# 2. Core dependencies
npm install zustand framer-motion

# 3. Tailwind CSS
npm install -D tailwindcss @tailwindcss/vite

# 4. Testing
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom

# 5. Dev
npm run dev

# 6. Build for Vercel
npm run build
# Output: dist/ (static files, deploy to Vercel)
```

### Vite Config

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { '@': '/src' }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'framer-motion': ['framer-motion'],
        }
      }
    }
  }
});
```

---

## 10. Heatmap Color Scales (Phase 2 — D3)

```typescript
// Diverging: negative (pink) → zero (dark) → positive (cyan)
const colorScale = d3.scaleDiverging()
  .domain([-maxAbs, 0, maxAbs])
  .interpolator(d3.interpolateRgbBasis(['#f06292', '#050d1a', '#00e5ff']));

// Attention weights: always 0–1, sequential
const attnColorScale = d3.scaleSequential()
  .domain([0, 1])
  .interpolator(d3.interpolateRgbBasis(['#0a1929', '#004d5c', '#00e5ff']));
```
