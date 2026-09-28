// src/pages/Timeline.tsx
// Module 01 — AI Timeline. Three datasets (models, papers, tools) shown on a
// zoomable horizontal timeline plus a sortable table. Filters live in the URL
// so any view can be shared, and ?item=<slug> opens an entry directly.

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Nav } from '@/components/shared/Nav';
import { Footer } from '@/components/shared/Footer';
import { SEO } from '@/components/common/SEO';
import { PageHeader } from '@/components/shared/PageHeader';
import { TimelineFilters, type TimelineFilterState } from '@/components/timeline/TimelineFilters';
import { TimelineCanvas } from '@/components/timeline/TimelineCanvas';
import { TimelineTable } from '@/components/timeline/TimelineTable';
import { TimelineDetail } from '@/components/timeline/TimelineDetail';
import { loadTimeline, KIND_LABELS, type TimelineDataset, type TimelineItem, type TimelineKind, type Modality } from '@/data/timeline';
import { DATASET_META } from '@/data/datasetMeta';
import { getModule } from '@/config/modules';
import { SITE_CONFIG } from '@/config/site';
import { formatDate } from '@/utils/timeline';

const KINDS: TimelineKind[] = ['models', 'papers', 'tools'];
const COUNTS: Record<TimelineKind, number> = {
    models: DATASET_META.models,
    papers: DATASET_META.papers,
    tools: DATASET_META.tools,
};

function readFilters(params: URLSearchParams): TimelineFilterState {
    const num = (k: string) => {
        const v = parseInt(params.get(k) ?? '', 10);
        return Number.isFinite(v) ? v : null;
    };
    const lic = params.get('license');
    return {
        q: params.get('q') ?? '',
        org: params.get('org') ?? '',
        category: params.get('type') ?? '',
        modality: (params.get('modality') ?? '') as Modality | '',
        license: lic === 'open' || lic === 'closed' ? lic : 'all',
        from: num('from'),
        to: num('to'),
    };
}

function applyFilters(items: TimelineItem[], f: TimelineFilterState): TimelineItem[] {
    const q = f.q.trim().toLowerCase();
    return items.filter((it) => {
        if (q && !q.split(/\s+/).every((w) => it.haystack.includes(w))) return false;
        if (f.org && it.org !== f.org) return false;
        if (f.category && it.category !== f.category) return false;
        if (f.modality && it.kind === 'models' && !it.raw.modalities.includes(f.modality)) return false;
        if (f.license === 'open' && it.openSource === false) return false;
        if (f.license === 'closed' && it.openSource !== false) return false;
        const y = parseInt(it.date.slice(0, 4), 10);
        if (f.from != null && y < f.from) return false;
        if (f.to != null && y > f.to) return false;
        return true;
    });
}

export function Timeline() {
    const mod = getModule('timeline');
    const [params, setParams] = useSearchParams();
    const tabParam = params.get('tab');
    const kind: TimelineKind = KINDS.includes(tabParam as TimelineKind) ? (tabParam as TimelineKind) : 'models';
    const filters = readFilters(params);
    const itemSlug = params.get('item');

    const [dataset, setDataset] = useState<TimelineDataset | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        setDataset((d) => (d?.kind === kind ? d : null));
        setError(null);
        loadTimeline(kind)
            .then((d) => { if (!cancelled) setDataset(d); })
            .catch(() => { if (!cancelled) setError('The dataset could not be loaded. Check your connection and try again.'); });
        return () => { cancelled = true; };
    }, [kind]);

    const items = useMemo(() => (dataset?.kind === kind ? dataset.items : []), [dataset, kind]);
    const filterKey = params.toString();
    // `filters` is rebuilt from the URL on every render; `filterKey` is its stable identity.
    const filtered = useMemo(() => applyFilters(items, filters), [items, filterKey]);

    const selected = useMemo(() => (itemSlug ? items.find((i) => i.slug === itemSlug) ?? null : null), [items, itemSlug]);

    // ── URL helpers ───────────────────────────────────────────────────────────
    const update = useCallback((patch: Record<string, string | null>, replace = true) => {
        setParams((prev) => {
            const next = new URLSearchParams(prev);
            for (const [k, v] of Object.entries(patch)) {
                if (v === null || v === '') next.delete(k);
                else next.set(k, v);
            }
            return next;
        }, { replace });
    }, [setParams]);

    const setFilters = useCallback((f: Partial<TimelineFilterState>) => {
        const patch: Record<string, string | null> = {};
        if ('q' in f) patch.q = f.q ?? null;
        if ('org' in f) patch.org = f.org ?? null;
        if ('category' in f) patch.type = f.category ?? null;
        if ('modality' in f) patch.modality = f.modality ?? null;
        if ('license' in f) patch.license = f.license === 'all' ? null : f.license ?? null;
        if ('from' in f) patch.from = f.from != null ? String(f.from) : null;
        if ('to' in f) patch.to = f.to != null ? String(f.to) : null;
        update(patch);
    }, [update]);

    const clearFilters = useCallback(() => {
        update({ q: null, org: null, type: null, modality: null, license: null, from: null, to: null });
    }, [update]);

    const setKind = (k: TimelineKind) => {
        setParams(new URLSearchParams(k === 'models' ? {} : { tab: k }), { replace: false });
    };

    const openItem = useCallback((it: TimelineItem | null) => update({ item: it ? it.slug : null }, false), [update]);

    // ── Derived header stats ──────────────────────────────────────────────────
    const orgCount = useMemo(() => new Set(filtered.map((i) => i.org)).size, [filtered]);
    const span = useMemo(() => {
        if (!filtered.length) return '—';
        return `${filtered[0].date.slice(0, 4)}–${filtered[filtered.length - 1].date.slice(0, 4)}`;
    }, [filtered]);
    const labels = KIND_LABELS[kind];

    return (
        <div className="page">
            <SEO
                title="AI Timeline — models, papers and tools"
                description={`Interactive timeline of ${DATASET_META.models} AI models, ${DATASET_META.papers} research papers and ${DATASET_META.tools} AI tools. Filter by company, type and year; every entry links to its source.`}
                canonical={`${SITE_CONFIG.baseUrl}/timeline`}
                structuredData={{
                    '@context': 'https://schema.org',
                    '@type': 'Dataset',
                    name: 'AI Beacon timeline of AI models, research papers and tools',
                    description: 'Curated, source-linked records of notable AI model releases, research papers and AI tools.',
                    dateModified: DATASET_META.lastUpdated,
                    license: 'https://opensource.org/licenses/MIT',
                    creator: { '@type': 'Organization', name: 'AI Beacon contributors' },
                }}
            />
            <Nav />
            <main id="main" className="page-main">
                <PageHeader
                    wide
                    eyebrow={`Module ${mod.num} · ${mod.title}`}
                    title="Every model, paper and tool — in order"
                    lede={
                        <>
                            Explore how modern AI unfolded, from the 2012 deep-learning breakthrough to this month’s releases.
                            Scroll the timeline or search the table, then open any entry for its specs, licence and source links.
                        </>
                    }
                    stats={[
                        { label: `${labels.plural} shown`, value: dataset ? filtered.length : '…' },
                        { label: kind === 'papers' ? 'Institutions' : 'Companies', value: dataset ? orgCount : '…' },
                        { label: 'Years', value: dataset ? span : '…' },
                        { label: 'Last reviewed', value: formatDate(dataset?.lastUpdated ?? DATASET_META.lastUpdated, 'short') },
                    ]}
                >
                    <div className="segmented" role="tablist" aria-label="Choose a dataset" style={{ marginTop: 'var(--s2)', alignSelf: 'flex-start' }}>
                        {KINDS.map((k) => (
                            <button
                                key={k}
                                type="button"
                                role="tab"
                                aria-selected={k === kind}
                                onClick={() => setKind(k)}
                            >
                                {KIND_LABELS[k].plural} <span className="muted" style={{ marginLeft: 6, fontFamily: 'var(--font-mono)' }}>{COUNTS[k]}</span>
                            </button>
                        ))}
                    </div>
                </PageHeader>

                <div className="container-wide" style={{ paddingTop: 'var(--s5)' }}>
                    <TimelineFilters
                        kind={kind}
                        items={items}
                        filters={filters}
                        resultCount={filtered.length}
                        onChange={setFilters}
                        onClear={clearFilters}
                    />
                </div>

                {error ? (
                    <div className="container-wide" style={{ paddingBlock: 'var(--s6)' }}>
                        <div className="note" role="alert"><strong>Couldn’t load data.</strong> {error}</div>
                    </div>
                ) : !dataset ? (
                    <div className="container-wide" style={{ paddingBlock: 'var(--s5)' }} aria-busy="true">
                        <div className="skeleton" style={{ height: 420, borderRadius: 'var(--r-lg)' }} />
                    </div>
                ) : (
                    <>
                        <TimelineCanvas
                            kind={kind}
                            items={filtered}
                            selectedId={selected?.id ?? null}
                            onSelect={openItem}
                        />
                        <div className="container-wide" style={{ paddingBottom: 'var(--s7)' }}>
                            <TimelineTable
                                kind={kind}
                                items={filtered}
                                total={items.length}
                                selectedId={selected?.id ?? null}
                                onSelect={openItem}
                                onClearFilters={clearFilters}
                            />
                        </div>
                    </>
                )}
            </main>
            <Footer />

            <TimelineDetail
                item={selected}
                items={filtered.length && selected && filtered.includes(selected) ? filtered : items}
                allItems={items}
                onClose={() => openItem(null)}
                onNavigate={openItem}
            />
        </div>
    );
}
