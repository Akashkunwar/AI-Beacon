// src/components/pipeline/SoftmaxStep.tsx
import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useSimulatorStore } from '@/lib/store/simulatorStore';
import { GlassCard, Badge, NumberDisplay } from '@/components/shared';
import { ConceptCard } from '@/components/educational/ConceptCard';
import { idToToken, VOCAB_SIZE } from '@/lib/tokenizer/vocab';
import { topK } from '@/lib/mathEngine/sampling';

export function SoftmaxStep() {
    const { tensors, temperature, setTemperature } = useSimulatorStore();

    const { probs } = tensors.softmax || {};

    const topProbs = useMemo(() => {
        if (!probs) return [];
        return topK(probs, 5);
    }, [probs]);

    if (!probs) return null;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <ConceptCard stepId={10} defaultExpanded={true} />

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'minmax(0, 1fr)',
                gap: '24px',
            }}>
                <GlassCard padding="lg">
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '24px',
                        flexWrap: 'wrap',
                        gap: '16px'
                    }}>
                        <h3 style={{
                            fontSize: '15px',
                            fontWeight: 600,
                            color: 'var(--ink)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px'
                        }}>
                            Softmax Probabilities
                            <Badge variant="success">Σ = 1.000</Badge>
                        </h3>

                        {/* Temperature Control */}
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            background: 'var(--bg-panel)',
                            padding: '8px 16px',
                            borderRadius: 'var(--r-md)',
                            border: '1px solid var(--stroke)'
                        }}>
                            <label style={{ fontSize: '13px', color: 'var(--secondary)', fontWeight: 500 }}>
                                Temperature:
                            </label>
                            <input
                                type="range"
                                min="0.1"
                                max="2.0"
                                step="0.1"
                                value={temperature}
                                onChange={(e) => setTemperature(parseFloat(e.target.value))}
                                style={{ width: '100px', cursor: 'pointer' }}
                            />
                            <span style={{
                                fontSize: '13px',
                                fontFamily: 'var(--font-mono)',
                                color: 'var(--ink)',
                                width: '32px',
                                textAlign: 'right'
                            }}>
                                {temperature.toFixed(1)}
                            </span>
                        </div>
                    </div>

                    {/* Top 5 Probabilities Horizontal Bars */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {topProbs.map((item, index) => {
                            const isTop1 = index === 0;
                            const percent = item.prob * 100;
                            const tokenStr = idToToken(item.id);
                            const displayStr = tokenStr.trim() === '' ? '␣' : tokenStr;

                            return (
                                <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                    {/* Token Label */}
                                    <div style={{
                                        width: '80px',
                                        fontSize: '14px',
                                        fontFamily: 'var(--font-mono)',
                                        color: isTop1 ? 'var(--ink)' : 'var(--secondary)',
                                        textAlign: 'right',
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis'
                                    }} title={tokenStr}>
                                        "{displayStr}"
                                    </div>

                                    {/* Progress Bar Track */}
                                    <div style={{
                                        flex: 1,
                                        height: '24px',
                                        background: 'var(--bg-raised)',
                                        borderRadius: 'var(--r-sm)',
                                        overflow: 'hidden',
                                        position: 'relative'
                                    }}>
                                        {/* Animated Fill */}
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${Math.max(0.5, percent)}%` }}
                                            transition={{ type: 'spring', damping: 20, stiffness: 100 }}
                                            style={{
                                                height: '100%',
                                                background: isTop1 ? 'var(--viz-1)' : 'rgba(107,127,173,0.38)',
                                                borderRadius: 'var(--r-sm)'
                                            }}
                                        />
                                    </div>

                                    {/* Percentage Display */}
                                    <div style={{
                                        width: '64px',
                                        fontSize: '14px',
                                        fontFamily: 'var(--font-mono)',
                                        color: isTop1 ? 'var(--ink)' : 'var(--muted)',
                                        textAlign: 'right'
                                    }}>
                                        <NumberDisplay value={item.prob} format="percent" precision={1} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div style={{
                        marginTop: '24px',
                        paddingTop: '16px',
                        borderTop: '1px solid var(--stroke)',
                        fontSize: '12px',
                        color: 'var(--muted)',
                        textAlign: 'center'
                    }}>
                        ... {VOCAB_SIZE - 5} other tokens sharing the remaining <NumberDisplay value={1 - topProbs.reduce((acc, curr) => acc + curr.prob, 0)} format="percent" precision={2} />
                    </div>
                </GlassCard>
            </div>
        </div>
    );
}
