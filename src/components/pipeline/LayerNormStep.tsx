import { memo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard } from '@/components/shared';
import { ConceptCard } from '@/components/educational/ConceptCard';
import { VectorBar } from '@/components/visualizers/VectorBar';
import { PipelineStep } from '@/lib/store/types';
import { useSimulatorStore } from '@/lib/store/simulatorStore';

export const LayerNormStep = memo(function LayerNormStep() {
    const tensors = useSimulatorStore((state) => state.tensors);
    const X_res = tensors.residual?.X_res;
    const { X_norm, gamma, beta } = tensors.layernorm || {};
    const tokens = tensors.tokens?.raw;

    const [selectedRow, setSelectedRow] = useState(0);

    // Guard (ErrorBoundary catches if missing)
    if (!X_res || !X_norm || !gamma || !beta || !tokens) return null;

    // Get statistics for the selected row
    const resRowStats = X_res.row(selectedRow).stats();
    const normRowStats = X_norm.row(selectedRow).stats();

    // Data arrays
    const resValues = Array.from(X_res.row(selectedRow).data);
    const normValues = Array.from(X_norm.row(selectedRow).data);
    const gammaValues = Array.from(gamma.data);
    const betaValues = Array.from(beta.data);

    // Shared max bounds for vector bars so they are visually comparable
    const maxResAbs = Math.max(Math.abs(resRowStats.max), Math.abs(resRowStats.min), 1);
    const maxNormAbs = Math.max(Math.abs(normRowStats.max), Math.abs(normRowStats.min), 1);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' }}>
            {/* Header / Education */}
            <ConceptCard stepId={PipelineStep.LAYER_NORM} defaultExpanded />

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '24px' }}>
                {/* Left Column: Token Selection & Input Stats */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {tokens.map((token, i) => (
                            <button
                                key={i}
                                onClick={() => setSelectedRow(i)}
                                style={{
                                    padding: '6px 12px',
                                    borderRadius: '8px',
                                    background: selectedRow === i ? 'var(--bg-raised)' : 'var(--bg-panel)',
                                    border: `1px solid ${selectedRow === i ? 'var(--ink)' : 'var(--stroke)'}`,
                                    color: selectedRow === i ? 'var(--ink)' : 'var(--secondary)',
                                    cursor: 'pointer',
                                    fontFamily: 'var(--font-mono)',
                                    fontSize: '12px',
                                    transition: 'all 0.2s',
                                }}
                            >
                                <span style={{ opacity: 0.6, marginRight: '6px' }}>{i}</span>
                                {token}
                            </button>
                        ))}
                    </div>

                    <GlassCard padding="lg">
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                            <span style={{ fontSize: '14px', color: 'var(--ink)', fontWeight: 600 }}>1. Before: Pre-Norm (X_res)</span>
                            <StatBadge mean={resRowStats.mean} std={resRowStats.std} />
                        </div>
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={`res-${selectedRow}`}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.2 }}
                            >
                                <VectorBar values={resValues} maxAbs={maxResAbs} showIndices label={`Row ${selectedRow}`} />
                            </motion.div>
                        </AnimatePresence>
                    </GlassCard>
                </div>

                {/* Right Column: Normalization Params & Output Stats */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

                    <div style={{ display: 'flex', gap: '12px', height: 'fit-content' }}>
                        <GlassCard padding="md" style={{ flex: 1 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <span style={{ fontSize: '13px', color: 'var(--secondary)', fontWeight: 600 }}>Scale (γ)</span>
                            </div>
                            <VectorBar values={gammaValues} maxAbs={2} barHeight={4} />
                        </GlassCard>
                        <GlassCard padding="md" style={{ flex: 1 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <span style={{ fontSize: '13px', color: 'var(--secondary)', fontWeight: 600 }}>Shift (β)</span>
                            </div>
                            <VectorBar values={betaValues} maxAbs={1} barHeight={4} />
                        </GlassCard>
                    </div>

                    <GlassCard padding="lg" style={{ borderColor: 'var(--stroke-dark)', boxShadow: '0 0 20px var(--bg-raised)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                            <span style={{ fontSize: '14px', color: 'var(--ink)', fontWeight: 600 }}>2. After: Post-Norm (X_norm)</span>
                            <StatBadge mean={normRowStats.mean} std={normRowStats.std} highlight />
                        </div>
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={`norm-${selectedRow}`}
                                initial={{ opacity: 0, scaleY: 0.95 }}
                                animate={{ opacity: 1, scaleY: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.2 }}
                            >
                                <VectorBar values={normValues} maxAbs={maxNormAbs} showIndices label={`Row ${selectedRow} (Normalized)`} animateDelay={0.1} />
                            </motion.div>
                        </AnimatePresence>
                    </GlassCard>
                </div>
            </div>
        </div>
    );
});

// A small badge to display mean and standard deviation
function StatBadge({ mean, std, highlight = false }: { mean: number, std: number, highlight?: boolean }) {
    return (
        <div style={{
            display: 'flex',
            gap: '12px',
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            background: highlight ? 'var(--bg-raised)' : 'var(--bg-panel)',
            border: `1px solid ${highlight ? 'var(--stroke-dark)' : 'var(--stroke)'}`,
            padding: '4px 10px',
            borderRadius: '6px'
        }}>
            <span style={{ color: highlight ? 'var(--ink)' : 'var(--secondary)' }}>
                μ: <span style={{ color: Math.abs(mean) < 0.1 ? 'var(--ink)' : 'inherit' }}>{mean.toFixed(3)}</span>
            </span>
            <span style={{ color: highlight ? 'var(--ink)' : 'var(--secondary)' }}>
                σ: <span style={{ color: Math.abs(std - 1) < 0.1 ? 'var(--ink)' : 'inherit' }}>{std.toFixed(3)}</span>
            </span>
        </div>
    );
}
