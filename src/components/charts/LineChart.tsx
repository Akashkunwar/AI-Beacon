// A small responsive SVG line chart with a crosshair tooltip, optional
// reference lines, shaded x-ranges and point annotations. Used by the
// training module for loss curves and monitoring dashboards.

import { useState } from 'react';
import { CHART_CSS, ChartTooltip, type TooltipState } from './chartKit';
import { useWidth } from '@/hooks/useWidth';

export interface LineSeries {
    id: string;
    label: string;
    color: string;
    points: Array<[number, number]>;
    dashed?: boolean;
}

export interface LineChartProps {
    series: LineSeries[];
    height?: number;
    xLabel: string;
    yLabel?: string;
    xFormat?: (x: number) => string;
    yFormat?: (y: number) => string;
    yDomain?: [number, number];
    xDomain?: [number, number];
    xTicks?: number[];
    yTicks?: number[];
    refLines?: Array<{ y: number; label: string }>;
    bands?: Array<{ x0: number; x1: number; label: string }>;
    notes?: Array<{ x: number; y: number; label: string; anchor?: 'start' | 'end' | 'middle' }>;
    ariaLabel: string;
    showLegend?: boolean;
}

const niceTicks = (min: number, max: number, count = 5) => {
    const span = max - min || 1;
    const step0 = span / count;
    const mag = 10 ** Math.floor(Math.log10(step0));
    const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => span / s <= count) ?? mag * 10;
    const out: number[] = [];
    for (let v = Math.ceil(min / step) * step; v <= max + 1e-9; v += step) out.push(+v.toFixed(10));
    return out;
};

export function LineChart({
    series, height = 240, xLabel, yLabel, xFormat = (x) => `${x}`, yFormat = (y) => y.toFixed(2),
    yDomain, xDomain, xTicks, yTicks, refLines = [], bands = [], notes = [], ariaLabel, showLegend = true,
}: LineChartProps) {
    const { ref, width } = useWidth<HTMLDivElement>();
    const [tip, setTip] = useState<TooltipState | null>(null);
    const [hoverX, setHoverX] = useState<number | null>(null);

    const all = series.flatMap((s) => s.points);
    const [xMin, xMax] = xDomain ?? [Math.min(...all.map((p) => p[0])), Math.max(...all.map((p) => p[0]))];
    const [yMin, yMax] = yDomain ?? [Math.min(0, ...all.map((p) => p[1])), Math.max(...all.map((p) => p[1])) * 1.05];
    const pad = { l: yLabel ? 58 : 44, r: 16, t: 12, b: 34 };
    const iw = width - pad.l - pad.r;
    const ih = height - pad.t - pad.b;
    const sx = (x: number) => pad.l + ((x - xMin) / (xMax - xMin || 1)) * iw;
    const sy = (y: number) => pad.t + ih - ((Math.min(Math.max(y, yMin), yMax) - yMin) / (yMax - yMin || 1)) * ih;
    const xt = xTicks ?? niceTicks(xMin, xMax, Math.max(3, Math.floor(iw / 110)));
    const yt = yTicks ?? niceTicks(yMin, yMax, 4);

    const paths = series.map((s) => ({
        ...s,
        d: s.points.map((p, i) => `${i ? 'L' : 'M'}${sx(p[0]).toFixed(1)},${sy(p[1]).toFixed(1)}`).join(''),
    }));

    const onMove = (e: React.PointerEvent<SVGRectElement>) => {
        if (!all.length) return;
        const box = (e.currentTarget.ownerSVGElement as SVGSVGElement).getBoundingClientRect();
        const px = e.clientX - box.left;
        const x = xMin + ((px - pad.l) / iw) * (xMax - xMin);
        const rows = series.map((s) => {
            let best = s.points[0];
            for (const p of s.points) if (Math.abs(p[0] - x) < Math.abs(best[0] - x)) best = p;
            return { s, p: best };
        });
        const snapX = rows[0].p[0];
        setHoverX(snapX);
        setTip({
            x: sx(snapX),
            y: Math.min(...rows.map((r) => sy(r.p[1]))),
            content: (
                <>
                    <strong>{xFormat(snapX)}</strong>
                    {rows.map((r) => <span key={r.s.id} style={{ display: 'block' }}>{r.s.label}: {yFormat(r.p[1])}</span>)}
                </>
            ),
        });
    };

    return (
        <div className="lc">
            {showLegend && series.length > 1 && (
                <div className="chart-legend">
                    {series.map((s) => (
                        <span key={s.id} className="chart-legend-key">
                            <i className="chart-swatch-line" style={{ background: s.dashed ? `repeating-linear-gradient(90deg, ${s.color} 0 4px, transparent 4px 7px)` : s.color }} />
                            {s.label}
                        </span>
                    ))}
                </div>
            )}
            <div ref={ref} className="chart-wrap">
                <svg width={width} height={height} role="img" aria-label={ariaLabel}>
                    {bands.map((b) => (
                        <g key={b.label}>
                            <rect x={sx(b.x0)} y={pad.t} width={Math.max(2, sx(b.x1) - sx(b.x0))} height={ih} fill="var(--warning)" opacity={0.1} />
                            <text x={sx(b.x0) + 4} y={pad.t + 12} className="chart-label">{b.label}</text>
                        </g>
                    ))}
                    {yt.map((v) => (
                        <g key={`y${v}`}>
                            <line x1={pad.l} x2={width - pad.r} y1={sy(v)} y2={sy(v)} className="chart-grid" />
                            <text x={pad.l - 8} y={sy(v) + 3.5} textAnchor="end" className="chart-axis-text">{yFormat(v)}</text>
                        </g>
                    ))}
                    {xt.map((v) => (
                        <text key={`x${v}`} x={sx(v)} y={height - pad.b + 16} textAnchor="middle" className="chart-axis-text">{xFormat(v)}</text>
                    ))}
                    <text x={pad.l + iw / 2} y={height - 4} textAnchor="middle" className="chart-label">{xLabel}</text>
                    {yLabel && <text x={12} y={pad.t + ih / 2} textAnchor="middle" transform={`rotate(-90 12 ${pad.t + ih / 2})`} className="chart-label">{yLabel}</text>}
                    {refLines.map((r) => (
                        <g key={r.label}>
                            <line x1={pad.l} x2={width - pad.r} y1={sy(r.y)} y2={sy(r.y)} stroke="var(--danger)" strokeDasharray="4 4" strokeWidth={1.5} />
                            <text x={width - pad.r} y={sy(r.y) - 5} textAnchor="end" className="chart-label">{r.label}</text>
                        </g>
                    ))}
                    {paths.map((p) => (
                        <path key={p.id} d={p.d} fill="none" stroke={p.color} strokeWidth={2} strokeDasharray={p.dashed ? '5 4' : undefined} strokeLinejoin="round" strokeLinecap="round" />
                    ))}
                    {notes.map((n) => (
                        <g key={n.label}>
                            <circle cx={sx(n.x)} cy={sy(n.y)} r={4} fill="var(--ink)" stroke="var(--bg-panel)" strokeWidth={2} />
                            <text x={sx(n.x) + (n.anchor === 'end' ? -8 : 8)} y={sy(n.y) - 8} textAnchor={n.anchor ?? 'start'} className="chart-label-strong">{n.label}</text>
                        </g>
                    ))}
                    {hoverX !== null && <line x1={sx(hoverX)} x2={sx(hoverX)} y1={pad.t} y2={pad.t + ih} stroke="var(--stroke-dark)" />}
                    <rect x={pad.l} y={pad.t} width={Math.max(0, iw)} height={ih} fill="transparent" onPointerMove={onMove} onPointerLeave={() => { setTip(null); setHoverX(null); }} />
                </svg>
                <ChartTooltip tip={tip} containerWidth={width} />
            </div>
            <style>{CHART_CSS + '.lc { display: flex; flex-direction: column; gap: var(--s2); }'}</style>
        </div>
    );
}
