// src/components/pipeline/LMHeadStep.tsx
// Step 10: project the last token's vector onto the vocabulary → logits.

import { useMemo } from 'react';
import { useSimulatorStore } from '@/lib/store/simulatorStore';
import { PipelineStep } from '@/lib/store/types';
import { idToToken, VOCAB_SIZE } from '@/lib/tokenizer/vocab';
import { topK } from '@/lib/mathEngine/sampling';
import { Advanced, BarList, Callout, Facts, Formula, MatrixGrid, Panel, Shapes, StepFrame, tokenText } from './StepKit';

export function LMHeadStep() {
    const raw = useSimulatorStore((s) => s.tensors.tokens?.raw) ?? [];
    const lm = useSimulatorStore((s) => s.tensors.lm_head);
    const out = useSimulatorStore((s) => s.tensors.ffn?.output);
    const dModel = useSimulatorStore((s) => s.config.dModel);
    const top = useMemo(() => (lm ? topK(lm.logits, 10) : []), [lm]);
    const range = useMemo(() => {
        if (!lm) return { min: 0, max: 0 };
        const d = Array.from(lm.logits.data);
        return { min: Math.min(...d), max: Math.max(...d) };
    }, [lm]);
    if (!lm || !out) return null;

    const last = tokenText(raw[raw.length - 1] ?? '');
    const lastVec = out.row(out.shape[0] - 1).toArray();

    return (
        <StepFrame
            step={PipelineStep.LM_HEAD}
            lede={`Time to predict. The final vector of the last token (“${last}”) is multiplied by one more matrix, which produces one score — a logit — for each of the ${VOCAB_SIZE} tokens in the vocabulary. A higher score means “more likely to come next”.`}
        >
            <Panel title={`The vector for “${last}”, after the transformer block`}>
                <MatrixGrid rows={[lastVec]} rowLabels={[last]} scale="signed" ariaLabel="Final vector of the last token" />
            </Panel>

            <Panel title={`Highest scores out of ${VOCAB_SIZE}`} meta={`all scores range from ${range.min.toFixed(1)} to ${range.max.toFixed(1)}`}>
                <BarList
                    items={top.map((t, i) => ({ key: t.id, label: tokenText(idToToken(t.id)), value: t.prob, highlight: i === 0 }))}
                    format={(v) => v.toFixed(2)}
                    ariaLabel="Top 10 logits"
                />
                <Facts items={[
                    { label: 'Scores computed', value: VOCAB_SIZE },
                    { label: 'Output matrix', value: `${dModel} × ${VOCAB_SIZE}` },
                    { label: 'Parameters', value: (dModel * VOCAB_SIZE).toLocaleString() },
                ]} />
                <Shapes items={[{ name: 'W_lm', shape: lm.W_lm.shape }, { name: 'logits', shape: lm.logits.shape }]} />
            </Panel>

            <Callout title="Why only the last token?">
                Thanks to attention, the last token’s vector already carries information from the whole sentence, and it is the
                position right before the word we want. During training every position predicts its own next token in parallel,
                but when generating text only the last one is needed.
            </Callout>
            <Advanced>
                <Formula>{`logits = h_last · W_lm        # (1, ${dModel}) × (${dModel}, ${VOCAB_SIZE}) → (${VOCAB_SIZE},)`}</Formula>
            </Advanced>
        </StepFrame>
    );
}
