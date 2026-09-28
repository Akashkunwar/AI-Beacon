// src/pages/Training.tsx
// Module 03 — How AI Is Trained. Ten stages from data to deployment.
// The active stage lives in the URL (?stage=pretraining) so every stage can
// be linked to directly; ← / → move between stages.

import { lazy, Suspense, useCallback, useEffect, useRef, type ComponentType } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { SEO } from '@/components/common/SEO';
import { SITE_CONFIG } from '@/config/site';
import { getModule } from '@/config/modules';
import { Nav } from '@/components/shared/Nav';
import { Footer } from '@/components/shared/Footer';
import { ErrorBoundary } from '@/components/shared/ErrorBoundary';
import { PHASE_LABELS, STAGES, STAGE_INDEX, type StagePhase } from '@/components/training/stages';
import { TRAINING_KIT_CSS } from '@/components/training/TrainingKit';

const load = <K extends string>(factory: () => Promise<Record<K, ComponentType>>, name: K) =>
    lazy(() => factory().then((m) => ({ default: m[name] })));

const STAGE_VIEWS: Record<string, ComponentType> = {
    data: load(() => import('@/components/training/StageData'), 'StageData'),
    tokenizer: load(() => import('@/components/training/StageTokenizer'), 'StageTokenizer'),
    architecture: load(() => import('@/components/training/StageArchitecture'), 'StageArchitecture'),
    pretraining: load(() => import('@/components/training/StagePretraining'), 'StagePretraining'),
    monitoring: load(() => import('@/components/training/StageMonitoring'), 'StageMonitoring'),
    sft: load(() => import('@/components/training/StageSFT'), 'StageSFT'),
    feedback: load(() => import('@/components/training/StageFeedback'), 'StageFeedback'),
    evaluation: load(() => import('@/components/training/StageEvaluation'), 'StageEvaluation'),
    inference: load(() => import('@/components/training/StageInference'), 'StageInference'),
    deployment: load(() => import('@/components/training/StageDeployment'), 'StageDeployment'),
};

const PHASES = Object.keys(PHASE_LABELS) as StagePhase[];

export function Training() {
    const mod = getModule('training');
    const [params, setParams] = useSearchParams();
    const idx = STAGE_INDEX[params.get('stage') ?? ''] ?? 0;
    const stage = STAGES[idx];
    const View = STAGE_VIEWS[stage.id];
    const topRef = useRef<HTMLDivElement>(null);
    const firstRender = useRef(true);

    const goTo = useCallback((i: number) => {
        const next = STAGES[Math.max(0, Math.min(STAGES.length - 1, i))];
        setParams(next.id === STAGES[0].id ? {} : { stage: next.id });
    }, [setParams]);

    // Bring the new stage's header into view (not on first load).
    useEffect(() => {
        if (firstRender.current) { firstRender.current = false; return; }
        const el = topRef.current;
        if (!el) return;
        const navH = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--nav-height')) || 60;
        const y = el.getBoundingClientRect().top + window.scrollY - navH - 12;
        if (window.scrollY > y) window.scrollTo({ top: y });
    }, [idx]);

    // ← / → between stages, unless the user is typing or using a control that owns the arrows.
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey) return;
            const t = e.target as HTMLElement | null;
            if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName) || t.getAttribute('role') === 'tab')) return;
            if (e.key === 'ArrowRight' && idx < STAGES.length - 1) { e.preventDefault(); goTo(idx + 1); }
            if (e.key === 'ArrowLeft' && idx > 0) { e.preventDefault(); goTo(idx - 1); }
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [idx, goTo]);

    const prev = idx > 0 ? STAGES[idx - 1] : null;
    const next = idx < STAGES.length - 1 ? STAGES[idx + 1] : null;
    const href = (id: string) => (id === STAGES[0].id ? '?' : `?stage=${id}`);

    return (
        <div className="page">
            <SEO
                title={idx === 0 ? 'How AI Is Trained — from data to deployment' : `${stage.title} — How AI Is Trained`}
                description="How large language models are built, in ten stages: collecting data, building a tokenizer, designing the network, pre-training, fine-tuning, feedback and reinforcement learning, evaluation, efficient inference and deployment."
                canonical={`${SITE_CONFIG.baseUrl}/transformer-training-simulator${idx === 0 ? '' : `?stage=${stage.id}`}`}
                structuredData={{
                    '@context': 'https://schema.org',
                    '@type': 'HowTo',
                    name: 'How large language models are trained',
                    step: STAGES.map((s, i) => ({
                        '@type': 'HowToStep',
                        position: i + 1,
                        name: s.title,
                        text: s.goal,
                        url: `${SITE_CONFIG.baseUrl}/transformer-training-simulator?stage=${s.id}`,
                    })),
                }}
            />
            <Nav />
            <header className="tr-hero">
                <div className="container-wide tr-hero-inner">
                    <p className="eyebrow">Module {mod.num} · {mod.title}</p>
                    <h1 className="tr-hero-title">How is a model like ChatGPT made?</h1>
                    <p className="tr-hero-lede">
                        Ten stages, from a pile of text to an assistant millions of people use. Each stage explains what happens, why, and
                        what can go wrong — with interactive examples and real numbers from published models.
                    </p>
                    <div className="tr-progress" aria-hidden="true">
                        {STAGES.map((s, i) => <span key={s.id} className={i <= idx ? 'is-on' : ''} />)}
                    </div>
                </div>
            </header>

            <div className="container-wide tr-layout">
                <aside className="tr-rail" aria-label="Training stages">
                    <nav>
                        {PHASES.map((phase) => (
                            <div key={phase} className="tr-rail-group">
                                <p className="tr-rail-phase">{PHASE_LABELS[phase]}</p>
                                <ol>
                                    {STAGES.map((s, i) => s.phase !== phase ? null : (
                                        <li key={s.id}>
                                            <Link
                                                to={href(s.id)}
                                                className={`tr-rail-link ${i === idx ? 'is-current' : i < idx ? 'is-done' : ''}`}
                                                aria-current={i === idx ? 'step' : undefined}
                                            >
                                                <span className="tr-rail-num">{String(i + 1).padStart(2, '0')}</span>
                                                {s.title}
                                            </Link>
                                        </li>
                                    ))}
                                </ol>
                            </div>
                        ))}
                    </nav>
                    <p className="tr-rail-tip">Tip: ← and → move between stages.</p>
                </aside>

                <main id="main" className="tr-main">
                    <nav className="tr-strip" aria-label="Training stages">
                        {STAGES.map((s, i) => (
                            <Link key={s.id} to={href(s.id)} className={`tr-strip-link ${i < idx ? 'is-done' : ''}`} aria-current={i === idx ? 'step' : undefined}>
                                <span>{i + 1}</span>{s.short}
                            </Link>
                        ))}
                    </nav>

                    <div ref={topRef} className="tr-stage-head">
                        <p className="eyebrow">Stage {idx + 1} of {STAGES.length} · {PHASE_LABELS[stage.phase]}</p>
                        <h2 className="tr-stage-title">{stage.title}</h2>
                        <p className="tr-stage-lede">{stage.lede}</p>
                        <dl className="tr-glance">
                            <div><dt>Goal</dt><dd>{stage.goal}</dd></div>
                            <div><dt>How</dt><dd>{stage.how}</dd></div>
                            <div><dt>Watch out</dt><dd>{stage.watch}</dd></div>
                        </dl>
                    </div>

                    <div className="tr-stage-body">
                        <ErrorBoundary key={stage.id}>
                            <Suspense fallback={<div className="skeleton" style={{ height: 360, borderRadius: 'var(--r-lg)' }} />}>
                                <View />
                            </Suspense>
                        </ErrorBoundary>
                    </div>

                    <nav className="tr-pager" aria-label="Previous and next stage">
                        {prev ? (
                            <Link to={href(prev.id)} className="tr-pager-link" rel="prev">
                                <span className="tr-pager-dir">← Stage {idx}</span>
                                <span className="tr-pager-title">{prev.title}</span>
                            </Link>
                        ) : <span />}
                        {next ? (
                            <Link to={href(next.id)} className="tr-pager-link is-next" rel="next">
                                <span className="tr-pager-dir">Stage {idx + 2} →</span>
                                <span className="tr-pager-title">{next.title}</span>
                            </Link>
                        ) : (
                            <Link to="/benchmarks" className="tr-pager-link is-next">
                                <span className="tr-pager-dir">Next module →</span>
                                <span className="tr-pager-title">Benchmarks: how good are models, really?</span>
                            </Link>
                        )}
                    </nav>
                </main>
            </div>
            <Footer />
            <style>{TRAINING_CSS + TRAINING_KIT_CSS}</style>
        </div>
    );
}

const TRAINING_CSS = `
.tr-hero { border-bottom: 1px solid var(--stroke); background: var(--bg-panel); }
.tr-hero-inner { padding-block: var(--s6) var(--s5); display: flex; flex-direction: column; gap: var(--s2); }
.tr-hero-title { font-size: var(--text-2xl); letter-spacing: var(--tracking-tight); line-height: 1.1; }
.tr-hero-lede { font-size: var(--text-base); color: var(--secondary); max-width: 70ch; line-height: var(--lead-body); }
.tr-progress { display: grid; grid-template-columns: repeat(10, 1fr); gap: 4px; margin-top: var(--s3); max-width: 520px; }
.tr-progress span { height: 4px; border-radius: 2px; background: var(--bg-raised); }
.tr-progress span.is-on { background: var(--ink); }

.tr-layout { display: grid; grid-template-columns: 250px minmax(0, 1fr); gap: var(--s7); align-items: start; padding-block: var(--s6) var(--s8); }
.tr-rail { position: sticky; top: calc(var(--nav-height) + var(--s4)); max-height: calc(100vh - var(--nav-height) - var(--s6)); overflow-y: auto; display: flex; flex-direction: column; gap: var(--s4); }
.tr-rail-group + .tr-rail-group { margin-top: var(--s3); }
.tr-rail-phase { font-size: var(--text-2xs); font-family: var(--font-mono); text-transform: uppercase; letter-spacing: var(--tracking-wide); color: var(--muted); margin-bottom: 4px; }
.tr-rail ol { list-style: none; display: flex; flex-direction: column; gap: 1px; }
.tr-rail-link { display: flex; gap: var(--s2); padding: 6px 8px; border-radius: var(--r-sm); font-size: var(--text-sm); color: var(--secondary); line-height: 1.3; }
.tr-rail-link:hover { background: var(--bg-raised); color: var(--ink); }
.tr-rail-num { font-family: var(--font-mono); font-size: var(--text-2xs); color: var(--muted); padding-top: 2px; flex-shrink: 0; }
.tr-rail-link.is-done { color: var(--primary); }
.tr-rail-link.is-current { background: var(--bg-inverse); color: var(--text-inverse); }
.tr-rail-link.is-current .tr-rail-num { color: inherit; opacity: 0.7; }
.tr-rail-tip { font-size: var(--text-2xs); color: var(--muted); }

.tr-main { min-width: 0; display: flex; flex-direction: column; gap: var(--s6); }
.tr-strip { display: none; }
.tr-stage-head { display: flex; flex-direction: column; gap: var(--s3); }
.tr-stage-title { font-size: var(--text-xl); letter-spacing: var(--tracking-tight); line-height: 1.15; }
.tr-stage-lede { font-size: var(--text-md); color: var(--secondary); line-height: 1.55; max-width: 70ch; }
.tr-glance { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: var(--s4); padding: var(--s4); border: 1px solid var(--stroke); border-radius: var(--r-lg); background: var(--bg-panel); margin-top: var(--s2); }
.tr-glance dt { font-size: var(--text-2xs); font-family: var(--font-mono); text-transform: uppercase; letter-spacing: var(--tracking-wide); color: var(--muted); margin-bottom: 4px; }
.tr-glance dd { font-size: var(--text-sm); color: var(--primary); line-height: var(--lead-body); }
.tr-stage-body { display: flex; flex-direction: column; gap: var(--s6); }

.tr-pager { display: grid; grid-template-columns: 1fr 1fr; gap: var(--s3); padding-top: var(--s5); border-top: 1px solid var(--stroke); }
.tr-pager-link { display: flex; flex-direction: column; gap: 4px; padding: var(--s4); border: 1px solid var(--stroke); border-radius: var(--r-lg); background: var(--bg-panel); transition: border-color var(--dur-fast) var(--ease-out); }
.tr-pager-link:hover { border-color: var(--ink); }
.tr-pager-link.is-next { text-align: right; }
.tr-pager-dir { font-size: var(--text-2xs); font-family: var(--font-mono); text-transform: uppercase; letter-spacing: var(--tracking-wide); color: var(--muted); }
.tr-pager-title { font-size: var(--text-sm); font-weight: var(--weight-semibold); color: var(--ink); }

@media (max-width: 1023px) {
    .tr-layout { grid-template-columns: 1fr; gap: 0; padding-top: 0; }
    .tr-rail { display: none; }
    .tr-strip {
        display: flex; gap: 4px; overflow-x: auto; scrollbar-width: none;
        position: sticky; top: var(--nav-height); z-index: var(--z-raised);
        padding-block: var(--s2);
        background: color-mix(in srgb, var(--bg) 92%, transparent); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);
        border-bottom: 1px solid var(--stroke);
    }
    .tr-strip::-webkit-scrollbar { display: none; }
    .tr-strip-link { display: inline-flex; align-items: center; gap: 6px; white-space: nowrap; padding: 4px 10px 4px 4px; border-radius: var(--r-pill); font-size: var(--text-xs); color: var(--muted); border: 1px solid transparent; }
    .tr-strip-link span { width: 20px; height: 20px; border-radius: 50%; display: grid; place-items: center; font-family: var(--font-mono); font-size: 10px; border: 1px solid var(--stroke-dark); }
    .tr-strip-link.is-done { color: var(--secondary); }
    .tr-strip-link[aria-current="step"] { color: var(--ink); border-color: var(--stroke-dark); font-weight: var(--weight-medium); }
    .tr-strip-link[aria-current="step"] span { background: var(--bg-inverse); color: var(--text-inverse); border-color: var(--bg-inverse); }
    .tr-main { padding-block: 0 var(--s7); }
}
@media (max-width: 767px) {
    .tr-hero-title { font-size: var(--text-xl); }
    .tr-glance { grid-template-columns: 1fr; gap: var(--s3); }
    .tr-stage-lede { font-size: var(--text-base); }
    .tr-pager { grid-template-columns: 1fr; }
}
`;
