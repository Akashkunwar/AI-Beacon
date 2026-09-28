// src/pages/Home.tsx
// Landing page: what AI Beacon is, the five modules, a suggested learning
// path, what's new in the data, and how the project works.

import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Nav } from '@/components/shared/Nav';
import { Footer } from '@/components/shared/Footer';
import { SEO } from '@/components/common/SEO';
import { ButtonLink } from '@/components/shared/ButtonLink';
import { Reveal } from '@/components/shared/Reveal';
import { ArrowRightIcon, GitHubIcon } from '@/components/shared/Icons';
import { HeroAttention } from '@/components/home/HeroAttention';
import { MODULES } from '@/config/modules';
import { SITE_CONFIG } from '@/config/site';
import { DATASET_META } from '@/data/datasetMeta';
import { formatDate, slugify } from '@/utils/timeline';

// ─── Hero ──────────────────────────────────────────────────────────────────

function Hero() {
    const stats = [
        { label: 'AI models', value: DATASET_META.models },
        { label: 'Research papers', value: DATASET_META.papers },
        { label: 'Dev tools', value: DATASET_META.tools },
        { label: 'Data reviewed', value: formatDate(DATASET_META.lastUpdated, 'short') },
    ];

    return (
        <section aria-labelledby="hero-heading" className="home-hero">
            <div className="container home-hero-grid">
                <div className="home-hero-copy">
                    <p className="eyebrow">
                        <span className="eyebrow-dot" aria-hidden="true" />
                        Free · Open source · Runs in your browser
                    </p>
                    <h1 id="hero-heading" className="home-hero-title">
                        See how AI <span className="home-hero-soft">actually</span> works.
                    </h1>
                    <p className="home-hero-lede">
                        An interactive guide to modern AI for anyone curious. Watch a real (tiny) language model
                        think step by step, learn how models are trained and tested, and explore every major model
                        and paper on one timeline — no sign-up, no paywall, no maths degree required.
                    </p>
                    <div className="home-hero-ctas">
                        <ButtonLink to="/transformer-simulator" id="hero-cta-primary">
                            Start with How LLMs Work <ArrowRightIcon size={16} />
                        </ButtonLink>
                        <ButtonLink to="/timeline" variant="secondary" id="hero-cta-secondary">
                            Browse the AI timeline
                        </ButtonLink>
                    </div>
                    <dl className="home-hero-stats">
                        {stats.map((s) => (
                            <div key={s.label} className="stat">
                                <dt className="stat-label">{s.label}</dt>
                                <dd className="stat-value">{s.value}</dd>
                            </div>
                        ))}
                    </dl>
                </div>
                <div className="home-hero-visual">
                    <HeroAttention />
                </div>
            </div>
        </section>
    );
}

// ─── Modules ───────────────────────────────────────────────────────────────

const LEARNING_PATH = ['simulator', 'training', 'benchmarks', 'timeline', 'impact'] as const;

function ModulesSection() {
    const pathModules = LEARNING_PATH.map((id) => MODULES.find((m) => m.id === id)!);

    return (
        <section id="modules" aria-labelledby="modules-heading" className="section">
            <div className="container">
                <Reveal>
                    <div className="section-head">
                        <p className="eyebrow">Five modules</p>
                        <h2 id="modules-heading" className="section-title home-section-title">Pick where to start</h2>
                        <p className="section-desc">
                            Each module stands on its own. If you are new to AI, the suggested path below builds up
                            from how a model works to what it means for the real world.
                        </p>
                    </div>
                </Reveal>

                <Reveal delay={0.05}>
                    <ol className="home-path" aria-label="Suggested learning path for beginners">
                        {pathModules.map((m, i) => (
                            <li key={m.id}>
                                <Link to={m.route} className="home-path-step">
                                    <span className="home-path-idx">{i + 1}</span>
                                    {m.title}
                                </Link>
                                {i < pathModules.length - 1 && <span className="home-path-arrow" aria-hidden="true">→</span>}
                            </li>
                        ))}
                    </ol>
                </Reveal>

                <div className="home-modules">
                    {MODULES.map((m, i) => (
                        <Reveal key={m.id} delay={0.04 * i} style={{ height: '100%' }}>
                            <Link to={m.route} className="card card-interactive home-module" aria-label={`${m.title}: ${m.summary}`}>
                                <div className="home-module-top">
                                    <span className="home-module-num">{m.num}</span>
                                    <span className="chip chip-outline">{m.time}</span>
                                </div>
                                <h3 className="home-module-title">{m.title}</h3>
                                <p className="home-module-summary">{m.summary}</p>
                                <p className="home-module-learn">
                                    <span className="eyebrow">You’ll learn</span>
                                    {m.learn}
                                </p>
                                <span className="home-module-go">
                                    Open <ArrowRightIcon size={15} />
                                </span>
                            </Link>
                        </Reveal>
                    ))}
                </div>
            </div>
        </section>
    );
}

// ─── Latest in the timeline (dataset loaded only when scrolled into view) ──

interface LatestItem {
    name: string;
    company: string;
    type: string;
    date: string;
}

function useLatestModels(ref: React.RefObject<HTMLElement | null>) {
    const [items, setItems] = useState<LatestItem[] | null>(null);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        let cancelled = false;
        const load = () => {
            import('@/data/LLM_Timeline_Dataset.json').then((mod) => {
                if (cancelled) return;
                const models = (mod.default as { models: Array<{ model_name: string; company: string; model_type: string; release_date: string }> }).models;
                const latest = [...models]
                    .sort((a, b) => b.release_date.localeCompare(a.release_date))
                    .slice(0, 6)
                    .map((m) => ({ name: m.model_name, company: m.company, type: m.model_type, date: m.release_date }));
                setItems(latest);
            });
        };
        const io = new IntersectionObserver((entries) => {
            if (entries.some((e) => e.isIntersecting)) {
                io.disconnect();
                load();
            }
        }, { rootMargin: '300px' });
        io.observe(el);
        return () => {
            cancelled = true;
            io.disconnect();
        };
    }, [ref]);

    return items;
}

function LatestSection() {
    const ref = useRef<HTMLElement>(null);
    const items = useLatestModels(ref);

    return (
        <section ref={ref} aria-labelledby="latest-heading" className="section home-latest">
            <div className="container">
                <Reveal>
                    <div className="home-latest-head">
                        <div className="section-head" style={{ marginBottom: 0 }}>
                            <p className="eyebrow">What’s new</p>
                            <h2 id="latest-heading" className="section-title home-section-title">Latest additions to the timeline</h2>
                            <p className="section-desc">
                                The newest model releases in our dataset, last reviewed {formatDate(DATASET_META.lastUpdated, 'long')}.
                                Spotted something missing or wrong? The data is plain JSON — anyone can fix it.
                            </p>
                        </div>
                        <ButtonLink to="/timeline" variant="secondary" size="sm">See all {DATASET_META.models} models</ButtonLink>
                    </div>
                </Reveal>

                <ul className="home-latest-list">
                    {(items ?? Array.from({ length: 6 }, () => null)).map((item, i) => (
                        <li key={item ? item.name + item.date : i}>
                            {item ? (
                                <Link to={`/timeline?item=${slugify(item.name)}`} className="home-latest-item">
                                    <span className="home-latest-date">{formatDate(item.date, 'long')}</span>
                                    <span className="home-latest-name">{item.name}</span>
                                    <span className="home-latest-meta">{item.company} · {item.type}</span>
                                </Link>
                            ) : (
                                <div className="home-latest-item" aria-hidden="true">
                                    <span className="skeleton" style={{ width: 90, height: 12 }} />
                                    <span className="skeleton" style={{ width: '70%', height: 18, marginTop: 6 }} />
                                    <span className="skeleton" style={{ width: '50%', height: 12, marginTop: 6 }} />
                                </div>
                            )}
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    );
}

// ─── Principles ────────────────────────────────────────────────────────────

const PRINCIPLES = [
    {
        title: 'Real math, tiny model',
        text: 'The simulator runs an actual transformer forward pass in your browser. It is small and untrained, so the predictions are random — but every number and shape is computed, not faked.',
    },
    {
        title: 'Sourced, dated data',
        text: 'Benchmark scores and prices link to the lab or leaderboard that published them. Missing numbers stay blank instead of being guessed.',
    },
    {
        title: 'Honest about uncertainty',
        text: 'Projections are labelled as scenarios, exposure is not presented as job loss, and every benchmark comes with what it cannot tell you.',
    },
    {
        title: 'Open and editable',
        text: 'MIT-licensed code and plain-JSON datasets. Found an outdated entry? Edit one file, run the checks, and open a pull request.',
    },
];

function PrinciplesSection() {
    return (
        <section aria-labelledby="principles-heading" className="section">
            <div className="container">
                <Reveal>
                    <div className="section-head">
                        <p className="eyebrow">How AI Beacon works</p>
                        <h2 id="principles-heading" className="section-title home-section-title">Built to be trusted, not just looked at</h2>
                    </div>
                </Reveal>
                <div className="home-principles">
                    {PRINCIPLES.map((p, i) => (
                        <Reveal key={p.title} delay={0.04 * i}>
                            <div className="home-principle">
                                <span className="home-principle-num">0{i + 1}</span>
                                <h3>{p.title}</h3>
                                <p>{p.text}</p>
                            </div>
                        </Reveal>
                    ))}
                </div>
            </div>
        </section>
    );
}

// ─── Contribute ────────────────────────────────────────────────────────────

function ContributeSection() {
    return (
        <section aria-labelledby="contribute-heading" className="section">
            <div className="container">
                <Reveal>
                    <div className="card home-contribute">
                        <div>
                            <p className="eyebrow">Open source</p>
                            <h2 id="contribute-heading" className="section-title home-section-title">Help keep it accurate</h2>
                            <p className="section-desc" style={{ maxWidth: '58ch' }}>
                                AI moves fast. If a release is missing, a number is out of date, or an explanation could be
                                clearer, open an issue or a pull request. The data guide explains exactly which file to edit.
                            </p>
                        </div>
                        <div className="home-contribute-ctas">
                            <ButtonLink href={SITE_CONFIG.githubUrl}>
                                <GitHubIcon size={16} /> View on GitHub
                            </ButtonLink>
                            <ButtonLink href={`${SITE_CONFIG.githubUrl}/blob/main/docs/DATA-GUIDE.md`} variant="secondary">
                                Read the data guide
                            </ButtonLink>
                        </div>
                    </div>
                </Reveal>
            </div>
        </section>
    );
}

// ─── Page ──────────────────────────────────────────────────────────────────

export function Home() {
    const structuredData = {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'AI Beacon',
        url: SITE_CONFIG.baseUrl,
        description: 'A free, open-source, interactive guide to how modern AI works.',
        inLanguage: 'en',
    };

    return (
        <div className="page">
            <SEO
                canonical={`${SITE_CONFIG.baseUrl}/`}
                structuredData={structuredData}
            />
            <Nav />
            <main id="main" className="page-main">
                <Hero />
                <ModulesSection />
                <LatestSection />
                <PrinciplesSection />
                <ContributeSection />
            </main>
            <Footer />
            <style>{HOME_CSS}</style>
        </div>
    );
}

const HOME_CSS = `
.home-hero { padding-block: var(--s8) var(--s7); border-bottom: 1px solid var(--stroke); }
.home-hero-grid {
    display: grid;
    grid-template-columns: minmax(0, 1.1fr) minmax(0, 0.9fr);
    gap: var(--s7);
    align-items: center;
}
.home-hero-copy { display: flex; flex-direction: column; gap: var(--s5); }
.home-hero-title {
    font-size: clamp(2.75rem, 6vw, var(--text-hero));
    line-height: var(--lead-tight);
    letter-spacing: var(--tracking-tight);
    font-weight: var(--weight-semibold);
}
.home-hero-soft { color: var(--muted); }
.home-hero-lede { font-size: var(--text-md); color: var(--secondary); max-width: 56ch; }
.home-hero-ctas { display: flex; flex-wrap: wrap; gap: var(--s3); }
.home-hero-stats {
    display: grid;
    grid-template-columns: repeat(4, auto);
    justify-content: start;
    gap: var(--s6);
    padding-top: var(--s5);
    border-top: 1px solid var(--stroke);
}
.home-section-title { font-size: var(--text-2xl); letter-spacing: var(--tracking-tight); }

.home-path {
    list-style: none;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--s2);
    margin-bottom: var(--s5);
    font-size: var(--text-xs);
}
.home-path li { display: inline-flex; align-items: center; gap: var(--s2); }
.home-path-step {
    display: inline-flex;
    align-items: center;
    gap: var(--s2);
    padding: 6px 12px 6px 6px;
    border: 1px solid var(--stroke);
    border-radius: var(--r-pill);
    background: var(--bg-panel);
    color: var(--primary);
    font-weight: var(--weight-medium);
    transition: border-color var(--dur-fast) var(--ease-out);
}
.home-path-step:hover { border-color: var(--ink); }
.home-path-idx {
    width: 22px; height: 22px;
    display: grid; place-items: center;
    border-radius: 50%;
    background: var(--bg-inverse);
    color: var(--text-inverse);
    font-family: var(--font-mono);
    font-size: 11px;
}
.home-path-arrow { color: var(--muted); }

.home-modules { display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); gap: var(--s4); }
.home-modules > * { grid-column: span 2; }
.home-modules > :nth-child(1), .home-modules > :nth-child(2) { grid-column: span 3; }
.home-module {
    height: 100%;
    padding: var(--s5);
    display: flex;
    flex-direction: column;
    gap: var(--s3);
}
.home-module-top { display: flex; justify-content: space-between; align-items: center; }
.home-module-num { font-family: var(--font-mono); font-size: var(--text-xs); color: var(--muted); }
.home-module-title { font-size: var(--text-lg); letter-spacing: var(--tracking-snug); }
.home-module-summary { font-size: var(--text-sm); color: var(--secondary); }
.home-module-learn {
    display: flex; flex-direction: column; gap: 4px;
    font-size: var(--text-xs); color: var(--secondary);
    padding-top: var(--s3); border-top: 1px dashed var(--stroke);
    margin-top: auto;
}
.home-module-go { display: inline-flex; align-items: center; gap: 6px; font-size: var(--text-sm); font-weight: var(--weight-semibold); color: var(--ink); }
.home-module:hover .home-module-go svg { transform: translateX(3px); }
.home-module-go svg { transition: transform var(--dur-fast) var(--ease-out); }

.home-latest { background: var(--bg-sunken); }
.home-latest-head { display: flex; flex-wrap: wrap; justify-content: space-between; align-items: flex-end; gap: var(--s4); margin-bottom: var(--s5); }
.home-latest-list { list-style: none; display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: var(--s3); }
.home-latest-item {
    display: flex; flex-direction: column; gap: 2px;
    height: 100%;
    padding: var(--s4);
    border: 1px solid var(--stroke);
    border-radius: var(--r-md);
    background: var(--bg-panel);
    transition: border-color var(--dur-fast) var(--ease-out);
}
a.home-latest-item:hover { border-color: var(--stroke-dark); }
.home-latest-date { font-family: var(--font-mono); font-size: var(--text-2xs); color: var(--muted); }
.home-latest-name { font-weight: var(--weight-semibold); color: var(--ink); font-size: var(--text-base); }
.home-latest-meta { font-size: var(--text-xs); color: var(--secondary); }

.home-principles { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: var(--s5); }
.home-principle { display: flex; flex-direction: column; gap: var(--s2); padding-top: var(--s4); border-top: 1px solid var(--ink); }
.home-principle-num { font-family: var(--font-mono); font-size: var(--text-2xs); color: var(--muted); }
.home-principle h3 { font-size: var(--text-md); }
.home-principle p { font-size: var(--text-sm); color: var(--secondary); }

.home-contribute {
    padding: var(--s6);
    display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: var(--s5);
}
.home-contribute .section-title { margin: var(--s2) 0; }
.home-contribute-ctas { display: flex; flex-wrap: wrap; gap: var(--s3); }

@media (max-width: 1023px) {
    .home-hero-grid { grid-template-columns: 1fr; gap: var(--s6); }
    .home-hero-visual { max-width: 560px; }
    .home-modules { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .home-modules > *, .home-modules > :nth-child(1), .home-modules > :nth-child(2) { grid-column: span 1; }
    .home-modules > :nth-child(5) { grid-column: 1 / -1; }
    .home-principles { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .home-latest-list { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
@media (max-width: 639px) {
    .home-hero { padding-block: var(--s6); }
    .home-hero-stats { grid-template-columns: repeat(2, auto); gap: var(--s4) var(--s6); }
    .home-modules, .home-principles, .home-latest-list { grid-template-columns: 1fr; }
    .home-modules > :nth-child(5) { grid-column: auto; }
    .home-section-title { font-size: var(--text-xl); }
    .home-contribute { padding: var(--s5); }
}
`;
