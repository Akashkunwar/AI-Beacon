// src/components/pipeline/EmbeddingStep.tsx
// Step 4: Embedding lookup — each token ID is mapped to a d_model-dim vector.
// Simple Mode: token pills → lookup animation → colored vector bars → X matrix shape.

import { memo, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSimulatorStore } from '@/lib/store/simulatorStore';
import { GlassCard } from '@/components/shared';
import { ConceptCard } from '@/components/educational/ConceptCard';
import { TooltipEngine } from '@/components/educational/TooltipEngine';
import { VectorBar } from '@/components/visualizers/VectorBar';
import { ShapeLabel } from '@/components/visualizers/ShapeLabel';
import { FlowArrow } from '@/components/visualizers/FlowArrow';
import { TokenBadge, getTokenHue } from '@/components/visualizers/TokenBadge';
import { PipelineStep } from '@/lib/store/types';

// ─── EmbeddingStep ────────────────────────────────────────────────────────

export function EmbeddingStep() {
    const { tensors, config } = useSimulatorStore();
    const tokens = tensors.tokens?.raw ?? [];
    const ids = tensors.token_ids?.ids ?? [];
    const embed = tensors.embed;

    const hasData = embed != null && tokens.length > 0;

    // Convert embedding matrix to JS number[][] for rendering
    const matrix = useMemo(() => {
        if (!embed) return null;
        return embed.X.toMatrix();
    }, [embed]);

    // Global max-abs across all rows for consistent color scale
    const globalMaxAbs = useMemo(() => {
        if (!matrix) return 1;
        let m = 1e-6;
        for (const row of matrix) {
            for (const v of row) m = Math.max(m, Math.abs(v));
        }
        return m;
    }, [matrix]);

    return (
        <GlassCard padding="lg" aria-label="Embedding lookup step visualization">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

                {/* ── Step Header ─────────────────────────────────── */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                    <div style={stepNumberStyle}>04</div>
                    <div>
                        <TooltipEngine
                            content="Each token ID indexes into a learned embedding matrix W_e ∈ ℝ^(|V| × d_model), selecting a dense vector. Similar words are close in embedding space."
                            placement="bottom"
                        >
                            <h2 style={stepTitleStyle}>
                                Embedding Lookup
                                <span style={{ fontSize: '12px', color: 'var(--muted)', marginLeft: '8px', fontWeight: 400 }}>ⓘ</span>
                            </h2>
                        </TooltipEngine>
                        <p style={stepDescStyle}>
                            Each token ID selects a row from the embedding matrix W_e, giving it a {config.dModel}-dimensional vector.
                        </p>
                    </div>
                </div>

                {/* ── Main visualization ──────────────────────────── */}
                <AnimatePresence mode="wait">
                    {hasData && matrix ? (
                        <motion.div
                            key="embedding-content"
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4 }}
                            style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
                        >
                            {/* Token pills → lookup header */}
                            <div style={{
                                background: 'var(--bg-panel)',
                                border: '1px solid var(--bg-raised)',
                                borderRadius: '10px',
                                padding: '16px',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '16px',
                            }}>
                                {/* Token pills row */}
                                <div>
                                    <p style={sectionLabel}>Input token IDs</p>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
                                        {tokens.map((token, i) => (
                                            <div key={`tok-${i}`} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <TokenBadge
                                                    token={token}
                                                    id={ids[i]}
                                                    hue={getTokenHue(i)}
                                                    showId={true}
                                                    animate={true}
                                                    animateDelay={i * 0.08}
                                                />
                                                {i < tokens.length - 1 && (
                                                    <FlowArrow direction="right" animateDelay={0.2 + i * 0.08} />
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Down arrow */}
                                <div style={{ display: 'flex', justifyContent: 'center' }}>
                                    <FlowArrow direction="down" label="W_e[id] lookup" animateDelay={0.5} />
                                </div>

                                {/* Vector bars — one row per token */}
                                <div>
                                    <p style={sectionLabel}>Embedding vectors X — shape {embed.X.shapeStr()}</p>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                        {matrix.map((row, i) => (
                                            <motion.div
                                                key={`embed-row-${i}`}
                                                initial={{ opacity: 0, x: -8 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: 0.6 + i * 0.1, duration: 0.3 }}
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'flex-start',
                                                    gap: '12px',
                                                }}
                                            >
                                                {/* Token label */}
                                                <div style={{
                                                    width: '72px',
                                                    flexShrink: 0,
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    gap: '2px',
                                                    paddingTop: '4px',
                                                }}>
                                                    <span style={{
                                                        fontFamily: 'var(--font-mono)',
                                                        fontSize: '11px',
                                                        fontWeight: 700,
                                                        color: 'var(--ink)',
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                        whiteSpace: 'nowrap',
                                                    }}>
                                                        {tokens[i]}
                                                    </span>
                                                    <span style={{
                                                        fontFamily: 'var(--font-mono)',
                                                        fontSize: '9px',
                                                        color: 'var(--muted)',
                                                    }}>
                                                        id={ids[i]}
                                                    </span>
                                                </div>

                                                {/* VectorBar */}
                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                    <VectorBar
                                                        values={row}
                                                        maxAbs={globalMaxAbs}
                                                        barHeight={7}
                                                        animateDelay={0.65 + i * 0.1}
                                                        ariaLabel={`Embedding vector for token ${tokens[i]}`}
                                                    />
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* We weight matrix size info */}
                            <EmbeddingWeightInfo dModel={config.dModel} />

                        </motion.div>
                    ) : (
                        <motion.div
                            key="embedding-empty"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            style={{
                                padding: '32px',
                                textAlign: 'center',
                                fontFamily: 'var(--font-mono)',
                                fontSize: '12px',
                                color: 'var(--muted)',
                                background: 'var(--bg-panel)',
                                border: '1px dashed var(--bg-raised)',
                                borderRadius: '10px',
                            }}
                        >
                            Token IDs not yet available — step through tokenization first
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* ── Tensor shape labels ──────────────────────────── */}
                {hasData && embed && (
                    <motion.div
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.9, duration: 0.3 }}
                        style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}
                    >
                        <ShapeLabel
                            shape={embed.X.shape as number[]}
                            name="X (embeddings)"
                            animateDelay={0.9}
                        />
                        <ShapeLabel
                            shape={embed.We.shape as number[]}
                            name="W_e (weight matrix)"
                            color="var(--muted)"
                            animateDelay={1.0}
                        />
                        <ShapeLabel
                            shape={[embed.X.shape[0]]}
                            dtype="tokens"
                            name="sequence length"
                            color="var(--secondary)"
                            animateDelay={1.1}
                        />
                    </motion.div>
                )}

                {/* ── Concept Card ─────────────────────────────────── */}
                <ConceptCard stepId={PipelineStep.EMBEDDING} />
            </div>
        </GlassCard>
    );
}

// ─── EmbeddingWeightInfo ──────────────────────────────────────────────────

const EmbeddingWeightInfo = memo(function EmbeddingWeightInfo({
    dModel,
}: {
    dModel: number;
}) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1, duration: 0.3 }}
            style={{
                display: 'flex',
                gap: '8px',
                padding: '10px 14px',
                background: 'var(--bg-panel)',
                border: '1px solid var(--stroke)',
                borderRadius: '8px',
                alignItems: 'flex-start',
            }}
        >
            <span style={{ fontSize: '14px', lineHeight: 1.4, flexShrink: 0 }}>🎯</span>
            <p style={{ fontSize: '12px', color: 'var(--secondary)', lineHeight: 1.6, margin: 0 }}>
                <span style={{ color: 'var(--primary)', fontWeight: 600 }}>W_e</span> is the full embedding table with one row per vocabulary token.
                Each token ID selects its row — this is a lookup, not a matrix multiply.
                In real models (GPT-2: d_model=768, LLaMA-3: d_model=4096), W_e has billions of parameters.
                AI Beacon uses d_model={dModel}.
            </p>
        </motion.div>
    );
});

// ─── Local styles ──────────────────────────────────────────────────────────

const stepNumberStyle: React.CSSProperties = {
    width: '36px',
    height: '36px',
    borderRadius: '9px',
    background: 'var(--bg-raised)',
    border: '1px solid var(--stroke)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'var(--font-mono)',
    fontSize: '13px',
    color: 'var(--ink)',
    fontWeight: 700,
    flexShrink: 0,
};

const stepTitleStyle: React.CSSProperties = {
    fontSize: '18px',
    fontWeight: 600,
    color: 'var(--ink)',
    marginBottom: '3px',
    cursor: 'default',
};

const stepDescStyle: React.CSSProperties = {
    fontSize: '13px',
    color: 'var(--secondary)',
    lineHeight: 1.5,
};

const sectionLabel: React.CSSProperties = {
    fontFamily: 'var(--font-mono)',
    fontSize: '10px',
    color: 'var(--muted)',
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    marginBottom: '10px',
};
