// Side-by-side comparison of two models on every benchmark either reports.
// Uses paired bars instead of a radar chart: radar charts distort areas and
// cannot show "not reported" honestly.

import { useState } from 'react';
import { BENCHMARK_MODELS, METRICS, blendedPrice } from '@/data/benchmarkData';
import { formatContextWindow, formatDate } from '@/utils/timeline';

const sorted = [...BENCHMARK_MODELS].sort((a, b) => b.releaseDate.localeCompare(a.releaseDate));

export function ModelCompare() {
    const [aId, setA] = useState('claude-opus-4.7');
    const [bId, setB] = useState('deepseek-v4-pro');
    const a = BENCHMARK_MODELS.find((m) => m.id === aId) ?? sorted[0];
    const b = BENCHMARK_MODELS.find((m) => m.id === bId) ?? sorted[1];

    const rows = METRICS.filter((m) => a.scores[m.id] != null || b.scores[m.id] != null);
    const shared = rows.filter((m) => a.scores[m.id] != null && b.scores[m.id] != null).length;

    const picker = (value: string, onChange: (v: string) => void, label: string, color: string) => (
        <label className="mc-pick">
            <span className="field-label"><span className="chart-swatch" style={{ background: color, marginRight: 6 }} />{label}</span>
            <select className="select" value={value} onChange={(e) => onChange(e.target.value)}>
                {sorted.map((m) => <option key={m.id} value={m.id}>{m.name} — {m.provider} ({m.releaseDate.slice(0, 4)})</option>)}
            </select>
        </label>
    );

    const facts = (m: typeof a) => [
        ['Released', formatDate(m.releaseDate, 'long')],
        ['Weights', m.openWeights ? 'Open' : 'Proprietary'],
        ['Context', formatContextWindow(m.contextWindow)],
        ['Blended price', blendedPrice(m) != null ? `$${blendedPrice(m)!.toFixed(2)} / 1M` : '—'],
    ];

    return (
        <div className="card card-pad mc">
            <div className="mc-picks">
                {picker(aId, setA, 'Model A', 'var(--viz-1)')}
                {picker(bId, setB, 'Model B', 'var(--viz-2)')}
            </div>

            <div className="mc-rows" role="table" aria-label={`${a.name} versus ${b.name}`}>
                {rows.map((m) => {
                    const va = a.scores[m.id], vb = b.scores[m.id];
                    return (
                        <div key={m.id} className="mc-row" role="row">
                            <div className="mc-metric" role="rowheader">{m.name}</div>
                            <div className="mc-bars" role="cell">
                                <Bar value={va} color="var(--viz-1)" name={a.name} />
                                <Bar value={vb} color="var(--viz-2)" name={b.name} />
                            </div>
                        </div>
                    );
                })}
                {rows.length === 0 && <p className="muted">Neither model reports these benchmarks.</p>}
            </div>
            {rows.length > 0 && shared < rows.length && (
                <p className="mc-note">Only {shared} of {rows.length} benchmarks were reported by both models — compare those rows; a missing bar is not a zero.</p>
            )}

            <div className="mc-facts">
                {[a, b].map((m, i) => (
                    <dl key={m.id}>
                        <dt className="mc-facts-title"><span className="chart-swatch" style={{ background: i ? 'var(--viz-2)' : 'var(--viz-1)' }} /> {m.name}</dt>
                        {facts(m).map(([k, v]) => (
                            <div key={k} className="mc-fact"><dt>{k}</dt><dd>{v}</dd></div>
                        ))}
                        <dd className="mc-src"><a className="text-link" href={m.source.url} target="_blank" rel="noopener noreferrer">Source: {m.source.label} ↗</a></dd>
                    </dl>
                ))}
            </div>
            <style>{`
                .mc { display: flex; flex-direction: column; gap: var(--s5); }
                .mc-picks { display: grid; grid-template-columns: 1fr 1fr; gap: var(--s4); }
                .mc-pick { display: flex; flex-direction: column; }
                .mc-pick .field-label { display: flex; align-items: center; }
                .chart-swatch { width: 10px; height: 10px; border-radius: 50%; display: inline-block; }
                .mc-rows { display: flex; flex-direction: column; gap: var(--s4); }
                .mc-row { display: grid; grid-template-columns: 180px 1fr; gap: var(--s4); align-items: center; }
                .mc-metric { font-size: var(--text-sm); color: var(--ink); font-weight: var(--weight-medium); }
                .mc-bars { display: flex; flex-direction: column; gap: 4px; }
                .mc-bar-row { display: flex; align-items: center; gap: var(--s2); }
                .mc-track { flex: 1; height: 10px; background: var(--bg-raised); border-radius: 0 4px 4px 0; overflow: hidden; }
                .mc-fill { height: 100%; border-radius: 0 4px 4px 0; transition: width var(--dur-slow) var(--ease-out); }
                .mc-val { font-family: var(--font-mono); font-size: var(--text-xs); min-width: 7.5em; text-align: right; color: var(--ink); font-variant-numeric: tabular-nums; }
                .mc-val.is-missing { color: var(--muted); }
                .mc-note { font-size: var(--text-xs); color: var(--muted); }
                .mc-facts { display: grid; grid-template-columns: 1fr 1fr; gap: var(--s5); padding-top: var(--s4); border-top: 1px solid var(--stroke); }
                .mc-facts-title { display: flex; align-items: center; gap: 6px; font-weight: var(--weight-semibold); color: var(--ink); margin-bottom: var(--s2); }
                .mc-fact { display: flex; justify-content: space-between; gap: var(--s3); padding: 5px 0; border-bottom: 1px solid var(--stroke); font-size: var(--text-xs); }
                .mc-fact dt { color: var(--muted); }
                .mc-fact dd { color: var(--ink); text-align: right; }
                .mc-src { margin-top: var(--s2); font-size: var(--text-xs); }
                @media (max-width: 639px) {
                    .mc-picks, .mc-facts { grid-template-columns: 1fr; }
                    .mc-row { grid-template-columns: 1fr; gap: 6px; }
                }
            `}</style>
        </div>
    );
}

function Bar({ value, color, name }: { value: number | undefined; color: string; name: string }) {
    return (
        <div className="mc-bar-row" title={name}>
            <div className="mc-track" aria-hidden="true">
                {value != null && <div className="mc-fill" style={{ width: `${value}%`, background: color }} />}
            </div>
            <span className={`mc-val ${value == null ? 'is-missing' : ''}`}>
                <span className="sr-only">{name}: </span>{value != null ? `${value.toFixed(1)}%` : 'not reported'}
            </span>
        </div>
    );
}
