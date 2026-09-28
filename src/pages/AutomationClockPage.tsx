// src/pages/AutomationClockPage.tsx
// Module 05 — AI Impact Index. What published research says about AI and
// work, followed by a clearly-labelled illustrative sector scenario.

import { SEO } from '@/components/common/SEO';
import { SITE_CONFIG } from '@/config/site';
import { getModule } from '@/config/modules';
import { Nav } from '@/components/shared/Nav';
import { Footer } from '@/components/shared/Footer';
import { PageHeader, SectionHeader } from '@/components/shared/PageHeader';
import { Reveal } from '@/components/shared/Reveal';
import { LearningGuide } from '@/components/educational/LearningGuide';
import { ImpactExplorer } from '@/components/automation/ImpactExplorer';
import { EVIDENCE, EVIDENCE_GROUPS, EXPOSURE_DEFINITIONS, IMPACT_LAST_UPDATED, MILESTONES } from '@/data/impactData';
import { formatDate } from '@/utils/timeline';

export function AutomationClockPage() {
    const mod = getModule('impact');

    return (
        <div className="page">
            <SEO
                title="AI & Jobs — what the evidence says"
                description="How exposed is work to AI? Key findings from the ILO, IMF, WEF, Stanford and others, why estimates differ, and an illustrative sector-by-sector scenario from 2022 to 2030."
                canonical={`${SITE_CONFIG.baseUrl}/automation-clock`}
                structuredData={{
                    '@context': 'https://schema.org',
                    '@type': 'Article',
                    headline: 'AI and jobs: what the evidence says',
                    dateModified: IMPACT_LAST_UPDATED,
                    author: { '@type': 'Organization', name: 'AI Beacon contributors' },
                }}
            />
            <Nav />
            <main id="main" className="page-main">
                <PageHeader
                    eyebrow={`Module ${mod.num} · ${mod.title}`}
                    title="How is AI changing work?"
                    lede="Headlines swing between “AI will take every job” and “nothing is happening”. Here is what the major studies actually measured, why their numbers differ, and a scenario explorer to build intuition about which kinds of work are most affected."
                    stats={[
                        { label: 'Jobs exposed to GenAI', value: '25%', hint: 'ILO, 2025 — global' },
                        { label: 'Employment exposed to AI', value: '≈40%', hint: 'IMF, 2024 — global' },
                        { label: 'Net jobs by 2030', value: '+78M', hint: 'WEF, 2025 — employer survey' },
                    ]}
                />

                <section className="section">
                    <div className="container">
                        <Reveal>
                            <LearningGuide
                                title="Four ideas that make the numbers make sense"
                                intro="Most confusion about AI and jobs comes from mixing up different kinds of claims."
                                items={[
                                    { label: 'Exposure ≠ replacement', text: 'A job is “exposed” when AI can do or speed up some of its tasks. Many exposed jobs change rather than disappear.' },
                                    { label: 'Tasks ≠ jobs', text: 'Jobs bundle many tasks — technical, social, physical and accountable. Automating one task rarely removes the whole job.' },
                                    { label: 'Projection ≠ measurement', text: 'Forecasts rest on assumptions about adoption and new jobs. Measured effects so far are narrower than many forecasts.' },
                                    { label: 'Capability ≠ adoption', text: 'Cost, reliability, regulation, training and redesigning workflows all slow real deployment.' },
                                ]}
                                note={`Evidence reviewed ${formatDate(IMPACT_LAST_UPDATED, 'long')}. Every figure links to its source.`}
                            />
                        </Reveal>
                    </div>
                </section>

                {EVIDENCE_GROUPS.map((g) => {
                    const items = EVIDENCE.filter((e) => e.kind === g.kind);
                    return (
                        <section key={g.kind} className="section" aria-labelledby={`ev-${g.kind}`}>
                            <div className="container">
                                <SectionHeader id={`ev-${g.kind}`} eyebrow="What the evidence says" title={g.title} description={g.intro} />
                                <div className="ev-grid">
                                    {items.map((e) => (
                                        <article key={e.id} className="card ev-card">
                                            <p className="ev-figure">{e.figure}</p>
                                            <p className="ev-claim">{e.claim}</p>
                                            <p className="ev-detail">{e.detail}</p>
                                            <a className="ev-source" href={e.url} target="_blank" rel="noopener noreferrer">
                                                <span className="ev-org">{e.source} · {e.year}</span>
                                                <span className="ev-title">{e.title} ↗</span>
                                            </a>
                                        </article>
                                    ))}
                                </div>
                                {g.kind === 'exposure' && (
                                    <div style={{ marginTop: 'var(--s5)' }}>
                                        <h3 className="ev-sub">Why do exposure estimates range from 25% to 80%?</h3>
                                        <p className="section-desc" style={{ marginBottom: 'var(--s3)', maxWidth: '70ch' }}>
                                            They count different things. None of them is “wrong” — always check what a headline number measures.
                                        </p>
                                        <div className="table-wrap">
                                            <table className="data-table">
                                                <thead><tr><th scope="col">Study</th><th scope="col">Headline</th><th scope="col">What was counted</th><th scope="col">Scope</th></tr></thead>
                                                <tbody>
                                                    {EXPOSURE_DEFINITIONS.map((d) => (
                                                        <tr key={d.study}><td className="strong">{d.study}</td><td style={{ whiteSpace: 'nowrap' }}>{d.figure}</td><td>{d.counts}</td><td>{d.scope}</td></tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </section>
                    );
                })}

                <section className="section" aria-labelledby="explorer-heading">
                    <div className="container">
                        <SectionHeader
                            id="explorer-heading"
                            eyebrow="Scenario explorer · illustrative"
                            title="Which kinds of work are most exposed?"
                            description="Drag through time to see an editorial estimate of how much of each sector’s typical work AI can assist with. Tap a sector to see what AI does there and what stays human. After 2026 the bars are hatched: those years are a scenario, not data."
                        />
                        <ImpactExplorer />
                    </div>
                </section>

                <section className="section" aria-labelledby="milestones-heading">
                    <div className="container">
                        <SectionHeader id="milestones-heading" eyebrow="Context" title="Milestones that shaped the debate" />
                        <ol className="ms-list">
                            {MILESTONES.map((m) => (
                                <li key={m.year} className={`ms-item ${m.projection ? 'is-proj' : ''}`}>
                                    <span className="ms-year">{m.year}{m.projection && <span className="chip chip-outline" style={{ marginLeft: 8 }}>outlook</span>}</span>
                                    <ul>{m.items.map((it) => <li key={it}>{it}</li>)}</ul>
                                </li>
                            ))}
                        </ol>
                    </div>
                </section>

                <section className="section" aria-labelledby="method-heading">
                    <div className="container">
                        <SectionHeader id="method-heading" eyebrow="Methodology" title="How this page was built" />
                        <div className="card card-pad prose" style={{ maxWidth: '80ch' }}>
                            <p>
                                <strong>Evidence cards</strong> quote figures exactly as published by each organisation, with a link to the report.
                                Where a study was later updated, the card notes it.
                            </p>
                            <p>
                                <strong>The scenario explorer</strong> is an editorial index maintained by AI Beacon contributors. It encodes the
                                broad pattern the studies agree on — office, software and customer-facing text work are most exposed; hands-on
                                physical work least — and how model capabilities improved between 2022 and 2026. Values after 2026 are a
                                smooth continuation for illustration only. It should not be cited as a statistic.
                            </p>
                            <p>
                                Something outdated or wrong? The data lives in <code>src/data/impactData.ts</code> — see the data guide on GitHub
                                for how to propose a change with a source.
                            </p>
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
            <style>{`
                .ev-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 320px), 1fr)); gap: var(--s4); }
                .ev-card { padding: var(--s5); display: flex; flex-direction: column; gap: var(--s2); }
                .ev-figure { font-size: var(--text-2xl); font-weight: var(--weight-semibold); letter-spacing: var(--tracking-tight); color: var(--ink); line-height: 1.1; }
                .ev-claim { font-size: var(--text-sm); color: var(--ink); font-weight: var(--weight-medium); }
                .ev-detail { font-size: var(--text-xs); color: var(--secondary); line-height: var(--lead-body); flex: 1; }
                .ev-source { display: flex; flex-direction: column; gap: 2px; padding-top: var(--s3); margin-top: var(--s2); border-top: 1px solid var(--stroke); }
                .ev-org { font-family: var(--font-mono); font-size: var(--text-2xs); color: var(--muted); text-transform: uppercase; letter-spacing: var(--tracking-wide); }
                .ev-title { font-size: var(--text-xs); color: var(--ink); text-decoration: underline; text-decoration-color: var(--stroke-dark); text-underline-offset: 3px; }
                .ev-source:hover .ev-title { text-decoration-color: var(--ink); }
                .ev-sub { font-size: var(--text-md); margin-bottom: var(--s2); }
                .ms-list { list-style: none; display: flex; flex-direction: column; }
                .ms-item { display: grid; grid-template-columns: 160px 1fr; gap: var(--s4); padding: var(--s4) 0; border-top: 1px solid var(--stroke); }
                .ms-item.is-proj { opacity: 0.8; }
                .ms-year { font-family: var(--font-mono); font-size: var(--text-md); color: var(--ink); font-weight: var(--weight-medium); display: flex; align-items: flex-start; }
                .ms-item ul { padding-left: 1.1em; display: flex; flex-direction: column; gap: 4px; color: var(--secondary); font-size: var(--text-sm); }
                @media (max-width: 639px) { .ms-item { grid-template-columns: 1fr; gap: var(--s2); } }
            `}</style>
        </div>
    );
}
