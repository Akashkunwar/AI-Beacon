// Stage 3 — Design the network.

import { useMemo, useState } from 'react';
import { Block, CardGrid, Note, Sources, StatGrid } from './TrainingKit';
import { fmtBig, sci } from './format';

interface Arch {
    layers: number;
    dModel: number;
    heads: number;
    kvHeads: number;
    ffn: 'gelu' | 'swiglu';
    dFF: number;
    vocab: number;
    context: number;
    tied: boolean;       // input and output embeddings share weights
    learnedPos: boolean; // learned position table (GPT-2) vs RoPE
}

// Published configurations.
const PRESETS: Record<string, { label: string; arch: Arch; published: string }> = {
    gpt2: { label: 'GPT-2 small', published: '124M', arch: { layers: 12, dModel: 768, heads: 12, kvHeads: 12, ffn: 'gelu', dFF: 3072, vocab: 50257, context: 1024, tied: true, learnedPos: true } },
    llama8b: { label: 'Llama 3.1 8B', published: '8B', arch: { layers: 32, dModel: 4096, heads: 32, kvHeads: 8, ffn: 'swiglu', dFF: 14336, vocab: 128256, context: 131072, tied: false, learnedPos: false } },
    llama70b: { label: 'Llama 3.1 70B', published: '70B', arch: { layers: 80, dModel: 8192, heads: 64, kvHeads: 8, ffn: 'swiglu', dFF: 28672, vocab: 128256, context: 131072, tied: false, learnedPos: false } },
    llama405b: { label: 'Llama 3.1 405B', published: '405B', arch: { layers: 126, dModel: 16384, heads: 128, kvHeads: 8, ffn: 'swiglu', dFF: 53248, vocab: 128256, context: 131072, tied: false, learnedPos: false } },
};

const D_MODELS = [512, 768, 1024, 2048, 4096, 8192, 16384];
const CONTEXTS = [1024, 8192, 32768, 131072];
const VOCABS = [32000, 50257, 128256, 200000];
const TOKEN_PLANS = [
    { id: 'chinchilla', label: '20 per parameter (Chinchilla)' },
    { id: '1t', label: '1 trillion' },
    { id: '15t', label: '15 trillion (Llama 3)' },
] as const;
type TokenPlan = typeof TOKEN_PLANS[number]['id'];

// Assumed effective throughput per H100 GPU: ~40% of its ~989 TFLOP/s dense BF16 peak.
const H100_EFFECTIVE_FLOPS = 400e12;

function compute(a: Arch) {
    const dHead = a.dModel / a.heads;
    const embed = a.vocab * a.dModel * (a.tied ? 1 : 2) + (a.learnedPos ? a.context * a.dModel : 0);
    const attnPerLayer = 2 * a.dModel * a.dModel + 2 * a.dModel * a.kvHeads * dHead;
    const ffnPerLayer = (a.ffn === 'swiglu' ? 3 : 2) * a.dModel * a.dFF;
    const normPerLayer = 2 * a.dModel;
    const attn = a.layers * attnPerLayer;
    const ffn = a.layers * ffnPerLayer;
    const total = embed + attn + ffn + a.layers * normPerLayer;
    const kvBytesPerToken = 2 * a.layers * a.kvHeads * dHead * 2; // K and V, BF16
    return { dHead, embed, attn, ffn, total, kvBytesPerToken, kvAtContext: kvBytesPerToken * a.context };
}

const fmtBytes = (b: number) => (b >= 2 ** 30 ? `${+(b / 2 ** 30).toFixed(1)} GB` : b >= 2 ** 20 ? `${+(b / 2 ** 20).toFixed(1)} MB` : `${Math.round(b / 1024)} KB`);
const fmtCtx = (c: number) => (c >= 1024 ? `${Math.round(c / 1024)}K` : `${c}`);

export function StageArchitecture() {
    const [presetId, setPresetId] = useState<string>('llama8b');
    const [arch, setArch] = useState<Arch>(PRESETS.llama8b.arch);
    const [plan, setPlan] = useState<TokenPlan>('chinchilla');
    const r = useMemo(() => compute(arch), [arch]);

    const set = (patch: Partial<Arch>) => {
        setPresetId('custom');
        setArch((a) => {
            const n = { ...a, ...patch };
            if (patch.dModel || patch.ffn) n.dFF = n.ffn === 'swiglu' ? Math.round((n.dModel * 3.5) / 256) * 256 : n.dModel * 4;
            if (patch.dModel) { n.heads = Math.max(1, n.dModel / 128); n.kvHeads = a.kvHeads === a.heads ? n.heads : Math.min(a.kvHeads, n.heads); }
            n.learnedPos = false;
            n.tied = false;
            return n;
        });
    };
    const attnMode = arch.kvHeads === arch.heads ? 'mha' : arch.kvHeads === 1 ? 'mqa' : 'gqa';
    const tokens = plan === 'chinchilla' ? 20 * r.total : plan === '1t' ? 1e12 : 15e12;
    const flops = 6 * r.total * tokens;
    const gpuHours = flops / H100_EFFECTIVE_FLOPS / 3600;
    const shares = [
        { name: 'Embeddings', v: r.embed, color: 'var(--viz-1)' },
        { name: 'Attention', v: r.attn, color: 'var(--viz-2)' },
        { name: 'Feed-forward', v: r.ffn, color: 'var(--viz-3)' },
    ];

    return (
        <>
            <Block
                title="Try it: size a transformer"
                intro="Pick a published model or change the dials. The numbers are computed from the configuration, the same way the labs report them."
            >
                <div className="ar-presets" role="group" aria-label="Published models">
                    {Object.entries(PRESETS).map(([id, p]) => (
                        <button key={id} type="button" className="pill" aria-pressed={presetId === id} onClick={() => { setPresetId(id); setArch(p.arch); }}>
                            {p.label}
                        </button>
                    ))}
                    <span className="pill" aria-pressed={presetId === 'custom'} style={{ pointerEvents: 'none' }}>Custom</span>
                </div>
                <div className="tk-two">
                    <div className="tk-panel ar-controls">
                        <label className="ar-field">
                            <span className="ar-label">Layers <span className="tk-mono">{arch.layers}</span></span>
                            <input type="range" min={2} max={128} value={arch.layers} onChange={(e) => set({ layers: +e.target.value })} aria-label="Number of layers" />
                        </label>
                        <label className="ar-field">
                            <span className="ar-label">Width (numbers per token)</span>
                            <select className="select" value={arch.dModel} onChange={(e) => set({ dModel: +e.target.value })}>
                                {D_MODELS.map((d) => <option key={d} value={d}>{d.toLocaleString()}</option>)}
                            </select>
                        </label>
                        <div className="ar-field">
                            <span className="ar-label">Attention layout <span className="tk-mono">{arch.heads} query heads</span></span>
                            <div className="segmented" role="radiogroup" aria-label="Attention layout">
                                <button type="button" role="radio" aria-checked={attnMode === 'mha'} onClick={() => set({ kvHeads: arch.heads })}>MHA</button>
                                <button type="button" role="radio" aria-checked={attnMode === 'gqa'} onClick={() => set({ kvHeads: Math.min(8, arch.heads) })}>GQA · 8 KV</button>
                                <button type="button" role="radio" aria-checked={attnMode === 'mqa'} onClick={() => set({ kvHeads: 1 })}>MQA</button>
                            </div>
                        </div>
                        <div className="ar-field">
                            <span className="ar-label">Feed-forward <span className="tk-mono">{arch.dFF.toLocaleString()} wide</span></span>
                            <div className="segmented" role="radiogroup" aria-label="Feed-forward type">
                                <button type="button" role="radio" aria-checked={arch.ffn === 'gelu'} onClick={() => set({ ffn: 'gelu' })}>GELU</button>
                                <button type="button" role="radio" aria-checked={arch.ffn === 'swiglu'} onClick={() => set({ ffn: 'swiglu' })}>SwiGLU</button>
                            </div>
                        </div>
                        <div className="tk-two ar-pair">
                            <label className="ar-field">
                                <span className="ar-label">Vocabulary</span>
                                <select className="select" value={arch.vocab} onChange={(e) => set({ vocab: +e.target.value })}>
                                    {VOCABS.map((v) => <option key={v} value={v}>{v.toLocaleString()}</option>)}
                                </select>
                            </label>
                            <label className="ar-field">
                                <span className="ar-label">Context window</span>
                                <select className="select" value={arch.context} onChange={(e) => set({ context: +e.target.value })}>
                                    {CONTEXTS.map((c) => <option key={c} value={c}>{fmtCtx(c)} tokens</option>)}
                                </select>
                            </label>
                        </div>
                    </div>

                    <div className="tk-panel">
                        <div className="ar-total">
                            <span className="tk-label">Parameters</span>
                            <span className="ar-total-num">{fmtBig(r.total)}</span>
                            {presetId !== 'custom' && <span className="ar-total-note">Published size: {PRESETS[presetId].published}</span>}
                        </div>
                        <div className="ar-share" role="img" aria-label={shares.map((s) => `${s.name} ${Math.round((s.v / r.total) * 100)}%`).join(', ')}>
                            {shares.map((s) => <span key={s.name} style={{ flexGrow: s.v, background: s.color }} />)}
                        </div>
                        <div className="tk-legend">
                            {shares.map((s) => <span key={s.name}><i style={{ background: s.color }} />{s.name} {Math.round((s.v / r.total) * 100)}%</span>)}
                        </div>
                        <StatGrid
                            items={[
                                { label: 'KV cache / token', value: fmtBytes(r.kvBytesPerToken), hint: 'memory to remember one token while generating (BF16)' },
                                { label: `KV cache @ ${fmtCtx(arch.context)}`, value: fmtBytes(r.kvAtContext), hint: 'for one full-length conversation' },
                            ]}
                        />
                        <div className="ar-plan">
                            <label className="ar-field">
                                <span className="ar-label">Training tokens</span>
                                <select className="select" value={plan} onChange={(e) => setPlan(e.target.value as TokenPlan)}>
                                    {TOKEN_PLANS.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
                                </select>
                            </label>
                            <StatGrid
                                items={[
                                    { label: 'Training compute', value: `${sci(flops)} FLOP`, hint: `≈ 6 × parameters × ${fmtBig(tokens)} tokens` },
                                    { label: 'H100 GPU-hours', value: fmtBig(gpuHours), hint: 'idealised: ~40% of peak speed, no failures or restarts' },
                                ]}
                            />
                        </div>
                    </div>
                </div>
                <Note>
                    Most parameters sit in the feed-forward layers, while the KV cache — not the parameters — often limits how many users
                    and how long a conversation a server can handle. That is why modern models use grouped-query attention: Llama 3.1 8B’s
                    cache is a quarter of what full multi-head attention would need.
                </Note>
                <Sources items={[
                    { label: 'Llama 3 Herd of Models (configs)', url: 'https://arxiv.org/abs/2407.21783' },
                    { label: 'Kaplan et al. 2020 (6·N·D compute rule)', url: 'https://arxiv.org/abs/2001.08361' },
                ]} />
            </Block>

            <Block title="Three ways to organise attention" intro="Every query head needs keys and values to compare against. Sharing them between heads shrinks the KV cache with little loss in quality.">
                <div className="ar-attn">
                    {([['MHA', 'Multi-head attention', 8, 'Each of the 8 query heads has its own keys and values. Original Transformer, GPT-2, GPT-3.'], ['GQA', 'Grouped-query attention', 2, 'Groups of query heads share one key/value head. Llama 2 70B, Llama 3, Mistral.'], ['MQA', 'Multi-query attention', 1, 'All query heads share a single key/value head. PaLM. Smallest cache, some quality risk.']] as const).map(([id, name, kv, text]) => (
                        <figure key={id} className="tk-panel ar-attn-card">
                            <AttnDiagram kv={kv} />
                            <figcaption>
                                <p className="ar-attn-name">{id} · {name}</p>
                                <p className="ar-attn-text">{text}</p>
                                <div className="ar-attn-bar"><span style={{ width: `${(kv / 8) * 100}%` }} /></div>
                                <p className="ar-attn-kv">KV cache: {Math.round((kv / 8) * 1000) / 10}% of MHA</p>
                            </figcaption>
                        </figure>
                    ))}
                </div>
            </Block>

            <Block
                title="Dense or mixture-of-experts?"
                intro="In a dense model every parameter is used for every token. A mixture-of-experts (MoE) model has many feed-forward “experts” per layer and a router that sends each token to only a few — so it can store far more knowledge for the same compute per token. Many of the largest open models since 2024 are MoE."
            >
                <CardGrid
                    min={200}
                    items={[
                        { tag: '2023', title: 'Mixtral 8x7B', meta: '46.7B total · 12.9B active', body: 'Two of eight experts per token.' },
                        { tag: '2024', title: 'DeepSeek-V3', meta: '671B total · 37B active', body: 'Uses multi-head latent attention (from DeepSeek-V2), which compresses the KV cache.' },
                        { tag: '2025', title: 'Kimi K2', meta: '≈1T total · 32B active', body: 'Open-weights model from Moonshot AI.' },
                        { tag: '2025', title: 'gpt-oss-120b', meta: '117B total · 5.1B active', body: 'OpenAI’s open-weights model; runs on a single 80 GB GPU.' },
                    ]}
                />
            </Block>

            <Block title="How the recipe evolved" intro="The core transformer has barely changed since 2017; the details have.">
                <div className="table-wrap">
                    <table className="data-table">
                        <thead>
                            <tr><th scope="col">Year</th><th scope="col">Model</th><th scope="col">Normalisation</th><th scope="col">Attention</th><th scope="col">Positions</th><th scope="col">Feed-forward</th><th scope="col">Notable</th></tr>
                        </thead>
                        <tbody>
                            {EVOLUTION.map((r) => (
                                <tr key={r.model}>
                                    <td className="tk-mono">{r.year}</td><td className="strong">{r.model}</td><td>{r.norm}</td><td>{r.attn}</td><td>{r.pos}</td><td>{r.act}</td><td>{r.note}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Block>
            <style>{`
                .ar-presets { display: flex; flex-wrap: wrap; gap: 6px; }
                .ar-controls { gap: var(--s4); }
                .ar-field { display: flex; flex-direction: column; gap: 6px; min-width: 0; }
                .ar-field input[type="range"] { accent-color: var(--ink); }
                .ar-field .segmented { display: flex; }
                .ar-field .segmented > button { flex: 1; }
                .ar-label { display: flex; justify-content: space-between; font-size: var(--text-sm); color: var(--ink); font-weight: var(--weight-medium); }
                .ar-label .tk-mono { font-size: var(--text-xs); color: var(--secondary); font-weight: 400; }
                .ar-pair { gap: var(--s3); }
                .ar-total { display: flex; flex-direction: column; gap: 2px; }
                .ar-total-num { font-size: var(--text-3xl); font-weight: var(--weight-semibold); letter-spacing: var(--tracking-tight); color: var(--ink); line-height: 1; }
                .ar-total-note { font-size: var(--text-xs); color: var(--muted); }
                .ar-share { display: flex; gap: 2px; height: 12px; border-radius: 4px; overflow: hidden; }
                .ar-share span { min-width: 2px; }
                .ar-plan { display: flex; flex-direction: column; gap: var(--s3); padding-top: var(--s3); border-top: 1px solid var(--stroke); }
                .ar-attn { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 240px), 1fr)); gap: var(--s3); }
                .ar-attn-card { margin: 0; }
                .ar-attn-name { font-size: var(--text-sm); font-weight: var(--weight-semibold); color: var(--ink); }
                .ar-attn-text { font-size: var(--text-xs); color: var(--secondary); line-height: var(--lead-body); margin-top: 4px; }
                .ar-attn-bar { height: 6px; background: var(--bg-raised); border-radius: 0 3px 3px 0; margin-top: var(--s3); }
                .ar-attn-bar span { display: block; height: 100%; background: var(--viz-1); border-radius: 0 3px 3px 0; }
                .ar-attn-kv { font-size: var(--text-2xs); color: var(--muted); font-family: var(--font-mono); margin-top: 4px; }
            `}</style>
        </>
    );
}

const EVOLUTION = [
    { year: '2017', model: 'Transformer', norm: 'LayerNorm, after each block', attn: 'Multi-head', pos: 'Sinusoidal', act: 'ReLU', note: 'Encoder–decoder, for translation' },
    { year: '2019', model: 'GPT-2', norm: 'LayerNorm, before each block', attn: 'Multi-head', pos: 'Learned table', act: 'GELU', note: 'Decoder-only, 1.5B' },
    { year: '2020', model: 'GPT-3', norm: 'LayerNorm, before', attn: 'Multi-head (some sparse layers)', pos: 'Learned table', act: 'GELU', note: '175B parameters' },
    { year: '2022', model: 'PaLM', norm: 'LayerNorm, before', attn: 'Multi-query', pos: 'RoPE', act: 'SwiGLU', note: 'Parallel attention + FFN, 540B' },
    { year: '2023', model: 'LLaMA', norm: 'RMSNorm, before', attn: 'Multi-head', pos: 'RoPE', act: 'SwiGLU', note: 'Became the open-model template' },
    { year: '2023', model: 'Mistral 7B', norm: 'RMSNorm, before', attn: 'Grouped-query + sliding window', pos: 'RoPE', act: 'SwiGLU', note: '' },
    { year: '2024', model: 'Llama 3', norm: 'RMSNorm, before', attn: 'Grouped-query', pos: 'RoPE', act: 'SwiGLU', note: '128K vocabulary and context' },
    { year: '2024', model: 'DeepSeek-V3', norm: 'RMSNorm, before', attn: 'Multi-head latent', pos: 'RoPE', act: 'SwiGLU', note: 'Mixture-of-experts, 671B total' },
];

/** 8 query heads (top) connected to `kv` key/value heads (bottom). */
function AttnDiagram({ kv }: { kv: number }) {
    const W = 240, qY = 16, kY = 76;
    const span = W - 64; // leave room on the right for the Q and K/V labels
    const qx = (i: number) => 16 + (i * span) / 7;
    const kx = (j: number) => (kv === 1 ? 16 + span / 2 : 16 + (j * span) / Math.max(kv - 1, 1));
    const group = 8 / kv;
    return (
        <svg viewBox={`0 0 ${W} 96`} width="100%" role="img" aria-label={`8 query heads sharing ${kv} key/value head${kv > 1 ? 's' : ''}`}>
            {Array.from({ length: 8 }, (_, i) => {
                const j = kv === 8 ? i : Math.floor(i / group);
                return <line key={`l${i}`} x1={qx(i)} y1={qY + 6} x2={kx(j)} y2={kY - 6} stroke="var(--stroke-dark)" strokeWidth={1.5} />;
            })}
            {Array.from({ length: 8 }, (_, i) => <circle key={`q${i}`} cx={qx(i)} cy={qY} r={6} fill="var(--viz-1)" />)}
            {Array.from({ length: kv }, (_, j) => <rect key={`k${j}`} x={kx(j) - 7} y={kY - 6} width={14} height={12} rx={3} fill="var(--viz-2)" />)}
            <text x={W - 2} y={qY + 4} textAnchor="end" fontSize="9" fill="var(--muted)" fontFamily="var(--font-mono)">Q</text>
            <text x={W - 2} y={kY + 4} textAnchor="end" fontSize="9" fill="var(--muted)" fontFamily="var(--font-mono)">K/V</text>
        </svg>
    );
}
