// src/components/pipeline/TokenizationStep.tsx
// Step 2: Animated token tiles splitting from the input string.

import { motion } from 'framer-motion';
import { useSimulatorStore } from '@/lib/store/simulatorStore';
import { GlassCard } from '@/components/shared';
import { ConceptCard } from '@/components/educational/ConceptCard';
import { TooltipEngine } from '@/components/educational/TooltipEngine';
import { TokenBadge, getTokenHue } from '@/components/visualizers/TokenBadge';
import { FlowArrow } from '@/components/visualizers/FlowArrow';
import { PipelineStep } from '@/lib/store/types';
import { VOCAB_SIZE } from '@/lib/tokenizer/vocab';

// ─── TokenizationStep ─────────────────────────────────────────────────────

export function TokenizationStep() {
    const { inputText, tensors } = useSimulatorStore();
    const tokens = tensors.tokens?.raw ?? [];

    return (
        <GlassCard padding="lg" aria-label="Tokenization step visualization">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {/* ── Step Header ───────────────────────────────────── */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                    <div style={stepNumberStyle}>02</div>
                    <div>
                        <TooltipEngine
                            content="Tokenization splits your text into chunks called 'tokens'. This demo uses word-split tokenization — real models use BPE or SentencePiece."
                            placement="bottom"
                        >
                            <h2 style={stepTitleStyle}>
                                Tokenization
                                <span style={{ fontSize: '12px', color: 'var(--muted)', marginLeft: '8px', fontWeight: 400 }}>
                                    ⓘ
                                </span>
                            </h2>
                        </TooltipEngine>
                        <p style={stepDescStyle}>
                            Your text is split into {tokens.length} word token{tokens.length !== 1 ? 's' : ''}. Each token is a discrete unit for the model.
                        </p>
                    </div>
                </div>

                {/* ── Input → Tokens flow ───────────────────────────── */}
                <div style={{
                    background: 'var(--bg-panel)',
                    border: '1px solid var(--bg-raised)',
                    borderRadius: '10px',
                    padding: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px',
                }}>
                    {/* Original input text */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                        <span style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: '10px',
                            color: 'var(--muted)',
                            letterSpacing: '0.06em',
                            textTransform: 'uppercase',
                            flexShrink: 0,
                        }}>
                            Input
                        </span>
                        <div style={{
                            background: 'var(--bg-raised)',
                            border: '1px solid var(--stroke)',
                            borderRadius: '6px',
                            padding: '4px 10px',
                            fontFamily: 'var(--font-mono)',
                            fontSize: '13px',
                            color: 'var(--ink)',
                        }}>
                            &ldquo;{inputText.trim()}&rdquo;
                        </div>
                    </div>

                    {/* Flow arrow */}
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <FlowArrow direction="down" label="word split" animateDelay={0.2} />
                    </div>

                    {/* Token tiles */}
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px', flexWrap: 'wrap' }}>
                            <span style={{
                                fontFamily: 'var(--font-mono)',
                                fontSize: '10px',
                                color: 'var(--muted)',
                                letterSpacing: '0.06em',
                                textTransform: 'uppercase',
                            }}>
                                Tokens
                            </span>
                            {/* Vocab size badge */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.5, type: 'spring', stiffness: 260, damping: 20 }}
                                style={{
                                    background: 'var(--bg-raised)',
                                    border: '1px solid var(--stroke-dark)',
                                    borderRadius: '4px',
                                    padding: '2px 8px',
                                    fontFamily: 'var(--font-mono)',
                                    fontSize: '10px',
                                    color: 'var(--primary)',
                                }}
                            >
                                Vocabulary: {VOCAB_SIZE} tokens
                            </motion.div>
                        </div>

                        {tokens.length > 0 ? (
                            <div style={{
                                display: 'flex',
                                flexWrap: 'wrap',
                                gap: '10px',
                                alignItems: 'center',
                            }}>
                                {tokens.map((token, i) => (
                                    <div key={`${token}-${i}`} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <TokenBadge
                                            token={token}
                                            hue={getTokenHue(i)}
                                            animate={true}
                                            animateDelay={0.1 + i * 0.08}
                                        />
                                        {i < tokens.length - 1 && (
                                            <FlowArrow direction="right" animateDelay={0.2 + i * 0.08} />
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div style={{
                                padding: '20px',
                                textAlign: 'center',
                                fontFamily: 'var(--font-mono)',
                                fontSize: '12px',
                                color: 'var(--muted)',
                                background: 'var(--bg-panel)',
                                border: '1px dashed var(--bg-raised)',
                                borderRadius: '8px',
                            }}>
                                No tokens — type some text in the input step
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Token count summary ───────────────────────────── */}
                {tokens.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4, duration: 0.3 }}
                        style={{
                            display: 'flex',
                            gap: '12px',
                            flexWrap: 'wrap',
                        }}
                    >
                        <StatBadge label="Tokens" value={String(tokens.length)} color="var(--ink)" />
                        <StatBadge label="Vocab size" value={String(VOCAB_SIZE)} color="var(--primary)" />
                        <StatBadge label="Tokenizer" value="word-split" color="var(--secondary)" />
                    </motion.div>
                )}

                {/* ── Concept Card ──────────────────────────────────── */}
                <ConceptCard stepId={PipelineStep.TOKENIZE} />
            </div>
        </GlassCard>
    );
}

// ─── StatBadge ────────────────────────────────────────────────────────────

function StatBadge({ label, value, color }: { label: string; value: string; color: string }) {
    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '2px',
            padding: '8px 14px',
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
                fontSize: '16px',
                color,
                fontWeight: 700,
                lineHeight: 1,
            }}>
                {value}
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
