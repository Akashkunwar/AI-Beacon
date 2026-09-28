// src/components/pipeline/ResidualStep.tsx
// Step 7: add attention's output back onto its input.

import { useMemo } from 'react';
import { useSimulatorStore } from '@/lib/store/simulatorStore';
import { PipelineStep } from '@/lib/store/types';
import { Advanced, Callout, Formula, MatrixGrid, Panel, Shapes, StepFrame } from './StepKit';
import { tokenText } from './stepUtils';

export function ResidualStep() {
    const raw = useSimulatorStore((s) => s.tensors.tokens?.raw) ?? [];
    const X_pos = useSimulatorStore((s) => s.tensors.posenc?.X_pos);
    const attnOut = useSimulatorStore((s) => s.tensors.attention?.multihead_out);
    const X_res = useSimulatorStore((s) => s.tensors.residual?.X_res);
    const m = useMemo(() => X_pos && attnOut && X_res
        ? { a: X_pos.toMatrix(), b: attnOut.toMatrix(), c: X_res.toMatrix() }
        : null, [X_pos, attnOut, X_res]);
    if (!m || !X_res) return null;

    const labels = raw.map(tokenText);
    const max = Math.max(1e-6, ...m.a.flat().map(Math.abs), ...m.b.flat().map(Math.abs), ...m.c.flat().map(Math.abs));

    return (
        <StepFrame
            step={PipelineStep.RESIDUAL}
            lede="Attention’s result is not used on its own. It is added, number by number, onto the vectors that went into attention. Each token keeps what it already knew and gains what it learned from the others."
        >
            <Panel title="Input + attention output = new vectors" meta="same colour scale for all three">
                <div className="rs-stack">
                    <div><p className="field-label">What went into attention (step 5)</p><MatrixGrid rows={m.a} rowLabels={labels} scale="signed" maxAbs={max} ariaLabel="Attention input" /></div>
                    <p className="rs-op" aria-hidden="true">+</p>
                    <div><p className="field-label">What attention produced (step 6)</p><MatrixGrid rows={m.b} rowLabels={labels} scale="signed" maxAbs={max} ariaLabel="Attention output" /></div>
                    <p className="rs-op" aria-hidden="true">=</p>
                    <div><p className="field-label">Result</p><MatrixGrid rows={m.c} rowLabels={labels} scale="signed" maxAbs={max} ariaLabel="Residual sum" /></div>
                </div>
                <Shapes items={[{ name: 'X_pos', shape: X_pos!.shape }, { name: 'attention', shape: attnOut!.shape }, { name: 'X_res', shape: X_res.shape }]} />
            </Panel>
            <Callout title="Why add instead of replace?">
                The shortcut means each layer only has to learn a small <em>change</em> to the vectors, and the original information
                is never lost. It also gives the training signal a direct path through the network, which is what makes it possible
                to stack dozens of layers — without residual connections, very deep models barely train.
            </Callout>
            <Advanced>
                <Formula>{`X_res = X_pos + Attention(X_pos)     # element-wise, shapes must match`}</Formula>
            </Advanced>
            <style>{`
                .rs-stack { display: flex; flex-direction: column; gap: var(--s2); }
                .rs-stack .field-label { display: block; margin-bottom: 4px; }
                .rs-op { font-family: var(--font-mono); font-size: var(--text-lg); color: var(--muted); line-height: 1; padding-left: var(--s2); }
            `}</style>
        </StepFrame>
    );
}
