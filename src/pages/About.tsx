// src/pages/About.tsx
// What AI Beacon is, how its content is sourced and kept current, and how to help.

import { Link } from 'react-router-dom';
import { SEO } from '@/components/common/SEO';
import { SITE_CONFIG } from '@/config/site';
import { MODULES } from '@/config/modules';
import { Nav } from '@/components/shared/Nav';
import { Footer } from '@/components/shared/Footer';
import { PageHeader, SectionHeader } from '@/components/shared/PageHeader';
import { DATASET_META } from '@/data/datasetMeta';
import { LAST_UPDATED as BENCH_UPDATED } from '@/data/benchmarkData';
import { IMPACT_LAST_UPDATED } from '@/data/impactData';
import { formatDate } from '@/utils/timeline';

export function About() {
    const build = __COMMIT_HASH__ === 'dev' ? 'development build' : `commit ${__COMMIT_HASH__.slice(0, 7)}`;
    const builtAt = new Date(__BUILD_TIME__).toLocaleString('en-GB', { timeZone: 'UTC', dateStyle: 'medium', timeStyle: 'short' });

    return (
        <div className="page">
            <SEO
                title="About AI Beacon"
                description="What AI Beacon is, where its data comes from, how it is kept up to date, and how to report an error or contribute."
                canonical={`${SITE_CONFIG.baseUrl}/about`}
                structuredData={{
                    '@context': 'https://schema.org',
                    '@type': 'AboutPage',
                    name: 'About AI Beacon',
                    description: 'An open-source, interactive guide to how modern AI works.',
                }}
            />
            <Nav />
            <main id="main" className="page-main">
                <PageHeader
                    eyebrow="About"
                    title="A free, open guide to how modern AI works"
                    lede="AI Beacon explains large language models by letting you use them, take them apart and check the evidence — with no sign-up, no tracking and nothing to install. Everything runs in your browser."
                    stats={[
                        { label: 'Modules', value: MODULES.length },
                        { label: 'Timeline entries', value: (DATASET_META.models + DATASET_META.papers + DATASET_META.tools).toLocaleString() },
                        { label: 'Data reviewed', value: formatDate(DATASET_META.lastUpdated, 'short') },
                    ]}
                />

                <section className="section" aria-labelledby="modules-heading">
                    <div className="container">
                        <SectionHeader id="modules-heading" eyebrow="What’s inside" title="Five modules, one story" description="Start anywhere. If you are new to AI, the suggested order is 02 → 03 → 04 → 01 → 05." />
                        <ol className="ab-modules">
                            {MODULES.map((m) => (
                                <li key={m.id}>
                                    <Link to={m.route} className="card card-interactive ab-module">
                                        <span className="ab-num">{m.num}</span>
                                        <span className="ab-body">
                                            <span className="ab-title">{m.title}</span>
                                            <span className="ab-sum">{m.summary}</span>
                                            <span className="ab-time">{m.time}</span>
                                        </span>
                                    </Link>
                                </li>
                            ))}
                        </ol>
                    </div>
                </section>

                <section className="section" aria-labelledby="method-heading">
                    <div className="container">
                        <SectionHeader id="method-heading" eyebrow="Methodology" title="How we keep it accurate" />
                        <div className="ab-grid">
                            <article className="card card-pad">
                                <h3 className="ab-h">Primary sources first</h3>
                                <p>Figures come from the lab’s own paper, model card or announcement, or from the organisation that published a study. Wherever a number appears, a link to its source sits next to it.</p>
                            </article>
                            <article className="card card-pad">
                                <h3 className="ab-h">Measured vs. illustrative</h3>
                                <p>We label what is illustrative. The simulator computes real maths but with random, untrained weights; some training charts show a typical shape rather than a specific run; and the jobs scenario explorer is an editorial index, not a statistic.</p>
                            </article>
                            <article className="card card-pad">
                                <h3 className="ab-h">Blank means unknown</h3>
                                <p>If a lab did not report a benchmark, or a model’s parameter count is not public, we leave it blank. Nothing is estimated, averaged or converted to fill a gap.</p>
                            </article>
                            <article className="card card-pad">
                                <h3 className="ab-h">Checked on every build</h3>
                                <p>Automated tests check the datasets for missing sources, impossible dates, duplicates and mismatched counts, and check the simulator’s maths (for example, that attention weights sum to 1).</p>
                            </article>
                        </div>
                        <div className="table-wrap ab-dates">
                            <table className="data-table">
                                <thead><tr><th scope="col">Data</th><th scope="col">Last reviewed</th><th scope="col">Where it lives</th></tr></thead>
                                <tbody>
                                    <tr><td className="strong">Timeline: {DATASET_META.models} models, {DATASET_META.papers} papers, {DATASET_META.tools} tools</td><td>{formatDate(DATASET_META.lastUpdated, 'long')}</td><td className="tk-mono">src/data/*.json</td></tr>
                                    <tr><td className="strong">Benchmark snapshot</td><td>{formatDate(BENCH_UPDATED, 'long')}</td><td className="tk-mono">src/data/benchmarkData.ts</td></tr>
                                    <tr><td className="strong">AI and jobs evidence</td><td>{formatDate(IMPACT_LAST_UPDATED, 'long')}</td><td className="tk-mono">src/data/impactData.ts</td></tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </section>

                <section className="section" aria-labelledby="help-heading">
                    <div className="container">
                        <SectionHeader id="help-heading" eyebrow="Get involved" title="Found something wrong or out of date?" description="AI moves fast, and corrections are the most valuable contribution. Every change needs a link to a primary source." />
                        <div className="ab-actions">
                            <a className="btn btn-primary" href={`${SITE_CONFIG.githubUrl}/issues/new/choose`} target="_blank" rel="noopener noreferrer">Report an error ↗</a>
                            <a className="btn btn-secondary" href={`${SITE_CONFIG.githubUrl}/blob/main/docs/DATA-GUIDE.md`} target="_blank" rel="noopener noreferrer">Read the data guide ↗</a>
                            <a className="btn btn-ghost" href={SITE_CONFIG.githubUrl} target="_blank" rel="noopener noreferrer">Source code on GitHub ↗</a>
                        </div>
                    </div>
                </section>

                <section className="section" aria-labelledby="colophon-heading">
                    <div className="container">
                        <SectionHeader id="colophon-heading" eyebrow="Colophon" title="Built in the open" />
                        <div className="ab-grid">
                            <article className="card card-pad">
                                <h3 className="ab-h">Technology</h3>
                                <p>React, TypeScript and Vite, with a small hand-written maths engine for the transformer. No backend, no cookies, no analytics.</p>
                            </article>
                            <article className="card card-pad">
                                <h3 className="ab-h">License</h3>
                                <p>Code and data are released under the MIT License. Created by Akash Kumar, with contributions from the community.</p>
                            </article>
                            <article className="card card-pad">
                                <h3 className="ab-h">This version</h3>
                                <p className="tk-mono ab-build">{build}<br />built {builtAt} UTC</p>
                            </article>
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
            <style>{`
                .ab-modules { list-style: none; display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 340px), 1fr)); gap: var(--s3); }
                .ab-module { display: flex; gap: var(--s4); padding: var(--s4) var(--s5); height: 100%; }
                .ab-num { font-family: var(--font-mono); font-size: var(--text-sm); color: var(--muted); padding-top: 2px; }
                .ab-body { display: flex; flex-direction: column; gap: 4px; }
                .ab-title { font-size: var(--text-md); font-weight: var(--weight-semibold); color: var(--ink); }
                .ab-sum { font-size: var(--text-sm); color: var(--secondary); line-height: var(--lead-body); }
                .ab-time { font-size: var(--text-2xs); color: var(--muted); font-family: var(--font-mono); margin-top: 4px; }
                .ab-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 260px), 1fr)); gap: var(--s4); }
                .ab-grid p { font-size: var(--text-sm); color: var(--secondary); line-height: var(--lead-body); }
                .ab-h { font-size: var(--text-md); margin-bottom: var(--s2); }
                .ab-build { font-size: var(--text-xs) !important; }
                .ab-dates { margin-top: var(--s5); }
                .ab-actions { display: flex; flex-wrap: wrap; gap: var(--s2); }
                .tk-mono { font-family: var(--font-mono); font-size: var(--text-xs); }
            `}</style>
        </div>
    );
}
