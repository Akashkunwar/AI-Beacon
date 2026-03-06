// src/components/pipeline/PositionalEncodingStep.tsx
// Step 5: Positional Encoding — X_pos = X_embed + PE.
// Simple Mode: sinusoidal wave visual (SVG), before/after VectorBar comparison.

import { memo, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSimulatorStore } from '@/lib/store/simulatorStore';
import { GlassCard } from '@/components/shared';
import { ConceptCard } from '@/components/educational/ConceptCard';
import { TooltipEngine } from '@/components/educational/TooltipEngine';
import { VectorBar } from '@/components/visualizers/VectorBar';
import { ShapeLabel } from '@/components/visualizers/ShapeLabel';
import { FlowArrow } from '@/components/visualizers/FlowArrow';
import { PipelineStep } from '@/lib/store/types';

// ─── PositionalEncodingStep ───────────────────────────────────────────────

export function PositionalEncodingStep() {
    const { tensors, config } = useSimulatorStore();
    const tokens = tensors.tokens?.raw ?? [];
    const embed = tensors.embed;
    const posenc = tensors.posenc;

    const hasData = posenc != null && embed != null && tokens.length > 0;

    // Matrices for rendering: before and after
    const embedMatrix = useMemo(() => embed?.X.toMatrix() ?? null, [embed]);
    const xposMatrix = useMemo(() => posenc?.X_pos.toMatrix() ?? null, [posenc]);
    const peRow0 = useMemo(() => posenc ? posenc.PE.toMatrix()[0] : null, [posenc]);

    // Shared max-abs (X_pos) for consistent color scale across all three panels
    const globalMaxAbs = useMemo(() => {
        if (!xposMatrix) return 1;
        let m = 1e-6;
        for (const row of xposMatrix) for (const v of row) m = Math.max(m, Math.abs(v));
        return m;
    }, [xposMatrix]);

    // Pick the first token row for the detailed before/after view
    const rowIdx = 0;
    const embedRow0 = embedMatrix?.[rowIdx] ?? null;
    const xposRow0 = xposMatrix?.[rowIdx] ?? null;

    const nTokens = tokens.length;
    const dModel = config.dModel;

    return (
        <GlassCard padding="lg" aria-label="Positional encoding step visualization">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

                {/* ── Step Header ─────────────────────────────────── */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                    <div style={stepNumberStyle}>05</div>
                    <div>
                        <TooltipEngine
                            content="Sinusoidal position vectors PE are added element-wise to token embeddings: X_pos = X_embed + PE. This injects sequence order information — without it, attention is position-blind."
                            placement="bottom"
                        >
                            <h2 style={stepTitleStyle}>
                                Positional Encoding
                                <span style={{ fontSize: '12px', color: 'var(--muted)', marginLeft: '8px', fontWeight: 400 }}>ⓘ</span>
                            </h2>
                        </TooltipEngine>
                        <p style={stepDescStyle}>
                            Sinusoidal position signals are added to each token's embedding so the model knows token order.
                        </p>
                    </div>
                </div>

                {/* ── Main visualization ──────────────────────────── */}
                <AnimatePresence mode="wait">
                    {hasData && embedRow0 && peRow0 && xposRow0 ? (
                        <motion.div
                            key="pe-content"
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4 }}
                            style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
                        >
                            {/* Sinusoidal wave SVG */}
                            <SinusoidalWaveVis nTokens={nTokens} dModel={dModel} />

                            {/* Equation */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.4 }}
                                style={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    gap: '10px',
                                    alignItems: 'center',
                                    flexWrap: 'wrap',
                                }}
                            >
                                <span style={eqChip('var(--ink)')}>X_embed</span>
                                <span style={eqOpStyle}>+</span>
                                <span style={eqChip('var(--ink)')}>PE</span>
                                <span style={eqOpStyle}>=</span>
                                <span style={eqChip('var(--ink)')}>X_pos</span>
                            </motion.div>

                            {/* Before / PE / After comparison — first token */}
                            <div style={{
                                background: 'var(--bg-panel)',
                                border: '1px solid var(--bg-raised)',
                                borderRadius: '10px',
                                padding: '16px',
                            }}>
                                <p style={sectionLabel}>
                                    Token "{tokens[rowIdx]}" (position {rowIdx}) — dimension-by-dimension addition
                                </p>

                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: '1fr auto 1fr auto 1fr',
                                    gap: '12px',
                                    alignItems: 'start',
                                }}>
                                    {/* X_embed column */}
                                    <div>
                                        <p style={{ ...sectionLabel, color: 'var(--muted)', marginBottom: '8px' }}>X_embed</p>
                                        <VectorBar
                                            values={embedRow0}
                                            maxAbs={globalMaxAbs}
                                            barHeight={7}
                                            animateDelay={0.5}
                                            ariaLabel={`Embedding vector for "${tokens[rowIdx]}"`}
                                        />
                                    </div>

                                    {/* Plus sign */}
                                    <div style={{ display: 'flex', alignItems: 'center', height: '100%', paddingTop: '24px' }}>
                                        <motion.span
                                            initial={{ opacity: 0, scale: 0 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: 0.7, type: 'spring', stiffness: 300 }}
                                            style={{
                                                fontFamily: 'var(--font-mono)',
                                                fontSize: '20px',
                                                fontWeight: 700,
                                                color: 'var(--muted)',
                                                lineHeight: 1,
                                            }}
                                        >
                                            +
                                        </motion.span>
                                    </div>

                                    {/* PE column */}
                                    <div>
                                        <p style={{ ...sectionLabel, color: 'var(--muted)', marginBottom: '8px' }}>PE[pos={rowIdx}]</p>
                                        <VectorBar
                                            values={peRow0}
                                            maxAbs={globalMaxAbs}
                                            barHeight={7}
                                            animateDelay={0.6}
                                            ariaLabel={`Positional encoding for position ${rowIdx}`}
                                        />
                                    </div>

                                    {/* Equals sign */}
                                    <div style={{ display: 'flex', alignItems: 'center', height: '100%', paddingTop: '24px' }}>
                                        <motion.span
                                            initial={{ opacity: 0, scale: 0 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: 0.85, type: 'spring', stiffness: 300 }}
                                            style={{
                                                fontFamily: 'var(--font-mono)',
                                                fontSize: '20px',
                                                fontWeight: 700,
                                                color: 'var(--muted)',
                                                lineHeight: 1,
                                            }}
                                        >
                                            =
                                        </motion.span>
                                    </div>

                                    {/* X_pos column */}
                                    <div>
                                        <p style={{ ...sectionLabel, color: 'var(--muted)', marginBottom: '8px' }}>X_pos[0]</p>
                                        <VectorBar
                                            values={xposRow0}
                                            maxAbs={globalMaxAbs}
                                            barHeight={7}
                                            animateDelay={0.75}
                                            ariaLabel={`Position-encoded vector for "${tokens[rowIdx]}"`}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* All-token X_pos overview */}
                            {nTokens > 1 && xposMatrix && (
                                <AllTokensView
                                    tokens={tokens}
                                    xposMatrix={xposMatrix}
                                    globalMaxAbs={globalMaxAbs}
                                />
                            )}

                            {/* PE formula info box */}
                            <PEFormulaBox />

                        </motion.div>
                    ) : (
                        <motion.div
                            key="pe-empty"
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
                            Embeddings not yet available — run embedding lookup first
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* ── Tensor shape labels ──────────────────────────── */}
                {hasData && posenc && (
                    <motion.div
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.1, duration: 0.3 }}
                        style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}
                    >
                        <ShapeLabel
                            shape={posenc.PE.shape as number[]}
                            name="PE"
                            color="var(--muted)"
                            animateDelay={1.1}
                        />
                        <ShapeLabel
                            shape={posenc.X_pos.shape as number[]}
                            name="X_pos (output)"
                            color="var(--muted)"
                            animateDelay={1.2}
                        />
                    </motion.div>
                )}

                {/* ── Flow arrow to next step ──────────────────────── */}
                {hasData && (
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <FlowArrow direction="down" label="→ Self-Attention" animateDelay={1.3} />
                    </div>
                )}

                {/* ── Concept Card ─────────────────────────────────── */}
                <ConceptCard stepId={PipelineStep.POSITIONAL_ENCODING} />
            </div>
        </GlassCard>
    );
}

// ─── SinusoidalWaveVis ────────────────────────────────────────────────────
// SVG visualization of the PE sinusoidal waves for each token position.

const SinusoidalWaveVis = memo(function SinusoidalWaveVis({
    nTokens,
    dModel,
}: {
    nTokens: number;
    dModel: number;
}) {
    // We'll visualize the first few sine dimensions across all token positions
    const dimsToShow = Math.min(dModel, 8);
    const svgWidth = 480;
    const svgHeight = 120;
    const padX = 28;
    const padY = 12;
    const innerW = svgWidth - padX * 2;
    const innerH = svgHeight - padY * 2;

    // Muted, low-saturation viz-palette colors — solid lines, each dim gets a distinct color.
    const dimStyles = [
        { color: 'var(--viz-1)', dash: 'none', width: '2' },    // slate blue
        { color: 'var(--viz-2)', dash: 'none', width: '1.5' },  // sage green
        { color: 'var(--viz-3)', dash: 'none', width: '1.5' },  // terracotta
        { color: 'var(--viz-4)', dash: 'none', width: '1.5' },  // dusty plum
        { color: 'var(--viz-5)', dash: 'none', width: '1.5' },  // steel teal
        { color: 'var(--viz-1)', dash: 'none', width: '1' },    // slate blue (thin)
        { color: 'var(--viz-2)', dash: 'none', width: '1' },    // sage green (thin)
        { color: 'var(--viz-3)', dash: 'none', width: '1' },    // terracotta (thin)
    ];

    // Build paths: for each dim d, plot PE[pos][d] across pos=0..nTokens-1
    // Use many interpolation points for smooth curves using the analytical formula
    const paths: { d: string; style: typeof dimStyles[0]; dim: number }[] = [];
    const nPoints = Math.max(nTokens * 10, 40);

    for (let dimIdx = 0; dimIdx < dimsToShow; dimIdx++) {
        const pts: string[] = [];
        for (let p = 0; p <= nPoints; p++) {
            const pos = (p / nPoints) * (nTokens - 1);
            const i = dimIdx;
            const angle = pos / Math.pow(10000, (2 * Math.floor(i / 2)) / dModel);
            const val = i % 2 === 0 ? Math.sin(angle) : Math.cos(angle);
            // Map val ∈ [-1,1] to y coordinate
            const x = padX + (p / nPoints) * innerW;
            const y = padY + innerH / 2 - (val * innerH * 0.42);
            pts.push(`${p === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`);
        }
        paths.push({ d: pts.join(' '), style: dimStyles[dimIdx % dimStyles.length], dim: dimIdx });
    }

    // Token position markers
    const posXs = Array.from({ length: nTokens }, (_, i) =>
        padX + (i / Math.max(nTokens - 1, 1)) * innerW
    );

    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            style={{
                background: 'var(--bg-panel)',
                border: '1px solid var(--bg-raised)',
                borderRadius: '10px',
                padding: '12px',
                overflow: 'hidden',
            }}
        >
            <p style={{ ...sectionLabel, marginBottom: '8px' }}>
                Sinusoidal PE — {dimsToShow} of {dModel} dimensions shown
            </p>
            <svg
                width="100%"
                viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                aria-label={`Sinusoidal positional encoding waves for ${nTokens} tokens`}
                style={{ display: 'block', overflow: 'visible' }}
            >
                {/* Center baseline */}
                <line
                    x1={padX} y1={svgHeight / 2}
                    x2={svgWidth - padX} y2={svgHeight / 2}
                    stroke="var(--bg-raised)" strokeWidth="1"
                />

                {/* Wave paths and their clip paths for animation */}
                <defs>
                    {paths.map(({ dim }) => (
                        <clipPath id={`clip-dim-${dim}`} key={`clip-${dim}`}>
                            <motion.rect
                                x={0}
                                y={0}
                                height={svgHeight}
                                initial={{ width: 0 }}
                                animate={{ width: svgWidth }}
                                transition={{ duration: 1.0, delay: 0.3 + dim * 0.06, ease: 'easeOut' }}
                            />
                        </clipPath>
                    ))}
                </defs>

                {paths.map(({ d, style, dim }) => (
                    <motion.path
                        key={dim}
                        d={d}
                        fill="none"
                        stroke={style.color}
                        strokeWidth={style.width}
                        strokeDasharray={style.dash !== 'none' ? style.dash : undefined}
                        strokeOpacity="0.85"
                        strokeLinecap={style.dash === '1,3' ? 'round' : 'butt'}
                        clipPath={`url(#clip-dim-${dim})`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.85 }}
                        transition={{ duration: 0.2, delay: 0.3 + dim * 0.06 }}
                    />
                ))}

                {/* Token position markers */}
                {posXs.map((x, i) => (
                    <g key={`pos-${i}`}>
                        <motion.line
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.9 + i * 0.05 }}
                            x1={x} y1={padY}
                            x2={x} y2={svgHeight - padY}
                            stroke="var(--stroke)"
                            strokeWidth="1"
                            strokeDasharray="3,3"
                        />
                        <motion.text
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1.0 + i * 0.05 }}
                            x={x} y={svgHeight - 1}
                            textAnchor="middle"
                            fontSize="8"
                            fill="var(--ink)"
                            fontFamily="monospace"
                        >
                            pos{i}
                        </motion.text>
                    </g>
                ))}
            </svg>

            {/* Legend */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '8px' }}>
                {paths.slice(0, 4).map(({ style, dim }) => (
                    <div key={dim} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <svg width="16" height="4" viewBox="0 0 16 4" style={{ overflow: 'visible' }}>
                            <line
                                x1="0" y1="2" x2="16" y2="2"
                                stroke={style.color}
                                strokeWidth={style.width}
                                strokeDasharray={style.dash}
                                strokeLinecap={style.dash === '1,3' ? 'round' : 'butt'}
                            />
                        </svg>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--muted)' }}>
                            dim {dim} ({dim % 2 === 0 ? 'sin' : 'cos'})
                        </span>
                    </div>
                ))}
                {dimsToShow > 4 && (
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--muted)' }}>
                        +{dimsToShow - 4} more
                    </span>
                )}
            </div>
        </motion.div>
    );
});

// ─── AllTokensView ────────────────────────────────────────────────────────
// Compact overview of X_pos for all tokens.

const AllTokensView = memo(function AllTokensView({
    tokens,
    xposMatrix,
    globalMaxAbs,
}: {
    tokens: string[];
    xposMatrix: number[][];
    globalMaxAbs: number;
}) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            style={{
                background: 'var(--bg-panel)',
                border: '1px solid var(--stroke)',
                borderRadius: '10px',
                padding: '16px',
            }}
        >
            <p style={{ ...sectionLabel, color: 'var(--muted)', marginBottom: '12px' }}>
                X_pos — all {tokens.length} tokens
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {xposMatrix.map((row, i) => (
                    <div key={`xpos-${i}`} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <span style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: '10px',
                            color: 'var(--muted)',
                            width: '64px',
                            flexShrink: 0,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                        }}>
                            {tokens[i]}
                        </span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <VectorBar
                                values={row}
                                maxAbs={globalMaxAbs}
                                barHeight={6}
                                animateDelay={1.0 + i * 0.08}
                                ariaLabel={`X_pos vector for token "${tokens[i]}"`}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </motion.div>
    );
});

// ─── PEFormulaBox ─────────────────────────────────────────────────────────

const PEFormulaBox = memo(function PEFormulaBox() {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.0 }}
            style={{
                padding: '12px 16px',
                background: 'var(--bg-panel)',
                border: '1px solid var(--stroke)',
                borderRadius: '8px',
            }}
        >
            <p style={{ ...sectionLabel, color: 'var(--muted)', marginBottom: '8px' }}>
                Sinusoidal formula
            </p>
            <pre style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                color: 'var(--secondary)',
                margin: 0,
                lineHeight: 1.7,
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
            }}>
                {`PE(pos, 2i)   = sin(pos / 10000^(2i/d_model))
PE(pos, 2i+1) = cos(pos / 10000^(2i/d_model))

X_pos = X_embed + PE   ← elementwise add`}
            </pre>
        </motion.div>
    );
});

// ─── Helpers ──────────────────────────────────────────────────────────────

function eqChip(color: string): React.CSSProperties {
    return {
        fontFamily: 'var(--font-mono)',
        fontSize: '13px',
        fontWeight: 700,
        color,
        background: `${color}18`,
        border: `1px solid ${color}30`,
        borderRadius: '6px',
        padding: '3px 10px',
    };
}

const eqOpStyle: React.CSSProperties = {
    fontFamily: 'var(--font-mono)',
    fontSize: '16px',
    fontWeight: 700,
    color: 'var(--muted)',
};

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
