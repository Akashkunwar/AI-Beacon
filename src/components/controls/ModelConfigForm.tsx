import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DEFAULT_CONFIG, type ModelConfig } from '@/lib/store/types';
import { GlassCard } from '@/components/shared';

// ─── ModelConfigForm Props ────────────────────────────────────────────────

interface ModelConfigFormProps {
    config?: ModelConfig;
    onChange?: (patch: Partial<ModelConfig>) => void;
    inputText?: string;
    onInputChange?: (text: string) => void;
}

// ─── ModelConfigForm ──────────────────────────────────────────────────────

export function ModelConfigForm({
    config = DEFAULT_CONFIG,
    onChange,
    inputText = '',
    onInputChange,
}: ModelConfigFormProps) {
    const [configOpen, setConfigOpen] = useState(true);

    const isValidConfig = config.dModel % config.nHeads === 0;

    const D_MODEL_OPTIONS = [4, 8, 16, 32, 64] as const;
    const N_HEADS_OPTIONS = [1, 2, 4] as const;

    const wordCount = inputText.trim() === '' ? 0 : inputText.trim().split(/\s+/).length;
    const isOverLimit = wordCount > config.maxTokens;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>

            {/* ── Text Input Section ──────────────────────────────────── */}
            <section
                aria-labelledby="input-section-label"
                style={{
                    padding: 'var(--s4)',
                    borderBottom: '1px solid var(--stroke)',
                }}
            >
                <label
                    id="input-section-label"
                    htmlFor="text-input"
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: 'var(--s3)',
                        fontSize: 'var(--text-xs)',
                        fontFamily: 'var(--font-mono)',
                        color: 'var(--muted)',
                        textTransform: 'uppercase',
                        letterSpacing: 'var(--tracking-wider)',
                        cursor: 'pointer',
                    }}
                >
                    Input Text
                    <span style={{
                        color: isOverLimit ? 'var(--ink)' : 'var(--muted)',
                        transition: 'color var(--dur-fast) var(--ease-out)',
                    }}>
                        {wordCount}/{config.maxTokens} words
                    </span>
                </label>
                <textarea
                    id="text-input"
                    value={inputText}
                    onChange={(e) => onInputChange?.(e.target.value)}
                    placeholder="Type your sentence here…"
                    rows={3}
                    aria-label="Input text for transformer pipeline"
                    aria-describedby="input-hint"
                    style={{
                        width: '100%',
                        background: 'var(--bg)',
                        border: `1px solid ${isOverLimit ? 'var(--ink)' : 'var(--stroke-dark)'}`,
                        borderRadius: 'var(--r-md)',
                        padding: 'var(--s3) var(--s3)',
                        color: 'var(--primary)',
                        fontFamily: 'var(--font-mono)',
                        fontSize: 'var(--text-sm)',
                        resize: 'none',
                        outline: 'none',
                        transition: `border-color var(--dur-fast) var(--ease-out)`,
                        lineHeight: 'var(--lead-body)',
                    }}
                    onFocus={(e) => {
                        e.target.style.borderColor = 'var(--ink)';
                    }}
                    onBlur={(e) => {
                        e.target.style.borderColor = isOverLimit ? 'var(--ink)' : 'var(--stroke-dark)';
                    }}
                />
                <p
                    id="input-hint"
                    style={{
                        marginTop: 'var(--s1)',
                        fontSize: 'var(--text-xs)',
                        color: isOverLimit ? 'var(--ink)' : 'var(--muted)',
                        fontFamily: 'var(--font-mono)',
                    }}
                >
                    {isOverLimit
                        ? `⚠ Max ${config.maxTokens} words allowed`
                        : 'Words are split into tokens automatically'}
                </p>

                {/* Sample sentences */}
                <div style={{ marginTop: 'var(--s3)', display: 'flex', flexWrap: 'wrap', gap: 'var(--s1)' }}>
                    {['The cat sat', 'Hello world', 'AI learns fast'].map((sample) => (
                        <button
                            key={sample}
                            aria-label={`Use sample: ${sample}`}
                            onClick={() => onInputChange?.(sample)}
                            style={{
                                padding: 'var(--s1) var(--s3)',
                                background: 'var(--bg-panel)',
                                border: '1px solid var(--stroke)',
                                borderRadius: 'var(--r-sm)',
                                color: 'var(--secondary)',
                                fontSize: 'var(--text-xs)',
                                fontFamily: 'var(--font-mono)',
                                cursor: 'pointer',
                                minHeight: '28px',
                                transition: `all var(--dur-fast) var(--ease-out)`,
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.borderColor = 'var(--stroke-dark)';
                                e.currentTarget.style.color = 'var(--ink)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.borderColor = 'var(--stroke)';
                                e.currentTarget.style.color = 'var(--secondary)';
                            }}
                        >
                            {sample}
                        </button>
                    ))}
                </div>
            </section>

            {/* ── Model Config Section ────────────────────────────────── */}
            <section aria-labelledby="model-config-label">
                {/* Collapsible header */}
                <button
                    id="model-config-toggle"
                    aria-expanded={configOpen}
                    aria-controls="model-config-content"
                    onClick={() => setConfigOpen((v) => !v)}
                    style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: 'var(--s3) var(--s4)',
                        background: 'transparent',
                        border: 'none',
                        borderBottom: configOpen ? '1px solid var(--stroke)' : 'none',
                        color: 'var(--muted)',
                        cursor: 'pointer',
                        textAlign: 'left',
                        minHeight: '44px',
                    }}
                >
                    <span
                        id="model-config-label"
                        style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: 'var(--text-xs)',
                            textTransform: 'uppercase',
                            letterSpacing: 'var(--tracking-wider)',
                        }}
                    >
                        Model Config
                    </span>
                    <motion.span
                        animate={{ rotate: configOpen ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                        style={{ fontSize: '10px', color: 'var(--muted)' }}
                    >
                        ▼
                    </motion.span>
                </button>

                <AnimatePresence initial={false}>
                    {configOpen && (
                        <motion.div
                            id="model-config-content"
                            aria-labelledby="model-config-label"
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.22, ease: [0.2, 0, 0, 1] }}
                            style={{ overflow: 'hidden' }}
                        >
                            <div style={{ padding: 'var(--s4)', display: 'flex', flexDirection: 'column', gap: 'var(--s4)' }}>

                                {/* d_model */}
                                <ConfigField
                                    label="d_model"
                                    tooltip="Embedding dimension — the width of every vector"
                                    hint={`d_ff = ${config.dModel * 4}`}
                                >
                                    <SegmentedControl
                                        id="dmodel-control"
                                        options={D_MODEL_OPTIONS.map((v) => ({ value: v, label: String(v) }))}
                                        value={config.dModel}
                                        onChange={(v) => onChange?.({ dModel: v as number, dFF: (v as number) * 4 })}
                                    />
                                </ConfigField>

                                {/* n_heads */}
                                <ConfigField
                                    label="n_heads"
                                    tooltip="Number of attention heads (must divide d_model)"
                                    hint={
                                        !isValidConfig
                                            ? `⚠ ${config.dModel} ÷ ${config.nHeads} is not an integer`
                                            : `d_head = ${config.dModel / config.nHeads}`
                                    }
                                    error={!isValidConfig}
                                >
                                    <SegmentedControl
                                        id="nheads-control"
                                        options={N_HEADS_OPTIONS.map((v) => ({
                                            value: v,
                                            label: String(v),
                                            disabled: config.dModel % v !== 0,
                                        }))}
                                        value={config.nHeads}
                                        onChange={(v) => onChange?.({ nHeads: v as number })}
                                    />
                                </ConfigField>

                                {/* Seed */}
                                <ConfigField
                                    label="seed"
                                    tooltip="Random seed for deterministic weight initialization"
                                >
                                    <input
                                        id="seed-input"
                                        type="number"
                                        value={config.seed}
                                        min={0}
                                        max={9999}
                                        onChange={(e) => onChange?.({ seed: Number(e.target.value) })}
                                        aria-label="Random seed"
                                        style={{
                                            width: '100%',
                                            background: 'var(--bg)',
                                            border: '1px solid var(--stroke-dark)',
                                            borderRadius: 'var(--r-sm)',
                                            padding: 'var(--s2) var(--s3)',
                                            color: 'var(--primary)',
                                            fontFamily: 'var(--font-mono)',
                                            fontSize: 'var(--text-sm)',
                                            outline: 'none',
                                        }}
                                        onFocus={(e) => { e.target.style.borderColor = 'var(--ink)'; }}
                                        onBlur={(e) => { e.target.style.borderColor = 'var(--stroke-dark)'; }}
                                    />
                                </ConfigField>

                                {/* Config summary */}
                                <GlassCard padding="sm" animate={false}>
                                    <div style={{
                                        fontFamily: 'var(--font-mono)',
                                        fontSize: 'var(--text-xs)',
                                        color: 'var(--secondary)',
                                        lineHeight: 'var(--lead-loose)',
                                    }}>
                                        <div>d_model = <span style={{ color: 'var(--ink)' }}>{config.dModel}</span></div>
                                        <div>n_heads = <span style={{ color: 'var(--ink)' }}>{config.nHeads}</span></div>
                                        <div>d_head&nbsp; = <span style={{ color: 'var(--primary)' }}>{config.dModel / config.nHeads}</span></div>
                                        <div>d_ff&nbsp;&nbsp;&nbsp; = <span style={{ color: 'var(--primary)' }}>{config.dFF}</span></div>
                                        <div>seed&nbsp;&nbsp;&nbsp; = <span style={{ color: 'var(--muted)' }}>{config.seed}</span></div>
                                    </div>
                                </GlassCard>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </section>
        </div>
    );
}

// ─── ConfigField ──────────────────────────────────────────────────────────

function ConfigField({
    label,
    tooltip,
    hint,
    error,
    children,
}: {
    label: string;
    tooltip?: string;
    hint?: string;
    error?: boolean;
    children: React.ReactNode;
}) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--s1)' }}>
                <label htmlFor={`${label}-control`} style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 'var(--text-xs)',
                    color: error ? 'var(--ink)' : 'var(--secondary)',
                    userSelect: 'none',
                }}>
                    {label}
                </label>
                {tooltip && (
                    <span
                        role="tooltip"
                        aria-label={tooltip}
                        title={tooltip}
                        style={{
                            width: '14px',
                            height: '14px',
                            borderRadius: '50%',
                            background: 'var(--bg-raised)',
                            border: '1px solid var(--stroke-dark)',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '9px',
                            color: 'var(--muted)',
                            cursor: 'help',
                            flexShrink: 0,
                        }}
                    >
                        ?
                    </span>
                )}
            </div>
            {children}
            {hint && (
                <span style={{
                    fontSize: 'var(--text-xs)',
                    fontFamily: 'var(--font-mono)',
                    color: error ? 'var(--ink)' : 'var(--muted)',
                }}>
                    {hint}
                </span>
            )}
        </div>
    );
}

// ─── SegmentedControl ─────────────────────────────────────────────────────

function SegmentedControl({
    id,
    options,
    value,
    onChange,
}: {
    id: string;
    options: { value: number; label: string; disabled?: boolean }[];
    value: number;
    onChange: (v: number) => void;
}) {
    return (
        <div
            id={id}
            role="group"
            style={{
                display: 'flex',
                gap: 'var(--s1)',
                background: 'var(--bg)',
                border: '1px solid var(--stroke)',
                borderRadius: 'var(--r-md)',
                padding: '3px',
            }}
        >
            {options.map((opt) => (
                <button
                    key={opt.value}
                    aria-pressed={value === opt.value}
                    aria-label={`Set to ${opt.label}`}
                    disabled={opt.disabled}
                    onClick={() => !opt.disabled && onChange(opt.value)}
                    style={{
                        flex: 1,
                        padding: 'var(--s1) var(--s2)',
                        borderRadius: 'var(--r-sm)',
                        border: 'none',
                        background: value === opt.value ? 'var(--bg-inverse)' : 'transparent',
                        color: value === opt.value
                            ? 'var(--text-inverse)'
                            : opt.disabled
                                ? 'var(--stroke-dark)'
                                : 'var(--muted)',
                        fontSize: 'var(--text-xs)',
                        fontFamily: 'var(--font-mono)',
                        cursor: opt.disabled ? 'not-allowed' : 'pointer',
                        transition: `all var(--dur-fast) var(--ease-out)`,
                        minHeight: '30px',
                        outline: 'none',
                    }}
                >
                    {opt.label}
                </button>
            ))}
        </div>
    );
}
