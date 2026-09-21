import { LAST_UPDATED } from '@/data/benchmarkData';

const SOURCES = [
  { label: 'Artificial Analysis', url: 'https://artificialanalysis.ai/' },
  { label: 'Hugging Face Open LLM Leaderboard', url: 'https://huggingface.co/spaces/open-llm-leaderboard/open_llm_leaderboard' },
  { label: 'LMSYS Chatbot Arena', url: 'https://lmarena.ai/' },
  { label: 'llm-prices.com', url: 'https://www.llm-prices.com/' },
  { label: 'MMLU paper', url: 'https://arxiv.org/abs/2009.03300' },
  { label: 'HumanEval paper', url: 'https://arxiv.org/abs/2107.03374' },
  { label: 'MATH paper', url: 'https://arxiv.org/abs/2103.03874' },
  { label: 'GPQA paper', url: 'https://arxiv.org/abs/2311.12022' },
  { label: 'GSM8K paper', url: 'https://arxiv.org/abs/2110.14168' },
  { label: 'Chatbot Arena paper', url: 'https://arxiv.org/abs/2403.04132' },
];

export function BenchmarkSources() {
  return (
    <section
      style={{
        padding: 'var(--s6)',
        background: 'var(--bg-panel)',
        border: '1px solid var(--stroke)',
        borderRadius: 'var(--r-lg)',
        boxShadow: 'var(--shadow-soft)',
      }}
      aria-label="Sources and attribution"
    >
      <h3
        style={{
          fontSize: 'var(--text-2xs)',
          fontFamily: 'var(--font-mono)',
          color: 'var(--muted)',
          textTransform: 'uppercase',
          letterSpacing: 'var(--tracking-wider)',
          marginBottom: 'var(--s4)',
        }}
      >
        Data sources
      </h3>
      <p
        style={{
          fontSize: 'var(--text-sm)',
          color: 'var(--secondary)',
          lineHeight: 'var(--lead-body)',
          marginBottom: 'var(--s4)',
          fontWeight: 'var(--weight-light)',
        }}
      >
        Model figures are compiled from provider reports and community evaluations. Benchmark
        definitions link to the original papers below; speed and pricing use third-party measurements
        where available. Evaluation protocols can differ, so the table is a navigational snapshot—not
        a controlled head-to-head experiment.
      </p>
      <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
        {SOURCES.map((s) => (
          <li key={s.label} style={{ marginBottom: 'var(--s2)' }}>
            <a
              href={s.url}
              target="_blank"
              rel="noreferrer"
              style={{
                fontSize: 'var(--text-xs)',
                color: 'var(--secondary)',
                textDecoration: 'none',
                borderBottom: '1px dotted var(--stroke-dark)',
                transition: 'color var(--dur-fast) var(--ease-out)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'var(--ink)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--secondary)';
              }}
            >
              {s.label}
            </a>
          </li>
        ))}
      </ul>
      <p
        style={{
          marginTop: 'var(--s5)',
          marginBottom: 0,
          fontSize: 'var(--text-2xs)',
          fontFamily: 'var(--font-mono)',
          color: 'var(--muted)',
        }}
      >
        Last refreshed: {LAST_UPDATED}. Scores may change as providers update models.
      </p>
    </section>
  );
}
