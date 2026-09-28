// Stage 10 — Serve it to the world.

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Block, CardGrid, Note, Steps } from './TrainingKit';
import { STAGES } from './stages';

const JOURNEY = [
    { id: 'app', title: 'App or API', text: 'You type a message in a chat app, or a developer’s program calls the API. The request carries the whole conversation so far — the model itself remembers nothing between requests.' },
    { id: 'gateway', title: 'Gateway', text: 'Checks who you are, enforces rate limits and quotas, and routes the request to a region and model version with free capacity.' },
    { id: 'input', title: 'Input safeguards', text: 'Classifiers screen for abuse and policy violations; system instructions and tools are attached to the prompt.' },
    { id: 'schedule', title: 'Scheduler', text: 'Your request joins a batch with many others on a GPU server, so expensive hardware stays busy.' },
    { id: 'prefill', title: 'Prefill', text: 'The model reads the whole prompt in one parallel pass and builds its KV cache. Long prompts make this — and the wait for the first token — longer.' },
    { id: 'decode', title: 'Decode', text: 'The model generates one token at a time, reusing the cache. This is the loop you explored in Module 02, repeated for every word of the reply.' },
    { id: 'output', title: 'Output safeguards', text: 'Generated text can be checked by further classifiers before or while it is shown.' },
    { id: 'stream', title: 'Streaming', text: 'Tokens are sent to your screen as they are produced, which is why answers appear word by word.' },
    { id: 'log', title: 'Logging & monitoring', text: 'Latency, errors, cost and (depending on the product’s privacy settings) samples of conversations are recorded to spot problems.' },
];

export function StageDeployment() {
    const [i, setI] = useState(0);
    const j = JOURNEY[i];

    return (
        <>
            <Block title="Follow one request" intro="Every chatbot reply passes through a chain of systems around the model. Click a stage or step through.">
                <div className="tk-panel">
                    <ol className="dp-chain">
                        {JOURNEY.map((x, k) => (
                            <li key={x.id}>
                                <button type="button" className={`dp-node ${k === i ? 'is-on' : k < i ? 'is-done' : ''}`} onClick={() => setI(k)} aria-current={k === i ? 'step' : undefined}>
                                    <span className="dp-num">{k + 1}</span>{x.title}
                                </button>
                            </li>
                        ))}
                    </ol>
                    <div className="dp-detail" aria-live="polite">
                        <p className="dp-title">{i + 1}. {j.title}</p>
                        <p className="dp-text">{j.text}</p>
                    </div>
                    <div className="dp-actions">
                        <button type="button" className="btn btn-secondary btn-sm" onClick={() => setI(Math.max(0, i - 1))} disabled={i === 0}>← Back</button>
                        <button type="button" className="btn btn-primary btn-sm" onClick={() => setI(Math.min(JOURNEY.length - 1, i + 1))} disabled={i === JOURNEY.length - 1}>Next →</button>
                    </div>
                </div>
            </Block>

            <Block title="What operators watch" intro="Once live, a model is a service like any other — measured continuously.">
                <CardGrid
                    min={200}
                    items={[
                        { title: 'Time to first token', body: 'How long until the reply starts. Driven by queueing and prompt length.' },
                        { title: 'Tokens per second', body: 'How fast the reply streams. Driven by model size, hardware and batch size.' },
                        { title: 'Errors & capacity', body: 'Timeouts, overloaded regions and failed GPUs, with traffic shifted automatically.' },
                        { title: 'Cost per token', body: 'The economics of every optimisation in Stage 9.' },
                        { title: 'Misuse', body: 'Patterns of abuse, fraud or attempts to extract dangerous information.' },
                        { title: 'Quality & feedback', body: 'Thumbs-up/down, regressions after updates, and changes in behaviour over time.' },
                    ]}
                />
            </Block>

            <Block title="Releasing safely">
                <Steps
                    items={[
                        { title: 'Internal use', text: 'Staff and automated test suites use the new version first.' },
                        { title: 'Limited preview', text: 'Trusted testers or a small share of traffic get it; metrics are compared with the old model.' },
                        { title: 'General availability', text: 'The model rolls out widely, often with the previous version still available.' },
                        { title: 'Monitor & roll back', text: 'If something goes wrong, traffic returns to the previous version — as OpenAI did with a GPT-4o update in April 2025.' },
                    ]}
                />
                <Note>
                    Most day-to-day improvements to AI products come from this loop — prompts, safeguards, routing and smaller model
                    updates — rather than from training an entirely new model.
                </Note>
            </Block>

            <Block title="The whole journey, in one place" intro="You have followed a model from raw text to a live service.">
                <ol className="dp-recap">
                    {STAGES.map((s, k) => (
                        <li key={s.id}>
                            <Link to={k === 0 ? '?' : `?stage=${s.id}`} className="dp-recap-link">
                                <span className="dp-num">{k + 1}</span>
                                <span><strong>{s.title}.</strong> {s.goal}</span>
                            </Link>
                        </li>
                    ))}
                </ol>
                <div className="dp-next">
                    <Link to="/transformer-simulator" className="btn btn-secondary">See the model’s maths step by step →</Link>
                    <Link to="/benchmarks" className="btn btn-secondary">Compare today’s models →</Link>
                </div>
            </Block>
            <style>{`
                .dp-chain { list-style: none; display: flex; flex-wrap: wrap; gap: 6px; }
                .dp-node { display: inline-flex; align-items: center; gap: 6px; padding: 5px 10px 5px 5px; border-radius: var(--r-pill); border: 1px solid var(--stroke); background: var(--bg-panel); font-size: var(--text-xs); color: var(--secondary); }
                .dp-node:hover { border-color: var(--stroke-dark); color: var(--ink); }
                .dp-node.is-done { color: var(--primary); }
                .dp-node.is-on { background: var(--bg-inverse); border-color: var(--bg-inverse); color: var(--text-inverse); }
                .dp-num { width: 20px; height: 20px; border-radius: 50%; display: grid; place-items: center; font-family: var(--font-mono); font-size: 10px; border: 1px solid currentColor; flex-shrink: 0; }
                .dp-detail { padding: var(--s4); border-radius: var(--r-md); background: var(--bg-sunken); border: 1px solid var(--stroke); min-height: 96px; }
                .dp-title { font-size: var(--text-md); font-weight: var(--weight-semibold); color: var(--ink); }
                .dp-text { font-size: var(--text-sm); color: var(--secondary); line-height: var(--lead-body); margin-top: 4px; max-width: 72ch; }
                .dp-actions { display: flex; gap: var(--s2); }
                .dp-actions .btn:disabled { opacity: 0.45; cursor: not-allowed; }
                .dp-recap { list-style: none; display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 320px), 1fr)); gap: 6px var(--s4); }
                .dp-recap-link { display: flex; gap: var(--s3); align-items: flex-start; padding: var(--s2); border-radius: var(--r-sm); font-size: var(--text-sm); color: var(--secondary); line-height: 1.5; }
                .dp-recap-link:hover { background: var(--bg-raised); }
                .dp-recap-link strong { color: var(--ink); font-weight: var(--weight-semibold); }
                .dp-recap-link .dp-num { margin-top: 1px; color: var(--muted); }
                .dp-next { display: flex; flex-wrap: wrap; gap: var(--s2); }
            `}</style>
        </>
    );
}
