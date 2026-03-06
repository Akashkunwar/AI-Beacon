import { memo } from 'react';
import { motion } from 'framer-motion';
import { GlassCard } from '@/components/shared';
import { ConceptCard } from '@/components/educational/ConceptCard';
import { PipelineStep } from '@/lib/store/types';
import { useSimulatorStore } from '@/lib/store/simulatorStore';

export const ResidualStep = memo(function ResidualStep() {
    const tensors = useSimulatorStore((state) => state.tensors);
    const X_pos = tensors.posenc?.X_pos;
    const attn_out = tensors.attention?.multihead_out;
    const X_res = tensors.residual?.X_res;

    // We need tensors to proceed (handled by ErrorBoundary higher up if missing, but we guard here too)
    if (!X_pos || !attn_out || !X_res) return null;

    const n = X_res.shape[0];
    const dModel = X_res.shape[1];

    // Take just the first 3 tokens to visualize clearly
    const displayTokens = Math.min(n, 3);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' }}>
            {/* Header / Education */}
            <ConceptCard stepId={PipelineStep.RESIDUAL} defaultExpanded />

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'minmax(0, 1fr) auto minmax(0, 1fr)',
                gap: '16px',
                alignItems: 'center'
            }}>
                {/* Left side: Parallel tracks for X_pos and attn_out */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    {/* Track 1: Original Input (X_pos) */}
                    <GlassCard padding="md">
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                            <span style={{ fontSize: '13px', color: 'var(--secondary)', fontWeight: 600 }}>Original Input</span>
                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--ink)' }}>X_pos ({n}, {dModel})</span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {Array.from({ length: displayTokens }).map((_, i) => (
                                <VectorBarPreview key={i} values={Array.from(X_pos.row(i).data.slice(0, Math.min(dModel, 8)))} />
                            ))}
                        </div>
                    </GlassCard>

                    {/* Track 2: Attention Output */}
                    <GlassCard padding="md">
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                            <span style={{ fontSize: '13px', color: 'var(--secondary)', fontWeight: 600 }}>Attention Output</span>
                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--ink)' }}>attn_out ({n}, {dModel})</span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {Array.from({ length: displayTokens }).map((_, i) => (
                                <VectorBarPreview key={i} values={Array.from(attn_out.row(i).data.slice(0, Math.min(dModel, 8)))} />
                            ))}
                        </div>
                    </GlassCard>
                </div>

                {/* Center: The Addition operation */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                        style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '50%',
                            background: 'var(--bg-raised)',
                            border: '2px solid var(--stroke-dark)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '24px',
                            color: 'var(--ink)',
                            boxShadow: '0 0 16px var(--bg-raised)',
                            zIndex: 2
                        }}
                    >
                        +
                    </motion.div>
                </div>

                {/* Right side: Residual Output */}
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <GlassCard padding="md" style={{ width: '100%', borderColor: 'var(--stroke-dark)', boxShadow: 'var(--shadow-lift)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                            <span style={{ fontSize: '13px', color: 'var(--ink)', fontWeight: 600 }}>Residual Output</span>
                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--ink)' }}>X_res ({n}, {dModel})</span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {Array.from({ length: displayTokens }).map((_, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.3 + i * 0.1 }}
                                >
                                    <VectorBarPreview values={Array.from(X_res.row(i).data.slice(0, Math.min(dModel, 8)))} highlighted />
                                </motion.div>
                            ))}
                        </div>
                    </GlassCard>
                </div>
            </div>

            {n > displayTokens && (
                <div style={{ textAlign: 'center', color: 'var(--muted)', fontSize: '12px', fontStyle: 'italic' }}>
                    Showing first {displayTokens} of {n} tokens.
                </div>
            )}
        </div>
    );
});

// A simplified inline vector bar for dense views
function VectorBarPreview({ values, highlighted }: { values: number[], highlighted?: boolean }) {
    const maxVal = Math.max(...values.map(Math.abs), 0.1);

    return (
        <div style={{ display: 'flex', gap: '4px', height: '16px', width: '100%' }}>
            {values.map((v, idx) => {
                const norm = Math.max(-1, Math.min(1, v / maxVal));
                // Positive = slate blue, negative = muted rose — alpha encodes magnitude
                const alpha = highlighted
                    ? 0.25 + Math.abs(norm) * 0.75
                    : 0.12 + Math.abs(norm) * 0.70;
                const color = norm >= 0
                    ? `rgba(107,127,173,${alpha.toFixed(2)})`   /* --viz-1 slate blue */
                    : `rgba(192,122,122,${alpha.toFixed(2)})`;  /* --viz-neg muted rose */

                return (
                    <div
                        key={idx}
                        style={{
                            flex: 1,
                            backgroundColor: color,
                            borderRadius: '2px',
                        }}
                    />
                );
            })}
        </div>
    );
}
