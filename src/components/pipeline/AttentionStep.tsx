// src/components/pipeline/AttentionStep.tsx
// Step 6: multi-head causal self-attention. The headline view is the
// attention-weight grid ("who looks at whom"); tabs below show how the
// weights and the output are computed. All maths comes from stepMachine.ts.

import { useMemo, useState } from 'react';
import { useSimulatorStore } from '@/lib/store/simulatorStore';
import { PipelineStep } from '@/lib/store/types';
import { Advanced, BarList, Callout, Formula, MatrixGrid, Panel, Shapes, StepFrame } from './StepKit';
import { tokenText } from './stepUtils';

type Tab = 'qkv' | 'scores' | 'output';
const TABS: { id: Tab; label: string }[] = [
    { id: 'qkv', label: '1 · Queries, keys, values' },
    { id: 'scores', label: '2 · Scores → weights' },
    { id: 'output', label: '3 · Mix the values' },
];

export function AttentionStep() {
    const raw = useSimulatorStore((s) => s.tensors.tokens?.raw) ?? [];
    const attn = useSimulatorStore((s) => s.tensors.attention);
    const nHeads = useSimulatorStore((s) => s.config.nHeads);
    const dModel = useSimulatorStore((s) => s.config.dModel);
    const [headIdx, setHeadIdx] = useState(0);
    const [tab, setTab] = useState<Tab>('qkv');

    const h = Math.min(headIdx, (attn?.heads.length ?? 1) - 1);
    const head = attn?.heads[h];
    const m = useMemo(() => head && attn ? {
        W: head.weights.toMatrix(),
        S: head.scores.toMatrix(),
        Q: head.Q.toMatrix(),
        K: head.K.toMatrix(),
        V: head.V.toMatrix(),
        O: head.output.toMatrix(),
        C: attn.concat.toMatrix(),
        A: attn.multihead_out.toMatrix(),
    } : null, [head, attn]);
    if (!attn || !head || !m) return null;

    const labels = raw.map(tokenText);
    const n = raw.length;
    const dHead = head.Q.shape[1];
    const last = n - 1;
    const lastRow = m.W[last].map((w, j) => ({ key: j, label: labels[j], value: w }))
        .sort((a, b) => b.value - a.value);
    const top = lastRow[0];

    return (
        <StepFrame
            step={PipelineStep.ATTENTION}
            lede="This is where tokens share information. Every token looks back at itself and the tokens before it, decides how relevant each one is, and pulls in a weighted mix of what they contain."
        >
            {nHeads > 1 && (
                <div className="at-heads">
                    <span className="field-label">Attention head</span>
                    <div className="segmented" role="tablist" aria-label="Choose an attention head">
                        {attn.heads.map((_, i) => (
                            <button key={i} type="button" role="tab" aria-selected={h === i} onClick={() => setHeadIdx(i)}>Head {i + 1}</button>
                        ))}
                    </div>
                    <span className="at-heads-note">Each head has its own weights, so each can learn to look for something different.</span>
                </div>
            )}

            <div className="at-top">
                <Panel title="Who looks at whom" meta={nHeads > 1 ? `head ${h + 1} of ${nHeads}` : undefined}>
                    <p className="at-axis">Each row is a token; the cells show how much of its attention goes to each earlier token. Every row adds up to 1.</p>
                    <MatrixGrid
                        rows={m.W}
                        rowLabels={labels}
                        colLabels={labels}
                        colNoun="→"
                        scale="heat"
                        causal
                        values="always"
                        ariaLabel={`Attention weights, ${n} by ${n}, future positions masked`}
                    />
                </Panel>
                <Panel title={`What “${labels[last]}” looks at`}>
                    <p className="at-axis">The last token matters most: its result is what the model uses to predict the next word.</p>
                    <BarList
                        items={lastRow.map((r, i) => ({ ...r, highlight: i === 0 }))}
                        max={1}
                        format={(v) => `${(v * 100).toFixed(0)}%`}
                        ariaLabel={`Attention of the last token`}
                    />
                    <p className="at-sum">
                        “{labels[last]}” gives <strong>{(top.value * 100).toFixed(0)}%</strong> of its attention to “{top.label}”.
                    </p>
                </Panel>
            </div>

            <Callout tone="caveat">
                The grey hatched cells are <strong>masked</strong>: a token may not look at tokens that come after it, because when
                the model generates text those words do not exist yet. With random weights the pattern has no meaning; trained heads
                learn patterns such as “look at the previous word” or “look at the subject of the sentence”.
            </Callout>

            <Panel title="How the weights are computed">
                <div className="segmented at-tabs" role="tablist" aria-label="Attention sub-steps">
                    {TABS.map((t) => (
                        <button key={t.id} type="button" role="tab" aria-selected={tab === t.id} onClick={() => setTab(t.id)}>{t.label}</button>
                    ))}
                </div>

                {tab === 'qkv' && (
                    <div className="at-pane">
                        <p className="at-text">
                            Each token’s vector is multiplied by three learned matrices, giving three new vectors of {dHead} numbers per head.
                            Think of a library: the <strong>query</strong> is what a token is looking for, the <strong>key</strong> is the
                            label on what it contains, and the <strong>value</strong> is the content it will hand over.
                        </p>
                        <div className="sf-split">
                            <div><p className="field-label">Q — queries</p><MatrixGrid rows={m.Q} rowLabels={labels} scale="signed" ariaLabel="Query vectors" /></div>
                            <div><p className="field-label">K — keys</p><MatrixGrid rows={m.K} rowLabels={labels} scale="signed" ariaLabel="Key vectors" /></div>
                            <div><p className="field-label">V — values</p><MatrixGrid rows={m.V} rowLabels={labels} scale="signed" ariaLabel="Value vectors" /></div>
                        </div>
                        <Shapes items={[
                            { name: 'W_Q, W_K, W_V', shape: attn.WQ.shape, note: 'all heads side by side' },
                            { name: `Q, K, V (head ${h + 1})`, shape: head.Q.shape },
                        ]} />
                        <Advanced>
                            <Formula caption={`Head ${h + 1} uses columns ${h * dHead}–${(h + 1) * dHead - 1} of each projection.`}>
{`Q = X · W_Q    K = X · W_K    V = X · W_V      # (${n}, ${dModel}) each
Q_h, K_h, V_h = columns of head h              # (${n}, ${dHead})`}
                            </Formula>
                        </Advanced>
                    </div>
                )}

                {tab === 'scores' && (
                    <div className="at-pane">
                        <p className="at-text">
                            Every query is compared with every key using a dot product (multiply matching numbers and add them up). A high
                            score means “this key matches what I’m looking for”. Scores are divided by √{dHead} to keep them in a stable range,
                            future positions are masked, and a softmax turns each row into percentages — the grid at the top of this step.
                        </p>
                        <p className="field-label">Raw scores (before mask and softmax)</p>
                        <MatrixGrid rows={m.S} rowLabels={labels} colLabels={labels} colNoun="→" scale="signed" values="always" ariaLabel="Raw attention scores" />
                        <Advanced>
                            <Formula>
{`scores  = Q_h · K_hᵀ / √${dHead}                 # (${n}, ${n})
scores[i][j] = −∞  where j > i           # causal mask
weights = softmax(scores, each row)     # rows sum to 1`}
                            </Formula>
                        </Advanced>
                    </div>
                )}

                {tab === 'output' && (
                    <div className="at-pane">
                        <p className="at-text">
                            Each token’s new vector is a weighted average of the value vectors, using its row of attention weights.
                            {nHeads > 1 ? ` The ${nHeads} heads’ results are placed side by side` : ' The result'} and multiplied by one more
                            matrix, W_O, which brings it back to {dModel} numbers per token.
                        </p>
                        <div className="sf-split">
                            <div><p className="field-label">Head {h + 1} output</p><MatrixGrid rows={m.O} rowLabels={labels} scale="signed" ariaLabel="Head output" /></div>
                            <div><p className="field-label">Attention output (after W_O)</p><MatrixGrid rows={m.A} rowLabels={labels} scale="signed" ariaLabel="Attention output" /></div>
                        </div>
                        <Shapes items={[
                            { name: 'head output', shape: head.output.shape },
                            { name: 'concat', shape: attn.concat.shape },
                            { name: 'W_O', shape: attn.WO.shape },
                            { name: 'attention output', shape: attn.multihead_out.shape },
                        ]} />
                        <Advanced>
                            <Formula>
{`out_h = weights_h · V_h                       # (${n}, ${dHead})
out   = concat(out_1 … out_${nHeads}) · W_O           # (${n}, ${dModel})`}
                            </Formula>
                        </Advanced>
                    </div>
                )}
            </Panel>
            <style>{`
                .at-heads { display: flex; align-items: center; gap: var(--s3); flex-wrap: wrap; }
                .at-heads-note { font-size: var(--text-xs); color: var(--muted); }
                .at-top { display: grid; grid-template-columns: minmax(0, 1.25fr) minmax(0, 1fr); gap: var(--s4); align-items: start; }
                .at-axis { font-size: var(--text-xs); color: var(--muted); }
                .at-sum { font-size: var(--text-sm); color: var(--secondary); }
                .at-sum strong { color: var(--ink); }
                .at-tabs { align-self: flex-start; max-width: 100%; overflow-x: auto; }
                .at-pane { display: flex; flex-direction: column; gap: var(--s3); }
                .at-text { font-size: var(--text-sm); color: var(--secondary); line-height: var(--lead-body); max-width: 72ch; }
                .at-text strong { color: var(--ink); }
                .at-pane .field-label { display: block; margin-bottom: 4px; }
                @media (max-width: 899px) { .at-top { grid-template-columns: 1fr; } }
            `}</style>
        </StepFrame>
    );
}
