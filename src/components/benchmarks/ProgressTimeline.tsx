import { useMemo, useState } from 'react';
import { MODELS_WITH_MMLU } from '@/data/benchmarkData';

const W = 720;
const H = 400;
const PAD = { left: 52, right: 120, top: 28, bottom: 52 };

const EXPERT_BASELINE = 89.8;
const RANDOM_BASELINE = 34.5;

const KEY_MODELS = new Set([
  'gpt-3', 'gpt-3.5-turbo', 'gpt-4', 'gpt-4o', 'o3',
  'claude-2', 'claude-opus-4',
  'gemini-1.0-pro', 'gemini-2.5-pro',
  'deepseek-v3',
]);

export function ProgressTimeline() {
  const [hoverId, setHoverId] = useState<string | null>(null);

  const { points, yearTicks, scoreTicks, chartW, chartH, scaleY } = useMemo(() => {
    const list = MODELS_WITH_MMLU;
    const chartW = W - PAD.left - PAD.right;
    const chartH = H - PAD.top - PAD.bottom;

    if (list.length === 0) {
      return {
        points: [],
        yearTicks: [],
        scoreTicks: [],
        chartW,
        chartH,
        scaleX: () => 0,
        scaleY: () => 0,
      };
    }

    const dates = list.map((m) => new Date(m.releaseDate).getTime());
    const minDate = Math.min(...dates);
    const maxDate = Math.max(...dates);

    const minYear = new Date(minDate).getFullYear();
    const maxYear = new Date(maxDate).getFullYear();

    const minScore = 30;
    const maxScore = 100;

    const scaleX = (t: number) =>
      PAD.left + (chartW * (t - minDate)) / (maxDate - minDate || 1);
    const scaleY = (s: number) =>
      PAD.top + chartH * (1 - (s - minScore) / (maxScore - minScore));

    const points = list.map((m) => ({
      model: m,
      x: scaleX(new Date(m.releaseDate).getTime()),
      y: scaleY(m.scores.mmlu ?? 0),
      score: m.scores.mmlu ?? 0,
      isKey: KEY_MODELS.has(m.id),
    }));
    points.sort((a, b) => new Date(a.model.releaseDate).getTime() - new Date(b.model.releaseDate).getTime());

    const yearTicks: Array<{ x: number; label: string }> = [];
    for (let yr = minYear; yr <= maxYear; yr++) {
      const t = new Date(`${yr}-07-01`).getTime();
      yearTicks.push({ x: scaleX(t), label: String(yr) });
    }

    const scoreTicks: Array<{ y: number; label: string }> = [];
    for (let s = 30; s <= 100; s += 10) {
      scoreTicks.push({ y: scaleY(s), label: `${s}%` });
    }

    return { points, yearTicks, scoreTicks, chartW, chartH, scaleX, scaleY };
  }, []);

  const linePath = useMemo(() => {
    if (points.length < 2) return '';
    return points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  }, [points]);

  const expertY = useMemo(() => scaleY(EXPERT_BASELINE), [scaleY]);
  const randomY = useMemo(() => scaleY(RANDOM_BASELINE), [scaleY]);

  if (points.length === 0) {
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
        No MMLU data available for timeline.
      </div>
    );
  }

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
        height={H}
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="xMidYMid meet"
        style={{ maxWidth: W, display: 'block', margin: '0 auto' }}
        aria-label="MMLU score progress over time"
      >
        {/* Y-axis score ticks + grid lines */}
        {scoreTicks.map((tick) => (
          <g key={tick.label}>
            <line
              x1={PAD.left}
              y1={tick.y}
              x2={PAD.left + chartW}
              y2={tick.y}
              stroke="var(--stroke)"
              strokeWidth={0.5}
            />
            <text
              x={PAD.left - 8}
              y={tick.y + 3}
              textAnchor="end"
              fontFamily="var(--font-mono)"
              fontSize="9"
              fill="var(--muted)"
            >
              {tick.label}
            </text>
          </g>
        ))}
        {/* X-axis year ticks */}
        {yearTicks.map((tick) => (
          <g key={tick.label}>
            <line
              x1={tick.x}
              y1={PAD.top}
              x2={tick.x}
              y2={PAD.top + chartH}
              stroke="var(--stroke)"
              strokeWidth={0.5}
            />
            <text
              x={tick.x}
              y={PAD.top + chartH + 16}
              textAnchor="middle"
              fontFamily="var(--font-mono)"
              fontSize="10"
              fill="var(--muted)"
            >
              {tick.label}
            </text>
          </g>
        ))}

        {/* Random baseline */}
        <line
          x1={PAD.left}
          y1={randomY}
          x2={PAD.left + chartW}
          y2={randomY}
          stroke="var(--viz-neg)"
          strokeWidth={1}
          strokeDasharray="6 4"
          opacity={0.6}
        />
        <text
          x={PAD.left + chartW + 6}
          y={randomY + 3}
          fontFamily="var(--font-mono)"
          fontSize="9"
          fill="var(--viz-neg)"
        >
          Random 34.5%
        </text>

        {/* Expert baseline */}
        <line
          x1={PAD.left}
          y1={expertY}
          x2={PAD.left + chartW}
          y2={expertY}
          stroke="var(--viz-2)"
          strokeWidth={1}
          strokeDasharray="6 4"
          opacity={0.6}
        />
        <text
          x={PAD.left + chartW + 6}
          y={expertY + 3}
          fontFamily="var(--font-mono)"
          fontSize="9"
          fill="var(--viz-2)"
        >
          Expert 89.8%
        </text>

        {/* Line */}
        <path
          d={linePath}
          fill="none"
          stroke="var(--viz-1)"
          strokeWidth={2}
        />

        {/* Dots + labels for key models */}
        {points.map((p) => {
          const isHover = hoverId === p.model.id;
          const showLabel = p.isKey || isHover;
          const labelAbove = p.score > 80;
          return (
            <g
              key={p.model.id}
              onMouseEnter={() => setHoverId(p.model.id)}
              onMouseLeave={() => setHoverId(null)}
            >
              <circle
                cx={p.x}
                cy={p.y}
                r={isHover ? 6 : p.isKey ? 5 : 3.5}
                fill={p.isKey ? 'var(--viz-1)' : 'var(--viz-bar-rest)'}
                stroke={isHover ? 'var(--ink)' : 'none'}
                strokeWidth={isHover ? 1.5 : 0}
                style={{ cursor: 'pointer' }}
              />
              {showLabel && (
                <text
                  x={p.x + 6}
                  y={labelAbove ? p.y - 8 : p.y + 14}
                  fontFamily="var(--font-mono)"
                  fontSize="9"
                  fill="var(--ink)"
                >
                  {p.model.name} ({p.score.toFixed(1)}%)
                </text>
              )}
            </g>
          );
        })}

        {/* Y-axis label */}
        <text
          x={12}
          y={PAD.top + chartH / 2}
          textAnchor="middle"
          fontFamily="var(--font-mono)"
          fontSize="10"
          fill="var(--muted)"
          transform={`rotate(-90, 12, ${PAD.top + chartH / 2})`}
        >
          MMLU Score
        </text>
      </svg>

      {/* Hover detail */}
      {hoverId && (() => {
        const p = points.find((x) => x.model.id === hoverId);
        if (!p) return null;
        return (
          <div
            style={{
              marginTop: 'var(--s4)',
              padding: 'var(--s3) var(--s4)',
              background: 'var(--bg)',
              border: '1px solid var(--stroke)',
              borderRadius: 'var(--r-md)',
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--text-xs)',
              color: 'var(--ink)',
              display: 'inline-block',
            }}
          >
            <strong>{p.model.name}</strong> — {p.model.provider} · {new Date(p.model.releaseDate).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
            })}{' '}
            · MMLU {p.score.toFixed(1)}%
          </div>
        );
      })()}
    </div>
  );
}
