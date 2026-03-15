import { useMemo } from 'react';
import { MODELS_WITH_SPEED } from '@/data/benchmarkData';

const CHART_H = 420;
const BAR_H = 18;
const GAP = 8;
const LABEL_W = 140;
const BAR_MAX_W = 320;
const PAD = { left: 0, right: 72, top: 8, bottom: 8 };

const TIER_LABELS: Record<string, string> = {
  frontier: 'Frontier',
  'open-weight': 'Open-weight',
  budget: 'Fast / Budget',
  historical: 'Historical',
};

export function SpeedChart() {
  const { rows, maxSpeed, medianSpeed } = useMemo(() => {
    const list = MODELS_WITH_SPEED;
    const speeds = list.map((m) => m.speed.tokensPerSecond ?? 0);
    const max = Math.max(...speeds, 1);
    const sorted = [...speeds].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    const median = sorted.length % 2 === 0 ? (sorted[mid - 1]! + sorted[mid]!) / 2 : sorted[mid]!;
    return {
      rows: list.map((m) => ({ model: m, speed: m.speed.tokensPerSecond ?? 0 })),
      maxSpeed: max,
      medianSpeed: median,
    };
  }, []);

  if (rows.length === 0) {
    return (
      <div
        style={{
          background: 'var(--bg-panel)',
          border: '1px solid var(--stroke)',
          borderRadius: 'var(--r-lg)',
          padding: 'var(--s5)',
          color: 'var(--muted)',
          fontFamily: 'var(--font-mono)',
          fontSize: 'var(--text-sm)',
        }}
      >
        No speed data available.
      </div>
    );
  }

  const totalH = rows.length * (BAR_H + GAP) + PAD.top + PAD.bottom;
  const chartH = Math.max(CHART_H, totalH);
  const medianX = PAD.left + LABEL_W + (BAR_MAX_W * medianSpeed) / maxSpeed;

  return (
    <div
      style={{
        background: 'var(--bg-panel)',
        border: '1px solid var(--stroke)',
        borderRadius: 'var(--r-lg)',
        padding: 'var(--s5)',
        boxShadow: 'var(--shadow-soft)',
      }}
    >
      <svg
        width="100%"
        height={chartH}
        viewBox={`0 0 ${LABEL_W + BAR_MAX_W + PAD.right} ${chartH}`}
        preserveAspectRatio="xMidYMid meet"
        style={{ maxWidth: 560, display: 'block', margin: '0 auto' }}
        aria-label="Output tokens per second by model"
      >
        {/* Median line */}
        <line
          x1={medianX}
          y1={PAD.top}
          x2={medianX}
          y2={chartH - PAD.bottom}
          stroke="var(--stroke-dark)"
          strokeWidth={1}
          strokeDasharray="4 3"
        />
        <text
          x={medianX + 4}
          y={14}
          fontFamily="var(--font-mono)"
          fontSize="9"
          fill="var(--muted)"
        >
          median
        </text>
        {rows.map((row, i) => {
          const y = PAD.top + i * (BAR_H + GAP) + BAR_H / 2;
          const barW = maxSpeed > 0 ? (BAR_MAX_W * row.speed) / maxSpeed : 0;
          const opacity = 0.4 + 0.6 * (1 - i / Math.max(rows.length, 1));
          return (
            <g key={row.model.id}>
              <text
                x={LABEL_W - 8}
                y={y + 4}
                textAnchor="end"
                fontFamily="var(--font-mono)"
                fontSize="11"
                fill="var(--ink)"
              >
                {row.model.name}
              </text>
              <rect
                x={LABEL_W}
                y={y - BAR_H / 2}
                width={barW}
                height={BAR_H}
                rx={2}
                fill="var(--viz-1)"
                opacity={opacity}
              />
              <text
                x={LABEL_W + BAR_MAX_W + 6}
                y={y + 4}
                fontFamily="var(--font-mono)"
                fontSize="11"
                fill="var(--secondary)"
              >
                {row.speed.toFixed(0)}/s
              </text>
            </g>
          );
        })}
      </svg>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 'var(--s4)',
          marginTop: 'var(--s4)',
          fontFamily: 'var(--font-mono)',
          fontSize: 'var(--text-2xs)',
          color: 'var(--muted)',
        }}
      >
        {Object.entries(TIER_LABELS).map(([key, label]) => (
          <span key={key} style={{ textTransform: 'uppercase', letterSpacing: 'var(--tracking-wider)' }}>
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}
