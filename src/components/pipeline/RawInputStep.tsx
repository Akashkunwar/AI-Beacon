// src/components/pipeline/RawInputStep.tsx
// Step 1: the sentence the model will read.

import { Link } from 'react-router-dom';
import { useSimulatorStore } from '@/lib/store/simulatorStore';
import { PipelineStep } from '@/lib/store/types';
import { wordSplit } from '@/lib/tokenizer/wordSplit';
import { Callout, Panel, StepFrame } from './StepKit';

const SAMPLES = ['The cat sat', 'The cat sat on the mat.', 'Attention is all you need', 'The quick brown fox', 'AI learns fast'];

export function RawInputStep() {
    const inputText = useSimulatorStore((s) => s.inputText);
    const setInput = useSimulatorStore((s) => s.setInput);
    const maxTokens = useSimulatorStore((s) => s.config.maxTokens);
    const stepError = useSimulatorStore((s) => s.stepError);
    const count = wordSplit(inputText).length;
    const over = count > maxTokens;

    return (
        <StepFrame
            step={PipelineStep.INPUT}
            lede="Type a short sentence. You will follow it through a tiny transformer — the same kind of network behind ChatGPT, Claude and Gemini — and watch it predict the next word."
        >
            <Panel title="Your sentence" meta={`${count} / ${maxTokens} tokens`}>
                <label htmlFor="raw-input" className="sr-only">Sentence for the model</label>
                <textarea
                    id="raw-input"
                    className="input"
                    rows={2}
                    value={inputText}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type a sentence…"
                    aria-describedby="raw-input-hint"
                    style={{ fontFamily: 'var(--font-mono)', resize: 'vertical', minHeight: 64 }}
                />
                <p id="raw-input-hint" className="ri-hint" role={stepError || over ? 'alert' : undefined}>
                    {stepError
                        ? stepError
                        : over
                            ? `Only the first ${maxTokens} tokens will be used — that is this model’s context window.`
                            : 'Words and punctuation marks each count as one token.'}
                </p>
                <div className="ri-samples">
                    <span className="field-label">Try</span>
                    {SAMPLES.map((s) => (
                        <button key={s} type="button" className="pill" aria-pressed={inputText === s} onClick={() => setInput(s)}>
                            {s}
                        </button>
                    ))}
                </div>
            </Panel>

            <div className="sf-split">
                <Callout title="What happens next">
                    <p><strong>Steps 2–5</strong> turn your text into numbers.</p>
                    <p><strong>Steps 6–9</strong> run one transformer block, where tokens share information.</p>
                    <p><strong>Steps 10–12</strong> score every word in the vocabulary and pick the next one.</p>
                </Callout>
                <Callout tone="caveat" title="Real maths, random weights">
                    <p>
                        Every number is computed live in your browser. But this model has never been trained — its weights are random —
                        so its prediction will be nonsense. The point is to see <em>how</em> the machinery works.{' '}
                        <Link className="text-link" to="/transformer-training-simulator">How training works →</Link>
                    </p>
                </Callout>
            </div>
            <style>{`
                .ri-hint { font-size: var(--text-xs); color: var(--muted); }
                .ri-hint[role="alert"] { color: var(--warning); }
                .ri-samples { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; }
                .ri-samples .field-label { margin-right: 4px; }
            `}</style>
        </StepFrame>
    );
}
