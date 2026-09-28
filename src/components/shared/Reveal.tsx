import { useRef, type ReactNode } from 'react';
import { motion, useInView, useReducedMotion } from 'framer-motion';

interface RevealProps {
    children: ReactNode;
    /** Delay in seconds */
    delay?: number;
    className?: string;
    style?: React.CSSProperties;
}

/**
 * Fades and lifts its children into view the first time they scroll on screen.
 * Renders statically when the user prefers reduced motion.
 */
export function Reveal({ children, delay = 0, className, style }: RevealProps) {
    const ref = useRef<HTMLDivElement>(null);
    const inView = useInView(ref, { once: true, margin: '-40px' });
    const reduced = useReducedMotion();

    if (reduced) {
        return <div className={className} style={style}>{children}</div>;
    }

    return (
        <motion.div
            ref={ref}
            className={className}
            style={style}
            initial={{ opacity: 0, y: 12 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
            transition={{ duration: 0.4, delay, ease: [0.2, 0, 0, 1] }}
        >
            {children}
        </motion.div>
    );
}
