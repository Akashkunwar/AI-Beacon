// src/pages/Training.tsx
// Module 02 — How LLMs Are Trained
// 10-step interactive walkthrough with fixed sidebar, step transitions,
// keyboard navigation, and mobile horizontal pill nav.
// Monochrome only. No colour. All values from src/tokens.css.

import { useState, useEffect, useCallback, useReducer } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Nav } from '@/components/shared/Nav';
import { ErrorBoundary } from '@/components/shared/ErrorBoundary';
import { SEO } from '@/components/common/SEO';
import { Step01DataCollection } from '@/components/training/Step01DataCollection';
import { Step02Tokenizer } from '@/components/training/Step02Tokenizer';
import { Step03Architecture } from '@/components/training/Step03Architecture';
import { Step04PreTraining } from '@/components/training/Step04PreTraining';
import { Step05Evaluation } from '@/components/training/Step05Evaluation';
import { Step06SFT } from '@/components/training/Step06SFT';
import { Step07Alignment } from '@/components/training/Step07Alignment';
import { Step08Benchmarking } from '@/components/training/Step08Benchmarking';
import { Step09Inference } from '@/components/training/Step09Inference';
import { Step10Deployment } from '@/components/training/Step10Deployment';

// ─── Step definitions ───────────────────────────────────────────────────────

const STEPS = [
    { num: '01', label: 'Data Collection' },
    { num: '02', label: 'Tokenizer Training' },
    { num: '03', label: 'Architecture Design' },
    { num: '04', label: 'Pre-Training' },
    { num: '05', label: 'Training Evaluation' },
    { num: '06', label: 'Supervised Fine-Tuning' },
    { num: '07', label: 'Alignment' },
    { num: '08', label: 'Benchmarking' },
    { num: '09', label: 'Inference Optimization' },
    { num: '10', label: 'Deployment' },
] as const;

const TOTAL_STEPS = STEPS.length;

// ─── Step placeholder component ─────────────────────────────────────────────

interface StepPlaceholderProps {
    stepNumber: number;
    totalSteps: number;
    onNext: () => void;
    onPrev: () => void;
}

function StepPlaceholder({ stepNumber }: StepPlaceholderProps) {
    const step = STEPS[stepNumber];
    return (
        <div
            style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            <p
                style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 'var(--text-sm)',
                    color: 'var(--muted)',
                    textAlign: 'center',
                }}
            >
                Step {step.num} — {step.label} — content coming soon
            </p>
        </div>
    );
}

// ─── Step content with animated transition ──────────────────────────────────

interface StepContentProps {
    activeStep: number;
    onNext: () => void;
    onPrev: () => void;
    shouldReduceMotion: boolean | null;
}

function StepContent({ activeStep, onNext, onPrev, shouldReduceMotion }: StepContentProps) {
    // direction reducer: 1 = forward, -1 = backward
    const [direction, setDirection] = useReducer(
        (_: number, next: number) => next,
        1,
    );

    const variants = {
        enter: (dir: number) => ({
            opacity: 0,
            y: shouldReduceMotion ? 0 : dir * 10,
        }),
        center: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: 0 },
    };

    const handleNext = useCallback(() => {
        setDirection(1);
        onNext();
    }, [onNext]);

    const handlePrev = useCallback(() => {
        setDirection(-1);
        onPrev();
    }, [onPrev]);

    const isFirst = activeStep === 0;
    const isLast = activeStep === TOTAL_STEPS - 1;

    const btnBase: React.CSSProperties = {
        fontFamily: 'var(--font-sans)',
        fontSize: 'var(--text-sm)',
        fontWeight: 'var(--weight-medium)',
        color: 'var(--secondary)',
        background: 'transparent',
        border: '1px solid var(--stroke-dark)',
        borderRadius: 'var(--r-md)',
        padding: 'var(--s2) var(--s4)',
        cursor: 'pointer',
        transition: `all var(--dur-fast) var(--ease-out)`,
    };

    return (
        <div
            style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                padding: 'var(--s7) var(--s6)',
                background: 'var(--bg)',
                minHeight: 0,
                overflow: 'auto',
            }}
        >
            {/* Animated step content */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <AnimatePresence mode="wait" custom={direction}>
                    <motion.div
                        key={activeStep}
                        custom={direction}
                        variants={variants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={
                            shouldReduceMotion
                                ? { duration: 0 }
                                : {
                                    exit: { duration: 0.08, ease: [0.2, 0, 0, 1] },
                                    enter: { duration: 0.2, ease: [0.2, 0, 0, 1] },
                                }
                        }
                        style={{ flex: 1, display: 'flex', flexDirection: 'column' }}
                    >
                        {activeStep === 0 ? (
                            <Step01DataCollection
                                stepNumber={activeStep + 1}
                                totalSteps={TOTAL_STEPS}
                                onNext={handleNext}
                                onPrev={handlePrev}
                            />
                        ) : activeStep === 1 ? (
                            <Step02Tokenizer
                                stepNumber={activeStep + 1}
                                totalSteps={TOTAL_STEPS}
                                onNext={handleNext}
                                onPrev={handlePrev}
                            />
                        ) : activeStep === 2 ? (
                            <Step03Architecture
                                stepNumber={activeStep + 1}
                                totalSteps={TOTAL_STEPS}
                                onNext={handleNext}
                                onPrev={handlePrev}
                            />
                        ) : activeStep === 3 ? (
                            <Step04PreTraining
                                stepNumber={activeStep + 1}
                                totalSteps={TOTAL_STEPS}
                                onNext={handleNext}
                                onPrev={handlePrev}
                            />
                        ) : activeStep === 4 ? (
                            <Step05Evaluation
                                stepNumber={activeStep + 1}
                                totalSteps={TOTAL_STEPS}
                                onNext={handleNext}
                                onPrev={handlePrev}
                            />
                        ) : activeStep === 5 ? (
                            <Step06SFT
                                stepNumber={activeStep + 1}
                                totalSteps={TOTAL_STEPS}
                                onNext={handleNext}
                                onPrev={handlePrev}
                            />
                        ) : activeStep === 6 ? (
                            <Step07Alignment
                                stepNumber={activeStep + 1}
                                totalSteps={TOTAL_STEPS}
                                onNext={handleNext}
                                onPrev={handlePrev}
                            />
                        ) : activeStep === 7 ? (
                            <Step08Benchmarking
                                stepNumber={activeStep + 1}
                                totalSteps={TOTAL_STEPS}
                                onNext={handleNext}
                                onPrev={handlePrev}
                            />
                        ) : activeStep === 8 ? (
                            <Step09Inference
                                stepNumber={activeStep + 1}
                                totalSteps={TOTAL_STEPS}
                                onNext={handleNext}
                                onPrev={handlePrev}
                            />
                        ) : activeStep === 9 ? (
                            <Step10Deployment
                                stepNumber={activeStep + 1}
                                totalSteps={TOTAL_STEPS}
                                onNext={handleNext}
                                onPrev={handlePrev}
                            />
                        ) : (
                            <StepPlaceholder
                                stepNumber={activeStep}
                                totalSteps={TOTAL_STEPS}
                                onNext={handleNext}
                                onPrev={handlePrev}
                            />
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Step footer */}
            <footer
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderTop: '1px solid var(--stroke)',
                    paddingTop: 'var(--s5)',
                    marginTop: 'var(--s7)',
                }}
            >
                {/* Previous */}
                <div style={{ minWidth: '100px' }}>
                    {!isFirst && (
                        <button
                            id="training-prev-btn"
                            style={btnBase}
                            onClick={handlePrev}
                            onMouseEnter={(e) => {
                                const el = e.currentTarget;
                                el.style.background = 'var(--bg-panel)';
                                el.style.color = 'var(--ink)';
                                el.style.borderColor = 'var(--primary)';
                            }}
                            onMouseLeave={(e) => {
                                const el = e.currentTarget;
                                el.style.background = 'transparent';
                                el.style.color = 'var(--secondary)';
                                el.style.borderColor = 'var(--stroke-dark)';
                            }}
                            aria-label="Go to previous step"
                        >
                            ← Previous
                        </button>
                    )}
                </div>

                {/* Center step count */}
                <p
                    style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: 'var(--text-xs)',
                        color: 'var(--muted)',
                        margin: 0,
                    }}
                    aria-live="polite"
                    aria-atomic="true"
                >
                    Step {activeStep + 1} of {TOTAL_STEPS}
                </p>

                {/* Next */}
                <div style={{ minWidth: '100px', textAlign: 'right' }}>
                    {!isLast && (
                        <button
                            id="training-next-btn"
                            style={btnBase}
                            onClick={handleNext}
                            onMouseEnter={(e) => {
                                const el = e.currentTarget;
                                el.style.background = 'var(--bg-panel)';
                                el.style.color = 'var(--ink)';
                                el.style.borderColor = 'var(--primary)';
                            }}
                            onMouseLeave={(e) => {
                                const el = e.currentTarget;
                                el.style.background = 'transparent';
                                el.style.color = 'var(--secondary)';
                                el.style.borderColor = 'var(--stroke-dark)';
                            }}
                            aria-label="Go to next step"
                        >
                            Next →
                        </button>
                    )}
                </div>
            </footer>
        </div>
    );
}

// ─── Sidebar ─────────────────────────────────────────────────────────────────

interface SidebarProps {
    activeStep: number;
    onSelectStep: (index: number) => void;
}

function Sidebar({ activeStep, onSelectStep }: SidebarProps) {
    return (
        <aside
            aria-label="Training module steps"
            style={{
                width: '240px',
                flexShrink: 0,
                background: 'var(--bg-panel)',
                borderRight: '1px solid var(--stroke)',
                display: 'flex',
                flexDirection: 'column',
                position: 'sticky',
                top: '52px',
                height: 'calc(100vh - 52px)',
                overflowY: 'auto',
            }}
        >
            {/* Module title */}
            <div
                style={{
                    padding: 'var(--s5) var(--s4) var(--s3)',
                    borderBottom: '1px solid var(--stroke)',
                }}
            >
                <p
                    style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: 'var(--text-xs)',
                        color: 'var(--muted)',
                        textTransform: 'uppercase',
                        letterSpacing: 'var(--tracking-wider)',
                        margin: 0,
                    }}
                >
                    How LLMs Are Trained
                </p>
            </div>

            {/* Step nav items */}
            <nav aria-label="Steps in this module" style={{ flex: 1 }}>
                {STEPS.map((step, index) => {
                    const isActive = index === activeStep;
                    return (
                        <button
                            key={step.num}
                            id={`training-step-${step.num}`}
                            onClick={() => onSelectStep(index)}
                            aria-current={isActive ? 'step' : undefined}
                            aria-label={`Step ${step.num}: ${step.label}`}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 'var(--s3)',
                                width: '100%',
                                padding: 'var(--s3) var(--s4)',
                                background: isActive ? 'var(--bg-raised)' : 'transparent',
                                border: 'none',
                                borderLeft: isActive
                                    ? '2px solid var(--ink)'
                                    : '2px solid transparent',
                                cursor: 'pointer',
                                textAlign: 'left',
                                transition: `background var(--dur-fast) var(--ease-out), border-color var(--dur-fast) var(--ease-out)`,
                            }}
                            onMouseEnter={(e) => {
                                if (!isActive) {
                                    e.currentTarget.style.background = 'var(--bg-raised)';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (!isActive) {
                                    e.currentTarget.style.background = 'transparent';
                                }
                            }}
                        >
                            <span
                                style={{
                                    fontFamily: 'var(--font-mono)',
                                    fontSize: 'var(--text-xs)',
                                    color: isActive ? 'var(--muted)' : 'var(--muted)',
                                    flexShrink: 0,
                                    width: '1.5em',
                                }}
                            >
                                {step.num}
                            </span>
                            <span
                                style={{
                                    fontFamily: 'var(--font-mono)',
                                    fontSize: 'var(--text-xs)',
                                    color: isActive ? 'var(--ink)' : 'var(--secondary)',
                                    fontWeight: isActive ? 'var(--weight-medium)' : 'var(--weight-regular)',
                                }}
                            >
                                {step.label}
                            </span>
                        </button>
                    );
                })}
            </nav>
        </aside>
    );
}

// ─── Mobile pill nav ─────────────────────────────────────────────────────────

interface MobilePillNavProps {
    activeStep: number;
    onSelectStep: (index: number) => void;
}

function MobilePillNav({ activeStep, onSelectStep }: MobilePillNavProps) {
    return (
        <div
            role="navigation"
            aria-label="Training module steps"
            style={{
                display: 'flex',
                gap: 'var(--s2)',
                overflowX: 'auto',
                scrollbarWidth: 'none',
                padding: 'var(--s3) var(--s4)',
                borderBottom: '1px solid var(--stroke)',
                background: 'var(--bg-panel)',
            }}
        >
            {STEPS.map((step, index) => {
                const isActive = index === activeStep;
                return (
                    <button
                        key={step.num}
                        id={`training-mobile-step-${step.num}`}
                        onClick={() => onSelectStep(index)}
                        aria-current={isActive ? 'step' : undefined}
                        aria-label={`Step ${step.num}: ${step.label}`}
                        style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: 'var(--text-xs)',
                            color: isActive ? 'var(--ink)' : 'var(--secondary)',
                            fontWeight: isActive ? 'var(--weight-medium)' : 'var(--weight-regular)',
                            background: isActive ? 'var(--bg-raised)' : 'transparent',
                            border: isActive
                                ? '1px solid var(--stroke-dark)'
                                : '1px solid var(--stroke)',
                            borderRadius: 'var(--r-pill)',
                            padding: 'var(--s2) var(--s3)',
                            cursor: 'pointer',
                            whiteSpace: 'nowrap',
                            flexShrink: 0,
                            minHeight: '44px',
                            transition: `all var(--dur-fast) var(--ease-out)`,
                        }}
                    >
                        {step.num} {step.label}
                    </button>
                );
            })}
        </div>
    );
}

// ─── Training page ────────────────────────────────────────────────────────────

export function Training() {
    const trainingStructuredData = {
        '@context': 'https://schema.org',
        '@type': 'HowTo',
        'name': 'How LLMs are trained: A 10-step guide',
        'description': 'Step-by-step interactive walkthrough explaining the lifecycle of training a large language model.',
        'step': STEPS.map((s, i) => ({
            '@type': 'HowToStep',
            'position': i + 1,
            'name': s.label,
            'url': `https://depth-llm.vercel.app/transformer-training-simulator#step-${s.num}`,
        })),
    };

    const [activeStep, setActiveStep] = useState(0);
    const shouldReduceMotion = useReducedMotion();

    const goNext = useCallback(() => {
        setActiveStep((s) => Math.min(s + 1, TOTAL_STEPS - 1));
    }, []);

    const goPrev = useCallback(() => {
        setActiveStep((s) => Math.max(s - 1, 0));
    }, []);

    const goToStep = useCallback((index: number) => {
        setActiveStep(Math.max(0, Math.min(index, TOTAL_STEPS - 1)));
    }, []);

    // Keyboard navigation: arrow left/right
    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
            if (e.key === 'ArrowRight') { e.preventDefault(); goNext(); }
            if (e.key === 'ArrowLeft') { e.preventDefault(); goPrev(); }
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [goNext, goPrev]);

    return (
        <ErrorBoundary>
            <SEO
                title="LLM Training Pipeline"
                description="Interactive 10-step walkthrough of how Large Language Models are trained. From data collection to deployment."
                structuredData={trainingStructuredData}
            />
            <div
                style={{
                    minHeight: '100vh',
                    background: 'var(--bg)',
                    display: 'flex',
                    flexDirection: 'column',
                }}
            >
                {/* Global Header */}
                <Nav activeRoute="/transformer-training-simulator" />

                {/*
                 * Desktop layout: sidebar + content side-by-side.
                 * Mobile (<720px): sidebar hidden; mobile pill nav shown above content.
                 */}
                <div
                    className="training-layout"
                    style={{
                        flex: 1,
                        display: 'flex',
                        minHeight: 0,
                    }}
                >
                    {/* Desktop sidebar (hidden on mobile via CSS) */}
                    <div className="training-sidebar">
                        <Sidebar activeStep={activeStep} onSelectStep={goToStep} />
                    </div>

                    {/* Main content column */}
                    <main
                        aria-label="Training step content"
                        style={{
                            flex: 1,
                            display: 'flex',
                            flexDirection: 'column',
                            minWidth: 0,
                            minHeight: '100vh',
                        }}
                    >
                        {/* Mobile-only: Pill row */}
                        <div className="training-mobile-header">
                            <MobilePillNav activeStep={activeStep} onSelectStep={goToStep} />
                        </div>

                        {/* Step content (animated) */}
                        <StepContent
                            activeStep={activeStep}
                            onNext={goNext}
                            onPrev={goPrev}
                            shouldReduceMotion={shouldReduceMotion}
                        />
                    </main>
                </div>

                {/* Responsive styles */}
                <style>{`
                    /* Desktop: sidebar visible, no mobile header */
                    .training-sidebar { display: flex; }
                    .training-mobile-header { display: none; }

                    /* Mobile: hide sidebar, show mobile header */
                    @media (max-width: 719px) {
                        .training-sidebar { display: none !important; }
                        .training-mobile-header { display: block; }
                    }

                    /* Focus outline for sidebar step buttons */
                    #training-prev-btn:focus-visible,
                    #training-next-btn:focus-visible {
                        outline: 2px solid var(--stroke-dark);
                        outline-offset: 2px;
                    }

                    /* Focus for sidebar nav items */
                    [id^="training-step-"]:focus-visible,
                    [id^="training-mobile-step-"]:focus-visible {
                        outline: 2px solid var(--stroke-dark);
                        outline-offset: 2px;
                    }

                    /* Hide scrollbar on mobile pill nav */
                    .training-mobile-header nav::-webkit-scrollbar { display: none; }

                    /* Respect prefers-reduced-motion */
                    @media (prefers-reduced-motion: reduce) {
                        * { transition-duration: 0ms !important; animation-duration: 0ms !important; }
                    }
                `}</style>
            </div>
        </ErrorBoundary>
    );
}
