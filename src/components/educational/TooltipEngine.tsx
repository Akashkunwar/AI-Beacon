// src/components/educational/TooltipEngine.tsx
// Lightweight hover/focus tooltip used for inline explanations.

import { useState, useRef, useCallback, useId } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TooltipEngineProps {
    /** Tooltip content — can be a string or a React node */
    content: React.ReactNode;
    /** The element that triggers the tooltip on hover/focus */
    children: React.ReactNode;
    /** Vertical placement preference */
    placement?: 'top' | 'bottom';
    /** Max width of the tooltip popover */
    maxWidth?: number;
}

export function TooltipEngine({
    content,
    children,
    placement = 'top',
    maxWidth = 280,
}: TooltipEngineProps) {
    const [visible, setVisible] = useState(false);
    const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const id = useId();

    const show = useCallback(() => {
        if (hideTimer.current) clearTimeout(hideTimer.current);
        setVisible(true);
    }, []);

    const hide = useCallback(() => {
        hideTimer.current = setTimeout(() => setVisible(false), 80);
    }, []);

    const isTop = placement === 'top';

    return (
        <span
            style={{ position: 'relative', display: 'inline-block' }}
            onMouseEnter={show}
            onMouseLeave={hide}
            onFocus={show}
            onBlur={hide}
            onKeyDown={(e) => { if (e.key === 'Escape') setVisible(false); }}
            aria-describedby={visible ? id : undefined}
        >
            {children}
            <AnimatePresence>
                {visible && (
                    <motion.div
                        id={id}
                        role="tooltip"
                        initial={{ opacity: 0, y: isTop ? 4 : -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: isTop ? 4 : -4 }}
                        transition={{ duration: 0.14, ease: 'easeOut' }}
                        style={{
                            position: 'absolute',
                            [isTop ? 'bottom' : 'top']: 'calc(100% + 8px)',
                            left: '50%',
                            x: '-50%',
                            zIndex: 'var(--z-overlay)',
                            maxWidth: `min(${maxWidth}px, 80vw)`,
                            width: 'max-content',
                            pointerEvents: 'none',
                        }}
                    >
                        <div style={{
                            position: 'absolute',
                            [isTop ? 'bottom' : 'top']: '-5px',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            width: 0,
                            height: 0,
                            borderLeft: '5px solid transparent',
                            borderRight: '5px solid transparent',
                            ...(isTop
                                ? { borderTop: '5px solid var(--bg-inverse)' }
                                : { borderBottom: '5px solid var(--bg-inverse)' }),
                        }} />
                        <div style={{
                            background: 'var(--bg-inverse)',
                            color: 'var(--text-inverse)',
                            borderRadius: 'var(--r-sm)',
                            padding: '8px 12px',
                            boxShadow: 'var(--shadow-lift)',
                            fontSize: 'var(--text-2xs)',
                            lineHeight: 1.5,
                            textAlign: 'left',
                        }}>
                            {content}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </span>
    );
}
