// Metadata for the ten stages of Module 03 (How AI Is Trained).
// `id` is used in the URL (?stage=pretraining), so keep it stable.

export type StagePhase = 'prepare' | 'pretrain' | 'posttrain' | 'ship';

export const PHASE_LABELS: Record<StagePhase, string> = {
    prepare: 'Prepare',
    pretrain: 'Pre-train',
    posttrain: 'Post-train',
    ship: 'Ship',
};

export interface StageMeta {
    id: string;
    title: string;
    short: string;
    phase: StagePhase;
    lede: string;
    goal: string;
    how: string;
    watch: string;
}

export const STAGES: StageMeta[] = [
    {
        id: 'data',
        title: 'Gather and clean the data',
        short: 'Data',
        phase: 'prepare',
        lede: 'A language model can only learn from the text it is trained on. Builders collect trillions of words — web pages, books, code, research papers — then filter, deduplicate and document them. What goes in shapes everything the model can do, and much of what it gets wrong.',
        goal: 'A very large, high-quality collection of text that is legal to use.',
        how: 'Crawl or license sources, strip spam and boilerplate, remove duplicates and personal data, balance topics and languages.',
        watch: 'More data is not automatically better: quality, diversity and permission matter as much as size.',
    },
    {
        id: 'tokenizer',
        title: 'Build the vocabulary',
        short: 'Tokenizer',
        phase: 'prepare',
        lede: 'Before training starts, the team builds the tokenizer: the fixed list of text pieces the model will read and write. It is learned from sample data with an algorithm such as byte-pair encoding, then frozen — the model can never change it later.',
        goal: 'A vocabulary that turns any text into a short sequence of token IDs.',
        how: 'Start from single bytes and repeatedly merge the most frequent neighbouring pair into a new token.',
        watch: 'Tokens are not words. Uncommon words, numbers and many non-English languages need more tokens, which costs more and can hurt quality.',
    },
    {
        id: 'architecture',
        title: 'Design the network',
        short: 'Architecture',
        phase: 'prepare',
        lede: 'Next the team fixes the model’s shape: how many layers, how wide they are, and how attention is organised. These choices decide the parameter count, the memory needed to run the model and the compute needed to train it — and they cannot change once training begins.',
        goal: 'A transformer sized to the compute budget and to how the model will be served.',
        how: 'Choose depth, width, attention layout (MHA, GQA, MLA), context length, and dense or mixture-of-experts layers.',
        watch: 'Parameter count alone does not decide quality, speed or cost.',
    },
    {
        id: 'pretraining',
        title: 'Pre-train on trillions of tokens',
        short: 'Pre-training',
        phase: 'pretrain',
        lede: 'This is the expensive part. The model reads its training data and, at every position, tries to predict the next token. Each miss produces an error signal — the loss — and backpropagation nudges every weight so the right token becomes a little more likely. Repeated trillions of times, this produces a base model.',
        goal: 'A base model that has absorbed broad patterns of language, knowledge and reasoning.',
        how: 'Next-token prediction with a cross-entropy loss, gradient descent (usually AdamW) and thousands of GPUs in parallel.',
        watch: 'Predicting text well is not the same as telling the truth; base models also reproduce errors and biases in their data.',
    },
    {
        id: 'monitoring',
        title: 'Watch the training run',
        short: 'Monitoring',
        phase: 'pretrain',
        lede: 'A frontier run lasts weeks or months on thousands of chips, so engineers watch it constantly. Is the loss still falling on text the model has never seen? Are gradients stable? Are small evaluations improving? Catching a problem early can save millions of dollars of compute.',
        goal: 'Detect instabilities and wasted compute before they become expensive.',
        how: 'Track training and held-out loss, gradient norms, learning rate, throughput and periodic evaluations; save checkpoints to roll back to.',
        watch: 'A falling training loss can hide overfitting, data contamination or skills that are not improving.',
    },
    {
        id: 'sft',
        title: 'Teach it to follow instructions',
        short: 'Fine-tuning',
        phase: 'posttrain',
        lede: 'A base model only continues text: ask it a question and it may answer with more questions. Supervised fine-tuning trains it further on example conversations, written or checked by people, so it learns to act as an assistant — answer the request, in a helpful format.',
        goal: 'An assistant that responds to instructions instead of just continuing text.',
        how: 'Keep training on prompt–response pairs, counting the loss only on the response tokens.',
        watch: 'Fine-tuning copies the style of its examples; it does not check facts or guarantee safe behaviour.',
    },
    {
        id: 'feedback',
        title: 'Shape behaviour with feedback',
        short: 'Feedback & RL',
        phase: 'posttrain',
        lede: 'Examples show a model what a good answer looks like. Feedback teaches it which of two answers is better — and, for reasoning models, rewards it for reaching answers that can be checked. Much of a modern model’s helpfulness, tone, safety behaviour and reasoning skill comes from this stage.',
        goal: 'Outputs people prefer, fewer harmful ones, and stronger step-by-step reasoning.',
        how: 'Preference learning (RLHF, DPO), AI feedback guided by written principles, and reinforcement learning with verifiable rewards.',
        watch: 'Optimising for approval can backfire: models learn to flatter, over-refuse or exploit flaws in the reward.',
    },
    {
        id: 'evaluation',
        title: 'Test before release',
        short: 'Evaluation',
        phase: 'ship',
        lede: 'Before release, the model is tested for what it can do and what it should not do: capability benchmarks, head-to-head human ratings, red-teaming for misuse and, increasingly, testing by outside organisations. The results are published in a model card or system card.',
        goal: 'Evidence about capabilities and risks, gathered under repeatable conditions.',
        how: 'Run benchmark suites, human preference tests, dangerous-capability evaluations and adversarial red-teaming.',
        watch: 'A benchmark score is a proxy. Leaked test questions, prompt tweaks and saturated tests can all mislead.',
    },
    {
        id: 'inference',
        title: 'Make it fast and affordable',
        short: 'Efficiency',
        phase: 'ship',
        lede: 'A trained model has to answer millions of requests quickly and cheaply. Engineers shrink and speed it up: storing numbers with fewer bits, caching work that would otherwise be repeated, and drafting several tokens at once.',
        goal: 'Lower memory, latency and cost per token, with as little quality loss as possible.',
        how: 'Quantization, the KV cache, batching many users together, and speculative decoding.',
        watch: 'Every shortcut is a trade-off between speed, memory, precision and sometimes quality.',
    },
    {
        id: 'deployment',
        title: 'Serve it to the world',
        short: 'Deployment',
        phase: 'ship',
        lede: 'Finally the model goes behind an app or API. Around it sits a whole system: gateways, inference servers, safety classifiers, logging and monitoring, and the ability to roll back a bad update. Launch is not the end — models are watched and updated continuously.',
        goal: 'A reliable, monitored service that real people can use safely.',
        how: 'Inference servers with batching and caching, input and output safeguards, staged rollouts, and monitoring.',
        watch: 'The model file is only one part of the product; most incidents come from the system around it.',
    },
];

export const STAGE_INDEX: Record<string, number> = Object.fromEntries(STAGES.map((s, i) => [s.id, i]));
