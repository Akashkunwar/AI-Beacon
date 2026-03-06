// src/components/training/Step03Architecture.tsx
// Module 02 — Step 03: Architecture Design
// Four sections: Overview | Interactive Configurator | Attention Explainer | Timeline
// Rules: tokens.css only · greyscale UI · --viz-* for charts · ErrorBoundary · prefers-reduced-motion

import { useState, useMemo, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ErrorBoundary } from '@/components/shared/ErrorBoundary';

// ─── Types ────────────────────────────────────────────────────────────────────

type AttentionType = 'MHA' | 'GQA' | 'MQA';
type PosEncoding = 'RoPE' | 'ALiBi' | 'Learned' | 'Sinusoidal';
type Normalization = 'Pre-LN (RMSNorm)' | 'Post-LN' | 'RMSNorm';
type Activation = 'SwiGLU' | 'GELU' | 'ReLU';

interface ArchConfig {
    nLayers: number;
    dModel: number;
    nHeads: number;
    attentionType: AttentionType;
    kvHeads: number;
    posEncoding: PosEncoding;
    normalization: Normalization;
    activation: Activation;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const D_MODEL_OPTIONS = [512, 1024, 2048, 4096, 8192] as const;
const N_HEADS_OPTIONS = [8, 16, 32, 64] as const;
const KV_HEAD_OPTIONS = [1, 2, 4, 8] as const;
const POS_OPTIONS: PosEncoding[] = ['RoPE', 'ALiBi', 'Learned', 'Sinusoidal'];
const NORM_OPTIONS: Normalization[] = ['Pre-LN (RMSNorm)', 'Post-LN', 'RMSNorm'];
const ACT_OPTIONS: Activation[] = ['SwiGLU', 'GELU', 'ReLU'];
const VOCAB_SIZE = 32_000;

// Reference models for "Similar to" display
const REFERENCE_MODELS: { name: string; params: number }[] = [
    { name: 'GPT-2 (117M)', params: 117e6 },
    { name: 'GPT-2 Medium (345M)', params: 345e6 },
    { name: 'GPT-2 Large (762M)', params: 762e6 },
    { name: 'GPT-2 XL (1.5B)', params: 1.5e9 },
    { name: 'GPT-3 (175B)', params: 175e9 },
    { name: 'LLaMA-7B', params: 7e9 },
    { name: 'LLaMA-13B', params: 13e9 },
    { name: 'LLaMA-65B', params: 65e9 },
    { name: 'Mistral-7B', params: 7.2e9 },
];

// Architecture timeline entries
const TIMELINE = [
    { year: '2017', name: 'Original Transformer', norm: 'Post-LN', attn: 'MHA', pos: 'Sinusoidal', act: 'GELU', note: '' },
    { year: '2019', name: 'GPT-2', norm: 'Pre-LN', attn: 'MHA', pos: 'Learned', act: 'GELU', note: '' },
    { year: '2020', name: 'GPT-3', norm: 'Pre-LN', attn: 'MHA', pos: 'Learned', act: 'GELU', note: '175B params' },
    { year: '2022', name: 'PaLM', norm: 'Pre-LN', attn: 'MQA', pos: 'RoPE', act: 'SwiGLU', note: '' },
    { year: '2023', name: 'LLaMA', norm: 'Pre-LN', attn: 'MHA→GQA', pos: 'RoPE', act: 'SwiGLU', note: 'RMSNorm' },
    { year: '2023', name: 'Mistral', norm: 'Pre-LN', attn: 'GQA', pos: 'RoPE', act: 'SwiGLU', note: 'Sliding Window' },
    { year: '2024', name: 'LLaMA 3', norm: 'Pre-LN', attn: 'GQA', pos: 'RoPE', act: 'SwiGLU', note: '128k vocab' },
];

// ─── Parameter Math ───────────────────────────────────────────────────────────

function computeStats(cfg: ArchConfig) {
    const { nLayers, dModel, nHeads, attentionType, kvHeads, activation } = cfg;
    const dHead = dModel / nHeads;
    const dFf = dModel * 4;

    // Attention params per layer (Q, K, V, O projections)
    const nKv = attentionType === 'MHA' ? nHeads : attentionType === 'GQA' ? kvHeads : 1;
    const attnParamsPerLayer =
        dModel * dModel +          // Q: d_model → d_model
        nKv * dHead * dModel +      // K
        nKv * dHead * dModel +      // V
        dModel * dModel;            // O

    // FFN params per layer
    const ffnMultiplier = activation === 'SwiGLU' ? 3 : 2;
    const ffnParamsPerLayer = ffnMultiplier * dModel * dFf;

    // Norm params (2 per layer: attn + ffn)
    const normParamsPerLayer = 2 * dModel;

    // Total (layers × (attn + ffn + norm) + vocab embedding)
    const totalParams =
        nLayers * (attnParamsPerLayer + ffnParamsPerLayer + normParamsPerLayer) +
        VOCAB_SIZE * dModel;

    const attnParams = nLayers * attnParamsPerLayer;
    const ffnParams = nLayers * ffnParamsPerLayer;

    // KV cache per token (BF16 = 2 bytes per element)
    const kvCachePerToken = 2 * nKv * dHead * 2; // bytes
    const kvCachePerTokenMB = (kvCachePerToken * nLayers) / (1024 * 1024);

    // Context memory at 4k tokens
    const context4kGB = (kvCachePerTokenMB * 4096) / 1024;

    // Training FLOPs approximation: ~6 × N × D (order of magnitude for 300B tokens)
    const trainTokens = 300e9;
    const trainFLOPs = 6 * totalParams * trainTokens;
    const flopsExp = Math.floor(Math.log10(trainFLOPs));

    // Best matching reference model
    let bestMatch = REFERENCE_MODELS[0];
    let minRatio = Infinity;
    for (const ref of REFERENCE_MODELS) {
        const ratio = Math.abs(Math.log10(totalParams / ref.params));
        if (ratio < minRatio) { minRatio = ratio; bestMatch = ref; }
    }

    return {
        totalParams,
        attnParams,
        ffnParams,
        kvCachePerTokenMB,
        context4kGB,
        flopsExp,
        bestMatch: bestMatch.name,
        dFf,
        nKv,
    };
}

function fmtParams(n: number): string {
    if (n >= 1e9) return `${(n / 1e9).toFixed(1)}B`;
    if (n >= 1e6) return `${(n / 1e6).toFixed(0)}M`;
    return `${(n / 1e3).toFixed(0)}K`;
}

// ─── Shared styles ────────────────────────────────────────────────────────────

const SECTION_STYLE: React.CSSProperties = {
    marginBottom: 'var(--s7)',
};

const PANEL_STYLE: React.CSSProperties = {
    background: 'var(--bg-panel)',
    border: '1px solid var(--stroke)',
    borderRadius: 'var(--r-lg)',
    padding: 'var(--s5)',
    boxShadow: 'var(--shadow-soft)',
};

const LABEL_MONO: React.CSSProperties = {
    fontFamily: 'var(--font-mono)',
    fontSize: 'var(--text-xs)',
    color: 'var(--muted)',
    textTransform: 'uppercase' as const,
    letterSpacing: 'var(--tracking-wider)',
    margin: 0,
};

// ─── Toggle Group ─────────────────────────────────────────────────────────────

interface ToggleGroupProps<T extends string> {
    options: readonly T[];
    value: T;
    onChange: (v: T) => void;
    id: string;
}

function ToggleGroup<T extends string>({ options, value, onChange, id }: ToggleGroupProps<T>) {
    return (
        <div
            role="group"
            aria-label={id}
            style={{
                display: 'flex',
                gap: 'var(--s1)',
                flexWrap: 'wrap' as const,
            }}
        >
            {options.map((opt) => {
                const active = opt === value;
                return (
                    <button
                        key={opt}
                        id={`${id}-${opt}`}
                        onClick={() => onChange(opt)}
                        aria-pressed={active}
                        style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: 'var(--text-xs)',
                            padding: 'var(--s1) var(--s3)',
                            borderRadius: 'var(--r-sm)',
                            border: active ? '1px solid var(--ink)' : '1px solid var(--stroke-dark)',
                            background: active ? 'var(--bg-inverse)' : 'var(--bg)',
                            color: active ? 'var(--text-inverse)' : 'var(--secondary)',
                            cursor: 'pointer',
                            transition: 'all var(--dur-fast) var(--ease-out)',
                            minHeight: '32px',
                        }}
                        onMouseEnter={(e) => {
                            if (!active) {
                                e.currentTarget.style.background = 'var(--bg-raised)';
                                e.currentTarget.style.color = 'var(--ink)';
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (!active) {
                                e.currentTarget.style.background = 'var(--bg)';
                                e.currentTarget.style.color = 'var(--secondary)';
                            }
                        }}
                    >
                        {opt}
                    </button>
                );
            })}
        </div>
    );
}

// ─── Select Dropdown ──────────────────────────────────────────────────────────

interface SelectProps<T extends string | number> {
    options: readonly T[];
    value: T;
    onChange: (v: T) => void;
    id: string;
}

function SelectField<T extends string | number>({ options, value, onChange, id }: SelectProps<T>) {
    return (
        <select
            id={id}
            value={value}
            onChange={(e) => {
                const raw = e.target.value;
                const parsed = (typeof value === 'number' ? Number(raw) : raw) as T;
                onChange(parsed);
            }}
            style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 'var(--text-xs)',
                color: 'var(--primary)',
                background: 'var(--bg)',
                border: '1px solid var(--stroke-dark)',
                borderRadius: 'var(--r-sm)',
                padding: 'var(--s1) var(--s3)',
                cursor: 'pointer',
                minHeight: '32px',
                appearance: 'auto',
            }}
        >
            {options.map((opt) => (
                <option key={String(opt)} value={opt}>
                    {opt}
                </option>
            ))}
        </select>
    );
}

// ─── Slider Row ───────────────────────────────────────────────────────────────

interface SliderRowProps {
    label: string;
    value: number;
    min: number;
    max: number;
    step: number;
    onChange: (v: number) => void;
    id: string;
    display?: string;
}

function SliderRow({ label, value, min, max, step, onChange, id, display }: SliderRowProps) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <label
                    htmlFor={id}
                    style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--muted)' }}
                >
                    {label}
                </label>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)', color: 'var(--ink)', fontWeight: 'var(--weight-medium)' }}>
                    {display ?? value}
                </span>
            </div>
            <input
                id={id}
                type="range"
                min={min}
                max={max}
                step={step}
                value={value}
                onChange={(e) => onChange(Number(e.target.value))}
                aria-label={label}
                style={{ width: '100%', accentColor: 'var(--ink)', cursor: 'pointer' }}
            />
        </div>
    );
}

// ─── Stat Row ─────────────────────────────────────────────────────────────────

interface StatRowProps {
    label: string;
    value: string;
    sub?: string;
}

function StatRow({ label, value, sub }: StatRowProps) {
    return (
        <div
            style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline',
                padding: 'var(--s2) 0',
                borderBottom: '1px solid var(--stroke)',
            }}
        >
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>
                {label}
            </span>
            <span style={{ textAlign: 'right' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)', color: 'var(--ink)', fontWeight: 'var(--weight-medium)' }}>
                    {value}
                </span>
                {sub && (
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-2xs)', color: 'var(--muted)', marginLeft: 'var(--s2)' }}>
                        {sub}
                    </span>
                )}
            </span>
        </div>
    );
}

// ─── Section 1 — Overview ─────────────────────────────────────────────────────

function OverviewSection() {
    return (
        <section aria-labelledby="arch-overview-heading" style={SECTION_STYLE}>
            <p style={{ ...LABEL_MONO, marginBottom: 'var(--s3)' }}>STEP 03 — ARCHITECTURE DESIGN</p>
            <h1
                id="arch-overview-heading"
                style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: 'var(--text-2xl)',
                    fontWeight: 'var(--weight-semibold)',
                    color: 'var(--ink)',
                    lineHeight: 'var(--lead-tight)',
                    letterSpacing: 'var(--tracking-snug)',
                    margin: '0 0 var(--s4)',
                }}
            >
                Every parameter is a decision.<br />
                Decisions here can't be undone.
            </h1>
            <p
                style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: 'var(--text-base)',
                    color: 'var(--secondary)',
                    lineHeight: 'var(--lead-body)',
                    maxWidth: '62ch',
                    margin: 0,
                }}
            >
                Architecture is locked before training begins. Every hyperparameter — the number of
                layers, hidden dimension, attention mechanism — is set in stone before a single gradient
                flows. Changing it later doesn't mean fine-tuning: it means throwing everything away
                and starting over. This is why architecture design is one of the most consequential
                decisions in the entire LLM pipeline.
            </p>
        </section>
    );
}

// ─── Section 2 — Interactive Architecture Configurator ───────────────────────

function ConfiguratorSection({ shouldReduceMotion }: { shouldReduceMotion: boolean }) {
    const [cfg, setCfg] = useState<ArchConfig>({
        nLayers: 12,
        dModel: 1024,
        nHeads: 16,
        attentionType: 'MHA',
        kvHeads: 4,
        posEncoding: 'RoPE',
        normalization: 'Pre-LN (RMSNorm)',
        activation: 'SwiGLU',
    });

    // Clamp nHeads to be ≤ dModel / 64 (min d_head = 64)
    const validNHeads = useMemo(
        () => N_HEADS_OPTIONS.filter((h) => h <= cfg.dModel / 64),
        [cfg.dModel],
    );

    const set = useCallback(<K extends keyof ArchConfig>(key: K, val: ArchConfig[K]) => {
        setCfg((prev) => {
            const next = { ...prev, [key]: val };
            // Auto-fix nHeads if it's no longer valid for new dModel
            if (key === 'dModel') {
                const maxHeads = (val as number) / 64;
                if (next.nHeads > maxHeads) {
                    next.nHeads = N_HEADS_OPTIONS.filter((h) => h <= maxHeads).slice(-1)[0] ?? 8;
                }
            }
            return next;
        });
    }, []);

    const stats = useMemo(() => computeStats(cfg), [cfg]);

    const animProps = shouldReduceMotion
        ? {}
        : { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.15 } };

    return (
        <section aria-labelledby="arch-config-heading" style={SECTION_STYLE}>
            <h2
                id="arch-config-heading"
                style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 'var(--text-xs)',
                    color: 'var(--muted)',
                    textTransform: 'uppercase',
                    letterSpacing: 'var(--tracking-wider)',
                    margin: '0 0 var(--s4)',
                    fontWeight: 'var(--weight-regular)',
                }}
            >
                Interactive Architecture Configurator
            </h2>

            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                    gap: 'var(--s4)',
                    alignItems: 'start',
                }}
            >
                {/* Left — Controls */}
                <div style={{ ...PANEL_STYLE, display: 'flex', flexDirection: 'column', gap: 'var(--s4)' }}>

                    {/* n_layers */}
                    <SliderRow
                        id="cfg-nlayers"
                        label="n_layers"
                        value={cfg.nLayers}
                        min={12}
                        max={96}
                        step={12}
                        onChange={(v) => set('nLayers', v)}
                    />

                    {/* d_model */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s1)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                            <label
                                htmlFor="cfg-dmodel"
                                style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--muted)' }}
                            >
                                d_model
                            </label>
                        </div>
                        <SelectField
                            id="cfg-dmodel"
                            options={D_MODEL_OPTIONS}
                            value={cfg.dModel}
                            onChange={(v) => set('dModel', v)}
                        />
                    </div>

                    {/* n_heads */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s1)' }}>
                        <label
                            htmlFor="cfg-nheads"
                            style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--muted)' }}
                        >
                            n_heads
                        </label>
                        <SelectField
                            id="cfg-nheads"
                            options={validNHeads.length ? validNHeads : [8]}
                            value={cfg.nHeads}
                            onChange={(v) => set('nHeads', v)}
                        />
                    </div>

                    {/* d_ff — read-only */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>
                            d_ff <span style={{ color: 'var(--stroke-dark)' }}>(auto = 4 × d_model)</span>
                        </span>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)', color: 'var(--ink)' }}>
                            {stats.dFf.toLocaleString()}
                        </span>
                    </div>

                    <div style={{ borderTop: '1px solid var(--stroke)', paddingTop: 'var(--s3)', display: 'flex', flexDirection: 'column', gap: 'var(--s3)' }}>
                        {/* Attention type */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s1)' }}>
                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>
                                Attention type
                            </span>
                            <ToggleGroup<AttentionType>
                                id="cfg-attn"
                                options={['MHA', 'GQA', 'MQA']}
                                value={cfg.attentionType}
                                onChange={(v) => set('attentionType', v)}
                            />
                        </div>

                        {/* KV heads — only show for GQA */}
                        {cfg.attentionType === 'GQA' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s1)', paddingLeft: 'var(--s3)', borderLeft: '2px solid var(--stroke-dark)' }}>
                                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>
                                    KV heads (GQA groups)
                                </span>
                                <SelectField
                                    id="cfg-kvheads"
                                    options={KV_HEAD_OPTIONS}
                                    value={cfg.kvHeads}
                                    onChange={(v) => set('kvHeads', v)}
                                />
                            </div>
                        )}

                        {/* Position encoding */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s1)' }}>
                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>
                                Position encoding
                            </span>
                            <ToggleGroup<PosEncoding>
                                id="cfg-pos"
                                options={POS_OPTIONS}
                                value={cfg.posEncoding}
                                onChange={(v) => set('posEncoding', v)}
                            />
                        </div>

                        {/* Normalization */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s1)' }}>
                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>
                                Normalization
                            </span>
                            <ToggleGroup<Normalization>
                                id="cfg-norm"
                                options={NORM_OPTIONS}
                                value={cfg.normalization}
                                onChange={(v) => set('normalization', v)}
                            />
                        </div>

                        {/* Activation */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s1)' }}>
                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>
                                Activation
                            </span>
                            <ToggleGroup<Activation>
                                id="cfg-act"
                                options={ACT_OPTIONS}
                                value={cfg.activation}
                                onChange={(v) => set('activation', v)}
                            />
                        </div>
                    </div>
                </div>

                {/* Right — Live Stats */}
                <div style={{ ...PANEL_STYLE, position: 'relative' }}>
                    {/* Live badge */}
                    <div
                        style={{
                            position: 'absolute',
                            top: 'var(--s4)',
                            right: 'var(--s4)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 'var(--s1)',
                            fontFamily: 'var(--font-mono)',
                            fontSize: 'var(--text-2xs)',
                            color: 'var(--muted)',
                        }}
                    >
                        <span
                            style={{
                                width: '6px',
                                height: '6px',
                                borderRadius: '50%',
                                background: 'var(--ink)',
                                display: 'inline-block',
                                animation: shouldReduceMotion ? 'none' : 'live-pulse 2s ease-in-out infinite',
                            }}
                            aria-hidden="true"
                        />
                        live
                    </div>

                    <h3
                        style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: 'var(--text-xs)',
                            color: 'var(--muted)',
                            textTransform: 'uppercase',
                            letterSpacing: 'var(--tracking-wider)',
                            margin: '0 0 var(--s4)',
                            fontWeight: 'var(--weight-regular)',
                        }}
                    >
                        Computed Stats
                    </h3>

                    <motion.div key={`${cfg.nLayers}-${cfg.dModel}-${cfg.nHeads}-${cfg.attentionType}-${cfg.kvHeads}-${cfg.activation}`} {...animProps}>
                        <StatRow label="Total parameters" value={fmtParams(stats.totalParams)} />
                        <StatRow label="Attention parameters" value={fmtParams(stats.attnParams)} />
                        <StatRow label="FFN parameters" value={fmtParams(stats.ffnParams)} />
                        <StatRow
                            label="KV cache per token"
                            value={`${stats.kvCachePerTokenMB.toFixed(3)} MB`}
                        />
                        <StatRow
                            label="Context memory @ 4k tokens"
                            value={`${stats.context4kGB.toFixed(2)} GB`}
                        />
                        <StatRow
                            label="Approx training FLOPs"
                            value={`~10^${stats.flopsExp}`}
                            sub="(300B tokens)"
                        />
                    </motion.div>

                    {/* Similar to */}
                    <div
                        style={{
                            marginTop: 'var(--s4)',
                            paddingTop: 'var(--s3)',
                            borderTop: '1px solid var(--stroke)',
                        }}
                    >
                        <p
                            style={{
                                fontFamily: 'var(--font-mono)',
                                fontSize: 'var(--text-xs)',
                                color: 'var(--muted)',
                                margin: 0,
                            }}
                        >
                            Similar to:{' '}
                            <span style={{ color: 'var(--ink)', fontWeight: 'var(--weight-medium)' }}>
                                {stats.bestMatch}
                            </span>
                        </p>
                    </div>
                </div>
            </div>

            {/* CSS keyframes for live pulse */}
            <style>{`
                @keyframes live-pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.3; }
                }
                @media (prefers-reduced-motion: reduce) {
                    @keyframes live-pulse { 0%, 100% { opacity: 1; } }
                }
            `}</style>
        </section>
    );
}

// ─── Attention Head SVG Diagrams ──────────────────────────────────────────────

function AttentionSVG({ type }: { type: 'MHA' | 'GQA' | 'MQA' }) {
    // Show 8 Q heads, varying K/V heads
    const nQ = 8;
    const nKV = type === 'MHA' ? 8 : type === 'GQA' ? 2 : 1;
    const colW = 22;
    const svgW = Math.max(nQ, nKV) * colW + 60;
    const svgH = 110;
    const qY = 20;
    const kvY = 85;

    // Q head positions
    const qX = (i: number) => 20 + i * colW;
    // KV head positions (centered)
    const kvOffset = (svgW - 40 - nKV * colW) / 2;
    const kvXPos = (i: number) => 20 + kvOffset + i * colW;

    // Lines from each Q to its KV group
    const lines: { x1: number; y1: number; x2: number; y2: number }[] = [];
    for (let q = 0; q < nQ; q++) {
        const kvIdx = Math.floor((q / nQ) * nKV);
        lines.push({ x1: qX(q), y1: qY + 7, x2: kvXPos(kvIdx), y2: kvY - 7 });
    }

    return (
        <svg
            width={svgW}
            height={svgH}
            viewBox={`0 0 ${svgW} ${svgH}`}
            aria-label={`${type} attention head mapping diagram`}
            style={{ display: 'block', margin: '0 auto' }}
        >
            {/* Connection lines */}
            {lines.map((l, i) => (
                <line
                    key={i}
                    x1={l.x1}
                    y1={l.y1}
                    x2={l.x2}
                    y2={l.y2}
                    stroke="var(--stroke-dark)"
                    strokeWidth="1"
                    opacity="0.6"
                />
            ))}
            {/* Q heads */}
            {Array.from({ length: nQ }).map((_, i) => (
                <g key={`q${i}`}>
                    <circle cx={qX(i)} cy={qY} r="6" fill="var(--ink)" />
                    {i === 0 && (
                        <text x={qX(i) - 4} y={qY - 12} fontFamily="var(--font-mono)" fontSize="9" fill="var(--muted)">
                            Q
                        </text>
                    )}
                </g>
            ))}
            {/* KV heads */}
            {Array.from({ length: nKV }).map((_, i) => (
                <g key={`kv${i}`}>
                    <circle cx={kvXPos(i)} cy={kvY} r="6" fill="var(--stroke-dark)" stroke="var(--ink)" strokeWidth="1.5" />
                    {i === 0 && (
                        <text x={kvXPos(i) - 4} y={kvY + 20} fontFamily="var(--font-mono)" fontSize="9" fill="var(--muted)">
                            K/V
                        </text>
                    )}
                </g>
            ))}
        </svg>
    );
}

// ─── Section 3 — Attention Type Explainer ─────────────────────────────────────

function AttentionExplainerSection() {
    const cards = [
        {
            type: 'MHA' as const,
            title: 'Multi-Head Attention',
            subtitle: '8Q → 8K, 8V',
            desc: 'Every query head has its own key and value head. Maximum expressiveness, maximum memory cost.',
            kvPct: 100,
        },
        {
            type: 'GQA' as const,
            title: 'Grouped Query Attention',
            subtitle: '8Q → 2K, 2V',
            desc: 'Groups of query heads share key/value heads. Balances quality and memory — used in LLaMA 2/3, Mistral.',
            kvPct: 25,
        },
        {
            type: 'MQA' as const,
            title: 'Multi-Query Attention',
            subtitle: '8Q → 1K, 1V',
            desc: 'All query heads share a single key/value head. Minimal KV cache, but can reduce model quality.',
            kvPct: 12.5,
        },
    ];

    return (
        <section aria-labelledby="arch-attn-heading" style={SECTION_STYLE}>
            <h2
                id="arch-attn-heading"
                style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 'var(--text-xs)',
                    color: 'var(--muted)',
                    textTransform: 'uppercase',
                    letterSpacing: 'var(--tracking-wider)',
                    margin: '0 0 var(--s4)',
                    fontWeight: 'var(--weight-regular)',
                }}
            >
                Attention Type Explainer
            </h2>

            {/* Cards */}
            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                    gap: 'var(--s4)',
                    marginBottom: 'var(--s5)',
                }}
            >
                {cards.map((card) => (
                    <article
                        key={card.type}
                        aria-label={card.title}
                        style={{
                            ...PANEL_STYLE,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 'var(--s3)',
                        }}
                    >
                        <div style={{ paddingBottom: 'var(--s2)', borderBottom: '1px solid var(--stroke)' }}>
                            <AttentionSVG type={card.type} />
                        </div>
                        <div>
                            <p
                                style={{
                                    fontFamily: 'var(--font-mono)',
                                    fontSize: 'var(--text-xs)',
                                    color: 'var(--ink)',
                                    fontWeight: 'var(--weight-medium)',
                                    margin: '0 0 var(--s1)',
                                }}
                            >
                                {card.type} — {card.title}
                            </p>
                            <p
                                style={{
                                    fontFamily: 'var(--font-mono)',
                                    fontSize: 'var(--text-2xs)',
                                    color: 'var(--muted)',
                                    margin: '0 0 var(--s2)',
                                }}
                            >
                                {card.subtitle}
                            </p>
                            <p
                                style={{
                                    fontFamily: 'var(--font-sans)',
                                    fontSize: 'var(--text-xs)',
                                    color: 'var(--secondary)',
                                    lineHeight: 'var(--lead-body)',
                                    margin: 0,
                                }}
                            >
                                {card.desc}
                            </p>
                        </div>
                    </article>
                ))}
            </div>

            {/* KV Cache bar comparison */}
            <div style={PANEL_STYLE}>
                <p style={{ ...LABEL_MONO, marginBottom: 'var(--s3)' }}>KV Cache comparison (relative)</p>
                {cards.map((card) => (
                    <div
                        key={card.type}
                        style={{
                            display: 'grid',
                            gridTemplateColumns: '3.5rem 1fr 3rem',
                            alignItems: 'center',
                            gap: 'var(--s3)',
                            marginBottom: 'var(--s2)',
                        }}
                    >
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-2xs)', color: 'var(--muted)' }}>
                            {card.type}
                        </span>
                        <div
                            aria-label={`${card.type} KV cache: ${card.kvPct}%`}
                            style={{
                                height: '10px',
                                background: 'var(--stroke)',
                                borderRadius: 'var(--r-pill)',
                                overflow: 'hidden',
                            }}
                        >
                            <div
                                style={{
                                    height: '100%',
                                    width: `${card.kvPct}%`,
                                    background: 'var(--viz-1)',
                                    borderRadius: 'var(--r-pill)',
                                    transition: 'width var(--dur-base) var(--ease-out)',
                                }}
                            />
                        </div>
                        <span
                            style={{
                                fontFamily: 'var(--font-mono)',
                                fontSize: 'var(--text-2xs)',
                                color: 'var(--ink)',
                                textAlign: 'right',
                            }}
                        >
                            {card.kvPct}%
                        </span>
                    </div>
                ))}
            </div>
        </section>
    );
}

// ─── Section 4 — Architecture Evolution Timeline ─────────────────────────────

function TimelineSection({ shouldReduceMotion }: { shouldReduceMotion: boolean }) {
    return (
        <section aria-labelledby="arch-timeline-heading" style={SECTION_STYLE}>
            <h2
                id="arch-timeline-heading"
                style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 'var(--text-xs)',
                    color: 'var(--muted)',
                    textTransform: 'uppercase',
                    letterSpacing: 'var(--tracking-wider)',
                    margin: '0 0 var(--s5)',
                    fontWeight: 'var(--weight-regular)',
                }}
            >
                Architecture Evolution Timeline
            </h2>

            <div style={{ position: 'relative', paddingLeft: '2.5rem' }}>
                {/* Vertical line */}
                <div
                    aria-hidden="true"
                    style={{
                        position: 'absolute',
                        left: '8px',
                        top: '8px',
                        bottom: '8px',
                        width: '1px',
                        background: 'var(--stroke)',
                    }}
                />

                {TIMELINE.map((entry, i) => (
                    <motion.div
                        key={`${entry.year}-${entry.name}`}
                        initial={shouldReduceMotion ? false : { opacity: 0, x: -8 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: '-40px' }}
                        transition={{ delay: i * 0.05, duration: 0.25, ease: [0.2, 0, 0, 1] }}
                        style={{ position: 'relative', marginBottom: 'var(--s5)' }}
                    >
                        {/* Circle marker */}
                        <div
                            aria-hidden="true"
                            style={{
                                position: 'absolute',
                                left: '-2.35rem',
                                top: '4px',
                                width: '8px',
                                height: '8px',
                                borderRadius: '50%',
                                background: 'var(--ink)',
                                border: '2px solid var(--bg)',
                                boxShadow: '0 0 0 1px var(--ink)',
                            }}
                        />

                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--s2)', alignItems: 'baseline' }}>
                            <span
                                style={{
                                    fontFamily: 'var(--font-mono)',
                                    fontSize: 'var(--text-xs)',
                                    color: 'var(--muted)',
                                    minWidth: '2.5rem',
                                }}
                            >
                                {entry.year}
                            </span>
                            <span
                                style={{
                                    fontFamily: 'var(--font-sans)',
                                    fontSize: 'var(--text-base)',
                                    color: 'var(--ink)',
                                    fontWeight: 'var(--weight-semibold)',
                                }}
                            >
                                {entry.name}
                            </span>
                            {entry.note && (
                                <span
                                    style={{
                                        fontFamily: 'var(--font-mono)',
                                        fontSize: 'var(--text-2xs)',
                                        color: 'var(--muted)',
                                        background: 'var(--bg-raised)',
                                        border: '1px solid var(--stroke)',
                                        borderRadius: 'var(--r-pill)',
                                        padding: '0 var(--s2)',
                                    }}
                                >
                                    {entry.note}
                                </span>
                            )}
                        </div>

                        <div
                            style={{
                                display: 'flex',
                                flexWrap: 'wrap',
                                gap: 'var(--s2)',
                                marginTop: 'var(--s2)',
                            }}
                        >
                            {[entry.norm, entry.attn, entry.pos, entry.act].map((tag) => (
                                <span
                                    key={tag}
                                    style={{
                                        fontFamily: 'var(--font-mono)',
                                        fontSize: 'var(--text-2xs)',
                                        color: 'var(--secondary)',
                                        background: 'var(--bg-panel)',
                                        border: '1px solid var(--stroke)',
                                        borderRadius: 'var(--r-xs)',
                                        padding: '2px var(--s2)',
                                    }}
                                >
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </motion.div>
                ))}
            </div>
        </section>
    );
}

// ─── Root Export ──────────────────────────────────────────────────────────────

interface Step03ArchitectureProps {
    stepNumber: number;
    totalSteps: number;
    onNext: () => void;
    onPrev: () => void;
}

export function Step03Architecture({ onNext: _onNext, onPrev: _onPrev }: Step03ArchitectureProps) {
    // Detect prefers-reduced-motion
    const [reducedMotion, setReducedMotion] = useState(false);

    useEffect(() => {
        const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
        setReducedMotion(mq.matches);
        const handler = () => setReducedMotion(mq.matches);
        mq.addEventListener('change', handler);
        return () => mq.removeEventListener('change', handler);
    }, []);

    return (
        <ErrorBoundary>
            <article
                aria-label="Step 03: Architecture Design"
                style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                }}
            >
                <OverviewSection />
                <ConfiguratorSection shouldReduceMotion={reducedMotion} />
                <AttentionExplainerSection />
                <TimelineSection shouldReduceMotion={reducedMotion} />
            </article>
        </ErrorBoundary>
    );
}
