// src/components/training/Step05Evaluation.tsx
// Module 02 — Step 05: Evaluation During Training
// Sections: Overview · Live Training Dashboard · Anomaly Detector
// Rules: tokens.css only · greyscale UI · --viz-* for charts · ErrorBoundary · prefers-reduced-motion

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { ErrorBoundary } from '@/components/shared/ErrorBoundary';

// ─── Types ────────────────────────────────────────────────────────────────────

interface StepProps {
    stepNumber: number;
    totalSteps: number;
    onNext: () => void;
    onPrev: () => void;
}

type FailureMode = 'Loss Spike' | 'Loss Plateau' | 'Gradient Explosion' | 'Divergence';

// ─── Constants ────────────────────────────────────────────────────────────────

const SIM_TICKS = 80;          // total simulation ticks
const TICK_MS = 500;          // ms between ticks
const SPARKLINE_N = 20;        // number of points in sparkline

const GRAD_CLIP_THRESHOLD = 1.0;
const OVERFIT_GAP_THRESHOLD = 0.18;

// Pre-computed training trajectories (deterministic, no randomness at render time)
function seededRand(seed: number): number {
    // LCG — same input → same output
    const s = Math.sin(seed * 9301 + 49297) * 233280;
    return s - Math.floor(s);
}

function buildTrajectories(ticks: number) {
    const trainLoss: number[] = [];
    const gradNorm: number[] = [];
    const valLoss: number[] = [];

    for (let i = 0; i < ticks; i++) {
        const t = i / (ticks - 1); // 0..1
        const noise = (seededRand(i * 3) - 0.5) * 0.06;
        const tl = 3.2 * Math.exp(-3.5 * t) + 0.72 + noise;
        trainLoss.push(Math.max(0.1, tl));

        // Gradient norm: spiky early, smooths out
        const gBase = 2.8 * Math.exp(-2.8 * t) + 0.3;
        const gNoise = (seededRand(i * 7 + 1) - 0.5) * 0.5;
        gradNorm.push(Math.max(0.05, gBase + gNoise));

        // Val loss slightly higher, a bit smoother
        const vl = 3.2 * Math.exp(-3.0 * t) + 0.82 + (seededRand(i * 5 + 2) - 0.5) * 0.04;
        valLoss.push(Math.max(0.1, vl));
    }
    return { trainLoss, gradNorm, valLoss };
}

const TRAJECTORIES = buildTrajectories(SIM_TICKS);

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

const BTN_BASE: React.CSSProperties = {
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

// ─── Sparkline helper ─────────────────────────────────────────────────────────

function Sparkline({ values, width = 80, height = 28, stroke = 'var(--ink)' }: {
    values: number[];
    width?: number;
    height?: number;
    stroke?: string;
}) {
    if (values.length < 2) return null;
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;
    const PAD_X = 2;

    const pts = values.map((v, i) => {
        const x = PAD_X + (i / (values.length - 1)) * (width - PAD_X * 2);
        const y = height - 2 - ((v - min) / range) * (height - 4);
        return `${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(' ');

    return (
        <svg width={width} height={height} aria-hidden="true" style={{ display: 'block' }}>
            <polyline points={pts} fill="none" stroke={stroke} strokeWidth="1.5" strokeLinejoin="round" />
        </svg>
    );
}

// ─── Section 1 — Overview ─────────────────────────────────────────────────────

function OverviewSection() {
    return (
        <section aria-labelledby="eval-overview-heading" style={SECTION_STYLE}>
            <p style={{ ...LABEL_MONO, marginBottom: 'var(--s3)' }}>STEP 05 — EVALUATION DURING TRAINING</p>
            <h1
                id="eval-overview-heading"
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
                Training isn't a black box.{' '}
                Every step is measured.
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
                Modern LLM training runs emit a continuous stream of signals: <strong style={{ color: 'var(--primary)' }}>training
                    loss</strong>, <strong style={{ color: 'var(--primary)' }}>validation loss</strong>, gradient norms,
                and perplexity. Practitioners watch these curves in real time to detect instability,
                catch divergence early, and decide when to stop.
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
                The gap between training and validation loss is the primary signal for <strong style={{ color: 'var(--primary)' }}>overfitting</strong>.
                Gradient norms reveal whether learning is healthy or collapsing. These metrics — not
                benchmark scores — are the first line of defence during a training run.
            </p>
        </section>
    );
}

// ─── Section 2 — Live Training Dashboard ─────────────────────────────────────

function DashboardSection({ prefersReducedMotion }: { prefersReducedMotion: boolean }) {
    const [tick, setTick] = useState(prefersReducedMotion ? SIM_TICKS - 1 : 0);
    const [running, setRunning] = useState(false);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // Start / Stop
    const start = useCallback(() => {
        if (prefersReducedMotion) return;
        setRunning(true);
    }, [prefersReducedMotion]);

    const pause = useCallback(() => {
        setRunning(false);
    }, []);

    const reset = useCallback(() => {
        setRunning(false);
        setTick(0);
    }, []);

    // Interval
    useEffect(() => {
        if (!running) return;
        intervalRef.current = setInterval(() => {
            setTick((t) => {
                if (t >= SIM_TICKS - 1) {
                    setRunning(false);
                    return t;
                }
                return t + 1;
            });
        }, TICK_MS);
        return () => {
            if (intervalRef.current !== null) clearInterval(intervalRef.current);
        };
    }, [running]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (intervalRef.current !== null) clearInterval(intervalRef.current);
        };
    }, []);

    // Current values
    const trainLoss = TRAJECTORIES.trainLoss[tick] ?? 0;
    const gradNorm = TRAJECTORIES.gradNorm[tick] ?? 0;
    const valLoss = TRAJECTORIES.valLoss[tick] ?? 0;
    const perplexity = Math.exp(trainLoss);

    // Sparklines (last SPARKLINE_N points up to current tick)
    const sparkStart = Math.max(0, tick - SPARKLINE_N + 1);
    const tlSpark = TRAJECTORIES.trainLoss.slice(sparkStart, tick + 1);
    const ppSpark = tlSpark.map(Math.exp);
    const vlSpark = TRAJECTORIES.valLoss.slice(sparkStart, tick + 1);

    // Derived
    const isClipping = gradNorm > GRAD_CLIP_THRESHOLD;
    const gap = valLoss - trainLoss;
    const isPossiblyOverfitting = gap > OVERFIT_GAP_THRESHOLD;

    // Trend arrow (compare last 3 ticks)
    function trendArrow(arr: number[], idx: number): string {
        if (idx < 2) return '–';
        const delta = arr[idx] - arr[idx - 2];
        if (Math.abs(delta) < 0.005) return '→';
        return delta < 0 ? '↓' : '↑';
    }
    const tlTrend = trendArrow(TRAJECTORIES.trainLoss, tick);
    const ppTrend = trendArrow(TRAJECTORIES.trainLoss, tick); // perplexity follows same trend as loss

    // Badge style
    const badgeStyle = (active: boolean, color?: string): React.CSSProperties => ({
        fontFamily: 'var(--font-mono)',
        fontSize: 'var(--text-2xs)',
        fontWeight: 'var(--weight-medium)',
        color: active ? 'var(--text-inverse)' : 'var(--muted)',
        background: active ? (color ?? 'var(--bg-inverse)') : 'var(--bg-raised)',
        border: `1px solid ${active ? (color ?? 'var(--ink)') : 'var(--stroke)'}`,
        borderRadius: 'var(--r-pill)',
        padding: '2px var(--s2)',
        letterSpacing: 'var(--tracking-wide)',
        textTransform: 'uppercase' as const,
        whiteSpace: 'nowrap' as const,
    });

    // Metric panel inner card
    const metricCard: React.CSSProperties = {
        background: 'var(--bg)',
        border: '1px solid var(--stroke)',
        borderRadius: 'var(--r-md)',
        padding: 'var(--s4)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--s2)',
    };

    return (
        <section aria-labelledby="eval-dashboard-heading" style={SECTION_STYLE}>
            <h2
                id="eval-dashboard-heading"
                style={{
                    ...LABEL_MONO,
                    margin: '0 0 var(--s4)',
                    fontWeight: 'var(--weight-regular)',
                }}
            >
                Live Training Dashboard
            </h2>

            <div style={PANEL_STYLE}>
                {/* Controls */}
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--s3)',
                        marginBottom: 'var(--s5)',
                        flexWrap: 'wrap',
                    }}
                >
                    {/* Simulate / Pause */}
                    {!running ? (
                        <button
                            id="eval-simulate-btn"
                            style={BTN_BASE}
                            onClick={start}
                            disabled={prefersReducedMotion || tick >= SIM_TICKS - 1}
                            aria-label="Start simulation"
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'var(--bg-raised)';
                                e.currentTarget.style.color = 'var(--ink)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'transparent';
                                e.currentTarget.style.color = 'var(--secondary)';
                            }}
                        >
                            ▶ Simulate
                        </button>
                    ) : (
                        <button
                            id="eval-pause-btn"
                            style={BTN_BASE}
                            onClick={pause}
                            aria-label="Pause simulation"
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'var(--bg-raised)';
                                e.currentTarget.style.color = 'var(--ink)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'transparent';
                                e.currentTarget.style.color = 'var(--secondary)';
                            }}
                        >
                            ⏸ Pause
                        </button>
                    )}

                    <button
                        id="eval-reset-btn"
                        style={BTN_BASE}
                        onClick={reset}
                        aria-label="Reset simulation"
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'var(--bg-raised)';
                            e.currentTarget.style.color = 'var(--ink)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent';
                            e.currentTarget.style.color = 'var(--secondary)';
                        }}
                    >
                        ↺ Reset
                    </button>

                    {/* Progress indicator */}
                    <span
                        style={{
                            marginLeft: 'auto',
                            fontFamily: 'var(--font-mono)',
                            fontSize: 'var(--text-2xs)',
                            color: 'var(--muted)',
                        }}
                        aria-live="polite"
                        aria-atomic="true"
                    >
                        step {tick + 1} / {SIM_TICKS}
                    </span>
                </div>

                {/* 2×2 metric grid */}
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                        gap: 'var(--s3)',
                    }}
                    role="region"
                    aria-label="Training metrics"
                >
                    {/* Panel 1 — Training Loss */}
                    <div id="eval-panel-train-loss" style={metricCard} aria-label="Training loss">
                        <p style={LABEL_MONO}>Training Loss</p>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--s2)' }}>
                            <span
                                style={{
                                    fontFamily: 'var(--font-mono)',
                                    fontSize: 'var(--text-xl)',
                                    fontWeight: 'var(--weight-semibold)',
                                    color: 'var(--ink)',
                                    lineHeight: 'var(--lead-tight)',
                                }}
                                aria-live="polite"
                                aria-atomic="true"
                            >
                                {trainLoss.toFixed(3)}
                            </span>
                            <span
                                style={{
                                    fontFamily: 'var(--font-mono)',
                                    fontSize: 'var(--text-md)',
                                    color: tlTrend === '↓' ? 'var(--secondary)' : 'var(--muted)',
                                    fontWeight: 'var(--weight-medium)',
                                }}
                                aria-label={`Trend: ${tlTrend === '↓' ? 'decreasing' : tlTrend === '↑' ? 'increasing' : 'stable'}`}
                            >
                                {tlTrend}
                            </span>
                        </div>
                        <Sparkline values={tlSpark} width={100} height={28} stroke="var(--ink)" />
                    </div>

                    {/* Panel 2 — Gradient Norm */}
                    <div id="eval-panel-grad-norm" style={metricCard} aria-label="Gradient norm">
                        <p style={LABEL_MONO}>Gradient Norm</p>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--s2)' }}>
                            <span
                                style={{
                                    fontFamily: 'var(--font-mono)',
                                    fontSize: 'var(--text-xl)',
                                    fontWeight: 'var(--weight-semibold)',
                                    color: 'var(--ink)',
                                    lineHeight: 'var(--lead-tight)',
                                }}
                                aria-live="polite"
                                aria-atomic="true"
                            >
                                {gradNorm.toFixed(3)}
                            </span>
                        </div>
                        {/* Threshold line visual */}
                        <div style={{ position: 'relative', height: '6px', background: 'var(--bg-raised)', borderRadius: 'var(--r-pill)', overflow: 'hidden' }}>
                            <div
                                style={{
                                    position: 'absolute',
                                    left: 0,
                                    top: 0,
                                    height: '100%',
                                    width: `${Math.min(100, (gradNorm / 3) * 100).toFixed(1)}%`,
                                    background: isClipping ? 'var(--viz-neg)' : 'var(--ink)',
                                    borderRadius: 'var(--r-pill)',
                                    transition: 'width var(--dur-base) var(--ease-out)',
                                }}
                            />
                            {/* Threshold tick at 1.0/3 ≈ 33% */}
                            <div
                                style={{
                                    position: 'absolute',
                                    left: '33.33%',
                                    top: 0,
                                    height: '100%',
                                    width: '1px',
                                    background: 'var(--stroke-dark)',
                                }}
                                aria-hidden="true"
                            />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-2xs)', color: 'var(--muted)' }}>
                                threshold 1.0
                            </span>
                            {isClipping && (
                                <span id="eval-clipping-badge" style={badgeStyle(true)}>
                                    Clipping Active
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Panel 3 — Perplexity */}
                    <div id="eval-panel-perplexity" style={metricCard} aria-label="Perplexity">
                        <p style={LABEL_MONO}>Perplexity</p>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--s2)' }}>
                            <span
                                style={{
                                    fontFamily: 'var(--font-mono)',
                                    fontSize: 'var(--text-xl)',
                                    fontWeight: 'var(--weight-semibold)',
                                    color: 'var(--ink)',
                                    lineHeight: 'var(--lead-tight)',
                                }}
                                aria-live="polite"
                                aria-atomic="true"
                            >
                                {perplexity < 1000
                                    ? perplexity.toFixed(1)
                                    : perplexity < 10000
                                        ? `${(perplexity / 1000).toFixed(1)}k`
                                        : `${Math.round(perplexity / 1000)}k`}
                            </span>
                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-2xs)', color: 'var(--muted)' }}>
                                {ppTrend}
                            </span>
                        </div>
                        <Sparkline values={ppSpark} width={100} height={28} stroke="var(--secondary)" />
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-2xs)', color: 'var(--muted)' }}>
                            exp(loss)
                        </span>
                    </div>

                    {/* Panel 4 — Validation Loss */}
                    <div id="eval-panel-val-loss" style={metricCard} aria-label="Validation loss">
                        <p style={LABEL_MONO}>Validation Loss</p>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--s2)' }}>
                            <span
                                style={{
                                    fontFamily: 'var(--font-mono)',
                                    fontSize: 'var(--text-xl)',
                                    fontWeight: 'var(--weight-semibold)',
                                    color: 'var(--ink)',
                                    lineHeight: 'var(--lead-tight)',
                                }}
                                aria-live="polite"
                                aria-atomic="true"
                            >
                                {valLoss.toFixed(3)}
                            </span>
                        </div>
                        <Sparkline values={vlSpark} width={100} height={28} stroke="var(--muted)" />
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--s2)', flexWrap: 'wrap' }}>
                            <span
                                style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-2xs)', color: 'var(--muted)' }}
                                aria-live="polite"
                                aria-atomic="true"
                            >
                                Δ {gap >= 0 ? '+' : ''}{gap.toFixed(3)}
                            </span>
                            {isPossiblyOverfitting && (
                                <span id="eval-overfit-badge" style={badgeStyle(true)}>
                                    Possible Overfitting
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

// ─── Section 3 — Anomaly Detector ─────────────────────────────────────────────

// SVG chart dimensions
const A_W = 800;
const A_H = 220;
const A_PAD = { top: 20, right: 20, bottom: 32, left: 40 };
const A_IW = A_W - A_PAD.left - A_PAD.right;
const A_IH = A_H - A_PAD.top - A_PAD.bottom;

// Failure mode definitions
interface FailureData {
    id: FailureMode;
    cause: string;
    points: [number, number][];              // [x 0..1, y 0..1 (normalised loss)]
    highlightRange: [number, number];        // [startX, endX] normalised
    annotationX: number;                     // normalised
    annotationY: number;
    annotationLabel: string;
}

const FAILURES: FailureData[] = [
    {
        id: 'Loss Spike',
        cause: 'A sudden burst in loss (often 3–15× the running average) is typically caused by a bad micro-batch — an extremely rare token combination, a corrupted data example, or a transient numerical instability. The learning rate may be too high, or gradient clipping is absent. The loss usually recovers within a few hundred steps, but frequent spikes indicate the dataset needs more aggressive filtering.',
        points: [
            [0, 0.85], [0.1, 0.78], [0.2, 0.70], [0.28, 0.66],
            [0.35, 0.62], [0.38, 0.59], // spike
            [0.40, 0.95], [0.42, 0.88],  // spike peak
            [0.45, 0.63], [0.55, 0.58],
            [0.65, 0.52], [0.75, 0.48], [0.85, 0.44], [1.0, 0.40],
        ],
        highlightRange: [0.36, 0.46],
        annotationX: 0.41,
        annotationY: 0.97,
        annotationLabel: 'Loss Spike',
    },
    {
        id: 'Loss Plateau',
        cause: 'Training loss stalls and stops improving for many thousands of steps. Common causes: learning rate too low (stuck near a saddle point), a too-aggressive warmup followed by premature decay, a bottleneck in the data pipeline that feeds repeated batches, or the model has saturated on easy examples. Remedies include cyclical LR schedules, data shuffling, and increasing token diversity.',
        points: [
            [0, 0.90], [0.1, 0.78], [0.2, 0.68], [0.3, 0.62],
            [0.38, 0.59], [0.42, 0.585], [0.50, 0.587], [0.58, 0.584],
            [0.66, 0.582], [0.72, 0.585], [0.78, 0.581],
            [0.84, 0.578], [0.90, 0.52], [1.0, 0.45],
        ],
        highlightRange: [0.38, 0.82],
        annotationX: 0.60,
        annotationY: 0.60,
        annotationLabel: 'Plateau',
    },
    {
        id: 'Gradient Explosion',
        cause: 'Gradient norms grow uncontrollably — sometimes reaching thousands — and loss becomes NaN or Inf within a few steps. This is caused by poorly chosen initial weights, a learning rate that is orders of magnitude too large, or an accumulation of numerical error in very deep networks without residual connections. Gradient clipping (max_norm=1.0) is the standard defence; combined with weight decay and careful LR warm-up it is almost always sufficient.',
        points: [
            [0, 0.88], [0.1, 0.78], [0.2, 0.68], [0.3, 0.60],
            [0.38, 0.54],
            [0.42, 0.52], [0.46, 0.60], [0.50, 0.80],
            [0.54, 1.05], [0.56, 1.2],  // explosion
            [0.58, 0.98], [0.60, 0.88],
            [0.7, 0.82], [0.8, 0.78], [0.9, 0.75], [1.0, 0.72],
        ],
        highlightRange: [0.40, 0.62],
        annotationX: 0.55,
        annotationY: 1.22,
        annotationLabel: 'Gradient Explosion',
    },
    {
        id: 'Divergence',
        cause: 'Training loss increases monotonically and fails to recover. This is the worst failure mode: the model is actively un-learning. Causes include an incorrect learning rate (typical: up from 3e-4 to 1e-2 without warmup), a mislabelled dataset that rewards wrong predictions, a numerical precision bug in an attention implementation, or a catastrophic collision between a very large LR step and non-convex loss landscape. The run must be cancelled; checkpoint from the last stable loss and debug before resuming.',
        points: [
            [0, 0.88], [0.05, 0.82], [0.10, 0.76], [0.18, 0.70],
            [0.25, 0.68],
            [0.28, 0.72], [0.35, 0.80], [0.45, 0.92],
            [0.55, 1.05], [0.65, 1.18], [0.75, 1.32],
            [0.85, 1.45], [0.95, 1.58], [1.0, 1.65],
        ],
        highlightRange: [0.25, 1.0],
        annotationX: 0.75,
        annotationY: 1.35,
        annotationLabel: 'Diverging',
    },
];

function toAX(nx: number) { return A_PAD.left + nx * A_IW; }
function toAY(ny: number) {
    // ny is normalised loss (0..1.7 range mapped to chart)
    const LOSS_MIN = 0.35;
    const LOSS_MAX_VIS = 1.75;
    const clamped = Math.max(LOSS_MIN, Math.min(LOSS_MAX_VIS, ny));
    return A_PAD.top + A_IH - ((clamped - LOSS_MIN) / (LOSS_MAX_VIS - LOSS_MIN)) * A_IH;
}

function buildPolylinePoints(pts: [number, number][]) {
    return pts.map(([x, y]) => `${toAX(x).toFixed(1)},${toAY(y).toFixed(1)}`).join(' ');
}

function AnomalyChart({ failure }: { failure: FailureData }) {
    const pts = useMemo(() => buildPolylinePoints(failure.points), [failure]);
    const hlStartX = toAX(failure.highlightRange[0]);
    const hlEndX = toAX(failure.highlightRange[1]);

    // Y grid
    const yLabels = [0.4, 0.6, 0.8, 1.0, 1.2, 1.4, 1.6];
    const xLabels = [0, 0.25, 0.5, 0.75, 1.0];

    return (
        <div
            style={{ width: '100%', overflowX: 'auto' }}
            role="img"
            aria-label={`Annotated loss curve showing ${failure.id} pattern`}
        >
            <svg
                viewBox={`0 0 ${A_W} ${A_H}`}
                width="100%"
                style={{ display: 'block', maxHeight: '400px' }}
                preserveAspectRatio="xMidYMid meet"
            >
                {/* Y grid */}
                {yLabels.map((v) => (
                    <g key={v}>
                        <line
                            x1={A_PAD.left} y1={toAY(v)}
                            x2={A_PAD.left + A_IW} y2={toAY(v)}
                            stroke="var(--stroke)" strokeWidth="1" strokeDasharray="3 3"
                        />
                        <text
                            x={A_PAD.left - 5} y={toAY(v) + 4}
                            textAnchor="end"
                            fontFamily="var(--font-mono)" fontSize="9" fill="var(--muted)"
                        >
                            {v.toFixed(1)}
                        </text>
                    </g>
                ))}

                {/* X grid */}
                {xLabels.map((v) => (
                    <g key={v}>
                        <text
                            x={toAX(v)} y={A_PAD.top + A_IH + 14}
                            textAnchor="middle"
                            fontFamily="var(--font-mono)" fontSize="9" fill="var(--muted)"
                        >
                            {v === 0 ? '0' : v === 1 ? '100k' : `${Math.round(v * 100)}k`}
                        </text>
                    </g>
                ))}

                {/* Axis labels */}
                <text
                    x={A_PAD.left + A_IW / 2} y={A_H - 2}
                    textAnchor="middle"
                    fontFamily="var(--font-mono)" fontSize="9" fill="var(--muted)"
                >
                    steps
                </text>

                {/* Highlight region */}
                <rect
                    x={hlStartX}
                    y={A_PAD.top}
                    width={hlEndX - hlStartX}
                    height={A_IH}
                    fill="var(--viz-neg)"
                    fillOpacity="0.10"
                />
                {/* Highlight border */}
                <line
                    x1={hlStartX} y1={A_PAD.top}
                    x2={hlStartX} y2={A_PAD.top + A_IH}
                    stroke="var(--viz-neg)" strokeWidth="1" strokeDasharray="4 2" strokeOpacity="0.6"
                />
                <line
                    x1={hlEndX} y1={A_PAD.top}
                    x2={hlEndX} y2={A_PAD.top + A_IH}
                    stroke="var(--viz-neg)" strokeWidth="1" strokeDasharray="4 2" strokeOpacity="0.6"
                />

                {/* Loss curve */}
                <polyline
                    points={pts}
                    fill="none"
                    stroke="var(--ink)"
                    strokeWidth="2"
                    strokeLinejoin="round"
                />

                {/* Annotation */}
                <circle
                    cx={toAX(failure.annotationX)}
                    cy={toAY(failure.annotationY)}
                    r="4"
                    fill="var(--viz-neg)"
                />
                <line
                    x1={toAX(failure.annotationX)}
                    y1={toAY(failure.annotationY) - 5}
                    x2={toAX(failure.annotationX)}
                    y2={toAY(failure.annotationY) - 20}
                    stroke="var(--viz-neg)"
                    strokeWidth="1"
                />
                <text
                    x={toAX(failure.annotationX)}
                    y={toAY(failure.annotationY) - 24}
                    textAnchor="middle"
                    fontFamily="var(--font-mono)"
                    fontSize="9"
                    fill="var(--viz-neg)"
                    fontWeight="600"
                >
                    {failure.annotationLabel}
                </text>
            </svg>
        </div>
    );
}

function AnomalySection() {
    const [active, setActive] = useState<FailureMode>('Loss Spike');
    const currentFailure = FAILURES.find((f) => f.id === active)!;

    const btnStyle = (isActive: boolean): React.CSSProperties => ({
        fontFamily: 'var(--font-mono)',
        fontSize: 'var(--text-xs)',
        color: isActive ? 'var(--text-inverse)' : 'var(--secondary)',
        background: isActive ? 'var(--bg-inverse)' : 'transparent',
        border: `1px solid ${isActive ? 'var(--ink)' : 'var(--stroke-dark)'}`,
        borderRadius: 'var(--r-sm)',
        padding: 'var(--s2) var(--s3)',
        cursor: 'pointer',
        transition: 'all var(--dur-fast) var(--ease-out)',
        minHeight: '36px',
        whiteSpace: 'nowrap' as const,
    });

    return (
        <section aria-labelledby="eval-anomaly-heading" style={SECTION_STYLE}>
            <h2
                id="eval-anomaly-heading"
                style={{
                    ...LABEL_MONO,
                    margin: '0 0 var(--s4)',
                    fontWeight: 'var(--weight-regular)',
                }}
            >
                Common Training Failures
            </h2>

            <div style={PANEL_STYLE}>
                {/* Failure mode buttons */}
                <div
                    role="group"
                    aria-label="Select failure mode"
                    style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: 'var(--s2)',
                        marginBottom: 'var(--s5)',
                    }}
                >
                    {FAILURES.map((f) => (
                        <button
                            key={f.id}
                            id={`eval-failure-${f.id.toLowerCase().replace(/\s+/g, '-')}`}
                            style={btnStyle(active === f.id)}
                            onClick={() => setActive(f.id)}
                            aria-pressed={active === f.id}
                            onMouseEnter={(e) => {
                                if (active !== f.id) {
                                    e.currentTarget.style.background = 'var(--bg-raised)';
                                    e.currentTarget.style.color = 'var(--ink)';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (active !== f.id) {
                                    e.currentTarget.style.background = 'transparent';
                                    e.currentTarget.style.color = 'var(--secondary)';
                                }
                            }}
                        >
                            {f.id}
                        </button>
                    ))}
                </div>

                {/* Annotated chart */}
                <AnomalyChart failure={currentFailure} />

                {/* Cause explanation */}
                <div
                    style={{
                        borderTop: '1px solid var(--stroke)',
                        paddingTop: 'var(--s4)',
                        marginTop: 'var(--s4)',
                    }}
                >
                    <p
                        style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: 'var(--text-xs)',
                            color: 'var(--muted)',
                            textTransform: 'uppercase',
                            letterSpacing: 'var(--tracking-wider)',
                            margin: '0 0 var(--s2)',
                        }}
                    >
                        Cause &amp; Remedy
                    </p>
                    <p
                        id="eval-failure-cause"
                        style={{
                            fontFamily: 'var(--font-sans)',
                            fontSize: 'var(--text-sm)',
                            color: 'var(--secondary)',
                            lineHeight: 'var(--lead-body)',
                            margin: 0,
                            maxWidth: '72ch',
                        }}
                        aria-live="polite"
                        aria-atomic="true"
                    >
                        {currentFailure.cause}
                    </p>
                </div>
            </div>
        </section>
    );
}

// ─── Root export ──────────────────────────────────────────────────────────────

export function Step05Evaluation({ stepNumber: _stepNumber, totalSteps: _totalSteps, onNext: _onNext, onPrev: _onPrev }: StepProps) {
    // Detect prefers-reduced-motion
    const prefersReducedMotion =
        typeof window !== 'undefined'
            ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
            : false;

    return (
        <ErrorBoundary>
            <article
                aria-label="Step 05: Evaluation During Training"
                style={{ flex: 1, display: 'flex', flexDirection: 'column' }}
            >
                <OverviewSection />
                <DashboardSection prefersReducedMotion={prefersReducedMotion} />
                <AnomalySection />
            </article>
        </ErrorBoundary>
    );
}
