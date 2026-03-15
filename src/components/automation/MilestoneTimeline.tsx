import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { AUTOMATION_DATA, AUTOMATION_YEARS, PROJECTION_START_YEAR } from '@/data/automationData';

const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, delay: i * 0.05, ease: [0.2, 0, 0, 1] as const },
  }),
};

export function MilestoneTimeline() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  const years = [...AUTOMATION_YEARS].sort((a, b) => a - b);

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
      aria-label="AI milestones by year"
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
        Key milestones by year
      </h3>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 'var(--s5) var(--s6)',
          justifyContent: 'space-between',
        }}
      >
        {years.map((year, i) => {
          const data = AUTOMATION_DATA[year];
          const isProjection = year >= PROJECTION_START_YEAR;
          return (
            <motion.div
              key={year}
              variants={fadeUp}
              initial="hidden"
              animate={inView ? 'visible' : 'hidden'}
              custom={i}
              style={{
                flex: '1 1 140px',
                minWidth: 0,
                maxWidth: 220,
              }}
            >
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 'var(--text-sm)',
                  fontWeight: 'var(--weight-semibold)',
                  color: isProjection ? 'var(--muted)' : 'var(--ink)',
                  marginBottom: 'var(--s2)',
                }}
              >
                {year}
                {isProjection && (
                  <span
                    style={{
                      marginLeft: 'var(--s1)',
                      fontSize: 'var(--text-2xs)',
                      fontWeight: 'var(--weight-regular)',
                      color: 'var(--muted)',
                    }}
                  >
                    (proj.)
                  </span>
                )}
              </div>
              <ul
                style={{
                  margin: 0,
                  paddingLeft: 'var(--s4)',
                  fontSize: 'var(--text-xs)',
                  color: 'var(--secondary)',
                  lineHeight: 1.6,
                  fontWeight: 'var(--weight-light)',
                }}
              >
                {data.milestones.slice(0, 3).map((m, j) => (
                  <li key={j} style={{ marginBottom: 'var(--s1)' }}>
                    {m}
                  </li>
                ))}
              </ul>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
