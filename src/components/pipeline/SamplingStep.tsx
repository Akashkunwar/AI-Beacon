// src/components/pipeline/SamplingStep.tsx
import { motion } from 'framer-motion';
import { useSimulatorStore } from '@/lib/store/simulatorStore';
import { GlassCard } from '@/components/shared';
import { ConceptCard } from '@/components/educational/ConceptCard';

export function SamplingStep() {
    const { tensors, samplingMethod } = useSimulatorStore();

    const { selected_id, selected_token } = tensors.sampling || {};

    // Safety check
    if (selected_id === undefined || !selected_token) return null;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <ConceptCard stepId={11} defaultExpanded={true} />

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'minmax(0, 1fr)',
                gap: '24px',
            }}>
                <GlassCard padding="lg">
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minHeight: '280px',
                        gap: '32px'
                    }}>

                        {/* Sampling Method Badge */}
                        <div style={{
                            padding: '6px 16px',
                            background: 'var(--bg-panel)',
                            border: '1px solid var(--stroke-dark)',
                            borderRadius: '20px',
                            fontSize: '13px',
                            color: 'var(--secondary)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}>
                            <span style={{
                                display: 'inline-block',
                                width: '8px',
                                height: '8px',
                                borderRadius: '50%',
                                background: 'var(--viz-sampling-dot)',
                                boxShadow: '0 0 8px var(--viz-sampling-dot)'
                            }} />
                            Method: <span style={{ color: 'var(--viz-1)', fontWeight: 600 }}>{samplingMethod.charAt(0).toUpperCase() + samplingMethod.slice(1)}</span>
                        </div>

                        {/* Animated Down Arrow */}
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, ease: "easeOut", type: 'spring', damping: 15 }}
                            style={{
                                color: 'var(--muted)',
                                fontSize: '24px'
                            }}
                        >
                            ↓
                        </motion.div>

                        {/* Selected Token Display */}
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '16px'
                        }}>
                            <div style={{ fontSize: '15px', color: 'var(--secondary)' }}>
                                The model predicts the next word is:
                            </div>

                            <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{
                                    type: "spring",
                                    stiffness: 300,
                                    damping: 20,
                                    delay: 0.2
                                }}
                                style={{
                                    padding: '16px 32px',
                                    background: 'var(--viz-sampling-chip)',
                                    border: '2px solid var(--viz-sampling-chip-border)',
                                    borderRadius: '12px',
                                    color: 'var(--text-inverse)',
                                    fontSize: '32px',
                                    fontWeight: 700,
                                    fontFamily: 'var(--font-mono)',
                                }}
                            >
                                "{selected_token}"
                            </motion.div>

                            <div style={{
                                fontSize: '12px',
                                color: 'var(--muted)',
                                fontFamily: 'var(--font-mono)',
                                marginTop: '8px'
                            }}>
                                Token ID: {selected_id}
                            </div>
                        </div>

                    </div>
                </GlassCard>
            </div>
        </div>
    );
}
