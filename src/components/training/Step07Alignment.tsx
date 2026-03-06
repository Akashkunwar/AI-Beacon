import { useState } from 'react';
import { ErrorBoundary } from '@/components/shared/ErrorBoundary';
import { motion, useReducedMotion, AnimatePresence } from 'framer-motion';
import { RLHFPanel } from './alignment/RLHFPanel';
import { DPOPanel } from './alignment/DPOPanel';
import { CAIPanel } from './alignment/CAIPanel';
import { RLAIFPanel } from './alignment/RLAIFPanel';

type AlignmentMethod = 'RLHF' | 'DPO' | 'Constitutional AI' | 'RLAIF';

interface Step07AlignmentProps {
    stepNumber: number;
    totalSteps: number;
    onNext: () => void;
    onPrev: () => void;
}

export function Step07Alignment({ stepNumber, totalSteps, onNext: _onNext, onPrev: _onPrev }: Step07AlignmentProps) {
    const shouldReduceMotion = useReducedMotion();
    const [activeMethod, setActiveMethod] = useState<AlignmentMethod>('DPO');

    const methods: { id: AlignmentMethod; descriptor: string }[] = [
        { id: 'RLHF', descriptor: 'Traditional' },
        { id: 'DPO', descriptor: 'Modern' },
        { id: 'Constitutional AI', descriptor: 'Anthropic' },
        { id: 'RLAIF', descriptor: 'Scalable' }
    ];

    return (
        <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: [0.2, 0, 0, 1] }}
            style={{
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--s6)',
                paddingBottom: 'var(--s8)'
            }}
        >
            <ErrorBoundary>
                <article
                    aria-label={`Step ${stepNumber} of ${totalSteps}: Alignment`}
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 0,
                        paddingBottom: 'var(--s8)'
                    }}
                >
                    <section aria-labelledby="alignment-overview-heading" style={{ marginBottom: 'var(--s4)' }}>
                        <h2 id="alignment-overview-heading" style={{
                            fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)', color: 'var(--muted)',
                            textTransform: 'uppercase', letterSpacing: 'var(--tracking-wider)', marginBottom: 'var(--s4)',
                            marginTop: 0
                        }}>
                            Step {stepNumber < 10 ? `0${stepNumber}` : stepNumber} — Alignment
                        </h2>
                        <h1
                            id="alignment-overview-heading"
                            style={{
                                fontFamily: 'var(--font-sans)',
                                fontSize: 'var(--text-xl)',
                                fontWeight: 'var(--weight-semibold)',
                                color: 'var(--ink)',
                                lineHeight: 'var(--lead-tight)',
                                letterSpacing: 'var(--tracking-snug)',
                                margin: '0 0 var(--s4)',
                            }}
                        >
                            Teaching the model what we clearly want.
                        </h1>
                        <p
                            style={{
                                fontFamily: 'var(--font-sans)',
                                fontSize: 'var(--text-sm)',
                                fontWeight: 'var(--weight-light)',
                                color: 'var(--secondary)',
                                lineHeight: 'var(--lead-body)',
                                maxWidth: '62ch',
                                margin: 0,
                            }}
                        >
                            After Supervised Fine-Tuning, the model can chat, but it might still be unhelpful, sycophantic, or willing to generate harmful content. Alignment methods "steer" the model's behavior towards human preferences (Helpful, Honest, Harmless).
                        </p>
                    </section>

                    {/* Method Selector */}
                    <section aria-labelledby="align-method-heading" style={{ marginTop: 'var(--s2)' }}>
                        <h3 id="align-method-heading" className="sr-only" aria-hidden="true" style={{ display: 'none' }}>Method Selector</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--s4)' }}>
                            {methods.map((method) => (
                                <button
                                    key={method.id}
                                    onClick={() => setActiveMethod(method.id)}
                                    style={{
                                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--s1)',
                                        padding: 'var(--s4)', background: activeMethod === method.id ? 'var(--ink)' : 'transparent',
                                        border: `1px solid ${activeMethod === method.id ? 'var(--ink)' : 'var(--stroke-dark)'}`,
                                        borderRadius: 'var(--r-md)', cursor: 'pointer',
                                        transition: 'all var(--dur-fast) var(--ease-out)',
                                        minHeight: '80px', justifyContent: 'center'
                                    }}
                                    onMouseEnter={(e) => {
                                        if (activeMethod !== method.id) {
                                            e.currentTarget.style.background = 'var(--bg-raised)';
                                            e.currentTarget.style.borderColor = 'var(--primary)';
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (activeMethod !== method.id) {
                                            e.currentTarget.style.background = 'transparent';
                                            e.currentTarget.style.borderColor = 'var(--stroke-dark)';
                                        }
                                    }}
                                >
                                    <span style={{
                                        fontFamily: 'var(--font-sans)', fontSize: 'var(--text-md)', fontWeight: 'var(--weight-medium)',
                                        color: activeMethod === method.id ? 'var(--text-inverse)' : 'var(--ink)',
                                        textAlign: 'center'
                                    }}>
                                        {method.id}
                                    </span>
                                    <span style={{
                                        fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', textTransform: 'uppercase',
                                        color: activeMethod === method.id ? 'var(--muted)' : 'var(--secondary)',
                                        letterSpacing: 'var(--tracking-wider)', textAlign: 'center'
                                    }}>
                                        {method.descriptor}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </section>

                    {/* Panel Area */}
                    <section aria-labelledby="align-panel-heading" style={{ marginTop: 'var(--s4)', minHeight: '500px' }}>
                        <h3 id="align-panel-heading" className="sr-only" aria-hidden="true" style={{ display: 'none' }}>Alignment Method Details</h3>
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeMethod}
                                initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                            >
                                {activeMethod === 'RLHF' && <RLHFPanel />}
                                {activeMethod === 'DPO' && <DPOPanel />}
                                {activeMethod === 'Constitutional AI' && <CAIPanel />}
                                {activeMethod === 'RLAIF' && <RLAIFPanel />}
                            </motion.div>
                        </AnimatePresence>
                    </section>
                </article>
            </ErrorBoundary>
        </motion.div>
    );
}

