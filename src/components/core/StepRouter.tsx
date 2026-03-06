// src/components/core/StepRouter.tsx
// Renders the currently active pipeline step component.
// Each step is wrapped in an ErrorBoundary so math/render errors
// don't crash the whole app — they show a friendly recovery UI instead.

import { lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PipelineStep, PIPELINE_STEP_LABELS } from '@/lib/store/types';
import { GlassCard } from '@/components/shared';
import { ErrorBoundary } from '@/components/shared/ErrorBoundary';
import { useSimulatorStore } from '@/lib/store/simulatorStore';
import { useReducedMotion } from '@/hooks/useReducedMotion';

// ─── Lazy-loaded step components ──────────────────────────────────────────
// Each pipeline step chunk is loaded only when first visited.

const RawInputStep = lazy(() =>
    import('@/components/pipeline/RawInputStep').then((m) => ({ default: m.RawInputStep }))
);
const TokenizationStep = lazy(() =>
    import('@/components/pipeline/TokenizationStep').then((m) => ({ default: m.TokenizationStep }))
);
const TokenIDStep = lazy(() =>
    import('@/components/pipeline/TokenIDStep').then((m) => ({ default: m.TokenIDStep }))
);
const EmbeddingStep = lazy(() =>
    import('@/components/pipeline/EmbeddingStep').then((m) => ({ default: m.EmbeddingStep }))
);
const PositionalEncodingStep = lazy(() =>
    import('@/components/pipeline/PositionalEncodingStep').then((m) => ({ default: m.PositionalEncodingStep }))
);
const AttentionStep = lazy(() =>
    import('@/components/pipeline/AttentionStep').then((m) => ({ default: m.AttentionStep }))
);
const ResidualStep = lazy(() =>
    import('@/components/pipeline/ResidualStep').then((m) => ({ default: m.ResidualStep }))
);
const LayerNormStep = lazy(() =>
    import('@/components/pipeline/LayerNormStep').then((m) => ({ default: m.LayerNormStep }))
);
const FFNStep = lazy(() =>
    import('@/components/pipeline/FFNStep').then((m) => ({ default: m.FFNStep }))
);
const LMHeadStep = lazy(() =>
    import('@/components/pipeline/LMHeadStep').then((m) => ({ default: m.LMHeadStep }))
);
const SoftmaxStep = lazy(() =>
    import('@/components/pipeline/SoftmaxStep').then((m) => ({ default: m.SoftmaxStep }))
);
const SamplingStep = lazy(() =>
    import('@/components/pipeline/SamplingStep').then((m) => ({ default: m.SamplingStep }))
);

// ─── Step component map ───────────────────────────────────────────────────

function getStepComponent(step: PipelineStep): React.ReactNode {
    switch (step) {
        case PipelineStep.INPUT:
            return <RawInputStep />;
        case PipelineStep.TOKENIZE:
            return <TokenizationStep />;
        case PipelineStep.TOKEN_IDS:
            return <TokenIDStep />;
        case PipelineStep.EMBEDDING:
            return <EmbeddingStep />;
        case PipelineStep.POSITIONAL_ENCODING:
            return <PositionalEncodingStep />;
        case PipelineStep.ATTENTION:
            return <AttentionStep />;
        case PipelineStep.RESIDUAL:
            return <ResidualStep />;
        case PipelineStep.LAYER_NORM:
            return <LayerNormStep />;
        case PipelineStep.FFN:
            return <FFNStep />;
        case PipelineStep.LM_HEAD:
            return <LMHeadStep />;
        case PipelineStep.SOFTMAX:
            return <SoftmaxStep />;
        case PipelineStep.SAMPLING:
            return <SamplingStep />;
        default:
            return <StepPlaceholder step={step} />;
    }
}

// ─── StepRouter Props ─────────────────────────────────────────────────────

interface StepRouterProps {
    step: PipelineStep;
}

// ─── StepRouter ───────────────────────────────────────────────────────────

export function StepRouter({ step }: StepRouterProps) {
    const { stepBackward } = useSimulatorStore();
    const reduced = useReducedMotion();

    // When reduced motion is on, transitions are instant (0.01s)
    const transitionDuration = reduced ? 0.01 : 0.35;

    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={step}
                initial={{ opacity: 0, y: reduced ? 0 : 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: reduced ? 0 : -20 }}
                transition={{ duration: transitionDuration, ease: 'easeOut' }}
                style={{ width: '100%' }}
                aria-live="polite"
                aria-label={`Active pipeline step: ${PIPELINE_STEP_LABELS[step]?.label ?? String(step)}`}
            >
                <ErrorBoundary
                    resetLabel="Reset to previous step"
                    onReset={stepBackward}
                >
                    <Suspense fallback={<StepLoadingSkeleton />}>
                        {getStepComponent(step)}
                    </Suspense>
                </ErrorBoundary>
            </motion.div>
        </AnimatePresence>
    );
}

// ─── StepLoadingSkeleton ──────────────────────────────────────────────────
// Shown while a lazy step component is loading.

function StepLoadingSkeleton() {
    return (
        <GlassCard padding="lg" aria-label="Loading step visualization">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Skeleton header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '9px',
                        background: 'rgba(0,229,255,0.06)',
                        animation: 'pulse 1.5s ease-in-out infinite',
                    }} />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <div style={{ width: '140px', height: '16px', borderRadius: '4px', background: 'rgba(0,229,255,0.06)', animation: 'pulse 1.5s ease-in-out infinite' }} />
                        <div style={{ width: '200px', height: '12px', borderRadius: '4px', background: 'rgba(0,229,255,0.04)', animation: 'pulse 1.5s ease-in-out infinite' }} />
                    </div>
                </div>
                {/* Skeleton content */}
                <div style={{
                    height: '160px',
                    borderRadius: '10px',
                    background: 'rgba(0,229,255,0.03)',
                    border: '1px dashed rgba(0,229,255,0.08)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                }}>
                    {[0, 1, 2].map((i) => (
                        <motion.div
                            key={i}
                            animate={{ opacity: [0.2, 1, 0.2] }}
                            transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.18 }}
                            style={{
                                width: '7px',
                                height: '7px',
                                borderRadius: '50%',
                                background: 'var(--color-primary)',
                                boxShadow: '0 0 5px rgba(0,229,255,0.4)',
                            }}
                        />
                    ))}
                </div>
            </div>
        </GlassCard>
    );
}

// ─── StepPlaceholder ──────────────────────────────────────────────────────
// "Coming soon" card for any unimplemented pipeline steps.

function StepPlaceholder({ step }: { step: PipelineStep }) {
    const meta = PIPELINE_STEP_LABELS[step];

    const buildStep =
        step <= PipelineStep.TOKEN_IDS ? 6 :
            step <= PipelineStep.POSITIONAL_ENCODING ? 7 :
                step === PipelineStep.ATTENTION ? 8 :
                    step <= PipelineStep.FFN ? 9 : 10;

    return (
        <GlassCard padding="lg" aria-label={`${meta.label} step — coming soon`}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '9px',
                        background: 'rgba(0,229,255,0.08)',
                        border: '1px solid rgba(0,229,255,0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '13px',
                        color: 'var(--color-primary)',
                        fontWeight: 700,
                        flexShrink: 0,
                    }}>
                        {String(step + 1).padStart(2, '0')}
                    </div>
                    <div>
                        <h2 style={{
                            fontSize: '18px',
                            fontWeight: 600,
                            color: 'var(--color-text-primary)',
                            marginBottom: '2px',
                        }}>
                            {meta.label}
                        </h2>
                        <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
                            {meta.description}
                        </p>
                    </div>
                </div>

                {/* Placeholder visualization area */}
                <div style={{
                    minHeight: '160px',
                    borderRadius: '10px',
                    background: 'rgba(0,229,255,0.02)',
                    border: '1px dashed rgba(0,229,255,0.1)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    padding: '32px',
                }}>
                    {[0, 1, 2].map((i) => (
                        <motion.div
                            key={i}
                            animate={{ opacity: [0.2, 1, 0.2], scale: [0.8, 1.1, 0.8] }}
                            transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.2 }}
                            style={{
                                width: '7px',
                                height: '7px',
                                borderRadius: '50%',
                                background: 'var(--color-primary)',
                                boxShadow: '0 0 5px rgba(0,229,255,0.4)',
                                display: 'inline-block',
                                marginTop: i === 0 ? 0 : -16,
                            }}
                        />
                    ))}
                    <p style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '12px',
                        color: 'var(--color-text-muted)',
                        textAlign: 'center',
                        marginTop: '8px',
                    }}>
                        Visualization implemented in build step {buildStep}
                    </p>
                </div>

                {/* Step description hint */}
                <div style={{
                    padding: '10px 14px',
                    background: 'rgba(0,184,169,0.04)',
                    border: '1px solid rgba(0,184,169,0.12)',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: 'var(--color-text-secondary)',
                    lineHeight: 1.6,
                }}>
                    <span style={{ color: 'var(--color-secondary)', fontWeight: 600 }}>
                        Step {step + 1}:{' '}
                    </span>
                    {meta.description}
                </div>
            </div>
        </GlassCard>
    );
}
