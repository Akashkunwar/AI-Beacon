import { memo } from 'react';
import { motion } from 'framer-motion';
import { GlassCard } from '@/components/shared';
import { ConceptCard } from '@/components/educational/ConceptCard';
import { VectorBar } from '@/components/visualizers/VectorBar';
import { PipelineStep } from '@/lib/store/types';
import { useSimulatorStore } from '@/lib/store/simulatorStore';

export const FFNStep = memo(function FFNStep() {
    const tensors = useSimulatorStore((state) => state.tensors);
    const X_norm = tensors.layernorm?.X_norm;
    const { hidden, output: ffnOutput } = tensors.ffn || {};

    if (!X_norm || !hidden || !ffnOutput) return null;

    const n = X_norm.shape[0];
    const dModel = X_norm.shape[1];
    const dFF = hidden.shape[1];

    // For visualization we just show the first token row
    const rowIdx = 0;
    const inputValues = Array.from(X_norm.row(rowIdx).data.slice(0, Math.min(dModel, 8)));

    // We sample a subset of the hidden layer (since it is 4x wider)
    const displayHiddenDims = Math.min(dFF, 32);
    const hiddenValues = Array.from(hidden.row(rowIdx).data.slice(0, displayHiddenDims));

    const outputValues = Array.from(ffnOutput.row(rowIdx).data.slice(0, Math.min(dModel, 8)));

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' }}>
            {/* Header / Education */}
            <ConceptCard stepId={PipelineStep.FFN} defaultExpanded />

            <GlassCard padding="lg" style={{ display: 'flex', flexDirection: 'column', gap: '32px', alignItems: 'center' }}>
                <p style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '12px',
                    color: 'var(--secondary)',
                    textAlign: 'center',
                    fontStyle: 'italic',
                }}>
                    Displaying Flow for Token 0 (Row 0)
                </p>

                {/* Layer 1: Input */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center', width: '100%', maxWidth: '300px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                        <span style={{ fontSize: '13px', color: 'var(--ink)' }}>1. Input (X_norm)</span>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--ink)' }}>({n}, {dModel})</span>
                    </div>
                    <VectorBar values={inputValues} maxAbs={2} barHeight={6} />
                </div>

                {/* Funnel Down Arrow */}
                <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 24, opacity: 1 }}
                    style={{ width: '2px', height: '24px', background: 'var(--stroke-dark)', margin: '0 auto' }}
                />

                {/* Layer 2: Hidden (Expanded) */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center', width: '100%', maxWidth: '600px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                        <span style={{ fontSize: '13px', color: 'var(--ink)' }}>2. Hidden State (GELU Activation)</span>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--muted)' }}>({n}, {dFF})</span>
                    </div>
                    <div style={{
                        padding: '16px',
                        background: 'var(--bg-panel)',
                        border: '1px solid var(--stroke)',
                        borderRadius: '8px',
                        width: '100%',
                    }}>
                        <VectorBar values={hiddenValues} maxAbs={3} barHeight={10} />
                        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '12px' }}>
                            <span style={{ fontSize: '10px', color: 'var(--muted)' }}>4× wider than input</span>
                        </div>
                    </div>
                </div>

                {/* Funnel Up Arrow */}
                <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 24, opacity: 1 }}
                    style={{ width: '2px', height: '24px', background: 'var(--stroke-dark)', margin: '0 auto' }}
                />

                {/* Layer 3: Output (Compressed) */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center', width: '100%', maxWidth: '300px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                        <span style={{ fontSize: '13px', color: 'var(--ink)' }}>3. Output (FFN_out)</span>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--ink)' }}>({n}, {dModel})</span>
                    </div>
                    <VectorBar values={outputValues} maxAbs={2} barHeight={6} />
                </div>
            </GlassCard>
        </div>
    );
});
