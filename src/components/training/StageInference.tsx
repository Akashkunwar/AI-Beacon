// Stage 9 — Make it fast and affordable.

import { useState } from 'react';
import { Block, CardGrid, Note, Sources, StatGrid, Tabs } from './TrainingKit';

const SIZES = [
    { id: '8b', label: '8B', params: 8e9, example: 'e.g. Llama 3.1 8B' },
    { id: '70b', label: '70B', params: 70e9, example: 'e.g. Llama 3.3 70B' },
    { id: '405b', label: '405B', params: 405e9, example: 'e.g. Llama 3.1 405B' },
] as const;
type SizeId = typeof SIZES[number]['id'];

const PRECISIONS = [
    { id: 'fp32', label: '32-bit', bytes: 4, note: 'Full precision. Rarely used to serve large models.' },
    { id: 'bf16', label: '16-bit', bytes: 2, note: 'The usual training and serving format; effectively no quality loss.' },
    { id: 'fp8', label: '8-bit', bytes: 1, note: 'Usually very close to 16-bit quality. Meta serves Llama 3.1 405B in FP8 on a single 8-GPU server.' },
    { id: 'int4', label: '4-bit', bytes: 0.5, note: 'Makes big models fit on small hardware; a small but measurable quality loss that varies by method and task.' },
] as const;
type PrecId = typeof PRECISIONS[number]['id'];

const HARDWARE = [
    { name: 'Laptop', gb: 16 },
    { name: 'Gaming GPU (24 GB)', gb: 24 },
    { name: 'One H100 (80 GB)', gb: 80 },
    { name: '8 × H100 server', gb: 640 },
];

// Speculative decoding walkthrough: a small draft model guesses, the big model checks.
const CONTEXT = ['The', 'cat', 'sat'];
const DRAFT = ['on', 'the', 'rug', 'and'];
const TARGET = ['on', 'the', 'mat', '.'];

export function StageInference() {
    const [size, setSize] = useState<SizeId>('70b');
    const [prec, setPrec] = useState<PrecId>('bf16');
    const [n, setN] = useState(200);
    const [spec, setSpec] = useState(0);

    const s = SIZES.find((x) => x.id === size)!;
    const p = PRECISIONS.find((x) => x.id === prec)!;
    const gb = (s.params * p.bytes) / 1e9;
    const firstReject = DRAFT.findIndex((t, i) => t !== TARGET[i]);

    return (
        <>
            <Block
                title="Try it: will it fit?"
                intro="Before a model can answer anything, its weights must fit in memory. Storing each number with fewer bits — quantization — shrinks the model dramatically."
            >
                <div className="tk-panel">
                    <div className="in-controls">
                        <div><span className="tk-label">Model size</span><Tabs label="Model size" value={size} onChange={setSize} options={SIZES.map((x) => ({ id: x.id, label: x.label }))} /></div>
                        <div><span className="tk-label">Precision</span><Tabs label="Precision" value={prec} onChange={setPrec} options={PRECISIONS.map((x) => ({ id: x.id, label: x.label }))} /></div>
                    </div>
                    <StatGrid
                        items={[
                            { label: 'Weights in memory', value: `${gb >= 100 ? Math.round(gb) : +gb.toFixed(1)} GB`, hint: `${s.label} parameters × ${p.bytes} byte${p.bytes === 1 ? '' : 's'} (${s.example})` },
                            { label: 'Smallest hardware that fits', value: HARDWARE.find((h) => h.gb >= gb * 1.2)?.name ?? 'Several servers', hint: 'leaving ~20% headroom for the KV cache and activations' },
                        ]}
                    />
                    <ul className="in-hw" aria-label="Does it fit on common hardware?">
                        {HARDWARE.map((h) => {
                            const need = gb * 1.2;
                            const fits = need <= h.gb;
                            return (
                                <li key={h.name} className={fits ? 'is-fit' : ''}>
                                    <span className="in-hw-name">{h.name}</span>
                                    <span className="in-hw-track"><span style={{ width: `${Math.min(100, (need / h.gb) * 100)}%` }} /></span>
                                    <span className="in-hw-verdict">{fits ? `Fits · ${Math.round((need / h.gb) * 100)}% full` : `Too big · needs ${Math.ceil(need / h.gb)}×`}</span>
                                </li>
                            );
                        })}
                    </ul>
                    <p className="in-note">{p.note}</p>
                </div>
            </Block>

            <Block
                title="Try it: the KV cache"
                intro="Each new token needs the keys and values of every earlier token. Without a cache the model would recompute them all at every step; with a cache it computes them once and reuses them — at the cost of memory (see Stage 3)."
            >
                <div className="tk-panel">
                    <label className="tk-range">
                        <span className="tk-label">Tokens generated</span>
                        <input type="range" min={10} max={2000} step={10} value={n} onChange={(e) => setN(+e.target.value)} aria-label="Tokens generated" />
                        <output>{n.toLocaleString()}</output>
                    </label>
                    <StatGrid
                        items={[
                            { label: 'Without a cache', value: ((n * (n + 1)) / 2).toLocaleString(), hint: 'token positions processed in total' },
                            { label: 'With a cache', value: n.toLocaleString(), hint: 'each position processed once' },
                            { label: 'Work saved', value: `${Math.round((n + 1) / 2)}×` },
                        ]}
                    />
                </div>
            </Block>

            <Block
                title="Try it: speculative decoding"
                intro="Big models are slow mainly because they produce one token per pass. A small, fast “draft” model guesses several tokens ahead; the big model checks all the guesses in a single pass, keeps the ones it agrees with, and supplies the first token it disagrees with."
            >
                <div className="tk-panel">
                    <div className="sd-rows">
                        <div className="sd-row">
                            <span className="tk-label">Draft model guesses</span>
                            <div className="sd-toks">
                                {CONTEXT.map((t) => <span key={t} className="sd-tok is-ctx">{t}</span>)}
                                {DRAFT.map((t, i) => {
                                    const state = spec === 0 ? 'is-draft' : i < firstReject ? 'is-ok' : i === firstReject ? 'is-bad' : 'is-dropped';
                                    return <span key={i} className={`sd-tok ${state}`}>{t}</span>;
                                })}
                            </div>
                        </div>
                        {spec > 0 && (
                            <div className="sd-row">
                                <span className="tk-label">Result after one big-model pass</span>
                                <div className="sd-toks">
                                    {CONTEXT.map((t) => <span key={t} className="sd-tok is-ctx">{t}</span>)}
                                    {TARGET.slice(0, firstReject + 1).map((t, i) => <span key={i} className={`sd-tok ${i < firstReject ? 'is-ok' : 'is-fix'}`}>{t}</span>)}
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="sd-actions">
                        <button type="button" className="btn btn-primary btn-sm" onClick={() => setSpec(1)} disabled={spec > 0}>Verify with the big model</button>
                        <button type="button" className="btn btn-ghost btn-sm" onClick={() => setSpec(0)} disabled={spec === 0}>Reset</button>
                    </div>
                    {spec > 0 && (
                        <p className="in-note" role="status">
                            The big model agreed with “{DRAFT.slice(0, firstReject).join(' ')}”, rejected “{DRAFT[firstReject]}” and supplied “{TARGET[firstReject]}” itself:
                            {' '}{firstReject + 1} new tokens from one expensive pass instead of {firstReject + 1} separate passes. The final text is exactly what the
                            big model would have written alone.
                        </p>
                    )}
                </div>
                <Sources items={[{ label: 'Leviathan et al. 2023, “Fast Inference from Transformers via Speculative Decoding”', url: 'https://arxiv.org/abs/2211.17192' }]} />
            </Block>

            <Block title="Serving many people at once">
                <CardGrid
                    min={220}
                    items={[
                        { title: 'Batching', body: 'GPUs are fastest when they process many requests together. Servers group users’ requests into batches.' },
                        { title: 'Continuous batching', body: 'Instead of waiting for a whole batch to finish, new requests join and finished ones leave at every step.' },
                        { title: 'PagedAttention', body: 'Stores the KV cache in small pages, like an operating system manages memory, so less is wasted. The vLLM paper reported 2–4× higher throughput.' },
                        { title: 'Distillation', body: 'Train a smaller “student” model to imitate a large “teacher”, keeping much of the quality at a fraction of the cost.' },
                    ]}
                />
                <Note>
                    These savings are a big reason prices fell so quickly: the cost of GPT-3.5-level answers dropped more than 280-fold
                    between late 2022 and late 2024, according to Stanford’s AI Index.
                </Note>
                <Sources items={[
                    { label: 'Kwon et al. 2023 (vLLM / PagedAttention)', url: 'https://arxiv.org/abs/2309.06180' },
                    { label: 'Stanford AI Index 2025', url: 'https://hai.stanford.edu/ai-index/2025-ai-index-report' },
                ]} />
            </Block>
            <style>{`
                .in-controls { display: flex; flex-wrap: wrap; gap: var(--s4); }
                .in-controls > div { display: flex; flex-direction: column; gap: 6px; }
                .in-hw { list-style: none; display: flex; flex-direction: column; gap: 8px; }
                .in-hw li { display: grid; grid-template-columns: 170px 1fr 150px; gap: var(--s3); align-items: center; font-size: var(--text-sm); color: var(--secondary); }
                .in-hw-track { height: 10px; background: var(--bg-raised); border-radius: 0 4px 4px 0; overflow: hidden; }
                .in-hw-track span { display: block; height: 100%; background: var(--danger); border-radius: 0 4px 4px 0; transition: width var(--dur-base) var(--ease-out); }
                .in-hw li.is-fit .in-hw-track span { background: var(--viz-1); }
                .in-hw-verdict { font-family: var(--font-mono); font-size: var(--text-xs); text-align: right; }
                .in-hw li.is-fit .in-hw-verdict { color: var(--ink); }
                @media (max-width: 639px) { .in-hw li { grid-template-columns: 1fr auto; } .in-hw-track { grid-column: 1 / -1; grid-row: 2; } }
                .in-note { font-size: var(--text-sm); color: var(--secondary); line-height: var(--lead-body); max-width: 80ch; }
                .sd-rows { display: flex; flex-direction: column; gap: var(--s3); }
                .sd-row { display: flex; flex-direction: column; gap: 6px; }
                .sd-toks { display: flex; flex-wrap: wrap; gap: 4px; }
                .sd-tok { padding: 4px 10px; border-radius: var(--r-sm); font-family: var(--font-mono); font-size: var(--text-sm); border: 1px solid var(--stroke-dark); background: var(--bg-panel); color: var(--ink); }
                .sd-tok.is-ctx { background: var(--bg-raised); color: var(--muted); border-color: var(--stroke); }
                .sd-tok.is-draft { border-style: dashed; }
                .sd-tok.is-ok { background: color-mix(in srgb, var(--success) 18%, transparent); border-color: var(--success); }
                .sd-tok.is-bad { text-decoration: line-through; color: var(--danger); border-color: var(--danger); }
                .sd-tok.is-dropped { opacity: 0.35; border-style: dashed; }
                .sd-tok.is-fix { background: var(--viz-1); border-color: var(--viz-1); color: var(--viz-on-fill); }
                .sd-actions { display: flex; gap: var(--s2); }
                .sd-actions .btn:disabled { opacity: 0.45; cursor: not-allowed; }
            `}</style>
        </>
    );
}
