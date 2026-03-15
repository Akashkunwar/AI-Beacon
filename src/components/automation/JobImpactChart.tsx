import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

function formatJobs(n: number): string {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(0)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

export interface JobImpactChartProps {
  jobsDisplaced: number;
  newJobsCreated: number;
}

const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: [0.2, 0, 0, 1] as const },
  },
};

export function JobImpactChart({ jobsDisplaced, newJobsCreated }: JobImpactChartProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  const max = Math.max(jobsDisplaced, newJobsCreated, 1);
  const displacedPct = (jobsDisplaced / max) * 100;
  const createdPct = (newJobsCreated / max) * 100;
  const net = newJobsCreated - jobsDisplaced;
  const ratio = jobsDisplaced > 0 ? (newJobsCreated / jobsDisplaced).toFixed(1) : '—';

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
      aria-label="Job impact: displaced vs created"
    >
      <h3
        style={{
          fontSize: 'var(--text-2xs)',
          fontFamily: 'var(--font-mono)',
          color: 'var(--muted)',
          textTransform: 'uppercase',
          letterSpacing: 'var(--tracking-wider)',
          marginBottom: 'var(--s5)',
        }}
      >
        Jobs displaced vs created
      </h3>

      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate={inView ? 'visible' : 'hidden'}
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr auto 1fr',
          gap: 'var(--s5)',
          alignItems: 'center',
          marginBottom: 'var(--s5)',
        }}
      >
        <div>
          <div
            style={{
              fontSize: 'var(--text-xs)',
              color: 'var(--muted)',
              marginBottom: 'var(--s2)',
            }}
          >
            Displaced
          </div>
          <div
            style={{
              height: 32,
              background: 'var(--stroke)',
              borderRadius: 'var(--r-sm)',
              overflow: 'hidden',
            }}
          >
            <motion.div
              initial={false}
              animate={{ width: `${displacedPct}%` }}
              transition={{ duration: 0.35, ease: [0.2, 0, 0, 1] }}
              style={{
                height: '100%',
                width: '100%',
                maxWidth: `${displacedPct}%`,
                background: 'var(--viz-neg)',
                borderRadius: 'var(--r-sm)',
              }}
            />
          </div>
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--text-lg)',
              fontWeight: 'var(--weight-semibold)',
              color: 'var(--ink)',
              marginTop: 'var(--s2)',
            }}
          >
            {formatJobs(jobsDisplaced)}
          </div>
        </div>

        <div
          style={{
            textAlign: 'center',
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--text-xs)',
            color: 'var(--muted)',
          }}
        >
          Ratio
          <div style={{ fontSize: 'var(--text-md)', color: 'var(--ink)', marginTop: 'var(--s1)' }}>
            {ratio}
          </div>
          <div style={{ fontSize: 'var(--text-2xs)', marginTop: 'var(--s1)' }}>
            created / displaced
          </div>
        </div>

        <div>
          <div
            style={{
              fontSize: 'var(--text-xs)',
              color: 'var(--muted)',
              marginBottom: 'var(--s2)',
            }}
          >
            Created
          </div>
          <div
            style={{
              height: 32,
              background: 'var(--stroke)',
              borderRadius: 'var(--r-sm)',
              overflow: 'hidden',
            }}
          >
            <motion.div
              initial={false}
              animate={{ width: `${createdPct}%` }}
              transition={{ duration: 0.35, ease: [0.2, 0, 0, 1] }}
              style={{
                height: '100%',
                width: '100%',
                maxWidth: `${createdPct}%`,
                background: 'var(--viz-accent)',
                borderRadius: 'var(--r-sm)',
              }}
            />
          </div>
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--text-lg)',
              fontWeight: 'var(--weight-semibold)',
              color: 'var(--ink)',
              marginTop: 'var(--s2)',
            }}
          >
            {formatJobs(newJobsCreated)}
          </div>
        </div>
      </motion.div>

      <motion.p
        variants={fadeUp}
        initial="hidden"
        animate={inView ? 'visible' : 'hidden'}
        style={{
          fontSize: 'var(--text-sm)',
          color: 'var(--secondary)',
          lineHeight: 'var(--lead-body)',
          margin: 0,
          fontWeight: 'var(--weight-light)',
          borderTop: '1px solid var(--stroke)',
          paddingTop: 'var(--s4)',
        }}
      >
        Net impact: {net >= 0 ? '+' : ''}{formatJobs(net)} jobs. For every job displaced, {ratio} new
        roles are created in the model, but they often require different skills; reskilling and
        policy will shape outcomes.
      </motion.p>
    </section>
  );
}
