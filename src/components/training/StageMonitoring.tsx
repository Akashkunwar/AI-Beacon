// Stage 5 — Watch the training run.

import { useMemo, useState } from 'react';
import { LineChart, type LineSeries } from '@/components/charts/LineChart';
import { Block, Note, Sources, StatGrid, Tabs } from './TrainingKit';

// A simulated run (illustrative): 100k steps with one loss spike at ~62k.
const STEPS = Array.from({ length: 201 }, (_, i) => i * 500);
const SPIKE_AT = 62_000;
const noise = (s: number, k: number) => Math.sin(s * 0.0137 * k) * 0.5 + Math.sin(s * 0.0071 * k + 1.3) * 0.5;
const baseLoss = (s: number) => 2.05 + 7 / Math.pow(1 + s / 400, 0.5);
const spike = (s: number) => (s >= SPIKE_AT && s < SPIKE_AT + 3000 ? 1.6 * Math.exp(-(s - SPIKE_AT) / 900) : 0);
const RUN = STEPS.map((s) => ({
    step: s,
    train: baseLoss(s) + noise(s, 1) * 0.03 + spike(s),
    val: s % 2000 === 0 ? baseLoss(s) + 0.05 + spike(s) * 0.6 : null,
    grad: 0.35 + 1.8 / Math.pow(1 + s / 1500, 0.8) + Math.abs(noise(s, 3)) * 0.08 + (s >= SPIKE_AT && s < SPIKE_AT + 1500 ? 2.4 * Math.exp(-(s - SPIKE_AT) / 500) : 0),
}));
const CLIP = 1.0;
const fmtK = (s: number) => `${Math.round(s / 1000)}k`;

type Failure = 'spike' | 'divergence' | 'plateau' | 'overfit';
const FAILURES: Record<Failure, { label: string; looks: string; causes: string; response: string; series: LineSeries[]; band: [number, number] }> = {
    spike: {
        label: 'Loss spike',
        looks: 'The loss jumps sharply, then usually comes back down within a few hundred steps.',
        causes: 'An unusual batch of data, numerical instability in low precision, or a learning rate that is too high for that moment.',
        response: 'Clip large gradients, and if spikes repeat, rewind to an earlier checkpoint and skip the offending batches. Google did exactly this for PaLM, skipping 200–500 batches before each spike.',
        series: [curve((x) => 2 + 6 / Math.pow(1 + x * 60, 0.5) + (x > 0.45 && x < 0.52 ? 2.2 * Math.exp(-(x - 0.45) * 60) : 0))],
        band: [0.44, 0.53],
    },
    divergence: {
        label: 'Divergence',
        looks: 'The loss starts rising and keeps rising — sometimes to NaN (not-a-number) — and does not recover.',
        causes: 'Learning rate too high, exploding attention scores, or overflow in low-precision arithmetic.',
        response: 'Stop the run, roll back to the last healthy checkpoint, and fix the cause: lower the learning rate, add stabilisers such as QK-normalisation, or change precision settings.',
        series: [curve((x) => (x < 0.4 ? 2 + 6 / Math.pow(1 + x * 60, 0.5) : 2 + 6 / Math.pow(1 + 0.4 * 60, 0.5) + Math.pow((x - 0.4) * 4, 2)))],
        band: [0.4, 1],
    },
    plateau: {
        label: 'Plateau',
        looks: 'The loss flattens far earlier and higher than expected.',
        causes: 'Learning rate decayed too early or set too low, a data-loading bug that repeats the same batches, or a model too small for the data.',
        response: 'Compare against scaling-law predictions from smaller runs; check the data pipeline and schedule. Note that slow improvement late in a run is normal — the question is whether it matches the forecast.',
        series: [curve((x) => (x < 0.3 ? 2 + 6 / Math.pow(1 + x * 60, 0.5) : 2 + 6 / Math.pow(1 + 0.3 * 60, 0.5) - (x - 0.3) * 0.05)), { ...curve((x) => 2 + 6 / Math.pow(1 + x * 60, 0.5)), id: 'expected', label: 'Expected', color: 'var(--muted)', dashed: true }],
        band: [0.3, 1],
    },
    overfit: {
        label: 'Overfitting',
        looks: 'Training loss keeps falling while validation loss turns upward.',
        causes: 'The model is memorising data it has seen several times. Rare in pre-training (text is usually seen once) but common when data is repeated or when fine-tuning on a small dataset.',
        response: 'Add more or fresher data, repeat data fewer times, stop earlier, or use regularisation.',
        series: [
            curve((x) => 2 + 6 / Math.pow(1 + x * 60, 0.5) - x * 0.6),
            { ...curve((x) => 2.1 + 6 / Math.pow(1 + x * 60, 0.5) + Math.max(0, x - 0.45) * 1.6), id: 'val', label: 'Validation loss', color: 'var(--viz-2)', dashed: true },
        ],
        band: [0.45, 1],
    },
};

function curve(fn: (x: number) => number): LineSeries {
    return { id: 'train', label: 'Training loss', color: 'var(--viz-1)', points: Array.from({ length: 121 }, (_, i) => [i / 120 * 100, fn(i / 120)] as [number, number]) };
}

export function StageMonitoring() {
    const [cut, setCut] = useState(100);
    const [failure, setFailure] = useState<Failure>('spike');
    const f = FAILURES[failure];

    const view = useMemo(() => {
        const upto = RUN.filter((r) => r.step <= cut * 1000);
        return {
            now: upto[upto.length - 1],
            loss: [
                { id: 'train', label: 'Training loss', color: 'var(--viz-1)', points: upto.map((r) => [r.step, r.train] as [number, number]) },
                { id: 'val', label: 'Validation loss', color: 'var(--viz-2)', dashed: true, points: upto.filter((r) => r.val !== null).map((r) => [r.step, r.val!] as [number, number]) },
            ],
            grad: [{ id: 'grad', label: 'Gradient norm', color: 'var(--viz-3)', points: upto.map((r) => [r.step, r.grad] as [number, number]) }],
        };
    }, [cut]);
    const inSpike = view.now.step >= SPIKE_AT && view.now.step < SPIKE_AT + 2500;
    const gap = view.now.val !== null ? view.now.val - view.now.train : 0.05;

    return (
        <>
            <Block
                title="Try it: replay a training run"
                intro="Drag through a simulated run and watch the two charts engineers stare at most. Something happens around step 62,000."
            >
                <div className="tk-panel">
                    <label className="tk-range">
                        <span className="tk-label">Training step</span>
                        <input type="range" min={2} max={100} step={1} value={cut} onChange={(e) => setCut(+e.target.value)} aria-label="Training step" />
                        <output>{fmtK(view.now.step)}</output>
                    </label>
                    <div className="tk-two">
                        <LineChart series={view.loss} height={200} yDomain={[1.5, 5]} yTicks={[2, 3, 4, 5]} yFormat={(y) => y.toFixed(1)} xLabel="Step" yLabel="Loss" xFormat={fmtK} xDomain={[0, 100000]} xTicks={[0, 25000, 50000, 75000, 100000]} ariaLabel="Training and validation loss over steps" />
                        <LineChart series={view.grad} height={200} yDomain={[0, 3]} yTicks={[0, 1, 2, 3]} yFormat={(y) => y.toFixed(1)} xLabel="Step" yLabel="Gradient norm" xFormat={fmtK} xDomain={[0, 100000]} xTicks={[0, 25000, 50000, 75000, 100000]} refLines={[{ y: CLIP, label: 'clip threshold' }]} ariaLabel="Gradient norm over steps with clipping threshold" />
                    </div>
                    <StatGrid
                        items={[
                            { label: 'Training loss', value: view.now.train.toFixed(2) },
                            { label: 'Val − train gap', value: gap.toFixed(2), hint: gap < 0.15 ? 'healthy: not memorising' : 'watch for overfitting' },
                            { label: 'Gradient norm', value: view.now.grad.toFixed(2), hint: view.now.grad > CLIP ? 'above threshold — being clipped' : 'within range' },
                            { label: 'Status', value: inSpike ? 'Loss spike' : 'Healthy', hint: inSpike ? 'Engineers check the batch and decide whether to rewind.' : 'Loss falling, gradients stable.' },
                        ]}
                    />
                    <p className="mo-cap">Simulated data for illustration. Early in training gradients are large and are clipped to a maximum size; that is normal.</p>
                </div>
            </Block>

            <Block title="Four ways a run goes wrong" aside={<Tabs label="Failure mode" value={failure} onChange={setFailure} options={(Object.keys(FAILURES) as Failure[]).map((id) => ({ id, label: FAILURES[id].label }))} />}>
                <div className="tk-panel">
                    <LineChart
                        series={f.series}
                        height={200}
                        yDomain={[1.5, 8]}
                        yTicks={[2, 4, 6, 8]}
                        yFormat={(y) => y.toFixed(0)}
                        xLabel="Progress through training"
                        yLabel="Loss"
                        xFormat={(x) => `${Math.round(x)}%`}
                        bands={[{ x0: f.band[0] * 100, x1: f.band[1] * 100, label: f.label }]}
                        ariaLabel={`Illustrative loss curve showing ${f.label}`}
                    />
                    <dl className="mo-dl">
                        <div><dt>What it looks like</dt><dd>{f.looks}</dd></div>
                        <div><dt>Common causes</dt><dd>{f.causes}</dd></div>
                        <div><dt>What teams do</dt><dd>{f.response}</dd></div>
                    </dl>
                </div>
                <Sources items={[{ label: 'Chowdhery et al. 2022 (PaLM), §5.1 on loss spikes', url: 'https://arxiv.org/abs/2204.02311' }]} />
            </Block>

            <Block title="Beyond the loss curve">
                <div className="tk-two">
                    <Note title="Checkpoints">
                        The model’s full state is saved regularly — often every few hundred steps — so a crash or a bad spike costs hours,
                        not weeks. At frontier scale, hardware failures are routine: Meta reported 466 interruptions in 54 days of Llama 3
                        pre-training.
                    </Note>
                    <Note title="Evaluations during training">
                        Teams also run quick benchmarks on intermediate checkpoints, check for test questions leaking into the training data
                        (“contamination”), and compare progress with predictions from smaller pilot runs.
                    </Note>
                </div>
            </Block>
            <style>{`
                .mo-cap { font-size: var(--text-xs); color: var(--muted); }
                .mo-dl { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 220px), 1fr)); gap: var(--s4); }
                .mo-dl dt { font-size: var(--text-2xs); font-family: var(--font-mono); text-transform: uppercase; letter-spacing: var(--tracking-wide); color: var(--muted); margin-bottom: 4px; }
                .mo-dl dd { font-size: var(--text-sm); color: var(--secondary); line-height: var(--lead-body); }
            `}</style>
        </>
    );
}
