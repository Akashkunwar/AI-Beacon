// Illustrative sector explorer: drag the year to see how an editorial
// "exposure index" might evolve. Always labelled as a scenario.

import { useMemo, useState } from 'react';
import { SECTORS, SCENARIO_FIRST, SCENARIO_LAST, SCENARIO_NOW, sectorIndexAt, type SectorScenario } from '@/data/impactData';

export function ImpactExplorer() {
    const [year, setYear] = useState(SCENARIO_NOW);
    const [open, setOpen] = useState<string | null>(null);
    const projection = year > SCENARIO_NOW;

    const rows = useMemo(
        () => SECTORS.map((s) => ({ s, v: sectorIndexAt(s, year), base: sectorIndexAt(s, SCENARIO_FIRST) }))
            .sort((a, b) => b.v - a.v),
        [year],
    );
    const avg = rows.reduce((a, r) => a + r.v, 0) / rows.length;
    const ticks = Array.from({ length: SCENARIO_LAST - SCENARIO_FIRST + 1 }, (_, i) => SCENARIO_FIRST + i);

    return (
        <div className="card ie">
            <div className="ie-head">
                <div>
                    <p className="eyebrow">{projection ? 'Projection — illustrative' : 'Estimate — illustrative'}</p>
                    <p className="ie-year" aria-live="polite">{Math.floor(year)}</p>
                </div>
                <div className="ie-avg">
                    <span className="stat-label">Average across 18 sectors</span>
                    <span className="stat-value">{avg.toFixed(0)}<span className="ie-unit"> / 100</span></span>
                </div>
            </div>

            <div className="ie-slider">
                <input
                    type="range"
                    min={SCENARIO_FIRST}
                    max={SCENARIO_LAST}
                    step={0.25}
                    value={year}
                    onChange={(e) => setYear(+e.target.value)}
                    aria-label="Year"
                    aria-valuetext={`${Math.floor(year)}${projection ? ', projection' : ''}`}
                />
                <div className="ie-ticks" aria-hidden="true">
                    {ticks.map((t) => (
                        <button key={t} type="button" tabIndex={-1} className={`ie-tick ${t > SCENARIO_NOW ? 'is-proj' : ''} ${Math.floor(year) === t ? 'is-on' : ''}`} onClick={() => setYear(t)}>
                            {t}
                        </button>
                    ))}
                </div>
                <div className="ie-zones" aria-hidden="true">
                    <span style={{ flex: SCENARIO_NOW - SCENARIO_FIRST }}>Estimates from published evidence</span>
                    <span style={{ flex: SCENARIO_LAST - SCENARIO_NOW }} className="is-proj">Scenario projection</span>
                </div>
            </div>

            <ul className="ie-list" aria-label={`Illustrative exposure index by sector in ${Math.floor(year)}`}>
                {rows.map(({ s, v, base }) => (
                    <SectorRow key={s.id} s={s} v={v} base={base} projection={projection} open={open === s.id} onToggle={() => setOpen(open === s.id ? null : s.id)} />
                ))}
            </ul>
            <p className="ie-foot">
                Index = our editorial estimate of the share of a sector’s typical tasks that AI available in that year could
                meaningfully assist or automate (0–100). It follows the patterns in the studies above but is not a
                measurement, and it says nothing about how many jobs will exist. The thin mark shows 2022 for comparison.
            </p>
            <style>{EXPLORER_CSS}</style>
        </div>
    );
}

function SectorRow({ s, v, base, projection, open, onToggle }: { s: SectorScenario; v: number; base: number; projection: boolean; open: boolean; onToggle: () => void }) {
    return (
        <li className="ie-row">
            <button type="button" className="ie-row-btn" onClick={onToggle} aria-expanded={open}>
                <span className="ie-label">{s.label}</span>
                <span className="ie-bar-track" aria-hidden="true">
                    <span className={`ie-bar ${projection ? 'is-proj' : ''}`} style={{ width: `${v}%` }} />
                    <span className="ie-base" style={{ left: `${base}%` }} />
                </span>
                <span className="ie-val">{v.toFixed(0)}</span>
                <span className="ie-chev" aria-hidden="true">{open ? '−' : '+'}</span>
            </button>
            {open && (
                <div className="ie-detail">
                    <p><strong>What AI does here:</strong> {s.aiDoes}</p>
                    <p><strong>What stays human:</strong> {s.staysHuman}</p>
                    <p className="ie-tags">{s.examples.map((e) => <span key={e} className="chip">{e}</span>)}</p>
                </div>
            )}
        </li>
    );
}

const EXPLORER_CSS = `
.ie { padding: var(--s5); display: flex; flex-direction: column; gap: var(--s4); }
.ie-head { display: flex; justify-content: space-between; align-items: flex-end; gap: var(--s4); flex-wrap: wrap; }
.ie-year { font-size: var(--text-3xl); font-weight: var(--weight-semibold); letter-spacing: var(--tracking-tight); color: var(--ink); line-height: 1; margin-top: var(--s2); }
.ie-avg { text-align: right; display: flex; flex-direction: column; }
.ie-unit { font-size: var(--text-sm); color: var(--muted); }
.ie-slider input { width: 100%; }
.ie-ticks { display: flex; justify-content: space-between; margin-top: 4px; }
.ie-tick { font-family: var(--font-mono); font-size: var(--text-2xs); color: var(--muted); padding: 2px 4px; border-radius: var(--r-xs); }
.ie-tick.is-proj { font-style: italic; }
.ie-tick.is-on { color: var(--ink); font-weight: var(--weight-semibold); }
.ie-zones { display: flex; gap: 4px; margin-top: var(--s2); font-size: 10.5px; color: var(--muted); }
.ie-zones span { border-top: 2px solid var(--ink); padding-top: 3px; }
.ie-zones .is-proj { border-top: 2px dashed var(--muted); }
.ie-list { list-style: none; display: flex; flex-direction: column; }
.ie-row { border-bottom: 1px solid var(--stroke); }
.ie-row-btn { width: 100%; display: grid; grid-template-columns: 200px 1fr 3ch 1.2em; gap: var(--s3); align-items: center; padding: 9px 0; text-align: left; }
.ie-row-btn:hover .ie-label { color: var(--ink); }
.ie-label { font-size: var(--text-sm); color: var(--primary); }
.ie-bar-track { position: relative; height: 10px; background: var(--bg-raised); border-radius: 0 4px 4px 0; }
.ie-bar { position: absolute; left: 0; top: 0; bottom: 0; background: var(--viz-1); border-radius: 0 4px 4px 0; transition: width var(--dur-base) var(--ease-out); }
.ie-bar.is-proj { background: repeating-linear-gradient(135deg, var(--viz-1) 0 5px, color-mix(in srgb, var(--viz-1) 55%, transparent) 5px 9px); }
.ie-base { position: absolute; top: -3px; bottom: -3px; width: 2px; background: var(--ink); opacity: 0.55; }
.ie-val { font-family: var(--font-mono); font-size: var(--text-xs); color: var(--ink); text-align: right; font-variant-numeric: tabular-nums; }
.ie-chev { color: var(--muted); text-align: center; }
.ie-detail { padding: 0 0 var(--s3) 0; display: flex; flex-direction: column; gap: 6px; font-size: var(--text-xs); color: var(--secondary); max-width: 80ch; }
.ie-detail strong { color: var(--ink); }
.ie-tags { display: flex; flex-wrap: wrap; gap: 6px; }
.ie-foot { font-size: var(--text-xs); color: var(--muted); border-top: 1px solid var(--stroke); padding-top: var(--s3); }
@media (max-width: 639px) {
    .ie-row-btn { grid-template-columns: 1fr 3ch 1.2em; }
    .ie-bar-track { grid-column: 1 / -1; grid-row: 2; }
    .ie-avg { text-align: left; }
}
`;
