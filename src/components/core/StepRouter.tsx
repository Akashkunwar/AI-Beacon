// src/components/core/StepRouter.tsx
// Renders the active pipeline step. Each step is lazy-loaded and wrapped in an
// ErrorBoundary so a rendering error shows a recovery UI instead of a blank page.

import { lazy, Suspense, type ComponentType } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PipelineStep } from '@/lib/store/types';
import { ErrorBoundary } from '@/components/shared/ErrorBoundary';
import { useSimulatorStore } from '@/lib/store/simulatorStore';
import { useReducedMotion } from '@/hooks/useReducedMotion';

const load = <K extends string>(factory: () => Promise<Record<K, ComponentType>>, name: K) =>
    lazy(() => factory().then((m) => ({ default: m[name] })));

const STEPS: Record<PipelineStep, ComponentType> = {
    [PipelineStep.INPUT]: load(() => import('@/components/pipeline/RawInputStep'), 'RawInputStep'),
    [PipelineStep.TOKENIZE]: load(() => import('@/components/pipeline/TokenizationStep'), 'TokenizationStep'),
    [PipelineStep.TOKEN_IDS]: load(() => import('@/components/pipeline/TokenIDStep'), 'TokenIDStep'),
    [PipelineStep.EMBEDDING]: load(() => import('@/components/pipeline/EmbeddingStep'), 'EmbeddingStep'),
    [PipelineStep.POSITIONAL_ENCODING]: load(() => import('@/components/pipeline/PositionalEncodingStep'), 'PositionalEncodingStep'),
    [PipelineStep.ATTENTION]: load(() => import('@/components/pipeline/AttentionStep'), 'AttentionStep'),
    [PipelineStep.RESIDUAL]: load(() => import('@/components/pipeline/ResidualStep'), 'ResidualStep'),
    [PipelineStep.LAYER_NORM]: load(() => import('@/components/pipeline/LayerNormStep'), 'LayerNormStep'),
    [PipelineStep.FFN]: load(() => import('@/components/pipeline/FFNStep'), 'FFNStep'),
    [PipelineStep.LM_HEAD]: load(() => import('@/components/pipeline/LMHeadStep'), 'LMHeadStep'),
    [PipelineStep.SOFTMAX]: load(() => import('@/components/pipeline/SoftmaxStep'), 'SoftmaxStep'),
    [PipelineStep.SAMPLING]: load(() => import('@/components/pipeline/SamplingStep'), 'SamplingStep'),
};

export function StepRouter({ step }: { step: PipelineStep }) {
    const stepBackward = useSimulatorStore((s) => s.stepBackward);
    const reduced = useReducedMotion();
    const Step = STEPS[step];

    return (
        <AnimatePresence mode="wait" initial={false}>
            <motion.div
                key={step}
                initial={{ opacity: 0, y: reduced ? 0 : 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: reduced ? 0 : 0.18, ease: 'easeOut' }}
            >
                <ErrorBoundary resetLabel="Go back one step" onReset={stepBackward}>
                    <Suspense fallback={<StepSkeleton />}>
                        <Step />
                    </Suspense>
                </ErrorBoundary>
            </motion.div>
        </AnimatePresence>
    );
}

function StepSkeleton() {
    return (
        <div aria-label="Loading step" style={{ maxWidth: 880, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'var(--s4)' }}>
            <div style={{ display: 'flex', gap: 'var(--s4)', alignItems: 'center' }}>
                <div className="skeleton" style={{ width: 44, height: 44, borderRadius: 'var(--r-md)' }} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
                    <div className="skeleton" style={{ width: '30%', height: 12 }} />
                    <div className="skeleton" style={{ width: '50%', height: 22 }} />
                </div>
            </div>
            <div className="skeleton" style={{ height: 220, borderRadius: 'var(--r-lg)' }} />
        </div>
    );
}
