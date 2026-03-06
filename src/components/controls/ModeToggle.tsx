import { motion } from 'framer-motion';
import { type AppMode } from '@/lib/store/types';

// ─── ModeToggle Props ──────────────────────────────────────────────────────

interface ModeToggleProps {
    mode?: AppMode;
    onToggle?: (mode: AppMode) => void;
}

// ─── ModeToggle ────────────────────────────────────────────────────────────

export function ModeToggle({ mode = 'simple', onToggle }: ModeToggleProps) {
    const isAdvanced = mode === 'advanced';

    const handleToggle = () => {
        onToggle?.(isAdvanced ? 'simple' : 'advanced');
    };

    return (
        <button
            id="mode-toggle"
            onClick={handleToggle}
            aria-label={`Switch to ${isAdvanced ? 'Simple' : 'Advanced'} mode`}
            aria-pressed={isAdvanced}
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0',
                background: 'var(--bg-panel)',
                border: '1px solid var(--stroke)',
                borderRadius: 'var(--r-md)',
                padding: '3px',
                cursor: 'pointer',
                position: 'relative',
                userSelect: 'none',
                minHeight: '36px',
            }}
        >
            {(['simple', 'advanced'] as AppMode[]).map((m) => (
                <span
                    key={m}
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: 'var(--s1) var(--s4)',
                        borderRadius: 'var(--r-sm)',
                        fontSize: 'var(--text-sm)',
                        fontWeight: mode === m ? 'var(--weight-medium)' : 'var(--weight-regular)',
                        position: 'relative',
                        zIndex: 1,
                        transition: `color var(--dur-fast) var(--ease-out)`,
                        color: mode === m ? 'var(--text-inverse)' : 'var(--muted)',
                        whiteSpace: 'nowrap',
                    }}
                >
                    {/* Sliding pill behind active label */}
                    {mode === m && (
                        <motion.span
                            layoutId="mode-pill"
                            aria-hidden="true"
                            style={{
                                position: 'absolute',
                                inset: 0,
                                borderRadius: 'var(--r-sm)',
                                background: 'var(--bg-inverse)',
                                zIndex: -1,
                            }}
                            transition={{ type: 'tween', duration: 0.15, ease: [0.2, 0, 0, 1] }}
                        />
                    )}
                    {m === 'simple' ? 'Simple' : 'Advanced'}
                </span>
            ))}
        </button>
    );
}


