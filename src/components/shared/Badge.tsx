// ─── Badge Props ──────────────────────────────────────────────────────────────

export type BadgeVariant =
    | 'primary'
    | 'secondary'
    | 'accent'
    | 'warm'
    | 'success'
    | 'muted';

export type BadgeSize = 'sm' | 'md';

export interface BadgeProps {
    children: React.ReactNode;
    variant?: BadgeVariant;
    size?: BadgeSize;
    className?: string;
    /** Optional icon placed before text (string or SVG element) */
    icon?: React.ReactNode;
    /** ARIA label override */
    'aria-label'?: string;
}

import React from 'react';

const SIZE_CLASSES: Record<BadgeSize, string> = {
    sm: 'text-[10px] px-2 py-0.5',
    md: 'text-[11px] px-2.5 py-1',
};

// ─── Badge ────────────────────────────────────────────────────────────────────

/**
 * Status and label badge component for AI Beacon.
 * Renders with the bioluminescent deep-sea color palette.
 *
 * Variants: primary (cyan), secondary (teal), accent (purple),
 *           warm (pink), success (green), muted (grey)
 */
export function Badge({
    children,
    variant = 'primary',
    size = 'md',
    className = '',
    icon,
    'aria-label': ariaLabel,
}: BadgeProps) {
    const classes = [
        'badge',
        `badge-${variant}`,
        SIZE_CLASSES[size],
        className,
    ]
        .filter(Boolean)
        .join(' ');

    return (
        <span className={classes} aria-label={ariaLabel}>
            {icon && <span aria-hidden="true">{icon}</span>}
            {children}
        </span>
    );
}
