// src/lib/store/types.ts
// Core TypeScript interfaces for the DEPTH simulator.

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

export const PIPELINE_STEP_LABELS: Record<PipelineStep, { label: string; shortLabel: string; description: string }> = {
    [PipelineStep.INPUT]: {
        label: 'Raw Text Input',
        shortLabel: 'Input',
        description: 'Enter text to flow through the transformer.',
    },
    [PipelineStep.TOKENIZE]: {
        label: 'Tokenization',
        shortLabel: 'Tokens',
        description: 'Split text into tokens (words).',
    },
    [PipelineStep.TOKEN_IDS]: {
        label: 'Token ID Mapping',
        shortLabel: 'IDs',
        description: 'Map each token to an integer ID from the vocabulary.',
    },
    [PipelineStep.EMBEDDING]: {
        label: 'Embedding Lookup',
        shortLabel: 'Embed',
        description: 'Convert token IDs to dense vector representations.',
    },
    [PipelineStep.POSITIONAL_ENCODING]: {
        label: 'Positional Encoding',
        shortLabel: 'Pos Enc',
        description: 'Add position information to token embeddings.',
    },
    [PipelineStep.ATTENTION]: {
        label: 'Self-Attention',
        shortLabel: 'Attention',
        description: 'Compute Q/K/V projections and attention weights.',
    },
    [PipelineStep.RESIDUAL]: {
        label: 'Residual Connection',
        shortLabel: 'Residual',
        description: 'Add the attention output back to the input.',
    },
    [PipelineStep.LAYER_NORM]: {
        label: 'Layer Normalization',
        shortLabel: 'LayerNorm',
        description: 'Normalize the vector to unit mean and variance.',
    },
    [PipelineStep.FFN]: {
        label: 'Feed-Forward Network',
        shortLabel: 'FFN',
        description: 'Apply two linear transforms with GELU activation.',
    },
    [PipelineStep.LM_HEAD]: {
        label: 'LM Head (Final Linear)',
        shortLabel: 'LM Head',
        description: 'Project hidden state to vocabulary logits.',
    },
    [PipelineStep.SOFTMAX]: {
        label: 'Softmax + Temperature',
        shortLabel: 'Softmax',
        description: 'Convert logits to a probability distribution.',
    },
    [PipelineStep.SAMPLING]: {
        label: 'Sampling',
        shortLabel: 'Sample',
        description: 'Select the next token from the distribution.',
    },
};

// ── Model Config ─────────────────────────────────────────────────────────────

export interface ModelConfig {
    dModel: number;      // 4 | 8 | 16 | 32 | 64 (default: 8)
    nHeads: number;      // 1 (MVP default, up to 4)
    nLayers: number;     // 1 (locked for MVP)
    maxTokens: number;   // 2–12 (default: 8)
    dFF: number;         // auto: 4 × dModel
    seed: number;        // weight init seed
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
    tokens?: { raw: string[] };
    token_ids?: { ids: number[] };
    embed?: { We: Tensor; X: Tensor };
    posenc?: { PE: Tensor; X_pos: Tensor };
    attention?: {
        WQ: Tensor; WK: Tensor; WV: Tensor; WO: Tensor;
        Q: Tensor; K: Tensor; V: Tensor;
        scores: Tensor; weights: Tensor;
        output: Tensor; multihead_out: Tensor;
    };
    residual?: { X_res: Tensor };
    layernorm?: { X_norm: Tensor; gamma: Tensor; beta: Tensor };
    ffn?: { W1: Tensor; W2: Tensor; hidden: Tensor; output: Tensor };
    lm_head?: { W_lm: Tensor; logits: Tensor };
    softmax?: { probs: Tensor };
    sampling?: { selected_id: number; selected_token: string };
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
type SamplingMethod = 'greedy';

/** Inter-step delay in milliseconds for Play All */
export const PLAY_SPEEDS: Record<PlaySpeed, number> = {
    slow: 1500,
    normal: 500,
    fast: 100,
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
}
