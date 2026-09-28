import type { ReactNode } from 'react';

export interface PageStat {
    label: string;
    value: ReactNode;
    hint?: string;
}

interface PageHeaderProps {
    /** Small uppercase label above the title, e.g. "Module 04 · Benchmarks" */
    eyebrow?: ReactNode;
    title: ReactNode;
    /** One or two sentences: what this page is and why it matters */
    lede?: ReactNode;
    /** Key numbers shown on the right on desktop, below on mobile */
    stats?: PageStat[];
    /** Extra content under the lede (buttons, tabs…) */
    children?: ReactNode;
    /** Use the wide container (for full-bleed tools like the timeline) */
    wide?: boolean;
}

/** Consistent page heading used by every module page. */
export function PageHeader({ eyebrow, title, lede, stats, children, wide }: PageHeaderProps) {
    return (
        <header className="page-header">
            <div className={`${wide ? 'container-wide' : 'container'} page-header-inner`}>
                <div className="page-header-copy">
                    {eyebrow && (
                        <p className="eyebrow">
                            <span className="eyebrow-dot" aria-hidden="true" />
                            {eyebrow}
                        </p>
                    )}
                    <h1 className="page-title">{title}</h1>
                    {lede && <p className="page-lede">{lede}</p>}
                    {children}
                </div>
                {stats && stats.length > 0 && (
                    <dl className="page-header-meta">
                        {stats.map((s) => (
                            <div key={s.label} className="stat">
                                <dt className="stat-label">{s.label}</dt>
                                <dd className="stat-value">{s.value}</dd>
                                {s.hint && <dd className="stat-hint">{s.hint}</dd>}
                            </div>
                        ))}
                    </dl>
                )}
            </div>
        </header>
    );
}

interface SectionHeaderProps {
    id?: string;
    eyebrow?: ReactNode;
    title: ReactNode;
    description?: ReactNode;
    /** Right-aligned element (e.g. a toggle) */
    aside?: ReactNode;
}

/** Heading block for a section inside a page. */
export function SectionHeader({ id, eyebrow, title, description, aside }: SectionHeaderProps) {
    return (
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: 'var(--s3) var(--s5)', marginBottom: 'var(--s5)' }}>
            <div className="section-head" style={{ marginBottom: 0 }}>
                {eyebrow && <p className="eyebrow">{eyebrow}</p>}
                <h2 id={id} className="section-title">{title}</h2>
                {description && <p className="section-desc">{description}</p>}
            </div>
            {aside}
        </div>
    );
}
