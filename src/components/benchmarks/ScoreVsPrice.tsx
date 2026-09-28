// Benchmark score against API price (log scale). Models on the "best value"
// frontier — no cheaper model scores higher — are connected and labelled.

import { useMemo, useState } from 'react';
import { BENCHMARK_MODELS, METRIC_BY_ID, blendedPrice, type MetricId, type BenchmarkModel } from '@/data/benchmarkData';
import { ChartTooltip, CHART_CSS, type TooltipState } from '@/components/charts/chartKit';
import { useWidth } from '@/hooks/useWidth';

interface Props {
    metric: MetricId;
    openOnly: boolean;
}

const H = 340;
const M = { top: 20, right: 28, bottom: 42, left: 44 };
const TICKS = [0.1, 0.3, 1, 3, 10, 30];

export function ScoreVsPrice({ metric, openOnly }: Props) {
    const { ref, width } = useWidth<HTMLDivElement>();
    const [tip, setTip] = useState<TooltipState | null>(null);
    const m = METRIC_BY_ID[metric];

    const pts = useMemo(
        () => BENCHMARK_MODELS
            .filter((x) => x.scores[metric] != null && blendedPrice(x) != null && (!openOnly || x.openWeights))
            .map((x) => ({ model: x, price: blendedPrice(x)!, score: x.scores[metric]! })),
        [metric, openOnly],
    );

    const scores = pts.map((p) => p.score);
    const yMin = Math.max(0, Math.floor((Math.min(...scores, 100) - 8) / 10) * 10);
    const yMax = 100;
    const lx0 = Math.log10(0.1), lx1 = Math.log10(60);
    const innerW = width - M.left - M.right;
    const innerH = H - M.top - M.bottom;
    const sx = (p: number) => M.left + ((Math.log10(p) - lx0) / (lx1 - lx0)) * innerW;
    const sy = (v: number) => M.top + innerH - ((v - yMin) / (yMax - yMin)) * innerH;

    // Pareto frontier: sorted by price, keep points that beat every cheaper one.
    const frontier: typeof pts = [];
    [...pts].sort((a, b) => a.price - b.price || b.score - a.score).forEach((p) => {
        if (!frontier.length || p.score > frontier[frontier.length - 1].score) frontier.push(p);
    });
    const onFrontier = new Set(frontier.map((f) => f.model.id));

    const onMove = (e: React.PointerEvent<SVGSVGElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const mx = e.clientX - rect.left, my = e.clientY - rect.top;
        let hit: (typeof pts)[number] | null = null, dist = 26;
        for (const p of pts) {
            const d = Math.hypot(sx(p.price) - mx, sy(p.score) - my);
            if (d < dist) { dist = d; hit = p; }
        }
        setTip(hit ? {
            x: sx(hit.price), y: sy(hit.score),
            content: <><strong>{hit.model.name}</strong>{m.short} {hit.score.toFixed(1)}% · ${hit.price.toFixed(2)} per 1M tokens (blended){onFrontier.has(hit.model.id) ? <><br />On the best-value frontier</> : null}</>,
        } : null);
    };

    if (pts.length < 2) return <p className="muted">Not enough priced models report {m.name} for this chart.</p>;

    const label = (mdl: BenchmarkModel) => mdl.name.replace(' (high)', '').replace(' Thinking', '');

    return (
        <div ref={ref} className="chart-wrap">
            <div className="chart-legend" style={{ marginBottom: 'var(--s3)' }}>
                <span className="chart-legend-key"><span className="chart-swatch" style={{ background: 'var(--viz-1)' }} />Proprietary model</span>
                {!openOnly && <span className="chart-legend-key"><span className="chart-swatch" style={{ background: 'var(--viz-2)' }} />Open-weights model (official API price)</span>}
                <span className="chart-legend-key"><span className="chart-swatch-line" style={{ background: 'var(--ink)' }} />Best value frontier</span>
            </div>
            <svg
                width={width}
                height={H}
                role="img"
                aria-label={`${m.name} score versus price for ${pts.length} models. Best-value models: ${frontier.map((f) => f.model.name).join(', ')}.`}
                onPointerMove={onMove}
                onPointerLeave={() => setTip(null)}
            >
                {Array.from({ length: Math.floor((yMax - yMin) / 10) + 1 }, (_, i) => yMin + i * 10).map((v) => (
                    <g key={v}>
                        <line className="chart-grid" x1={M.left} x2={width - M.right} y1={sy(v)} y2={sy(v)} />
                        <text className="chart-axis-text" x={M.left - 8} y={sy(v) + 3.5} textAnchor="end">{v}</text>
                    </g>
                ))}
                {TICKS.map((p) => (
                    <text key={p} className="chart-axis-text" x={sx(p)} y={H - 22} textAnchor="middle">${p}</text>
                ))}
                <text className="chart-axis-text" x={M.left + innerW / 2} y={H - 4} textAnchor="middle">
                    Blended price, $ per 1M tokens (3 input : 1 output, log scale) →
                </text>
                <polyline
                    points={frontier.map((f) => `${sx(f.price)},${sy(f.score)}`).join(' ')}
                    fill="none" stroke="var(--ink)" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round"
                />
                {pts.map((p) => (
                    <circle key={p.model.id} cx={sx(p.price)} cy={sy(p.score)} r={5}
                        fill={p.model.openWeights ? 'var(--viz-2)' : 'var(--viz-1)'} stroke="var(--bg-panel)" strokeWidth={2} />
                ))}
                {frontier.map((f, i) => {
                    const x = sx(f.price);
                    const right = x < width - 160;
                    return (
                        <text key={f.model.id} className="chart-label-strong"
                            x={x + (right ? 9 : -9)} y={sy(f.score) + (i % 2 ? 14 : -8)} textAnchor={right ? 'start' : 'end'}>
                            {label(f.model)}
                        </text>
                    );
                })}
            </svg>
            <ChartTooltip tip={tip} containerWidth={width} />
            <style>{CHART_CSS}</style>
        </div>
    );
}
