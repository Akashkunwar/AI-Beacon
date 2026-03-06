// src/components/shared/NumberDisplay.tsx
import { useEffect, useState } from 'react';
import { motion, useSpring } from 'framer-motion';

interface NumberDisplayProps {
    value: number;
    precision?: number;
    format?: 'number' | 'percent';
    className?: string;
    style?: React.CSSProperties;
}

export function NumberDisplay({
    value,
    precision = 3,
    format = 'number',
    className,
    style
}: NumberDisplayProps) {
    const [displayValue, setDisplayValue] = useState(value);

    // We use a spring to animate the underlying value smoothly
    const springValue = useSpring(value, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    });

    useEffect(() => {
        if (!Number.isNaN(value)) {
            springValue.set(value);
        }
    }, [value, springValue]);

    // Force React to re-render when the spring updates
    // In a heavier app we might use a ref for pure DOM manipulation,
    // but React state is fine for these toy dimensions.
    useEffect(() => {
        const unsubscribe = springValue.on('change', (latest) => {
            setDisplayValue(latest);
        });
        return unsubscribe;
    }, [springValue]);

    let formatted = '0';
    if (!Number.isNaN(displayValue)) {
        formatted = displayValue.toFixed(precision);
        if (format === 'percent') {
            const percent = displayValue * 100;
            // avoid awkward negative zero for incredibly small negatives
            const cleaned = percent < 0 && percent > -0.0001 ? 0 : percent;

            // Protect against negative precision
            const p = Math.max(0, precision - 2);
            formatted = `${cleaned.toFixed(p)}%`;
        }
    }

    return (
        <motion.span
            className={className}
            style={{
                fontVariantNumeric: 'tabular-nums',
                ...style
            }}
        >
            {formatted}
        </motion.span>
    );
}
