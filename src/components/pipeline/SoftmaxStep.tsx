// src/components/pipeline/SoftmaxStep.tsx
// Step 11: logits → probabilities, with an interactive temperature.

import { useMemo } from 'react';
import { useSimulatorStore } from '@/lib/store/simulatorStore';
import { PipelineStep } from '@/lib/store/types';
import { idToToken, VOCAB_SIZE } from '@/lib/tokenizer/vocab';
import { topK } from '@/lib/mathEngine/sampling';
import { Advanced, BarList, Callout, Facts, Formula, Panel, StepFrame, tokenText } from './StepKit';

const PRESETS = [0.2, 0.7, 1, 1.5];
const pct = (v: number) => (v >= 0.1 ? `${(v * 100).toFixed(1)}%` : `${(v * 100).toFixed(2)}%`);

export function SoftmaxStep() {
    const probs = useSimulatorStore((s) => s.tensors.softmax?.probs);
    const temperature = useSimulatorStore((s) => s.temperature);
    const setTemperature = useSimulatorStore((s) => s.setTemperature);
    const top = useMemo(() => (probs ? topK(probs, 10) : []), [probs]);
    if (!probs) return null;

    const top10 = top.reduce((a, t) => a + t.prob, 0);

    return (
        <StepFrame
            step={PipelineStep.SOFTMAX}
            lede="Scores can be any number, so softmax converts them into probabilities between 0% and 100% that add up to exactly 100%. Temperature controls how confident that distribution is."
        >
            <Panel title="Temperature">
                <div className="sm-temp">
                    <input
                        type="range"
                        min={0.1}
                        max={2}
                        step={0.1}
                        value={temperature}
                        onChange={(e) => setTemperature(parseFloat(e.target.value))}
                        aria-label="Temperature"
                        aria-valuetext={temperature.toFixed(1)}
                    />
                    <output className="sm-temp-val">{temperature.toFixed(1)}</output>
                    <div className="sm-presets">
                        {PRESETS.map((p) => (
                            <button key={p} type="button" className="pill" aria-pressed={Math.abs(temperature - p) < 0.05} onClick={() => setTemperature(p)}>
                                {p}
                            </button>
                        ))}
                    </div>
                </div>
                <p className="sm-hint">
                    Below 1 sharpens the distribution (more predictable); above 1 flattens it (more varied). Drag it and watch the bars.
                </p>
            </Panel>

            <Panel title="Most likely next tokens" meta={`top 10 of ${VOCAB_SIZE}`}>
                <BarList
                    items={top.map((t, i) => ({ key: t.id, label: tokenText(idToToken(t.id)), value: t.prob, highlight: i === 0 }))}
                    max={Math.max(top[0]?.prob ?? 1, 0.05)}
                    format={pct}
                    ariaLabel="Top 10 probabilities"
                />
                <Facts items={[
                    { label: 'Top token', value: pct(top[0]?.prob ?? 0) },
                    { label: 'Top 10 together', value: pct(top10) },
                    { label: `Other ${VOCAB_SIZE - 10}`, value: pct(Math.max(0, 1 - top10)) },
                ]} />
            </Panel>

            <Callout tone="caveat" title="Why is the model so unsure?">
                At temperature 1 an untrained model spreads its bets almost evenly over hundreds of tokens — it has no reason to
                prefer any word. Training is what makes the right continuation stand out: a trained model typically puts most of its
                probability on a handful of sensible words.
            </Callout>
            <Advanced>
                <Formula>{`p_i = exp(z_i / T) / Σ_j exp(z_j / T)      # T = ${temperature.toFixed(1)}`}</Formula>
            </Advanced>
            <style>{`
                .sm-temp { display: flex; align-items: center; gap: var(--s3); flex-wrap: wrap; }
                .sm-temp input { flex: 1; min-width: 160px; accent-color: var(--ink); }
                .sm-temp-val { font-family: var(--font-mono); font-size: var(--text-md); color: var(--ink); font-weight: var(--weight-semibold); width: 3ch; text-align: right; }
                .sm-presets { display: flex; gap: 6px; }
                .sm-hint { font-size: var(--text-xs); color: var(--muted); }
            `}</style>
        </StepFrame>
    );
}
