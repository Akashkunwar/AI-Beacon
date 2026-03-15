import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { EXPERT_PROJECTIONS } from '@/data/automationData';

const CORE_SOURCES = [
  { label: 'McKinsey Global Institute', url: 'https://www.mckinsey.com/capabilities/mckinsey-digital/our-insights/the-economic-potential-of-generative-ai' },
  { label: 'Goldman Sachs Research', url: 'https://www.goldmansachs.com/intelligence/generative-ai/' },
  { label: 'World Economic Forum', url: 'https://www.weforum.org/publications/the-future-of-jobs-report-2023/' },
  { label: 'Stanford HAI AI Index', url: 'https://aiindex.stanford.edu/' },
  { label: 'IMF', url: 'https://www.imf.org/en/Publications/staff-climate-notes/Issues/2024/01/14/Gen-AI-Artificial-Intelligence-and-the-Future-of-Work-542449' },
  { label: 'PwC', url: 'https://www.pwc.com/gx/en/issues/artificial-intelligence.html' },
  { label: 'Accenture', url: 'https://www.accenture.com/us-en/insights/artificial-intelligence' },
  { label: 'OECD Employment Outlook', url: 'https://www.oecd.org/employment/employment-outlook/' },
  { label: 'Bureau of Labor Statistics', url: 'https://www.bls.gov/' },
];

const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, delay: i * 0.04, ease: [0.2, 0, 0, 1] as const },
  }),
};

export function SourcesPanel() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });

  return (
    <section
      ref={ref}
      style={{
        padding: 'var(--s6)',
        background: 'var(--bg-panel)',
        border: '1px solid var(--stroke)',
        borderRadius: 'var(--r-lg)',
        boxShadow: 'var(--shadow-soft)',
      }}
      aria-label="Sources and methodology"
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
        Expert projections
      </h3>
      <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
        {EXPERT_PROJECTIONS.map((p, i) => (
          <motion.li
            key={`${p.source}-${p.year}`}
            variants={fadeUp}
            initial="hidden"
            animate={inView ? 'visible' : 'hidden'}
            custom={i}
            style={{ marginBottom: 'var(--s4)' }}
          >
            <a
              href={p.url}
              target="_blank"
              rel="noreferrer"
              style={{
                fontSize: 'var(--text-sm)',
                color: 'var(--secondary)',
                textDecoration: 'none',
                borderBottom: '1px dotted var(--stroke-dark)',
                lineHeight: 'var(--lead-snug)',
                display: 'block',
                transition: 'color var(--dur-fast) var(--ease-out)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'var(--ink)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--secondary)';
              }}
            >
              &ldquo;{p.quote}&rdquo; — {p.source} ({p.year})
            </a>
          </motion.li>
        ))}
      </ul>

      <h3
        style={{
          fontSize: 'var(--text-2xs)',
          fontFamily: 'var(--font-mono)',
          color: 'var(--muted)',
          textTransform: 'uppercase',
          letterSpacing: 'var(--tracking-wider)',
          marginTop: 'var(--s6)',
          marginBottom: 'var(--s4)',
        }}
      >
        Reports &amp; datasets
      </h3>
      <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
        {CORE_SOURCES.map((s, i) => (
          <motion.li
            key={s.label}
            variants={fadeUp}
            initial="hidden"
            animate={inView ? 'visible' : 'hidden'}
            custom={EXPERT_PROJECTIONS.length + i}
            style={{ marginBottom: 'var(--s2)' }}
          >
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
          </motion.li>
        ))}
      </ul>

      <h3
        style={{
          fontSize: 'var(--text-2xs)',
          fontFamily: 'var(--font-mono)',
          color: 'var(--muted)',
          textTransform: 'uppercase',
          letterSpacing: 'var(--tracking-wider)',
          marginTop: 'var(--s6)',
          marginBottom: 'var(--s4)',
        }}
      >
        Methodology
      </h3>
      <motion.p
        variants={fadeUp}
        initial="hidden"
        animate={inView ? 'visible' : 'hidden'}
        custom={EXPERT_PROJECTIONS.length + CORE_SOURCES.length}
        style={{
          fontSize: 'var(--text-sm)',
          color: 'var(--secondary)',
          lineHeight: 'var(--lead-body)',
          margin: 0,
          fontWeight: 'var(--weight-light)',
        }}
      >
        Data for 2022–2026 is based on published reports and sector studies. Values between anchor
        years are linearly interpolated. Years 2027–2030 are projections based on expert consensus
        and trend extrapolation; they are illustrative, not forecasts. Job and GDP figures are
        global estimates. Sector-level sources are linked on each card.
      </motion.p>
    </section>
  );
}
