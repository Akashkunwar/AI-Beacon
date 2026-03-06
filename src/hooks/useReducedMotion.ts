// src/hooks/useReducedMotion.ts
// Returns true when the user's OS has "Reduce Motion" enabled.
// Used throughout AI Beacon to disable/shorten Framer Motion animations.

import { useEffect, useState } from 'react';

/**
 * Hook that tracks the `prefers-reduced-motion` media query.
 * Returns `true` when animations should be reduced or disabled.
 *
 * Usage:
 *   const reduced = useReducedMotion();
 *   const variants = reduced ? staticVariants : animatedVariants;
 */
export function useReducedMotion(): boolean {
    const [reduced, setReduced] = useState<boolean>(() => {
        // SSR-safe default — always false on server; updated on mount
        if (typeof window === 'undefined') return false;
        return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    });

    useEffect(() => {
        const mq = window.matchMedia('(prefers-reduced-motion: reduce)');

        const handler = (e: MediaQueryListEvent) => setReduced(e.matches);

        // Modern API
        mq.addEventListener('change', handler);
        return () => mq.removeEventListener('change', handler);
    }, []);

    return reduced;
}
