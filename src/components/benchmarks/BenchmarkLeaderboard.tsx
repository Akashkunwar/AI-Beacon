import { useMemo } from 'react';
import { BENCHMARK_MODELS, METRICS, METRIC_BY_ID, type MetricId } from '@/data/benchmarkData';
import { formatContextWindow, formatDate } from '@/utils/timeline';

interface Props {
    metric: MetricId;
    openOnly: boolean;
}

function price(p: { input: number; output: number } | null) {
    if (!p) return '—';
    const f = (n: number) => (n < 1 ? `$${n.toFixed(2)}` : `$${n % 1 ? n.toFixed(2) : n}`);
    return `${f(p.input)} / ${f(p.output)}`;
}

export function BenchmarkLeaderboard({ metric, openOnly }: Props) {
    const m = METRIC_BY_ID[metric];
    const { ranked, missing } = useMemo(() => {
        const pool = BENCHMARK_MODELS.filter((x) => !openOnly || x.openWeights);
        const ranked = pool
            .filter((x) => x.scores[metric] != null)
            .sort((a, b) => (b.scores[metric]! - a.scores[metric]!) || b.releaseDate.localeCompare(a.releaseDate));
        return { ranked, missing: pool.length - ranked.length };
    }, [metric, openOnly]);

    // Competition ranking: ties share a rank.
    const ranks: number[] = [];
    ranked.forEach((x, i) => {
        ranks.push(i > 0 && x.scores[metric] === ranked[i - 1].scores[metric] ? ranks[i - 1] : i + 1);
    });
    const others = METRICS.filter((x) => x.id !== metric);

    return (
        <div>
            <div className="table-wrap">
                <table className="data-table bl-table">
                    <caption className="sr-only">{m.name} scores, highest first</caption>
                    <thead>
                        <tr>
                            <th scope="col" className="num" style={{ width: 44 }}>#</th>
                            <th scope="col">Model</th>
                            <th scope="col" className="bl-hide-sm">Released</th>
                            <th scope="col" style={{ minWidth: 200 }}>{m.name} (%)</th>
                            {others.map((o) => <th key={o.id} scope="col" className="num bl-hide-md">{o.short}</th>)}
                            <th scope="col" className="num bl-hide-sm" title="USD per 1M input / output tokens">Price in / out</th>
                            <th scope="col" className="num bl-hide-md">Context</th>
                        </tr>
                    </thead>
                    <tbody>
                        {ranked.map((x, i) => {
                            const v = x.scores[metric]!;
                            return (
                                <tr key={x.id}>
                                    <td className="num muted">{ranks[i]}</td>
                                    <td>
                                        <a href={x.source.url} target="_blank" rel="noopener noreferrer" className="bl-name" title={`Source: ${x.source.label}`}>
                                            {x.name}
                                        </a>
                                        <span className="bl-sub">
                                            {x.provider}
                                            {x.openWeights && <span className="chip chip-outline bl-open">open weights</span>}
                                        </span>
                                    </td>
                                    <td className="bl-hide-sm mono-cell">{formatDate(x.releaseDate, 'short')}</td>
                                    <td>
                                        <div className="bl-bar-row">
                                            <div className="bl-bar-track" aria-hidden="true">
                                                <div className="bl-bar" style={{ width: `${v}%` }} />
                                            </div>
                                            <span className="bl-val">{v.toFixed(1)}</span>
                                        </div>
                                        {x.notes && <span className="bl-note">{x.notes}</span>}
                                    </td>
                                    {others.map((o) => (
                                        <td key={o.id} className="num bl-hide-md">{x.scores[o.id] != null ? x.scores[o.id]!.toFixed(1) : <span className="muted" title="Not reported">—</span>}</td>
                                    ))}
                                    <td className="num bl-hide-sm">{price(x.price)}</td>
                                    <td className="num bl-hide-md">{formatContextWindow(x.contextWindow)}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
            <p className="bl-foot">
                {ranked.length} models report {m.name}{missing > 0 ? `; ${missing} more in this snapshot do not (blank ≠ zero)` : ''}.
                Click a model name to open the lab’s own report. “—” means the benchmark was not reported.
            </p>
            <style>{`
                .bl-table td { vertical-align: top; }
                .bl-name { color: var(--ink); font-weight: var(--weight-medium); text-decoration: underline; text-decoration-color: var(--stroke-dark); text-underline-offset: 3px; }
                .bl-name:hover { text-decoration-color: var(--ink); }
                .bl-sub { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; font-size: var(--text-2xs); color: var(--muted); margin-top: 2px; }
                .bl-open { font-size: 10px; padding: 0 6px; }
                .mono-cell { font-family: var(--font-mono); font-size: var(--text-2xs); white-space: nowrap; }
                .bl-bar-row { display: flex; align-items: center; gap: var(--s2); }
                .bl-bar-track { flex: 1; height: 8px; background: var(--bg-raised); border-radius: 0 4px 4px 0; overflow: hidden; min-width: 80px; }
                .bl-bar { height: 100%; background: var(--viz-1); border-radius: 0 4px 4px 0; transition: width var(--dur-slow) var(--ease-out); }
                .bl-val { font-family: var(--font-mono); font-size: var(--text-xs); color: var(--ink); font-weight: var(--weight-medium); min-width: 3.2em; text-align: right; font-variant-numeric: tabular-nums; }
                .bl-note { display: block; font-size: 10.5px; color: var(--muted); margin-top: 3px; line-height: 1.4; }
                .bl-foot { font-size: var(--text-xs); color: var(--muted); margin-top: var(--s3); }
                @media (max-width: 1023px) { .bl-hide-md { display: none; } }
                @media (max-width: 639px) { .bl-hide-sm { display: none; } }
            `}</style>
        </div>
    );
}
