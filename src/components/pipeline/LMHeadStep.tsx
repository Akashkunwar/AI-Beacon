// src/components/pipeline/LMHeadStep.tsx
import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useSimulatorStore } from '@/lib/store/simulatorStore';
import { GlassCard } from '@/components/shared';
import { ConceptCard } from '@/components/educational/ConceptCard';
import { ShapeLabel } from '@/components/visualizers/ShapeLabel';
import { idToToken, VOCAB_SIZE } from '@/lib/tokenizer/vocab';
import { topK } from '@/lib/mathEngine/sampling';

export function LMHeadStep() {
    const { tensors, mode } = useSimulatorStore();
    const isAdvanced = mode === 'advanced';

    // We only got here if earlier steps succeeded, but we should be safe
    const { logits, W_lm } = tensors.lm_head || {};
    const { output: ffnOut } = tensors.ffn || {};
    const rawTokens = tensors.tokens?.raw || [];

    // Get top 20 logits for the bar chart
    const topLogits = useMemo(() => {
        if (!logits) return [];
        return topK(logits, 20);
    }, [logits]);

    if (!logits || !ffnOut || !W_lm) return null;

    const dModel = ffnOut.shape[1];

    // We only care about the last token for next-word prediction
    const lastTokenStr = rawTokens[rawTokens.length - 1] ?? '';

    // Calculate chart scaling
    const maxLogit = Math.max(...topLogits.map(t => Math.abs(t.prob)));
    const yAxisRange = Math.max(10, Math.ceil(maxLogit * 1.2));

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <ConceptCard stepId={10} defaultExpanded={true} />

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'minmax(0, 1fr)',
                gap: '24px',
            }}>
                {/* Top Section: Projection mapping */}
                <GlassCard padding="lg">
                    <h3 style={{
                        fontSize: '15px',
                        fontWeight: 600,
                        color: 'var(--ink)',
                        marginBottom: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                    }}>
                        Last Token Projection
                        {isAdvanced && <ShapeLabel shape={[1, VOCAB_SIZE]} dtype="float32" />}
                    </h3>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                        {/* Last Token Visualizer */}
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '8px'
                        }}>
                            <div style={{
                                padding: '4px 10px',
                                background: 'var(--bg-raised)',
                                border: '1px solid var(--stroke-dark)',
                                borderRadius: '6px',
                                color: 'var(--ink)',
                                fontSize: '13px',
                                fontFamily: 'var(--font-mono)'
                            }}>
                                "{lastTokenStr}"
                            </div>
                            <span style={{ fontSize: '12px', color: 'var(--secondary)' }}>
                                Hidden state
                            </span>
                            {isAdvanced && <ShapeLabel shape={[1, dModel]} dtype="float32" />}
                        </div>

                        {/* Projection multiplier */}
                        <div style={{ fontSize: '24px', color: 'var(--muted)', margin: '0 8px' }}>×</div>

                        {/* W_lm Visualizer */}
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '8px'
                        }}>
                            <div style={{
                                padding: '8px 16px',
                                background: 'var(--bg-raised)',
                                border: '1px solid var(--stroke-dark)',
                                borderRadius: '6px',
                                color: 'var(--ink)',
                                fontSize: '14px',
                                fontWeight: 600,
                                fontFamily: 'var(--font-mono)'
                            }}>
                                W_lm
                            </div>
                            <span style={{ fontSize: '12px', color: 'var(--secondary)' }}>
                                Vocab weights
                            </span>
                            {isAdvanced && <ShapeLabel shape={[dModel, VOCAB_SIZE]} dtype="float32" />}
                        </div>

                        <div style={{ fontSize: '24px', color: 'var(--muted)', margin: '0 8px' }}>=</div>

                        {/* Unnormalized Logits */}
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '8px'
                        }}>
                            <div style={{
                                padding: '8px 16px',
                                background: 'var(--bg-raised)',
                                border: '1px solid var(--stroke-dark)',
                                borderRadius: '6px',
                                color: 'var(--ink)',
                                fontSize: '14px',
                                fontWeight: 600,
                                fontFamily: 'var(--font-mono)'
                            }}>
                                Logits
                            </div>
                            <span style={{ fontSize: '12px', color: 'var(--secondary)' }}>
                                Unnormalized scores
                            </span>
                            {isAdvanced && <ShapeLabel shape={[VOCAB_SIZE]} dtype="float32" />}
                        </div>
                    </div>
                </GlassCard>

                {/* Bottom Section: Top 20 Logits Bar Chart */}
                <GlassCard padding="lg">
                    <h3 style={{
                        fontSize: '15px',
                        fontWeight: 600,
                        color: 'var(--ink)',
                        marginBottom: '24px',
                    }}>
                        Top 20 Logit Scores (out of {VOCAB_SIZE})
                    </h3>

                    <div style={{
                        height: '240px',
                        display: 'flex',
                        alignItems: 'flex-end',
                        gap: '6px',
                        position: 'relative',
                        paddingBottom: '40px',
                        paddingTop: '20px',
                        overflowX: 'auto',
                    }}>
                        {/* Y-axis line (0) */}
                        <div style={{
                            position: 'absolute',
                            left: 0,
                            right: 0,
                            bottom: '40px', // aligned with bottom padding
                            height: '1px',
                            background: 'var(--stroke)',
                            zIndex: 0
                        }} />

                        {topLogits.map((item, index) => {
                            const isTop1 = index === 0;
                            // Calculate height relative to max, map to pixel max height (180px)
                            const heightRatio = item.prob / yAxisRange;
                            const pxHeight = Math.max(2, Math.min(180, Math.abs(heightRatio * 180)));
                            const isPositive = item.prob >= 0;

                            const tokenStr = idToToken(item.id);
                            // Avoid pure whitespace tokens breaking layout
                            const displayStr = tokenStr.trim() === '' ? '␣' : tokenStr;

                            return (
                                <div key={item.id} style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: isPositive ? 'flex-end' : 'flex-start',
                                    alignItems: 'center',
                                    height: '200px', // Total vertical space per bar column
                                    width: '32px',
                                    minWidth: '32px',
                                    flexShrink: 0,
                                    zIndex: 1,
                                    position: 'relative'
                                }}>
                                    {/* Score Value Label */}
                                    <div style={{
                                        fontSize: '10px',
                                        color: isTop1 ? 'var(--ink)' : 'var(--muted)',
                                        fontFamily: 'var(--font-mono)',
                                        position: 'absolute',
                                        bottom: isPositive ? `${pxHeight + 45}px` : '45px', // 40px is zero-line + padding
                                        opacity: 0.8,
                                    }}>
                                        {item.prob.toFixed(1)}
                                    </div>

                                    {/* The animated bar */}
                                    <div style={{
                                        position: 'absolute',
                                        bottom: '40px', // Zero-line
                                        transformOrigin: 'bottom',
                                        width: '100%'
                                    }}>
                                        <motion.div
                                            initial={{ height: 0 }}
                                            animate={{ height: isPositive ? pxHeight : 0, y: isPositive ? 0 : pxHeight }}
                                            transition={{ type: 'spring', damping: 20, stiffness: 100, delay: index * 0.02 }}
                                            style={{
                                                width: '100%',
                                                background: isTop1 ? 'var(--viz-bar-top)' : 'var(--viz-bar-rest)',
                                                border: `1px solid ${isTop1 ? 'var(--viz-1)' : 'rgba(107,127,173,0.22)'}`,
                                                borderRadius: isPositive ? '4px 4px 0 0' : '0 0 4px 4px',
                                                boxShadow: 'none',
                                            }}
                                        />
                                    </div>

                                    {/* Token Label */}
                                    <div style={{
                                        position: 'absolute',
                                        bottom: '10px',
                                        fontSize: '11px',
                                        color: isTop1 ? 'var(--ink)' : 'var(--secondary)',
                                        fontFamily: 'var(--font-mono)',
                                        maxWidth: '30px',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                        background: isTop1 ? 'var(--bg-raised)' : 'transparent',
                                        padding: '2px 4px',
                                        borderRadius: '4px',
                                        fontWeight: isTop1 ? 600 : 400
                                    }} title={tokenStr}>
                                        {displayStr}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </GlassCard>
            </div>
        </div>
    );
}
