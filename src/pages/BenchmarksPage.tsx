import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { SEO } from '@/components/common/SEO';
import { SITE_CONFIG } from '@/config/site';
import { Nav } from '@/components/shared/Nav';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { BENCHMARK_MODELS, LAST_UPDATED } from '@/data/benchmarkData';
import { BenchmarkLeaderboard } from '@/components/benchmarks/BenchmarkLeaderboard';
import { ValueMap } from '@/components/benchmarks/ValueMap';
import { SpeedChart } from '@/components/benchmarks/SpeedChart';
import { RadarComparison } from '@/components/benchmarks/RadarComparison';
import { ProgressTimeline } from '@/components/benchmarks/ProgressTimeline';
import { BenchmarkGlossary } from '@/components/benchmarks/BenchmarkGlossary';
import { BenchmarkSources } from '@/components/benchmarks/BenchmarkSources';

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

export function BenchmarksPage() {
  const reduced = useReducedMotion();

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
        title="Model Benchmarks | AI Beacon"
        description="Every major AI model compared across MMLU, HumanEval, MATH, GPQA, GSM8K, and Arena ELO. No cherry-picked results. Just numbers."
        canonical={`${SITE_CONFIG.baseUrl}/benchmarks`}
        structuredData={{
          '@context': 'https://schema.org',
          '@type': 'WebApplication',
          name: 'AI Beacon Benchmarks & Leaderboard',
          description: 'Every major AI model compared across MMLU, HumanEval, MATH, GPQA, GSM8K, and Arena ELO.',
          applicationCategory: 'EducationalApplication',
          operatingSystem: 'Web',
        }}
      />
      <Nav />

      <main
        id="main"
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
                Instrument 04 — AI model benchmarks
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
                Model Benchmarks
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
                Every major model compared across the benchmarks that matter. No cherry-picked results. Just numbers.
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
                  Models
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
                  {BENCHMARK_MODELS.length}
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
                  Benchmarks
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
                  6
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
                  Last updated
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
                  {LAST_UPDATED.slice(0, 7)}
                </div>
              </div>
            </div>
          </header>
        </Reveal>

        {/* Leaderboard */}
        <Reveal delay={0.05} reduced={reduced}>
          <section style={{ marginBottom: 'var(--s8)' }} aria-labelledby="leaderboard-heading">
            <h2
              id="leaderboard-heading"
              style={{
                fontSize: 'var(--text-2xs)',
                fontFamily: 'var(--font-mono)',
                color: 'var(--muted)',
                textTransform: 'uppercase',
                letterSpacing: 'var(--tracking-wider)',
                marginBottom: 'var(--s5)',
              }}
            >
              Leaderboard
            </h2>
            <BenchmarkLeaderboard />
          </section>
        </Reveal>

        {/* Value Map */}
        <Reveal delay={0.1} reduced={reduced}>
          <section style={{ marginBottom: 'var(--s8)' }} aria-labelledby="value-map-heading">
            <h2
              id="value-map-heading"
              style={{
                fontSize: 'var(--text-2xs)',
                fontFamily: 'var(--font-mono)',
                color: 'var(--muted)',
                textTransform: 'uppercase',
                letterSpacing: 'var(--tracking-wider)',
                marginBottom: 'var(--s5)',
              }}
            >
              Quality vs. cost
            </h2>
            <ValueMap />
          </section>
        </Reveal>

        {/* Speed */}
        <Reveal delay={0.1} reduced={reduced}>
          <section style={{ marginBottom: 'var(--s8)' }} aria-labelledby="speed-heading">
            <h2
              id="speed-heading"
              style={{
                fontSize: 'var(--text-2xs)',
                fontFamily: 'var(--font-mono)',
                color: 'var(--muted)',
                textTransform: 'uppercase',
                letterSpacing: 'var(--tracking-wider)',
                marginBottom: 'var(--s5)',
              }}
            >
              Speed comparison
            </h2>
            <SpeedChart />
          </section>
        </Reveal>

        {/* Radar */}
        <Reveal delay={0.15} reduced={reduced}>
          <section style={{ marginBottom: 'var(--s8)' }} aria-labelledby="radar-heading">
            <h2
              id="radar-heading"
              style={{
                fontSize: 'var(--text-2xs)',
                fontFamily: 'var(--font-mono)',
                color: 'var(--muted)',
                textTransform: 'uppercase',
                letterSpacing: 'var(--tracking-wider)',
                marginBottom: 'var(--s5)',
              }}
            >
              Compare two models
            </h2>
            <RadarComparison />
          </section>
        </Reveal>

        {/* Progress */}
        <Reveal delay={0.15} reduced={reduced}>
          <section style={{ marginBottom: 'var(--s8)' }} aria-labelledby="progress-heading">
            <h2
              id="progress-heading"
              style={{
                fontSize: 'var(--text-2xs)',
                fontFamily: 'var(--font-mono)',
                color: 'var(--muted)',
                textTransform: 'uppercase',
                letterSpacing: 'var(--tracking-wider)',
                marginBottom: 'var(--s5)',
              }}
            >
              MMLU progress over time
            </h2>
            <ProgressTimeline />
          </section>
        </Reveal>

        {/* Glossary */}
        <Reveal delay={0.2} reduced={reduced}>
          <section style={{ marginBottom: 'var(--s8)' }} aria-labelledby="glossary-heading">
            <h2
              id="glossary-heading"
              style={{
                fontSize: 'var(--text-2xs)',
                fontFamily: 'var(--font-mono)',
                color: 'var(--muted)',
                textTransform: 'uppercase',
                letterSpacing: 'var(--tracking-wider)',
                marginBottom: 'var(--s5)',
              }}
            >
              What each benchmark measures
            </h2>
            <BenchmarkGlossary />
          </section>
        </Reveal>

        {/* Sources */}
        <Reveal delay={0.25} reduced={reduced}>
          <BenchmarkSources />
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
          AI Beacon · Model Benchmarks · Data and sources above
        </p>
      </footer>
    </div>
  );
}
