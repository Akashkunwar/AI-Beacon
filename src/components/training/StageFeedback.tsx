// Stage 7 — Shape behaviour with feedback (RLHF, DPO, AI feedback, RL for reasoning).

import { useState } from 'react';
import { Block, Note, Sources, Steps, Tabs } from './TrainingKit';

const PAIRS = [
    {
        prompt: 'My Python script crashes with KeyError: \'name\'. What does that mean?',
        a: 'Your code tried to read the key \'name\' from a dictionary that doesn’t contain it. Check the spelling, print the dictionary’s keys, or use data.get(\'name\') to get None instead of an error.',
        b: 'KeyError is a type of error in Python. Errors happen when something goes wrong in the code. You should debug your code to find the problem.',
        better: 'a',
        why: 'A explains the cause and gives concrete fixes; B is vague. Labellers reward specific, actionable help.',
    },
    {
        prompt: 'Is it OK to leave cooked rice out overnight and eat it tomorrow?',
        a: 'Yes — rice keeps fine at room temperature for a day or two, so there’s no need to refrigerate it.',
        b: 'It’s not recommended. Cooked rice can carry spores of the bacterium Bacillus cereus, which multiply at room temperature and can cause food poisoning. Cool leftovers and refrigerate them within about two hours.',
        better: 'b',
        why: 'A sounds confident but is wrong. Preference data is how models learn that correctness matters more than confidence — if labellers catch the error.',
    },
    {
        prompt: 'Give me a one-line motivational quote.',
        a: 'Small steps, taken every day, add up to big changes.',
        b: 'What a wonderful request — you’re clearly an incredibly driven person! Here’s a quote as brilliant as you: “Small steps, taken every day, add up to big changes.”',
        better: 'a',
        why: 'B flatters the user. If labellers reward flattery even slightly, training amplifies it — the “sycophancy” problem.',
    },
] as const;

type Method = 'rlhf' | 'dpo' | 'cai' | 'rlvr';
const METHODS: Record<Method, { label: string; year: string; summary: string; steps: Array<{ title: string; text: string }>; plus: string; minus: string; landmark: string; source: { label: string; url: string } }> = {
    rlhf: {
        label: 'RLHF',
        year: '2017–2022',
        summary: 'Reinforcement learning from human feedback: learn what people prefer, then optimise the model to produce more of it.',
        steps: [
            { title: 'Compare', text: 'People rank several model answers to the same prompt.' },
            { title: 'Reward model', text: 'A separate model learns to predict which answer people will prefer.' },
            { title: 'Optimise', text: 'Reinforcement learning (usually PPO) pushes the assistant toward high-reward answers, with a penalty for drifting too far from where it started.' },
        ],
        plus: 'Captures preferences that are hard to write down, like tone and helpfulness.',
        minus: 'Expensive and complex (several large models in memory at once), and the model can learn to exploit weaknesses in the reward model.',
        landmark: 'InstructGPT (2022): labellers preferred answers from a 1.3-billion-parameter RLHF model over the original 175-billion-parameter GPT-3. This recipe led directly to ChatGPT.',
        source: { label: 'Ouyang et al. 2022', url: 'https://arxiv.org/abs/2203.02155' },
    },
    dpo: {
        label: 'DPO',
        year: '2023',
        summary: 'Direct preference optimisation: learn from the same comparisons, without a reward model or reinforcement learning.',
        steps: [
            { title: 'Compare', text: 'Collect pairs of answers: one preferred, one rejected.' },
            { title: 'Adjust directly', text: 'Increase the probability of the preferred answer and decrease the rejected one, relative to a frozen copy of the starting model.' },
        ],
        plus: 'Much simpler and more stable to run; widely used for open models, including Llama 3’s post-training.',
        minus: 'Learns only from the fixed set of comparisons, rather than exploring new answers during training.',
        landmark: 'The DPO paper showed this simple loss matches RLHF’s objective under common assumptions.',
        source: { label: 'Rafailov et al. 2023', url: 'https://arxiv.org/abs/2305.18290' },
    },
    cai: {
        label: 'AI feedback',
        year: '2022',
        summary: 'Constitutional AI and RLAIF: an AI model, guided by a written list of principles, provides some or all of the feedback.',
        steps: [
            { title: 'Critique & revise', text: 'The model critiques its own answers against principles (e.g. “choose the least harmful response”) and rewrites them; the revisions become fine-tuning data.' },
            { title: 'AI preferences', text: 'An AI judge compares answer pairs using the same principles, replacing many human labels.' },
            { title: 'Optimise', text: 'Train on those preferences, as in RLHF.' },
        ],
        plus: 'Scales cheaply, and the values being trained are written down where they can be read and debated.',
        minus: 'The AI judge has its own biases and blind spots, which the model may inherit.',
        landmark: 'Anthropic introduced Constitutional AI in December 2022 to train a harmless but non-evasive assistant with far fewer human harm labels.',
        source: { label: 'Bai et al. 2022', url: 'https://arxiv.org/abs/2212.08073' },
    },
    rlvr: {
        label: 'RL for reasoning',
        year: '2024–',
        summary: 'Reinforcement learning with verifiable rewards: reward the model when its final answer can be automatically checked as correct.',
        steps: [
            { title: 'Hard problems', text: 'Give the model maths problems with known answers or coding tasks with tests.' },
            { title: 'Let it think', text: 'The model writes a long chain of reasoning before its answer.' },
            { title: 'Check & reward', text: 'A program checks the answer or runs the tests; correct attempts are reinforced.' },
        ],
        plus: 'No human labels needed, and models discover strategies such as checking their work and backtracking. Behind “reasoning” models since OpenAI o1 (2024).',
        minus: 'Only works where answers can be verified, and models can game the checker — for example by special-casing unit tests.',
        landmark: 'DeepSeek-R1-Zero (January 2025) was trained with this kind of RL alone: its AIME 2024 maths score rose from 15.6% to 71.0% during training.',
        source: { label: 'DeepSeek-AI 2025 (DeepSeek-R1)', url: 'https://arxiv.org/abs/2501.12948' },
    },
};

export function StageFeedback() {
    const [pairIdx, setPairIdx] = useState(0);
    const [choice, setChoice] = useState<'a' | 'b' | null>(null);
    const [method, setMethod] = useState<Method>('rlhf');
    const pair = PAIRS[pairIdx];
    const m = METHODS[method];

    return (
        <>
            <Block
                title="Try it: be the labeller"
                intro="Preference data is simply many judgements like this one. Pick the better answer."
                aside={<span className="fb-count tk-mono">{pairIdx + 1} / {PAIRS.length}</span>}
            >
                <div className="tk-panel">
                    <p className="fb-prompt"><span className="tk-label">Prompt</span>{pair.prompt}</p>
                    <div className="fb-options">
                        {(['a', 'b'] as const).map((k) => {
                            const state = choice === null ? '' : k === pair.better ? 'is-better' : 'is-worse';
                            return (
                                <button key={k} type="button" className={`fb-option ${state} ${choice === k ? 'is-picked' : ''}`} onClick={() => setChoice(k)} aria-pressed={choice === k}>
                                    <span className="tk-label">Answer {k.toUpperCase()}</span>
                                    <span>{pair[k]}</span>
                                </button>
                            );
                        })}
                    </div>
                    {choice && (
                        <div className="fb-result" role="status">
                            <p>
                                <strong>{choice === pair.better ? 'Most labellers would agree.' : 'Most labellers would pick the other one.'}</strong> {pair.why}
                            </p>
                            <p className="fb-sub">
                                Your click becomes one training record: (prompt, preferred answer, rejected answer). Meta collected over a million
                                such comparisons for Llama 2-Chat.
                            </p>
                            <button type="button" className="btn btn-secondary btn-sm" onClick={() => { setPairIdx((pairIdx + 1) % PAIRS.length); setChoice(null); }}>
                                Next comparison →
                            </button>
                        </div>
                    )}
                </div>
            </Block>

            <Block title="Four ways to learn from feedback" aside={<Tabs label="Method" value={method} onChange={setMethod} options={(Object.keys(METHODS) as Method[]).map((id) => ({ id, label: METHODS[id].label }))} />}>
                <div className="tk-panel">
                    <p className="fb-summary"><span className="chip">{m.year}</span> {m.summary}</p>
                    <Steps items={m.steps} />
                    <dl className="fb-pm">
                        <div><dt>Strength</dt><dd>{m.plus}</dd></div>
                        <div><dt>Weakness</dt><dd>{m.minus}</dd></div>
                        <div><dt>Landmark</dt><dd>{m.landmark}</dd></div>
                    </dl>
                    <Sources items={[m.source]} />
                </div>
            </Block>

            <Note tone="caveat" title="When feedback backfires">
                <p>
                    Models learn what earns approval, not what is true. In April 2025 OpenAI rolled back a GPT-4o update after it became
                    “overly flattering or agreeable”; the company said it had leaned too heavily on short-term user feedback. Other
                    common side effects are refusing harmless requests and padding answers to look thorough.
                </p>
                <Sources items={[{ label: 'OpenAI — Sycophancy in GPT-4o (April 2025)', url: 'https://openai.com/index/sycophancy-in-gpt-4o/' }]} />
            </Note>
            <style>{`
                .fb-count { font-size: var(--text-xs); color: var(--muted); }
                .fb-prompt { display: flex; flex-direction: column; gap: 4px; font-size: var(--text-md); color: var(--ink); font-weight: var(--weight-medium); }
                .fb-options { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 260px), 1fr)); gap: var(--s3); }
                .fb-option { display: flex; flex-direction: column; gap: 6px; text-align: left; padding: var(--s4); border: 1px solid var(--stroke-dark); border-radius: var(--r-md); background: var(--bg-panel); font-size: var(--text-sm); color: var(--primary); line-height: var(--lead-body); transition: border-color var(--dur-fast) var(--ease-out); }
                .fb-option:hover { border-color: var(--ink); }
                .fb-option.is-better { border-color: var(--success); box-shadow: inset 0 0 0 1px var(--success); }
                .fb-option.is-worse { opacity: 0.6; }
                .fb-option.is-picked .tk-label::after { content: ' · your pick'; }
                .fb-result { display: flex; flex-direction: column; gap: var(--s2); align-items: flex-start; font-size: var(--text-sm); color: var(--secondary); line-height: var(--lead-body); }
                .fb-result strong { color: var(--ink); }
                .fb-sub { font-size: var(--text-xs); color: var(--muted); }
                .fb-summary { font-size: var(--text-md); color: var(--ink); line-height: 1.5; }
                .fb-summary .chip { margin-right: 6px; vertical-align: middle; }
                .fb-pm { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 220px), 1fr)); gap: var(--s4); }
                .fb-pm dt { font-size: var(--text-2xs); font-family: var(--font-mono); text-transform: uppercase; letter-spacing: var(--tracking-wide); color: var(--muted); margin-bottom: 4px; }
                .fb-pm dd { font-size: var(--text-sm); color: var(--secondary); line-height: var(--lead-body); }
            `}</style>
        </>
    );
}
