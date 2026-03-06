// src/components/pipeline/AttentionStep.tsx
// Step 6: Self-Attention — shown across four sub-views (6a → 6d).
// Math is fully computed by stepMachine.ts. This component only visualizes
// the tensors stored in tensors.attention.
//
// Sub-views:
//   6a  Q/K/V Projections   — X_pos × WQ/WK/WV → Q, K, V
//   6b  Scaled Dot-Product  — Q·Kᵀ/√d_k raw scores heatmap
//   6c  Causal Mask         — masked scores → softmax weights heatmap
//   6d  Output              — attention weights × V → attn_output

import { memo, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSimulatorStore } from '@/lib/store/simulatorStore';
import { GlassCard } from '@/components/shared';
import { ConceptCard } from '@/components/educational/ConceptCard';
import { TooltipEngine } from '@/components/educational/TooltipEngine';
import { ShapeLabel } from '@/components/visualizers/ShapeLabel';
import { VectorBar } from '@/components/visualizers/VectorBar';
import { AttentionHeatmap } from '@/components/visualizers/AttentionHeatmap';
import { PipelineStep } from '@/lib/store/types';
import type { TensorRegistry } from '@/lib/store/types';

// Extract the attention sub-registry type directly from TensorRegistry
type AttnTensors = NonNullable<TensorRegistry['attention']>;

// ─── Sub-view ID type ────────────────────────────────────────────────────────

type SubView = '6a' | '6b' | '6c' | '6d';

const SUB_VIEWS: { id: SubView; label: string; description: string }[] = [
    { id: '6a', label: 'Q / K / V', description: 'Linear projections from X_pos' },
    { id: '6b', label: 'Scores', description: 'Q·Kᵀ / √d_k dot-product' },
    { id: '6c', label: 'Mask', description: 'Causal mask → attention weights' },
    { id: '6d', label: 'Output', description: 'Weights · V → attention output' },
];

// ─── AttentionStep ───────────────────────────────────────────────────────────

export function AttentionStep() {
    const { tensors, config } = useSimulatorStore();
    const attn = tensors.attention;
    const tokens = tensors.tokens?.raw ?? [];

    const [activeView, setActiveView] = useState<SubView>('6a');

    const hasData = attn != null && tokens.length > 0;

    return (
        <GlassCard padding="lg" aria-label="Self-attention step visualization">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

                {/* ── Step Header ──────────────────────────────────────── */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                    <div style={stepNumberStyle}>06</div>
                    <div>
                        <TooltipEngine
                            content="Self-attention lets every token query all other tokens. It computes Q, K, V matrices, then attention weights via softmax(QKᵀ/√d_k), and finally a weighted sum of V."
                            placement="bottom"
                        >
                            <h2 style={stepTitleStyle}>
                                Self-Attention
                                <span style={{ fontSize: '12px', color: 'var(--muted)', marginLeft: '8px', fontWeight: 400 }}>ⓘ</span>
                            </h2>
                        </TooltipEngine>
                        <p style={stepDescStyle}>
                            Each token attends to every other token using Query, Key, and Value projections.
                            Causal masking ensures tokens cannot look ahead.
                        </p>
                    </div>
                </div>

                {/* ── Sub-view tab pills ───────────────────────────────── */}
                <div
                    role="tablist"
                    aria-label="Attention sub-steps"
                    style={{
                        display: 'flex',
                        gap: '6px',
                        flexWrap: 'wrap',
                    }}
                >
                    {SUB_VIEWS.map((sv: { id: SubView; label: string; description: string }) => {
                        const isActive = activeView === sv.id;
                        return (
                            <button
                                key={sv.id}
                                role="tab"
                                aria-selected={isActive}
                                onClick={() => setActiveView(sv.id)}
                                style={{
                                    padding: '6px 14px',
                                    borderRadius: '20px',
                                    border: isActive
                                        ? '1px solid var(--ink)'
                                        : '1px solid var(--stroke)',
                                    background: isActive
                                        ? 'var(--bg-raised)'
                                        : 'var(--bg-panel)',
                                    color: isActive
                                        ? 'var(--ink)'
                                        : 'var(--muted)',
                                    fontFamily: 'var(--font-mono)',
                                    fontSize: '11px',
                                    fontWeight: isActive ? 600 : 400,
                                    cursor: 'pointer',
                                    boxShadow: isActive ? 'none' : 'none',
                                    transition: 'all 0.18s ease',
                                    whiteSpace: 'nowrap',
                                }}
                            >
                                <span style={{ opacity: 0.6, marginRight: '4px' }}>{sv.id}</span>
                                {sv.label}
                            </button>
                        );
                    })}
                </div>

                {/* ── Main visualization area ──────────────────────────── */}
                <AnimatePresence mode="wait">
                    {hasData ? (
                        <motion.div
                            key={`attn-content-${activeView}`}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.25 }}
                        >
                            {activeView === '6a' && (
                                <SubViewQKV
                                    attn={attn!}
                                    tokens={tokens}
                                    dModel={config.dModel}
                                />
                            )}
                            {activeView === '6b' && (
                                <SubViewScores attn={attn!} tokens={tokens} />
                            )}
                            {activeView === '6c' && (
                                <SubViewMask attn={attn!} tokens={tokens} />
                            )}
                            {activeView === '6d' && (
                                <SubViewOutput attn={attn!} tokens={tokens} dModel={config.dModel} />
                            )}
                        </motion.div>
                    ) : (
                        <motion.div
                            key="attn-empty"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            style={emptyStateStyle}
                        >
                            Positional encodings not yet computed —<br />
                            step through earlier pipeline stages first
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* ── Concept Card ─────────────────────────────────────── */}
                <ConceptCard stepId={PipelineStep.ATTENTION} />
            </div>
        </GlassCard>
    );
}

// ─── Sub-view 6a: Q / K / V Projections ─────────────────────────────────────

const SubViewQKV = memo(function SubViewQKV({
    attn,
    tokens,
    dModel,
}: {
    attn: AttnTensors;
    tokens: string[];
    dModel: number;
}) {
    const matrices = useMemo(() => ({
        Q: attn.Q.toMatrix(),
        K: attn.K.toMatrix(),
        V: attn.V.toMatrix(),
    }), [attn]);

    // Shared max-abs for consistent color scale across Q/K/V
    const globalMax = useMemo(() => {
        let m = 1e-6;
        for (const mat of [matrices.Q, matrices.K, matrices.V]) {
            for (const row of mat) for (const v of row) m = Math.max(m, Math.abs(v as number));
        }
        return m;
    }, [matrices]);

    const projections = useMemo(() => [
        { key: 'Q', mat: matrices.Q, label: 'Q (Queries)', color: 'var(--secondary)', note: 'X_pos · WQ', shape: attn.Q.shape as number[] },
        { key: 'K', mat: matrices.K, label: 'K (Keys)', color: 'var(--secondary)', note: 'X_pos · WK', shape: attn.K.shape as number[] },
        { key: 'V', mat: matrices.V, label: 'V (Values)', color: 'var(--secondary)', note: 'X_pos · WV', shape: attn.V.shape as number[] },
    ], [matrices, attn]);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <InlineNote icon="🔑">
                Three weight matrices <b>W_Q</b>, <b>W_K</b>, <b>W_V</b> each project X_pos from
                d_model={dModel} → d_head={attn.Q.shape[1]}. Each row is one token's query, key, or value vector.
            </InlineNote>

            {projections.map((proj: { key: string; mat: number[][]; label: string; color: string; note: string; shape: number[]; }, pi: number) => (
                <motion.div
                    key={proj.key}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: pi * 0.1, duration: 0.3 }}
                    style={{
                        background: 'var(--bg-panel)',
                        border: '1px solid var(--stroke)',
                        borderRadius: '10px',
                        padding: '14px',
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: proj.color, fontWeight: 700 }}>
                                {proj.label}
                            </span>
                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--muted)' }}>
                                = {proj.note}
                            </span>
                        </div>
                        <ShapeLabel shape={proj.shape} name="" color={proj.color} animateDelay={0.1 + pi * 0.1} />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {proj.mat.map((row: number[], ri: number) => (
                            <div key={ri} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <span style={{
                                    fontFamily: 'var(--font-mono)',
                                    fontSize: '10px',
                                    color: 'var(--secondary)',
                                    width: '56px',
                                    flexShrink: 0,
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                }}>
                                    {tokens[ri] ?? `tok${ri}`}
                                </span>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <VectorBar
                                        values={row}
                                        maxAbs={globalMax}
                                        barHeight={6}
                                        animateDelay={0.15 + pi * 0.08 + ri * 0.04}
                                        ariaLabel={`${proj.key} vector for token ${tokens[ri]}`}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            ))}

            {/* Weight matrix shapes */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}
            >
                <ShapeLabel shape={attn.WQ.shape as number[]} name="WQ" color="var(--muted)" animateDelay={0.5} />
                <ShapeLabel shape={attn.WK.shape as number[]} name="WK" color="var(--muted)" animateDelay={0.55} />
                <ShapeLabel shape={attn.WV.shape as number[]} name="WV" color="var(--muted)" animateDelay={0.6} />
            </motion.div>
        </div>
    );
});

// ─── Sub-view 6b: Scaled Dot-Product Scores ─────────────────────────────────

const SubViewScores = memo(function SubViewScores({
    attn,
    tokens,
}: {
    attn: AttnTensors;
    tokens: string[];
}) {
    const scoreMatrix = useMemo(() => attn.scores.toMatrix(), [attn]);
    const dHead = attn.Q.shape[1];
    const sqrtDk = Math.sqrt(dHead);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <InlineNote icon="📐">
                Raw dot products Q·Kᵀ scaled by 1/√d_k = 1/√{dHead} ≈ {(1 / sqrtDk).toFixed(3)}.
                Scaling prevents softmax saturation when d_head is large.
            </InlineNote>

            {/* Score heatmap */}
            <div style={{
                background: 'var(--bg-panel)',
                border: '1px solid var(--bg-raised)',
                borderRadius: '10px',
                padding: '16px',
                overflowX: 'auto',
            }}>
                <AttentionHeatmap
                    weights={scoreMatrixNormalized(scoreMatrix)}
                    tokens={tokens}
                    title={`Raw scores (Q·Kᵀ / √${dHead}) — shape ${attn.scores.shapeStr()}`}
                    animateDelay={0.1}
                    ariaLabel="Attention score heatmap before masking"
                    showMask={false}
                />
            </div>

            {/* Equation */}
            <div style={equationBoxStyle}>
                <code style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--ink)' }}>
                    scores[i,j] = Q[i] · K[j] / √d_k
                </code>
                <span style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '4px' }}>
                    Each cell = how much token i's query matches token j's key
                </span>
            </div>

            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <ShapeLabel shape={attn.scores.shape as number[]} name="scores" animateDelay={0.3} />
                <ShapeLabel shape={attn.Q.shape as number[]} name="Q" color="var(--muted)" animateDelay={0.35} />
                <ShapeLabel shape={attn.K.shape as number[]} name="K" color="var(--muted)" animateDelay={0.4} />
            </div>
        </div>
    );
});

// ─── Sub-view 6c: Causal Mask → Attention Weights ────────────────────────────

const SubViewMask = memo(function SubViewMask({
    attn,
    tokens,
}: {
    attn: AttnTensors;
    tokens: string[];
}) {
    const weightMatrix = useMemo(() => attn.weights.toMatrix(), [attn]);
    const n = tokens.length;

    // Verify sum-to-1 for UI display
    const rowSums = useMemo(() =>
        weightMatrix.map((row: number[]) => row.reduce((a: number, b: number) => a + b, 0)),
        [weightMatrix]
    );

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <InlineNote icon="🔒">
                The upper triangle is masked (tokens cannot attend to future positions).
                After masking, softmax ensures each row of attention weights sums to 1.
            </InlineNote>

            {/* Weights heatmap with masking overlay */}
            <div style={{
                background: 'var(--bg-panel)',
                border: '1px solid var(--bg-raised)',
                borderRadius: '10px',
                padding: '16px',
                overflowX: 'auto',
            }}>
                <AttentionHeatmap
                    weights={weightMatrix}
                    tokens={tokens}
                    title={`Attention weights after softmax — shape ${attn.weights.shapeStr()}`}
                    animateDelay={0.1}
                    ariaLabel="Attention weight heatmap with causal mask applied"
                    showMask={true}
                />
            </div>

            {/* Row-sum verification badges */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <p style={sectionLabel}>Row sums (must = 1.000)</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {rowSums.map((sum: number, i: number) => {
                        const ok = Math.abs(sum - 1.0) < 0.001;
                        return (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.3 + i * 0.06 }}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    padding: '4px 10px',
                                    background: ok ? 'var(--bg-raised)' : 'var(--bg-panel)',
                                    border: `1px solid ${ok ? 'var(--stroke-dark)' : 'var(--stroke-dark)'}`,
                                    borderRadius: '20px',
                                    fontFamily: 'var(--font-mono)',
                                    fontSize: '10px',
                                }}
                            >
                                <span style={{ color: 'var(--secondary)' }}>
                                    {tokens[i] ?? `tok${i}`}
                                </span>
                                <span style={{ color: ok ? 'var(--ink)' : 'var(--ink)' }}>
                                    {sum.toFixed(4)}
                                </span>
                                <span style={{ color: ok ? 'var(--ink)' : 'var(--ink)' }}>
                                    {ok ? '✓' : '✗'}
                                </span>
                            </motion.div>
                        );
                    })}
                </div>
            </div>

            {/* Equation */}
            <div style={equationBoxStyle}>
                <code style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--ink)' }}>
                    mask[i,j] = −1e9 for j {'>'} i  (future positions)
                </code>
                <code style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--secondary)', marginTop: '4px' }}>
                    weights = softmax(scores + mask, dim=1)
                </code>
            </div>

            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <ShapeLabel shape={[n, n]} name="mask" color="var(--muted)" animateDelay={0.4} />
                <ShapeLabel shape={attn.weights.shape as number[]} name="weights" animateDelay={0.45} />
            </div>
        </div>
    );
});

// ─── Sub-view 6d: Attention Output ──────────────────────────────────────────

const SubViewOutput = memo(function SubViewOutput({
    attn,
    tokens,
    dModel,
}: {
    attn: AttnTensors;
    tokens: string[];
    dModel: number;
}) {
    const outputMatrix = useMemo(() => attn.multihead_out.toMatrix(), [attn]);

    const globalMax = useMemo(() => {
        let m = 1e-6;
        for (const row of outputMatrix) for (const v of row) m = Math.max(m, Math.abs(v as number));
        return m;
    }, [outputMatrix]);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <InlineNote icon="🎯">
                Attention weights determine how much of each value vector to mix.
                The output projection W_O maps from d_head back to d_model={dModel},
                ready for the residual connection.
            </InlineNote>

            {/* Output vector grid */}
            <div style={{
                background: 'var(--bg-panel)',
                border: '1px solid var(--bg-raised)',
                borderRadius: '10px',
                padding: '14px',
            }}>
                <p style={{ ...sectionLabel, marginBottom: '12px' }}>
                    Attention output — shape {attn.multihead_out.shapeStr()}
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {outputMatrix.map((row: number[], ri: number) => (
                        <motion.div
                            key={ri}
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 + ri * 0.08, duration: 0.3 }}
                            style={{ display: 'flex', alignItems: 'center', gap: '10px' }}
                        >
                            <span style={{
                                fontFamily: 'var(--font-mono)',
                                fontSize: '10px',
                                color: 'var(--secondary)',
                                width: '56px',
                                flexShrink: 0,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                            }}>
                                {tokens[ri] ?? `tok${ri}`}
                            </span>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <VectorBar
                                    values={row}
                                    maxAbs={globalMax}
                                    barHeight={6}
                                    animateDelay={0.15 + ri * 0.05}
                                    ariaLabel={`Attention output for token ${tokens[ri]}`}
                                />
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Computation path */}
            <div style={equationBoxStyle}>
                <code style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--ink)' }}>
                    ctx = weights · V   # (n,n) × (n,d_head) → (n,d_head)
                </code>
                <code style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--secondary)', marginTop: '4px' }}>
                    out = ctx · WO      # (n,d_head) × (d_head,d_model) → (n,d_model)
                </code>
            </div>

            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <ShapeLabel shape={attn.weights.shape as number[]} name="weights" animateDelay={0.4} />
                <ShapeLabel shape={attn.V.shape as number[]} name="V" color="var(--muted)" animateDelay={0.45} />
                <ShapeLabel shape={attn.WO.shape as number[]} name="WO" color="var(--muted)" animateDelay={0.5} />
                <ShapeLabel shape={attn.multihead_out.shape as number[]} name="output" color="var(--ink)" animateDelay={0.55} />
            </div>
        </div>
    );
});

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Min-max normalize a raw score matrix to [0, 1] for heatmap display.
 * Attention weights are already [0,1] but raw scores can be any range.
 */
function scoreMatrixNormalized(matrix: number[][]): number[][] {
    let min = Infinity, max = -Infinity;
    for (const row of matrix)
        for (const v of row) {
            if (v < min) min = v;
            if (v > max) max = v;
        }
    const range = max - min || 1;
    return matrix.map(row => row.map(v => (v - min) / range));
}

/** Inline educational note with an emoji icon */
function InlineNote({ icon, children }: { icon: string; children: React.ReactNode }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            style={{
                display: 'flex',
                gap: '10px',
                padding: '10px 14px',
                background: 'var(--bg-panel)',
                border: '1px solid var(--bg-raised)',
                borderRadius: '8px',
                alignItems: 'flex-start',
            }}
        >
            <span style={{ fontSize: '15px', flexShrink: 0, lineHeight: 1.5 }}>{icon}</span>
            <p style={{ fontSize: '12px', color: 'var(--secondary)', lineHeight: 1.65, margin: 0 }}>
                {children}
            </p>
        </motion.div>
    );
}

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
    boxShadow: 'none',
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
    margin: 0,
};

const equationBoxStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    padding: '10px 14px',
    background: 'var(--bg-panel)',
    border: '1px solid var(--bg-raised)',
    borderRadius: '8px',
};

const emptyStateStyle: React.CSSProperties = {
    padding: '40px 32px',
    textAlign: 'center',
    fontFamily: 'var(--font-mono)',
    fontSize: '12px',
    color: 'var(--muted)',
    background: 'var(--bg-panel)',
    border: '1px dashed var(--bg-raised)',
    borderRadius: '10px',
    lineHeight: 1.8,
};
