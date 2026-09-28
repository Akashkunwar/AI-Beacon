// src/components/pipeline/EmbeddingStep.tsx
// Step 4: each token ID selects one row of the embedding table.

import { useMemo } from 'react';
import { useSimulatorStore } from '@/lib/store/simulatorStore';
import { PipelineStep } from '@/lib/store/types';
import { VOCAB_SIZE } from '@/lib/tokenizer/vocab';
import { Advanced, Callout, Facts, Formula, MatrixGrid, Panel, Shapes, StepFrame, tokenText } from './StepKit';

export function EmbeddingStep() {
    const raw = useSimulatorStore((s) => s.tensors.tokens?.raw) ?? [];
    const ids = useSimulatorStore((s) => s.tensors.token_ids?.ids) ?? [];
    const embed = useSimulatorStore((s) => s.tensors.embed);
    const dModel = useSimulatorStore((s) => s.config.dModel);
    const rows = useMemo(() => embed?.X.toMatrix() ?? [], [embed]);
    if (!embed) return null;

    const repeated = raw.find((t, i) => raw.indexOf(t) !== i);

    return (
        <StepFrame
            step={PipelineStep.EMBEDDING}
            lede={`Each ID picks one row from a big table — the embedding table. That row is a list of ${dModel} numbers (a vector) that stands for the token. Everything the model does from now on is arithmetic on these vectors.`}
        >
            <Panel title="Token vectors" meta={`${raw.length} tokens × ${dModel} numbers`}>
                <MatrixGrid
                    rows={rows}
                    rowLabels={raw.map((t, i) => `${tokenText(t)} · ${ids[i]}`)}
                    scale="signed"
                    ariaLabel={`Embedding vectors: ${raw.length} rows of ${dModel} numbers`}
                />
                <Facts
                    items={[
                        { label: 'Numbers per token', value: dModel, hint: 'd_model — change it in Settings' },
                        { label: 'Embedding table', value: `${VOCAB_SIZE} × ${dModel}` },
                        { label: 'Parameters in table', value: (VOCAB_SIZE * dModel).toLocaleString() },
                    ]}
                />
                <Shapes items={[{ name: 'W_e', shape: embed.We.shape }, { name: 'X', shape: embed.X.shape }]} />
            </Panel>

            <div className="sf-split">
                <Callout title="Reading the grid">
                    Each row is one token; each cell is one of its numbers. Blue cells are positive, red are negative, and stronger
                    colour means a larger value. Hover a cell to read it.
                    {repeated && <> Notice that both “{repeated}” rows are identical — nothing yet tells them apart.</>}
                </Callout>
                <Callout tone="caveat" title="Why the numbers look random">
                    They are. In a trained model, these vectors are learned so that tokens used in similar ways (say “cat” and “dog”)
                    end up close together. This demo’s table has never been trained.
                </Callout>
            </div>
            <Advanced>
                <Formula caption="A lookup, not a multiplication: row i of W_e is the vector for token ID i. It is scaled so each vector has roughly unit length.">
{`W_e ~ Normal(0, 1) / √d_model      # shape (${VOCAB_SIZE}, ${dModel})
X[i] = W_e[token_ids[i]]           # shape (${raw.length}, ${dModel})`}
                </Formula>
            </Advanced>
        </StepFrame>
    );
}
