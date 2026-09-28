import { useEffect, useMemo, useState } from 'react';
import { KIND_LABELS, MODALITY_LABELS, type TimelineItem, type TimelineKind } from '@/data/timeline';
import { formatContextWindow, formatDate, formatParams } from '@/utils/timeline';

interface Props {
    kind: TimelineKind;
    items: TimelineItem[];
    total: number;
    selectedId: number | null;
    onSelect: (item: TimelineItem) => void;
    onClearFilters: () => void;
}

type SortKey = 'date' | 'name' | 'org' | 'category' | 'size' | 'context' | 'citations';

interface Column {
    key: SortKey | null;
    label: string;
    numeric?: boolean;
    hideOnMobile?: boolean;
    render: (it: TimelineItem) => React.ReactNode;
}

const PAGE = 60;

function paramsValue(it: TimelineItem): number {
    if (it.kind !== 'models' || it.raw.parameters == null) return -1;
    return it.raw.parameter_unit === 'million' ? it.raw.parameters / 1000 : it.raw.parameters;
}

function columnsFor(kind: TimelineKind): Column[] {
    const date: Column = { key: 'date', label: 'Date', render: (it) => (it.datePrecision === 'month' ? formatDate(it.date, 'short') : formatDate(it.date, 'mono')) };
    const name: Column = { key: 'name', label: kind === 'papers' ? 'Title' : 'Name', render: (it) => <span className="strong">{it.name}</span> };
    const org: Column = { key: 'org', label: KIND_LABELS[kind].org, render: (it) => it.org };
    const cat: Column = { key: 'category', label: kind === 'papers' ? 'Topic' : 'Type', hideOnMobile: true, render: (it) => it.category };

    if (kind === 'models') {
        return [
            date, name, org, cat,
            { key: 'size', label: 'Params', numeric: true, hideOnMobile: true, render: (it) => it.kind === 'models' ? formatParams(it.raw.parameters, it.raw.parameter_unit) : '—' },
            { key: 'context', label: 'Context', numeric: true, hideOnMobile: true, render: (it) => it.kind === 'models' ? formatContextWindow(it.raw.context_window_tokens) : '—' },
            { key: null, label: 'Works with', hideOnMobile: true, render: (it) => it.kind === 'models' ? it.raw.modalities.map((m) => MODALITY_LABELS[m]).join(', ') : '' },
            { key: null, label: 'Weights', hideOnMobile: true, render: (it) => it.openSource ? 'Open' : 'Closed' },
        ];
    }
    if (kind === 'papers') {
        return [
            date, name, org, cat,
            { key: null, label: 'Venue', hideOnMobile: true, render: (it) => it.kind === 'papers' ? it.raw.published_in : '' },
            { key: 'citations', label: 'Citations ≈', numeric: true, hideOnMobile: true, render: (it) => it.kind === 'papers' && it.raw.citations ? it.raw.citations.toLocaleString('en-US') : '—' },
        ];
    }
    return [
        date, name, org, cat,
        { key: null, label: 'Kind of tool', hideOnMobile: true, render: (it) => it.kind === 'tools' ? it.raw.category : '' },
        { key: null, label: 'Source', hideOnMobile: true, render: (it) => it.openSource ? 'Open' : 'Closed' },
    ];
}

export function TimelineTable({ kind, items, total, selectedId, onSelect, onClearFilters }: Props) {
    const [sort, setSort] = useState<{ key: SortKey; dir: 1 | -1 }>({ key: 'date', dir: -1 });
    const [limit, setLimit] = useState(PAGE);
    const columns = columnsFor(kind);

    // Collapse back to the first page whenever the result set changes.
    useEffect(() => setLimit(PAGE), [items]);

    const sorted = useMemo(() => {
        const val = (it: TimelineItem): string | number => {
            switch (sort.key) {
                case 'date': return it.date;
                case 'name': return it.name.toLowerCase();
                case 'org': return it.org.toLowerCase();
                case 'category': return it.category;
                case 'size': return paramsValue(it);
                case 'context': return it.kind === 'models' ? it.raw.context_window_tokens ?? -1 : -1;
                case 'citations': return it.kind === 'papers' ? it.raw.citations ?? -1 : -1;
            }
        };
        return [...items].sort((a, b) => {
            const va = val(a), vb = val(b);
            if (va < vb) return -1 * sort.dir;
            if (va > vb) return 1 * sort.dir;
            return b.date.localeCompare(a.date);
        });
    }, [items, sort]);

    const visible = sorted.slice(0, limit);
    const toggleSort = (key: SortKey) => {
        setSort((s) => (s.key === key ? { key, dir: s.dir === 1 ? -1 : 1 } : { key, dir: key === 'date' || key === 'size' || key === 'context' || key === 'citations' ? -1 : 1 }));
    };

    return (
        <section aria-labelledby="tl-table-heading" style={{ marginTop: 'var(--s5)' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'baseline', gap: 'var(--s2)', marginBottom: 'var(--s3)' }}>
                <h2 id="tl-table-heading" className="section-title" style={{ fontSize: 'var(--text-lg)' }}>
                    All {KIND_LABELS[kind].lower}
                </h2>
                <p className="muted" style={{ fontSize: 'var(--text-xs)' }}>Click a column to sort · click a row for details</p>
            </div>

            <div className="table-wrap">
                <table className="data-table tl-table">
                    <thead>
                        <tr>
                            {columns.map((c) => (
                                <th
                                    key={c.label}
                                    scope="col"
                                    className={`${c.numeric ? 'num' : ''} ${c.hideOnMobile ? 'hide-mobile' : ''}`}
                                    aria-sort={c.key && sort.key === c.key ? (sort.dir === 1 ? 'ascending' : 'descending') : undefined}
                                >
                                    {c.key ? (
                                        <button type="button" className="tl-sort" onClick={() => toggleSort(c.key!)}>
                                            {c.label}
                                            <span aria-hidden="true" className="tl-sort-ind">{sort.key === c.key ? (sort.dir === 1 ? '↑' : '↓') : '↕'}</span>
                                        </button>
                                    ) : c.label}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {visible.length === 0 ? (
                            <tr>
                                <td colSpan={columns.length} style={{ padding: 'var(--s6)', textAlign: 'center' }}>
                                    No entries match these filters.{' '}
                                    <button type="button" className="text-link" onClick={onClearFilters}>Clear filters</button>
                                </td>
                            </tr>
                        ) : visible.map((it) => (
                            <tr
                                key={it.id}
                                className={`is-clickable ${selectedId === it.id ? 'is-active' : ''}`}
                                onClick={() => onSelect(it)}
                            >
                                {columns.map((c, i) => (
                                    <td key={c.label} className={`${c.numeric ? 'num' : ''} ${c.hideOnMobile ? 'hide-mobile' : ''} ${i === 0 ? 'mono nowrap' : ''}`}>
                                        {i === 1 ? (
                                            <button type="button" className="tl-row-btn" onClick={(e) => { e.stopPropagation(); onSelect(it); }}>
                                                {c.render(it)}
                                            </button>
                                        ) : c.render(it)}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 'var(--s3)', marginTop: 'var(--s4)', fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>
                <span>Showing {visible.length} of {sorted.length}{sorted.length < total ? ` (filtered from ${total})` : ''}</span>
                {sorted.length > limit && (
                    <button type="button" className="btn btn-secondary btn-sm" onClick={() => setLimit((l) => l + PAGE * 2)}>
                        Show more
                    </button>
                )}
            </div>
            <style>{`
                .tl-table td.nowrap { white-space: nowrap; }
                .tl-table td.mono { font-family: var(--font-mono); font-size: var(--text-2xs); color: var(--muted); }
                .tl-sort { display: inline-flex; align-items: center; gap: 4px; font: inherit; color: inherit; text-transform: inherit; letter-spacing: inherit; }
                .tl-sort:hover { color: var(--ink); }
                .tl-sort-ind { opacity: 0.6; }
                .tl-row-btn { text-align: left; font: inherit; color: inherit; }
                .tl-row-btn:hover .strong { text-decoration: underline; text-underline-offset: 3px; }
                @media (max-width: 719px) { .tl-table .hide-mobile { display: none; } }
            `}</style>
        </section>
    );
}
