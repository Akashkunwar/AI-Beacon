// src/components/training/Step01DataCollection.tsx
// Module 02 — Step 01: Data Collection & Curation
// Greyscale UI shell; --viz-* tokens for chart segments only.
// All spacing/type/colour from src/tokens.css.

import { useState, useRef, useEffect, useCallback, memo } from 'react';
import { ErrorBoundary } from '@/components/shared/ErrorBoundary';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface StepProps {
    stepNumber: number;
    totalSteps: number;
    onNext: () => void;
    onPrev: () => void;
}

// ─── Data ────────────────────────────────────────────────────────────────────

interface DataSource {
    label: string;
    percentage: number;
    color: string;
    id: string;
}

const DATA_SOURCES: DataSource[] = [
    { id: 'web', label: 'Web (Common Crawl)', percentage: 67, color: 'var(--ink)' },
    { id: 'books', label: 'Books', percentage: 15, color: 'var(--grey-700)' },
    { id: 'code', label: 'Code (GitHub)', percentage: 8, color: 'var(--secondary)' },
    { id: 'wiki', label: 'Wikipedia', percentage: 4, color: 'var(--muted)' },
    { id: 'papers', label: 'Scientific Papers', percentage: 3, color: 'var(--stroke-dark)' },
    { id: 'other', label: 'Other Curated', percentage: 3, color: 'var(--grey-300)' },
];

interface QualityCard {
    title: string;
    usedBy: string;
    description: string;
    tag: string;
}

const QUALITY_CARDS: QualityCard[] = [
    {
        title: 'Quantity First',
        usedBy: 'GPT-3, early LLaMA',
        description: 'Maximize tokens. Minimal filtering.',
        tag: 'Traditional',
    },
    {
        title: 'Quality Filtering',
        usedBy: 'RefinedWeb (Falcon), C4',
        description: 'Aggressive dedup and perplexity-based filtering.',
        tag: 'Improved',
    },
    {
        title: 'Textbook Quality',
        usedBy: 'Phi-1, Phi-2 (Microsoft)',
        description:
            'Synthetic "textbook-quality" data. 6B tokens outperform models trained on 300B+ noisy tokens.',
        tag: 'Alternative',
    },
    {
        title: 'Synthetic Data',
        usedBy: 'Gemini, Yi, Mistral',
        description: 'Generate training data using existing LLMs.',
        tag: 'Modern',
    },
];

const RAW_LINES = [
    { id: 'a', text: 'The transformer architecture was introduced in 2017.', isDuplicate: false },
    { id: 'b', text: 'Attention is all you need — Vaswani et al., 2017.', isDuplicate: false },
    { id: 'c', text: 'The transformer architecture was introduced in 2017.', isDuplicate: true },
    { id: 'd', text: 'Language models predict the next token in a sequence.', isDuplicate: false },
    { id: 'e', text: 'Attention is all you need — Vaswani et al., 2017.', isDuplicate: true },
    { id: 'f', text: 'BERT uses bidirectional context for pre-training.', isDuplicate: false },
    { id: 'g', text: 'Language models predict the next token in a sequence.', isDuplicate: true },
    { id: 'h', text: 'GPT models use autoregressive left-to-right prediction.', isDuplicate: false },
];

const DEDUPED_LINES = RAW_LINES.filter(l => !l.isDuplicate);

const STAT_CHIPS = [
    { label: 'CommonCrawl: 3.3T tokens raw' },
    { label: 'After dedup: ~900B tokens' },
    { label: '73% reduction' },
];

// ─── Section 1 — Overview ────────────────────────────────────────────────────

function OverviewSection() {
    return (
        <section aria-labelledby="s1-heading" style={{ marginBottom: 'var(--s7)' }}>
            <p
                style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 'var(--text-xs)',
                    color: 'var(--muted)',
                    textTransform: 'uppercase',
                    letterSpacing: 'var(--tracking-wider)',
                    marginBottom: 'var(--s3)',
                }}
            >
                STEP 01 — DATA COLLECTION
            </p>
            <h1
                id="s1-heading"
                style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: 'var(--text-xl)',
                    fontWeight: 'var(--weight-semibold)',
                    color: 'var(--ink)',
                    lineHeight: 'var(--lead-tight)',
                    letterSpacing: 'var(--tracking-snug)',
                    marginBottom: 'var(--s4)',
                }}
            >
                Before a single weight is updated, a model needs data.
            </h1>
            <p
                style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: 'var(--text-sm)',
                    fontWeight: 'var(--weight-light)',
                    color: 'var(--secondary)',
                    lineHeight: 'var(--lead-body)',
                    maxWidth: '68ch',
                }}
            >
                Modern LLMs are trained on trillions of tokens scraped from the public internet
                (Common Crawl), digitised book corpora, open-source code repositories like GitHub,
                and structured encyclopaedic sources such as Wikipedia. Each source brings distinct
                vocabulary, style, and factual density — and the relative mix has an outsized effect
                on what the model ultimately learns.
            </p>
        </section>
    );
}

// ─── Section 2 — Data Mix Bar ────────────────────────────────────────────────

interface TooltipState {
    visible: boolean;
    x: number;
    y: number;
    source: DataSource | null;
}

const DataMixBar = memo(function DataMixBar() {
    const [tooltip, setTooltip] = useState<TooltipState>({
        visible: false,
        x: 0,
        y: 0,
        source: null,
    });
    const barRef = useRef<HTMLDivElement>(null);

    const handleMouseEnter = useCallback(
        (e: React.MouseEvent<HTMLDivElement>, source: DataSource) => {
            const rect = barRef.current?.getBoundingClientRect();
            if (!rect) return;
            setTooltip({
                visible: true,
                x: e.clientX - rect.left,
                y: -60,
                source,
            });
        },
        [],
    );

    const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        const rect = barRef.current?.getBoundingClientRect();
        if (!rect) return;
        setTooltip(prev => ({ ...prev, x: e.clientX - rect.left }));
    }, []);

    const handleMouseLeave = useCallback(() => {
        setTooltip(prev => ({ ...prev, visible: false }));
    }, []);

    return (
        <section aria-labelledby="s2-heading" style={{ marginBottom: 'var(--s7)' }}>
            <h2
                id="s2-heading"
                style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: 'var(--text-md)',
                    fontWeight: 'var(--weight-medium)',
                    color: 'var(--ink)',
                    marginBottom: 'var(--s5)',
                }}
            >
                Typical LLM Training Data Mix
            </h2>

            {/* Stacked bar */}
            <div
                ref={barRef}
                role="img"
                aria-label="Stacked bar chart showing LLM training data composition"
                style={{ position: 'relative', marginBottom: 'var(--s4)' }}
            >
                <div
                    style={{
                        display: 'flex',
                        width: '100%',
                        height: '48px',
                        borderRadius: 'var(--r-sm)',
                        overflow: 'hidden',
                    }}
                >
                    {DATA_SOURCES.map((src, i) => {
                        const isFirst = i === 0;
                        const isLast = i === DATA_SOURCES.length - 1;
                        return (
                            <div
                                key={src.id}
                                title={`${src.label}: ${src.percentage}%`}
                                onMouseEnter={e => handleMouseEnter(e, src)}
                                onMouseMove={handleMouseMove}
                                onMouseLeave={handleMouseLeave}
                                style={{
                                    width: `${src.percentage}%`,
                                    background: src.color,
                                    cursor: 'default',
                                    borderRadius: isFirst
                                        ? 'var(--r-sm) 0 0 var(--r-sm)'
                                        : isLast
                                            ? '0 var(--r-sm) var(--r-sm) 0'
                                            : '0',
                                    transition: 'opacity var(--dur-fast) var(--ease-out)',
                                    flexShrink: 0,
                                }}
                                onMouseOver={e =>
                                    ((e.currentTarget as HTMLDivElement).style.opacity = '0.85')
                                }
                                onFocus={() => { }}
                                onBlur={() => { }}
                            />
                        );
                    })}
                </div>

                {/* Tooltip */}
                {tooltip.visible && tooltip.source && (
                    <div
                        aria-hidden="true"
                        style={{
                            position: 'absolute',
                            left: `min(${tooltip.x}px, calc(100% - 160px))`,
                            top: '-68px',
                            background: 'var(--bg-panel)',
                            border: '1px solid var(--stroke-dark)',
                            borderRadius: 'var(--r-md)',
                            padding: 'var(--s3) var(--s4)',
                            fontFamily: 'var(--font-mono)',
                            fontSize: 'var(--text-xs)',
                            color: 'var(--primary)',
                            pointerEvents: 'none',
                            whiteSpace: 'nowrap',
                            zIndex: 'var(--z-raised)',
                            boxShadow: 'var(--shadow-lift)',
                        }}
                    >
                        <span style={{ fontWeight: 'var(--weight-medium)' }}>
                            {tooltip.source.label}
                        </span>
                        &nbsp;—&nbsp;{tooltip.source.percentage}%
                    </div>
                )}
            </div>

            {/* Legend */}
            <div
                style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 'var(--s5)',
                    alignItems: 'center',
                }}
                aria-label="Data source legend"
            >
                {DATA_SOURCES.map(src => (
                    <div
                        key={src.id}
                        style={{ display: 'flex', alignItems: 'center', gap: 'var(--s2)' }}
                    >
                        <div
                            aria-hidden="true"
                            style={{
                                width: '12px',
                                height: '12px',
                                background: src.color,
                                borderRadius: 'var(--r-xs)',
                                flexShrink: 0,
                            }}
                        />
                        <span
                            style={{
                                fontFamily: 'var(--font-mono)',
                                fontSize: 'var(--text-xs)',
                                color: 'var(--secondary)',
                            }}
                        >
                            {src.label} — {src.percentage}%
                        </span>
                    </div>
                ))}
            </div>
        </section>
    );
});

// ─── Section 3 — Quality Cards ───────────────────────────────────────────────

const QualityCardsSection = memo(function QualityCardsSection() {
    return (
        <section aria-labelledby="s3-heading" style={{ marginBottom: 'var(--s7)' }}>
            <h2
                id="s3-heading"
                style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: 'var(--text-md)',
                    fontWeight: 'var(--weight-medium)',
                    color: 'var(--ink)',
                    marginBottom: 'var(--s5)',
                }}
            >
                Data Quality Approaches
            </h2>
            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                    gap: 'var(--s4)',
                }}
            >
                {QUALITY_CARDS.map(card => (
                    <article
                        key={card.title}
                        style={{
                            background: 'var(--bg-panel)',
                            borderRadius: 'var(--r-lg)',
                            padding: 'var(--s5)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 'var(--s3)',
                        }}
                    >
                        {/* Tag */}
                        <span
                            style={{
                                display: 'inline-block',
                                alignSelf: 'flex-start',
                                fontFamily: 'var(--font-mono)',
                                fontSize: 'var(--text-2xs)',
                                color: 'var(--muted)',
                                background: 'var(--bg-raised)',
                                borderRadius: 'var(--r-pill)',
                                padding: '2px 8px',
                            }}
                        >
                            {card.tag}
                        </span>

                        {/* Title */}
                        <h3
                            style={{
                                fontFamily: 'var(--font-sans)',
                                fontSize: 'var(--text-sm)',
                                fontWeight: 'var(--weight-semibold)',
                                color: 'var(--ink)',
                                margin: 0,
                            }}
                        >
                            {card.title}
                        </h3>

                        {/* Used by */}
                        <p
                            style={{
                                fontFamily: 'var(--font-mono)',
                                fontSize: 'var(--text-xs)',
                                color: 'var(--muted)',
                                margin: 0,
                            }}
                        >
                            Used by: {card.usedBy}
                        </p>

                        {/* Description */}
                        <p
                            style={{
                                fontFamily: 'var(--font-sans)',
                                fontSize: 'var(--text-sm)',
                                fontWeight: 'var(--weight-light)',
                                color: 'var(--secondary)',
                                lineHeight: 'var(--lead-body)',
                                margin: 0,
                            }}
                        >
                            {card.description}
                        </p>
                    </article>
                ))}
            </div>
        </section>
    );
});

// ─── Section 4 — Deduplication Demo ─────────────────────────────────────────

interface LineItem {
    id: string;
    text: string;
    isDuplicate: boolean;
}

interface DedupState {
    ran: boolean;
    animating: boolean;
    fadingIds: Set<string>;
    rightLines: LineItem[];
}

function DeduplicationSection({ prefersReducedMotion }: { prefersReducedMotion: boolean }) {
    const [state, setState] = useState<DedupState>({
        ran: false,
        animating: false,
        fadingIds: new Set(),
        rightLines: [],
    });
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Cleanup on unmount
    useEffect(() => () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); }, []);

    const runDedup = useCallback(() => {
        if (state.animating || state.ran) return;

        const dupIds = new Set(RAW_LINES.filter(l => l.isDuplicate).map(l => l.id));

        if (prefersReducedMotion) {
            setState({ ran: true, animating: false, fadingIds: new Set(), rightLines: DEDUPED_LINES });
            return;
        }

        setState(prev => ({ ...prev, animating: true, fadingIds: dupIds }));

        timeoutRef.current = setTimeout(() => {
            setState({ ran: true, animating: false, fadingIds: new Set(), rightLines: DEDUPED_LINES });
        }, 500);
    }, [state.animating, state.ran, prefersReducedMotion]);

    const reset = useCallback(() => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        setState({ ran: false, animating: false, fadingIds: new Set(), rightLines: [] });
    }, []);

    const lineStyle = (line: LineItem): React.CSSProperties => ({
        fontFamily: 'var(--font-mono)',
        fontSize: 'var(--text-xs)',
        color: line.isDuplicate ? 'var(--muted)' : 'var(--secondary)',
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--s3)',
        padding: 'var(--s2) var(--s3)',
        background: line.isDuplicate ? 'var(--bg-raised)' : 'transparent',
        borderRadius: 'var(--r-sm)',
        transition: state.fadingIds.has(line.id) ? `opacity 400ms var(--ease-out)` : 'none',
        opacity: state.fadingIds.has(line.id) ? 0 : 1,
    });

    return (
        <section aria-labelledby="s4-heading" style={{ marginBottom: 'var(--s7)' }}>
            <h2
                id="s4-heading"
                style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: 'var(--text-md)',
                    fontWeight: 'var(--weight-medium)',
                    color: 'var(--ink)',
                    marginBottom: 'var(--s5)',
                }}
            >
                Deduplication Demo
            </h2>

            {/* Two-panel layout */}
            <div
                className="dedup-grid"
                style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr auto 1fr',
                    gap: 'var(--s5)',
                    alignItems: 'start',
                    marginBottom: 'var(--s5)',
                }}
            >
                {/* Left: raw data */}
                <div
                    style={{
                        background: 'var(--bg-panel)',
                        borderRadius: 'var(--r-lg)',
                        padding: 'var(--s4)',
                    }}
                >
                    <p
                        style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: 'var(--text-xs)',
                            color: 'var(--muted)',
                            textTransform: 'uppercase',
                            letterSpacing: 'var(--tracking-wide)',
                            marginBottom: 'var(--s3)',
                        }}
                    >
                        Raw data — contains duplicates
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s2)' }}>
                        {RAW_LINES.map(line => (
                            <div key={line.id} style={lineStyle(line)}>
                                <span style={{ flex: 1, lineHeight: 'var(--lead-body)' }}>
                                    {line.text}
                                </span>
                                {line.isDuplicate && (
                                    <span
                                        aria-label="duplicate"
                                        style={{
                                            fontFamily: 'var(--font-mono)',
                                            fontSize: 'var(--text-2xs)',
                                            color: 'var(--muted)',
                                            background: 'var(--bg-raised)',
                                            border: '1px solid var(--stroke)',
                                            borderRadius: 'var(--r-sm)',
                                            padding: '1px 6px',
                                            flexShrink: 0,
                                        }}
                                    >
                                        DUPLICATE
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Centre: button */}
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 'var(--s3)',
                        paddingTop: 'var(--s7)',
                    }}
                >
                    {!state.ran ? (
                        <button
                            id="dedup-run-btn"
                            className="btn btn-secondary"
                            onClick={runDedup}
                            disabled={state.animating}
                            aria-label="Run deduplication"
                        >
                            Run Deduplication →
                        </button>
                    ) : (
                        <button
                            id="dedup-reset-btn"
                            className="btn btn-ghost"
                            onClick={reset}
                            aria-label="Reset deduplication demo"
                        >
                            ↺ Reset
                        </button>
                    )}
                </div>

                {/* Right: deduped data */}
                <div
                    style={{
                        background: 'var(--bg-panel)',
                        borderRadius: 'var(--r-lg)',
                        padding: 'var(--s4)',
                        minHeight: '200px',
                    }}
                >
                    <p
                        style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: 'var(--text-xs)',
                            color: 'var(--muted)',
                            textTransform: 'uppercase',
                            letterSpacing: 'var(--tracking-wide)',
                            marginBottom: 'var(--s3)',
                        }}
                    >
                        After deduplication
                    </p>
                    {state.rightLines.length === 0 ? (
                        <p
                            style={{
                                fontFamily: 'var(--font-mono)',
                                fontSize: 'var(--text-xs)',
                                color: 'var(--stroke-dark)',
                                fontStyle: 'italic',
                            }}
                        >
                            Run deduplication to see output…
                        </p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s2)' }}>
                            {state.rightLines.map(line => (
                                <div
                                    key={line.id}
                                    style={{
                                        fontFamily: 'var(--font-mono)',
                                        fontSize: 'var(--text-xs)',
                                        color: 'var(--secondary)',
                                        padding: 'var(--s2) var(--s3)',
                                        borderRadius: 'var(--r-sm)',
                                        lineHeight: 'var(--lead-body)',
                                        animation: prefersReducedMotion
                                            ? 'none'
                                            : 'fadeInUp 300ms var(--ease-out) forwards',
                                    }}
                                >
                                    {line.text}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Stat chips */}
            <div
                style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 'var(--s3)',
                    alignItems: 'center',
                }}
                aria-label="Deduplication statistics"
            >
                {STAT_CHIPS.map(chip => (
                    <span
                        key={chip.label}
                        style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: 'var(--text-xs)',
                            color: 'var(--secondary)',
                            background: 'var(--bg-panel)',
                            border: '1px solid var(--stroke)',
                            borderRadius: 'var(--r-pill)',
                            padding: 'var(--s2) var(--s5)',
                        }}
                    >
                        {chip.label}
                    </span>
                ))}
            </div>

            {/* Keyframe for right-panel fade-in */}
            <style>{`
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(6px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                @media (prefers-reduced-motion: reduce) {
                    @keyframes fadeInUp {
                        from { opacity: 1; transform: none; }
                        to   { opacity: 1; transform: none; }
                    }
                }
                #dedup-run-btn:focus-visible,
                #dedup-reset-btn:focus-visible {
                    outline: 2px solid var(--stroke-dark);
                    outline-offset: 2px;
                }
                /* Mobile: stack the dedup grid */
                @media (max-width: 719px) {
                    .dedup-grid {
                        grid-template-columns: 1fr !important;
                    }
                }
            `}</style>
        </section>
    );
}

// ─── Root export ─────────────────────────────────────────────────────────────

export function Step01DataCollection({ stepNumber, totalSteps, onNext, onPrev }: StepProps) {
    // Detect prefers-reduced-motion without Framer Motion (this component owns its own motion)
    const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
    useEffect(() => {
        const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
        setPrefersReducedMotion(mq.matches);
        const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
        mq.addEventListener('change', handler);
        return () => mq.removeEventListener('change', handler);
    }, []);

    return (
        <ErrorBoundary>
            <article
                aria-label={`Step ${stepNumber} of ${totalSteps}: Data Collection & Curation`}
                style={{ flex: 1, display: 'flex', flexDirection: 'column' }}
            >
                <OverviewSection />
                <DataMixBar />
                <QualityCardsSection />
                <DeduplicationSection prefersReducedMotion={prefersReducedMotion} />

                {/* Spacer to push footer nav down when content is short */}
                <div style={{ flex: 1 }} />

                {/* Inline nav handled by Training.tsx — just ensure onNext/onPrev are wired */}
                {/* These props are consumed by the parent Training.tsx footer */}
                <input type="hidden" data-onnext={String(typeof onNext)} data-onprev={String(typeof onPrev)} />
            </article>
        </ErrorBoundary>
    );
}
