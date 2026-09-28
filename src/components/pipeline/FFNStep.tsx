// src/components/pipeline/FFNStep.tsx
// Step 9: feed-forward network (expand → GELU → compress), then the block's
// second residual connection and layer norm.

import { useMemo, useState } from 'react';
import { useSimulatorStore } from '@/lib/store/simulatorStore';
import { PipelineStep } from '@/lib/store/types';
import { Advanced, Callout, DimBars, Formula, MatrixGrid, Panel, Shapes, StepFrame, TokenPicker } from './StepKit';
import { tokenText } from './stepUtils';

export function FFNStep() {
    const raw = useSimulatorStore((s) => s.tensors.tokens?.raw) ?? [];
    const X_norm = useSimulatorStore((s) => s.tensors.layernorm?.X_norm);
    const ffn = useSimulatorStore((s) => s.tensors.ffn);
    const dModel = useSimulatorStore((s) => s.config.dModel);
    const dFF = useSimulatorStore((s) => s.config.dFF);
    const [pick, setPick] = useState(Math.max(0, raw.length - 1));
    const m = useMemo(() => X_norm && ffn ? {
        x: X_norm.toMatrix(), pre: ffn.pre.toMatrix(), hid: ffn.hidden.toMatrix(), delta: ffn.delta.toMatrix(), out: ffn.output.toMatrix(),
    } : null, [X_norm, ffn]);
    if (!m || !ffn) return null;

    const labels = raw.map(tokenText);
    const row = Math.min(pick, raw.length - 1);
    const hMax = Math.max(1e-6, ...m.pre[row].map(Math.abs));
    const negBefore = m.pre[row].filter((v) => v < 0).length;

    return (
        <StepFrame
            step={PipelineStep.FFN}
            lede={`Now each token is processed on its own by a small two-layer neural network. It expands the ${dModel} numbers to ${dFF}, applies a non-linear “activation”, and compresses back to ${dModel}. Most of a language model’s parameters live in these layers.`}
        >
            <Panel title={`Inside the network, for “${labels[row]}”`}>
                <TokenPicker tokens={labels} value={row} onChange={setPick} />
                <div className="ff-flow">
                    <div>
                        <p className="field-label">1 · Input ({dModel} numbers)</p>
                        <MatrixGrid rows={[m.x[row]]} rowLabels={['x']} scale="signed" ariaLabel="FFN input" />
                    </div>
                    <div>
                        <p className="field-label">2 · Expand: multiply by W₁ → {dFF} numbers</p>
                        <DimBars values={m.pre[row]} maxAbs={hMax} height={72} ariaLabel="Expanded hidden layer before activation" />
                    </div>
                    <div>
                        <p className="field-label">3 · Activate: GELU squashes negative values toward zero</p>
                        <DimBars values={m.hid[row]} maxAbs={hMax} height={72} ariaLabel="Hidden layer after GELU" />
                        <p className="ff-note">{negBefore} of {dFF} values were negative before GELU; almost all of them are now near zero.</p>
                    </div>
                    <div>
                        <p className="field-label">4 · Compress: multiply by W₂ → {dModel} numbers</p>
                        <MatrixGrid rows={[m.delta[row]]} rowLabels={['FFN(x)']} scale="signed" ariaLabel="FFN output" />
                    </div>
                    <div>
                        <p className="field-label">5 · Add back and normalize (as in steps 7–8)</p>
                        <MatrixGrid rows={[m.out[row]]} rowLabels={['output']} scale="signed" ariaLabel="Block output" />
                    </div>
                </div>
            </Panel>

            <Panel title="Output of the transformer block — all tokens">
                <MatrixGrid rows={m.out} rowLabels={labels} scale="signed" highlightRow={row} ariaLabel="Block output for all tokens" />
                <Shapes items={[
                    { name: 'W₁', shape: ffn.W1.shape }, { name: 'hidden', shape: ffn.hidden.shape },
                    { name: 'W₂', shape: ffn.W2.shape }, { name: 'output', shape: ffn.output.shape },
                ]} />
            </Panel>

            <div className="sf-split">
                <Callout title="Why the activation matters">
                    Without GELU, the two multiplications would collapse into a single one, and stacking layers would add no power.
                    The bend it introduces is what lets the network represent complicated patterns.
                </Callout>
                <Callout tone="caveat" title="One block of many">
                    That completes one transformer block. Real models repeat steps 6–9 many times — 12 blocks in GPT-2 small,
                    32 in Llama 3 8B, 96 in GPT-3 — each with its own weights. This demo has one.
                </Callout>
            </div>
            <Advanced>
                <Formula>
{`FFN(x) = GELU(x · W₁) · W₂        # W₁: (${dModel}, ${dFF})  W₂: (${dFF}, ${dModel})
out    = LayerNorm(x + FFN(x))`}
                </Formula>
            </Advanced>
            <style>{`
                .ff-flow { display: flex; flex-direction: column; gap: var(--s3); }
                .ff-flow .field-label { display: block; margin-bottom: 4px; }
                .ff-note { font-size: var(--text-xs); color: var(--muted); margin-top: 4px; }
            `}</style>
        </StepFrame>
    );
}
