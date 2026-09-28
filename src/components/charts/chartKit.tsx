// Minimal building blocks shared by the hand-rolled SVG charts:
// a width-tracking hook and a positioned tooltip. Charts use design tokens
// for every colour so they follow the light/dark theme.

import { useEffect, useRef, useState, type ReactNode } from 'react';

/** Track an element's content width (for responsive SVG charts). */
export function useWidth<T extends HTMLElement>(fallback = 720) {
    const ref = useRef<T>(null);
    const [width, setWidth] = useState(fallback);
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const ro = new ResizeObserver(([entry]) => setWidth(Math.max(280, Math.round(entry.contentRect.width))));
        ro.observe(el);
        return () => ro.disconnect();
    }, []);
    return { ref, width };
}

export interface TooltipState {
    x: number;
    y: number;
    content: ReactNode;
}

/** Tooltip positioned relative to its chart container (which must be position:relative). */
export function ChartTooltip({ tip, containerWidth }: { tip: TooltipState | null; containerWidth: number }) {
    if (!tip) return null;
    const flip = tip.x > containerWidth - 220;
    return (
        <div
            role="status"
            className="chart-tooltip"
            style={{
                left: flip ? undefined : tip.x + 14,
                right: flip ? containerWidth - tip.x + 14 : undefined,
                top: Math.max(0, tip.y - 12),
            }}
        >
            {tip.content}
        </div>
    );
}

export const CHART_CSS = `
.chart-wrap { position: relative; }
.chart-wrap svg { display: block; overflow: visible; }
.chart-axis-text { font-family: var(--font-mono); font-size: 10.5px; fill: var(--muted); font-variant-numeric: tabular-nums; }
.chart-label { font-family: var(--font-sans); font-size: 11px; fill: var(--secondary); }
.chart-label-strong { font-family: var(--font-sans); font-size: 11px; font-weight: 600; fill: var(--ink); }
.chart-grid { stroke: var(--viz-grid); stroke-width: 1; }
.chart-tooltip {
    position: absolute; z-index: 5; pointer-events: none;
    min-width: 160px; max-width: 240px;
    padding: 8px 10px;
    background: var(--bg-inverse); color: var(--text-inverse);
    border-radius: var(--r-sm);
    font-size: var(--text-2xs); line-height: 1.5;
    box-shadow: var(--shadow-lift);
}
.chart-tooltip strong { display: block; font-size: var(--text-xs); }
.chart-legend { display: flex; flex-wrap: wrap; gap: var(--s2) var(--s4); font-size: var(--text-xs); color: var(--secondary); }
.chart-legend-key { display: inline-flex; align-items: center; gap: 6px; }
.chart-swatch { width: 10px; height: 10px; border-radius: 50%; display: inline-block; }
.chart-swatch-line { width: 16px; height: 2px; border-radius: 1px; display: inline-block; }
`;
