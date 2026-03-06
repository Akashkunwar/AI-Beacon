import { motion } from 'framer-motion';
import { ModelConfigForm } from './ModelConfigForm';
import type { ModelConfig, AppMode } from '@/lib/store/types';

// ─── ControlPanel Props ───────────────────────────────────────────────────

interface ControlPanelProps {
    config?: ModelConfig;
    onConfigChange?: (patch: Partial<ModelConfig>) => void;
    inputText?: string;
    onInputChange?: (text: string) => void;
    mode?: AppMode;
    isVisible?: boolean;
}

// ─── ControlPanel ─────────────────────────────────────────────────────────

export function ControlPanel({
    config,
    onConfigChange,
    inputText = '',
    onInputChange,
    isVisible = true,
}: ControlPanelProps) {
    return (
        <motion.aside
            aria-label="Control panel"
            initial={false}
            animate={{ opacity: isVisible ? 1 : 0 }}
            style={{
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                background: 'var(--bg-panel)',
                borderRight: '1px solid var(--stroke)',
                overflowY: 'auto',
                overflowX: 'hidden',
            }}
        >
            {/* Panel header */}
            <div style={{
                padding: 'var(--s3) var(--s4)',
                borderBottom: '1px solid var(--stroke)',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--s2)',
                flexShrink: 0,
            }}>
                <div style={{
                    width: '5px',
                    height: '5px',
                    borderRadius: '50%',
                    background: 'var(--ink)',
                    flexShrink: 0,
                }} />
                <span style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 'var(--text-xs)',
                    color: 'var(--muted)',
                    textTransform: 'uppercase',
                    letterSpacing: 'var(--tracking-wider)',
                }}>
                    Controls
                </span>
            </div>

            {/* Scrollable content */}
            <div style={{ flex: 1, overflowY: 'auto' }}>
                <ModelConfigForm
                    config={config}
                    onChange={onConfigChange}
                    inputText={inputText}
                    onInputChange={onInputChange}
                />
            </div>
        </motion.aside>
    );
}
