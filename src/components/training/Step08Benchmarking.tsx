import { useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { ErrorBoundary } from '@/components/shared/ErrorBoundary';

interface Step08BenchmarkingProps {
    stepNumber: number;
    totalSteps: number;
    onNext: () => void;
    onPrev: () => void;
}

const BENCHMARKS = [
    { title: 'MMLU', desc: '57 subjects. Multiple choice.', type: 'Knowledge', qCount: '14,079' },
    { title: 'HumanEval', desc: 'Python code completion.', type: 'Coding', qCount: '164' },
    { title: 'MATH', desc: 'Competition math.', type: 'Reasoning', qCount: '12,500' },
    { title: 'GPQA', desc: 'Graduate-level science.', type: 'Expert', qCount: '448' },
    { title: 'MT-Bench', desc: 'Multi-turn conversation.', type: 'Instruction', qCount: '80' },
    { title: 'TruthfulQA', desc: 'Avoids human falsehoods?', type: 'Honesty', qCount: '817' },
];

const SCORES_DATA: Record<string, { model: string; score: number }[]> = {
    MMLU: [
        { model: 'GPT-4', score: 86.4 },
        { model: 'Claude 3', score: 82.1 },
        { model: 'LLaMA 3 70B', score: 79.3 },
        { model: 'Mixtral', score: 70.6 },
        { model: 'GPT-3.5', score: 70.0 },
        { model: 'LLaMA 3 8B', score: 66.6 },
    ],
    HumanEval: [
        { model: 'GPT-4', score: 90.2 },
        { model: 'Claude 3', score: 84.9 },
        { model: 'LLaMA 3 70B', score: 81.7 },
        { model: 'LLaMA 3 8B', score: 62.2 },
        { model: 'Mixtral', score: 54.8 },
        { model: 'GPT-3.5', score: 48.1 },
    ],
    MATH: [
        { model: 'GPT-4', score: 72.6 },
        { model: 'Claude 3', score: 60.1 },
        { model: 'LLaMA 3 70B', score: 50.4 },
        { model: 'GPT-3.5', score: 34.1 },
        { model: 'LLaMA 3 8B', score: 30.0 },
        { model: 'Mixtral', score: 28.4 },
    ],
};

type BenchmarkTab = 'MMLU' | 'HumanEval' | 'MATH';

export function Step08Benchmarking({ stepNumber, totalSteps }: Step08BenchmarkingProps) {
    const shouldReduceMotion = useReducedMotion();
    const prefersReducedMotion = shouldReduceMotion ?? false;
    const [activeTab, setActiveTab] = useState<BenchmarkTab>('MMLU');
    const [toastVisible, setToastVisible] = useState(false);

    const handleNextModuleClick = () => {
        setToastVisible(true);
        setTimeout(() => setToastVisible(false), 3000);
    };

    return (
        <ErrorBoundary>
            <section
                aria-label={`Step ${stepNumber} of ${totalSteps}: Benchmarking`}
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 'var(--s6)',
                    width: '100%',
                    flex: 1,
                }}
            >
                {/* SECTION 1 — OVERVIEW */}
                <section aria-labelledby="bench-overview-heading" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s3)' }}>
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
                        Step 08 — Evaluation & Benchmarking
                    </p>
                    <h1
                        id="bench-overview-heading"
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
                        Measuring LLM Capability
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
                        We evaluate LLMs across a wide range of carefully curated benchmarks to properly assess their knowledge, coding, reasoning, and conversational capabilities.
                    </p>
                </section>

                {/* SECTION 2 — BENCHMARK EXPLORER */}
                <section aria-labelledby="bench-explorer-heading" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s4)' }}>
                    <h3
                        id="bench-explorer-heading"
                        style={{
                            fontFamily: 'var(--font-sans)',
                            fontSize: 'var(--text-lg)',
                            color: 'var(--ink)',
                            fontWeight: 'var(--weight-medium)',
                            margin: 0,
                        }}
                    >
                        Benchmark Explorer
                    </h3>
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                            gap: 'var(--s4)',
                        }}
                        className="benchmark-grid"
                    >
                        {BENCHMARKS.map((b) => (
                            <div
                                key={b.title}
                                style={{
                                    background: 'var(--bg-panel)',
                                    border: '1px solid var(--stroke)',
                                    borderRadius: 'var(--r-lg)',
                                    padding: 'var(--s4)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 'var(--s3)',
                                    boxShadow: 'var(--shadow-soft)',
                                }}
                            >
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s1)' }}>
                                    <h4
                                        style={{
                                            fontFamily: 'var(--font-mono)',
                                            fontSize: 'var(--text-sm)',
                                            color: 'var(--ink)',
                                            margin: 0,
                                            fontWeight: 'var(--weight-medium)'
                                        }}
                                    >
                                        {b.title}
                                    </h4>
                                    <p
                                        style={{
                                            fontFamily: 'var(--font-sans)',
                                            fontSize: 'var(--text-sm)',
                                            color: 'var(--secondary)',
                                            margin: 0,
                                        }}
                                    >
                                        {b.desc}
                                    </p>
                                </div>
                                <div style={{ display: 'flex', gap: 'var(--s2)', flexWrap: 'wrap', marginTop: 'auto' }}>
                                    <span
                                        style={{
                                            fontFamily: 'var(--font-mono)',
                                            fontSize: 'var(--text-2xs)',
                                            background: 'var(--bg-inverse)',
                                            color: 'var(--text-inverse)',
                                            padding: '4px 8px',
                                            borderRadius: 'var(--r-xs)',
                                        }}
                                    >
                                        {b.type}
                                    </span>
                                    <span
                                        style={{
                                            fontFamily: 'var(--font-mono)',
                                            fontSize: 'var(--text-2xs)',
                                            background: 'var(--stroke)',
                                            color: 'var(--ink)',
                                            padding: '4px 8px',
                                            borderRadius: 'var(--r-xs)',
                                        }}
                                    >
                                        {b.qCount} Q
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* SECTION 3 — SCORE COMPARISON BAR CHART */}
                <section
                    aria-labelledby="bench-compare-heading"
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 'var(--s4)',
                        background: 'var(--bg-panel)',
                        border: '1px solid var(--stroke)',
                        borderRadius: 'var(--r-lg)',
                        padding: 'var(--s5)',
                        boxShadow: 'var(--shadow-soft)',
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--s3)' }}>
                        <h3
                            id="bench-compare-heading"
                            style={{
                                fontFamily: 'var(--font-sans)',
                                fontSize: 'var(--text-lg)',
                                color: 'var(--ink)',
                                fontWeight: 'var(--weight-medium)',
                                margin: 0,
                            }}
                        >
                            How models compare
                        </h3>
                        <div style={{ display: 'flex', gap: 'var(--s2)', background: 'var(--bg)', padding: '4px', borderRadius: 'var(--r-pill)', border: '1px solid var(--stroke)' }}>
                            {(['MMLU', 'HumanEval', 'MATH'] as BenchmarkTab[]).map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    style={{
                                        fontFamily: 'var(--font-mono)',
                                        fontSize: 'var(--text-xs)',
                                        fontWeight: activeTab === tab ? 'var(--weight-medium)' : 'var(--weight-regular)',
                                        padding: 'var(--s1) var(--s3)',
                                        border: 'none',
                                        borderRadius: 'var(--r-pill)',
                                        background: activeTab === tab ? 'var(--ink)' : 'transparent',
                                        color: activeTab === tab ? 'var(--text-inverse)' : 'var(--secondary)',
                                        cursor: 'pointer',
                                        transition: 'all var(--dur-fast) var(--ease-out)',
                                    }}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s3)' }}>
                        <AnimatePresence mode="popLayout" initial={false}>
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                                style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s3)' }}
                            >
                                {SCORES_DATA[activeTab].map((item) => (
                                    <div key={item.model} style={{ display: 'flex', alignItems: 'center', gap: 'var(--s3)' }}>
                                        <div
                                            style={{
                                                fontFamily: 'var(--font-mono)',
                                                fontSize: 'var(--text-xs)',
                                                color: 'var(--secondary)',
                                                width: '100px',
                                                flexShrink: 0,
                                                textAlign: 'right',
                                            }}
                                        >
                                            {item.model}
                                        </div>
                                        <div style={{ flex: 1, height: '20px', background: 'var(--stroke)', borderRadius: 'var(--r-sm)', overflow: 'hidden', position: 'relative' }}>
                                            <motion.div
                                                initial={{ width: prefersReducedMotion ? `${item.score}%` : 0 }}
                                                animate={{ width: `${item.score}%` }}
                                                transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.6, ease: [0.2, 0, 0, 1] }}
                                                onMouseEnter={(e: any) => e.target.style.background = 'var(--primary)'}
                                                onMouseLeave={(e: any) => e.target.style.background = 'var(--ink)'}
                                                style={{
                                                    height: '100%',
                                                    background: 'var(--ink)',
                                                    borderRadius: 'var(--r-sm)',
                                                    transition: 'background var(--dur-fast) var(--ease-out)',
                                                }}
                                            />
                                        </div>
                                        <div
                                            style={{
                                                fontFamily: 'var(--font-mono)',
                                                fontSize: 'var(--text-xs)',
                                                color: 'var(--ink)',
                                                fontWeight: 'var(--weight-medium)',
                                                width: '40px',
                                                flexShrink: 0,
                                            }}
                                        >
                                            {item.score}%
                                        </div>
                                    </div>
                                ))}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </section>

                {/* NEXT STEPS / MODULE 03 LINK */}
                <div style={{ marginTop: 'var(--s4)', display: 'flex', alignItems: 'center', gap: 'var(--s4)' }}>
                    <button
                        onClick={handleNextModuleClick}
                        className="btn btn-primary"
                    >
                        Module 03
                    </button>
                    <AnimatePresence>
                        {toastVisible && (
                            <motion.span
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                style={{
                                    fontFamily: 'var(--font-mono)',
                                    fontSize: 'var(--text-xs)',
                                    color: 'var(--secondary)',
                                    padding: 'var(--s1) var(--s3)',
                                    background: 'var(--stroke)',
                                    borderRadius: 'var(--r-pill)',
                                }}
                            >
                                Module 03 coming soon!
                            </motion.span>
                        )}
                    </AnimatePresence>
                </div>


                {/* Grid layout responsive style */}
                <style>{`
                @media (max-width: 719px) {
                    .benchmark-grid {
                        grid-template-columns: 1fr !important;
                    }
                }
            `}</style>
            </section>
        </ErrorBoundary >
    );
}
