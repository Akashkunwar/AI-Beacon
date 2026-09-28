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
            return null;
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s5)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--s3)' }}>
                    <div className="skeleton" style={{ width: 36, height: 36, borderRadius: 'var(--r-md)' }} />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        <div className="skeleton" style={{ width: 140, height: 16 }} />
                        <div className="skeleton" style={{ width: 220, height: 12 }} />
                    </div>
                </div>
                <div className="skeleton" style={{ height: 160, borderRadius: 'var(--r-md)' }} />
            </div>
        </GlassCard>
    );
}
