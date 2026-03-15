import { motion } from 'framer-motion';
import type { SectorData } from '@/data/automationData';

export interface SectorCardProps {
  sector: SectorData;
  index?: number;
  reducedMotion?: boolean;
}

function formatJobs(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

export function SectorCard({ sector, index = 0, reducedMotion = false }: SectorCardProps) {
  const pct = Math.min(100, Math.max(0, sector.automationPct));

  return (
    <motion.article
      initial={reducedMotion ? false : { opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={
        reducedMotion ? { duration: 0 } : { duration: 0.35, delay: index * 0.03, ease: [0.2, 0, 0, 1] }
      }
      style={{
        padding: 'var(--s5)',
        background: 'var(--bg-panel)',
        border: '1px solid var(--stroke)',
        borderRadius: 'var(--r-lg)',
        boxShadow: 'var(--shadow-soft)',
        transition: 'border-color var(--dur-fast) var(--ease-out), box-shadow var(--dur-fast) var(--ease-out)',
      }}
      className="sector-card"
      aria-label={`${sector.label}: ${pct.toFixed(0)}% automation, ${formatJobs(sector.jobsAtRisk)} jobs at risk`}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--s3)',
          marginBottom: 'var(--s3)',
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--text-lg)',
            color: 'var(--ink)',
            lineHeight: 1,
          }}
          aria-hidden
        >
          {sector.icon}
        </span>
        <h4
          style={{
            fontSize: 'var(--text-md)',
            fontWeight: 'var(--weight-semibold)',
            color: 'var(--ink)',
            margin: 0,
          }}
        >
          {sector.label}
        </h4>
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          marginBottom: 'var(--s2)',
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--text-xl)',
            fontWeight: 'var(--weight-semibold)',
            color: 'var(--ink)',
          }}
        >
          {pct.toFixed(0)}%
        </span>
        <span
          style={{
            fontSize: 'var(--text-xs)',
            color: 'var(--muted)',
            fontFamily: 'var(--font-mono)',
          }}
        >
          {formatJobs(sector.jobsAtRisk)} jobs at risk
        </span>
      </div>

      <div
        style={{
          height: 6,
          background: 'var(--stroke)',
          borderRadius: 'var(--r-pill)',
          overflow: 'hidden',
          marginBottom: 'var(--s4)',
        }}
      >
        <motion.div
          initial={false}
          animate={{ width: `${pct}%` }}
          transition={reducedMotion ? { duration: 0 } : { duration: 0.35, ease: [0.2, 0, 0, 1] }}
          style={{
            height: '100%',
            background: 'var(--viz-accent)',
            borderRadius: 'var(--r-pill)',
          }}
        />
      </div>

      <p
        style={{
          fontSize: 'var(--text-sm)',
          color: 'var(--secondary)',
          lineHeight: 'var(--lead-snug)',
          marginBottom: 'var(--s3)',
          fontWeight: 'var(--weight-light)',
        }}
      >
        {sector.description}
      </p>

      <a
        href={sector.source.url}
        target="_blank"
        rel="noreferrer"
        style={{
          fontSize: 'var(--text-2xs)',
          fontFamily: 'var(--font-mono)',
          color: 'var(--muted)',
          textDecoration: 'none',
          borderBottom: '1px dotted var(--stroke-dark)',
          transition: 'color var(--dur-fast) var(--ease-out)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = 'var(--ink)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = 'var(--muted)';
        }}
      >
        Source: {sector.source.label}
      </a>

      <style>{`
        .sector-card:hover {
          border-color: var(--stroke-dark);
          box-shadow: var(--shadow-lift);
        }
      `}</style>
    </motion.article>
  );
}
