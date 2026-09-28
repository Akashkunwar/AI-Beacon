// src/components/pipeline/LayerNormStep.tsx
// Step 8: normalise each token's vector to mean 0 and standard deviation 1.

import { useMemo, useState } from 'react';
import { useSimulatorStore } from '@/lib/store/simulatorStore';
import { PipelineStep } from '@/lib/store/types';
import { Advanced, Callout, DimBars, Facts, Formula, MatrixGrid, Panel, Shapes, StepFrame, TokenPicker } from './StepKit';
import { tokenText } from './stepUtils';

export function LayerNormStep() {
    const raw = useSimulatorStore((s) => s.tensors.tokens?.raw) ?? [];
    const X_res = useSimulatorStore((s) => s.tensors.residual?.X_res);
    const ln = useSimulatorStore((s) => s.tensors.layernorm);
    const [pick, setPick] = useState(0);
    const m = useMemo(() => X_res && ln ? { before: X_res.toMatrix(), after: ln.X_norm.toMatrix() } : null, [X_res, ln]);
    if (!m || !X_res || !ln) return null;

    const labels = raw.map(tokenText);
    const row = Math.min(pick, raw.length - 1);
    const b = X_res.row(row).stats();
    const a = ln.X_norm.row(row).stats();
    const max = Math.max(1e-6, ...m.before[row].map(Math.abs), ...m.after[row].map(Math.abs));

    return (
        <StepFrame
            step={PipelineStep.LAYER_NORM}
            lede="As vectors pass through layers, their values can drift larger or smaller. Layer normalization rescales each token’s vector so its numbers average 0 and have a spread (standard deviation) of 1."
        >
            <Panel title="One token, before and after">
                <TokenPicker tokens={labels} value={row} onChange={setPick} />
                <div className="sf-split">
                    <div className="ln-col">
                        <p className="field-label">Before</p>
                        <DimBars values={m.before[row]} maxAbs={max} ariaLabel="Vector before normalization" />
                        <Facts items={[{ label: 'Mean', value: b.mean.toFixed(3) }, { label: 'Std dev', value: b.std.toFixed(3) }]} />
                    </div>
                    <div className="ln-col">
                        <p className="field-label">After</p>
                        <DimBars values={m.after[row]} maxAbs={max} ariaLabel="Vector after normalization" />
                        <Facts items={[{ label: 'Mean', value: Math.abs(a.mean) < 5e-4 ? '0.000' : a.mean.toFixed(3) }, { label: 'Std dev', value: a.std.toFixed(3) }]} />
                    </div>
                </div>
                <p className="ln-note">The shape of the vector is preserved — which numbers are high or low — only its centre and scale change.</p>
            </Panel>

            <Panel title="All tokens after normalization">
                <MatrixGrid rows={m.after} rowLabels={labels} scale="signed" highlightRow={row} ariaLabel="Normalized vectors" />
                <Shapes items={[{ name: 'X_norm', shape: ln.X_norm.shape }, { name: 'γ, β', shape: ln.gamma.shape }]} />
            </Panel>

            <Callout>
                After normalizing, the model multiplies by a learned scale (γ) and adds a learned shift (β), so it can undo the
                normalization where that helps. They start at 1 and 0, which is what you see here.
            </Callout>
            <Advanced>
                <Formula>
{`μ = mean(x)     σ² = mean((x − μ)²)
LayerNorm(x) = γ · (x − μ) / √(σ² + ε) + β      # ε = 1e-5`}
                </Formula>
            </Advanced>
            <style>{`
                .ln-col { display: flex; flex-direction: column; gap: var(--s2); }
                .ln-note { font-size: var(--text-xs); color: var(--muted); }
            `}</style>
        </StepFrame>
    );
}
