// src/components/visualizers/TokenBadge.tsx
// Reusable token pill with optional ID badge and hover tooltip.
// Monochrome only — bg-inverse / text-inverse, no colour.

import { motion } from 'framer-motion';
import { TooltipEngine } from '@/components/educational/TooltipEngine';

// ─── Token Hue Palette ────────────────────────────────────────────────────
// Kept for API compatibility — callers reference getTokenHue but colour is ignored.

const TOKEN_HUES = [185, 270, 340, 45, 130, 220, 300, 60, 160, 200, 30, 90];

export function getTokenHue(index: number): number {
    return TOKEN_HUES[index % TOKEN_HUES.length];
}

// ─── TokenBadge Props ─────────────────────────────────────────────────────

interface TokenBadgeProps {
    /** The token string to display */
    token: string;
    /** Vocabulary ID (shown when showId=true) */
    id?: number;
    /** Color hue — not used for rendering (monochrome). Kept for API compatibility. */
    hue: number;
    /** Whether to render the ID badge below the token */
    showId?: boolean;
    /** Framer Motion entrance animation delay (seconds, 0 = immediate) */
    animateDelay?: number;
    /** Whether to run the entrance animation at all */
    animate?: boolean;
}

// ─── TokenBadge ───────────────────────────────────────────────────────────

export function TokenBadge({
    token,
    id,
    hue: _hue,
    showId = false,
    animateDelay = 0,
    animate = true,
}: TokenBadgeProps) {
    return (
        <TooltipEngine
            content={
                <span style={{ fontFamily: 'var(--font-mono)' }}>
                    token: <span style={{ color: 'var(--ink)' }}>&quot;{token}&quot;</span>
                    {id !== undefined && (
                        <> · id: <span style={{ color: 'var(--ink)', fontWeight: 600 }}>{id}</span></>
                    )}
                </span>
            }
        >
            <motion.div
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}
                initial={animate ? { scale: 0, opacity: 0 } : false}
                animate={{ scale: 1, opacity: 1 }}
                transition={animate ? {
                    type: 'spring',
                    stiffness: 320,
                    damping: 24,
                    delay: animateDelay,
                } : undefined}
            >
                {/* Token pill — monochrome */}
                <div
                    aria-label={`Token: ${token}${id !== undefined ? `, id: ${id}` : ''}`}
                    style={{
                        background: 'var(--bg-inverse)',
                        border: '1px solid var(--bg-inverse)',
                        borderRadius: 'var(--r-sm)',
                        padding: '5px 12px',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '13px',
                        fontWeight: 600,
                        color: 'var(--text-inverse)',
                        whiteSpace: 'nowrap',
                        userSelect: 'none',
                    }}
                >
                    {token}
                </div>

                {/* ID Badge (animates up when showId becomes true) */}
                {showId && id !== undefined && (
                    <motion.div
                        initial={{ y: 8, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{
                            type: 'spring',
                            stiffness: 280,
                            damping: 22,
                            delay: animateDelay + 0.12,
                        }}
                        aria-label={`Token ID: ${id}`}
                        style={{
                            background: 'var(--bg-raised)',
                            border: '1px solid var(--stroke-dark)',
                            borderRadius: 'var(--r-xs)',
                            padding: '2px 8px',
                            fontFamily: 'var(--font-mono)',
                            fontSize: '11px',
                            color: 'var(--ink)',
                        }}
                    >
                        #{id}
                    </motion.div>
                )}
            </motion.div>
        </TooltipEngine>
    );
}
