// src/components/pipeline/SamplingStep.tsx
// Step 12: choose the next token (greedy or top-k), then optionally append it
// and run the whole pipeline again — autoregressive generation.

import { Link } from 'react-router-dom';
import { useSimulatorStore } from '@/lib/store/simulatorStore';
import { PipelineStep } from '@/lib/store/types';
import { idToToken } from '@/lib/tokenizer/vocab';
import { Advanced, BarList, Callout, Formula, Panel, StepFrame, tokenText } from './StepKit';

const K_OPTIONS = [3, 5, 10];

export function SamplingStep() {
    const sampling = useSimulatorStore((s) => s.tensors.sampling);
    const raw = useSimulatorStore((s) => s.tensors.tokens?.raw) ?? [];
    const maxTokens = useSimulatorStore((s) => s.config.maxTokens);
    const method = useSimulatorStore((s) => s.samplingMethod);
    const k = useSimulatorStore((s) => s.topK);
    const temperature = useSimulatorStore((s) => s.temperature);
    const setSampling = useSimulatorStore((s) => s.setSampling);
    const appendPrediction = useSimulatorStore((s) => s.appendPrediction);
    if (!sampling) return null;

    const full = raw.length >= maxTokens;
    const unk = sampling.selected_token === '<unk>';

    return (
        <StepFrame
            step={PipelineStep.SAMPLING}
            lede="Finally, one token is chosen. The simplest rule, greedy, always takes the most likely token. Most chat products instead draw at random from the top few, which makes the writing less repetitive."
        >
            <Panel title="How to choose">
                <div className="sp-controls">
                    <div className="segmented" role="tablist" aria-label="Sampling method">
                        <button type="button" role="tab" aria-selected={method === 'greedy'} onClick={() => setSampling('greedy')}>Greedy</button>
                        <button type="button" role="tab" aria-selected={method === 'top-k'} onClick={() => setSampling('top-k')}>Top-k sampling</button>
                    </div>
                    {method === 'top-k' && (
                        <label className="sp-k">
                            k =
                            <select className="select" value={k} onChange={(e) => setSampling('top-k', Number(e.target.value))}>
                                {K_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                            </select>
                        </label>
                    )}
                </div>
                <p className="sp-hint">
                    {method === 'greedy'
                        ? 'Greedy ignores temperature: the top token wins no matter how flat the distribution is.'
                        : `Keep the ${k} most likely tokens, rescale their probabilities to add up to 100%, then draw one at random (temperature ${temperature.toFixed(1)} affects the odds).`}
                </p>
            </Panel>

            <div className="sp-result">
                <p className="sp-sentence">
                    {raw.map(tokenText).join(' ')} <mark>{tokenText(sampling.selected_token)}</mark>
                </p>
                <p className="sp-meta">
                    Chosen token: <strong>“{tokenText(sampling.selected_token)}”</strong> · ID {sampling.selected_id} · softmax probability {(sampling.prob * 100).toFixed(2)}%
                </p>
                <div className="sp-actions">
                    <button type="button" className="btn btn-primary" onClick={appendPrediction} disabled={full || unk}>
                        Add “{tokenText(sampling.selected_token)}” and predict again
                    </button>
                    <span className="sp-note">
                        {full
                            ? `Context window full (${maxTokens} tokens). Real models stop or drop the oldest tokens here.`
                            : unk
                                ? 'The model picked the unknown token, which cannot be written back as text.'
                                : 'This is exactly how chatbots write: one token at a time, each time re-running all 12 steps.'}
                    </span>
                </div>
            </div>

            {method === 'top-k' && sampling.candidates && (
                <Panel title={`The ${sampling.candidates.length} candidates, rescaled`}>
                    <BarList
                        items={sampling.candidates.map((c) => ({ key: c.id, label: tokenText(idToToken(c.id)), value: c.prob, highlight: c.id === sampling.selected_id }))}
                        max={1}
                        format={(v) => `${(v * 100).toFixed(1)}%`}
                        ariaLabel="Top-k candidates"
                    />
                    <p className="sp-hint">The highlighted token was drawn. The draw is seeded, so the same settings give the same result.</p>
                </Panel>
            )}

            <Callout tone="caveat" title="Why the prediction makes no sense">
                Every step you just watched is real, but the weights are random, so the model has learned nothing about language.
                A trained model runs exactly the same computation with weights learned from trillions of tokens — that is the only
                difference between this toy and a frontier model, apart from size.{' '}
                <Link className="text-link" to="/transformer-training-simulator">See how models are trained →</Link>
            </Callout>
            <Advanced>
                <Formula>
{method === 'greedy'
    ? `next_id = argmax(p)`
    : `top = k largest p_i            # k = ${k}
q_i = p_i / Σ_top p_j
next_id ~ Categorical(q)`}
                </Formula>
            </Advanced>
            <style>{`
                .sp-controls { display: flex; align-items: center; gap: var(--s3); flex-wrap: wrap; }
                .sp-k { display: inline-flex; align-items: center; gap: var(--s2); font-family: var(--font-mono); font-size: var(--text-sm); color: var(--secondary); }
                .sp-k .select { width: auto; min-height: 36px; }
                .sp-hint { font-size: var(--text-xs); color: var(--muted); }
                .sp-result { border-radius: var(--r-lg); background: var(--bg-inverse); color: var(--text-inverse); padding: var(--s5); display: flex; flex-direction: column; gap: var(--s3); }
                .sp-sentence { font-size: var(--text-xl); letter-spacing: var(--tracking-tight); line-height: 1.25; font-weight: var(--weight-medium); }
                .sp-sentence mark { background: var(--viz-1); color: var(--viz-on-fill); padding: 0 8px; border-radius: var(--r-sm); }
                .sp-meta { font-size: var(--text-sm); opacity: 0.8; }
                .sp-meta strong { opacity: 1; }
                .sp-actions { display: flex; align-items: center; gap: var(--s3); flex-wrap: wrap; }
                .sp-result .btn-primary { background: var(--bg-panel); color: var(--ink); border-color: var(--bg-panel); }
                .sp-result .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
                .sp-note { font-size: var(--text-xs); opacity: 0.75; max-width: 46ch; }
            `}</style>
        </StepFrame>
    );
}
