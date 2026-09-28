// src/components/pipeline/TokenizationStep.tsx
// Step 2: split the text into tokens.

import { useSimulatorStore } from '@/lib/store/simulatorStore';
import { PipelineStep } from '@/lib/store/types';
import { VOCAB_SIZE } from '@/lib/tokenizer/vocab';
import { Advanced, Callout, Facts, Formula, Panel, StepFrame, tokenText } from './StepKit';

export function TokenizationStep() {
    const inputText = useSimulatorStore((s) => s.inputText);
    const tokens = useSimulatorStore((s) => s.tensors.tokens);
    const maxTokens = useSimulatorStore((s) => s.config.maxTokens);
    const raw = tokens?.raw ?? [];
    const dropped = tokens?.dropped ?? 0;

    return (
        <StepFrame
            step={PipelineStep.TOKENIZE}
            lede="A model does not read letters or whole sentences. It reads tokens — small chunks of text from a fixed list it knows. First, your sentence is cut into those chunks."
        >
            <Panel title="From text to tokens">
                <p className="tk-source">“{inputText.trim()}”</p>
                <div className="sf-flow" aria-label={`${raw.length} tokens`}>
                    {raw.map((t, i) => (
                        <span key={`${t}-${i}`} className="sf-chip">
                            {tokenText(t)}
                            <span className="sf-chip-id">#{i}</span>
                        </span>
                    ))}
                </div>
                {dropped > 0 && (
                    <Callout tone="caveat">
                        {dropped} token{dropped === 1 ? ' was' : 's were'} cut off: this model’s context window is {maxTokens} tokens.
                        Real models have the same limit, just far larger.
                    </Callout>
                )}
                <Facts
                    items={[
                        { label: 'Tokens', value: raw.length },
                        { label: 'Vocabulary', value: `${VOCAB_SIZE} tokens` },
                        { label: 'Method', value: 'Words + punctuation' },
                    ]}
                />
            </Panel>

            <Callout title="How real tokenizers differ">
                <p>
                    This demo keeps things readable by splitting on words and punctuation, and it lowercases everything.
                    Real models use <strong>subword</strong> tokenizers such as byte-pair encoding (BPE): frequent words stay whole,
                    while rarer words are split into reusable pieces — a word like “tokenization” may become “token” + “ization”.
                    That way a vocabulary of 50,000–200,000 pieces can spell any text.
                </p>
            </Callout>
            <Advanced>
                <Formula caption="The demo tokenizer, as a regular expression.">
{`tokens = text.lower().findall(r"[\\w]+|[^\\s\\w]")[:max_tokens]
# "Hello, world!" → ["hello", ",", "world", "!"]`}
                </Formula>
            </Advanced>
            <style>{`.tk-source { font-family: var(--font-mono); font-size: var(--text-sm); color: var(--secondary); }`}</style>
        </StepFrame>
    );
}
