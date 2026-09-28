import { BENCHMARK_MODELS, LAST_UPDATED, LIVE_LEADERBOARDS } from '@/data/benchmarkData';
import { SITE_CONFIG } from '@/config/site';
import { formatDate } from '@/utils/timeline';

export function BenchmarkSources() {
    const byDate = [...BENCHMARK_MODELS].sort((a, b) => b.releaseDate.localeCompare(a.releaseDate));
    return (
        <div className="bs-grid">
            <div className="card card-pad">
                <h3 className="bs-title">Methodology</h3>
                <ul className="bs-list">
                    <li>Scores are copied from each lab’s launch post, model card or technical report (or from the benchmark’s own paper). Each model links to its source.</li>
                    <li>Different labs run benchmarks with different prompts, tools, attempts and “thinking” budgets. Notes record the setting when a lab reports several.</li>
                    <li>Blank means the lab did not report that benchmark. Nothing is estimated, averaged or converted between benchmark versions.</li>
                    <li>Prices are standard API list prices in USD per million tokens as of {formatDate(LAST_UPDATED, 'long')}; retired models show their last list price.</li>
                    <li>
                        Found a wrong or missing number?{' '}
                        <a className="text-link" href={`${SITE_CONFIG.githubUrl}/blob/main/src/data/benchmarkData.ts`} target="_blank" rel="noopener noreferrer">
                            Edit <code>benchmarkData.ts</code> ↗
                        </a>{' '}
                        with a link to the primary source.
                    </li>
                </ul>
                <h3 className="bs-title" style={{ marginTop: 'var(--s5)' }}>For current rankings, see live leaderboards</h3>
                <ul className="bs-list">
                    {LIVE_LEADERBOARDS.map((l) => (
                        <li key={l.url}>
                            <a className="text-link" href={l.url} target="_blank" rel="noopener noreferrer">{l.label} ↗</a> — {l.desc}
                        </li>
                    ))}
                </ul>
            </div>
            <div className="card card-pad">
                <h3 className="bs-title">Sources by model</h3>
                <ul className="bs-sources">
                    {byDate.map((m) => (
                        <li key={m.id}>
                            <span className="bs-model">{m.name}</span>
                            <a className="text-link" href={m.source.url} target="_blank" rel="noopener noreferrer">{m.source.label} ↗</a>
                        </li>
                    ))}
                </ul>
            </div>
            <style>{`
                .bs-grid { display: grid; grid-template-columns: 1fr 1fr; gap: var(--s4); align-items: start; }
                .bs-title { font-size: var(--text-md); margin-bottom: var(--s3); }
                .bs-list { padding-left: 1.1em; display: flex; flex-direction: column; gap: var(--s2); font-size: var(--text-sm); color: var(--secondary); }
                .bs-sources { list-style: none; max-height: 420px; overflow-y: auto; font-size: var(--text-xs); }
                .bs-sources li { display: flex; justify-content: space-between; gap: var(--s3); padding: 6px 0; border-bottom: 1px solid var(--stroke); }
                .bs-model { color: var(--ink); font-weight: var(--weight-medium); }
                @media (max-width: 899px) { .bs-grid { grid-template-columns: 1fr; } }
            `}</style>
        </div>
    );
}
