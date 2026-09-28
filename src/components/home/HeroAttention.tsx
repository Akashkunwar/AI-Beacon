// A real, computed attention pattern for the homepage hero. It runs the same
// math engine as the simulator (tokenize → embed → positional encoding →
// attention) on a fixed sentence, so the picture is honest, not decorative.

import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { executeStep } from '@/lib/store/stepMachine';
import { DEFAULT_CONFIG, PipelineStep, type TensorRegistry } from '@/lib/store/types';
import { heat } from '@/utils/vizColor';

const SENTENCE = 'The cat sat on the mat';
const FOCUS_ROW = 2; // "sat"

function computeAttention() {
    const config = { ...DEFAULT_CONFIG, dModel: 16, nHeads: 1, seed: 42 };
    let tensors: TensorRegistry = {};
    const steps = [
        PipelineStep.TOKENIZE,
        PipelineStep.TOKEN_IDS,
        PipelineStep.EMBEDDING,
        PipelineStep.POSITIONAL_ENCODING,
        PipelineStep.ATTENTION,
    ];
    for (const step of steps) {
        tensors = executeStep(step, { config, tensors, inputText: SENTENCE, temperature: 1 });
    }
    const tokens = tensors.tokens?.raw ?? [];
    const w = tensors.attention?.weights;
    const n = tokens.length;
    const rows: number[][] = [];
    for (let i = 0; i < n; i++) {
        const row: number[] = [];
        for (let j = 0; j < n; j++) row.push(w ? w.data[i * n + j] : 0);
        rows.push(row);
    }
    return { tokens, rows, dModel: config.dModel };
}

export function HeroAttention() {
    const { tokens, rows, dModel } = useMemo(computeAttention, []);
    const n = tokens.length;

    return (
        <figure className="card hero-attn" aria-label="Attention weights computed in your browser for the sentence 'The cat sat on the mat'">
            <div className="hero-attn-head">
                <span className="eyebrow">Computed live · self-attention</span>
                <span className="chip">step 6 of 12</span>
            </div>
            <p className="hero-attn-title">Which earlier words does each word look at?</p>

            <div className="hero-attn-grid" style={{ gridTemplateColumns: `3.2rem repeat(${n}, 1fr)` }}>
                <span />
                {tokens.map((t, j) => (
                    <span key={`c${j}`} className="hero-attn-col">{t}</span>
                ))}
                {rows.map((row, i) => (
                    <div key={`r${i}`} style={{ display: 'contents' }}>
                        <span className={`hero-attn-row ${i === FOCUS_ROW ? 'is-focus' : ''}`}>{tokens[i]}</span>
                        {row.map((v, j) => {
                            const masked = j > i;
                            return (
                                <span
                                    key={j}
                                    className="hero-attn-cell"
                                    title={masked ? 'Masked: a word cannot look at future words' : `${tokens[i]} → ${tokens[j]}: ${(v * 100).toFixed(0)}%`}
                                    style={{
                                        background: masked ? 'var(--bg-sunken)' : heat(Math.min(1, v * 1.15)),
                                        color: !masked && v > 0.5 ? 'var(--viz-heat-text)' : 'var(--muted)',
                                        outline: i === FOCUS_ROW && !masked ? '1px solid var(--stroke-dark)' : undefined,
                                    }}
                                >
                                    {masked ? '' : `${Math.round(v * 100)}`}
                                </span>
                            );
                        })}
                    </div>
                ))}
            </div>

            <figcaption className="hero-attn-foot">
                <code>softmax(QKᵀ/√d)·V</code>
                <span>
                    tiny random-weight model · d<sub>model</sub>={dModel} ·{' '}
                    <Link to="/transformer-simulator" className="text-link">try your own sentence →</Link>
                </span>
            </figcaption>
            <style>{HERO_ATTN_CSS}</style>
        </figure>
    );
}

const HERO_ATTN_CSS = `
.hero-attn { padding: var(--s5); display: flex; flex-direction: column; gap: var(--s3); }
.hero-attn-head { display: flex; justify-content: space-between; align-items: center; gap: var(--s3); }
.hero-attn-title { font-size: var(--text-md); font-weight: var(--weight-semibold); color: var(--ink); letter-spacing: var(--tracking-snug); }
.hero-attn-grid { display: grid; gap: 4px; margin-top: var(--s2); }
.hero-attn-col, .hero-attn-row {
    font-family: var(--font-mono);
    font-size: var(--text-2xs);
    color: var(--muted);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}
.hero-attn-col { text-align: center; padding-bottom: 2px; }
.hero-attn-row { align-self: center; }
.hero-attn-row.is-focus { color: var(--ink); font-weight: var(--weight-semibold); }
.hero-attn-cell {
    aspect-ratio: 1.45;
    border-radius: 5px;
    display: grid;
    place-items: center;
    font-family: var(--font-mono);
    font-size: 10px;
    font-variant-numeric: tabular-nums;
    transition: transform var(--dur-fast) var(--ease-out);
}
.hero-attn-cell:hover { transform: scale(1.06); }
.hero-attn-foot {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    gap: var(--s2);
    font-size: var(--text-2xs);
    color: var(--muted);
    margin-top: var(--s1);
}
`;
