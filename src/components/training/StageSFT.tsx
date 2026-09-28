// Stage 6 — Teach it to follow instructions (supervised fine-tuning).

import { useState } from 'react';
import { Block, Note, Sources, StatGrid, Tabs } from './TrainingKit';

const EXAMPLES = [
    {
        id: 'fact',
        label: 'A question',
        prompt: 'What is the capital of Japan?',
        base: 'What is the capital of South Korea? What is the capital of China? Test your geography with these 50 capital-city quiz questions…',
        tuned: 'The capital of Japan is Tokyo.',
    },
    {
        id: 'poem',
        label: 'A task',
        prompt: 'Write a haiku about autumn.',
        base: 'Write a haiku about winter. Write a haiku about spring. These seasonal writing prompts are perfect for grade 4 students…',
        tuned: 'Crisp leaves drift and fall\nthe maple lets go of red\ncold wind hums along',
    },
    {
        id: 'code',
        label: 'Code',
        prompt: 'How do I reverse a list in Python?',
        base: 'How do I reverse a string in Python? How do I sort a list of dictionaries by value? [closed] Asked 9 years ago…',
        tuned: 'Use my_list.reverse() to reverse it in place, or my_list[::-1] to get a reversed copy.',
    },
] as const;
type ExampleId = typeof EXAMPLES[number]['id'];

// One chat-formatted training example, split into display chunks.
const CHAT = [
    { role: 'system', text: '<|system|>', special: true },
    { role: 'system', text: 'You are a helpful assistant.' },
    { role: 'user', text: '<|user|>', special: true },
    { role: 'user', text: 'What is the capital of Japan?' },
    { role: 'assistant', text: '<|assistant|>', special: true },
    { role: 'assistant', text: 'The capital of Japan is Tokyo.' },
    { role: 'assistant', text: '<|end|>', special: true },
] as const;

const RANKS = [1, 2, 4, 8, 16, 32, 64, 128];

export function StageSFT() {
    const [exId, setExId] = useState<ExampleId>('fact');
    const ex = EXAMPLES.find((e) => e.id === exId)!;
    const [showLoss, setShowLoss] = useState(true);
    const [rankIdx, setRankIdx] = useState(4);
    const d = 4096;
    const r = RANKS[rankIdx];
    const full = d * d;
    const lora = 2 * d * r;

    return (
        <>
            <Block
                title="Before and after fine-tuning"
                intro="A base model has learned to continue text the way the internet does. Fine-tuning teaches it the assistant pattern. These examples are illustrative, but typical of real base models."
                aside={<Tabs label="Example" value={exId} onChange={setExId} options={EXAMPLES.map((e) => ({ id: e.id, label: e.label }))} />}
            >
                <div className="sft-prompt"><span className="tk-label">Prompt</span><p>{ex.prompt}</p></div>
                <div className="tk-two">
                    <figure className="tk-panel sft-out">
                        <figcaption className="tk-label">Base model continues the text</figcaption>
                        <p className="sft-base">{ex.base}</p>
                    </figure>
                    <figure className="tk-panel sft-out is-tuned">
                        <figcaption className="tk-label">After fine-tuning, it answers</figcaption>
                        <p className="sft-tuned">{ex.tuned}</p>
                    </figure>
                </div>
            </Block>

            <Block
                title="What one training example looks like"
                intro="Conversations are written in a fixed chat format with special tokens marking who is speaking. The model is trained exactly as in pre-training — predict the next token — but the loss usually counts only the assistant’s reply, so it learns to answer, not to imitate users."
                aside={
                    <label className="sft-toggle">
                        <input type="checkbox" checked={showLoss} onChange={(e) => setShowLoss(e.target.checked)} />
                        Highlight tokens that are trained on
                    </label>
                }
            >
                <div className="tk-panel">
                    <div className="sft-chat">
                        {CHAT.map((c, i) => {
                            const trained = showLoss && c.role === 'assistant' && c.text !== '<|assistant|>';
                            return (
                                <span key={i} className={`sft-chunk ${'special' in c ? 'is-special' : ''} ${trained ? 'is-trained' : showLoss ? 'is-masked' : ''}`}>
                                    {c.text}
                                </span>
                            );
                        })}
                    </div>
                    {showLoss && (
                        <div className="tk-legend">
                            <span><i style={{ background: 'var(--viz-1)' }} />counted in the loss</span>
                            <span><i style={{ background: 'var(--bg-raised)', border: '1px solid var(--stroke-dark)' }} />context only (masked)</span>
                        </div>
                    )}
                    <p className="sft-cap">The exact special tokens differ between model families; the idea is the same.</p>
                </div>
            </Block>

            <Block title="How much data does it take?" intro="Far less than pre-training. Quality matters more than quantity, and today most examples are written or filtered with the help of other models.">
                <StatGrid
                    items={[
                        { label: 'InstructGPT · 2022', value: '≈13,000', hint: 'prompts with answers written by paid labellers' },
                        { label: 'LIMA · 2023', value: '1,000', hint: 'carefully chosen examples were enough for a strong assistant' },
                        { label: 'Llama 2-Chat · 2023', value: '27,540', hint: 'high-quality human-written examples' },
                    ]}
                />
                <Note>
                    The LIMA authors argued that a model learns almost all its knowledge in pre-training; fine-tuning mostly teaches it
                    which style and format to use when talking to people.
                </Note>
                <Sources items={[
                    { label: 'Ouyang et al. 2022 (InstructGPT)', url: 'https://arxiv.org/abs/2203.02155' },
                    { label: 'Zhou et al. 2023 (LIMA)', url: 'https://arxiv.org/abs/2305.11206' },
                    { label: 'Touvron et al. 2023 (Llama 2)', url: 'https://arxiv.org/abs/2307.09288' },
                ]} />
            </Block>

            <Block
                title="Try it: fine-tune cheaply with LoRA"
                intro="Updating every weight of a large model needs a lot of GPU memory. LoRA (low-rank adaptation) freezes the original weights and trains two thin matrices beside each large one; their product is added to the frozen weights."
            >
                <div className="tk-panel">
                    <label className="tk-range">
                        <span className="tk-label">LoRA rank r</span>
                        <input type="range" min={0} max={RANKS.length - 1} step={1} value={rankIdx} onChange={(e) => setRankIdx(+e.target.value)} aria-label="LoRA rank" />
                        <output>r = {r}</output>
                    </label>
                    <div className="sft-lora" aria-hidden="true">
                        <div className="sft-mat is-frozen"><span>W · {d} × {d}<br />frozen</span></div>
                        <span className="sft-op">+</span>
                        <div className="sft-mat is-a" style={{ width: Math.max(4, (r / 128) * 60) }} title={`A: ${d} × ${r}`} />
                        <span className="sft-op">×</span>
                        <div className="sft-mat is-b" style={{ height: Math.max(4, (r / 128) * 60) }} title={`B: ${r} × ${d}`} />
                    </div>
                    <StatGrid
                        items={[
                            { label: 'Full fine-tuning', value: `${(full / 1e6).toFixed(1)}M`, hint: 'trainable weights in one 4096 × 4096 matrix' },
                            { label: 'With LoRA', value: lora >= 1e6 ? `${(lora / 1e6).toFixed(2)}M` : `${(lora / 1e3).toFixed(1)}K`, hint: `2 × 4096 × ${r}` },
                            { label: 'Fraction trained', value: `${((lora / full) * 100).toFixed(2)}%` },
                        ]}
                    />
                </div>
                <Note>
                    On GPT-3 175B, the LoRA paper reported 10,000 times fewer trainable parameters and a third of the GPU memory of full
                    fine-tuning. QLoRA (2023) went further, storing the frozen weights in 4 bits so a 65-billion-parameter model could be
                    fine-tuned on a single 48 GB GPU.
                </Note>
                <Sources items={[
                    { label: 'Hu et al. 2021 (LoRA)', url: 'https://arxiv.org/abs/2106.09685' },
                    { label: 'Dettmers et al. 2023 (QLoRA)', url: 'https://arxiv.org/abs/2305.14314' },
                ]} />
            </Block>
            <style>{`
                .sft-prompt { display: flex; flex-direction: column; gap: 4px; }
                .sft-prompt p { font-size: var(--text-md); color: var(--ink); font-weight: var(--weight-medium); }
                .sft-out { margin: 0; }
                .sft-base { font-size: var(--text-sm); color: var(--secondary); font-style: italic; line-height: var(--lead-body); }
                .sft-out.is-tuned { border-color: var(--ink); }
                .sft-tuned { font-size: var(--text-sm); color: var(--ink); white-space: pre-line; line-height: var(--lead-body); }
                .sft-toggle { display: inline-flex; align-items: center; gap: var(--s2); font-size: var(--text-xs); color: var(--secondary); cursor: pointer; }
                .sft-toggle input { accent-color: var(--ink); width: 16px; height: 16px; }
                .sft-chat { display: flex; flex-wrap: wrap; gap: 4px; font-family: var(--font-mono); font-size: var(--text-sm); }
                .sft-chunk { padding: 4px 8px; border-radius: var(--r-sm); border: 1px solid var(--stroke); background: var(--bg-panel); color: var(--primary); }
                .sft-chunk.is-special { color: var(--muted); font-size: var(--text-xs); }
                .sft-chunk.is-masked { background: var(--bg-raised); color: var(--muted); }
                .sft-chunk.is-trained { background: var(--viz-1); border-color: var(--viz-1); color: var(--viz-on-fill); }
                .sft-cap { font-size: var(--text-xs); color: var(--muted); }
                .sft-lora { display: flex; align-items: center; gap: var(--s3); padding: var(--s2) 0; flex-wrap: wrap; }
                .sft-mat { border-radius: 4px; display: grid; place-items: center; }
                .sft-mat.is-frozen { width: 120px; height: 120px; background: var(--bg-raised); border: 1px solid var(--stroke-dark); font-family: var(--font-mono); font-size: var(--text-2xs); color: var(--muted); text-align: center; }
                .sft-mat.is-a { height: 120px; background: var(--viz-1); transition: width var(--dur-base) var(--ease-out); }
                .sft-mat.is-b { width: 120px; background: var(--viz-2); transition: height var(--dur-base) var(--ease-out); }
                .sft-op { font-family: var(--font-mono); font-size: var(--text-lg); color: var(--muted); }
            `}</style>
        </>
    );
}
