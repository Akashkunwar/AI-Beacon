// Stage 4 — Pre-train on trillions of tokens.

import { useMemo, useState } from 'react';
import { LineChart } from '@/components/charts/LineChart';
import { Block, CardGrid, Note, Sources, StatGrid, Steps, fmtBig, sci } from './TrainingKit';

// ── Illustrative loss curve ───────────────────────────────────────────────
// A random model's loss starts at ln(vocabulary size): a uniform guess over
// 128K tokens gives ln(128,256) ≈ 11.8. The shape (fast drop, then a long,
// slow power-law decline) is typical; the exact numbers are illustrative.
const START_LOSS = Math.log(128256);
const lossAt = (x: number) => 1.9 + (START_LOSS - 1.9) / Math.pow(1 + x * 400, 0.55);
const wobble = (x: number) => Math.sin(x * 211) * 0.025 + Math.sin(x * 977) * 0.015;
const WARMUP = 0.01;
const lrAt = (x: number) => (x < WARMUP ? x / WARMUP : 0.1 + 0.9 * 0.5 * (1 + Math.cos(Math.PI * (x - WARMUP) / (1 - WARMUP))));

// ── Scaling-law references (compute ≈ 6 × parameters × tokens) ───────────
const REFS = [
    { name: 'GPT-3 (2020)', params: 175e9, tokens: 300e9, note: 'under-trained by Chinchilla’s rule' },
    { name: 'Chinchilla (2022)', params: 70e9, tokens: 1.4e12, note: '≈20 tokens per parameter' },
    { name: 'Llama 3 8B (2024)', params: 8e9, tokens: 15e12, note: '≈1,900 tokens per parameter' },
    { name: 'Llama 3.1 405B (2024)', params: 405e9, tokens: 15.6e12, note: '≈39 tokens per parameter' },
];
const H100_EFFECTIVE_FLOPS = 400e12; // ~40% of the H100's ~989 TFLOP/s dense BF16 peak

const wallClock = (hours: number) => {
    if (hours < 1) return 'under an hour';
    if (hours < 48) return `${Math.round(hours)} hour${Math.round(hours) === 1 ? '' : 's'}`;
    const days = Math.round(hours / 24);
    return days < 730 ? `${days.toLocaleString()} days` : `${+(days / 365).toFixed(1)} years`;
};

export function StagePretraining() {
    const [p, setP] = useState(0.25);
    const [logC, setLogC] = useState(23);

    const curve = useMemo(() => {
        const pts = Array.from({ length: 241 }, (_, i) => i / 240);
        return {
            train: pts.map((x) => [x * 100, lossAt(x) + (x > 0.004 ? wobble(x) : 0)] as [number, number]),
            val: pts.map((x) => [x * 100, lossAt(x) + 0.04] as [number, number]),
            lr: pts.map((x) => [x * 100, lrAt(x)] as [number, number]),
        };
    }, []);

    const C = 10 ** logC;
    const N = Math.sqrt(C / 120); // C = 6·N·D with D = 20·N
    const D = 20 * N;
    const gpuHours = C / H100_EFFECTIVE_FLOPS / 3600;

    return (
        <>
            <Block title="One training step, repeated millions of times">
                <Steps
                    items={[
                        { title: 'Take a batch', text: 'Grab a few million tokens of text from the dataset.' },
                        { title: 'Predict', text: 'At every position, the model outputs probabilities for the next token.' },
                        { title: 'Score', text: 'The loss is high when the real next token got low probability.' },
                        { title: 'Assign blame', text: 'Backpropagation works out how each weight contributed to the error.' },
                        { title: 'Adjust', text: 'An optimiser (usually AdamW) nudges every weight a tiny step to reduce the loss.' },
                    ]}
                />
            </Block>

            <Block
                title="Try it: what the loss measures"
                intro="For each position, the loss is −log(probability the model gave the correct next token). Confident and right costs almost nothing; confident and wrong costs a lot."
            >
                <div className="tk-panel">
                    <p className="pt-sent">The cat sat on the <span className="pt-blank">mat</span></p>
                    <label className="tk-range">
                        <span className="tk-label">Probability given to “mat”</span>
                        <input type="range" min={0.01} max={0.99} step={0.01} value={p} onChange={(e) => setP(+e.target.value)} aria-label="Probability of the correct token" />
                        <output>{Math.round(p * 100)}%</output>
                    </label>
                    <StatGrid
                        items={[
                            { label: 'Loss for this token', value: (-Math.log(p)).toFixed(2), hint: '−ln(p). Training minimises the average over trillions of tokens.' },
                            { label: 'As if choosing between', value: `${(1 / p).toFixed(1)} options`, hint: 'Perplexity = 1 / p: how “surprised” the model is.' },
                        ]}
                    />
                </div>
            </Block>

            <Block
                title="What a training run looks like"
                intro="The loss falls fast at first — the model learns common words and grammar — then keeps creeping down for the rest of the run as it picks up rarer facts and skills. Validation loss, measured on held-out text, tracks it closely because the model rarely sees the same text twice."
            >
                <div className="tk-panel">
                    <LineChart
                        series={[
                            { id: 'train', label: 'Training loss', color: 'var(--viz-1)', points: curve.train },
                            { id: 'val', label: 'Validation loss', color: 'var(--viz-2)', points: curve.val, dashed: true },
                        ]}
                        yDomain={[0, 12]}
                        yTicks={[0, 2, 4, 6, 8, 10, 12]}
                        xLabel="Progress through training (% of tokens)"
                        yLabel="Loss"
                        xFormat={(x) => `${Math.round(x)}%`}
                        yFormat={(y) => y.toFixed(1)}
                        notes={[{ x: 0, y: START_LOSS, label: `Starts at ln(128K) ≈ ${START_LOSS.toFixed(1)}: a random guess` }]}
                        ariaLabel="Illustrative training and validation loss falling steeply, then slowly"
                    />
                    <p className="tk-label">Learning rate schedule</p>
                    <LineChart
                        series={[{ id: 'lr', label: 'Learning rate', color: 'var(--viz-3)', points: curve.lr }]}
                        height={130}
                        yDomain={[0, 1.05]}
                        yTicks={[0, 0.5, 1]}
                        xLabel="Progress through training (% of tokens)"
                        xFormat={(x) => `${Math.round(x)}%`}
                        yFormat={(y) => `${Math.round(y * 100)}%`}
                        ariaLabel="Learning rate warms up briefly, then decays along a cosine curve"
                    />
                    <p className="pt-cap">
                        Illustrative shape, not a specific model. The learning rate warms up over the first ~1% of steps (big early steps
                        can destabilise training), then decays so the model can settle into a good solution.
                    </p>
                </div>
            </Block>

            <Block
                title="Try it: how big for a given budget?"
                intro="Scaling laws predict loss from model size and data. DeepMind’s Chinchilla study (2022) found that for a fixed compute budget, parameters and training tokens should grow together — about 20 tokens per parameter."
            >
                <div className="tk-panel">
                    <label className="tk-range">
                        <span className="tk-label">Compute budget</span>
                        <input type="range" min={20} max={26} step={0.1} value={logC} onChange={(e) => setLogC(+e.target.value)} aria-label="Compute budget, log scale" />
                        <output>{sci(C)} FLOP</output>
                    </label>
                    <StatGrid
                        items={[
                            { label: 'Compute-optimal size', value: `${fmtBig(N)} parameters` },
                            { label: 'Training tokens', value: fmtBig(D) },
                            { label: 'H100 GPU-hours', value: fmtBig(gpuHours), hint: 'at ~40% of peak speed; real runs need more for restarts and experiments' },
                            { label: 'With 16,000 H100s', value: wallClock(gpuHours / 16000) },
                        ]}
                    />
                    <div className="table-wrap">
                        <table className="data-table">
                            <thead><tr><th scope="col">Model</th><th scope="col" className="num">Parameters</th><th scope="col" className="num">Tokens</th><th scope="col" className="num">Compute</th><th scope="col">Relative to Chinchilla</th></tr></thead>
                            <tbody>
                                {REFS.map((r) => (
                                    <tr key={r.name}>
                                        <td className="strong">{r.name}</td>
                                        <td className="num">{fmtBig(r.params)}</td>
                                        <td className="num">{fmtBig(r.tokens)}</td>
                                        <td className="num">{sci(6 * r.params * r.tokens)}</td>
                                        <td>{r.note}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
                <Note>
                    Since 2023, labs deliberately train <strong>past</strong> the Chinchilla point. A smaller model trained on more data
                    costs more to train but is cheaper and faster to run for millions of users — Llama 3 8B saw 15 trillion tokens,
                    nearly 100 times Chinchilla’s ratio.
                </Note>
                <Sources items={[
                    { label: 'Hoffmann et al. 2022 (Chinchilla)', url: 'https://arxiv.org/abs/2203.15556' },
                    { label: 'Brown et al. 2020 (GPT-3)', url: 'https://arxiv.org/abs/2005.14165' },
                    { label: 'Llama 3 Herd of Models', url: 'https://arxiv.org/abs/2407.21783' },
                ]} />
            </Block>

            <Block title="What it takes at the frontier" intro="Meta published unusual detail about its largest Llama 3.1 run:">
                <StatGrid
                    items={[
                        { label: 'Parameters', value: '405B' },
                        { label: 'Training tokens', value: '15.6T' },
                        { label: 'Compute', value: '3.8 × 10²⁵ FLOP' },
                        { label: 'GPUs', value: '16,000 H100' },
                    ]}
                />
                <p className="pt-cap">The team reported 466 job interruptions during a 54-day stretch of pre-training — most caused by hardware faults — which is why frequent checkpoints matter (Stage 5).</p>
                <Sources items={[{ label: 'Llama 3 Herd of Models, §3.3', url: 'https://arxiv.org/abs/2407.21783' }]} />
            </Block>

            <Block title="Engineering that makes it possible" intro="No single GPU can hold a frontier model, let alone train it. These techniques split and shrink the work.">
                <CardGrid
                    min={220}
                    items={[
                        { title: 'Data, tensor & pipeline parallelism', body: 'Split the batch across GPUs, split each layer’s matrices across GPUs, and split the stack of layers into stages.' },
                        { title: 'Sharded optimiser state (ZeRO / FSDP)', body: 'Spread weights, gradients and optimiser statistics across workers instead of copying them to every GPU.' },
                        { title: 'Mixed precision', body: 'Do most maths in 16-bit (BF16) or even 8-bit (FP8) formats, keeping a higher-precision copy where stability needs it.' },
                        { title: 'FlashAttention', body: 'Compute exact attention in tiles that fit in fast on-chip memory, avoiding the full n × n matrix.' },
                        { title: 'Activation checkpointing', body: 'Save only some intermediate results and recompute the rest during backpropagation, trading compute for memory.' },
                    ]}
                />
            </Block>
            <style>{`
                .pt-sent { font-size: var(--text-lg); color: var(--ink); }
                .pt-blank { display: inline-block; padding: 0 10px; border-radius: var(--r-sm); background: var(--viz-1); color: var(--viz-on-fill); font-weight: var(--weight-medium); }
                .pt-cap { font-size: var(--text-xs); color: var(--muted); max-width: 80ch; }
            `}</style>
        </>
    );
}
