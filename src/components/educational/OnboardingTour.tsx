// src/components/educational/OnboardingTour.tsx
// 5-step guided tour shown on first visit (tracked via localStorage).
// Uses a modal overlay with animated spotlight hints per step.
// Keyboard: Escape to skip, Enter/→ to advance.

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';

// ─── Constants ────────────────────────────────────────────────────────────

const TOUR_SEEN_KEY = 'ai-beacon-tour-seen';

// ─── Tour Steps ───────────────────────────────────────────────────────────

interface TourStep {
    id: string;
    title: string;
    body: string;
    emoji: string;
    /** CSS selector (or null) for the element to highlight. */
    highlightSelector: string | null;
    /** Position of the tooltip card relative to viewport */
    position: 'center' | 'bottom-center' | 'top-center';
}

const TOUR_STEPS: TourStep[] = [
    {
        id: 'welcome',
        title: 'Welcome to AI Beacon',
        body: 'AI Beacon lets you step through the internals of a large language model — one matrix at a time. Every number is computed live from your own input.',
        emoji: '🌊',
        highlightSelector: null,
        position: 'center',
    },
    {
        id: 'input',
        title: 'Type your sentence',
        body: 'Enter up to 8 words in the text input. The model will process your exact words through every transformer step — tokenization, attention, and more.',
        emoji: '✏️',
        highlightSelector: '#input-text-field',
        position: 'bottom-center',
    },
    {
        id: 'step',
        title: 'Step through the pipeline',
        body: 'Click "Step →" to advance one stage at a time, or "Play All" to watch the full forward pass animate automatically.',
        emoji: '▶',
        highlightSelector: '#playback-step',
        position: 'top-center',
    },
    {
        id: 'tooltips',
        title: 'Hover anything for details',
        body: 'Every step header, tensor shape label, and concept card has a tooltip. Click "ℹ" cards to expand full mathematical explanations.',
        emoji: '💡',
        highlightSelector: null,
        position: 'center',
    },
    {
        id: 'mode',
        title: 'Switch modes when ready',
        body: 'Start in Simple Mode for visual metaphors. Toggle to Advanced Mode to see real matrices, exact values, and tensor shapes per step.',
        emoji: '⚙',
        highlightSelector: '#mode-toggle',
        position: 'bottom-center',
    },
];


// ─── Hook: useTour ─────────────────────────────────────────────────────────

export function useTour() {
    const [tourVisible, setTourVisible] = useState<boolean>(false);

    useEffect(() => {
        try {
            const seen = localStorage.getItem(TOUR_SEEN_KEY);
            if (!seen) {
                // Small delay so the page renders first
                const t = setTimeout(() => setTourVisible(true), 800);
                return () => clearTimeout(t);
            }
        } catch {
            // localStorage blocked — skip tour
        }
    }, []);

    const startTour = useCallback(() => {
        try {
            localStorage.removeItem(TOUR_SEEN_KEY);
        } catch {
            // fallback — ignore
        }
        setTourVisible(true);
    }, []);

    const endTour = useCallback(() => {
        try {
            localStorage.setItem(TOUR_SEEN_KEY, '1');
        } catch {
            // fallback — ignore
        }
        setTourVisible(false);
    }, []);

    return { tourVisible, startTour, endTour };
}

// ─── OnboardingTour ────────────────────────────────────────────────────────

interface OnboardingTourProps {
    visible: boolean;
    onClose: () => void;
}

export function OnboardingTour({ visible, onClose }: OnboardingTourProps) {
    const [stepIndex, setStepIndex] = useState(0);
    const reduced = useReducedMotion();
    const closeRef = useRef(onClose);
    closeRef.current = onClose;

    // Reset to step 0 each time tour opens
    useEffect(() => {
        if (visible) setStepIndex(0);
    }, [visible]);

    // Keyboard navigation
    useEffect(() => {
        if (!visible) return;

        const handler = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                closeRef.current();
            } else if (e.key === 'ArrowRight' || e.key === 'Enter') {
                setStepIndex((prev) => {
                    if (prev + 1 >= TOUR_STEPS.length) {
                        closeRef.current();
                        return prev;
                    }
                    return prev + 1;
                });
            } else if (e.key === 'ArrowLeft') {
                setStepIndex((prev) => Math.max(0, prev - 1));
            }
        };

        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [visible]);

    const step = TOUR_STEPS[stepIndex];
    const isLast = stepIndex === TOUR_STEPS.length - 1;

    // Animation variants
    const overlayVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1 },
        exit: { opacity: 0 },
    };

    const cardVariants = reduced
        ? {
            hidden: { opacity: 0 },
            visible: { opacity: 1 },
            exit: { opacity: 0 },
        }
        : {
            hidden: { opacity: 0, y: 24, scale: 0.95 },
            visible: { opacity: 1, y: 0, scale: 1 },
            exit: { opacity: 0, y: -12, scale: 0.97 },
        };

    return (
        <AnimatePresence>
            {visible && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        key="tour-backdrop"
                        variants={overlayVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        transition={{ duration: reduced ? 0.01 : 0.3 }}
                        onClick={onClose}
                        style={{
                            position: 'fixed',
                            inset: 0,
                            background: 'rgba(5, 13, 26, 0.82)',
                            backdropFilter: 'blur(4px)',
                            zIndex: 9000,
                        }}
                        aria-hidden="true"
                    />

                    {/* Tour Card */}
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-label={`Onboarding tour, step ${stepIndex + 1} of ${TOUR_STEPS.length}: ${step.title}`}
                        style={{
                            position: 'fixed',
                            inset: 0,
                            zIndex: 9001,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            pointerEvents: 'none',
                        }}
                    >
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={step.id}
                                variants={cardVariants}
                                initial="hidden"
                                animate="visible"
                                exit="exit"
                                transition={
                                    reduced
                                        ? { duration: 0.01 }
                                        : { type: 'spring', stiffness: 280, damping: 26 }
                                }
                                style={{
                                    pointerEvents: 'all',
                                    maxWidth: '440px',
                                    width: 'calc(100% - 32px)',
                                    background: 'rgba(8, 18, 36, 0.97)',
                                    border: '1px solid rgba(0, 229, 255, 0.25)',
                                    borderRadius: '16px',
                                    padding: '32px',
                                    boxShadow:
                                        '0 0 0 1px rgba(0,229,255,0.05), 0 8px 60px rgba(0, 0, 0, 0.8), 0 0 40px var(--bg-raised)',
                                    backdropFilter: 'blur(20px)',
                                }}
                            >
                                {/* Step dots */}
                                <div
                                    style={{
                                        display: 'flex',
                                        gap: '6px',
                                        marginBottom: '24px',
                                        justifyContent: 'center',
                                    }}
                                    role="progressbar"
                                    aria-valuenow={stepIndex + 1}
                                    aria-valuemin={1}
                                    aria-valuemax={TOUR_STEPS.length}
                                    aria-label={`Step ${stepIndex + 1} of ${TOUR_STEPS.length}`}
                                >
                                    {TOUR_STEPS.map((s, i) => (
                                        <div
                                            key={s.id}
                                            style={{
                                                width: i === stepIndex ? '20px' : '7px',
                                                height: '7px',
                                                borderRadius: '4px',
                                                background:
                                                    i <= stepIndex
                                                        ? 'var(--ink)'
                                                        : 'rgba(0,229,255,0.15)',
                                                transition: reduced
                                                    ? 'none'
                                                    : 'all 300ms ease',
                                                boxShadow:
                                                    i === stepIndex
                                                        ? '0 0 8px var(--ink)'
                                                        : 'none',
                                            }}
                                        />
                                    ))}
                                </div>

                                {/* Emoji icon */}
                                <div
                                    style={{
                                        fontSize: '42px',
                                        textAlign: 'center',
                                        marginBottom: '16px',
                                        lineHeight: 1,
                                    }}
                                    aria-hidden="true"
                                >
                                    {step.emoji}
                                </div>

                                {/* Title */}
                                <h2
                                    style={{
                                        fontSize: '22px',
                                        fontWeight: 700,
                                        color: 'var(--ink)',
                                        textAlign: 'center',
                                        marginBottom: '12px',
                                        letterSpacing: '-0.01em',
                                    }}
                                >
                                    {step.title}
                                </h2>

                                {/* Body */}
                                <p
                                    style={{
                                        fontSize: '14px',
                                        lineHeight: 1.7,
                                        color: 'var(--secondary)',
                                        textAlign: 'center',
                                        marginBottom: '28px',
                                    }}
                                >
                                    {step.body}
                                </p>

                                {/* Controls */}
                                <div
                                    style={{
                                        display: 'flex',
                                        gap: '10px',
                                        alignItems: 'center',
                                    }}
                                >
                                    {/* Skip */}
                                    <button
                                        onClick={onClose}
                                        aria-label="Skip tour"
                                        style={{
                                            flex: 1,
                                            padding: '10px',
                                            background: 'transparent',
                                            border: '1px solid rgba(0,229,255,0.15)',
                                            borderRadius: '10px',
                                            color: 'var(--muted)',
                                            fontSize: '13px',
                                            cursor: 'pointer',
                                            fontFamily: 'var(--font-body)',
                                            transition: reduced ? 'none' : 'all 150ms ease',
                                            minHeight: '44px',
                                        }}
                                        onMouseEnter={(e) => {
                                            if (!reduced) {
                                                (e.currentTarget as HTMLButtonElement).style.borderColor =
                                                    'var(--stroke-dark)';
                                                (e.currentTarget as HTMLButtonElement).style.color =
                                                    'var(--secondary)';
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            (e.currentTarget as HTMLButtonElement).style.borderColor =
                                                'rgba(0,229,255,0.15)';
                                            (e.currentTarget as HTMLButtonElement).style.color =
                                                'var(--muted)';
                                        }}
                                    >
                                        Skip tour
                                    </button>

                                    {/* Back (step 2+) */}
                                    {stepIndex > 0 && (
                                        <button
                                            onClick={() => setStepIndex((i) => i - 1)}
                                            aria-label="Previous tour step"
                                            style={{
                                                padding: '10px 14px',
                                                background: 'rgba(0,229,255,0.05)',
                                                border: '1px solid rgba(0,229,255,0.15)',
                                                borderRadius: '10px',
                                                color: 'var(--secondary)',
                                                fontSize: '13px',
                                                cursor: 'pointer',
                                                fontFamily: 'var(--font-body)',
                                                transition: reduced ? 'none' : 'all 150ms ease',
                                                minHeight: '44px',
                                                whiteSpace: 'nowrap',
                                            }}
                                        >
                                            ← Back
                                        </button>
                                    )}

                                    {/* Next / Finish */}
                                    <button
                                        onClick={() => {
                                            if (isLast) {
                                                onClose();
                                            } else {
                                                setStepIndex((i) => i + 1);
                                            }
                                        }}
                                        aria-label={isLast ? 'Finish tour' : 'Next tour step'}
                                        style={{
                                            flex: 2,
                                            padding: '10px',
                                            background:
                                                'linear-gradient(135deg, var(--stroke), rgba(0,184,169,0.15))',
                                            border: '1px solid rgba(0,229,255,0.35)',
                                            borderRadius: '10px',
                                            color: 'var(--ink)',
                                            fontSize: '14px',
                                            fontWeight: 600,
                                            cursor: 'pointer',
                                            fontFamily: 'var(--font-body)',
                                            transition: reduced ? 'none' : 'all 150ms ease',
                                            minHeight: '44px',
                                            boxShadow: reduced
                                                ? 'none'
                                                : '0 0 12px var(--bg-raised)',
                                        }}
                                        onMouseEnter={(e) => {
                                            if (!reduced) {
                                                (e.currentTarget as HTMLButtonElement).style.background =
                                                    'linear-gradient(135deg, var(--stroke-dark), rgba(0,184,169,0.25))';
                                                (e.currentTarget as HTMLButtonElement).style.boxShadow =
                                                    '0 0 20px rgba(0,229,255,0.25)';
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            (e.currentTarget as HTMLButtonElement).style.background =
                                                'linear-gradient(135deg, var(--stroke), rgba(0,184,169,0.15))';
                                            (e.currentTarget as HTMLButtonElement).style.boxShadow = reduced
                                                ? 'none'
                                                : '0 0 12px var(--bg-raised)';
                                        }}
                                    >
                                        {isLast ? '🚀 Start exploring' : 'Next →'}
                                    </button>
                                </div>

                                {/* Keyboard hint */}
                                <p
                                    style={{
                                        marginTop: '16px',
                                        fontSize: '11px',
                                        color: 'var(--muted)',
                                        textAlign: 'center',
                                        fontFamily: 'var(--font-mono)',
                                    }}
                                >
                                    Press <kbd style={{ padding: '1px 5px', background: 'rgba(255,255,255,0.08)', borderRadius: '3px' }}>→</kbd> to advance
                                    {' · '}
                                    <kbd style={{ padding: '1px 5px', background: 'rgba(255,255,255,0.08)', borderRadius: '3px' }}>Esc</kbd> to skip
                                </p>
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
}
