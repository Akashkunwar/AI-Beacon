/**
 * AI Model Benchmarks — curated dataset for the Benchmarks page.
 * Sources: Artificial Analysis, Hugging Face Open LLM Leaderboard, LMSYS Chatbot Arena,
 * official provider announcements, llm-prices.com.
 */

export const LAST_UPDATED = '2026-03-16';

export interface BenchmarkScores {
  mmlu: number | null;       // 0–100
  humanEval: number | null;  // 0–100
  math: number | null;       // 0–100
  gpqa: number | null;       // 0–100
  gsm8k: number | null;      // 0–100
  arenaElo: number | null;    // ~800–1400
}

export interface BenchmarkModel {
  id: string;
  name: string;
  provider: string;
  providerLogo?: string;
  releaseDate: string;
  openSource: boolean;
  contextWindow: number;
  tier: 'frontier' | 'open-weight' | 'budget' | 'historical';
  scores: BenchmarkScores;
  pricing: {
    input: number | null;   // $/1M tokens
    output: number | null;  // $/1M tokens
  };
  speed: {
    tokensPerSecond: number | null;
    timeToFirstToken: number | null; // ms
  };
}

function clearbit(domain: string): string {
  return `https://logo.clearbit.com/${domain}`;
}

export const BENCHMARK_MODELS: BenchmarkModel[] = [
  // —— Frontier ——
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    provider: 'OpenAI',
    providerLogo: clearbit('openai.com'),
    releaseDate: '2024-05-13',
    openSource: false,
    contextWindow: 128_000,
    tier: 'frontier',
    scores: { mmlu: 88.7, humanEval: 90.2, math: 76.6, gpqa: 62.1, gsm8k: 95.1, arenaElo: 1256 },
    pricing: { input: 2.5, output: 10 },
    speed: { tokensPerSecond: 85, timeToFirstToken: 180 },
  },
  {
    id: 'gpt-4.1',
    name: 'GPT-4.1',
    provider: 'OpenAI',
    providerLogo: clearbit('openai.com'),
    releaseDate: '2025-04-14',
    openSource: false,
    contextWindow: 128_000,
    tier: 'frontier',
    scores: { mmlu: 89.2, humanEval: 91.0, math: 78.2, gpqa: 64.0, gsm8k: 96.2, arenaElo: 1278 },
    pricing: { input: 2.5, output: 10 },
    speed: { tokensPerSecond: 82, timeToFirstToken: 190 },
  },
  {
    id: 'o3',
    name: 'o3',
    provider: 'OpenAI',
    providerLogo: clearbit('openai.com'),
    releaseDate: '2025-09-25',
    openSource: false,
    contextWindow: 200_000,
    tier: 'frontier',
    scores: { mmlu: 90.1, humanEval: 92.1, math: 82.4, gpqa: 68.2, gsm8k: 97.0, arenaElo: 1295 },
    pricing: { input: 15, output: 60 },
    speed: { tokensPerSecond: 45, timeToFirstToken: 420 },
  },
  {
    id: 'o3-mini',
    name: 'o3-mini',
    provider: 'OpenAI',
    providerLogo: clearbit('openai.com'),
    releaseDate: '2025-10-01',
    openSource: false,
    contextWindow: 200_000,
    tier: 'frontier',
    scores: { mmlu: 87.5, humanEval: 88.0, math: 75.0, gpqa: 60.0, gsm8k: 93.0, arenaElo: 1240 },
    pricing: { input: 3.5, output: 14 },
    speed: { tokensPerSecond: 72, timeToFirstToken: 220 },
  },
  {
    id: 'claude-sonnet-4',
    name: 'Claude Sonnet 4',
    provider: 'Anthropic',
    providerLogo: clearbit('anthropic.com'),
    releaseDate: '2025-08-20',
    openSource: false,
    contextWindow: 200_000,
    tier: 'frontier',
    scores: { mmlu: 88.2, humanEval: 89.5, math: 77.8, gpqa: 63.5, gsm8k: 94.5, arenaElo: 1265 },
    pricing: { input: 3, output: 15 },
    speed: { tokensPerSecond: 78, timeToFirstToken: 200 },
  },
  {
    id: 'claude-opus-4',
    name: 'Claude Opus 4',
    provider: 'Anthropic',
    providerLogo: clearbit('anthropic.com'),
    releaseDate: '2025-08-20',
    openSource: false,
    contextWindow: 200_000,
    tier: 'frontier',
    scores: { mmlu: 89.5, humanEval: 91.2, math: 80.1, gpqa: 66.8, gsm8k: 96.0, arenaElo: 1285 },
    pricing: { input: 15, output: 75 },
    speed: { tokensPerSecond: 52, timeToFirstToken: 350 },
  },
  {
    id: 'gemini-2.5-pro',
    name: 'Gemini 2.5 Pro',
    provider: 'Google',
    providerLogo: clearbit('google.com'),
    releaseDate: '2026-02-01',
    openSource: false,
    contextWindow: 1_000_000,
    tier: 'frontier',
    scores: { mmlu: 89.0, humanEval: 90.5, math: 79.2, gpqa: 65.2, gsm8k: 95.5, arenaElo: 1272 },
    pricing: { input: 1.25, output: 5 },
    speed: { tokensPerSecond: 68, timeToFirstToken: 240 },
  },
  {
    id: 'gemini-2.5-flash',
    name: 'Gemini 2.5 Flash',
    provider: 'Google',
    providerLogo: clearbit('google.com'),
    releaseDate: '2026-02-01',
    openSource: false,
    contextWindow: 1_000_000,
    tier: 'frontier',
    scores: { mmlu: 86.5, humanEval: 87.0, math: 72.0, gpqa: 58.0, gsm8k: 91.0, arenaElo: 1225 },
    pricing: { input: 0.075, output: 0.3 },
    speed: { tokensPerSecond: 120, timeToFirstToken: 120 },
  },
  {
    id: 'grok-3',
    name: 'Grok 3',
    provider: 'xAI',
    providerLogo: clearbit('x.ai'),
    releaseDate: '2025-11-01',
    openSource: false,
    contextWindow: 131_072,
    tier: 'frontier',
    scores: { mmlu: 87.8, humanEval: 88.5, math: 76.0, gpqa: 61.5, gsm8k: 93.5, arenaElo: 1248 },
    pricing: { input: 2, output: 10 },
    speed: { tokensPerSecond: 75, timeToFirstToken: 210 },
  },
  {
    id: 'deepseek-v3',
    name: 'DeepSeek V3',
    provider: 'DeepSeek',
    providerLogo: clearbit('deepseek.com'),
    releaseDate: '2025-06-05',
    openSource: false,
    contextWindow: 64_000,
    tier: 'frontier',
    scores: { mmlu: 88.0, humanEval: 89.8, math: 78.5, gpqa: 62.8, gsm8k: 95.0, arenaElo: 1260 },
    pricing: { input: 0.27, output: 1.1 },
    speed: { tokensPerSecond: 95, timeToFirstToken: 160 },
  },
  // —— Open-weight ——
  {
    id: 'llama-4-maverick',
    name: 'Llama 4 Maverick',
    provider: 'Meta',
    providerLogo: clearbit('meta.com'),
    releaseDate: '2025-07-22',
    openSource: true,
    contextWindow: 128_000,
    tier: 'open-weight',
    scores: { mmlu: 86.2, humanEval: 85.0, math: 70.5, gpqa: 56.0, gsm8k: 90.0, arenaElo: 1205 },
    pricing: { input: null, output: null },
    speed: { tokensPerSecond: 88, timeToFirstToken: 140 },
  },
  {
    id: 'llama-4-scout',
    name: 'Llama 4 Scout',
    provider: 'Meta',
    providerLogo: clearbit('meta.com'),
    releaseDate: '2025-07-22',
    openSource: true,
    contextWindow: 128_000,
    tier: 'open-weight',
    scores: { mmlu: 82.5, humanEval: 80.0, math: 65.0, gpqa: 50.0, gsm8k: 85.0, arenaElo: 1160 },
    pricing: { input: null, output: null },
    speed: { tokensPerSecond: 110, timeToFirstToken: 100 },
  },
  {
    id: 'qwen-3',
    name: 'Qwen 3',
    provider: 'Alibaba',
    providerLogo: clearbit('alibaba.com'),
    releaseDate: '2025-06-01',
    openSource: true,
    contextWindow: 128_000,
    tier: 'open-weight',
    scores: { mmlu: 84.5, humanEval: 86.2, math: 72.0, gpqa: 54.5, gsm8k: 88.5, arenaElo: 1185 },
    pricing: { input: null, output: null },
    speed: { tokensPerSecond: 92, timeToFirstToken: 130 },
  },
  {
    id: 'mistral-large',
    name: 'Mistral Large',
    provider: 'Mistral AI',
    providerLogo: clearbit('mistral.ai'),
    releaseDate: '2024-02-26',
    openSource: false,
    contextWindow: 128_000,
    tier: 'open-weight',
    scores: { mmlu: 83.5, humanEval: 84.0, math: 68.2, gpqa: 52.0, gsm8k: 86.0, arenaElo: 1175 },
    pricing: { input: 2, output: 6 },
    speed: { tokensPerSecond: 70, timeToFirstToken: 250 },
  },
  {
    id: 'deepseek-r1',
    name: 'DeepSeek R1',
    provider: 'DeepSeek',
    providerLogo: clearbit('deepseek.com'),
    releaseDate: '2025-01-15',
    openSource: true,
    contextWindow: 64_000,
    tier: 'open-weight',
    scores: { mmlu: 85.0, humanEval: 82.0, math: 74.0, gpqa: 58.0, gsm8k: 92.0, arenaElo: 1195 },
    pricing: { input: 0.55, output: 2.19 },
    speed: { tokensPerSecond: 65, timeToFirstToken: 380 },
  },
  {
    id: 'phi-4',
    name: 'Phi-4',
    provider: 'Microsoft',
    providerLogo: clearbit('microsoft.com'),
    releaseDate: '2025-05-01',
    openSource: true,
    contextWindow: 128_000,
    tier: 'open-weight',
    scores: { mmlu: 80.5, humanEval: 78.0, math: 62.0, gpqa: 48.0, gsm8k: 82.0, arenaElo: 1120 },
    pricing: { input: null, output: null },
    speed: { tokensPerSecond: 105, timeToFirstToken: 110 },
  },
  // —— Budget / Fast ——
  {
    id: 'gpt-4o-mini',
    name: 'GPT-4o mini',
    provider: 'OpenAI',
    providerLogo: clearbit('openai.com'),
    releaseDate: '2024-07-18',
    openSource: false,
    contextWindow: 128_000,
    tier: 'budget',
    scores: { mmlu: 82.0, humanEval: 82.5, math: 65.0, gpqa: 50.0, gsm8k: 88.0, arenaElo: 1155 },
    pricing: { input: 0.15, output: 0.6 },
    speed: { tokensPerSecond: 140, timeToFirstToken: 90 },
  },
  {
    id: 'claude-haiku-3.5',
    name: 'Claude Haiku 3.5',
    provider: 'Anthropic',
    providerLogo: clearbit('anthropic.com'),
    releaseDate: '2025-06-01',
    openSource: false,
    contextWindow: 200_000,
    tier: 'budget',
    scores: { mmlu: 80.0, humanEval: 79.0, math: 60.0, gpqa: 46.0, gsm8k: 84.0, arenaElo: 1110 },
    pricing: { input: 0.25, output: 1.25 },
    speed: { tokensPerSecond: 135, timeToFirstToken: 95 },
  },
  {
    id: 'gemini-2.0-flash',
    name: 'Gemini 2.0 Flash',
    provider: 'Google',
    providerLogo: clearbit('google.com'),
    releaseDate: '2025-02-01',
    openSource: false,
    contextWindow: 1_000_000,
    tier: 'budget',
    scores: { mmlu: 81.5, humanEval: 80.5, math: 63.0, gpqa: 48.5, gsm8k: 85.5, arenaElo: 1135 },
    pricing: { input: 0.075, output: 0.3 },
    speed: { tokensPerSecond: 130, timeToFirstToken: 100 },
  },
  {
    id: 'mistral-small',
    name: 'Mistral Small',
    provider: 'Mistral AI',
    providerLogo: clearbit('mistral.ai'),
    releaseDate: '2024-04-01',
    openSource: false,
    contextWindow: 32_000,
    tier: 'budget',
    scores: { mmlu: 78.0, humanEval: 75.0, math: 55.0, gpqa: 42.0, gsm8k: 78.0, arenaElo: 1080 },
    pricing: { input: 0.2, output: 0.6 },
    speed: { tokensPerSecond: 125, timeToFirstToken: 105 },
  },
  // —— Historical (for progress chart) ——
  {
    id: 'gpt-3',
    name: 'GPT-3',
    provider: 'OpenAI',
    providerLogo: clearbit('openai.com'),
    releaseDate: '2020-06-11',
    openSource: false,
    contextWindow: 4_096,
    tier: 'historical',
    scores: { mmlu: 43.9, humanEval: 0, math: null, gpqa: null, gsm8k: null, arenaElo: null },
    pricing: { input: null, output: null },
    speed: { tokensPerSecond: null, timeToFirstToken: null },
  },
  {
    id: 'gpt-3.5-turbo',
    name: 'GPT-3.5',
    provider: 'OpenAI',
    providerLogo: clearbit('openai.com'),
    releaseDate: '2022-11-30',
    openSource: false,
    contextWindow: 4_096,
    tier: 'historical',
    scores: { mmlu: 70.0, humanEval: 48.1, math: 34.1, gpqa: null, gsm8k: 57.1, arenaElo: null },
    pricing: { input: null, output: null },
    speed: { tokensPerSecond: null, timeToFirstToken: null },
  },
  {
    id: 'gpt-4',
    name: 'GPT-4',
    provider: 'OpenAI',
    providerLogo: clearbit('openai.com'),
    releaseDate: '2023-03-14',
    openSource: false,
    contextWindow: 8_192,
    tier: 'historical',
    scores: { mmlu: 86.4, humanEval: 67.0, math: 52.9, gpqa: null, gsm8k: 92.0, arenaElo: null },
    pricing: { input: null, output: null },
    speed: { tokensPerSecond: null, timeToFirstToken: null },
  },
  {
    id: 'claude-2',
    name: 'Claude 2',
    provider: 'Anthropic',
    providerLogo: clearbit('anthropic.com'),
    releaseDate: '2023-07-11',
    openSource: false,
    contextWindow: 100_000,
    tier: 'historical',
    scores: { mmlu: 78.5, humanEval: 70.0, math: 45.0, gpqa: null, gsm8k: 88.0, arenaElo: null },
    pricing: { input: null, output: null },
    speed: { tokensPerSecond: null, timeToFirstToken: null },
  },
  {
    id: 'gemini-1.0-pro',
    name: 'Gemini 1.0 Pro',
    provider: 'Google',
    providerLogo: clearbit('google.com'),
    releaseDate: '2023-12-06',
    openSource: false,
    contextWindow: 32_768,
    tier: 'historical',
    scores: { mmlu: 79.1, humanEval: 63.4, math: 44.4, gpqa: null, gsm8k: 86.5, arenaElo: null },
    pricing: { input: null, output: null },
    speed: { tokensPerSecond: null, timeToFirstToken: null },
  },
];

/** Blended $/1M tokens (3:1 input:output). */
export function blendedPrice(model: BenchmarkModel): number | null {
  const { input, output } = model.pricing;
  if (input == null || output == null) return null;
  return (input * 3 + output) / 4;
}

/** Composite quality: average of available benchmark percentages (0–100). */
export function compositeScore(model: BenchmarkModel): number {
  const s = model.scores;
  const vals = [s.mmlu, s.humanEval, s.math, s.gpqa, s.gsm8k].filter(
    (v): v is number => v != null
  );
  if (vals.length === 0) return 0;
  return vals.reduce((a, b) => a + b, 0) / vals.length;
}

/** Models that have MMLU (for progress timeline). Sorted by release date. */
export const MODELS_WITH_MMLU = BENCHMARK_MODELS.filter((m) => m.scores.mmlu != null)
  .slice()
  .sort(
    (a, b) => new Date(a.releaseDate).getTime() - new Date(b.releaseDate).getTime()
  );

/** Models with speed data (for speed chart). */
export const MODELS_WITH_SPEED = BENCHMARK_MODELS.filter(
  (m) => m.speed.tokensPerSecond != null
).sort((a, b) => (b.speed.tokensPerSecond ?? 0) - (a.speed.tokensPerSecond ?? 0));
