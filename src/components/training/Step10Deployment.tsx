import { useState } from 'react';
import { motion, useReducedMotion, AnimatePresence } from 'framer-motion';
import { ErrorBoundary } from '@/components/shared/ErrorBoundary';

interface StepProps {
    stepNumber: number;
    totalSteps: number;
    onNext: () => void;
    onPrev: () => void;
}

const PIPELINE_NODES = [
    { id: 'user', label: 'User Request', icon: '👤', desc: 'Incoming prompt from client' },
    { id: 'lb', label: 'Load Balancer', icon: '⚖️', desc: 'Routes traffic to available instances' },
    { id: 'server', label: 'Inference Server', icon: '🖥️', desc: 'vLLM / TGI processing engine' },
    { id: 'model', label: 'Model Weights', icon: '🧠', desc: 'The actual neural network' },
    { id: 'kv', label: 'KV Cache', icon: '📦', desc: 'Stores past attention states' },
    { id: 'safety', label: 'Safety Filter', icon: '🛡️', desc: 'LlamaGuard / toxicity check' },
    { id: 'response', label: 'Response', icon: '💬', desc: 'Streamed output to client' }
];

const KEY_CONCEPTS = [
    { title: 'KV Cache', stat: 'O(N) memory', desc: 'Saves recomputing past tokens by storing Key and Value states.' },
    { title: 'Continuous Batching', stat: '2-4x throughput', desc: 'Dynamically inserts new requests instead of waiting for batches to finish.' },
    { title: 'PagedAttention', stat: 'Near 0% waste', desc: 'Manages KV Cache like virtual memory with blocks, avoiding fragmentation.' },
    { title: 'Streaming', stat: '< 50ms TTFT', desc: 'Yields tokens as soon as generated, improving perceived latency.' }
];

const STAGES = [
    { num: 1, label: 'Data Collection', desc: 'Scrape and clean web data' },
    { num: 2, label: 'Tokenizer Training', desc: 'Build vocabulary via BPE' },
    { num: 3, label: 'Architecture', desc: 'Design model dimensions' },
    { num: 4, label: 'Pre-Training', desc: 'Learn general world knowledge' },
    { num: 5, label: 'Evaluation', desc: 'Monitor loss curves' },
    { num: 6, label: 'SFT', desc: 'Supervised Fine-Tuning' },
    { num: 7, label: 'Alignment', desc: 'RLHF / DPO for safety' },
    { num: 8, label: 'Benchmarking', desc: 'MMLU, HumanEval, etc.' },
    { num: 9, label: 'Optimization', desc: 'Quantization & Speculative Decoding' },
    { num: 10, label: 'Deployment', desc: 'vLLM / API Endpoints' }
];

export function Step10Deployment({ stepNumber }: StepProps) {
    const shouldReduceMotion = useReducedMotion();
    const prefersReducedMotion = shouldReduceMotion ?? false;
    const [hoveredNode, setHoveredNode] = useState<string | null>(null);
    const [showToast, setShowToast] = useState(false);

    const handleBenchmarksClick = () => {
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
    };

    return (
        <ErrorBoundary>
            <section
                aria-labelledby="deploy-overview-heading"
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 'var(--s6)',
                    paddingBottom: 'var(--s8)',
                    width: '100%',
                    flex: 1,
                }}
            >
                {/* 1. OVERVIEW */}
                <header>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--s2)', marginBottom: 'var(--s3)' }}>
                        <span
                            style={{
                                fontFamily: 'var(--font-mono)',
                                fontSize: 'var(--text-xs)',
                                color: 'var(--text-inverse)',
                                background: 'var(--bg-inverse)',
                                padding: '2px 8px',
                                borderRadius: 'var(--r-sm)',
                            }}
                        >
                            STEP {stepNumber.toString().padStart(2, '0')}
                        </span>
                        <span
                            style={{
                                fontFamily: 'var(--font-mono)',
                                fontSize: 'var(--text-xs)',
                                color: 'var(--muted)',
                                textTransform: 'uppercase',
                            }}
                        >
                            Deployment
                        </span>
                    </div>
                    <h1
                        id="deploy-overview-heading"
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
                        Taking the model to production.
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
                        A raw model checkpoint isn't enough. We need specialized inference servers to handle concurrent users, manage GPU memory efficiently, and stream responses back at reading speed.
                    </p>
                </header>

                {/* 2. INFERENCE PIPELINE FLOW */}
                <section
                    aria-labelledby="deploy-pipeline-heading"
                    style={{
                        background: 'var(--bg-panel)',
                        border: '1px solid var(--stroke)',
                        borderRadius: 'var(--r-lg)',
                        padding: 'var(--s5)',
                    }}
                >
                    <h3
                        id="deploy-pipeline-heading"
                        style={{
                            fontFamily: 'var(--font-sans)',
                            fontSize: 'var(--text-lg)',
                            fontWeight: 'var(--weight-medium)',
                            color: 'var(--ink)',
                            margin: '0 0 var(--s4) 0',
                        }}
                    >
                        Production Inference Pipeline
                    </h3>

                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: 'var(--s2)',
                            padding: 'var(--s4) 0',
                        }}
                    >
                        {PIPELINE_NODES.map((node, i) => (
                            <div key={node.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <div
                                    onMouseEnter={() => setHoveredNode(node.id)}
                                    onMouseLeave={() => setHoveredNode(null)}
                                    style={{
                                        background: 'var(--bg-panel)',
                                        border: '1px solid var(--stroke-dark)',
                                        borderRadius: 'var(--r-md)',
                                        padding: 'var(--s2) var(--s4)',
                                        minWidth: '220px',
                                        textAlign: 'center',
                                        cursor: 'default',
                                        position: 'relative',
                                        transition: 'all var(--dur-fast) var(--ease-out)',
                                        boxShadow: hoveredNode === node.id ? 'var(--shadow-lift)' : 'var(--shadow-soft)',
                                        borderColor: hoveredNode === node.id ? 'var(--ink)' : 'var(--stroke-dark)',
                                        zIndex: hoveredNode === node.id ? 10 : 1
                                    }}
                                >
                                    <span style={{ marginRight: 'var(--s2)' }}>{node.icon}</span>
                                    <span style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)', color: 'var(--ink)', fontWeight: 'var(--weight-medium)' }}>
                                        {node.label}
                                    </span>

                                    {/* Tooltip */}
                                    <AnimatePresence>
                                        {hoveredNode === node.id && (
                                            <motion.div
                                                initial={prefersReducedMotion ? false : { opacity: 0, y: 5 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 5 }}
                                                transition={{ duration: prefersReducedMotion ? 0 : 0.15 }}
                                                style={{
                                                    position: 'absolute',
                                                    top: '100%',
                                                    left: '50%',
                                                    transform: 'translateX(-50%)',
                                                    marginTop: 'var(--s2)',
                                                    background: 'var(--bg-inverse)',
                                                    color: 'var(--text-inverse)',
                                                    fontFamily: 'var(--font-sans)',
                                                    fontSize: 'var(--text-xs)',
                                                    padding: 'var(--s2) var(--s3)',
                                                    borderRadius: 'var(--r-sm)',
                                                    width: 'max-content',
                                                    maxWidth: '200px',
                                                    pointerEvents: 'none',
                                                    zIndex: 20,
                                                    boxShadow: 'var(--shadow-soft)'
                                                }}
                                            >
                                                {node.desc}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                {/* Arrow */}
                                {i < PIPELINE_NODES.length - 1 && (
                                    <div style={{ height: '24px', width: '2px', background: 'var(--stroke-dark)', margin: 'var(--s1) 0', opacity: 0.5 }} />
                                )}
                            </div>
                        ))}
                    </div>
                </section>

                {/* 3. KEY CONCEPTS */}
                <section
                    aria-label="Deployment Concepts"
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                        gap: 'var(--s4)'
                    }}
                >
                    {KEY_CONCEPTS.map(concept => (
                        <div
                            key={concept.title}
                            style={{
                                background: 'var(--bg)',
                                border: '1px solid var(--stroke)',
                                borderRadius: 'var(--r-md)',
                                padding: 'var(--s4)',
                            }}
                        >
                            <dt style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-md)', fontWeight: 'var(--weight-medium)', color: 'var(--ink)', marginBottom: 'var(--s1)' }}>
                                {concept.title}
                            </dt>
                            <dd style={{ margin: 0 }}>
                                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-lg)', fontWeight: 'var(--weight-semibold)', color: 'var(--ink)', marginBottom: 'var(--s2)' }}>
                                    {concept.stat}
                                </div>
                                <div style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)', color: 'var(--secondary)' }}>
                                    {concept.desc}
                                </div>
                            </dd>
                        </div>
                    ))}
                </section>

                {/* 4. FULL PIPELINE RECAP */}
                <section
                    aria-labelledby="deploy-recap-heading"
                    style={{
                        background: 'var(--bg-panel)',
                        border: '1px solid var(--stroke)',
                        borderRadius: 'var(--r-lg)',
                        padding: 'var(--s5)',
                    }}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--s5)' }}>
                        <div>
                            <h3
                                id="deploy-recap-heading"
                                style={{
                                    fontFamily: 'var(--font-sans)',
                                    fontSize: 'var(--text-lg)',
                                    fontWeight: 'var(--weight-medium)',
                                    color: 'var(--ink)',
                                    margin: '0 0 var(--s1) 0',
                                }}
                            >
                                The Journey is Complete
                            </h3>
                            <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)', color: 'var(--secondary)', margin: 0 }}>
                                From raw web text to a deployed API endpoint.
                            </p>
                        </div>

                        <div style={{ position: 'relative' }}>
                            <button
                                onClick={handleBenchmarksClick}
                                style={{
                                    fontFamily: 'var(--font-sans)',
                                    fontSize: 'var(--text-sm)',
                                    fontWeight: 'var(--weight-medium)',
                                    color: 'var(--text-inverse)',
                                    background: 'var(--bg-inverse)',
                                    border: 'none',
                                    borderRadius: 'var(--r-md)',
                                    padding: 'var(--s2) var(--s4)',
                                    cursor: 'pointer',
                                    transition: 'background var(--dur-fast) var(--ease-out)',
                                }}
                                onMouseEnter={e => e.currentTarget.style.background = 'var(--ink)'}
                                onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-inverse)'}
                            >
                                Go to Benchmarks →
                            </button>

                            <AnimatePresence>
                                {showToast && (
                                    <motion.div
                                        initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: prefersReducedMotion ? 0 : 0.3 }}
                                        style={{
                                            position: 'absolute',
                                            top: '100%',
                                            right: 0,
                                            marginTop: 'var(--s2)',
                                            background: 'var(--bg)',
                                            border: '1px solid var(--stroke-dark)',
                                            color: 'var(--ink)',
                                            fontFamily: 'var(--font-sans)',
                                            fontSize: 'var(--text-xs)',
                                            padding: 'var(--s2) var(--s3)',
                                            borderRadius: 'var(--r-sm)',
                                            whiteSpace: 'nowrap',
                                            boxShadow: 'var(--shadow-lift)'
                                        }}
                                    >
                                        Coming soon.
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* Timeline */}
                    <div style={{ position: 'relative', paddingLeft: 'var(--s5)' }}>
                        <div style={{ position: 'absolute', left: '7px', top: '10px', bottom: '10px', width: '2px', background: 'var(--stroke)' }} />

                        {STAGES.map((stage, i) => {
                            const isCurrent = stage.num === 10;
                            return (
                                <div
                                    key={stage.num}
                                    style={{
                                        display: 'flex',
                                        gap: 'var(--s4)',
                                        marginBottom: i === STAGES.length - 1 ? 0 : 'var(--s4)',
                                        position: 'relative'
                                    }}
                                >
                                    {/* Timeline strict dot */}
                                    <div
                                        style={{
                                            position: 'absolute',
                                            left: 'calc(-1 * var(--s5) - 1px)',
                                            top: '6px',
                                            width: '8px',
                                            height: '8px',
                                            borderRadius: '50%',
                                            background: isCurrent ? 'var(--ink)' : 'var(--stroke-dark)',
                                            outline: isCurrent ? '4px solid var(--bg-panel)' : 'none'
                                        }}
                                    />

                                    <div
                                        style={{
                                            fontFamily: 'var(--font-mono)',
                                            fontSize: 'var(--text-xs)',
                                            color: isCurrent ? 'var(--ink)' : 'var(--muted)',
                                            width: '24px',
                                            paddingTop: '2px'
                                        }}
                                    >
                                        {stage.num.toString().padStart(2, '0')}
                                    </div>
                                    <div
                                        style={{
                                            background: isCurrent ? 'var(--bg-raised)' : 'transparent',
                                            padding: isCurrent ? 'var(--s2) var(--s3)' : '0 var(--s3)',
                                            borderRadius: 'var(--r-md)',
                                            flex: 1,
                                            borderLeft: isCurrent ? '2px solid var(--ink)' : '2px solid transparent',
                                            transition: 'all var(--dur-fast) var(--ease-out)'
                                        }}
                                    >
                                        <div style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)', fontWeight: isCurrent ? 'var(--weight-medium)' : 'var(--weight-regular)', color: isCurrent ? 'var(--ink)' : 'var(--secondary)' }}>
                                            {stage.label}
                                        </div>
                                        <div style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>
                                            {stage.desc}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>
            </section>
        </ErrorBoundary>
    );
}
