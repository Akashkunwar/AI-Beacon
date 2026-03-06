// src/components/pipeline/RawInputStep.tsx
// Step 1: Raw text input.

import { useCallback } from 'react';
import { motion } from 'framer-motion';
import { useSimulatorStore } from '@/lib/store/simulatorStore';
import { GlassCard } from '@/components/shared';
import { ConceptCard } from '@/components/educational/ConceptCard';
import { TooltipEngine } from '@/components/educational/TooltipEngine';
import { PipelineStep } from '@/lib/store/types';

const MAX_WORDS = 8;

const SAMPLE_SENTENCES = [
    'The cat sat',
    'Attention is all you need',
    'Hello world',
    'The quick brown fox',
];

export function RawInputStep() {
    const { inputText, setInput } = useSimulatorStore();

    const wordCount = inputText.trim() === '' ? 0 : inputText.trim().split(/\s+/).length;
    const isOverLimit = wordCount > MAX_WORDS;

    const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setInput(e.target.value);
    }, [setInput]);

    const handleSample = useCallback((sentence: string) => {
        setInput(sentence);
    }, [setInput]);

    return (
        <GlassCard padding="lg" aria-label="Raw text input step">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s5)' }}>
                {/* ── Step Header ───────────────────────────────────── */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--s3)' }}>
                    <div style={stepNumberStyle}>01</div>
                    <div>
                        <TooltipEngine
                            content="Type any text here. The model will process each word as a separate token through the transformer pipeline."
                            placement="bottom"
                        >
                            <h2 style={stepTitleStyle}>
                                Raw Text Input
                                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', marginLeft: 'var(--s2)', fontWeight: 400 }}>ⓘ</span>
                            </h2>
                        </TooltipEngine>
                        <p style={stepDescStyle}>
                            Your text is the starting point. Type a sentence (max {MAX_WORDS} words) and watch it flow through the transformer.
                        </p>
                    </div>
                </div>

                {/* ── Text Input ────────────────────────────────────── */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s2)' }}>
                    <div style={{ position: 'relative' }}>
                        <textarea
                            id="raw-input-textarea"
                            value={inputText}
                            onChange={handleChange}
                            placeholder="Type your sentence here…"
                            rows={3}
                            aria-label="Input text for the transformer"
                            aria-describedby="word-count-label"
                            style={{
                                width: '100%',
                                resize: 'none',
                                background: 'var(--bg)',
                                border: `1.5px solid ${isOverLimit ? 'var(--ink)' : 'var(--stroke-dark)'}`,
                                borderRadius: 'var(--r-md)',
                                padding: 'var(--s3) var(--s3)',
                                fontFamily: 'var(--font-mono)',
                                fontSize: 'var(--text-sm)',
                                color: 'var(--primary)',
                                outline: 'none',
                                boxSizing: 'border-box',
                                lineHeight: 'var(--lead-body)',
                                caretColor: 'var(--ink)',
                                transition: `border-color var(--dur-fast) var(--ease-out)`,
                            }}
                            onFocus={(e) => {
                                if (!isOverLimit) {
                                    e.target.style.borderColor = 'var(--ink)';
                                }
                            }}
                            onBlur={(e) => {
                                e.target.style.borderColor = isOverLimit ? 'var(--ink)' : 'var(--stroke-dark)';
                            }}
                        />
                    </div>

                    {/* Word count */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--s2)', minHeight: '20px' }}>
                        <span id="word-count-label" style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: 'var(--text-2xs)',
                            color: isOverLimit ? 'var(--ink)' : 'var(--muted)',
                            transition: `color var(--dur-fast) var(--ease-out)`,
                        }}>
                            {wordCount} / {MAX_WORDS} words
                        </span>
                        {isOverLimit && (
                            <motion.span
                                initial={{ opacity: 0, x: -4 }}
                                animate={{ opacity: 1, x: 0 }}
                                style={{
                                    fontFamily: 'var(--font-mono)',
                                    fontSize: 'var(--text-2xs)',
                                    color: 'var(--ink)',
                                    background: 'var(--bg-raised)',
                                    border: '1px solid var(--stroke-dark)',
                                    padding: '1px 7px',
                                    borderRadius: 'var(--r-sm)',
                                }}
                            >
                                ⚠ Only first {MAX_WORDS} words will be processed
                            </motion.span>
                        )}
                    </div>
                </div>

                {/* ── Sample Sentences ──────────────────────────────── */}
                <div>
                    <p style={sectionLabel}>Try a sample</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--s1)' }}>
                        {SAMPLE_SENTENCES.map((s) => (
                            <motion.button
                                key={s}
                                onClick={() => handleSample(s)}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.97 }}
                                aria-label={`Use sample sentence: ${s}`}
                                style={{
                                    background: inputText === s ? 'var(--bg-inverse)' : 'var(--bg-panel)',
                                    border: inputText === s ? '1px solid var(--bg-inverse)' : '1px solid var(--stroke)',
                                    borderRadius: 'var(--r-sm)',
                                    padding: 'var(--s1) var(--s3)',
                                    fontFamily: 'var(--font-mono)',
                                    fontSize: 'var(--text-xs)',
                                    color: inputText === s ? 'var(--text-inverse)' : 'var(--secondary)',
                                    cursor: 'pointer',
                                    transition: `all var(--dur-fast) var(--ease-out)`,
                                }}
                            >
                                &ldquo;{s}&rdquo;
                            </motion.button>
                        ))}
                    </div>
                </div>

                {/* ── Hint ─────────────────────────────────────────── */}
                <div style={{
                    padding: 'var(--s3) var(--s3)',
                    background: 'var(--bg-panel)',
                    border: '1px solid var(--stroke)',
                    borderRadius: 'var(--r-md)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--s3)',
                }}>
                    <motion.span
                        animate={{ x: [0, 4, 0] }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                        aria-hidden="true"
                        style={{ fontSize: 'var(--text-base)', flexShrink: 0 }}
                    >
                        →
                    </motion.span>
                    <p style={{ fontSize: 'var(--text-xs)', color: 'var(--secondary)', lineHeight: 'var(--lead-body)' }}>
                        Click <strong style={{ color: 'var(--ink)', fontFamily: 'var(--font-mono)' }}>Step ▶</strong> to tokenize your text.
                    </p>
                </div>

                {/* ── Concept Card ──────────────────────────────────── */}
                <ConceptCard stepId={PipelineStep.INPUT} />
            </div>
        </GlassCard>
    );
}

// ─── Shared local styles ───────────────────────────────────────────────────

const stepNumberStyle: React.CSSProperties = {
    width: '36px',
    height: '36px',
    borderRadius: 'var(--r-md)',
    background: 'var(--bg-raised)',
    border: '1px solid var(--stroke-dark)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'var(--font-mono)',
    fontSize: 'var(--text-xs)',
    color: 'var(--ink)',
    fontWeight: 700,
    flexShrink: 0,
};

const stepTitleStyle: React.CSSProperties = {
    fontSize: 'var(--text-md)',
    fontWeight: 'var(--weight-semibold)',
    color: 'var(--ink)',
    marginBottom: 'var(--s1)',
    cursor: 'default',
    letterSpacing: 'var(--tracking-snug)',
};

const stepDescStyle: React.CSSProperties = {
    fontSize: 'var(--text-sm)',
    color: 'var(--secondary)',
    lineHeight: 'var(--lead-snug)',
};

const sectionLabel: React.CSSProperties = {
    fontFamily: 'var(--font-mono)',
    fontSize: 'var(--text-2xs)',
    color: 'var(--muted)',
    letterSpacing: 'var(--tracking-wider)',
    textTransform: 'uppercase',
    marginBottom: 'var(--s2)',
};
