// src/components/pipeline/StepKit.tsx
// Shared building blocks for the twelve simulator steps, so every step reads
// the same way: a numbered header, a plain-language lede, the live
// visualisation, optional maths (Advanced mode), and a "Go deeper" card.

import { useState, type CSSProperties, type ReactNode } from 'react';
import { useIsAdvanced } from './stepUtils';
import { PIPELINE_PHASES, PIPELINE_STEP_LABELS, PipelineStep } from '@/lib/store/types';
import { ConceptCard } from '@/components/educational/ConceptCard';
import { heat, signed } from '@/utils/vizColor';

/** Renders its children only in Advanced mode. */
export function Advanced({ children }: { children: ReactNode }) {
    return useIsAdvanced() ? <>{children}</> : null;
}

// ─── StepFrame ────────────────────────────────────────────────────────────

export function StepFrame({ step, lede, children }: { step: PipelineStep; lede: ReactNode; children: ReactNode }) {
    const meta = PIPELINE_STEP_LABELS[step];
    return (
        <article className="sf" aria-labelledby={`sf-title-${step}`}>
            <header className="sf-head">
                <span className="sf-num" aria-hidden="true">{String(step + 1).padStart(2, '0')}</span>
                <div className="sf-head-copy">
                    <p className="eyebrow">Step {step + 1} of 12 · {PIPELINE_PHASES[meta.phase].label}</p>
                    <h2 id={`sf-title-${step}`} className="sf-title">{meta.label}</h2>
                    <p className="sf-lede">{lede}</p>
                </div>
            </header>
            <div className="sf-body">{children}</div>
            <ConceptCard stepId={step} />
            <style>{STEP_CSS}</style>
        </article>
    );
}

// ─── Layout pieces ────────────────────────────────────────────────────────

export function Panel({ title, meta, children, className = '' }: { title?: ReactNode; meta?: ReactNode; children: ReactNode; className?: string }) {
    return (
        <section className={`sf-panel ${className}`}>
            {(title || meta) && (
                <div className="sf-panel-head">
                    {title && <h3 className="sf-panel-title">{title}</h3>}
                    {meta && <div className="sf-panel-meta">{meta}</div>}
                </div>
            )}
            {children}
        </section>
    );
}

/** A short explanatory note. `caveat` is for "this demo differs from real models". */
export function Callout({ title, tone = 'note', children }: { title?: string; tone?: 'note' | 'caveat'; children: ReactNode }) {
    return (
        <div className={`sf-callout sf-callout-${tone}`}>
            {title && <p className="sf-callout-title">{title}</p>}
            <div className="sf-callout-body">{children}</div>
        </div>
    );
}

/** Monospace formula block (use inside <Advanced> when it is maths-only). */
export function Formula({ children, caption }: { children: ReactNode; caption?: ReactNode }) {
    return (
        <div className="sf-formula">
            <pre>{children}</pre>
            {caption && <p className="sf-formula-cap">{caption}</p>}
        </div>
    );
}

/** Tensor shapes, shown only in Advanced mode. */
export function Shapes({ items }: { items: Array<{ name: string; shape: readonly number[]; note?: string }> }) {
    return (
        <Advanced>
            <div className="sf-shapes" aria-label="Tensor shapes">
                {items.map((it) => (
                    <span key={it.name} className="sf-shape" title={it.note}>
                        <span className="sf-shape-name">{it.name}</span>
                        <span className="sf-shape-val">({it.shape.join(' × ')})</span>
                    </span>
                ))}
            </div>
        </Advanced>
    );
}

/** Small key/value facts row, e.g. "Tokens 3 · Vocabulary 512". */
export function Facts({ items }: { items: Array<{ label: string; value: ReactNode; hint?: string }> }) {
    return (
        <dl className="sf-facts">
            {items.map((it) => (
                <div key={it.label} className="sf-fact" title={it.hint}>
                    <dt>{it.label}</dt>
                    <dd>{it.value}</dd>
                </div>
            ))}
        </dl>
    );
}

/** Pick one token (row) to inspect in detail. */
export function TokenPicker({ tokens, value, onChange, label = 'Inspect token' }: { tokens: string[]; value: number; onChange: (i: number) => void; label?: string }) {
    return (
        <div className="sf-picker">
            <span className="field-label">{label}</span>
            <div className="sf-picker-list" role="radiogroup" aria-label={label}>
                {tokens.map((t, i) => (
                    <button
                        key={`${t}-${i}`}
                        type="button"
                        role="radio"
                        aria-checked={value === i}
                        className="sf-picker-btn"
                        onClick={() => onChange(i)}
                    >
                        <span className="sf-picker-idx">{i}</span>{t}
                    </button>
                ))}
            </div>
        </div>
    );
}

// ─── MatrixGrid ───────────────────────────────────────────────────────────
// Rows × columns of coloured cells. `signed` = diverging blue (+) / red (−)
// for vectors; `heat` = sequential 0 → 1 for attention weights.

export interface MatrixGridProps {
    rows: number[][];
    rowLabels: string[];
    colLabels?: string[];
    scale: 'signed' | 'heat';
    /** Symmetric range for `signed` (defaults to the largest |value|). */
    maxAbs?: number;
    /** Hide the upper triangle (future positions) for causal attention. */
    causal?: boolean;
    /** Print values inside cells: auto = when cells are wide enough. */
    values?: 'auto' | 'always' | 'never';
    /** Highlight one row (e.g. the token picked elsewhere). */
    highlightRow?: number;
    ariaLabel: string;
    /** Label for columns in the hover readout, e.g. "dim" or "attends to". */
    colNoun?: string;
}

export function MatrixGrid({
    rows, rowLabels, colLabels, scale, maxAbs, causal = false, values = 'auto', highlightRow, ariaLabel, colNoun = 'dim',
}: MatrixGridProps) {
    const advanced = useIsAdvanced();
    const [hover, setHover] = useState<{ r: number; c: number } | null>(null);
    const nCols = rows[0]?.length ?? 0;
    if (!nCols) return null;

    const max = maxAbs ?? Math.max(1e-6, ...rows.flat().map(Math.abs));
    const showValues = values === 'always' || (values === 'auto' && advanced && nCols <= 12);
    const cellMax = nCols <= 8 ? 56 : nCols <= 16 ? 40 : 24;
    const cellH = nCols > 32 ? 18 : showValues ? 30 : 24;

    const fill = (v: number, masked: boolean) => {
        if (masked) return 'transparent';
        return scale === 'heat' ? heat(v) : signed(v / max, 0.06, 0.88);
    };
    const ink = (v: number) => {
        const strong = scale === 'heat' ? v > 0.55 : Math.abs(v / max) > 0.6;
        if (!strong) return 'var(--primary)';
        return scale === 'heat' ? 'var(--viz-heat-text)' : 'var(--viz-on-fill)';
    };
    const fmt = (v: number) => (scale === 'heat' ? v.toFixed(2) : (v >= 0 ? '' : '−') + Math.abs(v).toFixed(2));

    const readout = hover
        ? `${rowLabels[hover.r]} · ${colLabels ? `${colNoun} ${colLabels[hover.c]}` : `${colNoun} ${hover.c}`} = ${causal && hover.c > hover.r ? 'masked (future token)' : fmt(rows[hover.r][hover.c])}`
        : null;

    const gridStyle = {
        gridTemplateColumns: `minmax(56px, max-content) repeat(${nCols}, minmax(${nCols > 32 ? 6 : 12}px, ${cellMax}px))`,
    } as CSSProperties;

    return (
        <div className="mg">
            <div className="mg-scroll">
                <div className="mg-grid" style={gridStyle} role="img" aria-label={ariaLabel} onMouseLeave={() => setHover(null)}>
                    {colLabels && (
                        <>
                            <span className="mg-corner" />
                            {colLabels.map((c, j) => (
                                <span key={`c${j}`} className={`mg-cl ${hover?.c === j ? 'is-on' : ''}`} title={c}>{c}</span>
                            ))}
                        </>
                    )}
                    {rows.map((row, i) => (
                        <div key={`r${i}`} className={`mg-row ${highlightRow === i ? 'is-hl' : ''}`} style={{ display: 'contents' }}>
                            <span className={`mg-rl ${hover?.r === i ? 'is-on' : ''}`} title={rowLabels[i]}>{rowLabels[i]}</span>
                            {row.map((v, j) => {
                                const masked = causal && j > i;
                                return (
                                    <span
                                        key={j}
                                        className={`mg-cell ${masked ? 'is-masked' : ''}`}
                                        style={{ background: fill(v, masked), height: cellH, color: ink(v) }}
                                        onMouseEnter={() => setHover({ r: i, c: j })}
                                    >
                                        {showValues && !masked ? fmt(v) : ''}
                                    </span>
                                );
                            })}
                        </div>
                    ))}
                </div>
            </div>
            <div className="mg-foot">
                <ScaleLegend scale={scale} max={max} causal={causal} />
                <span className="mg-readout" aria-live="polite">{readout ?? 'Hover a cell to see its value'}</span>
            </div>
        </div>
    );
}

export function ScaleLegend({ scale, max, causal }: { scale: 'signed' | 'heat'; max?: number; causal?: boolean }) {
    return (
        <span className="mg-legend" aria-hidden="true">
            {scale === 'signed' ? (
                <>
                    <span>−{(max ?? 1).toFixed(1)}</span>
                    <span className="mg-ramp" style={{ background: 'linear-gradient(90deg, var(--viz-neg), transparent 50%, var(--viz-1))' }} />
                    <span>+{(max ?? 1).toFixed(1)}</span>
                </>
            ) : (
                <>
                    <span>0</span>
                    <span className="mg-ramp" style={{ background: 'linear-gradient(90deg, var(--viz-heat-lo), var(--viz-heat-hi))' }} />
                    <span>1</span>
                </>
            )}
            {causal && <span className="mg-masked-key"><span className="mg-cell is-masked" style={{ width: 14, height: 12 }} /> masked</span>}
        </span>
    );
}

// ─── BarList ──────────────────────────────────────────────────────────────
// Horizontal bars for ranked values (logits, probabilities). The top item is
// drawn in the accent colour; the rest in a lighter tint.

export function BarList({ items, max, format, ariaLabel }: {
    items: Array<{ key: string | number; label: string; value: number; highlight?: boolean; note?: string }>;
    max?: number;
    format: (v: number) => string;
    ariaLabel: string;
}) {
    const m = max ?? Math.max(1e-9, ...items.map((i) => Math.abs(i.value)));
    return (
        <ul className="bl" aria-label={ariaLabel}>
            {items.map((it) => (
                <li key={it.key} className={`bl-row ${it.highlight ? 'is-top' : ''}`}>
                    <span className="bl-label" title={it.label}>{it.label}</span>
                    <span className="bl-track">
                        <span className="bl-bar" style={{ width: `${Math.max(0.6, (Math.abs(it.value) / m) * 100)}%` }} />
                    </span>
                    <span className="bl-val">{format(it.value)}</span>
                    {it.note && <span className="bl-note">{it.note}</span>}
                </li>
            ))}
        </ul>
    );
}

// ─── DimBars ──────────────────────────────────────────────────────────────
// One vertical bar per dimension around a zero line: blue up = positive,
// red down = negative. Good for seeing the scale/shape of a single vector.

export function DimBars({ values, maxAbs, height = 80, ariaLabel }: { values: number[]; maxAbs?: number; height?: number; ariaLabel: string }) {
    const m = maxAbs ?? Math.max(1e-6, ...values.map(Math.abs));
    const half = height / 2;
    return (
        <div className="db" role="img" aria-label={ariaLabel} style={{ height }}>
            <span className="db-zero" style={{ top: half }} />
            {values.map((v, i) => {
                const h = Math.max(1, (Math.min(Math.abs(v), m) / m) * (half - 2));
                return (
                    <span key={i} className="db-col" title={`dim ${i}: ${v.toFixed(3)}`}>
                        <span
                            className={`db-bar ${v >= 0 ? 'is-pos' : 'is-neg'}`}
                            style={v >= 0 ? { bottom: half, height: h } : { top: half, height: h }}
                        />
                    </span>
                );
            })}
        </div>
    );
}

// ─── CSS ──────────────────────────────────────────────────────────────────

const STEP_CSS = `
.sf { display: flex; flex-direction: column; gap: var(--s5); max-width: 880px; margin: 0 auto; width: 100%; }
.sf-head { display: flex; gap: var(--s4); align-items: flex-start; }
.sf-num {
    flex-shrink: 0; width: 44px; height: 44px; border-radius: var(--r-md);
    display: grid; place-items: center; background: var(--bg-inverse); color: var(--text-inverse);
    font-family: var(--font-mono); font-size: var(--text-sm); font-weight: var(--weight-semibold);
}
.sf-head-copy { display: flex; flex-direction: column; gap: 6px; min-width: 0; }
.sf-title { font-size: var(--text-xl); letter-spacing: var(--tracking-tight); line-height: 1.15; }
.sf-lede { font-size: var(--text-base); color: var(--secondary); line-height: var(--lead-body); max-width: 68ch; }
.sf-body { display: flex; flex-direction: column; gap: var(--s4); }

.sf-panel { background: var(--bg-panel); border: 1px solid var(--stroke); border-radius: var(--r-lg); padding: var(--s4); display: flex; flex-direction: column; gap: var(--s3); min-width: 0; }
.sf-panel-head { display: flex; justify-content: space-between; align-items: baseline; gap: var(--s3); flex-wrap: wrap; }
.sf-panel-title { font-size: var(--text-sm); font-weight: var(--weight-semibold); color: var(--ink); }
.sf-panel-meta { font-size: var(--text-xs); color: var(--muted); font-family: var(--font-mono); }

.sf-callout { border-left: 2px solid var(--stroke-dark); padding: 2px 0 2px var(--s3); font-size: var(--text-sm); color: var(--secondary); line-height: var(--lead-body); }
.sf-callout-caveat { border-left-color: var(--warning); }
.sf-callout-title { font-weight: var(--weight-semibold); color: var(--ink); margin-bottom: 2px; }
.sf-callout-body p + p { margin-top: 6px; }
.sf-callout strong { color: var(--ink); font-weight: var(--weight-semibold); }

.sf-formula { background: var(--bg-sunken); border: 1px solid var(--stroke); border-radius: var(--r-md); padding: var(--s3) var(--s4); }
.sf-formula pre { margin: 0; font-family: var(--font-mono); font-size: var(--text-xs); color: var(--ink); line-height: 1.7; white-space: pre-wrap; word-break: break-word; }
.sf-formula-cap { margin-top: 6px; font-size: var(--text-xs); color: var(--muted); }

.sf-shapes { display: flex; flex-wrap: wrap; gap: 6px; }
.sf-shape { display: inline-flex; gap: 6px; align-items: baseline; padding: 3px 8px; border: 1px solid var(--stroke); border-radius: var(--r-sm); background: var(--bg-panel); font-family: var(--font-mono); font-size: var(--text-2xs); }
.sf-shape-name { color: var(--muted); }
.sf-shape-val { color: var(--ink); }

.sf-facts { display: flex; flex-wrap: wrap; gap: var(--s2) var(--s5); }
.sf-fact { display: flex; flex-direction: column; gap: 2px; }
.sf-fact dt { font-size: var(--text-2xs); color: var(--muted); text-transform: uppercase; letter-spacing: var(--tracking-wide); font-family: var(--font-mono); }
.sf-fact dd { font-size: var(--text-md); color: var(--ink); font-weight: var(--weight-semibold); font-variant-numeric: tabular-nums; }

.sf-picker { display: flex; flex-direction: column; gap: 6px; }
.sf-picker-list { display: flex; flex-wrap: wrap; gap: 6px; }
.sf-picker-btn { display: inline-flex; gap: 6px; align-items: baseline; padding: 4px 10px; border-radius: var(--r-sm); border: 1px solid var(--stroke); background: var(--bg-panel); font-family: var(--font-mono); font-size: var(--text-xs); color: var(--secondary); }
.sf-picker-btn:hover { border-color: var(--stroke-dark); color: var(--ink); }
.sf-picker-btn[aria-checked="true"] { background: var(--bg-inverse); border-color: var(--bg-inverse); color: var(--text-inverse); }
.sf-picker-idx { opacity: 0.6; font-size: var(--text-2xs); }

.mg { display: flex; flex-direction: column; gap: var(--s2); min-width: 0; }
.mg-scroll { overflow-x: auto; padding-bottom: 2px; }
.mg-grid { display: grid; gap: 2px; align-items: center; width: max-content; max-width: 100%; }
.mg-corner { }
.mg-cl { font-family: var(--font-mono); font-size: 10px; color: var(--muted); text-align: center; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; padding-bottom: 2px; }
.mg-rl { font-family: var(--font-mono); font-size: var(--text-xs); color: var(--secondary); padding-right: var(--s2); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 110px; }
.mg-cl.is-on, .mg-rl.is-on { color: var(--ink); font-weight: var(--weight-semibold); }
.mg-row.is-hl .mg-rl { color: var(--ink); font-weight: var(--weight-semibold); }
.mg-row.is-hl .mg-cell { box-shadow: inset 0 0 0 1px var(--ink); }
.mg-cell { display: grid; place-items: center; border-radius: 3px; font-family: var(--font-mono); font-size: 10px; font-variant-numeric: tabular-nums; box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--stroke) 70%, transparent); cursor: crosshair; }
.mg-cell:hover { outline: 2px solid var(--ink); outline-offset: -1px; }
.mg-cell.is-masked { background-image: repeating-linear-gradient(135deg, var(--stroke) 0 1px, transparent 1px 5px) !important; }
.mg-foot { display: flex; justify-content: space-between; align-items: center; gap: var(--s3); flex-wrap: wrap; font-size: var(--text-2xs); color: var(--muted); font-family: var(--font-mono); }
.mg-legend { display: inline-flex; align-items: center; gap: 6px; }
.mg-ramp { width: 72px; height: 8px; border-radius: 2px; border: 1px solid var(--stroke); }
.mg-masked-key { display: inline-flex; align-items: center; gap: 4px; margin-left: var(--s2); }
.mg-readout { color: var(--secondary); }

.bl { list-style: none; display: flex; flex-direction: column; gap: 6px; }
.bl-row { display: grid; grid-template-columns: minmax(72px, 110px) 1fr 64px; gap: var(--s3); align-items: center; }
.bl-label { font-family: var(--font-mono); font-size: var(--text-sm); color: var(--secondary); text-align: right; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.bl-track { height: 14px; background: var(--bg-raised); border-radius: 0 4px 4px 0; position: relative; }
.bl-bar { position: absolute; inset: 0 auto 0 0; background: var(--viz-bar-rest); border-radius: 0 4px 4px 0; transition: width var(--dur-base) var(--ease-out); }
.bl-val { font-family: var(--font-mono); font-size: var(--text-xs); color: var(--secondary); text-align: right; font-variant-numeric: tabular-nums; }
.bl-note { grid-column: 2 / -1; font-size: var(--text-2xs); color: var(--muted); margin-top: -2px; }
.bl-row.is-top .bl-label, .bl-row.is-top .bl-val { color: var(--ink); font-weight: var(--weight-semibold); }
.bl-row.is-top .bl-bar { background: var(--viz-1); }

.db { position: relative; display: flex; gap: 2px; align-items: stretch; background: var(--bg-sunken); border: 1px solid var(--stroke); border-radius: var(--r-sm); padding: 0 4px; }
.db-zero { position: absolute; left: 0; right: 0; height: 1px; background: var(--stroke-dark); }
.db-col { position: relative; flex: 1; min-width: 2px; }
.db-bar { position: absolute; left: 0; right: 0; }
.db-bar.is-pos { background: var(--viz-1); border-radius: 2px 2px 0 0; }
.db-bar.is-neg { background: var(--viz-neg); border-radius: 0 0 2px 2px; }

.sf-split { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 260px), 1fr)); gap: var(--s4); }
.sf-flow { display: flex; align-items: center; gap: var(--s2); flex-wrap: wrap; }
.sf-arrow { color: var(--muted); font-family: var(--font-mono); }
.sf-chip { display: inline-flex; align-items: center; gap: 6px; padding: 5px 10px; border-radius: var(--r-sm); border: 1px solid var(--stroke-dark); background: var(--bg-panel); font-family: var(--font-mono); font-size: var(--text-sm); color: var(--ink); }
.sf-chip-id { font-size: var(--text-2xs); color: var(--muted); }
.sf-chip.is-unk { border-style: dashed; color: var(--secondary); }

@media (max-width: 639px) {
    .sf-num { display: none; }
    .sf-title { font-size: var(--text-lg); }
    .sf-lede { font-size: var(--text-sm); }
    .sf-panel { padding: var(--s3); }
    .bl-row { grid-template-columns: minmax(56px, 80px) 1fr 54px; gap: var(--s2); }
}
`;
