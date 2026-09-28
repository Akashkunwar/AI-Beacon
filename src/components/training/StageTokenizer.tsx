// Stage 2 — Build the vocabulary (tokenizer training).

import { useMemo, useState } from 'react';
import { ENCODINGS, TOKENIZER_SAMPLES, type EncodingId } from '@/data/tokenizerSamples';
import { Block, Note, Sources } from './TrainingKit';

// The worked example from Sennrich et al. (2016), who introduced BPE for NLP:
// word frequencies in a tiny corpus.
const CORPUS = [
    { word: 'low', count: 5 },
    { word: 'lower', count: 2 },
    { word: 'newest', count: 6 },
    { word: 'widest', count: 3 },
];
const MAX_MERGES = 8;

interface BpeState {
    segs: string[][];
    pairs: Array<{ pair: [string, string]; count: number }>;
    vocab: string[];
    merged?: [string, string];
}

/** Real byte-pair encoding on the toy corpus: repeatedly merge the most frequent adjacent pair. */
function runBpe(): BpeState[] {
    let segs = CORPUS.map((w) => w.word.split(''));
    const vocab = Array.from(new Set(CORPUS.flatMap((w) => w.word.split(''))));
    const states: BpeState[] = [];
    const countPairs = (s: string[][]) => {
        const m = new Map<string, { pair: [string, string]; count: number }>();
        s.forEach((sym, wi) => {
            for (let i = 0; i < sym.length - 1; i++) {
                const k = `${sym[i]}\u0000${sym[i + 1]}`;
                const e = m.get(k) ?? { pair: [sym[i], sym[i + 1]] as [string, string], count: 0 };
                e.count += CORPUS[wi].count;
                m.set(k, e);
            }
        });
        // Stable sort keeps first-seen order for ties.
        return [...m.values()].sort((a, b) => b.count - a.count);
    };
    for (let step = 0; step <= MAX_MERGES; step++) {
        const pairs = countPairs(segs);
        states.push({ segs, pairs, vocab: [...vocab], merged: step ? states[step - 1].pairs[0]?.pair : undefined });
        const best = pairs[0];
        if (!best) break;
        const [a, b] = best.pair;
        segs = segs.map((sym) => {
            const out: string[] = [];
            for (let i = 0; i < sym.length; i++) {
                if (i < sym.length - 1 && sym[i] === a && sym[i + 1] === b) { out.push(a + b); i++; } else out.push(sym[i]);
            }
            return out;
        });
        vocab.push(a + b);
    }
    return states;
}

const showToken = (t: string) => (t === '' ? '▯' : t.replace(/ /g, '·').replace(/\n/g, '↵'));

export function StageTokenizer() {
    const states = useMemo(runBpe, []);
    const [step, setStep] = useState(0);
    const s = states[step];
    const next = s.pairs[0];
    const [sampleIdx, setSampleIdx] = useState(7);
    const sample = TOKENIZER_SAMPLES[sampleIdx];

    return (
        <>
            <Block
                title="Try it: byte-pair encoding"
                intro="Start with single characters. Count every pair of neighbouring symbols across the corpus (weighted by how often each word appears), merge the most frequent pair into a new token, and repeat. Real tokenizers run tens of thousands of merges over bytes."
            >
                <div className="tk-panel">
                    <div className="bpe-controls">
                        <button type="button" className="btn btn-primary btn-sm" onClick={() => setStep((v) => Math.min(v + 1, states.length - 1))} disabled={step >= states.length - 1}>
                            {next ? <>Merge “{next.pair[0]}” + “{next.pair[1]}”</> : 'Done'}
                        </button>
                        <button type="button" className="btn btn-ghost btn-sm" onClick={() => setStep(0)} disabled={step === 0}>Reset</button>
                        <span className="bpe-count">Merges so far: <strong>{step}</strong></span>
                    </div>
                    <div className="bpe-grid">
                        <div>
                            <p className="tk-label">Corpus (word × count)</p>
                            <ul className="bpe-words">
                                {s.segs.map((sym, i) => (
                                    <li key={CORPUS[i].word}>
                                        <span className="bpe-syms">
                                            {sym.map((t, j) => (
                                                <span key={j} className={`bpe-tok ${s.merged && t === s.merged.join('') ? 'is-new' : ''}`}>{t}</span>
                                            ))}
                                        </span>
                                        <span className="bpe-freq">× {CORPUS[i].count}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            <p className="tk-label">Most frequent pairs</p>
                            <table className="data-table bpe-pairs">
                                <tbody>
                                    {s.pairs.slice(0, 5).map((p, i) => (
                                        <tr key={p.pair.join('+')} className={i === 0 ? 'is-active' : ''}>
                                            <td className="tk-mono">{p.pair[0]} + {p.pair[1]}</td>
                                            <td className="num">{p.count}</td>
                                            <td>{i === 0 ? 'merge next' : ''}</td>
                                        </tr>
                                    ))}
                                    {s.pairs.length === 0 && <tr><td colSpan={3}>No pairs left — every word is one token.</td></tr>}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div>
                        <p className="tk-label">Vocabulary ({s.vocab.length} tokens)</p>
                        <div className="bpe-vocab">
                            {s.vocab.map((t, i) => <span key={t} className={`bpe-tok ${i >= states[0].vocab.length ? 'is-merged' : ''}`}>{t}</span>)}
                        </div>
                    </div>
                </div>
                <Sources items={[{ label: 'Sennrich et al. 2016, “Neural Machine Translation of Rare Words with Subword Units”', url: 'https://arxiv.org/abs/1508.07909' }]} />
            </Block>

            <Block
                title="The same text through three real tokenizers"
                intro="These are real outputs of OpenAI’s published tokenizers, from GPT-2 (2019) to GPT-4o (2024). Bigger vocabularies need fewer tokens for the same text — especially outside English."
                aside={
                    <label className="tz-pick">
                        <span className="sr-only">Example text</span>
                        <select className="select" value={sampleIdx} onChange={(e) => setSampleIdx(Number(e.target.value))}>
                            {TOKENIZER_SAMPLES.map((x, i) => <option key={x.text} value={i}>{x.label}</option>)}
                        </select>
                    </label>
                }
            >
                <div className="tk-panel">
                    <p className="tz-text tk-mono">{sample.text}</p>
                    <div className="tz-rows">
                        {(Object.keys(ENCODINGS) as EncodingId[]).map((id) => {
                            const toks = sample.tokens[id];
                            return (
                                <div key={id} className="tz-row">
                                    <div className="tz-meta">
                                        <span className="tz-name">{ENCODINGS[id].usedBy}</span>
                                        <span className="tz-sub">{ENCODINGS[id].name} · {ENCODINGS[id].vocab} tokens</span>
                                    </div>
                                    <div className="tz-toks">
                                        {toks.map((t, i) => (
                                            <span key={i} className={`tz-tok ${i % 2 ? 'is-alt' : ''}`} title={t === '' ? 'part of a multi-byte character' : undefined}>{showToken(t)}</span>
                                        ))}
                                    </div>
                                    <span className="tz-n">{toks.length}</span>
                                </div>
                            );
                        })}
                    </div>
                    <p className="tz-key">· = space · ↵ = new line · ▯ = a token holding only part of a character (some scripts need several tokens per letter)</p>
                </div>
            </Block>

            <Block title="Why tokenization matters">
                <div className="tk-two">
                    <Note title="Cost and context">
                        APIs charge per token and context windows are measured in tokens. The Hindi greeting above takes 23 tokens with GPT-2’s
                        tokenizer but 9 with GPT-4o’s, so the same message is cheaper and fits more easily.
                    </Note>
                    <Note title="Odd blind spots">
                        Numbers are split into arbitrary chunks (“12345” → “123” + “45”) and words are split into pieces, not letters. That is
                        one reason models have struggled with arithmetic and with questions like “how many r’s are in strawberry?”.
                    </Note>
                </div>
                <table className="data-table">
                    <thead><tr><th scope="col">Model family</th><th scope="col" className="num">Vocabulary size</th><th scope="col">Tokenizer</th></tr></thead>
                    <tbody>
                        <tr><td>GPT-2 / GPT-3</td><td className="num">50,257</td><td>Byte-level BPE</td></tr>
                        <tr><td>Llama 2</td><td className="num">32,000</td><td>SentencePiece BPE</td></tr>
                        <tr><td>GPT-3.5 / GPT-4</td><td className="num">≈100,000</td><td>Byte-level BPE (cl100k)</td></tr>
                        <tr><td>Llama 3</td><td className="num">128,256</td><td>Byte-level BPE</td></tr>
                        <tr><td>GPT-4o and later</td><td className="num">≈200,000</td><td>Byte-level BPE (o200k)</td></tr>
                        <tr><td>Gemma</td><td className="num">256,000</td><td>SentencePiece</td></tr>
                    </tbody>
                </table>
            </Block>
            <style>{`
                .bpe-controls { display: flex; align-items: center; gap: var(--s2); flex-wrap: wrap; }
                .bpe-controls .btn:disabled { opacity: 0.45; cursor: not-allowed; }
                .bpe-count { margin-left: auto; font-size: var(--text-xs); color: var(--muted); }
                .bpe-count strong { color: var(--ink); }
                .bpe-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 280px), 1fr)); gap: var(--s4); }
                .bpe-grid .tk-label, .tk-panel > div > .tk-label { display: block; margin-bottom: 6px; }
                .bpe-words { list-style: none; display: flex; flex-direction: column; gap: 6px; }
                .bpe-words li { display: flex; justify-content: space-between; align-items: center; gap: var(--s3); }
                .bpe-syms { display: flex; gap: 3px; flex-wrap: wrap; }
                .bpe-tok { display: inline-block; padding: 3px 8px; border-radius: var(--r-sm); border: 1px solid var(--stroke-dark); background: var(--bg-panel); font-family: var(--font-mono); font-size: var(--text-sm); color: var(--ink); }
                .bpe-tok.is-new { background: var(--viz-1); border-color: var(--viz-1); color: var(--viz-on-fill); }
                .bpe-tok.is-merged { background: var(--bg-raised); }
                .bpe-freq { font-family: var(--font-mono); font-size: var(--text-xs); color: var(--muted); }
                .bpe-pairs td { padding-block: 6px; }
                .bpe-pairs tr.is-active td { color: var(--ink); font-weight: var(--weight-semibold); }
                .bpe-vocab { display: flex; flex-wrap: wrap; gap: 4px; }
                .bpe-vocab .bpe-tok { font-size: var(--text-xs); padding: 2px 6px; }
                .tz-pick .select { min-width: 200px; }
                .tz-text { font-size: var(--text-md); color: var(--ink); white-space: pre-wrap; }
                .tz-rows { display: flex; flex-direction: column; }
                .tz-row { display: grid; grid-template-columns: 170px 1fr 40px; gap: var(--s3); align-items: center; padding: var(--s3) 0; border-top: 1px solid var(--stroke); }
                .tz-meta { display: flex; flex-direction: column; gap: 2px; }
                .tz-name { font-size: var(--text-sm); color: var(--ink); font-weight: var(--weight-medium); }
                .tz-sub { font-size: var(--text-2xs); color: var(--muted); font-family: var(--font-mono); }
                .tz-toks { display: flex; flex-wrap: wrap; gap: 2px; }
                .tz-tok { padding: 3px 5px; border-radius: 3px; font-family: var(--font-mono); font-size: var(--text-sm); background: color-mix(in srgb, var(--viz-1) 16%, transparent); color: var(--ink); white-space: pre; }
                .tz-tok.is-alt { background: color-mix(in srgb, var(--viz-2) 18%, transparent); }
                .tz-n { font-family: var(--font-mono); font-size: var(--text-lg); color: var(--ink); text-align: right; font-weight: var(--weight-semibold); }
                .tz-key { font-size: var(--text-2xs); color: var(--muted); }
                @media (max-width: 639px) { .tz-row { grid-template-columns: 1fr auto; } .tz-toks { grid-column: 1 / -1; grid-row: 2; } }
            `}</style>
        </>
    );
}
