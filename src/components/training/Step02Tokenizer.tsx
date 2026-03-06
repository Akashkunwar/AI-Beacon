// src/components/training/Step02Tokenizer.tsx
// Module 02 — Step 02: Tokenizer Training
// Greyscale UI shell; --viz-* tokens for chart elements only.
// All spacing/type/colour from src/tokens.css.

import { useState, useRef, useEffect, useCallback, memo } from 'react';
import { ErrorBoundary } from '@/components/shared/ErrorBoundary';
import type { StepProps } from '@/components/training/Step01DataCollection';

// ─── BPE Pre-computed Merge Sequence ─────────────────────────────────────────
// Input: "lowest lower newest"
// Character-level tokenisation first (spaces become ▁ for clarity)
// We track the full sequence of 6+ merges.

type TokenRow = string[];

interface MergeStep {
    mergedPair: [string, string]; // pair that was merged
    result: string;               // the merged token
    frequency: number;
    tokens: TokenRow;             // state AFTER this merge
}

// We manually pre-compute BPE on "lowest lower newest":
// Initial char split (spaces as literal ' '):
//   l o w e s t   l o w e r   n e w e s t
// -> ['l','o','w','e','s','t',' ','l','o','w','e','r',' ','n','e','w','e','s','t']
//
// We'll represent the initial vocab chars then apply merges step by step.

const INITIAL_TOKENS: TokenRow = [
    'l', 'o', 'w', 'e', 's', 't', ' ', 'l', 'o', 'w', 'e', 'r', ' ', 'n', 'e', 'w', 'e', 's', 't',
];

// Pre-compute 6 BPE merges. Counts are derived from "lowest lower newest":
// Occurring pairs frequencies in initial string:
//   ('l','o')→2, ('o','w')→2, ('w','e')→3, ('e','s')→2, ('s','t')→2,
//   ('e','r')→1, ('e','w')→1, ('n','e')→1
// Step 1: merge 'w'+'e' → 'we'  (freq 3, highest)
// After: l o we s t   l o we r   n e we s t
// Step 2: merge 'l'+'o' → 'lo'  (freq 2)
// After: lo we s t   lo we r   n e we s t
// Step 3: merge 'lo'+'we' → 'lowe'  (freq 2)
// After: lowe s t   lowe r   n e we s t
// Step 4: merge 's'+'t' → 'st'  (freq 2)
// After: lowe st   lowe r   n e we st
// Step 5: merge 'lowe'+'st' → 'lowest' (freq 1, only match)
// After: lowest   lowe r   n e we st
// Step 6: merge 'lowe'+'r' → 'lower' (freq 1)
// After: lowest   lower   n e we st

const MERGE_SEQUENCE: MergeStep[] = [
    {
        mergedPair: ['w', 'e'],
        result: 'we',
        frequency: 3,
        tokens: ['l', 'o', 'we', 's', 't', ' ', 'l', 'o', 'we', 'r', ' ', 'n', 'e', 'we', 's', 't'],
    },
    {
        mergedPair: ['l', 'o'],
        result: 'lo',
        frequency: 2,
        tokens: ['lo', 'we', 's', 't', ' ', 'lo', 'we', 'r', ' ', 'n', 'e', 'we', 's', 't'],
    },
    {
        mergedPair: ['lo', 'we'],
        result: 'lowe',
        frequency: 2,
        tokens: ['lowe', 's', 't', ' ', 'lowe', 'r', ' ', 'n', 'e', 'we', 's', 't'],
    },
    {
        mergedPair: ['s', 't'],
        result: 'st',
        frequency: 2,
        tokens: ['lowe', 'st', ' ', 'lowe', 'r', ' ', 'n', 'e', 'we', 'st'],
    },
    {
        mergedPair: ['lowe', 'st'],
        result: 'lowest',
        frequency: 1,
        tokens: ['lowest', ' ', 'lowe', 'r', ' ', 'n', 'e', 'we', 'st'],
    },
    {
        mergedPair: ['lowe', 'r'],
        result: 'lower',
        frequency: 1,
        tokens: ['lowest', ' ', 'lower', ' ', 'n', 'e', 'we', 'st'],
    },
];

const INITIAL_VOCAB_SIZE = 19; // unique chars in "lowest lower newest" incl. space

// ─── Types ───────────────────────────────────────────────────────────────────

interface AlgorithmCard {
    title: string;
    usedBy: string;
    description: string;
    tag: string;
}

interface SampleTokenization {
    text: string;
    bpe32k: string[];
    cl100k: string[];
    sentencepiece: string[];
}

// ─── Data ────────────────────────────────────────────────────────────────────

const ALGORITHM_CARDS: AlgorithmCard[] = [
    {
        title: 'BPE (Byte Pair Encoding)',
        usedBy: 'GPT-2, GPT-3, GPT-4, LLaMA',
        description: 'Iteratively merge the most frequent adjacent byte pair.',
        tag: 'Most common',
    },
    {
        title: 'SentencePiece + Unigram LM',
        usedBy: 'T5, Gemma, XLNet (Google)',
        description: 'Probabilistic model. Optimizes corpus likelihood.',
        tag: 'Google standard',
    },
    {
        title: 'Tiktoken (cl100k)',
        usedBy: 'GPT-4',
        description: 'BPE on bytes. 100,277 vocab. No unknown tokens.',
        tag: 'OpenAI',
    },
];

const SAMPLE_TOKENIZATIONS: SampleTokenization[] = [
    {
        text: 'Hello world',
        bpe32k: ['Hello', ' world'],
        cl100k: ['Hello', ' world'],
        sentencepiece: ['▁Hello', '▁world'],
    },
    {
        text: 'tokenization',
        bpe32k: ['token', 'ization'],
        cl100k: ['token', 'ization'],
        sentencepiece: ['▁token', 'ization'],
    },
    {
        text: 'ChatGPT is amazing',
        bpe32k: ['Chat', 'G', 'PT', ' is', ' amazing'],
        cl100k: ['Chat', 'GPT', ' is', ' amazing'],
        sentencepiece: ['▁Chat', 'GPT', '▁is', '▁amazing'],
    },
    {
        text: "it's fine",
        bpe32k: ["it", "'s", ' fine'],
        cl100k: ["it", "'s", ' fine'],
        sentencepiece: ['▁it', "'", 's', '▁fine'],
    },
];

type TokenizerKey = 'bpe32k' | 'cl100k' | 'sentencepiece';

const TOKENIZER_LABELS: Record<TokenizerKey, string> = {
    bpe32k: 'BPE-32k',
    cl100k: 'cl100k',
    sentencepiece: 'SentencePiece',
};

// ─── Simple heuristic tokenizer for custom text ──────────────────────────────

function approximateTokenize(text: string, method: TokenizerKey): string[] {
    if (!text.trim()) return [];
    // Very simplified heuristic: split on spaces and common punctuation
    const parts: string[] = [];
    let current = '';
    for (let i = 0; i < text.length; i++) {
        const ch = text[i];
        if (/[\s]/.test(ch)) {
            if (current) parts.push(current);
            parts.push(' ' + (text[i + 1] !== undefined ? '' : ''));
            current = '';
            // consume trailing non-space chars as next token prefix
            // (handled by next iteration)
        } else if (/[.,!?;:'"\-–—()\[\]{}]/.test(ch)) {
            if (current) { parts.push(current); current = ''; }
            parts.push(ch);
        } else {
            current += ch;
            // subword split heuristic: every 4-6 chars, split
            if (method === 'bpe32k' && current.length >= 6 && i < text.length - 1 && !/[\s.,!?]/.test(text[i + 1])) {
                parts.push(current);
                current = '';
            } else if (method === 'sentencepiece' && current.length >= 5 && i < text.length - 1 && !/[\s.,!?]/.test(text[i + 1])) {
                parts.push(current);
                current = '';
            }
        }
    }
    if (current) parts.push(current);

    // Filter empty/space-only fragments and collapse spaces into next token (cl100k style)
    const cleaned = parts.filter(p => p !== '' && p !== ' ');

    // SentencePiece adds ▁ prefix to word-initial tokens
    if (method === 'sentencepiece') {
        return cleaned.map((t, i) => {
            const prev = i > 0 ? parts[parts.indexOf(cleaned[i - 1])] : null;
            const isWordStart = i === 0 || (prev !== null && /[ ]/.test(prev));
            return isWordStart && !t.startsWith('▁') ? '▁' + t : t;
        });
    }

    return cleaned;
}

// ─── Section 1 — Overview ────────────────────────────────────────────────────

function OverviewSection() {
    return (
        <section aria-labelledby="s1-tok-heading" style={{ marginBottom: 'var(--s7)' }}>
            <p
                style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 'var(--text-xs)',
                    color: 'var(--muted)',
                    textTransform: 'uppercase',
                    letterSpacing: 'var(--tracking-wider)',
                    marginBottom: 'var(--s3)',
                }}
            >
                STEP 02 — TOKENIZER TRAINING
            </p>
            <h1
                id="s1-tok-heading"
                style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: 'var(--text-xl)',
                    fontWeight: 'var(--weight-semibold)',
                    color: 'var(--ink)',
                    lineHeight: 'var(--lead-tight)',
                    letterSpacing: 'var(--tracking-snug)',
                    marginBottom: 'var(--s4)',
                }}
            >
                Text can't enter a neural network. Tokens can.
            </h1>
            <p
                style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: 'var(--text-sm)',
                    fontWeight: 'var(--weight-light)',
                    color: 'var(--secondary)',
                    lineHeight: 'var(--lead-body)',
                    maxWidth: '68ch',
                }}
            >
                Before any model weights exist, a tokenizer must be trained on the raw corpus to build
                a vocabulary of subword units. The tokenizer is frozen before pre-training begins —
                every token ID the model will ever see is fixed at this stage. Getting the vocabulary
                right matters: too small and rare words become many fragmented pieces; too large and the
                embedding table bloats memory. Modern LLMs use vocabularies of 32k–100k tokens,
                balancing coverage against parameter efficiency.
            </p>
        </section>
    );
}

// ─── Section 2 — BPE Merge Visualizer ────────────────────────────────────────

interface PillProps {
    text: string;
    highlighted: boolean;
    prefersReducedMotion: boolean;
}

function TokenPill({ text, highlighted, prefersReducedMotion }: PillProps) {
    const isSpace = text === ' ';
    return (
        <span
            aria-label={isSpace ? 'space' : text}
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'var(--font-mono)',
                fontSize: 'var(--text-xs)',
                padding: '3px 7px',
                borderRadius: 'var(--r-sm)',
                border: highlighted ? '1px solid var(--ink)' : '1px solid var(--stroke)',
                background: highlighted ? 'var(--ink)' : 'var(--bg-panel)',
                color: highlighted ? 'var(--text-inverse)' : 'var(--secondary)',
                minWidth: isSpace ? '1.4ch' : undefined,
                flexShrink: 0,
                transition: prefersReducedMotion
                    ? 'none'
                    : `background var(--dur-base) var(--ease-out), color var(--dur-base) var(--ease-out), border-color var(--dur-base) var(--ease-out)`,
            }}
        >
            {isSpace ? '·' : text}
        </span>
    );
}

interface BPEVisualizerProps {
    prefersReducedMotion: boolean;
}

function BPEVisualizer({ prefersReducedMotion }: BPEVisualizerProps) {
    const [mergeIndex, setMergeIndex] = useState(-1); // -1 = initial state
    const vocabHistory = useRef<number[]>([INITIAL_VOCAB_SIZE]);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); }, []);

    const currentTokens: TokenRow =
        mergeIndex < 0 ? INITIAL_TOKENS : MERGE_SEQUENCE[mergeIndex].tokens;

    const currentStep = mergeIndex >= 0 ? MERGE_SEQUENCE[mergeIndex] : null;

    // Highlight the pair that was JUST merged (show the merged token highlighted)
    const highlightedTokens = new Set<number>();
    if (currentStep) {
        const merged = currentStep.result;
        currentTokens.forEach((t, i) => {
            if (t === merged) highlightedTokens.add(i);
        });
    }

    const handleStep = useCallback(() => {
        const next = mergeIndex + 1;
        if (next >= MERGE_SEQUENCE.length) return;
        const newVocab = vocabHistory.current[vocabHistory.current.length - 1] + 1;
        vocabHistory.current = [...vocabHistory.current, newVocab];
        setMergeIndex(next);
    }, [mergeIndex]);

    const handleReset = useCallback(() => {
        vocabHistory.current = [INITIAL_VOCAB_SIZE];
        setMergeIndex(-1);
    }, []);

    const isFinished = mergeIndex >= MERGE_SEQUENCE.length - 1;

    const historyItems = MERGE_SEQUENCE.slice(0, mergeIndex + 1);

    // Build vocab size display string: "19 → 20 → 21 → ..."
    const vocabDisplay = vocabHistory.current.join(' → ');

    return (
        <section aria-labelledby="s2-tok-heading" style={{ marginBottom: 'var(--s7)' }}>
            <h2
                id="s2-tok-heading"
                style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: 'var(--text-md)',
                    fontWeight: 'var(--weight-medium)',
                    color: 'var(--ink)',
                    marginBottom: 'var(--s2)',
                }}
            >
                Live BPE Merge Visualizer
            </h2>
            <p
                style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 'var(--text-xs)',
                    color: 'var(--muted)',
                    marginBottom: 'var(--s5)',
                }}
            >
                Input: "lowest lower newest"
            </p>

            {/* Token pill stream */}
            <div
                aria-label="Current token sequence"
                role="region"
                style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 'var(--s2)',
                    background: 'var(--bg-panel)',
                    borderRadius: 'var(--r-lg)',
                    padding: 'var(--s4)',
                    marginBottom: 'var(--s4)',
                    minHeight: '60px',
                    alignItems: 'center',
                }}
            >
                {currentTokens.map((tok, i) => (
                    <TokenPill
                        key={`${i}-${tok}`}
                        text={tok}
                        highlighted={highlightedTokens.has(i)}
                        prefersReducedMotion={prefersReducedMotion}
                    />
                ))}
            </div>

            {/* Controls row */}
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--s4)',
                    marginBottom: 'var(--s4)',
                    flexWrap: 'wrap',
                }}
            >
                {/* Step button */}
                <button
                    id="bpe-step-btn"
                    onClick={handleStep}
                    disabled={isFinished}
                    aria-label={isFinished ? 'All merges complete' : 'Apply next BPE merge'}
                    style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: 'var(--text-xs)',
                        color: isFinished ? 'var(--stroke-dark)' : 'var(--secondary)',
                        background: 'transparent',
                        border: `1px solid ${isFinished ? 'var(--stroke)' : 'var(--stroke-dark)'}`,
                        borderRadius: 'var(--r-md)',
                        padding: 'var(--s2) var(--s4)',
                        cursor: isFinished ? 'not-allowed' : 'pointer',
                        transition: `all var(--dur-fast) var(--ease-out)`,
                        whiteSpace: 'nowrap',
                    }}
                    onMouseEnter={e => {
                        if (!isFinished) {
                            const el = e.currentTarget;
                            el.style.background = 'var(--bg-panel)';
                            el.style.color = 'var(--ink)';
                            el.style.borderColor = 'var(--primary)';
                        }
                    }}
                    onMouseLeave={e => {
                        const el = e.currentTarget;
                        el.style.background = 'transparent';
                        el.style.color = isFinished ? 'var(--stroke-dark)' : 'var(--secondary)';
                        el.style.borderColor = isFinished ? 'var(--stroke)' : 'var(--stroke-dark)';
                    }}
                >
                    {isFinished ? '✓ All merges done' : 'Step through merges →'}
                </button>

                {/* Reset */}
                {mergeIndex >= 0 && (
                    <button
                        id="bpe-reset-btn"
                        onClick={handleReset}
                        aria-label="Reset BPE visualizer"
                        style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: 'var(--text-xs)',
                            color: 'var(--muted)',
                            background: 'transparent',
                            border: '1px solid var(--stroke)',
                            borderRadius: 'var(--r-md)',
                            padding: 'var(--s2) var(--s4)',
                            cursor: 'pointer',
                            transition: `all var(--dur-fast) var(--ease-out)`,
                        }}
                        onMouseEnter={e => {
                            e.currentTarget.style.color = 'var(--secondary)';
                            e.currentTarget.style.borderColor = 'var(--stroke-dark)';
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.color = 'var(--muted)';
                            e.currentTarget.style.borderColor = 'var(--stroke)';
                        }}
                    >
                        ↺ Reset
                    </button>
                )}

                {/* Vocab size counter */}
                <span
                    aria-live="polite"
                    aria-atomic="true"
                    style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: 'var(--text-xs)',
                        color: 'var(--muted)',
                        marginLeft: 'auto',
                    }}
                >
                    Vocabulary size:{' '}
                    <span style={{ color: 'var(--ink)', fontWeight: 'var(--weight-medium)' }}>
                        {vocabDisplay}
                    </span>
                </span>
            </div>

            {/* Merge history */}
            {historyItems.length > 0 && (
                <div
                    aria-label="Merge history"
                    style={{
                        background: 'var(--bg-panel)',
                        borderRadius: 'var(--r-lg)',
                        padding: 'var(--s4)',
                    }}
                >
                    <p
                        style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: 'var(--text-2xs)',
                            color: 'var(--muted)',
                            textTransform: 'uppercase',
                            letterSpacing: 'var(--tracking-wide)',
                            marginBottom: 'var(--s3)',
                        }}
                    >
                        Merge history
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s2)' }}>
                        {historyItems.map((step, i) => (
                            <div
                                key={i}
                                style={{
                                    fontFamily: 'var(--font-mono)',
                                    fontSize: 'var(--text-xs)',
                                    color: 'var(--secondary)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 'var(--s3)',
                                    animation: prefersReducedMotion
                                        ? 'none'
                                        : 'bpeHistoryIn 200ms var(--ease-out) both',
                                }}
                            >
                                <span style={{ color: 'var(--muted)', minWidth: '1.5em' }}>
                                    {String(i + 1).padStart(2, '0')}
                                </span>
                                <span>
                                    <span style={{ color: 'var(--ink)', fontWeight: 'var(--weight-medium)' }}>
                                        {step.mergedPair[0]}
                                    </span>
                                    {' + '}
                                    <span style={{ color: 'var(--ink)', fontWeight: 'var(--weight-medium)' }}>
                                        {step.mergedPair[1]}
                                    </span>
                                    {' → '}
                                    <span style={{ color: 'var(--ink)', fontWeight: 'var(--weight-semibold)' }}>
                                        {step.result}
                                    </span>
                                </span>
                                <span style={{ color: 'var(--muted)' }}>
                                    (frequency: {step.frequency})
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <style>{`
                @keyframes bpeHistoryIn {
                    from { opacity: 0; transform: translateY(4px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                @media (prefers-reduced-motion: reduce) {
                    @keyframes bpeHistoryIn {
                        from { opacity: 1; transform: none; }
                        to   { opacity: 1; transform: none; }
                    }
                }
                #bpe-step-btn:focus-visible,
                #bpe-reset-btn:focus-visible {
                    outline: 2px solid var(--stroke-dark);
                    outline-offset: 2px;
                }
            `}</style>
        </section>
    );
}

// ─── Section 3 — Algorithm Comparison ────────────────────────────────────────

const AlgorithmSection = memo(function AlgorithmSection() {
    return (
        <section aria-labelledby="s3-tok-heading" style={{ marginBottom: 'var(--s7)' }}>
            <h2
                id="s3-tok-heading"
                style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: 'var(--text-md)',
                    fontWeight: 'var(--weight-medium)',
                    color: 'var(--ink)',
                    marginBottom: 'var(--s5)',
                }}
            >
                Algorithm Comparison
            </h2>

            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                    gap: 'var(--s4)',
                }}
            >
                {ALGORITHM_CARDS.map(card => (
                    <article
                        key={card.title}
                        style={{
                            background: 'var(--bg-panel)',
                            borderRadius: 'var(--r-lg)',
                            padding: 'var(--s5)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 'var(--s3)',
                        }}
                    >
                        {/* Tag */}
                        <span
                            style={{
                                display: 'inline-block',
                                alignSelf: 'flex-start',
                                fontFamily: 'var(--font-mono)',
                                fontSize: 'var(--text-2xs)',
                                color: 'var(--muted)',
                                background: 'var(--bg-raised)',
                                borderRadius: 'var(--r-pill)',
                                padding: '2px 8px',
                            }}
                        >
                            {card.tag}
                        </span>

                        {/* Title */}
                        <h3
                            style={{
                                fontFamily: 'var(--font-sans)',
                                fontSize: 'var(--text-sm)',
                                fontWeight: 'var(--weight-semibold)',
                                color: 'var(--ink)',
                                margin: 0,
                            }}
                        >
                            {card.title}
                        </h3>

                        {/* Used by */}
                        <p
                            style={{
                                fontFamily: 'var(--font-mono)',
                                fontSize: 'var(--text-xs)',
                                color: 'var(--muted)',
                                margin: 0,
                            }}
                        >
                            Used by: {card.usedBy}
                        </p>

                        {/* Description */}
                        <p
                            style={{
                                fontFamily: 'var(--font-sans)',
                                fontSize: 'var(--text-sm)',
                                fontWeight: 'var(--weight-light)',
                                color: 'var(--secondary)',
                                lineHeight: 'var(--lead-body)',
                                margin: 0,
                            }}
                        >
                            "{card.description}"
                        </p>
                    </article>
                ))}
            </div>
        </section>
    );
});

// ─── Section 4 — Tokenizer Comparison ────────────────────────────────────────

function TokenizerComparison({ prefersReducedMotion }: { prefersReducedMotion: boolean }) {
    const [activeTokenizer, setActiveTokenizer] = useState<TokenizerKey>('bpe32k');
    const [customText, setCustomText] = useState('');
    const inputRef = useRef<HTMLTextAreaElement>(null);

    const tokenizers: TokenizerKey[] = ['bpe32k', 'cl100k', 'sentencepiece'];

    // Derived custom tokens
    const customTokens = customText.length > 0
        ? approximateTokenize(customText, activeTokenizer)
        : [];

    const charsPerToken = (tokens: string[]) => {
        const total = tokens.join('').replace(/▁/g, '').length;
        if (tokens.length === 0) return '—';
        return (total / tokens.length).toFixed(1);
    };

    return (
        <section aria-labelledby="s4-tok-heading" style={{ marginBottom: 'var(--s7)' }}>
            <h2
                id="s4-tok-heading"
                style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: 'var(--text-md)',
                    fontWeight: 'var(--weight-medium)',
                    color: 'var(--ink)',
                    marginBottom: 'var(--s5)',
                }}
            >
                Tokenizer Comparison
            </h2>

            {/* Tokenizer toggle pills */}
            <div
                role="group"
                aria-label="Select tokenizer"
                style={{
                    display: 'flex',
                    gap: 'var(--s2)',
                    marginBottom: 'var(--s5)',
                    flexWrap: 'wrap',
                }}
            >
                {tokenizers.map(tok => {
                    const isActive = tok === activeTokenizer;
                    return (
                        <button
                            key={tok}
                            id={`tokenizer-pill-${tok}`}
                            onClick={() => setActiveTokenizer(tok)}
                            aria-pressed={isActive}
                            style={{
                                fontFamily: 'var(--font-mono)',
                                fontSize: 'var(--text-xs)',
                                color: isActive ? 'var(--text-inverse)' : 'var(--secondary)',
                                background: isActive ? 'var(--bg-inverse)' : 'transparent',
                                border: isActive
                                    ? '1px solid var(--bg-inverse)'
                                    : '1px solid var(--stroke-dark)',
                                borderRadius: 'var(--r-pill)',
                                padding: 'var(--s2) var(--s4)',
                                cursor: 'pointer',
                                transition: `all var(--dur-fast) var(--ease-out)`,
                                minHeight: '36px',
                            }}
                            onMouseEnter={e => {
                                if (!isActive) {
                                    e.currentTarget.style.background = 'var(--bg-raised)';
                                    e.currentTarget.style.color = 'var(--ink)';
                                }
                            }}
                            onMouseLeave={e => {
                                if (!isActive) {
                                    e.currentTarget.style.background = 'transparent';
                                    e.currentTarget.style.color = 'var(--secondary)';
                                }
                            }}
                        >
                            {TOKENIZER_LABELS[tok]}
                        </button>
                    );
                })}
            </div>

            {/* Pre-computed examples */}
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 'var(--s4)',
                    marginBottom: 'var(--s6)',
                }}
            >
                {SAMPLE_TOKENIZATIONS.map(sample => {
                    const tokens = sample[activeTokenizer];
                    const cpt = charsPerToken(tokens);
                    return (
                        <div
                            key={sample.text}
                            style={{
                                background: 'var(--bg-panel)',
                                borderRadius: 'var(--r-lg)',
                                padding: 'var(--s4)',
                            }}
                        >
                            <p
                                style={{
                                    fontFamily: 'var(--font-mono)',
                                    fontSize: 'var(--text-xs)',
                                    color: 'var(--muted)',
                                    marginBottom: 'var(--s3)',
                                }}
                            >
                                "{sample.text}"
                            </p>
                            <div
                                style={{
                                    display: 'flex',
                                    flexWrap: 'wrap',
                                    gap: 'var(--s2)',
                                    marginBottom: 'var(--s3)',
                                }}
                            >
                                {tokens.map((t, i) => (
                                    <span
                                        key={i}
                                        style={{
                                            fontFamily: 'var(--font-mono)',
                                            fontSize: 'var(--text-xs)',
                                            color: 'var(--secondary)',
                                            background: 'var(--bg-raised)',
                                            border: '1px solid var(--stroke)',
                                            borderRadius: 'var(--r-sm)',
                                            padding: '2px 7px',
                                            animation: prefersReducedMotion
                                                ? 'none'
                                                : 'tokFadeIn 180ms var(--ease-out) both',
                                            animationDelay: prefersReducedMotion
                                                ? '0ms'
                                                : `${i * 30}ms`,
                                        }}
                                    >
                                        {t}
                                    </span>
                                ))}
                            </div>
                            <p
                                style={{
                                    fontFamily: 'var(--font-mono)',
                                    fontSize: 'var(--text-2xs)',
                                    color: 'var(--muted)',
                                    margin: 0,
                                }}
                            >
                                {tokens.length} token{tokens.length !== 1 ? 's' : ''} · {cpt} chars/token
                            </p>
                        </div>
                    );
                })}
            </div>

            {/* Custom text input */}
            <div
                style={{
                    background: 'var(--bg-panel)',
                    borderRadius: 'var(--r-lg)',
                    padding: 'var(--s5)',
                }}
            >
                <p
                    style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: 'var(--text-xs)',
                        color: 'var(--muted)',
                        textTransform: 'uppercase',
                        letterSpacing: 'var(--tracking-wide)',
                        marginBottom: 'var(--s3)',
                    }}
                >
                    Try your own text
                </p>
                <textarea
                    ref={inputRef}
                    id="custom-text-input"
                    value={customText}
                    onChange={e => setCustomText(e.target.value)}
                    placeholder="Type text to compare…"
                    rows={2}
                    aria-label="Enter custom text to tokenize"
                    style={{
                        display: 'block',
                        width: '100%',
                        boxSizing: 'border-box',
                        fontFamily: 'var(--font-mono)',
                        fontSize: 'var(--text-sm)',
                        color: 'var(--primary)',
                        background: 'var(--bg)',
                        border: '1px solid var(--stroke-dark)',
                        borderRadius: 'var(--r-md)',
                        padding: 'var(--s3) var(--s4)',
                        resize: 'vertical',
                        outline: 'none',
                        marginBottom: 'var(--s4)',
                        lineHeight: 'var(--lead-body)',
                    }}
                    onFocus={e => { e.currentTarget.style.borderColor = 'var(--primary)'; }}
                    onBlur={e => { e.currentTarget.style.borderColor = 'var(--stroke-dark)'; }}
                />

                {customTokens.length > 0 ? (
                    <>
                        <div
                            style={{
                                display: 'flex',
                                flexWrap: 'wrap',
                                gap: 'var(--s2)',
                                marginBottom: 'var(--s3)',
                            }}
                            aria-label="Custom text tokenization result"
                        >
                            {customTokens.map((t, i) => (
                                <span
                                    key={i}
                                    style={{
                                        fontFamily: 'var(--font-mono)',
                                        fontSize: 'var(--text-xs)',
                                        color: 'var(--secondary)',
                                        background: 'var(--bg-raised)',
                                        border: '1px solid var(--stroke)',
                                        borderRadius: 'var(--r-sm)',
                                        padding: '2px 7px',
                                    }}
                                >
                                    {t}
                                </span>
                            ))}
                        </div>
                        <p
                            style={{
                                fontFamily: 'var(--font-mono)',
                                fontSize: 'var(--text-xs)',
                                color: 'var(--muted)',
                                margin: '0 0 var(--s3)',
                            }}
                        >
                            ≈ {customTokens.length} token{customTokens.length !== 1 ? 's' : ''} · {charsPerToken(customTokens)} chars/token
                        </p>
                    </>
                ) : (
                    customText.length > 0 && (
                        <p
                            style={{
                                fontFamily: 'var(--font-mono)',
                                fontSize: 'var(--text-xs)',
                                color: 'var(--muted)',
                                marginBottom: 'var(--s3)',
                            }}
                        >
                            …
                        </p>
                    )
                )}

                <p
                    style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: 'var(--text-xs)',
                        color: 'var(--muted)',
                        margin: 0,
                        fontStyle: 'italic',
                    }}
                >
                    Note: this is a simplified simulation.
                </p>
            </div>

            <style>{`
                @keyframes tokFadeIn {
                    from { opacity: 0; transform: scale(0.92); }
                    to   { opacity: 1; transform: scale(1); }
                }
                @media (prefers-reduced-motion: reduce) {
                    @keyframes tokFadeIn {
                        from { opacity: 1; transform: none; }
                        to   { opacity: 1; transform: none; }
                    }
                }
                [id^="tokenizer-pill-"]:focus-visible {
                    outline: 2px solid var(--stroke-dark);
                    outline-offset: 2px;
                }
                #custom-text-input:focus-visible {
                    outline: 2px solid var(--stroke-dark);
                    outline-offset: 2px;
                }
            `}</style>
        </section>
    );
}

// ─── Root export ─────────────────────────────────────────────────────────────

export function Step02Tokenizer({ stepNumber, totalSteps, onNext, onPrev }: StepProps) {
    const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

    useEffect(() => {
        const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
        setPrefersReducedMotion(mq.matches);
        const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
        mq.addEventListener('change', handler);
        return () => mq.removeEventListener('change', handler);
    }, []);

    return (
        <ErrorBoundary>
            <article
                aria-label={`Step ${stepNumber} of ${totalSteps}: Tokenizer Training`}
                style={{ flex: 1, display: 'flex', flexDirection: 'column' }}
            >
                <OverviewSection />
                <BPEVisualizer prefersReducedMotion={prefersReducedMotion} />
                <AlgorithmSection />
                <TokenizerComparison prefersReducedMotion={prefersReducedMotion} />

                {/* Spacer */}
                <div style={{ flex: 1 }} />

                {/* Props consumed by Training.tsx footer */}
                <input
                    type="hidden"
                    data-onnext={String(typeof onNext)}
                    data-onprev={String(typeof onPrev)}
                />
            </article>
        </ErrorBoundary>
    );
}
