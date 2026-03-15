import { useRef, useState, useMemo } from 'react';
import { motion, useInView } from 'framer-motion';
import { SEO } from '@/components/common/SEO';
import { Nav } from '@/components/shared/Nav';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { getInterpolatedData } from '@/utils/interpolationUtils';
import { FIRST_YEAR, LAST_YEAR } from '@/data/automationData';
import { YearSlider } from '@/components/automation/YearSlider';
import { SectorCard } from '@/components/automation/SectorCard';
import { ImpactMetric } from '@/components/automation/ImpactMetric';
import { MilestoneTimeline } from '@/components/automation/MilestoneTimeline';
import { JobImpactChart } from '@/components/automation/JobImpactChart';
import { SourcesPanel } from '@/components/automation/SourcesPanel';

const SECTOR_ORDER = [
  'softwareEngineering',
  'healthcare',
  'finance',
  'legal',
  'customerService',
  'manufacturing',
  'education',
  'transportation',
  'creative',
  'marketing',
  'retail',
  'agriculture',
  'journalism',
  'hr',
  'accounting',
  'cybersecurity',
  'research',
  'realEstate',
] as const;

const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  visible: (delay: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, delay, ease: [0.2, 0, 0, 1] as [number, number, number, number] },
  }),
};

function Reveal({
  children,
  delay = 0,
  reduced = false,
}: {
  children: React.ReactNode;
  delay?: number;
  reduced?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  const variants = reduced
    ? { hidden: { opacity: 1, y: 0 }, visible: { opacity: 1, y: 0 } }
    : fadeUp;
  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      custom={reduced ? 0 : delay}
      variants={variants}
      transition={reduced ? { duration: 0 } : undefined}
    >
      {children}
    </motion.div>
  );
}

export function AutomationClockPage() {
  const [yearFloat, setYearFloat] = useState(2026);
  const reduced = useReducedMotion();
  const data = useMemo(() => getInterpolatedData(yearFloat), [yearFloat]);

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--bg)',
        color: 'var(--primary)',
        overflowX: 'hidden',
      }}
    >
      <SEO
        title="The AI Impact Index | Automation Clock"
        description="Track AI disruption across 18 sectors from 2022 to 2030: jobs at risk, automation rates, and expert projections. Cited sources."
      />
      <Nav />

      <main
        className="depth-container"
        style={{
          paddingTop: 'var(--s8)',
          paddingBottom: 'var(--s8)',
          maxWidth: 1440,
          margin: '0 auto',
          paddingLeft: 'var(--s5)',
          paddingRight: 'var(--s5)',
        }}
      >
        {/* Hero */}
        <Reveal delay={0} reduced={reduced}>
          <header
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
              gap: 'var(--s5)',
              marginBottom: 'var(--s8)',
              borderBottom: '1px solid var(--stroke)',
              paddingBottom: 'var(--s6)',
            }}
          >
            <div style={{ maxWidth: 600 }}>
              <p
                style={{
                  fontSize: 'var(--text-2xs)',
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--muted)',
                  marginBottom: 'var(--s2)',
                  textTransform: 'uppercase',
                  letterSpacing: 'var(--tracking-wider)',
                }}
              >
                Instrument 05 — AI disruption tracker
              </p>
              <h1
                style={{
                  fontSize: 'var(--text-3xl)',
                  fontWeight: 'var(--weight-semibold)',
                  letterSpacing: 'var(--tracking-tight)',
                  color: 'var(--ink)',
                  margin: 0,
                }}
              >
                The AI Impact Index
              </h1>
              <p
                style={{
                  color: 'var(--secondary)',
                  fontWeight: 'var(--weight-light)',
                  fontSize: 'var(--text-sm)',
                  marginTop: 'var(--s2)',
                  lineHeight: 'var(--lead-body)',
                }}
              >
                Track automation, jobs at risk, and sector-level impact from 2022—when AI arrived—through 2030. Data and projections from McKinsey, Goldman Sachs, WEF, IMF, and others.
              </p>
            </div>
            <div
              style={{
                display: 'flex',
                gap: 'var(--s6)',
                flexWrap: 'wrap',
                alignItems: 'flex-end',
              }}
            >
              <div style={{ textAlign: 'right' }}>
                <div
                  style={{
                    fontSize: 'var(--text-2xs)',
                    fontFamily: 'var(--font-mono)',
                    color: 'var(--muted)',
                    textTransform: 'uppercase',
                    letterSpacing: 'var(--tracking-wider)',
                  }}
                >
                  Jobs at risk
                </div>
                <div
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 'var(--text-2xl)',
                    fontWeight: 'var(--weight-semibold)',
                    color: 'var(--ink)',
                    lineHeight: 1,
                  }}
                >
                  {data.globalJobsAtRisk >= 1_000_000
                    ? `${(data.globalJobsAtRisk / 1_000_000).toFixed(0)}M`
                    : `${(data.globalJobsAtRisk / 1_000).toFixed(0)}K`}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div
                  style={{
                    fontSize: 'var(--text-2xs)',
                    fontFamily: 'var(--font-mono)',
                    color: 'var(--muted)',
                    textTransform: 'uppercase',
                    letterSpacing: 'var(--tracking-wider)',
                  }}
                >
                  Sectors
                </div>
                <div
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 'var(--text-2xl)',
                    fontWeight: 'var(--weight-semibold)',
                    color: 'var(--ink)',
                    lineHeight: 1,
                  }}
                >
                  18
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div
                  style={{
                    fontSize: 'var(--text-2xs)',
                    fontFamily: 'var(--font-mono)',
                    color: 'var(--muted)',
                    textTransform: 'uppercase',
                    letterSpacing: 'var(--tracking-wider)',
                  }}
                >
                  Sources
                </div>
                <div
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 'var(--text-2xl)',
                    fontWeight: 'var(--weight-semibold)',
                    color: 'var(--ink)',
                    lineHeight: 1,
                  }}
                >
                  9+
                </div>
              </div>
            </div>
          </header>
        </Reveal>

        {/* Year slider */}
        <Reveal delay={0.05} reduced={reduced}>
          <section style={{ marginBottom: 'var(--s8)' }}>
            <YearSlider
              value={yearFloat}
              onChange={setYearFloat}
              phase={data.phase}
              isProjection={data.isProjection}
              min={FIRST_YEAR}
              max={LAST_YEAR}
              step={0.1}
            />
          </section>
        </Reveal>

        {/* Context summary */}
        <Reveal delay={0.1} reduced={reduced}>
          <section
            style={{
              marginBottom: 'var(--s8)',
              padding: 'var(--s5)',
              background: 'var(--bg-panel)',
              border: '1px solid var(--stroke)',
              borderRadius: 'var(--r-md)',
            }}
          >
            <p
              style={{
                fontSize: 'var(--text-sm)',
                color: 'var(--secondary)',
                lineHeight: 'var(--lead-body)',
                margin: 0,
                fontWeight: 'var(--weight-light)',
              }}
            >
              {data.summary}
            </p>
          </section>
        </Reveal>

        {/* Key metrics */}
        <Reveal delay={0.1} reduced={reduced}>
          <section
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: 'var(--s4)',
              marginBottom: 'var(--s8)',
            }}
          >
            <ImpactMetric
              label="Jobs at risk"
              value={data.globalJobsAtRisk}
              sublabel="global estimate"
              index={0}
            />
            <ImpactMetric
              label="GDP contribution"
              value={data.globalGDPContribution}
              sublabel="AI-driven"
              index={1}
            />
            <ImpactMetric
              label="Tasks automatable"
              value={`${data.tasksAutomatable}%`}
              sublabel="of work hours"
              index={2}
            />
            <ImpactMetric
              label="New jobs created"
              value={data.newJobsCreated}
              sublabel="emerging roles"
              index={3}
            />
          </section>
        </Reveal>

        {/* Sector grid */}
        <Reveal delay={0.15} reduced={reduced}>
          <section style={{ marginBottom: 'var(--s8)' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 'var(--s5)',
                flexWrap: 'wrap',
                gap: 'var(--s3)',
              }}
            >
              <h2
                style={{
                  fontSize: 'var(--text-2xs)',
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--muted)',
                  textTransform: 'uppercase',
                  letterSpacing: 'var(--tracking-wider)',
                  margin: 0,
                }}
              >
                Sector impact
              </h2>
              <span
                style={{
                  fontSize: 'var(--text-2xs)',
                  color: 'var(--muted)',
                  background: 'var(--bg-raised)',
                  padding: 'var(--s1) var(--s3)',
                  borderRadius: 'var(--r-pill)',
                  fontFamily: 'var(--font-mono)',
                }}
              >
                Live interpolation
              </span>
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: 'var(--s4)',
              }}
            >
              {SECTOR_ORDER.map((key, idx) => {
                const sector = data.sectors[key];
                if (!sector) return null;
                return (
                  <SectorCard
                    key={key}
                    sector={sector}
                    index={idx}
                    reducedMotion={reduced}
                  />
                );
              })}
            </div>
          </section>
        </Reveal>

        {/* Job impact */}
        <Reveal delay={0.2} reduced={reduced}>
          <section style={{ marginBottom: 'var(--s8)' }}>
            <JobImpactChart
              jobsDisplaced={data.jobsDisplaced}
              newJobsCreated={data.newJobsCreated}
            />
          </section>
        </Reveal>

        {/* Milestones */}
        <Reveal delay={0.2} reduced={reduced}>
          <section style={{ marginBottom: 'var(--s8)' }}>
            <MilestoneTimeline />
          </section>
        </Reveal>

        {/* Sources & methodology */}
        <Reveal delay={0.25} reduced={reduced}>
          <SourcesPanel />
        </Reveal>
      </main>

      <footer
        style={{
          paddingBlock: 'var(--s8)',
          borderTop: '1px solid var(--stroke)',
          textAlign: 'center',
        }}
      >
        <p
          style={{
            color: 'var(--muted)',
            fontSize: 'var(--text-2xs)',
            fontFamily: 'var(--font-mono)',
            textTransform: 'uppercase',
            letterSpacing: 'var(--tracking-wider)',
            margin: 0,
          }}
        >
          AI Beacon · The AI Impact Index · Cited sources and methodology above
        </p>
      </footer>
    </div>
  );
}
