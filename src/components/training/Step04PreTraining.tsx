// src/components/training/Step04PreTraining.tsx
// Module 02 — Step 04: Pre-Training
// Four sections: Overview | Animated Loss Curve | Scaling Laws | Optimization Techniques
// Rules: tokens.css only · greyscale UI · --viz-* for charts · ErrorBoundary · prefers-reduced-motion

import { useState, useRef, useCallback, useEffect, useMemo, useReducer } from 'react';
import { ErrorBoundary } from '@/components/shared/ErrorBoundary';

// ─── Types ────────────────────────────────────────────────────────────────────

type SpeedFactor = '1×' | '5×' | '20×';
type OptTab = 'FlashAttention' | 'Mixed Precision' | 'ZeRO' | 'Grad Checkpoint';

interface StepProps {
    stepNumber: number;
    totalSteps: number;
    onNext: () => void;
    onPrev: () => void;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const CHART_W = 800;
const CHART_H = 220;
const PAD = { top: 20, right: 20, bottom: 32, left: 40 };
const INNER_W = CHART_W - PAD.left - PAD.right;
const INNER_H = CHART_H - PAD.top - PAD.bottom;

const MAX_STEPS_RENDERED = 100;  // Number of data points
const STEP_DOMAIN = 100_000;
const LOSS_MAX = 4.0;

const SPEED_MAP: Record<SpeedFactor, number> = { '1×': 8, '5×': 40, '20×': 160 };

// Annotation definitions
const ANNOTATIONS: { step: number; label: string }[] = [
    { step: 5_000, label: 'Initial fast descent' },
    { step: 30_000, label: 'Warmup complete' },
    { step: 70_000, label: 'Cosine decay begins' },
];

// Optimization tab content
const OPT_TABS: {
    id: OptTab;
    desc: string;
    stat: string;
    statLabel: string;
}[] = [
        {
            id: 'FlashAttention',
            desc: 'FlashAttention fuses the softmax and attention matrix multiply into a single kernel, dramatically reducing memory reads/writes to HBM. It avoids materializing the full N×N attention matrix in memory — work is done tile by tile in fast on-chip SRAM. Same numerics as standard attention; strictly better in every metric.',
            stat: '2–4×',
            statLabel: 'speedup',
        },
        {
            id: 'Mixed Precision',
            desc: 'Training in BF16 (or FP16) cuts parameter and gradient storage in half versus FP32. A master copy of weights is kept in FP32 for the optimizer update to preserve numerical stability. Activations, forward pass, and backward pass all run in half precision — gradients are scaled to prevent underflow.',
            stat: '2×',
            statLabel: 'memory reduction',
        },
        {
            id: 'ZeRO',
            desc: 'ZeRO (Zero Redundancy Optimizer) shards optimizer states, gradients, and parameters across GPUs rather than replicating them. Stage 1 shards optimizer state; Stage 2 adds gradient sharding; Stage 3 shards parameters too. Each GPU only holds its slice, then communicates during the update step. Memory scales linearly with GPU count.',
            stat: 'Linear',
            statLabel: 'memory scaling',
        },
        {
            id: 'Grad Checkpoint',
            desc: 'Gradient checkpointing trades compute for memory: instead of keeping every activation in memory for the backward pass, only selected "checkpoint" activations are saved. The rest are recomputed from the nearest checkpoint during backpropagation. This reduces activation memory by 60–70% at the cost of one extra forward pass.',
            stat: '60–70%',
            statLabel: 'memory reduction',
        },
    ];

// ─── Shared styles ────────────────────────────────────────────────────────────

const SECTION_STYLE: React.CSSProperties = { marginBottom: 'var(--s7)' };

const PANEL_STYLE: React.CSSProperties = {
    background: 'var(--bg-panel)',
    border: '1px solid var(--stroke)',
    borderRadius: 'var(--r-lg)',
    padding: 'var(--s5)',
    boxShadow: 'var(--shadow-soft)',
};

const LABEL_MONO: React.CSSProperties = {
    fontFamily: 'var(--font-mono)',
    fontSize: 'var(--text-xs)',
    color: 'var(--muted)',
    textTransform: 'uppercase' as const,
    letterSpacing: 'var(--tracking-wider)',
    margin: 0,
};

// ─── Math helpers ─────────────────────────────────────────────────────────────

/** Seeded noise: deterministic pseudo-random in [-1,1] */
function seededNoise(x: number): number {
    const s = Math.sin(x * 127.1 + 311.7) * 43758.5453;
    return (s - Math.floor(s)) * 2 - 1;
}

/** Training loss at step x (0..100k) */
function trainLoss(x: number): number {
    return 3.8 * Math.exp(-0.00003 * x) + 0.8 + seededNoise(x / 1000) * 0.06;
}

/** Validation loss at step x — slightly higher, smoother */
function valLoss(x: number): number {
    return 3.8 * Math.exp(-0.000028 * x) + 0.85 + seededNoise(x / 2000 + 99) * 0.03;
}

/** Map a data value to SVG coordinate space */
function toX(step: number): number {
    return PAD.left + (step / STEP_DOMAIN) * INNER_W;
}
function toY(loss: number): number {
    return PAD.top + INNER_H - (loss / LOSS_MAX) * INNER_H;
}

/** Build an SVG polyline `points` string from the first `count` data points. */
function buildPoints(fn: (x: number) => number, count: number): string {
    return Array.from({ length: count }, (_, i) => {
        const step = (i / (MAX_STEPS_RENDERED - 1)) * STEP_DOMAIN;
        return `${toX(step).toFixed(1)},${toY(fn(step)).toFixed(1)}`;
    }).join(' ');
}

/** Format a number as "6×10²³ FLOPs" with superscript exponent */
function fmtCompute(logVal: number): string {
    // logVal is 18..24 (log10 of FLOPs)
    return `10^${logVal}`;
}

/** Chinchilla optimal allocation given compute C (in FLOPs) */
function chinchilla(C: number) {
    const N_opt = 0.5 * Math.sqrt(C / 6);
    const D_opt = C / (6 * N_opt);
    const gpuDays = C / (312e12 * 86_400);   // A100 at 312 TFLOP/s
    return { N_opt, D_opt, gpuDays };
}

function fmtParams(n: number): string {
    if (n >= 1e12) return `${(n / 1e12).toFixed(1)}T`;
    if (n >= 1e9) return `${(n / 1e9).toFixed(1)}B`;
    if (n >= 1e6) return `${(n / 1e6).toFixed(0)}M`;
    return `${(n / 1e3).toFixed(0)}K`;
}

function fmtTokens(n: number): string {
    if (n >= 1e12) return `${(n / 1e12).toFixed(1)}T`;
    if (n >= 1e9) return `${(n / 1e9).toFixed(0)}B`;
    if (n >= 1e6) return `${(n / 1e6).toFixed(0)}M`;
    return `${n.toFixed(0)}`;
}

function fmtGpuDays(d: number): string {
    if (d >= 365) return `${(d / 365).toFixed(0)} GPU-years`;
    if (d >= 1) return `${d.toFixed(0)} GPU-days`;
    return `${(d * 24).toFixed(1)} GPU-hours`;
}

// ─── Section 1 — Overview ─────────────────────────────────────────────────────

function OverviewSection() {
    return (
        <section aria-labelledby="pt-overview-heading" style={SECTION_STYLE}>
            <p style={{ ...LABEL_MONO, marginBottom: 'var(--s3)' }}>STEP 04 — PRE-TRAINING</p>
            <h1
                id="pt-overview-heading"
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
                Trillions of tokens. Weeks of compute.<br />
                One objective: predict the next token.
            </h1>
            <p
                style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: 'var(--text-sm)',
                    fontWeight: 'var(--weight-light)',
                    color: 'var(--secondary)',
                    lineHeight: 'var(--lead-body)',
                    maxWidth: '62ch',
                    margin: '0 0 var(--s4)',
                }}
            >
                Pre-training is the compute-intensive core of LLM development. The model consumes
                hundreds of billions of tokens from raw text, learning to predict the next token at
                every position using <strong style={{ color: 'var(--primary)' }}>Causal Language
                    Modelling (CLM)</strong>. Each prediction error produces a <strong style={{ color: 'var(--primary)' }}>cross-entropy
                        loss signal</strong>, and gradients flow back through all layers to update billions of
                parameters. After trillions of such steps, the model has implicitly compressed vast
                world knowledge into its weights.
            </p>
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
                Scale is not incidental — it is the mechanism. Larger models trained on more tokens
                consistently outperform smaller counterparts. The Chinchilla paper (Hoffmann et al. 2022)
                formalized the compute-optimal frontier: given a fixed FLOP budget, split it equally
                between model parameters and training tokens.
            </p>
        </section>
    );
}

// ─── Section 2 — Animated Loss Curve ─────────────────────────────────────────

function LossCurveSection({ prefersReducedMotion }: { prefersReducedMotion: boolean }) {
    const [progress, setProgress] = useState(prefersReducedMotion ? MAX_STEPS_RENDERED : 0);
    const [running, setRunning] = useState(false);
    const [speed, setSpeed] = useState<SpeedFactor>('1×');
    const rafRef = useRef<number | null>(null);
    // Use a reducer-style tick count to drive the RAF without stale closures
    const progressRef = useRef(progress);
    progressRef.current = progress;
    const runningRef = useRef(running);
    runningRef.current = running;

    const stopAnimation = useCallback(() => {
        if (rafRef.current !== null) {
            cancelAnimationFrame(rafRef.current);
            rafRef.current = null;
        }
        setRunning(false);
    }, []);

    const startAnimation = useCallback(() => {
        if (prefersReducedMotion) return;
        if (progressRef.current >= MAX_STEPS_RENDERED) {
            progressRef.current = 0;
            setProgress(0);
        }
        setRunning(true);
    }, [prefersReducedMotion]);

    const reset = useCallback(() => {
        stopAnimation();
        setProgress(0);
        progressRef.current = 0;
    }, [stopAnimation]);

    // RAF loop
    const speedRef = useRef(speed);
    speedRef.current = speed;

    useEffect(() => {
        if (!running) return;
        let lastTime: number | null = null;
        let accumulator = 0;

        const tick = (ts: number) => {
            if (!runningRef.current) return;
            if (lastTime !== null) {
                const delta = ts - lastTime;
                accumulator += delta;
                // How many points to advance per second based on speed
                const ptsPerSec = SPEED_MAP[speedRef.current];
                const advance = Math.floor((accumulator / 1000) * ptsPerSec);
                if (advance > 0) {
                    accumulator -= (advance / ptsPerSec) * 1000;
                    const next = Math.min(progressRef.current + advance, MAX_STEPS_RENDERED);
                    progressRef.current = next;
                    setProgress(next);
                    if (next >= MAX_STEPS_RENDERED) {
                        setRunning(false);
                        return;
                    }
                }
            }
            lastTime = ts;
            rafRef.current = requestAnimationFrame(tick);
        };

        rafRef.current = requestAnimationFrame(tick);
        return () => {
            if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
        };
    }, [running]);

    // Precompute all points (memoised — never changes)
    const allTrainPts = useMemo(() => buildPoints(trainLoss, MAX_STEPS_RENDERED), []);
    const allValPts = useMemo(() => buildPoints(valLoss, MAX_STEPS_RENDERED), []);

    // Visible slice
    const trainPts = useMemo(() => buildPoints(trainLoss, Math.max(progress, 1)), [progress]);
    const valPts = useMemo(() => buildPoints(valLoss, Math.max(progress, 1)), [progress]);

    // Grid lines
    const yGridValues = [0.5, 1.0, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0];
    const xGridSteps = [0, 20_000, 40_000, 60_000, 80_000, 100_000];

    // Clip path id — unique to avoid collisions
    const clipId = 'loss-curve-clip';

    const btnBase: React.CSSProperties = {
        fontFamily: 'var(--font-mono)',
        fontSize: 'var(--text-xs)',
        color: 'var(--secondary)',
        background: 'transparent',
        border: '1px solid var(--stroke-dark)',
        borderRadius: 'var(--r-sm)',
        padding: 'var(--s1) var(--s3)',
        cursor: 'pointer',
        transition: 'all var(--dur-fast) var(--ease-out)',
        minHeight: '32px',
    };

    return (
        <section aria-labelledby="pt-loss-heading" style={SECTION_STYLE}>
            <h2
                id="pt-loss-heading"
                style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 'var(--text-xs)',
                    color: 'var(--muted)',
                    textTransform: 'uppercase',
                    letterSpacing: 'var(--tracking-wider)',
                    margin: '0 0 var(--s4)',
                    fontWeight: 'var(--weight-regular)',
                }}
            >
                Training Loss Curve
            </h2>

            <div style={PANEL_STYLE}>
                {/* Controls */}
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--s3)',
                        marginBottom: 'var(--s4)',
                        flexWrap: 'wrap',
                    }}
                >
                    {/* Animate / pause */}
                    <button
                        id="loss-animate-btn"
                        style={btnBase}
                        aria-label={running ? 'Pause animation' : 'Animate loss curve'}
                        onClick={() => {
                            if (running) { stopAnimation(); } else { startAnimation(); }
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'var(--bg-raised)';
                            e.currentTarget.style.color = 'var(--ink)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent';
                            e.currentTarget.style.color = 'var(--secondary)';
                        }}
                        disabled={prefersReducedMotion}
                    >
                        {running ? '⏸ Pause' : '▶ Animate'}
                    </button>

                    {/* Speed selector */}
                    <div
                        role="group"
                        aria-label="Animation speed"
                        style={{ display: 'flex', gap: 'var(--s1)' }}
                    >
                        {(['1×', '5×', '20×'] as SpeedFactor[]).map((s) => (
                            <button
                                key={s}
                                id={`loss-speed-${s.replace('×', 'x')}`}
                                style={{
                                    ...btnBase,
                                    background: speed === s ? 'var(--bg-inverse)' : 'transparent',
                                    color: speed === s ? 'var(--text-inverse)' : 'var(--secondary)',
                                    borderColor: speed === s ? 'var(--ink)' : 'var(--stroke-dark)',
                                }}
                                onClick={() => setSpeed(s)}
                                aria-pressed={speed === s}
                            >
                                {s}
                            </button>
                        ))}
                    </div>

                    {/* Reset */}
                    <button
                        id="loss-reset-btn"
                        style={btnBase}
                        aria-label="Reset animation"
                        onClick={reset}
                        disabled={prefersReducedMotion}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'var(--bg-raised)';
                            e.currentTarget.style.color = 'var(--ink)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent';
                            e.currentTarget.style.color = 'var(--secondary)';
                        }}
                    >
                        ↺
                    </button>

                    {/* Legend */}
                    <div
                        style={{
                            marginLeft: 'auto',
                            display: 'flex',
                            gap: 'var(--s4)',
                            alignItems: 'center',
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--s2)' }}>
                            <svg width="20" height="2" aria-hidden="true">
                                <line x1="0" y1="1" x2="20" y2="1" stroke="var(--ink)" strokeWidth="2" />
                            </svg>
                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-2xs)', color: 'var(--muted)' }}>
                                train loss
                            </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--s2)' }}>
                            <svg width="20" height="2" aria-hidden="true">
                                <line x1="0" y1="1" x2="20" y2="1" stroke="var(--stroke-dark)" strokeWidth="1.5" strokeDasharray="4 2" />
                            </svg>
                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-2xs)', color: 'var(--muted)' }}>
                                val loss
                            </span>
                        </div>
                    </div>
                </div>

                {/* SVG Chart */}
                <div
                    style={{ width: '100%', overflowX: 'auto' }}
                    role="img"
                    aria-label="Animated training loss curve showing loss decreasing from ~3.8 to ~0.8 over 100k training steps"
                >
                    <svg
                        viewBox={`0 0 ${CHART_W} ${CHART_H}`}
                        width="100%"
                        style={{ display: 'block', maxHeight: '400px' }}
                        preserveAspectRatio="xMidYMid meet"
                    >
                        <defs>
                            <clipPath id={clipId}>
                                <rect
                                    x={PAD.left}
                                    y={PAD.top}
                                    width={INNER_W}
                                    height={INNER_H}
                                />
                            </clipPath>
                        </defs>

                        {/* Y grid lines */}
                        {yGridValues.map((v) => (
                            <g key={v}>
                                <line
                                    x1={PAD.left}
                                    y1={toY(v)}
                                    x2={PAD.left + INNER_W}
                                    y2={toY(v)}
                                    stroke="var(--stroke)"
                                    strokeWidth="1"
                                    strokeDasharray="4 4"
                                />
                                <text
                                    x={PAD.left - 6}
                                    y={toY(v) + 4}
                                    textAnchor="end"
                                    fontFamily="var(--font-mono)"
                                    fontSize="10"
                                    fill="var(--muted)"
                                >
                                    {v.toFixed(1)}
                                </text>
                            </g>
                        ))}

                        {/* X grid lines + labels */}
                        {xGridSteps.map((s) => (
                            <g key={s}>
                                <line
                                    x1={toX(s)}
                                    y1={PAD.top}
                                    x2={toX(s)}
                                    y2={PAD.top + INNER_H}
                                    stroke="var(--stroke)"
                                    strokeWidth="1"
                                    strokeDasharray="4 4"
                                />
                                <text
                                    x={toX(s)}
                                    y={PAD.top + INNER_H + 16}
                                    textAnchor="middle"
                                    fontFamily="var(--font-mono)"
                                    fontSize="10"
                                    fill="var(--muted)"
                                >
                                    {s === 0 ? '0' : `${s / 1000}k`}
                                </text>
                            </g>
                        ))}

                        {/* Axis labels */}
                        <text
                            x={PAD.left + INNER_W / 2}
                            y={CHART_H - 2}
                            textAnchor="middle"
                            fontFamily="var(--font-mono)"
                            fontSize="10"
                            fill="var(--muted)"
                        >
                            steps
                        </text>
                        <text
                            x={10}
                            y={PAD.top + INNER_H / 2}
                            textAnchor="middle"
                            fontFamily="var(--font-mono)"
                            fontSize="10"
                            fill="var(--muted)"
                            transform={`rotate(-90, 10, ${PAD.top + INNER_H / 2})`}
                        >
                            loss
                        </text>

                        {/* Clip group for curves */}
                        <g clipPath={`url(#${clipId})`}>
                            {/* Ghost (full) val loss — shown always in reduced motion */}
                            {prefersReducedMotion && (
                                <polyline
                                    points={allValPts}
                                    fill="none"
                                    stroke="var(--stroke-dark)"
                                    strokeWidth="1.5"
                                    strokeDasharray="6 3"
                                />
                            )}
                            {/* Ghost (full) train loss — shown always in reduced motion */}
                            {prefersReducedMotion && (
                                <polyline
                                    points={allTrainPts}
                                    fill="none"
                                    stroke="var(--ink)"
                                    strokeWidth="2"
                                />
                            )}
                            {/* Animated curves */}
                            {!prefersReducedMotion && (
                                <>
                                    <polyline
                                        points={valPts}
                                        fill="none"
                                        stroke="var(--stroke-dark)"
                                        strokeWidth="1.5"
                                        strokeDasharray="6 3"
                                    />
                                    <polyline
                                        points={trainPts}
                                        fill="none"
                                        stroke="var(--ink)"
                                        strokeWidth="2"
                                    />
                                </>
                            )}
                        </g>

                        {/* Annotations — only show once curve has reached them */}
                        {ANNOTATIONS.map((ann) => {
                            const dataIdx = Math.round((ann.step / STEP_DOMAIN) * (MAX_STEPS_RENDERED - 1));
                            const visible = prefersReducedMotion || progress >= dataIdx;
                            if (!visible) return null;
                            const cx = toX(ann.step);
                            const cy = toY(trainLoss(ann.step));
                            return (
                                <g key={ann.step}>
                                    <line
                                        x1={cx}
                                        y1={cy - 6}
                                        x2={cx}
                                        y2={cy - 26}
                                        stroke="var(--muted)"
                                        strokeWidth="1"
                                    />
                                    <circle cx={cx} cy={cy} r="3" fill="var(--ink)" />
                                    <text
                                        x={cx}
                                        y={cy - 30}
                                        textAnchor="middle"
                                        fontFamily="var(--font-mono)"
                                        fontSize="9"
                                        fill="var(--muted)"
                                    >
                                        {ann.label}
                                    </text>
                                </g>
                            );
                        })}
                    </svg>
                </div>
            </div>
        </section>
    );
}

// ─── Section 3 — Scaling Laws Calculator ─────────────────────────────────────

function ScalingLawsSection() {
    // Slider: log10 of compute budget, range 18..24
    const [logC, setLogC] = useState(21);  // default 1e21

    const C = useMemo(() => Math.pow(10, logC), [logC]);
    const { N_opt, D_opt, gpuDays } = useMemo(() => chinchilla(C), [C]);

    const ratio = useMemo(() => D_opt / N_opt, [D_opt, N_opt]);

    const cardStyle: React.CSSProperties = {
        background: 'var(--bg)',
        border: '1px solid var(--stroke)',
        borderRadius: 'var(--r-md)',
        padding: 'var(--s4)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--s1)',
    };

    const cards = [
        { label: 'Optimal params', value: fmtParams(N_opt), id: 'sl-params' },
        { label: 'Optimal tokens', value: fmtTokens(D_opt), id: 'sl-tokens' },
        { label: 'Chinchilla ratio', value: `~${ratio.toFixed(0)} tokens/param`, id: 'sl-ratio' },
        { label: 'Est GPU-days (A100)', value: fmtGpuDays(gpuDays), id: 'sl-gpudays' },
    ];

    return (
        <section aria-labelledby="pt-scaling-heading" style={SECTION_STYLE}>
            <h2
                id="pt-scaling-heading"
                style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 'var(--text-xs)',
                    color: 'var(--muted)',
                    textTransform: 'uppercase',
                    letterSpacing: 'var(--tracking-wider)',
                    margin: '0 0 var(--s4)',
                    fontWeight: 'var(--weight-regular)',
                }}
            >
                Chinchilla Optimal Compute Allocation
            </h2>

            <div style={PANEL_STYLE}>
                {/* Slider */}
                <div style={{ marginBottom: 'var(--s5)' }}>
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'baseline',
                            marginBottom: 'var(--s2)',
                        }}
                    >
                        <label
                            htmlFor="compute-slider"
                            style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--muted)' }}
                        >
                            Compute Budget (FLOPs)
                        </label>
                        <span
                            id="compute-display"
                            style={{
                                fontFamily: 'var(--font-mono)',
                                fontSize: 'var(--text-sm)',
                                color: 'var(--ink)',
                                fontWeight: 'var(--weight-medium)',
                            }}
                            aria-live="polite"
                            aria-atomic="true"
                        >
                            {fmtCompute(logC)} FLOPs
                        </span>
                    </div>
                    <input
                        id="compute-slider"
                        type="range"
                        min={18}
                        max={24}
                        step={0.25}
                        value={logC}
                        onChange={(e) => setLogC(Number(e.target.value))}
                        aria-label="Compute budget in FLOPs (log scale)"
                        aria-valuemin={18}
                        aria-valuemax={24}
                        aria-valuenow={logC}
                        aria-valuetext={`10^${logC} FLOPs`}
                        style={{ width: '100%', accentColor: 'var(--ink)', cursor: 'pointer' }}
                    />
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            marginTop: 'var(--s1)',
                        }}
                    >
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-2xs)', color: 'var(--stroke-dark)' }}>
                            10¹⁸
                        </span>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-2xs)', color: 'var(--stroke-dark)' }}>
                            10²⁴
                        </span>
                    </div>
                </div>

                {/* 2×2 cards */}
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: 'var(--s3)',
                        marginBottom: 'var(--s4)',
                    }}
                >
                    {cards.map((c) => (
                        <div key={c.id} id={c.id} style={cardStyle} aria-label={c.label}>
                            <span
                                style={{
                                    fontFamily: 'var(--font-mono)',
                                    fontSize: 'var(--text-2xs)',
                                    color: 'var(--muted)',
                                    textTransform: 'uppercase',
                                    letterSpacing: 'var(--tracking-wide)',
                                }}
                            >
                                {c.label}
                            </span>
                            <span
                                style={{
                                    fontFamily: 'var(--font-mono)',
                                    fontSize: 'var(--text-md)',
                                    color: 'var(--ink)',
                                    fontWeight: 'var(--weight-semibold)',
                                    lineHeight: 'var(--lead-tight)',
                                }}
                            >
                                {c.value}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Formula + note */}
                <div
                    style={{
                        borderTop: '1px solid var(--stroke)',
                        paddingTop: 'var(--s3)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 'var(--s2)',
                    }}
                >
                    <p
                        style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: 'var(--text-xs)',
                            color: 'var(--muted)',
                            margin: 0,
                        }}
                    >
                        Formula: N_opt = 0.5 × (C / 6)^0.5 · D_opt = C / (6 × N_opt)
                    </p>
                    <p
                        style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: 'var(--text-2xs)',
                            color: 'var(--stroke-dark)',
                            margin: 0,
                        }}
                    >
                        Based on Hoffmann et al. 2022 — A100 estimate at 312 TFLOP/s BF16
                    </p>
                </div>
            </div>
        </section>
    );
}

// ─── Section 4 — Optimization Techniques ─────────────────────────────────────

function OptimizationSection() {
    const [activeTab, setActiveTab] = useState<OptTab>('FlashAttention');
    const activeData = OPT_TABS.find((t) => t.id === activeTab)!;

    const tabBtnStyle = (active: boolean): React.CSSProperties => ({
        fontFamily: 'var(--font-mono)',
        fontSize: 'var(--text-xs)',
        padding: 'var(--s2) var(--s3)',
        borderRadius: 'var(--r-sm)',
        border: active ? '1px solid var(--ink)' : '1px solid var(--stroke-dark)',
        background: active ? 'var(--bg-inverse)' : 'transparent',
        color: active ? 'var(--text-inverse)' : 'var(--secondary)',
        cursor: 'pointer',
        transition: 'all var(--dur-fast) var(--ease-out)',
        whiteSpace: 'nowrap' as const,
        minHeight: '36px',
    });

    return (
        <section aria-labelledby="pt-opt-heading" style={{ ...SECTION_STYLE, marginBottom: 'var(--s5)' }}>
            <h2
                id="pt-opt-heading"
                style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 'var(--text-xs)',
                    color: 'var(--muted)',
                    textTransform: 'uppercase',
                    letterSpacing: 'var(--tracking-wider)',
                    margin: '0 0 var(--s4)',
                    fontWeight: 'var(--weight-regular)',
                }}
            >
                Optimization Techniques
            </h2>

            <div style={PANEL_STYLE}>
                {/* Tab row */}
                <div
                    role="tablist"
                    aria-label="Optimization techniques"
                    style={{
                        display: 'flex',
                        gap: 'var(--s2)',
                        flexWrap: 'wrap',
                        marginBottom: 'var(--s5)',
                    }}
                >
                    {OPT_TABS.map((t) => (
                        <button
                            key={t.id}
                            id={`opt-tab-${t.id.toLowerCase().replace(/\s+/g, '-')}`}
                            role="tab"
                            aria-selected={activeTab === t.id}
                            aria-controls="opt-tab-panel"
                            onClick={() => setActiveTab(t.id)}
                            style={tabBtnStyle(activeTab === t.id)}
                            onMouseEnter={(e) => {
                                if (activeTab !== t.id) {
                                    e.currentTarget.style.background = 'var(--bg-raised)';
                                    e.currentTarget.style.color = 'var(--ink)';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (activeTab !== t.id) {
                                    e.currentTarget.style.background = 'transparent';
                                    e.currentTarget.style.color = 'var(--secondary)';
                                }
                            }}
                        >
                            {t.id}
                        </button>
                    ))}
                </div>

                {/* Tab panel */}
                <div
                    id="opt-tab-panel"
                    role="tabpanel"
                    aria-labelledby={`opt-tab-${activeTab.toLowerCase().replace(/\s+/g, '-')}`}
                    style={{
                        display: 'flex',
                        gap: 'var(--s5)',
                        alignItems: 'flex-start',
                        flexWrap: 'wrap',
                    }}
                >
                    {/* Description */}
                    <p
                        style={{
                            flex: '1 1 200px',
                            fontFamily: 'var(--font-sans)',
                            fontSize: 'var(--text-sm)',
                            color: 'var(--secondary)',
                            lineHeight: 'var(--lead-body)',
                            margin: 0,
                        }}
                    >
                        {activeData.desc}
                    </p>

                    {/* Key stat */}
                    <div
                        style={{
                            flex: '0 0 auto',
                            background: 'var(--bg)',
                            border: '1px solid var(--stroke)',
                            borderRadius: 'var(--r-md)',
                            padding: 'var(--s4) var(--s5)',
                            textAlign: 'center',
                            minWidth: '120px',
                        }}
                    >
                        <div
                            style={{
                                fontFamily: 'var(--font-mono)',
                                fontSize: 'var(--text-lg)',
                                color: 'var(--ink)',
                                fontWeight: 'var(--weight-semibold)',
                                lineHeight: 'var(--lead-tight)',
                                marginBottom: 'var(--s1)',
                            }}
                        >
                            {activeData.stat}
                        </div>
                        <div
                            style={{
                                fontFamily: 'var(--font-mono)',
                                fontSize: 'var(--text-2xs)',
                                color: 'var(--muted)',
                                textTransform: 'uppercase',
                                letterSpacing: 'var(--tracking-wide)',
                            }}
                        >
                            {activeData.statLabel}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

// ─── Root Export ──────────────────────────────────────────────────────────────

export function Step04PreTraining({ onNext: _onNext, onPrev: _onPrev, stepNumber, totalSteps }: StepProps) {
    // Detect prefers-reduced-motion
    const [prefersReducedMotion, setPrefersReducedMotion] = useReducer(
        (_: boolean, v: boolean) => v,
        typeof window !== 'undefined'
            ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
            : false,
    );

    useEffect(() => {
        const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
        const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
        mq.addEventListener('change', handler);
        return () => mq.removeEventListener('change', handler);
    }, []);

    return (
        <ErrorBoundary>
            <article
                aria-label={`Step ${stepNumber} of ${totalSteps}: Pre-Training`}
                style={{ display: 'flex', flexDirection: 'column', gap: 0 }}
            >
                <OverviewSection />
                <LossCurveSection prefersReducedMotion={prefersReducedMotion} />
                <ScalingLawsSection />
                <OptimizationSection />
            </article>
        </ErrorBoundary>
    );
}
