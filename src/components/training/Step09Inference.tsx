import { useState, useEffect } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ErrorBoundary } from '@/components/shared/ErrorBoundary';

interface StepProps {
    stepNumber: number;
    totalSteps: number;
    onNext: () => void;
    onPrev: () => void;
}

// ─── Quantization Data ───────────────────────────────────────────────────────

type QuantMode = 'FP32' | 'BF16' | 'INT8' | 'INT4' | 'NF4';

interface QuantStats {
    bits: number;
    memory: string;
    quality: number;
    hardware: string;
}

const QUANT_DATA: Record<QuantMode, QuantStats> = {
    'FP32': { bits: 32, memory: '28 GB', quality: 100, hardware: 'Multiple Datacenter GPUs (A100/H100)' },
    'BF16': { bits: 16, memory: '14 GB', quality: 99.9, hardware: 'Single High-End GPU (RTX 4090)' },
    'INT8': { bits: 8, memory: '7.5 GB', quality: 98, hardware: 'Prosumer GPU / Mac Studio' },
    'INT4': { bits: 4, memory: '3.5 GB', quality: 90, hardware: 'Consumer Laptop / Mac M1' },
    'NF4': { bits: 4, memory: '3.5 GB', quality: 97, hardware: 'Consumer Laptop / Mac M1' }
};

const MODE_STEPS: QuantMode[] = ['FP32', 'BF16', 'INT8', 'INT4', 'NF4'];

// ─── Speculative Decoding Data ───────────────────────────────────────────────

type TokenState = 'hidden' | 'drafted' | 'accepted' | 'rejected';

interface DraftToken {
    id: number;
    word: string;
}

const DRAFT_TOKENS: DraftToken[] = [
    { id: 1, word: 'The' },
    { id: 2, word: 'quick' },
    { id: 3, word: 'brown' },
    { id: 4, word: 'jump' } // "jump" will be rejected by the verifier (expecting "fox")
];

export function Step09Inference({ stepNumber }: StepProps) {
    const shouldReduceMotion = useReducedMotion();

    // Quantization State
    const [quantIndex, setQuantIndex] = useState<number>(0);
    const selectedMode = MODE_STEPS[quantIndex];
    const stats = QUANT_DATA[selectedMode];

    // Speculative Decoding State
    const [specPlaying, setSpecPlaying] = useState<boolean>(false);
    const [tokenStates, setTokenStates] = useState<TokenState[]>(DRAFT_TOKENS.map(() => 'hidden'));
    const [verificationDone, setVerificationDone] = useState<boolean>(false);

    // Run speculative decoding animation
    useEffect(() => {
        if (!specPlaying) return;

        if (shouldReduceMotion) {
            setTokenStates(['accepted', 'accepted', 'accepted', 'rejected']);
            setVerificationDone(true);
            setSpecPlaying(false);
            return;
        }

        const runAnimation = async () => {
            // Draft sequence
            for (let i = 0; i < DRAFT_TOKENS.length; i++) {
                await new Promise(r => setTimeout(r, 150));
                setTokenStates(prev => {
                    const next = [...prev];
                    next[i] = 'drafted';
                    return next;
                });
            }

            // Verification delay
            await new Promise(r => setTimeout(r, 400));

            // Verify
            setTokenStates(['accepted', 'accepted', 'accepted', 'rejected']);
            setVerificationDone(true);
            setSpecPlaying(false);
        };

        runAnimation();
    }, [specPlaying, shouldReduceMotion]);

    const handleSimulate = () => {
        setTokenStates(DRAFT_TOKENS.map(() => 'hidden'));
        setVerificationDone(false);
        setSpecPlaying(true);
    };

    return (
        <ErrorBoundary>
            <section
                aria-labelledby="infer-overview-heading"
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
                            Inference Optimization
                        </span>
                    </div>
                    <h1
                        id="infer-overview-heading"
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
                        Making models fast & cheap.
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
                        To deploy LLMs efficiently, we must optimize them for inference—reducing memory footprint and increasing generation speed without significantly sacrificing response quality.
                    </p>
                </header>

                {/* 2. QUANTIZATION VISUALIZER */}
                <section
                    aria-labelledby="infer-quant-heading"
                    style={{
                        background: 'var(--bg-panel)',
                        border: '1px solid var(--stroke)',
                        borderRadius: 'var(--r-lg)',
                        padding: 'var(--s5)',
                    }}
                >
                    <h3
                        id="infer-quant-heading"
                        style={{
                            fontFamily: 'var(--font-sans)',
                            fontSize: 'var(--text-lg)',
                            fontWeight: 'var(--weight-medium)',
                            color: 'var(--ink)',
                            margin: '0 0 var(--s4) 0',
                        }}
                    >
                        Quantization Visualizer
                    </h3>

                    {/* Slider */}
                    <div style={{ marginBottom: 'var(--s5)' }}>
                        <input
                            type="range"
                            min={0}
                            max={MODE_STEPS.length - 1}
                            value={quantIndex}
                            onChange={(e) => setQuantIndex(parseInt(e.target.value))}
                            aria-label="Select quantization precision"
                            style={{
                                width: '100%',
                                appearance: 'none',
                                background: 'var(--stroke)',
                                height: '4px',
                                borderRadius: 'var(--r-pill)',
                                outline: 'none',
                                cursor: 'pointer',
                            }}
                        />
                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                marginTop: 'var(--s2)',
                                fontFamily: 'var(--font-mono)',
                                fontSize: 'var(--text-xs)',
                                color: 'var(--muted)'
                            }}
                        >
                            {MODE_STEPS.map((mode, i) => (
                                <span
                                    key={mode}
                                    style={{
                                        color: i === quantIndex ? 'var(--ink)' : 'inherit',
                                        fontWeight: i === quantIndex ? 'var(--weight-semibold)' : 'inherit',
                                        transition: 'color var(--dur-fast) var(--ease-out)'
                                    }}
                                >
                                    {mode}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Internal CSS for slider thumb since inline pseudo-elements aren't supported */}
                    <style>{`
                    input[type='range']::-webkit-slider-thumb {
                        appearance: none;
                        width: 16px;
                        height: 16px;
                        background: var(--bg-inverse);
                        border-radius: var(--r-pill);
                        cursor: pointer;
                        border: 2px solid var(--bg);
                        box-shadow: var(--shadow-soft);
                    }
                    input[type='range']::-moz-range-thumb {
                        width: 16px;
                        height: 16px;
                        background: var(--bg-inverse);
                        border-radius: var(--r-pill);
                        cursor: pointer;
                        border: 2px solid var(--bg);
                        box-shadow: var(--shadow-soft);
                    }
                `}</style>

                    {/* 2x2 Stats Panel */}
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                            gap: 'var(--s4)',
                            marginBottom: 'var(--s4)'
                        }}
                    >
                        {/* Bits/Weight */}
                        <div
                            style={{
                                background: 'var(--bg)',
                                border: '1px solid var(--stroke)',
                                borderRadius: 'var(--r-md)',
                                padding: 'var(--s3)',
                            }}
                        >
                            <dt style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xs)', color: 'var(--muted)', marginBottom: 'var(--s1)' }}>Bits / weight</dt>
                            <dd style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xl)', color: 'var(--ink)', margin: 0 }}>
                                {stats.bits}
                            </dd>
                        </div>

                        {/* Memory */}
                        <div
                            style={{
                                background: 'var(--bg)',
                                border: '1px solid var(--stroke)',
                                borderRadius: 'var(--r-md)',
                                padding: 'var(--s3)',
                            }}
                        >
                            <dt style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xs)', color: 'var(--muted)', marginBottom: 'var(--s1)' }}>Memory (7B Model)</dt>
                            <dd style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xl)', color: 'var(--ink)', margin: 0 }}>
                                {stats.memory}
                            </dd>
                        </div>

                        {/* Quality */}
                        <div
                            style={{
                                background: 'var(--bg)',
                                border: '1px solid var(--stroke)',
                                borderRadius: 'var(--r-md)',
                                padding: 'var(--s3)',
                            }}
                        >
                            <dt style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xs)', color: 'var(--muted)', marginBottom: 'var(--s2)' }}>Retained Quality</dt>
                            <dd style={{ margin: 0 }}>
                                <div style={{ height: '8px', background: 'var(--stroke)', borderRadius: 'var(--r-pill)', overflow: 'hidden' }}>
                                    <motion.div
                                        initial={false}
                                        animate={{ width: `${stats.quality}%` }}
                                        transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.3, ease: 'easeOut' }}
                                        style={{ height: '100%', background: 'var(--viz-1)' }}
                                    />
                                </div>
                                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)', color: 'var(--ink)', marginTop: 'var(--s1)', textAlign: 'right' }}>
                                    {stats.quality}%
                                </div>
                            </dd>
                        </div>

                        {/* Hardware */}
                        <div
                            style={{
                                background: 'var(--bg)',
                                border: '1px solid var(--stroke)',
                                borderRadius: 'var(--r-md)',
                                padding: 'var(--s3)',
                            }}
                        >
                            <dt style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xs)', color: 'var(--muted)', marginBottom: 'var(--s1)' }}>Target Hardware</dt>
                            <dd style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)', color: 'var(--ink)', margin: 0 }}>
                                {stats.hardware}
                            </dd>
                        </div>
                    </div>

                    {selectedMode === 'NF4' && (
                        <motion.p
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            style={{
                                fontFamily: 'var(--font-sans)',
                                fontSize: 'var(--text-sm)',
                                color: 'var(--secondary)',
                                background: 'var(--bg-raised)',
                                padding: 'var(--s3)',
                                borderRadius: 'var(--r-md)',
                                margin: 0,
                                borderLeft: '2px solid var(--viz-2)'
                            }}
                        >
                            <strong>Note:</strong> NormalFloat4 (NF4) is an information-theoretically optimal data type that yields better quality than standard INT4 by mapping weights to a normal distribution.
                        </motion.p>
                    )}
                </section>

                {/* 3. SPECULATIVE DECODING ANIMATION */}
                <section
                    aria-labelledby="infer-spec-heading"
                    style={{
                        background: 'var(--bg-panel)',
                        border: '1px solid var(--stroke)',
                        borderRadius: 'var(--r-lg)',
                        padding: 'var(--s5)',
                    }}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--s4)' }}>
                        <div>
                            <h3
                                id="infer-spec-heading"
                                style={{
                                    fontFamily: 'var(--font-sans)',
                                    fontSize: 'var(--text-lg)',
                                    fontWeight: 'var(--weight-medium)',
                                    color: 'var(--ink)',
                                    margin: '0 0 var(--s1) 0',
                                }}
                            >
                                Speculative Decoding
                            </h3>
                            <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)', color: 'var(--secondary)', margin: 0 }}>
                                A smaller "draft" model guesses tokens quickly. The large "verifier" model checks them in parallel.
                            </p>
                        </div>
                        <button
                            onClick={handleSimulate}
                            disabled={specPlaying}
                            style={{
                                fontFamily: 'var(--font-sans)',
                                fontSize: 'var(--text-sm)',
                                fontWeight: 'var(--weight-medium)',
                                color: 'var(--text-inverse)',
                                background: specPlaying ? 'var(--muted)' : 'var(--bg-inverse)',
                                border: 'none',
                                borderRadius: 'var(--r-md)',
                                padding: 'var(--s2) var(--s4)',
                                cursor: specPlaying ? 'default' : 'pointer',
                            }}
                        >
                            ▶ Simulate
                        </button>
                    </div>

                    {/* Animation Area */}
                    <div
                        style={{
                            background: 'var(--bg)',
                            border: '1px solid var(--stroke)',
                            borderRadius: 'var(--r-md)',
                            padding: 'var(--s4)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 'var(--s4)'
                        }}
                    >
                        {/* Row 1: Draft Model */}
                        <div>
                            <div style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xs)', color: 'var(--muted)', marginBottom: 'var(--s2)' }}>
                                Draft Model (Fast)
                            </div>
                            <div style={{ display: 'flex', gap: 'var(--s2)', minHeight: '32px' }}>
                                {DRAFT_TOKENS.map((token, i) => (
                                    <motion.div
                                        key={token.id}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: tokenStates[i] !== 'hidden' ? 1 : 0, scale: tokenStates[i] !== 'hidden' ? 1 : 0.9 }}
                                        transition={{ duration: 0.2 }}
                                        style={{
                                            fontFamily: 'var(--font-mono)',
                                            fontSize: 'var(--text-sm)',
                                            background: 'var(--bg-raised)',
                                            color: 'var(--ink)',
                                            padding: '4px 12px',
                                            borderRadius: 'var(--r-pill)',
                                            border: '1px solid var(--stroke)'
                                        }}
                                    >
                                        {token.word}
                                    </motion.div>
                                ))}
                            </div>
                        </div>

                        {/* Row 2: Verifier Model */}
                        <div>
                            <div style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xs)', color: 'var(--muted)', marginBottom: 'var(--s2)' }}>
                                Verifier Model (Accurate) checks in parallel
                            </div>
                            <div style={{ display: 'flex', gap: 'var(--s2)', minHeight: '32px' }}>
                                {DRAFT_TOKENS.map((token, i) => {
                                    const state = tokenStates[i];
                                    const isVisible = state === 'accepted' || state === 'rejected';
                                    const isAccepted = state === 'accepted';

                                    return (
                                        <motion.div
                                            key={token.id}
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : -10 }}
                                            transition={{ duration: 0.2 }}
                                            style={{
                                                fontFamily: 'var(--font-mono)',
                                                fontSize: 'var(--text-sm)',
                                                background: isVisible ? (isAccepted ? 'var(--bg-inverse)' : 'var(--bg-raised)') : 'transparent',
                                                color: isVisible ? (isAccepted ? 'var(--text-inverse)' : 'var(--muted)') : 'transparent',
                                                padding: '4px 12px',
                                                borderRadius: 'var(--r-pill)',
                                                textDecoration: isVisible && !isAccepted ? 'line-through' : 'none',
                                                border: isVisible ? `1px solid ${isAccepted ? 'var(--bg-inverse)' : 'var(--stroke)'}` : '1px solid transparent'
                                            }}
                                        >
                                            {isVisible ? (isAccepted ? '✓ Accept' : '✗ Reject') : '•'}
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Result */}
                        {verificationDone && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                style={{
                                    fontFamily: 'var(--font-sans)',
                                    fontSize: 'var(--text-sm)',
                                    color: 'var(--ink)',
                                    textAlign: 'center',
                                    marginTop: 'var(--s2)',
                                    fontWeight: 'var(--weight-medium)'
                                }}
                            >
                                3 of 4 accepted. Effective speedup: ~3×
                            </motion.div>
                        )}
                    </div>
                </section>

                {/* 4. OPTIMIZATION COMPARISON TABLE */}
                <section
                    aria-labelledby="infer-compare-heading"
                    style={{
                        background: 'var(--bg-panel)',
                        border: '1px solid var(--stroke)',
                        borderRadius: 'var(--r-lg)',
                        overflow: 'hidden'
                    }}
                >
                    <div style={{ padding: 'var(--s4) var(--s5)', borderBottom: '1px solid var(--stroke)' }}>
                        <h3
                            id="infer-compare-heading"
                            style={{
                                fontFamily: 'var(--font-sans)',
                                fontSize: 'var(--text-lg)',
                                fontWeight: 'var(--weight-medium)',
                                color: 'var(--ink)',
                                margin: 0,
                            }}
                        >
                            Optimization Methods Compared
                        </h3>
                    </div>

                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead style={{ background: 'var(--bg-raised)' }}>
                                <tr>
                                    <th style={{ padding: 'var(--s3) var(--s5)', fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xs)', color: 'var(--muted)', fontWeight: 'var(--weight-medium)' }}>Technique</th>
                                    <th style={{ padding: 'var(--s3) var(--s4)', fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xs)', color: 'var(--muted)', fontWeight: 'var(--weight-medium)' }}>Memory Saving</th>
                                    <th style={{ padding: 'var(--s3) var(--s4)', fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xs)', color: 'var(--muted)', fontWeight: 'var(--weight-medium)' }}>Speed Gain</th>
                                    <th style={{ padding: 'var(--s3) var(--s5)', fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xs)', color: 'var(--muted)', fontWeight: 'var(--weight-medium)' }}>Quality Cost</th>
                                </tr>
                            </thead>
                            <tbody style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)', color: 'var(--ink)' }}>
                                {[
                                    { name: 'INT8 Quantization', mem: '~2×', speed: '~1.5×', cost: 'Low' },
                                    { name: 'INT4 (GPTQ/AWQ)', mem: '~4×', speed: '~2×', cost: 'Medium' },
                                    { name: 'Knowledge Distillation', mem: '2× - 10×', speed: '2× - 10×', cost: 'Medium to High' },
                                    { name: 'Speculative Decoding', mem: 'None', speed: '~2× - 3×', cost: 'None (Lossless)' },
                                ].map((row, i) => (
                                    <tr key={row.name} style={{ borderBottom: i === 3 ? 'none' : '1px solid var(--stroke)' }}>
                                        <td style={{ padding: 'var(--s3) var(--s5)', fontWeight: 'var(--weight-medium)' }}>{row.name}</td>
                                        <td style={{ padding: 'var(--s3) var(--s4)', fontFamily: 'var(--font-mono)' }}>{row.mem}</td>
                                        <td style={{ padding: 'var(--s3) var(--s4)', fontFamily: 'var(--font-mono)' }}>{row.speed}</td>
                                        <td style={{ padding: 'var(--s3) var(--s5)' }}>
                                            <span
                                                style={{
                                                    fontFamily: 'var(--font-mono)',
                                                    fontSize: 'var(--text-xs)',
                                                    background: 'var(--bg-raised)',
                                                    border: '1px solid var(--stroke-dark)',
                                                    padding: '2px 8px',
                                                    borderRadius: 'var(--r-pill)',
                                                    display: 'inline-block'
                                                }}
                                            >
                                                {row.cost}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>
            </section>
        </ErrorBoundary>
    );
}
