// src/components/educational/TooltipEngine.tsx
// Context-aware hover tooltip system.

import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ─── TooltipEngine Props ──────────────────────────────────────────────────

interface TooltipEngineProps {
    /** Tooltip content — can be a string or a React node */
    content: React.ReactNode;
    /** The element that triggers the tooltip on hover */
    children: React.ReactNode;
    /** Horizontal placement preference */
    placement?: 'top' | 'bottom';
    /** Max width of the tooltip popover */
    maxWidth?: number;
}

// ─── TooltipEngine ────────────────────────────────────────────────────────

export function TooltipEngine({
    content,
    children,
    placement = 'top',
    maxWidth = 280,
}: TooltipEngineProps) {
    const [visible, setVisible] = useState(false);
    const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const show = useCallback(() => {
        if (hideTimer.current) clearTimeout(hideTimer.current);
        setVisible(true);
    }, []);

    const hide = useCallback(() => {
        hideTimer.current = setTimeout(() => setVisible(false), 80);
    }, []);

    return (
        <span
            style={{ position: 'relative', display: 'inline-block' }}
            onMouseEnter={show}
            onMouseLeave={hide}
            onFocus={show}
            onBlur={hide}
        >
            {children}
            <AnimatePresence>
                {visible && (
                    <motion.div
                        role="tooltip"
                        initial={{ opacity: 0, y: placement === 'top' ? 6 : -6, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: placement === 'top' ? 4 : -4, scale: 0.95 }}
                        transition={{ duration: 0.15, ease: 'easeOut' }}
                        style={{
                            position: 'absolute',
                            [placement === 'top' ? 'bottom' : 'top']: 'calc(100% + 8px)',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            zIndex: 100,
                            maxWidth: `${maxWidth}px`,
                            width: 'max-content',
                            pointerEvents: 'none',
                        }}
                    >
                        {/* Arrow */}
                        <div style={{
                            position: 'absolute',
                            [placement === 'top' ? 'bottom' : 'top']: '-5px',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            width: 0,
                            height: 0,
                            borderLeft: '5px solid transparent',
                            borderRight: '5px solid transparent',
                            ...(placement === 'top'
                                ? { borderTop: '5px solid rgba(0,229,255,0.25)' }
                                : { borderBottom: '5px solid rgba(0,229,255,0.25)' }
                            ),
                        }} />

                        {/* Content box */}
                        <div style={{
                            background: 'rgba(5,13,26,0.97)',
                            border: '1px solid rgba(0,229,255,0.25)',
                            borderRadius: '8px',
                            padding: '8px 12px',
                            boxShadow: '0 4px 24px rgba(0,0,0,0.5), 0 0 12px var(--bg-raised)',
                            backdropFilter: 'blur(12px)',
                            fontSize: '12px',
                            color: 'var(--secondary)',
                            lineHeight: 1.5,
                        }}>
                            {content}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </span>
    );
}
