// src/components/pipeline/TokenIDStep.tsx
// Step 3: Tokens gain integer ID badges with vocab table highlight.

import { motion } from 'framer-motion';
import { useSimulatorStore } from '@/lib/store/simulatorStore';
import { GlassCard } from '@/components/shared';
import { ConceptCard } from '@/components/educational/ConceptCard';
import { TooltipEngine } from '@/components/educational/TooltipEngine';
import { TokenBadge, getTokenHue } from '@/components/visualizers/TokenBadge';
import { FlowArrow } from '@/components/visualizers/FlowArrow';
import { PipelineStep } from '@/lib/store/types';
import { VOCAB_SIZE } from '@/lib/tokenizer/vocab';

// ─── TokenIDStep ──────────────────────────────────────────────────────────

export function TokenIDStep() {
    const { tensors } = useSimulatorStore();
    const tokens = tensors.tokens?.raw ?? [];
    const ids = tensors.token_ids?.ids ?? [];

    const hasData = tokens.length > 0 && ids.length === tokens.length;

    return (
        <GlassCard padding="lg" aria-label="Token ID mapping step visualization">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {/* ── Step Header ───────────────────────────────────── */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                    <div style={stepNumberStyle}>03</div>
                    <div>
                        <TooltipEngine
                            content="Each token string is looked up in the vocabulary table to get its integer ID. The embedding layer uses these IDs to select the corresponding vector row."
                            placement="bottom"
                        >
                            <h2 style={stepTitleStyle}>
                                Token ID Mapping
                                <span style={{ fontSize: '12px', color: 'var(--muted)', marginLeft: '8px', fontWeight: 400 }}>
                                    ⓘ
                                </span>
                            </h2>
                        </TooltipEngine>
                        <p style={stepDescStyle}>
                            Each token string is mapped to its integer ID from the {VOCAB_SIZE}-token vocabulary.
                        </p>
                    </div>
                </div>

                {/* ── Tokens + ID badges ────────────────────────────── */}
                <div style={{
                    background: 'var(--bg-panel)',
                    border: '1px solid var(--bg-raised)',
                    borderRadius: '10px',
                    padding: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '20px',
                }}>
                    {/* Token → ID visualization */}
                    {hasData ? (
                        <>
                            <div>
                                <p style={sectionLabel}>Tokens with vocabulary IDs</p>
                                <div style={{
                                    display: 'flex',
                                    flexWrap: 'wrap',
                                    gap: '14px',
                                    alignItems: 'flex-start',
                                }}>
                                    {tokens.map((token, i) => (
                                        <div key={`${token}-${i}`} style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                                            <TokenBadge
                                                token={token}
                                                id={ids[i]}
                                                hue={getTokenHue(i)}
                                                showId={true}
                                                animate={true}
                                                animateDelay={i * 0.1}
                                            />
                                            {i < tokens.length - 1 && (
                                                <div style={{ marginTop: '8px' }}>
                                                    <FlowArrow direction="right" animateDelay={0.2 + i * 0.1} />
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Flow arrow down to vocab table */}
                            <div style={{ display: 'flex', justifyContent: 'center' }}>
                                <FlowArrow direction="down" label="vocab lookup" animateDelay={0.4} />
                            </div>

                            {/* Vocab lookup table */}
                            <VocabTable tokens={tokens} ids={ids} />
                        </>
                    ) : (
                        <div style={{
                            padding: '24px',
                            textAlign: 'center',
                            fontFamily: 'var(--font-mono)',
                            fontSize: '12px',
                            color: 'var(--muted)',
                            background: 'var(--bg-panel)',
                            border: '1px dashed var(--bg-raised)',
                            borderRadius: '8px',
                        }}>
                            Tokens not yet available — step through tokenization first
                        </div>
                    )}
                </div>

                {/* ── Tensor shape label ────────────────────────────── */}
                {hasData && (
                    <motion.div
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6, duration: 0.3 }}
                        style={{
                            display: 'flex',
                            gap: '12px',
                            flexWrap: 'wrap',
                        }}
                    >
                        <ShapeChip label="Token IDs" shape={`(${ids.length},) int`} />
                        <ShapeChip label="Vocab size" shape={`${VOCAB_SIZE} entries`} color="var(--primary)" />
                        <ShapeChip label="Next step" shape="Embedding lookup" color="var(--secondary)" />
                    </motion.div>
                )}

                {/* ── Concept Card ──────────────────────────────────── */}
                <ConceptCard stepId={PipelineStep.TOKEN_IDS} />
            </div>
        </GlassCard>
    );
}

// ─── VocabTable ───────────────────────────────────────────────────────────

function VocabTable({ tokens, ids }: { tokens: string[]; ids: number[] }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.3 }}
            aria-label="Vocabulary lookup table"
        >
            <p style={{ ...sectionLabel, marginBottom: '8px' }}>Vocabulary lookup</p>
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'auto 1fr auto auto',
                gap: '0',
                border: '1px solid var(--stroke)',
                borderRadius: '8px',
                overflow: 'hidden',
            }}>
                {/* Header */}
                {['#', 'Token', 'ID', 'Status'].map((h) => (
                    <div key={h} style={{
                        padding: '6px 12px',
                        background: 'var(--bg-raised)',
                        borderBottom: '1px solid var(--bg-raised)',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '9px',
                        color: 'var(--muted)',
                        letterSpacing: '0.06em',
                        textTransform: 'uppercase',
                        fontWeight: 600,
                    }}>
                        {h}
                    </div>
                ))}

                {/* Rows — one per token */}
                {tokens.map((token, i) => {
                    const id = ids[i];
                    const isUnknown = id === 0;
                    const color = 'var(--ink)';
                    const bgColor = 'var(--bg-raised)';

                    return [
                        /* Index */
                        <motion.div
                            key={`idx-${i}`}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.55 + i * 0.07 }}
                            style={tableCellStyle}
                        >
                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--muted)' }}>
                                {i + 1}
                            </span>
                        </motion.div>,

                        /* Token string */
                        <motion.div
                            key={`tok-${i}`}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.55 + i * 0.07 }}
                            style={tableCellStyle}
                        >
                            <span style={{
                                fontFamily: 'var(--font-mono)',
                                fontSize: '12px',
                                color,
                                fontWeight: 600,
                                background: bgColor,
                                padding: '1px 6px',
                                borderRadius: '4px',
                            }}>
                                {token}
                            </span>
                        </motion.div>,

                        /* ID */
                        <motion.div
                            key={`id-${i}`}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.6 + i * 0.07 }}
                            style={tableCellStyle}
                        >
                            <span style={{
                                fontFamily: 'var(--font-mono)',
                                fontSize: '12px',
                                color: isUnknown ? 'var(--ink)' : 'var(--ink)',
                                fontWeight: 700,
                            }}>
                                {id}
                            </span>
                        </motion.div>,

                        /* Status */
                        <motion.div
                            key={`status-${i}`}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.65 + i * 0.07 }}
                            style={tableCellStyle}
                        >
                            <span style={{
                                fontFamily: 'var(--font-mono)',
                                fontSize: '10px',
                                padding: '2px 6px',
                                borderRadius: '3px',
                                background: 'var(--bg-raised)',
                                color: 'var(--ink)',
                                border: '1px solid var(--stroke)',
                            }}>
                                {isUnknown ? '⚠ <unk>' : '✓ known'}
                            </span>
                        </motion.div>,
                    ];
                })}
            </div>
        </motion.div>
    );
}

// ─── ShapeChip ────────────────────────────────────────────────────────────

function ShapeChip({
    label,
    shape,
    color = 'var(--ink)',
}: {
    label: string;
    shape: string;
    color?: string;
}) {
    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '2px',
            padding: '8px 12px',
            background: 'var(--bg-raised)',
            border: '1px solid var(--bg-raised)',
            borderRadius: '8px',
        }}>
            <span style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '9px',
                color: 'var(--muted)',
                letterSpacing: '0.07em',
                textTransform: 'uppercase',
            }}>
                {label}
            </span>
            <span style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '12px',
                color,
                fontWeight: 600,
            }}>
                {shape}
            </span>
        </div>
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

const tableCellStyle: React.CSSProperties = {
    padding: '8px 12px',
    borderBottom: '1px solid var(--stroke)',
    display: 'flex',
    alignItems: 'center',
};
