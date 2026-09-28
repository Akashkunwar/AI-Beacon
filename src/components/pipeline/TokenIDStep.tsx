// src/components/pipeline/TokenIDStep.tsx
// Step 3: look up each token's ID in the vocabulary.

import { useSimulatorStore } from '@/lib/store/simulatorStore';
import { PipelineStep } from '@/lib/store/types';
import { UNK_ID, VOCAB_SIZE } from '@/lib/tokenizer/vocab';
import { Callout, Panel, Shapes, StepFrame } from './StepKit';
import { tokenText } from './stepUtils';

export function TokenIDStep() {
    const raw = useSimulatorStore((s) => s.tensors.tokens?.raw) ?? [];
    const ids = useSimulatorStore((s) => s.tensors.token_ids?.ids) ?? [];
    const unknown = raw.filter((_, i) => ids[i] === UNK_ID);

    return (
        <StepFrame
            step={PipelineStep.TOKEN_IDS}
            lede={`The model’s vocabulary is a numbered list of ${VOCAB_SIZE} tokens. Each token is replaced by its number (ID) in that list. From here on, the model only sees numbers.`}
        >
            <Panel title="Vocabulary lookup">
                <div className="sf-flow">
                    {raw.map((t, i) => (
                        <span key={`${t}-${i}`} className={`sf-chip ${ids[i] === UNK_ID ? 'is-unk' : ''}`}>
                            {tokenText(t)} <span className="sf-arrow">→</span> <strong>{ids[i]}</strong>
                        </span>
                    ))}
                </div>
                <div className="table-wrap">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th scope="col" className="num">Position</th>
                                <th scope="col">Token</th>
                                <th scope="col" className="num">ID</th>
                                <th scope="col">In vocabulary?</th>
                            </tr>
                        </thead>
                        <tbody>
                            {raw.map((t, i) => (
                                <tr key={`${t}-${i}`}>
                                    <td className="num">{i}</td>
                                    <td className="strong" style={{ fontFamily: 'var(--font-mono)' }}>{tokenText(t)}</td>
                                    <td className="num">{ids[i]}</td>
                                    <td>{ids[i] === UNK_ID ? 'No — mapped to <unk>' : 'Yes'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <Shapes items={[{ name: 'token_ids', shape: [ids.length] }]} />
            </Panel>

            {unknown.length > 0 ? (
                <Callout tone="caveat" title="Unknown words">
                    “{unknown.join('”, “')}” {unknown.length === 1 ? 'is' : 'are'} not in this demo’s small vocabulary, so {unknown.length === 1 ? 'it becomes' : 'they become'} the
                    special token &lt;unk&gt; (ID 0) and the model loses that information. Real tokenizers avoid this by breaking unfamiliar
                    words into smaller known pieces, down to single bytes if needed.
                </Callout>
            ) : (
                <Callout>
                    Every token was found. Note that the same token always gets the same ID, wherever it appears — the model will
                    only learn about word order in step 5.
                </Callout>
            )}
        </StepFrame>
    );
}
