import React, { useRef } from 'react';
import { motion } from 'framer-motion';

// ─── GlassCard Props ─────────────────────────────────────────────────────────

export interface GlassCardProps {
    children: React.ReactNode;
    className?: string;
    /** Whether to pulse with a cyan glow border (e.g., active step) */
    active?: boolean;
    /** Click handler */
    onClick?: () => void;
    /** ARIA label for accessibility */
    'aria-label'?: string;
    /** Whether to animate on mount */
    animate?: boolean;
    /** Padding preset */
    padding?: 'none' | 'sm' | 'md' | 'lg';
    as?: 'div' | 'section' | 'article' | 'aside';
    /** Inline style overrides */
    style?: React.CSSProperties;
}

const PADDING_MAP: Record<NonNullable<GlassCardProps['padding']>, React.CSSProperties | undefined> = {
    none: undefined,
    sm: { padding: 'var(--s3)' },
    md: { padding: 'var(--s4)' },
    lg: { padding: 'var(--s6)' },
};

// ─── GlassCard ────────────────────────────────────────────────────────────────

/**
 * Glassmorphic container card — the primary building block for all panels
 * in the DEPTH simulator. Provides backdrop-blur, cyan border, and glow hover.
 */
export function GlassCard({
    children,
    className = '',
    active = false,
    onClick,
    'aria-label': ariaLabel,
    animate = true,
    padding = 'md',
    as: Tag = 'div',
    style,
}: GlassCardProps) {
    const ref = useRef<HTMLDivElement>(null);

    const baseClasses = [
        'glass-card',
        active ? 'glow-active' : '',
        onClick ? 'cursor-pointer' : '',
        className,
    ]
        .filter(Boolean)
        .join(' ');

    const combinedStyle = {
        ...PADDING_MAP[padding],
        ...style,
    };

    if (animate) {
        return (
            <motion.div
                ref={ref}
                className={baseClasses}
                style={combinedStyle}
                onClick={onClick}
                aria-label={ariaLabel}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                whileHover={onClick ? { scale: 1.005 } : undefined}
            // Framer Motion renders a div — we cast as appropriate for semantics
            >
                {/* Semantic wrapper for the actual HTML tag */}
                {Tag === 'div' ? (
                    children
                ) : (
                    <Tag style={{ display: 'contents' }}>{children}</Tag>
                )}
            </motion.div>
        );
    }

    return (
        <div
            className={baseClasses}
            style={combinedStyle}
            onClick={onClick}
            aria-label={ariaLabel}
        >
            {children}
        </div>
    );
}
