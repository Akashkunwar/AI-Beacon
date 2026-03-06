// src/components/visualizers/VectorBar.tsx
// Horizontal bar chart showing vector values (color intensity = magnitude).
// Each bar's fill maps the raw value to a hue range: negative = pink (warm),
// zero = muted, positive = cyan (primary).

import { memo } from 'react';
import { motion } from 'framer-motion';

// ─── Types ─────────────────────────────────────────────────────────────────

interface VectorBarProps {
    /** Array of scalar values to display as bars. */
    values: number[];
    /** Optional label for the whole bar set (token name, position, etc.) */
    label?: string;
    /** Max absolute value for normalization. Auto-computed if omitted. */
    maxAbs?: number;
    /** Bar height in px (per bar row). Default 8. */
    barHeight?: number;
    /** Show dimension indices on axis. Default false. */
    showIndices?: boolean;
    /** Animation stagger delay offset in seconds. Default 0. */
    animateDelay?: number;
    /** Aria label for accessibility. */
    ariaLabel?: string;
}

// ─── Color helpers ──────────────────────────────────────────────────────────

/**
 * Map a normalized value in [-1, 1] to a muted viz-palette fill.
 * Positive → slate blue (--viz-1: #6b7fad), alpha encodes magnitude.
 * Negative → muted rose (--viz-neg: #c07a7a), alpha encodes magnitude.
 */
function valueToColor(normValue: number): string {
    if (normValue >= 0) {
        const alpha = 0.18 + normValue * 0.72;  // 0.18 → 0.90
        return `rgba(107,127,173,${alpha.toFixed(2)})`; // --viz-1
    } else {
        const alpha = 0.15 + Math.abs(normValue) * 0.60;
        return `rgba(192,122,122,${alpha.toFixed(2)})`; // --viz-neg
    }
}

// ─── VectorBar ──────────────────────────────────────────────────────────────

export const VectorBar = memo(function VectorBar({
    values,
    label,
    maxAbs,
    barHeight = 8,
    showIndices = false,
    animateDelay = 0,
    ariaLabel,
}: VectorBarProps) {
    if (!values || values.length === 0) return null;

    // Compute normalization bound
    const computedMax = maxAbs ?? Math.max(1e-6, ...values.map(Math.abs));

    return (
        <div
            aria-label={ariaLabel ?? `Vector with ${values.length} dimensions`}
            style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                width: '100%',
            }}
        >
            {/* Optional label */}
            {label && (
                <span style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '10px',
                    color: 'var(--muted)',
                    letterSpacing: '0.05em',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                }}>
                    {label}
                </span>
            )}

            {/* Bar track */}
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '2px',
                    width: '100%',
                    borderRadius: '4px',
                    overflow: 'hidden',
                }}
            >
                {values.map((v, i) => {
                    const norm = Math.max(-1, Math.min(1, v / computedMax));
                    const isPos = norm >= 0;
                    const widthPct = Math.abs(norm) * 100;
                    const color = valueToColor(norm);

                    return (
                        <div key={i} style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                        }}>
                            {/* Dimension index */}
                            {showIndices && (
                                <span style={{
                                    fontFamily: 'var(--font-mono)',
                                    fontSize: '8px',
                                    color: 'var(--muted)',
                                    width: '16px',
                                    textAlign: 'right',
                                    flexShrink: 0,
                                }}>
                                    {i}
                                </span>
                            )}

                            {/* Track container (full width reference) */}
                            <div style={{
                                flex: 1,
                                height: `${barHeight}px`,
                                background: 'var(--bg-raised)',
                                borderRadius: '2px',
                                position: 'relative',
                                overflow: 'hidden',
                            }}>
                                {/* Center line */}
                                <div style={{
                                    position: 'absolute',
                                    left: '50%',
                                    top: 0,
                                    bottom: 0,
                                    width: '1px',
                                    background: 'var(--bg-raised)',
                                    transform: 'translateX(-50%)',
                                }} />
                                {/* Animated fill bar */}
                                <motion.div
                                    initial={{ width: '0%' }}
                                    animate={{ width: `${widthPct / 2}%` }}
                                    transition={{
                                        type: 'spring',
                                        stiffness: 200,
                                        damping: 28,
                                        delay: animateDelay + i * 0.02,
                                    }}
                                    style={{
                                        position: 'absolute',
                                        top: 0,
                                        bottom: 0,
                                        // Positive bars grow right from center; negative grow left
                                        ...(isPos
                                            ? { left: '50%' }
                                            : { right: '50%' }),
                                        background: color,
                                        borderRadius: '2px',
                                    }}
                                />
                            </div>

                            {/* Value label */}
                            <span style={{
                                fontFamily: 'var(--font-mono)',
                                fontSize: '8px',
                                color: isPos ? 'var(--secondary)' : 'var(--muted)',
                                width: '36px',
                                textAlign: 'right',
                                flexShrink: 0,
                            }}>
                                {v.toFixed(3)}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
});
