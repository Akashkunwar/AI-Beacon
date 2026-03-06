// src/components/visualizers/FlowArrow.tsx
// Animated SVG flow arrow between pipeline elements.

import { motion } from 'framer-motion';

// ─── FlowArrow Props ──────────────────────────────────────────────────────

interface FlowArrowProps {
    /** Optional label displayed alongside the arrow */
    label?: string;
    /** Arrow orientation */
    direction?: 'right' | 'down';
    /** Delay before path-drawing animation starts */
    animateDelay?: number;
    /** Color (defaults to --color-primary) */
    color?: string;
}

// ─── FlowArrow ────────────────────────────────────────────────────────────

export function FlowArrow({
    label,
    direction = 'right',
    animateDelay = 0,
    color = 'var(--ink)',
}: FlowArrowProps) {
    if (direction === 'right') {
        return (
            <div
                aria-hidden="true"
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    flexShrink: 0,
                    padding: '0 4px',
                }}
            >
                {label && (
                    <span style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '10px',
                        color: 'var(--muted)',
                        whiteSpace: 'nowrap',
                    }}>
                        {label}
                    </span>
                )}
                <svg width="40" height="12" viewBox="0 0 40 12" fill="none" overflow="visible">
                    {/* Shaft */}
                    <motion.line
                        x1="0" y1="6" x2="32" y2="6"
                        stroke={color}
                        strokeWidth="1.5"
                        strokeOpacity="0.6"
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 1 }}
                        transition={{ duration: 0.5, delay: animateDelay, ease: 'easeOut' }}
                    />
                    {/* Arrowhead */}
                    <motion.path
                        d="M32 3 L40 6 L32 9"
                        stroke={color}
                        strokeWidth="1.5"
                        strokeOpacity="0.6"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.2, delay: animateDelay + 0.4 }}
                    />
                </svg>
            </div>
        );
    }

    // direction === 'down'
    return (
        <div
            aria-hidden="true"
            style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 0',
            }}
        >
            <svg width="12" height="36" viewBox="0 0 12 36" fill="none" overflow="visible">
                <motion.line
                    x1="6" y1="0" x2="6" y2="28"
                    stroke={color}
                    strokeWidth="1.5"
                    strokeOpacity="0.6"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 0.4, delay: animateDelay, ease: 'easeOut' }}
                />
                <motion.path
                    d="M3 28 L6 36 L9 28"
                    stroke={color}
                    strokeWidth="1.5"
                    strokeOpacity="0.6"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2, delay: animateDelay + 0.35 }}
                />
            </svg>
            {label && (
                <span style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '10px',
                    color: 'var(--muted)',
                    whiteSpace: 'nowrap',
                }}>
                    {label}
                </span>
            )}
        </div>
    );
}
