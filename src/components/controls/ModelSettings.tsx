// Model settings for the simulator. Any change rebuilds the model with new
// random weights, so the walkthrough restarts from step 1.

import { useSimulatorStore } from '@/lib/store/simulatorStore';
import { countParameters } from '@/lib/store/stepMachine';

const D_MODEL = [4, 8, 16, 32, 64];
const HEADS = [1, 2, 4];
const CONTEXT = [4, 8, 12];

export function ModelSettings() {
    const config = useSimulatorStore((s) => s.config);
    const updateConfig = useSimulatorStore((s) => s.updateConfig);
    const params = countParameters(config);

    return (
        <section className="ms" aria-labelledby="ms-title">
            <h2 id="ms-title" className="ms-title">Model settings</h2>

            <Field label="Numbers per token" code="d_model" hint="Wider vectors can hold more information.">
                <div className="segmented ms-seg" role="radiogroup" aria-label="Numbers per token">
                    {D_MODEL.map((v) => (
                        <button key={v} type="button" role="radio" aria-checked={config.dModel === v}
                            onClick={() => updateConfig({ dModel: v, nHeads: v % config.nHeads === 0 ? config.nHeads : 1 })}>
                            {v}
                        </button>
                    ))}
                </div>
            </Field>

            <Field label="Attention heads" code="n_heads" hint={`Each head gets ${config.dModel / config.nHeads} numbers per token.`}>
                <div className="segmented ms-seg" role="radiogroup" aria-label="Attention heads">
                    {HEADS.map((v) => (
                        <button key={v} type="button" role="radio" aria-checked={config.nHeads === v}
                            disabled={config.dModel % v !== 0} onClick={() => updateConfig({ nHeads: v })}>
                            {v}
                        </button>
                    ))}
                </div>
            </Field>

            <Field label="Context window" code="max_tokens" hint="Longer inputs are cut off.">
                <div className="segmented ms-seg" role="radiogroup" aria-label="Context window in tokens">
                    {CONTEXT.map((v) => (
                        <button key={v} type="button" role="radio" aria-checked={config.maxTokens === v} onClick={() => updateConfig({ maxTokens: v })}>
                            {v}
                        </button>
                    ))}
                </div>
            </Field>

            <Field label="Random seed" code="seed" hint="Picks a different set of random weights.">
                <div className="ms-seed">
                    <input
                        className="input"
                        type="number"
                        min={0}
                        max={99999}
                        value={config.seed}
                        onChange={(e) => {
                            const v = Number(e.target.value);
                            if (Number.isFinite(v)) updateConfig({ seed: Math.max(0, Math.min(99999, Math.round(v))) });
                        }}
                        aria-label="Random seed"
                    />
                    <button type="button" className="btn btn-secondary btn-sm" onClick={() => updateConfig({ seed: Math.floor(Math.random() * 100000) })}>
                        Shuffle
                    </button>
                </div>
            </Field>

            <div className="ms-size">
                <span className="ms-size-num">{params.toLocaleString()}</span>
                <span className="ms-size-lbl">learned parameters in this model</span>
                <span className="ms-size-cmp">GPT-2 small: 124 million · GPT-3: 175 billion</span>
            </div>
            <p className="ms-note">Changing a setting builds a new model and restarts at step 1.</p>
            <style>{`
                .ms { display: flex; flex-direction: column; gap: var(--s4); }
                .ms-title { font-size: var(--text-xs); font-family: var(--font-mono); text-transform: uppercase; letter-spacing: var(--tracking-wide); color: var(--muted); font-weight: var(--weight-medium); }
                .ms-field { display: flex; flex-direction: column; gap: 6px; }
                .ms-label { display: flex; justify-content: space-between; gap: var(--s2); font-size: var(--text-sm); color: var(--ink); font-weight: var(--weight-medium); }
                .ms-label code { font-family: var(--font-mono); font-size: var(--text-2xs); color: var(--muted); font-weight: 400; }
                .ms-hint { font-size: var(--text-2xs); color: var(--muted); }
                .ms-seg { display: flex; width: 100%; }
                .ms-seg > button { flex: 1; padding: 0 6px; font-family: var(--font-mono); }
                .ms-seed { display: flex; gap: var(--s2); }
                .ms-seed .input { font-family: var(--font-mono); min-height: 36px; }
                .ms-size { display: flex; flex-direction: column; gap: 2px; padding: var(--s3); border-radius: var(--r-md); background: var(--bg-sunken); border: 1px solid var(--stroke); }
                .ms-size-num { font-size: var(--text-lg); font-weight: var(--weight-semibold); color: var(--ink); font-variant-numeric: tabular-nums; }
                .ms-size-lbl { font-size: var(--text-xs); color: var(--secondary); }
                .ms-size-cmp { font-size: var(--text-2xs); color: var(--muted); margin-top: 4px; }
                .ms-note { font-size: var(--text-2xs); color: var(--muted); }
            `}</style>
        </section>
    );
}

function Field({ label, code, hint, children }: { label: string; code: string; hint: string; children: React.ReactNode }) {
    return (
        <div className="ms-field">
            <span className="ms-label">{label} <code>{code}</code></span>
            {children}
            <span className="ms-hint">{hint}</span>
        </div>
    );
}
