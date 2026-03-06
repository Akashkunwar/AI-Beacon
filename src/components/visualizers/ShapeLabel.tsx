// src/components/visualizers/ShapeLabel.tsx
// Tensor shape annotation component: displays shape + dtype as a styled chip.
// Example: ShapeLabel shape={[4, 8]} dtype="float32" → "(4, 8) float32"

import { memo } from 'react';
import { motion } from 'framer-motion';

// ─── Types ─────────────────────────────────────────────────────────────────

interface ShapeLabelProps {
    /** Tensor shape as array, e.g. [4, 8] → "(4, 8)" */
    shape: number[];
    /** Data type label. Default 'float32'. */
    dtype?: string;
    /** Optional descriptive name shown above the shape string. */
    name?: string;
    /** Color accent. Defaults to cyan primary. */
    color?: string;
    /** Framer Motion entrance delay. */
    animateDelay?: number;
    /** Show a subtle background chip. Default true. */
    chip?: boolean;
}

// ─── ShapeLabel ─────────────────────────────────────────────────────────────

export const ShapeLabel = memo(function ShapeLabel({
    shape,
    dtype = 'float32',
    name,
    color = 'var(--ink)',
    animateDelay = 0,
    chip = true,
}: ShapeLabelProps) {
    const shapeStr = `(${shape.join(', ')})`;
    const totalElements = shape.reduce((a, b) => a * b, 1);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: animateDelay, ease: 'easeOut' }}
            aria-label={`Tensor shape ${shapeStr} ${dtype}`}
            style={chip ? {
                display: 'inline-flex',
                flexDirection: 'column',
                gap: '2px',
                padding: '7px 11px',
                background: 'var(--bg-raised)',
                border: '1px solid var(--stroke)',
                borderRadius: '8px',
                cursor: 'default',
            } : {
                display: 'inline-flex',
                flexDirection: 'column',
                gap: '2px',
            }}
        >
            {/* Optional name row */}
            {name && (
                <span style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '9px',
                    color: 'var(--muted)',
                    letterSpacing: '0.07em',
                    textTransform: 'uppercase',
                }}>
                    {name}
                </span>
            )}

            {/* Shape string */}
            <span style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '13px',
                fontWeight: 700,
                color,
                letterSpacing: '0.03em',
            }}>
                {shapeStr}{dtype && <span style={{ fontWeight: 400, color: 'var(--muted)', fontSize: '11px' }}> {dtype}</span>}
            </span>

            {/* Element count */}
            <span style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '9px',
                color: 'var(--muted)',
            }}>
                {totalElements.toLocaleString()} values
            </span>
        </motion.div>
    );
});
