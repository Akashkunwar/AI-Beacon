// Shared building blocks for the Module 03 stages, so every stage reads the
// same way: titled blocks, notes, numbered steps, stat grids and source lines.

import type { ReactNode } from 'react';

export function Block({ title, intro, children, aside }: { title: string; intro?: ReactNode; children?: ReactNode; aside?: ReactNode }) {
    return (
        <section className="tk-block">
            <div className="tk-block-head">
                <div>
                    <h3 className="tk-block-title">{title}</h3>
                    {intro && <p className="tk-block-intro">{intro}</p>}
                </div>
                {aside}
            </div>
            {children}
        </section>
    );
}

export function Note({ title, tone = 'note', children }: { title?: string; tone?: 'note' | 'caveat'; children: ReactNode }) {
    return (
        <div className={`tk-note tk-note-${tone}`}>
            {title && <p className="tk-note-title">{title}</p>}
            <div className="tk-note-body">{children}</div>
        </div>
    );
}

export function Steps({ items }: { items: Array<{ title: string; text: ReactNode }> }) {
    return (
        <ol className="tk-steps">
            {items.map((it, i) => (
                <li key={it.title}>
                    <span className="tk-steps-num" aria-hidden="true">{i + 1}</span>
                    <div>
                        <p className="tk-steps-title">{it.title}</p>
                        <p className="tk-steps-text">{it.text}</p>
                    </div>
                </li>
            ))}
        </ol>
    );
}

export function StatGrid({ items }: { items: Array<{ label: string; value: ReactNode; hint?: ReactNode }> }) {
    return (
        <dl className="tk-stats">
            {items.map((it) => (
                <div key={it.label} className="tk-stat">
                    <dt>{it.label}</dt>
                    <dd>{it.value}</dd>
                    {it.hint && <p className="tk-stat-hint">{it.hint}</p>}
                </div>
            ))}
        </dl>
    );
}

export function Sources({ items }: { items: Array<{ label: string; url: string }> }) {
    return (
        <p className="tk-sources">
            <span>Sources:</span>{' '}
            {items.map((s, i) => (
                <span key={s.url}>
                    <a className="text-link" href={s.url} target="_blank" rel="noopener noreferrer">{s.label}</a>
                    {i < items.length - 1 ? ' · ' : ''}
                </span>
            ))}
        </p>
    );
}

export function Tabs<T extends string>({ options, value, onChange, label }: { options: Array<{ id: T; label: string }>; value: T; onChange: (id: T) => void; label: string }) {
    return (
        <div className="segmented tk-tabs" role="tablist" aria-label={label}>
            {options.map((o) => (
                <button key={o.id} type="button" role="tab" aria-selected={value === o.id} onClick={() => onChange(o.id)}>
                    {o.label}
                </button>
            ))}
        </div>
    );
}

/** Cards in a responsive grid, each with an optional tag, title, meta line and body. */
export function CardGrid({ items, min = 240 }: { items: Array<{ key?: string; tag?: string; title: string; meta?: ReactNode; body: ReactNode }>; min?: number }) {
    return (
        <div className="tk-cards" style={{ gridTemplateColumns: `repeat(auto-fill, minmax(min(100%, ${min}px), 1fr))` }}>
            {items.map((c) => (
                <article key={c.key ?? c.title} className="card tk-card">
                    {c.tag && <span className="chip">{c.tag}</span>}
                    <h4 className="tk-card-title">{c.title}</h4>
                    {c.meta && <p className="tk-card-meta">{c.meta}</p>}
                    <div className="tk-card-body">{c.body}</div>
                </article>
            ))}
        </div>
    );
}

export const fmtBig = (n: number): string => {
    if (n >= 1e12) return `${+(n / 1e12).toFixed(n >= 1e14 ? 0 : 1)}T`;
    if (n >= 1e9) return `${+(n / 1e9).toFixed(n >= 1e10 ? 0 : 1)}B`;
    if (n >= 1e6) return `${+(n / 1e6).toFixed(n >= 1e7 ? 0 : 1)}M`;
    if (n >= 1e3) return `${+(n / 1e3).toFixed(n >= 1e4 ? 0 : 1)}K`;
    return `${Math.round(n)}`;
};

/** 3.8e25 → "3.8 × 10²⁵" */
export function sci(n: number, digits = 1): string {
    const exp = Math.floor(Math.log10(n));
    const mant = n / 10 ** exp;
    const sup = String(exp).split('').map((c) => '⁰¹²³⁴⁵⁶⁷⁸⁹'[+c] ?? c).join('');
    return `${mant.toFixed(digits)} × 10${sup}`;
}

export const TRAINING_KIT_CSS = `
.tk-block { display: flex; flex-direction: column; gap: var(--s4); }
.tk-block + .tk-block { padding-top: var(--s6); border-top: 1px solid var(--stroke); }
.tk-block-head { display: flex; justify-content: space-between; align-items: flex-end; gap: var(--s4); flex-wrap: wrap; }
.tk-block-title { font-size: var(--text-md); letter-spacing: var(--tracking-tight); }
.tk-block-intro { margin-top: 6px; font-size: var(--text-sm); color: var(--secondary); line-height: var(--lead-body); max-width: 72ch; }

.tk-note { border-left: 2px solid var(--stroke-dark); padding: 2px 0 2px var(--s3); font-size: var(--text-sm); color: var(--secondary); line-height: var(--lead-body); max-width: 80ch; }
.tk-note-caveat { border-left-color: var(--warning); }
.tk-note-title { font-weight: var(--weight-semibold); color: var(--ink); margin-bottom: 2px; }
.tk-note-body p + p { margin-top: 6px; }
.tk-note strong { color: var(--ink); }

.tk-steps { list-style: none; display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 200px), 1fr)); gap: var(--s3); }
.tk-steps li { display: flex; gap: var(--s3); padding: var(--s3); border: 1px solid var(--stroke); border-radius: var(--r-md); background: var(--bg-panel); }
.tk-steps-num { flex-shrink: 0; width: 24px; height: 24px; border-radius: 50%; display: grid; place-items: center; background: var(--bg-inverse); color: var(--text-inverse); font-family: var(--font-mono); font-size: 11px; }
.tk-steps-title { font-size: var(--text-sm); font-weight: var(--weight-semibold); color: var(--ink); }
.tk-steps-text { font-size: var(--text-xs); color: var(--secondary); line-height: var(--lead-body); margin-top: 2px; }

.tk-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 150px), 1fr)); gap: var(--s3); }
.tk-stat { padding: var(--s3) var(--s4); border: 1px solid var(--stroke); border-radius: var(--r-md); background: var(--bg-panel); display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.tk-stat dt { font-size: var(--text-2xs); font-family: var(--font-mono); text-transform: uppercase; letter-spacing: var(--tracking-wide); color: var(--muted); }
.tk-stat dd { font-size: var(--text-lg); font-weight: var(--weight-semibold); color: var(--ink); font-variant-numeric: tabular-nums; letter-spacing: var(--tracking-tight); overflow-wrap: anywhere; }
.tk-stat-hint { font-size: var(--text-2xs); color: var(--muted); line-height: 1.45; }

.tk-sources { font-size: var(--text-2xs); color: var(--muted); line-height: 1.7; }
.tk-sources > span:first-child { font-family: var(--font-mono); text-transform: uppercase; letter-spacing: var(--tracking-wide); }

.tk-tabs { align-self: flex-start; }
.tk-cards { display: grid; gap: var(--s3); }
.tk-card { padding: var(--s4); display: flex; flex-direction: column; gap: var(--s2); }
.tk-card .chip { align-self: flex-start; }
.tk-card-title { font-size: var(--text-sm); font-weight: var(--weight-semibold); color: var(--ink); }
.tk-card-meta { font-size: var(--text-2xs); color: var(--muted); font-family: var(--font-mono); }
.tk-card-body { font-size: var(--text-sm); color: var(--secondary); line-height: var(--lead-body); }
.tk-card-body p + p { margin-top: 6px; }

.tk-panel { border: 1px solid var(--stroke); border-radius: var(--r-lg); background: var(--bg-panel); padding: var(--s4); display: flex; flex-direction: column; gap: var(--s3); min-width: 0; }
.tk-two { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 300px), 1fr)); gap: var(--s4); align-items: start; }
.tk-label { font-size: var(--text-2xs); font-family: var(--font-mono); text-transform: uppercase; letter-spacing: var(--tracking-wide); color: var(--muted); }
.tk-range { display: flex; align-items: center; gap: var(--s3); }
.tk-range input[type="range"] { flex: 1; accent-color: var(--ink); }
.tk-range output { font-family: var(--font-mono); font-size: var(--text-sm); color: var(--ink); min-width: 7ch; text-align: right; }
.tk-mono { font-family: var(--font-mono); }
.tk-legend { display: flex; flex-wrap: wrap; gap: var(--s2) var(--s4); font-size: var(--text-xs); color: var(--secondary); }
.tk-legend span { display: inline-flex; align-items: center; gap: 6px; }
.tk-legend i { width: 10px; height: 10px; border-radius: 2px; display: inline-block; }
.tk-legend i.is-line { height: 2px; width: 14px; border-radius: 1px; }
`;
