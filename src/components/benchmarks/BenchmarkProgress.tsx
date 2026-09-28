// Scores for one benchmark plotted against release date, with the running
// best ("frontier") as a step line. Shows how quickly benchmarks saturate.

import { useMemo, useState } from 'react';
import { BENCHMARK_MODELS, METRIC_BY_ID, type MetricId, type BenchmarkModel } from '@/data/benchmarkData';
import { ChartTooltip, CHART_CSS, type TooltipState } from '@/components/charts/chartKit';
import { useWidth } from '@/hooks/useWidth';
import { formatDate } from '@/utils/timeline';

interface Props {
    metric: MetricId;
    openOnly: boolean;
}

const H = 320;
const M = { top: 16, right: 24, bottom: 34, left: 40 };

function t(date: string) {
    const [y, m, d] = date.split('-').map(Number);
    return y + (m - 1) / 12 + (d - 1) / 365;
}

export function BenchmarkProgress({ metric, openOnly }: Props) {
    const { ref, width } = useWidth<HTMLDivElement>();
    const [tip, setTip] = useState<TooltipState | null>(null);
    const m = METRIC_BY_ID[metric];

    const points = useMemo(
        () => BENCHMARK_MODELS
            .filter((x) => x.scores[metric] != null && (!openOnly || x.openWeights))
            .sort((a, b) => a.releaseDate.localeCompare(b.releaseDate)),
        [metric, openOnly],
    );

    const x0 = Math.floor(Math.min(...points.map((p) => t(p.releaseDate)), 2024));
    const x1 = 2027;
    const innerW = width - M.left - M.right;
    const innerH = H - M.top - M.bottom;
    const sx = (v: number) => M.left + ((v - x0) / (x1 - x0)) * innerW;
    const sy = (v: number) => M.top + innerH - (v / 100) * innerH;

    // Frontier: running maximum, drawn as a step line.
    const frontier: Array<{ x: number; y: number; model: BenchmarkModel }> = [];
    let best = -1;
    for (const p of points) {
        const v = p.scores[metric]!;
        if (v > best) {
            best = v;
            frontier.push({ x: sx(t(p.releaseDate)), y: sy(v), model: p });
        }
    }
    let path = '';
    frontier.forEach((f, i) => {
        path += i === 0 ? `M${f.x},${f.y}` : ` H${f.x} V${f.y}`;
    });
    if (frontier.length) path += ` H${sx(x1 - 0.25)}`;
    const labelled = new Set([frontier[0]?.model.id, frontier[frontier.length - 1]?.model.id]);

    const years = Array.from({ length: x1 - x0 + 1 }, (_, i) => x0 + i);

    const onMove = (e: React.PointerEvent<SVGSVGElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const mx = e.clientX - rect.left, my = e.clientY - rect.top;
        let hit: BenchmarkModel | null = null, dist = 26;
        for (const p of points) {
            const d = Math.hypot(sx(t(p.releaseDate)) - mx, sy(p.scores[metric]!) - my);
            if (d < dist) { dist = d; hit = p; }
        }
        setTip(hit ? {
            x: sx(t(hit.releaseDate)), y: sy(hit.scores[metric]!),
            content: <><strong>{hit.name}</strong>{hit.provider} · {formatDate(hit.releaseDate, 'short')}<br />{m.short}: {hit.scores[metric]!.toFixed(1)}%{hit.openWeights ? ' · open weights' : ''}</>,
        } : null);
    };

    if (!points.length) return <p className="muted">No models in this view report {m.name}.</p>;

    return (
        <div ref={ref} className="chart-wrap">
            <div className="chart-legend" style={{ marginBottom: 'var(--s3)' }}>
                <span className="chart-legend-key"><span className="chart-swatch" style={{ background: 'var(--viz-1)' }} />Proprietary model</span>
                {!openOnly && <span className="chart-legend-key"><span className="chart-swatch" style={{ background: 'var(--viz-2)' }} />Open-weights model</span>}
                <span className="chart-legend-key"><span className="chart-swatch-line" style={{ background: 'var(--ink)' }} />Best score so far</span>
            </div>
            <svg
                width={width}
                height={H}
                role="img"
                aria-label={`${m.name} scores of ${points.length} models by release date. Best score rose from ${frontier[0]?.model.scores[metric]}% (${frontier[0]?.model.name}) to ${best}% (${frontier[frontier.length - 1]?.model.name}).`}
                onPointerMove={onMove}
                onPointerLeave={() => setTip(null)}
            >
                {[0, 25, 50, 75, 100].map((v) => (
                    <g key={v}>
                        <line className="chart-grid" x1={M.left} x2={width - M.right} y1={sy(v)} y2={sy(v)} />
                        <text className="chart-axis-text" x={M.left - 8} y={sy(v) + 3.5} textAnchor="end">{v}</text>
                    </g>
                ))}
                {years.map((y) => (
                    <text key={y} className="chart-axis-text" x={sx(y)} y={H - 10} textAnchor="middle">{y}</text>
                ))}
                <path d={path} fill="none" stroke="var(--ink)" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
                {points.map((p) => (
                    <circle
                        key={p.id}
                        cx={sx(t(p.releaseDate))}
                        cy={sy(p.scores[metric]!)}
                        r={5}
                        fill={p.openWeights ? 'var(--viz-2)' : 'var(--viz-1)'}
                        stroke="var(--bg-panel)"
                        strokeWidth={2}
                    />
                ))}
                {frontier.filter((f) => labelled.has(f.model.id)).map((f) => (
                    <text key={f.model.id} className="chart-label-strong" x={f.x} y={f.y - 10} textAnchor={f.x > width - 140 ? 'end' : 'start'}>
                        {f.model.name} · {f.model.scores[metric]}%
                    </text>
                ))}
            </svg>
            <ChartTooltip tip={tip} containerWidth={width} />
            <style>{CHART_CSS}</style>
        </div>
    );
}
