import { useEffect, useMemo, useRef } from 'react';
import { MODALITY_LABELS, type TimelineItem } from '@/data/timeline';
import { formatContextWindow, formatCutoff, formatDatePrecise, formatParams, formatPrice } from '@/utils/timeline';
import { ArrowUpRightIcon, CloseIcon } from '@/components/shared/Icons';

interface Props {
    item: TimelineItem | null;
    /** The list used for previous/next navigation (usually the filtered list) */
    items: TimelineItem[];
    /** All entries of the current dataset, for resolving predecessor/successor */
    allItems: TimelineItem[];
    onClose: () => void;
    onNavigate: (item: TimelineItem) => void;
}

export function TimelineDetail({ item, items, allItems, onClose, onNavigate }: Props) {
    const dialogRef = useRef<HTMLDivElement>(null);
    const closeRef = useRef<HTMLButtonElement>(null);
    const returnFocus = useRef<HTMLElement | null>(null);

    const index = item ? items.findIndex((i) => i.id === item.id) : -1;
    const prev = index > 0 ? items[index - 1] : null;
    const next = index >= 0 && index < items.length - 1 ? items[index + 1] : null;

    const byName = useMemo(() => new Map(allItems.map((i) => [i.name, i])), [allItems]);

    // Focus management + keyboard shortcuts while open.
    useEffect(() => {
        if (!item) return;
        if (!returnFocus.current) returnFocus.current = document.activeElement as HTMLElement | null;
        closeRef.current?.focus({ preventScroll: true });
        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') { e.preventDefault(); onClose(); }
            if (e.key === 'ArrowLeft' && prev) { e.preventDefault(); onNavigate(prev); }
            if (e.key === 'ArrowRight' && next) { e.preventDefault(); onNavigate(next); }
            if (e.key === 'Tab' && dialogRef.current) {
                const f = dialogRef.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])');
                if (!f.length) return;
                const first = f[0], last = f[f.length - 1];
                if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
                else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
            }
        };
        window.addEventListener('keydown', onKey);
        return () => {
            window.removeEventListener('keydown', onKey);
            document.body.style.overflow = prevOverflow;
        };
    }, [item, prev, next, onClose, onNavigate]);

    // Return focus to whatever opened the dialog once it closes.
    useEffect(() => {
        if (item) return;
        returnFocus.current?.focus?.({ preventScroll: true });
        returnFocus.current = null;
    }, [item]);

    if (!item) return null;

    const date = formatDatePrecise(item.date, item.datePrecision);

    return (
        <div className="tl-dialog-backdrop" onClick={onClose}>
            <div
                ref={dialogRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby="tl-dialog-title"
                className="tl-dialog"
                onClick={(e) => e.stopPropagation()}
            >
                <header className="tl-dialog-head">
                    <div style={{ minWidth: 0 }}>
                        <p className="eyebrow">{item.org} · {date}</p>
                        <h2 id="tl-dialog-title" className="tl-dialog-title">{item.name}</h2>
                        <div className="tl-dialog-chips">
                            <span className="chip">{item.category}</span>
                            {item.kind === 'models' && <span className="chip chip-outline">{item.raw.model_type}</span>}
                            {item.kind === 'tools' && <span className="chip chip-outline">{item.raw.category}</span>}
                            {item.openSource != null && (
                                <span className="chip chip-outline">{item.openSource ? (item.kind === 'models' ? 'Open weights' : 'Open source') : 'Proprietary'}</span>
                            )}
                        </div>
                    </div>
                    <button ref={closeRef} type="button" className="icon-btn" onClick={onClose} aria-label="Close details">
                        <CloseIcon size={18} />
                    </button>
                </header>

                <div className="tl-dialog-body">
                    <p className="tl-dialog-desc">{item.raw.description}</p>

                    <Links item={item} />

                    {item.kind === 'models' && <ModelSpecs item={item} />}
                    {item.kind === 'papers' && <PaperSpecs item={item} />}
                    {item.kind === 'tools' && <ToolSpecs item={item} />}

                    <Lists item={item} />

                    {item.kind === 'models' && (item.raw.predecessor || item.raw.successor) && (
                        <div className="tl-lineage" aria-label="Lineage">
                            <p className="field-label">Lineage</p>
                            <div className="tl-lineage-row">
                                {item.raw.predecessor && <Relation name={item.raw.predecessor} target={byName.get(item.raw.predecessor)} onNavigate={onNavigate} />}
                                {item.raw.predecessor && <span className="muted" aria-hidden="true">→</span>}
                                <span className="chip chip-solid">{item.name}</span>
                                {item.raw.successor && <span className="muted" aria-hidden="true">→</span>}
                                {item.raw.successor && <Relation name={item.raw.successor} target={byName.get(item.raw.successor)} onNavigate={onNavigate} />}
                            </div>
                        </div>
                    )}
                </div>

                <footer className="tl-dialog-foot">
                    <button type="button" className="btn btn-ghost btn-sm" disabled={!prev} onClick={() => prev && onNavigate(prev)}>
                        ← {prev ? truncate(prev.name, 24) : 'Earlier'}
                    </button>
                    <span className="muted mono" style={{ fontSize: 'var(--text-2xs)' }}>
                        {index + 1} / {items.length} · <kbd>←</kbd> <kbd>→</kbd>
                    </span>
                    <button type="button" className="btn btn-ghost btn-sm" disabled={!next} onClick={() => next && onNavigate(next)}>
                        {next ? truncate(next.name, 24) : 'Later'} →
                    </button>
                </footer>
            </div>
            <style>{DIALOG_CSS}</style>
        </div>
    );
}

function truncate(s: string, n: number) {
    return s.length > n ? `${s.slice(0, n - 1)}…` : s;
}

function Relation({ name, target, onNavigate }: { name: string; target?: TimelineItem; onNavigate: (i: TimelineItem) => void }) {
    if (!target) return <span className="chip chip-outline" title="Not in this dataset">{name}</span>;
    return (
        <button type="button" className="chip tl-rel-btn" onClick={() => onNavigate(target)}>
            {name}
        </button>
    );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
    if (value == null || value === '' || value === '—') return null;
    return (
        <div className="tl-spec-row">
            <dt>{label}</dt>
            <dd>{value}</dd>
        </div>
    );
}

function ModelSpecs({ item }: { item: Extract<TimelineItem, { kind: 'models' }> }) {
    const m = item.raw;
    return (
        <dl className="tl-specs">
            <Row label="Released" value={formatDatePrecise(m.release_date)} />
            <Row label="Parameters" value={m.parameters != null ? formatParams(m.parameters, m.parameter_unit) : 'Not disclosed'} />
            <Row label="Context window" value={m.context_window_tokens ? formatContextWindow(m.context_window_tokens, 'long') : 'Not disclosed'} />
            <Row label="Works with" value={m.modalities.map((x) => MODALITY_LABELS[x]).join(', ')} />
            <Row label="Architecture" value={m.architecture} />
            <Row label="Licence" value={m.license} />
            <Row label="API price (per 1M tokens)" value={formatPrice(m.pricing_per_1m_tokens)} />
            <Row label="Knowledge cutoff" value={m.training_data_cutoff ? formatCutoff(m.training_data_cutoff) : null} />
            <Row label="Training tokens" value={m.training_tokens ? (m.training_tokens >= 1000 ? `${+(m.training_tokens / 1000).toFixed(1)} trillion` : `${m.training_tokens} billion`) : null} />
            <Row label="Family" value={m.model_family} />
            <Row label="Country" value={m.country} />
        </dl>
    );
}

function PaperSpecs({ item }: { item: Extract<TimelineItem, { kind: 'papers' }> }) {
    const p = item.raw;
    const authors = p.authors.length > 6 ? `${p.authors.slice(0, 6).join(', ')} et al.` : p.authors.join(', ');
    return (
        <dl className="tl-specs">
            <Row label="Authors" value={authors} />
            <Row label="Institution" value={p.institution} />
            <Row label="Published" value={formatDatePrecise(p.publication_date)} />
            <Row label="Venue" value={p.published_in} />
            <Row label="Topic" value={p.topic} />
            <Row label="Citations (approx.)" value={p.citations ? p.citations.toLocaleString('en-US') : null} />
        </dl>
    );
}

function ToolSpecs({ item }: { item: Extract<TimelineItem, { kind: 'tools' }> }) {
    const t = item.raw;
    return (
        <dl className="tl-specs">
            <Row label="Launched" value={formatDatePrecise(t.release_date, t.date_precision)} />
            <Row label="Made by" value={t.company} />
            <Row label="Kind of tool" value={t.category} />
            <Row label="Licence" value={t.license} />
        </dl>
    );
}

function Lists({ item }: { item: TimelineItem }) {
    const lists: Array<[string, string[]]> = [];
    if (item.kind === 'models') {
        if (item.raw.notable_features?.length) lists.push(['Notable features', item.raw.notable_features]);
        if (item.raw.use_cases?.length) lists.push(['Typical uses', item.raw.use_cases]);
    } else if (item.kind === 'papers') {
        if (item.raw.key_contributions?.length) lists.push(['Key contributions', item.raw.key_contributions]);
    } else if (item.raw.key_features?.length) {
        lists.push(['Key features', item.raw.key_features]);
    }
    if (!lists.length) return null;
    return (
        <div className="tl-lists">
            {lists.map(([title, entries]) => (
                <div key={title}>
                    <p className="field-label">{title}</p>
                    <ul>{entries.map((e, i) => <li key={i}>{e}</li>)}</ul>
                </div>
            ))}
        </div>
    );
}

function Links({ item }: { item: TimelineItem }) {
    const links: Array<[string, string]> = [];
    if (item.kind === 'models') {
        if (item.raw.official_model_link) links.push(['Official announcement', item.raw.official_model_link]);
        if (item.raw.paper_url) links.push(['Paper', item.raw.paper_url]);
        if (item.raw.huggingface_url) links.push(['Weights on Hugging Face', item.raw.huggingface_url]);
    } else if (item.kind === 'papers') {
        if (item.raw.paper_url) links.push(['Read the paper', item.raw.paper_url]);
        if (item.raw.code_url) links.push(['Code', item.raw.code_url]);
    } else if (item.raw.url) {
        links.push(['Website', item.raw.url]);
    }
    if (!links.length) return null;
    return (
        <div className="tl-links">
            {links.map(([label, href]) => (
                <a key={href} href={href} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm">
                    {label} <ArrowUpRightIcon size={14} />
                </a>
            ))}
        </div>
    );
}

const DIALOG_CSS = `
.tl-dialog-backdrop {
    position: fixed; inset: 0; z-index: var(--z-modal);
    background: var(--overlay);
    backdrop-filter: blur(3px);
    display: flex; align-items: center; justify-content: center;
    padding: var(--s4);
    animation: fade-up var(--dur-base) var(--ease-out);
}
.tl-dialog {
    width: 100%; max-width: 640px; max-height: min(86vh, 900px);
    display: flex; flex-direction: column;
    background: var(--popup-bg);
    border: 1px solid var(--popup-border);
    border-radius: var(--r-xl);
    box-shadow: var(--shadow-lift);
    overflow: hidden;
}
.tl-dialog-head { display: flex; justify-content: space-between; gap: var(--s4); padding: var(--s5) var(--s5) var(--s4); border-bottom: 1px solid var(--stroke); }
.tl-dialog-title { font-size: var(--text-xl); line-height: 1.2; margin: var(--s2) 0 var(--s3); letter-spacing: var(--tracking-snug); }
.tl-dialog-chips { display: flex; flex-wrap: wrap; gap: 6px; }
.tl-dialog-body { padding: var(--s5); overflow-y: auto; display: flex; flex-direction: column; gap: var(--s5); }
.tl-dialog-desc { color: var(--secondary); font-size: var(--text-sm); line-height: var(--lead-body); }
.tl-links { display: flex; flex-wrap: wrap; gap: var(--s2); }
.tl-specs { display: grid; grid-template-columns: 1fr 1fr; gap: 0 var(--s5); }
.tl-spec-row { display: flex; flex-direction: column; gap: 2px; padding: var(--s2) 0; border-bottom: 1px solid var(--stroke); }
.tl-spec-row dt { font-family: var(--font-mono); font-size: var(--text-2xs); color: var(--muted); text-transform: uppercase; letter-spacing: var(--tracking-wide); }
.tl-spec-row dd { font-size: var(--text-sm); color: var(--ink); }
.tl-lists { display: grid; grid-template-columns: 1fr 1fr; gap: var(--s5); }
.tl-lists ul { padding-left: 1.1em; color: var(--secondary); font-size: var(--text-sm); display: flex; flex-direction: column; gap: 4px; }
.tl-lineage-row { display: flex; flex-wrap: wrap; align-items: center; gap: var(--s2); }
.tl-rel-btn { cursor: pointer; }
.tl-rel-btn:hover { border-color: var(--ink); color: var(--ink); }
.tl-dialog-foot { display: flex; justify-content: space-between; align-items: center; gap: var(--s2); padding: var(--s3) var(--s4); border-top: 1px solid var(--stroke); background: var(--bg-sunken); }
@media (max-width: 599px) {
    .tl-dialog-backdrop { padding: 0; align-items: flex-end; }
    .tl-dialog { max-height: 92vh; border-radius: var(--r-xl) var(--r-xl) 0 0; }
    .tl-specs, .tl-lists { grid-template-columns: 1fr; }
    .tl-dialog-foot .mono { display: none; }
}
`;
