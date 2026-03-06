// src/components/visualizers/AttentionHeatmap.tsx
// Pure-React (no D3) attention weight heatmap for MVP.
// Renders an (n×n) grid where cell opacity encodes attention weight (0–1).
// Masked (future) positions are shown with a ✕ in --bg-raised.
// Color scale: --viz-heat-lo (near-white slate) → --viz-heat-hi (deep navy).

import { memo, useState, useMemo } from 'react';
import { motion } from 'framer-motion';

// ─── Types ──────────────────────────────────────────────────────────────────

interface AttentionHeatmapProps {
    /** (n × n) row-major attention weight matrix — each row should sum to ~1 */
    weights: number[][];
    /** Token labels for axis annotations */
    tokens: string[];
    /** Optional title shown above heatmap */
    title?: string;
    /** Framer Motion delay for entrance animation */
    animateDelay?: number;
    /** Accessibility label */
    ariaLabel?: string;
    /** If true, shade cells where j > i with a distinct masked style */
    showMask?: boolean;
}

// ─── Color helpers (slate → navy heat scale) ─────────────────────────────────

/**
 * Interpolate between --viz-heat-lo (#dce8f5) and --viz-heat-hi (#2d5a8e)
 * based on attention weight [0, 1]. Masked cells use --bg-raised.
 */
function lerpChannel(lo: number, hi: number, t: number): number {
    return Math.round(lo + (hi - lo) * t);
}

function weightToBackground(weight: number, isMasked: boolean): string {
    if (isMasked) return 'var(--bg-raised)';
    // heat-lo: rgb(220, 232, 245)  heat-hi: rgb(45, 90, 142)
    const r = lerpChannel(220, 45, weight);
    const g = lerpChannel(232, 90, weight);
    const b = lerpChannel(245, 142, weight);
    return `rgb(${r},${g},${b})`;
}

/** Text colour that contrasts with the interpolated heatmap background */
function weightToTextColor(weight: number, isMasked: boolean): string {
    if (isMasked) return 'var(--muted)';
    // Switch to white text when background is dark enough
    if (weight > 0.52) return 'rgba(249,249,249,0.92)';
    return 'var(--secondary)';
}

// ─── AttentionHeatmap ─────────────────────────────────────────────────────────

export const AttentionHeatmap = memo(function AttentionHeatmap({
    weights,
    tokens,
    title,
    animateDelay = 0,
    ariaLabel,
    showMask = false,
}: AttentionHeatmapProps) {
    const n = weights.length;
    const [hoveredCell, setHoveredCell] = useState<{ row: number; col: number } | null>(null);

    // Cell size scales with n — fewer tokens → bigger cells
    const cellSize = useMemo(() => {
        if (n <= 3) return 52;
        if (n <= 5) return 44;
        if (n <= 8) return 36;
        return 30;
    }, [n]);

    const fontSize = cellSize <= 36 ? 8 : 9;

    if (!weights || n === 0) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: animateDelay }}
            aria-label={ariaLabel ?? `Attention weight heatmap for ${n} tokens`}
            style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}
        >
            {/* Title */}
            {title && (
                <p style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '10px',
                    color: 'var(--muted)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    margin: 0,
                }}>
                    {title}
                </p>
            )}

            {/* Hovered cell tooltip */}
            {hoveredCell && (
                <div style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '11px',
                    color: 'var(--ink)',
                    background: 'var(--bg-panel)',
                    border: '1px solid var(--stroke-dark)',
                    borderRadius: 'var(--r-md)',
                    padding: '4px 10px',
                    alignSelf: 'flex-start',
                    boxShadow: 'var(--shadow-soft)',
                }}>
                    {tokens[hoveredCell.row]} → {tokens[hoveredCell.col]}:{' '}
                    <b>{weights[hoveredCell.row][hoveredCell.col].toFixed(4)}</b>
                    {showMask && hoveredCell.col > hoveredCell.row && (
                        <span style={{ color: 'var(--muted)', marginLeft: '6px' }}>
                            [masked]
                        </span>
                    )}
                </div>
            )}

            {/* Grid wrapper: col labels + row */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>

                {/* Column headers — "Key" axis */}
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '2px' }}>
                    {/* Row-label gutter spacer */}
                    <div style={{ width: `${Math.max(...tokens.map(t => t.length)) * 6 + 12}px`, flexShrink: 0 }} />
                    {tokens.map((tok, j) => (
                        <div
                            key={j}
                            style={{
                                width: `${cellSize}px`,
                                textAlign: 'center',
                                fontFamily: 'var(--font-mono)',
                                fontSize: `${fontSize}px`,
                                color: 'var(--secondary)',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                padding: '0 2px',
                            }}
                            title={tok}
                        >
                            {tok}
                        </div>
                    ))}
                </div>

                {/* Rows */}
                {weights.map((row, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -6 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: animateDelay + i * 0.06, duration: 0.25 }}
                        style={{ display: 'flex', alignItems: 'center', gap: '2px' }}
                    >
                        {/* Row label — "Query" axis */}
                        <div style={{
                            width: `${Math.max(...tokens.map(t => t.length)) * 6 + 12}px`,
                            flexShrink: 0,
                            fontFamily: 'var(--font-mono)',
                            fontSize: `${fontSize}px`,
                            color: 'var(--secondary)',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            textAlign: 'right',
                            paddingRight: '6px',
                        }}
                            title={tokens[i]}
                        >
                            {tokens[i]}
                        </div>

                        {/* Cells */}
                        {row.map((weight, j) => {
                            const isMasked = showMask && j > i;
                            const isHovered = hoveredCell?.row === i && hoveredCell?.col === j;
                            const bg = weightToBackground(weight, isMasked);
                            const textColor = weightToTextColor(weight, isMasked);

                            return (
                                <motion.div
                                    key={j}
                                    onMouseEnter={() => setHoveredCell({ row: i, col: j })}
                                    onMouseLeave={() => setHoveredCell(null)}
                                    animate={{ scale: isHovered ? 1.08 : 1 }}
                                    transition={{ duration: 0.12 }}
                                    style={{
                                        width: `${cellSize}px`,
                                        height: `${cellSize}px`,
                                        background: bg,
                                        border: isHovered
                                            ? '1px solid var(--stroke-dark)'
                                            : isMasked
                                                ? '1px solid var(--stroke)'
                                                : '1px solid transparent',
                                        borderRadius: '4px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontFamily: 'var(--font-mono)',
                                        fontSize: `${fontSize}px`,
                                        color: textColor,
                                        cursor: 'crosshair',
                                        transition: 'background 0.15s, border 0.15s',
                                        userSelect: 'none',
                                        position: 'relative',
                                        flexShrink: 0,
                                    }}
                                    aria-label={`${tokens[i]} attends to ${tokens[j]}: ${weight.toFixed(3)}`}
                                >
                                    {isMasked ? (
                                        <span style={{ opacity: 0.4, fontSize: `${fontSize - 1}px` }}>✕</span>
                                    ) : (
                                        weight.toFixed(cellSize <= 36 ? 2 : 3)
                                    )}
                                </motion.div>
                            );
                        })}
                    </motion.div>
                ))}
            </div>

            {/* Legend — slate→navy heat ramp */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                <div style={{
                    width: '80px',
                    height: '8px',
                    borderRadius: '4px',
                    background: 'linear-gradient(to right, #dce8f5, #2d5a8e)',
                    border: '1px solid var(--stroke)',
                }} />
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--muted)' }}>
                    0 (ignore) → 1 (full attention)
                </span>
                {showMask && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginLeft: '8px' }}>
                        <div style={{ width: '12px', height: '8px', borderRadius: '2px', background: 'var(--bg-raised)', border: '1px solid var(--stroke)' }} />
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--muted)' }}>masked</span>
                    </div>
                )}
            </div>
        </motion.div>
    );
});
