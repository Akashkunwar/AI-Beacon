import { METRICS } from '@/data/benchmarkData';

const STATUS_LABEL = { active: 'Still discriminating', saturating: 'Nearly saturated', retired: 'Saturated' } as const;

const OTHER_BENCHMARKS = [
    { name: 'SWE-bench Pro', text: 'A harder, contamination-resistant successor to SWE-bench Verified with longer, multi-file tasks; widely reported from 2026.' },
    { name: 'Terminal-Bench', text: 'Agents complete real tasks in a command-line environment (build software, fix configs, run experiments). Versions 2.0–4.0 are not comparable with each other.' },
    { name: 'ARC-AGI-2 / 3', text: 'Visual puzzles that are easy for people but hard for AI, designed to test learning new skills on the fly rather than recalling knowledge.' },
    { name: 'LMArena (Chatbot Arena)', text: 'People vote between two anonymous model answers; results form an Elo-style rating. Measures preference — including style and length — not correctness.' },
    { name: 'HumanEval', text: '164 short Python functions checked by unit tests (2021). Saturated above 90% by 2024 and no longer informative for frontier models.' },
    { name: 'MMMU', text: 'College-level questions that require reading images, charts and diagrams — a common multimodal benchmark.' },
];

export function BenchmarkGlossary() {
    return (
        <div className="bg-wrap">
            <div className="bg-grid">
                {METRICS.map((m) => (
                    <article key={m.id} className="card bg-card">
                        <header className="bg-head">
                            <h3>{m.name}</h3>
                            <span className={`chip ${m.status === 'active' ? 'chip-solid' : 'chip-outline'}`}>{STATUS_LABEL[m.status]}</span>
                        </header>
                        <dl>
                            <div><dt>What the model does</dt><dd>{m.measures}</dd></div>
                            <div><dt>Why it matters</dt><dd>{m.why}</dd></div>
                            <div><dt>Reference points</dt><dd>{m.baseline}</dd></div>
                            <div><dt>Watch out</dt><dd>{m.caveat}</dd></div>
                        </dl>
                        <footer className="bg-foot">
                            <span>{m.statusNote}</span>
                            <span className="bg-links">
                                <a className="text-link" href={m.paper} target="_blank" rel="noopener noreferrer">Paper ↗</a>
                                {m.leaderboard && <a className="text-link" href={m.leaderboard} target="_blank" rel="noopener noreferrer">Leaderboard ↗</a>}
                            </span>
                        </footer>
                    </article>
                ))}
            </div>

            <h3 className="bg-other-title">Other benchmarks you will see in 2026 announcements</h3>
            <dl className="bg-other">
                {OTHER_BENCHMARKS.map((b) => (
                    <div key={b.name}><dt>{b.name}</dt><dd>{b.text}</dd></div>
                ))}
            </dl>
            <style>{`
                .bg-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 340px), 1fr)); gap: var(--s4); }
                .bg-card { padding: var(--s5); display: flex; flex-direction: column; gap: var(--s3); }
                .bg-head { display: flex; justify-content: space-between; align-items: center; gap: var(--s3); }
                .bg-head h3 { font-size: var(--text-md); }
                .bg-card dl { display: flex; flex-direction: column; gap: var(--s3); flex: 1; }
                .bg-card dt { font-family: var(--font-mono); font-size: var(--text-2xs); color: var(--muted); text-transform: uppercase; letter-spacing: var(--tracking-wide); }
                .bg-card dd { font-size: var(--text-sm); color: var(--secondary); margin-top: 2px; }
                .bg-foot { display: flex; flex-wrap: wrap; justify-content: space-between; gap: var(--s2); padding-top: var(--s3); border-top: 1px solid var(--stroke); font-size: var(--text-xs); color: var(--muted); }
                .bg-links { display: inline-flex; gap: var(--s3); }
                .bg-other-title { font-size: var(--text-md); margin: var(--s6) 0 var(--s3); }
                .bg-other { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 300px), 1fr)); gap: var(--s3) var(--s5); }
                .bg-other dt { font-weight: var(--weight-semibold); color: var(--ink); font-size: var(--text-sm); }
                .bg-other dd { color: var(--secondary); font-size: var(--text-xs); margin-top: 2px; }
            `}</style>
        </div>
    );
}
