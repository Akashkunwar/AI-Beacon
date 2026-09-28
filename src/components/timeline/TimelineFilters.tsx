import { useEffect, useMemo, useState } from 'react';
import { categoriesFor, KIND_LABELS, MODALITY_LABELS, type Modality, type TimelineItem, type TimelineKind } from '@/data/timeline';
import { SearchIcon } from '@/components/shared/Icons';

export interface TimelineFilterState {
    q: string;
    org: string;
    category: string;
    modality: Modality | '';
    license: 'all' | 'open' | 'closed';
    from: number | null;
    to: number | null;
}

interface Props {
    kind: TimelineKind;
    items: TimelineItem[];
    filters: TimelineFilterState;
    resultCount: number;
    onChange: (patch: Partial<TimelineFilterState>) => void;
    onClear: () => void;
}

const MODALITY_FILTERS: Modality[] = ['text', 'image', 'audio', 'video', 'code'];

export function TimelineFilters({ kind, items, filters, resultCount, onChange, onClear }: Props) {
    // Debounce the search box so typing stays smooth.
    const [q, setQ] = useState(filters.q);
    useEffect(() => setQ(filters.q), [filters.q]);
    useEffect(() => {
        if (q === filters.q) return;
        const t = setTimeout(() => onChange({ q }), 180);
        return () => clearTimeout(t);
    }, [q]); // eslint-disable-line react-hooks/exhaustive-deps

    const orgs = useMemo(() => {
        const counts = new Map<string, number>();
        for (const it of items) counts.set(it.org, (counts.get(it.org) ?? 0) + 1);
        return [...counts.entries()].sort((a, b) => a[0].localeCompare(b[0]));
    }, [items]);

    const categoryCounts = useMemo(() => {
        const counts = new Map<string, number>();
        for (const it of items) counts.set(it.category, (counts.get(it.category) ?? 0) + 1);
        return counts;
    }, [items]);

    const years = useMemo(() => {
        if (!items.length) return [];
        const a = parseInt(items[0].date.slice(0, 4), 10);
        const b = parseInt(items[items.length - 1].date.slice(0, 4), 10);
        return Array.from({ length: b - a + 1 }, (_, i) => a + i);
    }, [items]);

    const active =
        !!filters.q || !!filters.org || !!filters.category || !!filters.modality ||
        filters.license !== 'all' || filters.from != null || filters.to != null;

    const labels = KIND_LABELS[kind];

    return (
        <section aria-label="Filter the timeline" className="tl-filters">
            <div className="tl-filters-row">
                <label className="tl-search">
                    <span className="sr-only">Search {labels.lower}</span>
                    <SearchIcon size={16} />
                    <input
                        className="input"
                        type="search"
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        placeholder={kind === 'papers' ? 'Search titles, authors, topics…' : `Search ${labels.lower}, companies…`}
                    />
                </label>

                <label className="tl-field">
                    <span className="field-label">{labels.org}</span>
                    <select className="select" value={filters.org} onChange={(e) => onChange({ org: e.target.value })}>
                        <option value="">All ({orgs.length})</option>
                        {orgs.map(([o, n]) => <option key={o} value={o}>{o} ({n})</option>)}
                    </select>
                </label>

                <label className="tl-field">
                    <span className="field-label">{kind === 'papers' ? 'Topic' : 'Type'}</span>
                    <select className="select" value={filters.category} onChange={(e) => onChange({ category: e.target.value })}>
                        <option value="">All types</option>
                        {categoriesFor(kind).filter((c) => categoryCounts.has(c)).map((c) => (
                            <option key={c} value={c}>{c} ({categoryCounts.get(c)})</option>
                        ))}
                    </select>
                </label>

                <div className="tl-field tl-years">
                    <span className="field-label">Years</span>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                        <select className="select" aria-label="From year" value={filters.from ?? ''} onChange={(e) => onChange({ from: e.target.value ? +e.target.value : null })}>
                            <option value="">From</option>
                            {years.map((y) => <option key={y} value={y}>{y}</option>)}
                        </select>
                        <span className="muted" aria-hidden="true">–</span>
                        <select className="select" aria-label="To year" value={filters.to ?? ''} onChange={(e) => onChange({ to: e.target.value ? +e.target.value : null })}>
                            <option value="">To</option>
                            {years.map((y) => <option key={y} value={y}>{y}</option>)}
                        </select>
                    </div>
                </div>
            </div>

            <div className="tl-filters-row tl-filters-row-2">
                {kind === 'models' && (
                    <div className="tl-pills" role="group" aria-label="Filter by what the model works with">
                        <span className="field-label" style={{ margin: 0 }}>Works with</span>
                        {MODALITY_FILTERS.map((m) => (
                            <button
                                key={m}
                                type="button"
                                className="pill"
                                aria-pressed={filters.modality === m}
                                onClick={() => onChange({ modality: filters.modality === m ? '' : m })}
                            >
                                {MODALITY_LABELS[m]}
                            </button>
                        ))}
                    </div>
                )}

                {kind !== 'papers' && (
                    <div className="segmented" role="group" aria-label="Filter by licence">
                        {(['all', 'open', 'closed'] as const).map((l) => (
                            <button key={l} type="button" aria-pressed={filters.license === l} onClick={() => onChange({ license: l })}>
                                {l === 'all' ? 'All licences' : l === 'open' ? 'Open weights / source' : 'Proprietary'}
                            </button>
                        ))}
                    </div>
                )}

                <p className="tl-result" aria-live="polite">
                    <strong>{resultCount}</strong> of {items.length} {labels.lower}
                    {active && (
                        <button type="button" className="text-link" onClick={onClear} style={{ marginLeft: 'var(--s3)' }}>
                            Clear filters
                        </button>
                    )}
                </p>
            </div>
            <style>{FILTERS_CSS}</style>
        </section>
    );
}

const FILTERS_CSS = `
.tl-filters { display: flex; flex-direction: column; gap: var(--s3); }
.tl-filters-row { display: flex; flex-wrap: wrap; gap: var(--s3); align-items: flex-end; }
.tl-filters-row-2 { align-items: center; }
.tl-search { position: relative; flex: 1 1 280px; display: flex; align-items: center; }
.tl-search svg { position: absolute; left: 12px; color: var(--muted); pointer-events: none; }
.tl-search .input { padding-left: 36px; min-height: 42px; }
.tl-field { display: flex; flex-direction: column; min-width: 180px; flex: 0 1 220px; }
.tl-field .select { min-height: 42px; }
.tl-years { flex: 0 0 auto; min-width: 0; }
.tl-years .select { width: 96px; }
.tl-pills { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; }
.tl-result { margin-left: auto; font-size: var(--text-xs); color: var(--secondary); }
.tl-result strong { color: var(--ink); font-family: var(--font-mono); }
@media (max-width: 719px) {
    .tl-field { flex: 1 1 45%; min-width: 0; }
    .tl-years { flex: 1 1 100%; }
    .tl-years .select { width: 100%; }
    .tl-result { margin-left: 0; width: 100%; }
}
`;
