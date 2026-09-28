// src/lib/store/types.ts
// Core TypeScript interfaces for the AI Beacon simulator.

import type { Tensor } from '@/lib/mathEngine';

// ── Pipeline Steps ──────────────────────────────────────────────────────────

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

export const PIPELINE_STEP_COUNT = 12;
export const PIPELINE_STEP_LAST = PipelineStep.SAMPLING;

export type PipelinePhase = 'text' | 'block' | 'predict';

export const PIPELINE_PHASES: Record<PipelinePhase, { label: string; steps: PipelineStep[] }> = {
    text: {
        label: 'Text → numbers',
        steps: [PipelineStep.INPUT, PipelineStep.TOKENIZE, PipelineStep.TOKEN_IDS, PipelineStep.EMBEDDING, PipelineStep.POSITIONAL_ENCODING],
    },
    block: {
        label: 'Transformer block',
        steps: [PipelineStep.ATTENTION, PipelineStep.RESIDUAL, PipelineStep.LAYER_NORM, PipelineStep.FFN],
    },
    predict: {
        label: 'Predict the next token',
        steps: [PipelineStep.LM_HEAD, PipelineStep.SOFTMAX, PipelineStep.SAMPLING],
    },
};

export const PIPELINE_STEP_LABELS: Record<PipelineStep, { label: string; shortLabel: string; description: string; phase: PipelinePhase }> = {
    [PipelineStep.INPUT]: {
        label: 'Your sentence',
        shortLabel: 'Input',
        description: 'Everything starts with plain text.',
        phase: 'text',
    },
    [PipelineStep.TOKENIZE]: {
        label: 'Tokenization',
        shortLabel: 'Tokens',
        description: 'Split the text into tokens — here, words and punctuation.',
        phase: 'text',
    },
    [PipelineStep.TOKEN_IDS]: {
        label: 'Token IDs',
        shortLabel: 'IDs',
        description: 'Look up each token’s number in the vocabulary.',
        phase: 'text',
    },
    [PipelineStep.EMBEDDING]: {
        label: 'Embeddings',
        shortLabel: 'Embed',
        description: 'Swap each ID for a list of numbers (a vector).',
        phase: 'text',
    },
    [PipelineStep.POSITIONAL_ENCODING]: {
        label: 'Positional encoding',
        shortLabel: 'Position',
        description: 'Add a signal that says where each token sits.',
        phase: 'text',
    },
    [PipelineStep.ATTENTION]: {
        label: 'Self-attention',
        shortLabel: 'Attention',
        description: 'Each token gathers information from itself and earlier tokens.',
        phase: 'block',
    },
    [PipelineStep.RESIDUAL]: {
        label: 'Residual connection',
        shortLabel: 'Add',
        description: 'Add attention’s result back onto the input.',
        phase: 'block',
    },
    [PipelineStep.LAYER_NORM]: {
        label: 'Layer normalization',
        shortLabel: 'Normalize',
        description: 'Rescale each vector to a standard range.',
        phase: 'block',
    },
    [PipelineStep.FFN]: {
        label: 'Feed-forward network',
        shortLabel: 'FFN',
        description: 'Process every token on its own through a small neural network.',
        phase: 'block',
    },
    [PipelineStep.LM_HEAD]: {
        label: 'Output scores (logits)',
        shortLabel: 'Logits',
        description: 'Score every word in the vocabulary as the possible next token.',
        phase: 'predict',
    },
    [PipelineStep.SOFTMAX]: {
        label: 'Softmax + temperature',
        shortLabel: 'Softmax',
        description: 'Turn the scores into probabilities that add up to 100%.',
        phase: 'predict',
    },
    [PipelineStep.SAMPLING]: {
        label: 'Pick the next token',
        shortLabel: 'Sample',
        description: 'Choose one token from the probabilities.',
        phase: 'predict',
    },
};

// ── Model Config ─────────────────────────────────────────────────────────────

export interface ModelConfig {
    dModel: number;      // vector width: 4 | 8 | 16 | 32 | 64 (default 8)
    nHeads: number;      // attention heads: 1 | 2 | 4, must divide dModel
    nLayers: number;     // transformer blocks (fixed at 1 in this demo)
    maxTokens: number;   // context window: longer inputs are truncated (default 8)
    dFF: number;         // feed-forward width, always 4 × dModel
    seed: number;        // weight initialisation / sampling seed
}

export const DEFAULT_CONFIG: ModelConfig = {
    dModel: 8,
    nHeads: 1,
    nLayers: 1,
    maxTokens: 8,
    dFF: 32,
    seed: 42,
};

// ── Tensor Registry ───────────────────────────────────────────────────────────
// Populated progressively as pipeline steps execute.

export type TensorRegistry = {
    /** dropped = tokens cut off because the input exceeded maxTokens. */
    tokens?: { raw: string[]; dropped: number };
    token_ids?: { ids: number[] };
    embed?: { We: Tensor; X: Tensor };
    posenc?: { PE: Tensor; X_pos: Tensor };
    attention?: {
        WQ: Tensor; WK: Tensor; WV: Tensor; WO: Tensor;
        /** All heads side by side, shape (n, d_model). */
        Q: Tensor; K: Tensor; V: Tensor;
        heads: AttentionHead[];
        /** Head outputs concatenated, shape (n, d_model), before W_O. */
        concat: Tensor;
        /** Final attention output after W_O, shape (n, d_model). */
        multihead_out: Tensor;
    };
    residual?: { X_res: Tensor };
    layernorm?: { X_norm: Tensor; gamma: Tensor; beta: Tensor };
    ffn?: {
        W1: Tensor; W2: Tensor;
        /** X_norm · W1, before the activation, shape (n, d_ff). */
        pre: Tensor;
        /** GELU(pre), shape (n, d_ff). */
        hidden: Tensor;
        /** hidden · W2, the FFN's own result, shape (n, d_model). */
        delta: Tensor;
        /** Block output: LayerNorm(X_norm + delta), shape (n, d_model). */
        output: Tensor;
    };
    lm_head?: { W_lm: Tensor; logits: Tensor };
    softmax?: { probs: Tensor };
    sampling?: {
        selected_id: number;
        selected_token: string;
        /** Probability the softmax gave the chosen token. */
        prob: number;
        method: SamplingMethod;
        /** Top-k candidates with renormalised probabilities (top-k only). */
        candidates?: Array<{ id: number; prob: number }>;
    };
};

/** One attention head's tensors. Q/K/V/output are (n, d_head); scores/weights are (n, n). */
export type AttentionHead = {
    Q: Tensor; K: Tensor; V: Tensor;
    scores: Tensor; weights: Tensor; output: Tensor;
};

// ── Step Snapshot (undo history) ──────────────────────────────────────────────

export interface StepSnapshot {
    step: PipelineStep;
    tensors: TensorRegistry;
    timestamp: number;
    configHash: string;
}

// ── Mode / Settings ───────────────────────────────────────────────────────────

export type AppMode = 'simple' | 'advanced';
export type PlaySpeed = 'slow' | 'normal' | 'fast';
type TokenizerType = 'word_split';
type PositionalEncodingType = 'sinusoidal';
type ActivationFn = 'gelu';
export type SamplingMethod = 'greedy' | 'top-k';

/** Inter-step delay in milliseconds for Play All */
export const PLAY_SPEEDS: Record<PlaySpeed, number> = {
    slow: 2000,
    normal: 1000,
    fast: 350,
};

// ── Simulator State ───────────────────────────────────────────────────────────

export interface SimulatorState {
    // Config
    config: ModelConfig;
    mode: AppMode;
    tokenizerType: TokenizerType;
    peType: PositionalEncodingType;
    activationFn: ActivationFn;
    samplingMethod: SamplingMethod;
    /** k for top-k sampling. */
    topK: number;
    temperature: number;

    // Input
    inputText: string;

    // Step machine
    currentStep: PipelineStep;
    stepHistory: StepSnapshot[];
    isPlaying: boolean;
    playSpeed: PlaySpeed;

    // Computed tensors (populated as steps execute)
    tensors: TensorRegistry;
    /** Why the last step could not run (e.g. empty input), shown to the user. */
    stepError: string | null;

    // Actions
    stepForward: () => void;
    stepBackward: () => void;
    playAll: () => void;
    pause: () => void;
    reset: () => void;
    updateConfig: (patch: Partial<ModelConfig>) => void;
    setInput: (text: string) => void;
    setMode: (mode: AppMode) => void;
    setPlaySpeed: (speed: PlaySpeed) => void;
    setTemperature: (temp: number) => void;
    setSampling: (method: SamplingMethod, topK?: number) => void;
    /** Jump to any step: rewinds through history, or runs forward to it. */
    goToStep: (step: PipelineStep) => void;
    /** Append the predicted token to the input and run the whole pipeline again. */
    appendPrediction: () => void;
}
