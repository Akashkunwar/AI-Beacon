// src/pages/Home.tsx
// The AiViz homepage — Nav, Hero, Module Grid, Transformer Section,
// Automation Clock Teaser, Pipeline Preview, Footer.
// Monochrome only. No colour.

import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { Nav } from '@/components/shared/Nav';
import { SEO } from '@/components/common/SEO';

// ─── Animation helpers ─────────────────────────────────────────────────────

const fadeUp = {
    hidden: { opacity: 0, y: 14 },
    visible: (delay: number = 0) => ({
        opacity: 1,
        y: 0,
        transition: { duration: 0.35, delay, ease: [0.2, 0, 0, 1] as [number, number, number, number] },
    }),
};

function Reveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
    const ref = useRef<HTMLDivElement>(null);
    const inView = useInView(ref, { once: true, margin: '-60px' });
    return (
        <motion.div
            ref={ref}
            initial="hidden"
            animate={inView ? 'visible' : 'hidden'}
            custom={delay}
            variants={fadeUp}
        >
            {children}
        </motion.div>
    );
}

// ─── Hero ──────────────────────────────────────────────────────────────────

function Hero() {
    const handleScrollToModules = (e: React.MouseEvent) => {
        e.preventDefault();
        document.getElementById('module-grid')?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <section
            aria-labelledby="hero-heading"
            style={{
                paddingTop: 'var(--s8)',
                paddingBottom: 'var(--s7)',
                borderBottom: '1px solid var(--stroke)',
            }}
        >
            <div className="depth-container">
                <div style={{ maxWidth: '900px' }}>
                    {/* Eyebrow */}
                    <motion.p
                        custom={0.05}
                        initial="hidden"
                        animate="visible"
                        variants={fadeUp}
                        style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: 'var(--text-xs)',
                            color: 'var(--muted)',
                            textTransform: 'uppercase',
                            letterSpacing: 'var(--tracking-wider)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 'var(--s2)',
                            marginBottom: 'var(--s4)',
                        }}
                    >
                        <span style={{
                            display: 'inline-block',
                            width: '6px',
                            height: '6px',
                            borderRadius: '50%',
                            background: 'var(--ink)',
                            flexShrink: 0,
                        }} />
                        interactive explainer · open source
                    </motion.p>

                    {/* Headline */}
                    <motion.h1
                        id="hero-heading"
                        custom={0.1}
                        initial="hidden"
                        animate="visible"
                        variants={fadeUp}
                        style={{
                            fontSize: 'clamp(2.6rem, 6vw, var(--text-hero))',
                            fontWeight: 'var(--weight-semibold)',
                            color: 'var(--ink)',
                            lineHeight: 'var(--lead-tight)',
                            letterSpacing: 'var(--tracking-tight)',
                            maxWidth: '18ch',
                        }}
                    >
                        The internet's most honest guide to how&nbsp;AI works.
                    </motion.h1>

                    {/* Subheading */}
                    <motion.p
                        custom={0.18}
                        initial="hidden"
                        animate="visible"
                        variants={fadeUp}
                        style={{
                            fontSize: 'var(--text-md)',
                            fontWeight: 'var(--weight-light)',
                            color: 'var(--secondary)',
                            maxWidth: '54ch',
                            lineHeight: 'var(--lead-body)',
                            marginTop: 'var(--s4)',
                        }}
                    >
                        Interactive, step-by-step, and open source. No courses,
                        no paywalls, no handwaving. Just the actual mechanics —
                        from tokenization to training to what comes next.
                    </motion.p>

                    {/* CTA row */}
                    <motion.div
                        custom={0.26}
                        initial="hidden"
                        animate="visible"
                        variants={fadeUp}
                        style={{ display: 'flex', gap: 'var(--s3)', flexWrap: 'wrap', alignItems: 'center', marginTop: 'var(--s6)' }}
                    >
                        <Link
                            to="/transformer-simulator"
                            id="hero-cta-primary"
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 'var(--s2)',
                                padding: '0.6rem 1.25rem',
                                background: 'var(--bg-inverse)',
                                border: '1px solid var(--bg-inverse)',
                                borderRadius: 'var(--r-md)',
                                fontFamily: 'var(--font-sans)',
                                fontSize: 'var(--text-sm)',
                                fontWeight: 'var(--weight-medium)',
                                color: 'var(--text-inverse)',
                                textDecoration: 'none',
                                transition: `background var(--dur-fast) var(--ease-out)`,
                            }}
                            onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = '#333333'; }}
                            onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = 'var(--bg-inverse)'; }}
                        >
                            Explore the AI Timeline →
                        </Link>
                        <a
                            href="#module-grid"
                            id="hero-cta-secondary"
                            onClick={handleScrollToModules}
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 'var(--s2)',
                                padding: '0.6rem 1.25rem',
                                background: 'transparent',
                                border: '1px solid var(--stroke-dark)',
                                borderRadius: 'var(--r-md)',
                                fontFamily: 'var(--font-sans)',
                                fontSize: 'var(--text-sm)',
                                fontWeight: 'var(--weight-medium)',
                                color: 'var(--secondary)',
                                textDecoration: 'none',
                                transition: `all var(--dur-fast) var(--ease-out)`,
                            }}
                            onMouseEnter={(e) => {
                                const el = e.currentTarget as HTMLAnchorElement;
                                el.style.background = 'var(--bg-panel)';
                                el.style.color = 'var(--ink)';
                                el.style.borderColor = 'var(--primary)';
                            }}
                            onMouseLeave={(e) => {
                                const el = e.currentTarget as HTMLAnchorElement;
                                el.style.background = 'transparent';
                                el.style.color = 'var(--secondary)';
                                el.style.borderColor = 'var(--stroke-dark)';
                            }}
                        >
                            See what's coming
                        </a>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}

// ─── Module Grid ───────────────────────────────────────────────────────────

const MODULES = [
    {
        num: '01',
        title: 'AI Timeline',
        desc: 'Every model, every paper, every inflection point — on one zoomable, annotated timeline.',
        status: 'live' as const,
        to: '/timeline',
    },
    {
        num: '02',
        title: 'How LLMs Work',
        desc: 'The full transformer pipeline, interactive. Tokenization to sampling — every step, live. Type anything. Watch every number change.',
        status: 'live' as const,
        to: '/transformer-simulator',
    },
    {
        num: '03',
        title: 'How AI is Trained',
        desc: 'Pre-training, SFT, RLHF, DPO. How a model goes from random weights to something that can actually reason.',
        status: 'live' as const,
        to: '/transformer-training-simulator',
    },
    {
        num: '04',
        title: 'Benchmarks & Leaderboard',
        desc: 'Every major model ranked across MMLU, HumanEval, MATH, and more. No hype. Just numbers.',
        status: 'building' as const,
        to: null,
    },
    {
        num: '05',
        title: 'The Automation Clock',
        desc: "A data-driven instrument tracking AI\u2019s displacement trajectory across every job category. How far are we, really?",
        status: 'building' as const,
        to: null,
    },
];

function ModuleGrid() {
    const [expandedCard, setExpandedCard] = useState<string | null>(null);

    return (
        <section
            id="module-grid"
            aria-labelledby="modules-heading"
            style={{
                paddingBlock: 'var(--s8)',
                borderBottom: '1px solid var(--stroke)',
            }}
        >
            <div className="depth-container" style={{ maxWidth: '1100px', margin: '0 auto' }}>
                <Reveal>
                    <p style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: 'var(--text-xs)',
                        color: 'var(--muted)',
                        textTransform: 'uppercase',
                        letterSpacing: 'var(--tracking-wider)',
                        marginBottom: 'var(--s3)',
                    }}>
                        WHAT WE'RE BUILDING
                    </p>
                    <h2 id="modules-heading" style={{
                        fontSize: 'var(--text-2xl)',
                        fontWeight: 'var(--weight-semibold)',
                        letterSpacing: 'var(--tracking-snug)',
                        marginBottom: 'var(--s6)',
                        color: 'var(--ink)',
                    }}>
                        Five modules. One complete picture of AI.
                    </h2>
                </Reveal>

                {/* 2×2 grid + full-width 5th card */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s3)' }}>
                    <div className="module-grid-inner" style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(2, 1fr)',
                        gap: 'var(--s3)',
                    }}>
                        {MODULES.slice(0, 4).map((mod, i) => (
                            <Reveal key={mod.num} delay={i * 0.06}>
                                <ModuleCard
                                    mod={mod}
                                    expanded={expandedCard === mod.num}
                                    onExpand={() => setExpandedCard(expandedCard === mod.num ? null : mod.num)}
                                />
                            </Reveal>
                        ))}
                    </div>
                    <Reveal delay={0.24}>
                        <ModuleCard
                            mod={MODULES[4]}
                            fullWidth
                            expanded={expandedCard === MODULES[4].num}
                            onExpand={() => setExpandedCard(expandedCard === MODULES[4].num ? null : MODULES[4].num)}
                        />
                    </Reveal>
                </div>
            </div>
            <style>{`
                @media (max-width: 720px) {
                    .module-grid-inner { grid-template-columns: 1fr !important; }
                }
            `}</style>
        </section>
    );
}

function ModuleCard({
    mod,
    fullWidth: _fullWidth = false,
    expanded,
    onExpand,
}: {
    mod: typeof MODULES[0];
    fullWidth?: boolean;
    expanded: boolean;
    onExpand: () => void;
}) {
    const isLive = mod.status === 'live';

    const cardContent = (
        <motion.div
            whileHover={isLive ? { y: -2, boxShadow: 'var(--shadow-lift)' } : {}}
            transition={{ duration: 0.15 }}
            style={{
                padding: 'var(--s6)',
                background: 'var(--bg-panel)',
                borderRadius: 'var(--r-lg)',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--s3)',
                cursor: isLive ? 'pointer' : 'default',
                height: '100%',
            }}
            onClick={!isLive ? onExpand : undefined}
        >
            {/* Top row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>
                    {mod.num}
                </span>
                {isLive ? (
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-2xs)', color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span style={{ color: 'var(--ink)' }}>●</span> live
                    </span>
                ) : (
                    <span style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: 'var(--text-2xs)',
                        color: 'var(--muted)',
                        background: 'var(--bg-raised)',
                        borderRadius: 'var(--r-pill)',
                        padding: '2px 8px',
                    }}>
                        building
                    </span>
                )}
            </div>

            {/* Module name */}
            <h3 style={{
                fontSize: 'var(--text-lg)',
                fontWeight: 'var(--weight-semibold)',
                letterSpacing: 'var(--tracking-snug)',
                color: 'var(--ink)',
                opacity: isLive ? 1 : 0.55,
                margin: 0,
            }}>
                {mod.title}
            </h3>

            {/* Description */}
            <p style={{
                fontSize: 'var(--text-sm)',
                fontWeight: 'var(--weight-light)',
                color: 'var(--secondary)',
                lineHeight: 'var(--lead-body)',
                flex: 1,
                margin: 0,
            }}>
                {mod.desc}
            </p>

            {/* Bottom row */}
            <div style={{ marginTop: 'var(--s5)' }}>
                {isLive ? (
                    <span style={{
                        fontFamily: 'var(--font-sans)',
                        fontSize: 'var(--text-sm)',
                        fontWeight: 'var(--weight-medium)',
                        color: 'var(--ink)',
                    }}>
                        Open Explainer →
                    </span>
                ) : (
                    <motion.p
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: expanded ? 1 : 0, y: expanded ? 0 : 4 }}
                        transition={{ duration: 0.22, ease: [0.2, 0, 0, 1] }}
                        style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: 'var(--text-xs)',
                            color: 'var(--muted)',
                            margin: 0,
                            height: expanded ? 'auto' : 0,
                            overflow: 'hidden',
                        }}
                    >
                        This module is being built. Coming soon.
                    </motion.p>
                )}
            </div>
        </motion.div>
    );

    if (isLive && mod.to) {
        return (
            <Link to={mod.to} style={{ textDecoration: 'none', display: 'block', height: '100%' }}>
                {cardContent}
            </Link>
        );
    }

    return <div style={{ height: '100%' }}>{cardContent}</div>;
}

// ─── Transformer Visualizer Section ────────────────────────────────────────

const PIPELINE_PILLS = [
    '01 Input', '02 Tokenize', '03 Token IDs', '04 Embed',
    '05 Pos Enc', '06 Attention', '07 Residual', '08 LayerNorm',
    '09 FFN', '10 LM Head', '11 Softmax', '12 Sample',
];

function TransformerSection() {
    return (
        <section
            aria-labelledby="transformer-heading"
            style={{
                paddingBlock: 'var(--s8)',
                borderBottom: '1px solid var(--stroke)',
            }}
        >
            <div className="depth-container" style={{ maxWidth: '900px', margin: '0 auto' }}>
                <Reveal>
                    <p style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: 'var(--text-xs)',
                        color: 'var(--muted)',
                        textTransform: 'uppercase',
                        letterSpacing: 'var(--tracking-wider)',
                    }}>
                        MODULE 02 — LIVE
                    </p>
                </Reveal>

                <Reveal delay={0.05}>
                    <h2 id="transformer-heading" style={{
                        fontSize: 'var(--text-3xl)',
                        fontWeight: 'var(--weight-semibold)',
                        letterSpacing: 'var(--tracking-tight)',
                        lineHeight: 'var(--lead-tight)',
                        color: 'var(--ink)',
                        marginTop: 'var(--s3)',
                    }}>
                        How LLMs Work.
                    </h2>
                </Reveal>

                <Reveal delay={0.1}>
                    <p style={{
                        fontSize: 'var(--text-md)',
                        fontWeight: 'var(--weight-light)',
                        color: 'var(--secondary)',
                        maxWidth: '52ch',
                        lineHeight: 'var(--lead-body)',
                        marginTop: 'var(--s4)',
                    }}>
                        Step through every layer of a large language model —
                        from raw text to sampled token. Interactive, precise,
                        no handwaving. Every matrix multiply runs in your browser.
                    </p>
                </Reveal>

                {/* Pipeline step pills */}
                <Reveal delay={0.15}>
                    <div
                        className="marquee-container"
                        style={{
                            overflow: 'hidden',
                            marginTop: 'var(--s6)',
                            paddingBottom: '4px',
                            maskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)',
                            WebkitMaskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)',
                        }}
                    >
                        <div
                            className="animate-marquee-rtl"
                            style={{
                                display: 'flex',
                                width: 'max-content',
                            }}
                        >
                            {/* Duplicate array for seamless infinite looping */}
                            {[1, 2].map((groupKey) => (
                                <div
                                    key={groupKey}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 'var(--s2)',
                                        paddingRight: 'var(--s6)', // Gap between loops
                                    }}
                                >
                                    {PIPELINE_PILLS.map((step, i) => (
                                        <div key={step} style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                                            <span style={{
                                                fontFamily: 'var(--font-mono)',
                                                fontSize: 'var(--text-xs)',
                                                color: 'var(--primary)',
                                                background: 'var(--bg-panel)',
                                                border: '1px solid var(--stroke)',
                                                borderRadius: 'var(--r-pill)',
                                                padding: 'var(--s2) var(--s4)',
                                                whiteSpace: 'nowrap',
                                            }}>
                                                {step}
                                            </span>
                                            {i < PIPELINE_PILLS.length - 1 && (
                                                <span style={{
                                                    color: 'var(--muted)',
                                                    fontFamily: 'var(--font-sans)',
                                                    fontSize: 'var(--text-sm)',
                                                    margin: '0 var(--s2)',
                                                }}>→</span>
                                            )}
                                        </div>
                                    ))}
                                    {/* Visual separator end of loop */}
                                    <div style={{
                                        width: '1px',
                                        height: '24px',
                                        background: 'var(--stroke)',
                                        margin: '0 var(--s8)', // Large gap here
                                    }} />
                                    <span style={{
                                        fontFamily: 'var(--font-mono)',
                                        fontSize: 'var(--text-xs)',
                                        color: 'var(--muted)',
                                        letterSpacing: 'var(--tracking-wider)',
                                        marginRight: 'var(--s8)', // Large gap before the loop restarts
                                        whiteSpace: 'nowrap'
                                    }}>
                                        LOOP RESTART
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </Reveal>

                {/* CTA */}
                <Reveal delay={0.2}>
                    <div style={{ marginTop: 'var(--s6)' }}>
                        <Link
                            to="/transformer-simulator"
                            id="transformer-cta"
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 'var(--s2)',
                                padding: '0.6rem 1.25rem',
                                background: 'var(--bg-inverse)',
                                border: '1px solid var(--bg-inverse)',
                                borderRadius: 'var(--r-md)',
                                fontFamily: 'var(--font-sans)',
                                fontSize: 'var(--text-sm)',
                                fontWeight: 'var(--weight-medium)',
                                color: 'var(--text-inverse)',
                                textDecoration: 'none',
                                transition: `background var(--dur-fast) var(--ease-out)`,
                            }}
                            onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = '#333333'; }}
                            onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = 'var(--bg-inverse)'; }}
                        >
                            Open Visualizer →
                        </Link>
                    </div>
                </Reveal>
            </div>
        </section>
    );
}

// ─── Training Module Section ──────────────────────────────────────────────────

const TRAINING_PILLS = [
    '01 Dataset', '02 Tokenizer', '03 Architecture', '04 Pre-Train',
    '05 Eval', '06 SFT', '07 Alignment', '08 Benchmark',
    '09 Inference', '10 Deployment',
];

function TrainingSection() {
    return (
        <section
            aria-labelledby="training-heading"
            style={{
                paddingBlock: 'var(--s8)',
                borderBottom: '1px solid var(--stroke)',
                background: 'var(--bg-panel)',
            }}
        >
            <div className="depth-container" style={{ maxWidth: '900px', margin: '0 auto' }}>
                <Reveal>
                    <p style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: 'var(--text-xs)',
                        color: 'var(--muted)',
                        textTransform: 'uppercase',
                        letterSpacing: 'var(--tracking-wider)',
                    }}>
                        MODULE 03 — LIVE
                    </p>
                </Reveal>

                <Reveal delay={0.05}>
                    <h2 id="training-heading" style={{
                        fontSize: 'var(--text-3xl)',
                        fontWeight: 'var(--weight-semibold)',
                        letterSpacing: 'var(--tracking-tight)',
                        lineHeight: 'var(--lead-tight)',
                        color: 'var(--ink)',
                        marginTop: 'var(--s3)',
                    }}>
                        How AI is Trained.
                    </h2>
                </Reveal>

                <Reveal delay={0.1}>
                    <p style={{
                        fontSize: 'var(--text-md)',
                        fontWeight: 'var(--weight-light)',
                        color: 'var(--secondary)',
                        maxWidth: '52ch',
                        lineHeight: 'var(--lead-body)',
                        marginTop: 'var(--s4)',
                    }}>
                        Pre-training, SFT, RLHF, DPO. How a model goes from random weights to something that can actually reason. 10 step interactive walkthrough.
                    </p>
                </Reveal>

                {/* Pipeline step pills */}
                <Reveal delay={0.15}>
                    <div
                        className="marquee-container"
                        style={{
                            overflow: 'hidden',
                            marginTop: 'var(--s6)',
                            paddingBottom: '4px',
                            maskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)',
                            WebkitMaskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)',
                        }}
                    >
                        <div
                            className="animate-marquee-rtl"
                            style={{
                                display: 'flex',
                                width: 'max-content',
                            }}
                        >
                            {/* Duplicate array for seamless infinite looping */}
                            {[1, 2].map((groupKey) => (
                                <div
                                    key={groupKey}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 'var(--s2)',
                                        paddingRight: 'var(--s6)', // Gap between loops
                                    }}
                                >
                                    {TRAINING_PILLS.map((step, i) => (
                                        <div key={step} style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                                            <span style={{
                                                fontFamily: 'var(--font-mono)',
                                                fontSize: 'var(--text-xs)',
                                                color: 'var(--primary)',
                                                background: 'var(--bg)',
                                                border: '1px solid var(--stroke)',
                                                borderRadius: 'var(--r-pill)',
                                                padding: 'var(--s2) var(--s4)',
                                                whiteSpace: 'nowrap',
                                            }}>
                                                {step}
                                            </span>
                                            {i < TRAINING_PILLS.length - 1 && (
                                                <span style={{
                                                    color: 'var(--muted)',
                                                    fontFamily: 'var(--font-sans)',
                                                    fontSize: 'var(--text-sm)',
                                                    margin: '0 var(--s2)',
                                                }}>→</span>
                                            )}
                                        </div>
                                    ))}
                                    {/* Visual separator end of loop */}
                                    <div style={{
                                        width: '1px',
                                        height: '24px',
                                        background: 'var(--stroke)',
                                        margin: '0 var(--s8)', // Large gap here
                                    }} />
                                    <span style={{
                                        fontFamily: 'var(--font-mono)',
                                        fontSize: 'var(--text-xs)',
                                        color: 'var(--muted)',
                                        letterSpacing: 'var(--tracking-wider)',
                                        marginRight: 'var(--s8)', // Large gap before the loop restarts
                                        whiteSpace: 'nowrap'
                                    }}>
                                        LOOP RESTART
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </Reveal>

                {/* CTA */}
                <Reveal delay={0.2}>
                    <div style={{ marginTop: 'var(--s6)' }}>
                        <Link
                            to="/transformer-training-simulator"
                            id="training-cta"
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 'var(--s2)',
                                padding: '0.6rem 1.25rem',
                                background: 'transparent',
                                border: '1px solid var(--stroke-dark)',
                                borderRadius: 'var(--r-md)',
                                fontFamily: 'var(--font-sans)',
                                fontSize: 'var(--text-sm)',
                                fontWeight: 'var(--weight-medium)',
                                color: 'var(--secondary)',
                                textDecoration: 'none',
                                transition: `all var(--dur-fast) var(--ease-out)`,
                            }}
                            onMouseEnter={(e) => {
                                const el = e.currentTarget;
                                el.style.background = 'var(--bg-raised)';
                                el.style.color = 'var(--ink)';
                                el.style.borderColor = 'var(--primary)';
                            }}
                            onMouseLeave={(e) => {
                                const el = e.currentTarget;
                                el.style.background = 'transparent';
                                el.style.color = 'var(--secondary)';
                                el.style.borderColor = 'var(--stroke-dark)';
                            }}
                        >
                            Open Walkthrough →
                        </Link>
                    </div>
                </Reveal>
            </div>
        </section>
    );
}

// ─── Timeline Section ──────────────────────────────────────────────────

const TIMELINE_STATS = [
    { label: 'Models tracked', value: '100+' },
    { label: 'Time span', value: '2017–2026' },
    { label: 'Data points', value: 'Parameters, open source, modalities' },
];

function TimelineSection() {
    return (
        <section
            aria-labelledby="timeline-heading"
            style={{
                paddingBlock: 'var(--s8)',
                borderBottom: '1px solid var(--stroke)',
                background: 'var(--bg)',
            }}
        >
            <div className="depth-container" style={{ maxWidth: '900px', margin: '0 auto' }}>
                <Reveal>
                    <p style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: 'var(--text-xs)',
                        color: 'var(--muted)',
                        textTransform: 'uppercase',
                        letterSpacing: 'var(--tracking-wider)',
                    }}>
                        MODULE 01 — LIVE
                    </p>
                </Reveal>

                <Reveal delay={0.05}>
                    <h2 id="timeline-heading" style={{
                        fontSize: 'var(--text-3xl)',
                        fontWeight: 'var(--weight-semibold)',
                        letterSpacing: 'var(--tracking-tight)',
                        lineHeight: 'var(--lead-tight)',
                        color: 'var(--ink)',
                        marginTop: 'var(--s3)',
                    }}>
                        AI Timeline.
                    </h2>
                </Reveal>

                <Reveal delay={0.1}>
                    <p style={{
                        fontSize: 'var(--text-md)',
                        fontWeight: 'var(--weight-light)',
                        color: 'var(--secondary)',
                        maxWidth: '52ch',
                        lineHeight: 'var(--lead-body)',
                        marginTop: 'var(--s4)',
                    }}>
                        Every model, every paper, every inflection point — on one zoomable, annotated timeline. Track the evolution of LLMs from the original transformer to today's multimodal giants.
                    </p>
                </Reveal>

                {/* Stats */}
                <Reveal delay={0.15}>
                    <div style={{ marginTop: 'var(--s5)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--s4)' }}>
                        {TIMELINE_STATS.map((stat) => (
                            <div
                                key={stat.label}
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 'var(--s2)',
                                    padding: 'var(--s4)',
                                    background: 'var(--bg-panel)',
                                    border: '1px solid var(--stroke)',
                                    borderRadius: 'var(--r-md)',
                                }}
                            >
                                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-lg)', color: 'var(--ink)', fontWeight: 'var(--weight-medium)' }}>
                                    {stat.value}
                                </span>
                                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>
                                    {stat.label}
                                </span>
                            </div>
                        ))}
                    </div>
                </Reveal>

                {/* CTA */}
                <Reveal delay={0.2}>
                    <div style={{ marginTop: 'var(--s6)' }}>
                        <Link
                            to="/timeline"
                            id="timeline-cta"
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 'var(--s2)',
                                padding: '0.6rem 1.25rem',
                                background: 'transparent',
                                border: '1px solid var(--stroke-dark)',
                                borderRadius: 'var(--r-md)',
                                fontFamily: 'var(--font-sans)',
                                fontSize: 'var(--text-sm)',
                                fontWeight: 'var(--weight-medium)',
                                color: 'var(--secondary)',
                                textDecoration: 'none',
                                transition: `all var(--dur-fast) var(--ease-out)`,
                            }}
                            onMouseEnter={(e) => {
                                const el = e.currentTarget;
                                el.style.background = 'var(--bg-raised)';
                                el.style.color = 'var(--ink)';
                                el.style.borderColor = 'var(--primary)';
                            }}
                            onMouseLeave={(e) => {
                                const el = e.currentTarget;
                                el.style.background = 'transparent';
                                el.style.color = 'var(--secondary)';
                                el.style.borderColor = 'var(--stroke-dark)';
                            }}
                        >
                            Open Timeline →
                        </Link>
                    </div>
                </Reveal>
            </div>
        </section>
    );
}

// ─── Automation Clock Teaser ────────────────────────────────────────────────

const CLOCK_STATS = [
    { label: 'Professions tracked', value: '47' },
    { label: 'Tasks analyzed', value: '800M+' },
    { label: 'Data last updated', value: 'Q1 2026' },
];

const CIRCUMFERENCE = 2 * Math.PI * 88; // r=88
const FILLED_RATIO = 0.34;

function AutomationClockTeaser() {
    const dashFilled = CIRCUMFERENCE * FILLED_RATIO;
    const dashGap = CIRCUMFERENCE - dashFilled;

    return (
        <section
            aria-labelledby="clock-heading"
            style={{
                paddingBlock: 'var(--s8)',
                borderBottom: '1px solid var(--stroke)',
            }}
        >
            <div className="depth-container" style={{ maxWidth: '900px', margin: '0 auto' }}>
                <div className="clock-layout" style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr auto',
                    gap: 'var(--s7)',
                    alignItems: 'center',
                }}>
                    {/* Left — text */}
                    <div>
                        <Reveal>
                            <p style={{
                                fontFamily: 'var(--font-mono)',
                                fontSize: 'var(--text-xs)',
                                color: 'var(--muted)',
                                textTransform: 'uppercase',
                                letterSpacing: 'var(--tracking-wider)',
                            }}>
                                MODULE 05 — THE AUTOMATION CLOCK
                            </p>
                        </Reveal>

                        <Reveal delay={0.05}>
                            <h2 id="clock-heading" style={{
                                fontSize: 'var(--text-2xl)',
                                fontWeight: 'var(--weight-semibold)',
                                letterSpacing: 'var(--tracking-snug)',
                                color: 'var(--ink)',
                                marginTop: 'var(--s3)',
                            }}>
                                How far are we, really?
                            </h2>
                        </Reveal>

                        <Reveal delay={0.1}>
                            <p style={{
                                fontSize: 'var(--text-sm)',
                                fontWeight: 'var(--weight-light)',
                                color: 'var(--secondary)',
                                lineHeight: 'var(--lead-body)',
                                marginTop: 'var(--s4)',
                                maxWidth: '44ch',
                            }}>
                                A precise, source-cited instrument tracking how far AI
                                has progressed in automating every major job category.
                                Not fear. Not hype. Just the trajectory, clearly shown.
                            </p>
                        </Reveal>

                        {/* Stats */}
                        <Reveal delay={0.15}>
                            <div style={{ marginTop: 'var(--s5)' }}>
                                {CLOCK_STATS.map((stat, i) => (
                                    <div
                                        key={stat.label}
                                        style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            padding: 'var(--s3) 0',
                                            borderBottom: i < CLOCK_STATS.length - 1 ? '1px solid var(--stroke)' : 'none',
                                            borderTop: i === 0 ? '1px solid var(--stroke)' : 'none',
                                        }}
                                    >
                                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>
                                            {stat.label}
                                        </span>
                                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--ink)', fontWeight: 'var(--weight-medium)' }}>
                                            {stat.value}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </Reveal>

                        <Reveal delay={0.2}>
                            <p style={{
                                fontFamily: 'var(--font-mono)',
                                fontSize: 'var(--text-xs)',
                                color: 'var(--muted)',
                                marginTop: 'var(--s4)',
                            }}>
                                Full interactive breakdown by profession — coming soon.
                            </p>
                        </Reveal>
                    </div>

                    {/* Right — clock visual */}
                    <Reveal delay={0.1}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--s3)' }}>
                            <svg
                                width="240"
                                height="240"
                                viewBox="0 0 240 240"
                                aria-label="Automation progress clock showing 34% of tasks automatable today"
                            >
                                {/* Outer ring */}
                                <circle
                                    cx="120"
                                    cy="120"
                                    r="108"
                                    fill="var(--bg-panel)"
                                    stroke="var(--stroke-dark)"
                                    strokeWidth="2"
                                />

                                {/* Background arc (unfilled) */}
                                <circle
                                    cx="120"
                                    cy="120"
                                    r="88"
                                    fill="none"
                                    stroke="var(--stroke)"
                                    strokeWidth="12"
                                    transform="rotate(-90 120 120)"
                                />

                                {/* Progress arc (filled 34%) */}
                                <motion.circle
                                    cx="120"
                                    cy="120"
                                    r="88"
                                    fill="none"
                                    stroke="var(--viz-accent)"
                                    strokeWidth="12"
                                    strokeLinecap="round"
                                    strokeDasharray={`${dashFilled} ${dashGap}`}
                                    transform="rotate(-90 120 120)"
                                    initial={{ strokeDasharray: `0 ${CIRCUMFERENCE}` }}
                                    animate={{ strokeDasharray: `${dashFilled} ${dashGap}` }}
                                    transition={{ duration: 1.4, delay: 0.3, ease: [0.2, 0, 0, 1] }}
                                />

                                {/* Center text */}
                                <text
                                    x="120"
                                    y="113"
                                    textAnchor="middle"
                                    fontSize="32"
                                    fontWeight="600"
                                    fontFamily="var(--font-sans)"
                                    fill="var(--ink)"
                                >
                                    34%
                                </text>
                                <text
                                    x="120"
                                    y="133"
                                    textAnchor="middle"
                                    fontSize="10"
                                    fontFamily="var(--font-mono)"
                                    fill="var(--muted)"
                                >
                                    of tasks
                                </text>
                                <text
                                    x="120"
                                    y="148"
                                    textAnchor="middle"
                                    fontSize="10"
                                    fontFamily="var(--font-mono)"
                                    fill="var(--muted)"
                                >
                                    automatable today
                                </text>
                            </svg>

                            <p style={{
                                fontFamily: 'var(--font-mono)',
                                fontSize: 'var(--text-xs)',
                                color: 'var(--secondary)',
                                textAlign: 'center',
                                maxWidth: '240px',
                            }}>
                                Projected general displacement: 2031–2038
                            </p>
                        </div>
                    </Reveal>
                </div>
            </div>
            <style>{`
                @media (max-width: 720px) {
                    .clock-layout { grid-template-columns: 1fr !important; }
                }
            `}</style>
        </section>
    );
}

// ─── Pipeline Steps Preview ────────────────────────────────────────────────

const PREVIEW_CHIPS = [
    { value: '3,200+', label: 'days of progress' },
    { value: '42', label: 'landmark papers' },
    { value: '1', label: 'zoomable timeline' },
    { value: '∞', label: 'potential to learn' },
];

function PipelinePreview() {
    return (
        <section
            aria-label="The Scale of AI"
            style={{
                paddingBlock: 'var(--s7)',
                borderBottom: '1px solid var(--stroke)',
            }}
        >
            <div className="depth-container" style={{ maxWidth: '900px', margin: '0 auto' }}>
                <Reveal>
                    <p style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: 'var(--text-xs)',
                        color: 'var(--muted)',
                        textTransform: 'uppercase',
                        letterSpacing: 'var(--tracking-wider)',
                    }}>
                        THE SCALE OF AI
                    </p>

                    <h2 style={{
                        fontSize: 'var(--text-xl)',
                        fontWeight: 'var(--weight-semibold)',
                        letterSpacing: 'var(--tracking-snug)',
                        color: 'var(--ink)',
                        marginTop: 'var(--s3)',
                    }}>
                        History in high definition.
                    </h2>
                </Reveal>

                <Reveal delay={0.08}>
                    <div style={{
                        display: 'flex',
                        gap: 'var(--s3)',
                        flexWrap: 'wrap',
                        marginTop: 'var(--s5)',
                    }}>
                        {PREVIEW_CHIPS.map((chip) => (
                            <div
                                key={chip.label}
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    background: 'var(--bg-panel)',
                                    border: '1px solid var(--stroke)',
                                    borderRadius: 'var(--r-pill)',
                                    padding: 'var(--s2) var(--s5)',
                                    minWidth: '130px',
                                    textAlign: 'center',
                                }}
                            >
                                <span style={{
                                    fontFamily: 'var(--font-mono)',
                                    fontSize: 'var(--text-xl)',
                                    fontWeight: 'var(--weight-medium)',
                                    color: 'var(--ink)',
                                    lineHeight: 1.2,
                                }}>
                                    {chip.value}
                                </span>
                                <span style={{
                                    fontFamily: 'var(--font-mono)',
                                    fontSize: 'var(--text-xs)',
                                    color: 'var(--secondary)',
                                }}>
                                    {chip.label}
                                </span>
                            </div>
                        ))}
                    </div>
                </Reveal>

                <Reveal delay={0.12}>
                    <p style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: 'var(--text-xs)',
                        color: 'var(--muted)',
                        marginTop: 'var(--s4)',
                    }}>
                        An interactive guide to the technological revolution, updated weekly.
                    </p>
                </Reveal>
            </div>
        </section>
    );
}

// ─── Footer ────────────────────────────────────────────────────────────────

function Footer() {
    return (
        <footer
            aria-label="Site footer"
            style={{
                paddingBlock: 'var(--s6)',
                borderTop: '1px solid var(--stroke)',
            }}
        >
            <div className="depth-container" style={{ maxWidth: '1100px', margin: '0 auto' }}>
                {/* Row 1 */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: 'var(--s3)',
                }}>
                    <span style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: 'var(--text-xs)',
                        color: 'var(--ink)',
                    }}>
                        AI Beacon — LLM Visualizer
                    </span>

                    <div style={{ display: 'flex', gap: 'var(--s5)', alignItems: 'center' }}>
                        <a
                            href="https://github.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                                fontFamily: 'var(--font-sans)',
                                fontSize: 'var(--text-xs)',
                                color: 'var(--secondary)',
                                textDecoration: 'none',
                                transition: `color var(--dur-fast) var(--ease-out)`,
                            }}
                            onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = 'var(--ink)'; }}
                            onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = 'var(--secondary)'; }}
                        >
                            GitHub
                        </a>
                        <Link
                            to="/transformer-simulator"
                            style={{
                                fontFamily: 'var(--font-sans)',
                                fontSize: 'var(--text-xs)',
                                color: 'var(--secondary)',
                                textDecoration: 'none',
                                transition: `color var(--dur-fast) var(--ease-out)`,
                            }}
                            onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = 'var(--ink)'; }}
                            onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = 'var(--secondary)'; }}
                        >
                            Visualizer
                        </Link>
                    </div>

                    <span style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: 'var(--text-xs)',
                        color: 'var(--muted)',
                    }}>
                        Open source — MIT
                    </span>
                </div>

                {/* Row 2 */}
                <div style={{
                    textAlign: 'center',
                    marginTop: 'var(--s4)',
                }}>
                    <span style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: 'var(--text-xs)',
                        color: 'var(--muted)',
                    }}>
                        Built to make AI legible.
                    </span>
                </div>
            </div>
        </footer>
    );
}

// ─── Home ──────────────────────────────────────────────────────────────────

export function Home() {
    const homeStructuredData = {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        'name': 'AI Beacon LLM Visualizer',
        'operatingSystem': 'Web',
        'applicationCategory': 'EducationalApplication',
        'description': 'An interactive, step-by-step visualizer for Large Language Models (Transformers). Explore tokenization, attention, and sampling.',
        'offers': {
            '@type': 'Offer',
            'price': '0',
            'priceCurrency': 'USD',
        },
        'author': {
            '@type': 'Organization',
            'name': 'AI Beacon Project',
        },
    };

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
            <SEO structuredData={homeStructuredData} />
            <Nav />
            <main>
                <Hero />
                <ModuleGrid />
                <TimelineSection />
                <TransformerSection />
                <TrainingSection />
                <AutomationClockTeaser />
                <PipelinePreview />
            </main>
            <Footer />
            <style>{`
                @keyframes marquee-rtl {
                    from { transform: translateX(0); }
                    to { transform: translateX(-50%); }
                }

                .animate-marquee-rtl {
                    animation: marquee-rtl 25s linear infinite;
                }

                .marquee-container:hover .animate-marquee-rtl {
                    animation-play-state: paused;
                }

                /* Respect prefers-reduced-motion */
                @media (prefers-reduced-motion: reduce) {
                    .animate-marquee-rtl {
                        animation: none !important;
                        transform: translateX(0) !important;
                    }
                }
            `}</style>
        </div>
    );
}
