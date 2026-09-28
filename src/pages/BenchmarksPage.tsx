// src/pages/BenchmarksPage.tsx
// Module 04 — Benchmarks. A sourced snapshot of what labs report on the tests
// that matter today, how fast those tests saturate, and what a score means.

import { useState } from 'react';
import { SEO } from '@/components/common/SEO';
import { SITE_CONFIG } from '@/config/site';
import { getModule } from '@/config/modules';
import { Nav } from '@/components/shared/Nav';
import { Footer } from '@/components/shared/Footer';
import { PageHeader, SectionHeader } from '@/components/shared/PageHeader';
import { Reveal } from '@/components/shared/Reveal';
import { LearningGuide } from '@/components/educational/LearningGuide';
import { BenchmarkLeaderboard } from '@/components/benchmarks/BenchmarkLeaderboard';
import { BenchmarkProgress } from '@/components/benchmarks/BenchmarkProgress';
import { ScoreVsPrice } from '@/components/benchmarks/ScoreVsPrice';
import { ModelCompare } from '@/components/benchmarks/ModelCompare';
import { BenchmarkGlossary } from '@/components/benchmarks/BenchmarkGlossary';
import { BenchmarkSources } from '@/components/benchmarks/BenchmarkSources';
import { BENCHMARK_MODELS, LAST_UPDATED, METRICS, METRIC_BY_ID, NEWEST_MODELS, type MetricId } from '@/data/benchmarkData';
import { formatContextWindow, formatDate } from '@/utils/timeline';

export function BenchmarksPage() {
    const mod = getModule('benchmarks');
    const [metric, setMetric] = useState<MetricId>('gpqa');
    const [openOnly, setOpenOnly] = useState(false);
    const m = METRIC_BY_ID[metric];

    return (
        <div className="page">
            <SEO
                title="AI Benchmarks — GPQA, SWE-bench, HLE and more"
                description="Compare leading AI models on GPQA Diamond, SWE-bench Verified, Humanity's Last Exam, AIME and MMLU, with price and every score linked to the lab's own report. Learn what each benchmark can and cannot tell you."
                canonical={`${SITE_CONFIG.baseUrl}/benchmarks`}
                structuredData={{
                    '@context': 'https://schema.org',
                    '@type': 'Dataset',
                    name: 'AI Beacon benchmark snapshot',
                    description: 'Lab-reported benchmark scores and API prices for selected AI models, with source links.',
                    dateModified: LAST_UPDATED,
                    license: 'https://opensource.org/licenses/MIT',
                }}
            />
            <Nav />
            <main id="main" className="page-main">
                <PageHeader
                    eyebrow={`Module ${mod.num} · ${mod.title}`}
                    title="How good are AI models, really?"
                    lede="Benchmarks are standardised tests. This page shows what labs actually reported on the tests that still matter, how quickly models have caught up with them, and what a score does — and does not — tell you."
                    stats={[
                        { label: 'Models scored', value: BENCHMARK_MODELS.length },
                        { label: 'Benchmarks', value: METRICS.length },
                        { label: 'Snapshot', value: formatDate(LAST_UPDATED, 'short') },
                    ]}
                />

                <section className="section">
                    <div className="container">
                        <Reveal>
                            <LearningGuide
                                title="Read scores like a scientist"
                                intro="A benchmark is a fixed set of tasks with an automatic grader. It is useful for comparing models under the same conditions — and easy to over-interpret."
                                items={[
                                    { label: 'Compare like with like', text: 'Scores depend on settings: tools or no tools, how long the model may “think”, and how many attempts it gets. Check the notes.' },
                                    { label: 'Small gaps are noise', text: 'GPQA has 198 questions and AIME only 30. A 1–3 point difference is usually not meaningful.' },
                                    { label: 'Tests wear out', text: 'Once top models score 90%+, a benchmark stops separating them — so labs move to harder tests. That is why newer models report different ones.' },
                                    { label: 'Scores ≠ usefulness', text: 'Real work also depends on reliability, speed, cost, tool use and safety — none of which a single number captures.' },
                                ]}
                                note={`Snapshot as of ${formatDate(LAST_UPDATED, 'long')}. Only lab-reported numbers are shown; blank means not reported, never zero.`}
                            />
                        </Reveal>
                    </div>
                </section>

                {/* One filter row scopes the leaderboard and both charts below it. */}
                <div className="bm-filter-bar">
                    <div className="container bm-filter-inner">
                        <div className="segmented" role="tablist" aria-label="Choose a benchmark">
                            {METRICS.map((x) => (
                                <button key={x.id} type="button" role="tab" aria-selected={metric === x.id} onClick={() => setMetric(x.id)}>
                                    {x.name}
                                </button>
                            ))}
                        </div>
                        <label className="bm-toggle">
                            <input type="checkbox" checked={openOnly} onChange={(e) => setOpenOnly(e.target.checked)} />
                            Open-weights models only
                        </label>
                    </div>
                </div>

                <section className="section" aria-labelledby="lb-heading">
                    <div className="container">
                        <SectionHeader
                            id="lb-heading"
                            eyebrow="Leaderboard"
                            title={`${m.name}: who scores highest?`}
                            description={<>{m.measures} <span className="muted">{m.baseline}.</span></>}
                        />
                        <BenchmarkLeaderboard metric={metric} openOnly={openOnly} />
                    </div>
                </section>

                <section className="section" aria-labelledby="progress-heading">
                    <div className="container">
                        <SectionHeader
                            id="progress-heading"
                            eyebrow="Progress"
                            title="How fast do benchmarks get “solved”?"
                            description={`Each dot is a model’s reported ${m.name} score at its release date; the line tracks the best score so far. ${m.statusNote}`}
                        />
                        <div className="card card-pad"><BenchmarkProgress metric={metric} openOnly={openOnly} /></div>
                    </div>
                </section>

                <section className="section" aria-labelledby="value-heading">
                    <div className="container">
                        <SectionHeader
                            id="value-heading"
                            eyebrow="Value"
                            title="Score versus price"
                            description="Models on the line are the best value: no cheaper model in this snapshot scores higher. Open-weights models can also be self-hosted, which can be cheaper or more expensive than the official API."
                        />
                        <div className="card card-pad"><ScoreVsPrice metric={metric} openOnly={openOnly} /></div>
                    </div>
                </section>

                <section className="section" aria-labelledby="compare-heading">
                    <div className="container">
                        <SectionHeader
                            id="compare-heading"
                            eyebrow="Head to head"
                            title="Compare two models"
                            description="Pick any two models to see every benchmark they reported, side by side."
                        />
                        <ModelCompare />
                    </div>
                </section>

                <section className="section" aria-labelledby="newest-heading">
                    <div className="container">
                        <SectionHeader
                            id="newest-heading"
                            eyebrow="The newest models"
                            title="Why the latest releases are harder to rank"
                            description="Most models released since mid-2026 report newer benchmark suites (SWE-bench Pro, Terminal-Bench 4.0, ARC-AGI-3…) instead of the ones above, so their numbers are not directly comparable. Here is what they cost and what they report."
                        />
                        <div className="table-wrap">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th scope="col">Model</th>
                                        <th scope="col">Released</th>
                                        <th scope="col" className="num">Price in / out</th>
                                        <th scope="col" className="num">Context</th>
                                        <th scope="col">Headline benchmarks reported</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {NEWEST_MODELS.map((x) => (
                                        <tr key={x.name}>
                                            <td>
                                                <a className="text-link strong" href={x.url} target="_blank" rel="noopener noreferrer">{x.name}</a>
                                                <div className="muted" style={{ fontSize: 'var(--text-2xs)' }}>{x.provider}{x.openWeights ? ' · open weights' : ''}</div>
                                            </td>
                                            <td style={{ whiteSpace: 'nowrap' }}>{formatDate(x.releaseDate, 'long')}</td>
                                            <td className="num">{x.price ? `$${x.price.input} / $${x.price.output}` : '—'}</td>
                                            <td className="num">{formatContextWindow(x.contextWindow)}</td>
                                            <td>{x.reports}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </section>

                <section className="section" aria-labelledby="glossary-heading">
                    <div className="container">
                        <SectionHeader
                            id="glossary-heading"
                            eyebrow="Glossary"
                            title="What each benchmark measures"
                        />
                        <BenchmarkGlossary />
                    </div>
                </section>

                <section className="section" aria-labelledby="sources-heading">
                    <div className="container">
                        <SectionHeader id="sources-heading" eyebrow="Sources" title="Methodology and sources" />
                        <BenchmarkSources />
                    </div>
                </section>
            </main>
            <Footer />
            <style>{`
                .bm-filter-bar {
                    position: sticky; top: var(--nav-height); z-index: var(--z-raised);
                    background: color-mix(in srgb, var(--bg) 88%, transparent);
                    backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px);
                    border-block: 1px solid var(--stroke);
                    padding-block: var(--s3);
                }
                .bm-filter-inner { display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: var(--s3); }
                .bm-toggle { display: inline-flex; align-items: center; gap: var(--s2); font-size: var(--text-xs); color: var(--secondary); cursor: pointer; }
                .bm-toggle input { width: 16px; height: 16px; accent-color: var(--ink); }
            `}</style>
        </div>
    );
}
