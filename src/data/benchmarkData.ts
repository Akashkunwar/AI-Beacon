/**
 * Benchmark snapshot for the Benchmarks page.
 *
 * Rules for this file (see docs/DATA-GUIDE.md):
 *  - Only use scores the developer published (launch post, model card or
 *    technical report) or that the benchmark authors published. Put the link
 *    in `source`.
 *  - Never estimate or copy a number from a different benchmark variant.
 *    If a model did not report a benchmark, leave it out — blank ≠ zero.
 *  - Record the reasoning setting in `notes` when a lab reports several
 *    (e.g. "extended thinking", "no tools").
 *  - `price` is the standard API list price in USD per 1M tokens as of
 *    LAST_UPDATED (or the last list price for retired models).
 */

export const LAST_UPDATED = '2026-09-28';

export type MetricId = 'mmlu' | 'gpqa' | 'swe' | 'aime' | 'hle';

export interface BenchmarkMetric {
  id: MetricId;
  name: string;
  short: string;
  /** What a model has to do */
  measures: string;
  /** Why people care */
  why: string;
  /** What it cannot tell you */
  caveat: string;
  /** Reference points to make a score meaningful */
  baseline: string;
  /** Is it still useful for comparing frontier models? */
  status: 'active' | 'saturating' | 'retired';
  statusNote: string;
  paper: string;
  leaderboard?: string;
}

export const METRICS: BenchmarkMetric[] = [
  {
    id: 'gpqa',
    name: 'GPQA Diamond',
    short: 'GPQA',
    measures: '198 graduate-level multiple-choice questions in biology, physics and chemistry, written so that a web search does not reveal the answer.',
    why: 'A compact test of expert-level scientific reasoning that most labs still report, so it allows the widest comparison across generations.',
    caveat: 'Multiple choice (25% by guessing) and only 198 questions, so differences of 1–2 points are within noise. Frontier models now score above 90%.',
    baseline: 'Random guessing ≈ 25% · PhD experts in the field ≈ 65% · skilled non-experts with Google ≈ 34%',
    status: 'saturating',
    statusNote: 'Top models cluster within about two points of each other in 2026.',
    paper: 'https://arxiv.org/abs/2311.12022',
    leaderboard: 'https://artificialanalysis.ai/evaluations/gpqa-diamond',
  },
  {
    id: 'swe',
    name: 'SWE-bench Verified',
    short: 'SWE-bench',
    measures: '500 real GitHub issues from popular Python projects. The model must write a code change that makes the project’s hidden tests pass.',
    why: 'The closest widely reported proxy for “can this model do real software engineering work as an agent?”.',
    caveat: 'Results depend heavily on the agent scaffold, number of attempts and time budget. Concerns about training-data contamination led many labs to move to SWE-bench Pro in 2026.',
    baseline: 'Early 2024 agents solved ≈ 20–30%; the best 2026 models report 85–95%.',
    status: 'saturating',
    statusNote: 'Being replaced by harder variants such as SWE-bench Pro and Terminal-Bench.',
    paper: 'https://arxiv.org/abs/2310.06770',
    leaderboard: 'https://www.swebench.com/',
  },
  {
    id: 'hle',
    name: 'Humanity’s Last Exam',
    short: 'HLE',
    measures: 'About 2,500 very hard questions from ~1,000 subject experts across maths, science and the humanities; scored here without tools (no search or code).',
    why: 'Built to stay hard after older exams were maxed out — still one of the few benchmarks with lots of headroom.',
    caveat: 'Scores with tools or agents are much higher and are not comparable to “no tools” numbers. Some questions have been found to contain errors.',
    baseline: 'Early 2025 frontier models scored under 10%.',
    status: 'active',
    statusNote: 'Still far from saturated; the headline “hard” exam of 2025–2026.',
    paper: 'https://arxiv.org/abs/2501.14249',
    leaderboard: 'https://lastexam.ai/',
  },
  {
    id: 'aime',
    name: 'AIME 2025',
    short: 'AIME',
    measures: 'The 30 problems of the 2025 American Invitational Mathematics Examination, a competition for top high-school students. Answers are integers from 0 to 999.',
    why: 'A clean test of multi-step mathematical reasoning that clearly separated reasoning models from earlier chat models.',
    caveat: 'Only 30 problems, so one problem is worth 3.3 points. Reported results differ by sampling method (single attempt vs. majority vote).',
    baseline: 'Top human contestants typically solve roughly a third to two thirds of the problems.',
    status: 'retired',
    statusNote: 'Saturated: several models reached 100% by late 2025.',
    paper: 'https://artofproblemsolving.com/wiki/index.php/2025_AIME_I',
  },
  {
    id: 'mmlu',
    name: 'MMLU',
    short: 'MMLU',
    measures: '15,908 multiple-choice questions across 57 subjects, from elementary maths to law and medicine.',
    why: 'The standard knowledge benchmark from 2020 to 2024 — useful for seeing how fast early progress was.',
    caveat: 'Contains some wrong answer keys, and questions are widely available online. Most 2025+ models no longer report it.',
    baseline: 'Random guessing = 25% · estimated expert human ≈ 90%',
    status: 'retired',
    statusNote: 'Saturated around 88–92% in 2024; kept here for history.',
    paper: 'https://arxiv.org/abs/2009.03300',
  },
];

export const METRIC_BY_ID: Record<MetricId, BenchmarkMetric> = Object.fromEntries(
  METRICS.map((m) => [m.id, m]),
) as Record<MetricId, BenchmarkMetric>;

export interface BenchmarkModel {
  id: string;
  name: string;
  provider: string;
  releaseDate: string;
  openWeights: boolean;
  contextWindow: number | null;
  price: { input: number; output: number } | null;
  scores: Partial<Record<MetricId, number>>;
  notes?: string;
  source: { label: string; url: string };
}

const hle = { label: 'Humanity’s Last Exam paper', url: 'https://arxiv.org/abs/2501.14249' };

export const BENCHMARK_MODELS: BenchmarkModel[] = [
  // ─── Historical (the MMLU era) ──────────────────────────────────────────
  {
    id: 'gpt-3', name: 'GPT-3', provider: 'OpenAI', releaseDate: '2020-06-11', openWeights: false,
    contextWindow: 2048, price: null, scores: { mmlu: 43.9 },
    notes: 'Few-shot (davinci), as reported in the MMLU paper.',
    source: { label: 'MMLU paper', url: 'https://arxiv.org/abs/2009.03300' },
  },
  {
    id: 'gpt-3.5', name: 'GPT-3.5', provider: 'OpenAI', releaseDate: '2022-11-30', openWeights: false,
    contextWindow: 4096, price: null, scores: { mmlu: 70.0 },
    source: { label: 'GPT-4 technical report', url: 'https://arxiv.org/abs/2303.08774' },
  },
  {
    id: 'gpt-4', name: 'GPT-4', provider: 'OpenAI', releaseDate: '2023-03-14', openWeights: false,
    contextWindow: 8192, price: { input: 30, output: 60 }, scores: { mmlu: 86.4 },
    source: { label: 'GPT-4 technical report', url: 'https://arxiv.org/abs/2303.08774' },
  },
  {
    id: 'llama-2-70b', name: 'Llama 2 70B', provider: 'Meta', releaseDate: '2023-07-18', openWeights: true,
    contextWindow: 4096, price: null, scores: { mmlu: 68.9 },
    source: { label: 'Llama 2 paper', url: 'https://arxiv.org/abs/2307.09288' },
  },
  {
    id: 'claude-2', name: 'Claude 2', provider: 'Anthropic', releaseDate: '2023-07-11', openWeights: false,
    contextWindow: 100000, price: null, scores: { mmlu: 78.5 },
    source: { label: 'Anthropic model card', url: 'https://www.anthropic.com/news/claude-2' },
  },
  {
    id: 'claude-3-opus', name: 'Claude 3 Opus', provider: 'Anthropic', releaseDate: '2024-03-04', openWeights: false,
    contextWindow: 200000, price: { input: 15, output: 75 }, scores: { mmlu: 86.8, gpqa: 50.4 },
    source: { label: 'Anthropic announcement', url: 'https://www.anthropic.com/news/claude-3-family' },
  },
  {
    id: 'gpt-4o', name: 'GPT-4o', provider: 'OpenAI', releaseDate: '2024-05-13', openWeights: false,
    contextWindow: 128000, price: { input: 2.5, output: 10 }, scores: { mmlu: 88.7, gpqa: 53.6, swe: 33.2, hle: 2.7 },
    notes: 'SWE-bench Verified from OpenAI’s benchmark announcement; HLE from the HLE paper.',
    source: { label: 'OpenAI announcement', url: 'https://openai.com/index/hello-gpt-4o/' },
  },
  {
    id: 'llama-3.1-405b', name: 'Llama 3.1 405B', provider: 'Meta', releaseDate: '2024-07-23', openWeights: true,
    contextWindow: 128000, price: null, scores: { mmlu: 88.6, gpqa: 50.7 },
    source: { label: 'Llama 3 paper', url: 'https://arxiv.org/abs/2407.21783' },
  },
  {
    id: 'claude-3.5-sonnet', name: 'Claude 3.5 Sonnet (Oct 2024)', provider: 'Anthropic', releaseDate: '2024-10-22', openWeights: false,
    contextWindow: 200000, price: { input: 3, output: 15 }, scores: { gpqa: 65.0, swe: 49.0, hle: 4.1 },
    notes: 'HLE from the HLE paper.',
    source: { label: 'Anthropic announcement', url: 'https://www.anthropic.com/news/3-5-models-and-computer-use' },
  },
  // ─── Reasoning models arrive ───────────────────────────────────────────
  {
    id: 'o1', name: 'OpenAI o1', provider: 'OpenAI', releaseDate: '2024-12-05', openWeights: false,
    contextWindow: 200000, price: { input: 15, output: 60 }, scores: { mmlu: 91.8, gpqa: 78.0, swe: 48.9, hle: 9.1 },
    notes: 'HLE from the HLE paper.',
    source: { label: 'OpenAI: Learning to reason with LLMs', url: 'https://openai.com/index/learning-to-reason-with-llms/' },
  },
  {
    id: 'deepseek-v3', name: 'DeepSeek-V3', provider: 'DeepSeek', releaseDate: '2024-12-26', openWeights: true,
    contextWindow: 128000, price: { input: 0.27, output: 1.1 }, scores: { mmlu: 88.5, gpqa: 59.1, swe: 42.0 },
    source: { label: 'DeepSeek-V3 technical report', url: 'https://arxiv.org/abs/2412.19437' },
  },
  {
    id: 'deepseek-r1', name: 'DeepSeek-R1', provider: 'DeepSeek', releaseDate: '2025-01-20', openWeights: true,
    contextWindow: 128000, price: { input: 0.55, output: 2.19 }, scores: { mmlu: 90.8, gpqa: 71.5, swe: 49.2 },
    source: { label: 'DeepSeek-R1 paper', url: 'https://arxiv.org/abs/2501.12948' },
  },
  {
    id: 'o3-mini', name: 'OpenAI o3-mini (high)', provider: 'OpenAI', releaseDate: '2025-01-31', openWeights: false,
    contextWindow: 200000, price: { input: 1.1, output: 4.4 }, scores: { gpqa: 79.7, swe: 49.3, hle: 13.0 },
    source: { label: 'OpenAI announcement', url: 'https://openai.com/index/openai-o3-mini/' },
  },
  {
    id: 'claude-3.7-sonnet', name: 'Claude 3.7 Sonnet', provider: 'Anthropic', releaseDate: '2025-02-24', openWeights: false,
    contextWindow: 200000, price: { input: 3, output: 15 }, scores: { gpqa: 78.2, swe: 62.3 },
    notes: 'GPQA with extended thinking; SWE-bench without extra scaffolding.',
    source: { label: 'Anthropic announcement', url: 'https://www.anthropic.com/news/claude-3-7-sonnet' },
  },
  {
    id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro', provider: 'Google DeepMind', releaseDate: '2025-03-25', openWeights: false,
    contextWindow: 1048576, price: { input: 1.25, output: 10 }, scores: { gpqa: 84.0, swe: 63.8, aime: 86.7, hle: 18.8 },
    notes: 'Scores from the March 2025 experimental release.',
    source: { label: 'Google announcement', url: 'https://blog.google/technology/google-deepmind/gemini-model-thinking-updates-march-2025/' },
  },
  {
    id: 'gpt-4.1', name: 'GPT-4.1', provider: 'OpenAI', releaseDate: '2025-04-14', openWeights: false,
    contextWindow: 1047576, price: { input: 2, output: 8 }, scores: { mmlu: 90.2, gpqa: 66.3, swe: 54.6 },
    source: { label: 'OpenAI announcement', url: 'https://openai.com/index/gpt-4-1/' },
  },
  {
    id: 'llama-4-maverick', name: 'Llama 4 Maverick', provider: 'Meta', releaseDate: '2025-04-05', openWeights: true,
    contextWindow: 1000000, price: null, scores: { gpqa: 69.8 },
    source: { label: 'Meta announcement', url: 'https://ai.meta.com/blog/llama-4-multimodal-intelligence/' },
  },
  {
    id: 'o3', name: 'OpenAI o3', provider: 'OpenAI', releaseDate: '2025-04-16', openWeights: false,
    contextWindow: 200000, price: { input: 2, output: 8 }, scores: { gpqa: 83.3, swe: 69.1, aime: 88.9, hle: 20.3 },
    notes: 'Launch price was $10/$40; cut to $2/$8 in June 2025.',
    source: { label: 'OpenAI announcement', url: 'https://openai.com/index/introducing-o3-and-o4-mini/' },
  },
  {
    id: 'o4-mini', name: 'OpenAI o4-mini', provider: 'OpenAI', releaseDate: '2025-04-16', openWeights: false,
    contextWindow: 200000, price: { input: 1.1, output: 4.4 }, scores: { gpqa: 81.4, swe: 68.1, aime: 92.7 },
    source: { label: 'OpenAI announcement', url: 'https://openai.com/index/introducing-o3-and-o4-mini/' },
  },
  {
    id: 'claude-opus-4', name: 'Claude Opus 4', provider: 'Anthropic', releaseDate: '2025-05-22', openWeights: false,
    contextWindow: 200000, price: { input: 15, output: 75 }, scores: { gpqa: 79.6, swe: 72.5, aime: 75.5 },
    notes: 'Standard (non-extended-thinking) results.',
    source: { label: 'Anthropic announcement', url: 'https://www.anthropic.com/news/claude-4' },
  },
  {
    id: 'claude-sonnet-4', name: 'Claude Sonnet 4', provider: 'Anthropic', releaseDate: '2025-05-22', openWeights: false,
    contextWindow: 200000, price: { input: 3, output: 15 }, scores: { gpqa: 75.4, swe: 72.7, aime: 70.5 },
    notes: 'Standard (non-extended-thinking) results.',
    source: { label: 'Anthropic announcement', url: 'https://www.anthropic.com/news/claude-4' },
  },
  {
    id: 'grok-4', name: 'Grok 4', provider: 'xAI', releaseDate: '2025-07-09', openWeights: false,
    contextWindow: 256000, price: { input: 3, output: 15 }, scores: { gpqa: 87.5, hle: 25.4 },
    source: { label: 'xAI announcement', url: 'https://x.ai/news/grok-4' },
  },
  {
    id: 'kimi-k2', name: 'Kimi K2', provider: 'Moonshot AI', releaseDate: '2025-07-11', openWeights: true,
    contextWindow: 128000, price: { input: 0.6, output: 2.5 }, scores: { gpqa: 75.1, swe: 65.8, aime: 49.5 },
    notes: 'Non-reasoning (instruct) model.',
    source: { label: 'Kimi K2 announcement', url: 'https://moonshotai.github.io/Kimi-K2/' },
  },
  {
    id: 'gpt-oss-120b', name: 'gpt-oss-120b', provider: 'OpenAI', releaseDate: '2025-08-05', openWeights: true,
    contextWindow: 131072, price: null, scores: { mmlu: 90.0, gpqa: 80.1, swe: 62.4, aime: 92.5, hle: 14.9 },
    notes: 'High reasoning effort, no tools.',
    source: { label: 'gpt-oss model card', url: 'https://arxiv.org/abs/2508.10925' },
  },
  {
    id: 'claude-opus-4.1', name: 'Claude Opus 4.1', provider: 'Anthropic', releaseDate: '2025-08-05', openWeights: false,
    contextWindow: 200000, price: { input: 15, output: 75 }, scores: { gpqa: 80.9, swe: 74.5, aime: 78.0 },
    source: { label: 'Anthropic announcement', url: 'https://www.anthropic.com/news/claude-opus-4-1' },
  },
  {
    id: 'gpt-5', name: 'GPT-5', provider: 'OpenAI', releaseDate: '2025-08-07', openWeights: false,
    contextWindow: 400000, price: { input: 1.25, output: 10 }, scores: { gpqa: 85.7, swe: 74.9, aime: 94.6, hle: 24.8 },
    notes: 'With thinking, no tools.',
    source: { label: 'OpenAI announcement', url: 'https://openai.com/index/introducing-gpt-5/' },
  },
  {
    id: 'claude-sonnet-4.5', name: 'Claude Sonnet 4.5', provider: 'Anthropic', releaseDate: '2025-09-29', openWeights: false,
    contextWindow: 200000, price: { input: 3, output: 15 }, scores: { gpqa: 83.4, swe: 77.2, aime: 87.0 },
    source: { label: 'Anthropic announcement', url: 'https://www.anthropic.com/news/claude-sonnet-4-5' },
  },
  {
    id: 'claude-haiku-4.5', name: 'Claude Haiku 4.5', provider: 'Anthropic', releaseDate: '2025-10-15', openWeights: false,
    contextWindow: 200000, price: { input: 1, output: 5 }, scores: { gpqa: 73.0, swe: 73.3 },
    source: { label: 'Anthropic announcement', url: 'https://www.anthropic.com/news/claude-haiku-4-5' },
  },
  {
    id: 'gpt-5.1', name: 'GPT-5.1', provider: 'OpenAI', releaseDate: '2025-11-12', openWeights: false,
    contextWindow: 400000, price: { input: 1.25, output: 10 }, scores: { gpqa: 88.1, swe: 76.3, aime: 94.0 },
    source: { label: 'OpenAI announcement', url: 'https://openai.com/index/gpt-5-1/' },
  },
  {
    id: 'gemini-3-pro', name: 'Gemini 3 Pro', provider: 'Google DeepMind', releaseDate: '2025-11-18', openWeights: false,
    contextWindow: 1048576, price: { input: 2, output: 12 }, scores: { gpqa: 91.9, swe: 76.2, aime: 95.0, hle: 37.5 },
    notes: 'Price for prompts up to 200K tokens.',
    source: { label: 'Google announcement', url: 'https://blog.google/products/gemini/gemini-3/' },
  },
  {
    id: 'claude-opus-4.5', name: 'Claude Opus 4.5', provider: 'Anthropic', releaseDate: '2025-11-24', openWeights: false,
    contextWindow: 200000, price: { input: 5, output: 25 }, scores: { gpqa: 87.0, swe: 80.9 },
    source: { label: 'Anthropic announcement', url: 'https://www.anthropic.com/news/claude-opus-4-5' },
  },
  {
    id: 'deepseek-v3.2', name: 'DeepSeek-V3.2', provider: 'DeepSeek', releaseDate: '2025-12-01', openWeights: true,
    contextWindow: 128000, price: { input: 0.28, output: 0.42 }, scores: { gpqa: 82.4, swe: 73.1, aime: 93.1, hle: 25.1 },
    source: { label: 'DeepSeek-V3.2 paper', url: 'https://arxiv.org/abs/2512.02556' },
  },
  {
    id: 'gpt-5.2', name: 'GPT-5.2 Thinking', provider: 'OpenAI', releaseDate: '2025-12-11', openWeights: false,
    contextWindow: 400000, price: { input: 1.75, output: 14 }, scores: { gpqa: 92.4, swe: 80.0, aime: 100 },
    source: { label: 'OpenAI announcement', url: 'https://openai.com/index/introducing-gpt-5-2/' },
  },
  {
    id: 'gemini-3-flash', name: 'Gemini 3 Flash', provider: 'Google DeepMind', releaseDate: '2025-12-17', openWeights: false,
    contextWindow: 1048576, price: { input: 0.5, output: 3 }, scores: { gpqa: 90.4, swe: 78.0, hle: 33.7 },
    source: { label: 'Google announcement', url: 'https://blog.google/products/gemini/gemini-3-flash/' },
  },
  // ─── 2026 ───────────────────────────────────────────────────────────────
  {
    id: 'claude-opus-4.6', name: 'Claude Opus 4.6', provider: 'Anthropic', releaseDate: '2026-02-05', openWeights: false,
    contextWindow: 1000000, price: { input: 5, output: 25 }, scores: { gpqa: 91.3, swe: 80.8, hle: 40.0 },
    source: { label: 'Anthropic system card', url: 'https://www.anthropic.com/news/claude-opus-4-6' },
  },
  {
    id: 'glm-5', name: 'GLM-5', provider: 'Zhipu AI (Z.ai)', releaseDate: '2026-02-12', openWeights: true,
    contextWindow: 200000, price: null, scores: { gpqa: 86.0, swe: 77.8 },
    source: { label: 'GLM-5 paper', url: 'https://arxiv.org/abs/2602.15763' },
  },
  {
    id: 'gemini-3.1-pro', name: 'Gemini 3.1 Pro', provider: 'Google DeepMind', releaseDate: '2026-02-19', openWeights: false,
    contextWindow: 1048576, price: { input: 2, output: 12 }, scores: { gpqa: 94.3, swe: 80.6, hle: 44.4 },
    source: { label: 'Google announcement', url: 'https://deepmind.google/models/gemini/pro/' },
  },
  {
    id: 'claude-opus-4.7', name: 'Claude Opus 4.7', provider: 'Anthropic', releaseDate: '2026-04-16', openWeights: false,
    contextWindow: 1000000, price: { input: 5, output: 25 }, scores: { gpqa: 94.2, swe: 87.6 },
    source: { label: 'Anthropic announcement', url: 'https://www.anthropic.com/news/claude-opus-4-7' },
  },
  {
    id: 'deepseek-v4-pro', name: 'DeepSeek-V4-Pro', provider: 'DeepSeek', releaseDate: '2026-04-24', openWeights: true,
    contextWindow: 1000000, price: { input: 0.435, output: 0.87 }, scores: { gpqa: 90.1, swe: 80.6, hle: 37.7 },
    notes: 'Maximum reasoning effort.',
    source: { label: 'DeepSeek V4 announcement', url: 'https://api-docs.deepseek.com/news/news260424/' },
  },
  {
    id: 'claude-fable-5', name: 'Claude Fable 5', provider: 'Anthropic', releaseDate: '2026-06-09', openWeights: false,
    contextWindow: 1000000, price: { input: 10, output: 50 }, scores: { swe: 95.0, hle: 53.3 },
    source: { label: 'Anthropic announcement', url: 'https://www.anthropic.com/news/claude-fable-5-mythos-5' },
  },
  {
    id: 'gpt-6-astra', name: 'GPT-6 Astra', provider: 'OpenAI', releaseDate: '2026-09-03', openWeights: false,
    contextWindow: 1050000, price: { input: 10, output: 50 }, scores: { gpqa: 96.0 },
    notes: 'OpenAI did not publish SWE-bench or no-tools HLE results for Astra. Long-context requests (>272K) cost more.',
    source: { label: 'OpenAI announcement', url: 'https://openai.com/index/gpt-6-astra/' },
  },
];

/**
 * The newest frontier models. Labs increasingly report newer, non-comparable
 * suites (Terminal-Bench 4.0, SWE-bench Pro, ARC-AGI-3…), so these are listed
 * for context rather than ranked.
 */
export interface NewModelNote {
  name: string;
  provider: string;
  releaseDate: string;
  openWeights: boolean;
  contextWindow: number | null;
  price: { input: number; output: number } | null;
  reports: string;
  url: string;
}

export const NEWEST_MODELS: NewModelNote[] = [
  { name: 'Claude Fable 5.1', provider: 'Anthropic', releaseDate: '2026-09-01', openWeights: false, contextWindow: 1000000, price: { input: 10, output: 50 }, reports: 'Terminal-Bench 4.0, Terminal-Bench-Science, SWE-bench Pro', url: 'https://www.anthropic.com/claude-fable-and-mythos-5-1' },
  { name: 'Gemini 3.8 Flash', provider: 'Google DeepMind', releaseDate: '2026-09-02', openWeights: false, contextWindow: 1048576, price: { input: 0.75, output: 3.75 }, reports: 'Google model card suite (introductory price until Dec 31, 2026)', url: 'https://deepmind.google/models/model-cards/gemini-3-8-flash/' },
  { name: 'GPT-6 Astra', provider: 'OpenAI', releaseDate: '2026-09-03', openWeights: false, contextWindow: 1050000, price: { input: 10, output: 50 }, reports: 'GPQA Diamond, ARC-AGI-3, DeepSWE, HLE (with tools)', url: 'https://openai.com/index/gpt-6-astra/' },
  { name: 'DeepSeek V4.1 Flash', provider: 'DeepSeek', releaseDate: '2026-09-10', openWeights: true, contextWindow: 1000000, price: null, reports: 'Technical report (KV-cache compression focus)', url: 'https://api-docs.deepseek.com/updates/' },
  { name: 'Grok 4.7', provider: 'xAI (SpaceXAI)', releaseDate: '2026-09-21', openWeights: false, contextWindow: null, price: null, reports: 'CursorBench 4.0 and coding/knowledge suites', url: 'https://docs.x.ai/developers/models' },
  { name: 'Claude Opus 5.5', provider: 'Anthropic', releaseDate: '2026-09-22', openWeights: false, contextWindow: 1000000, price: { input: 4, output: 20 }, reports: 'Terminal-Bench 4.0, FrontierCode, CursorBench, HLE', url: 'https://www.anthropic.com/claude-opus-5-5' },
  { name: 'GPT-6 Sol', provider: 'OpenAI', releaseDate: '2026-09-22', openWeights: false, contextWindow: 1050000, price: { input: 2, output: 10 }, reports: 'Coding and agent suites', url: 'https://openai.com/' },
  { name: 'GPT-6 Luna', provider: 'OpenAI', releaseDate: '2026-09-22', openWeights: false, contextWindow: 1050000, price: { input: 0.1, output: 0.5 }, reports: 'Cost-efficiency focused', url: 'https://openai.com/' },
];

/** Blended $ per 1M tokens assuming 3 input tokens for every output token. */
export function blendedPrice(model: Pick<BenchmarkModel, 'price'>): number | null {
  if (!model.price) return null;
  return (model.price.input * 3 + model.price.output) / 4;
}

export function modelsWith(metric: MetricId): BenchmarkModel[] {
  return BENCHMARK_MODELS.filter((m) => m.scores[metric] != null);
}

/** Live leaderboards maintained by third parties. */
export const LIVE_LEADERBOARDS = [
  { label: 'Artificial Analysis', url: 'https://artificialanalysis.ai/', desc: 'Independent runs of many benchmarks, plus speed and price.' },
  { label: 'LMArena', url: 'https://lmarena.ai/', desc: 'Blind human preference votes between two anonymous models.' },
  { label: 'Epoch AI Benchmarking Hub', url: 'https://epoch.ai/benchmarks', desc: 'Independent evaluations and long-run trend data.' },
  { label: 'SWE-bench', url: 'https://www.swebench.com/', desc: 'Official SWE-bench leaderboards, including agent scaffolds.' },
  { label: 'Humanity’s Last Exam', url: 'https://lastexam.ai/', desc: 'Official HLE results.' },
];

export const HLE_PAPER_SOURCE = hle;
