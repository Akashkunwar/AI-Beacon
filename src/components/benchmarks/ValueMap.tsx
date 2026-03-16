import { useMemo, useState, useRef } from 'react';
import {
  BENCHMARK_MODELS,
  compositeScore,
  blendedPrice,
} from '@/data/benchmarkData';

const W = 720;
const H = 460;
const PAD = { left: 64, right: 28, top: 28, bottom: 56 };

function getValueFrontier(
  pts: Array<{ quality: number; cost: number }>
): Array<{ quality: number; cost: number }> {
  const sorted = [...pts].sort((a, b) => a.cost - b.cost);
  const frontier: typeof sorted = [];
  let maxQ = -Infinity;
  for (const p of sorted) {
    if (p.quality >= maxQ) {
      frontier.push(p);
      maxQ = p.quality;
    }
  }
  return frontier;
}

export function ValueMap() {
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const chartW = W - PAD.left - PAD.right;
  const chartH = H - PAD.top - PAD.bottom;

  const { points, frontierPath, xTicks, yTicks } = useMemo(() => {
    const withPrice = BENCHMARK_MODELS
      .filter((m) => m.tier !== 'historical')
      .map((m) => ({
        model: m,
        quality: compositeScore(m),
        cost: blendedPrice(m),
      }))
      .filter((p): p is typeof p & { cost: number } => p.cost != null && p.cost > 0);

    if (withPrice.length === 0) {
      return { points: [], frontierPath: '', xTicks: [], yTicks: [], dataMinQ: 0, dataMaxQ: 100, dataMinCost: 0.1, dataMaxCost: 100 };
    }

    const qualities = withPrice.map((p) => p.quality);
    const costs = withPrice.map((p) => p.cost);
    const dataMinQ = Math.floor(Math.min(...qualities) / 5) * 5 - 5;
    const dataMaxQ = Math.ceil(Math.max(...qualities) / 5) * 5 + 5;
    const dataMinCost = Math.min(...costs) * 0.5;
    const dataMaxCost = Math.max(...costs) * 2;

    const logMin = Math.log10(dataMinCost);
    const logMax = Math.log10(dataMaxCost);

    const scaleX = (v: number) => PAD.left + (chartW * (v - dataMinQ)) / (dataMaxQ - dataMinQ || 1);
    const scaleY = (v: number) => {
      const t = (Math.log10(v) - logMin) / (logMax - logMin || 1);
      return PAD.top + chartH * (1 - t);
    };

    const points = withPrice.map((p) => ({
      ...p,
      x: scaleX(p.quality),
      y: scaleY(p.cost),
    }));

    const frontier = getValueFrontier(withPrice);
    const pathD =
      frontier.length > 1
        ? frontier
            .map((pt, i) => `${i === 0 ? 'M' : 'L'} ${scaleX(pt.quality)} ${scaleY(pt.cost)}`)
            .join(' ')
        : '';

    const xTicks: Array<{ x: number; label: string }> = [];
    for (let q = Math.ceil(dataMinQ / 5) * 5; q <= dataMaxQ; q += 5) {
      xTicks.push({ x: scaleX(q), label: String(q) });
    }

    const yTickValues = [0.1, 0.3, 1, 3, 10, 30, 100].filter((v) => v >= dataMinCost * 0.8 && v <= dataMaxCost * 1.2);
    const yTicks = yTickValues.map((v) => ({ y: scaleY(v), label: `$${v < 1 ? v.toFixed(1) : v.toFixed(0)}` }));

    return { points, frontierPath: pathD, xTicks, yTicks, dataMinQ, dataMaxQ, dataMinCost, dataMaxCost };
  }, [chartW, chartH]);

  const hoverModel = useMemo(
    () => (hoverId ? points.find((p) => p.model.id === hoverId) : null),
    [hoverId, points]
  );

  return (
    <div
      ref={containerRef}
      style={{
        background: 'var(--bg-panel)',
        border: '1px solid var(--stroke)',
        borderRadius: 'var(--r-lg)',
        padding: 'var(--s5)',
        boxShadow: 'var(--shadow-soft)',
        position: 'relative',
      }}
    >
      <div className="value-map-scroll" style={{ overflowX: 'auto', overflowY: 'hidden', maxWidth: '100%' }}>
        <svg
          width="100%"
          height={H}
          viewBox={`0 0 ${W} ${H}`}
          preserveAspectRatio="xMidYMid meet"
          style={{ minWidth: 280, maxWidth: W, display: 'block', margin: '0 auto' }}
          aria-label="Quality vs cost scatter plot"
        >
        {/* Y-axis grid + tick labels */}
        {yTicks.map((t, i) => (
          <g key={i}>
            <line
              x1={PAD.left}
              y1={t.y}
              x2={PAD.left + chartW}
              y2={t.y}
              stroke="var(--stroke)"
              strokeWidth={0.5}
            />
            <text
              x={PAD.left - 8}
              y={t.y + 3}
              textAnchor="end"
              fontFamily="var(--font-mono)"
              fontSize="9"
              fill="var(--muted)"
            >
              {t.label}
            </text>
          </g>
        ))}
        {/* X-axis grid + tick labels */}
        {xTicks.map((t, i) => (
          <g key={i}>
            <line
              x1={t.x}
              y1={PAD.top}
              x2={t.x}
              y2={PAD.top + chartH}
              stroke="var(--stroke)"
              strokeWidth={0.5}
            />
            <text
              x={t.x}
              y={PAD.top + chartH + 16}
              textAnchor="middle"
              fontFamily="var(--font-mono)"
              fontSize="9"
              fill="var(--muted)"
            >
              {t.label}
            </text>
          </g>
        ))}

        {/* Value frontier */}
        {frontierPath && (
          <path
            d={frontierPath}
            fill="none"
            stroke="var(--viz-1)"
            strokeWidth={1.5}
            strokeDasharray="4 3"
            opacity={0.5}
          />
        )}

        {/* Dots + name labels */}
        {points.map((p) => {
          const isHover = hoverId === p.model.id;
          return (
            <g
              key={p.model.id}
              onMouseEnter={() => setHoverId(p.model.id)}
              onMouseLeave={() => setHoverId(null)}
              onMouseMove={(e) => {
                const rect = containerRef.current?.getBoundingClientRect();
                if (rect) setMouse({ x: e.clientX - rect.left, y: e.clientY - rect.top });
              }}
            >
              <circle
                cx={p.x}
                cy={p.y}
                r={isHover ? 8 : 6}
                fill={p.model.openSource ? 'var(--viz-2)' : 'var(--viz-1)'}
                stroke={isHover ? 'var(--ink)' : 'none'}
                strokeWidth={isHover ? 1.5 : 0}
                opacity={isHover ? 1 : 0.85}
                style={{ cursor: 'pointer' }}
              />
              <text
                x={p.x + 9}
                y={p.y + 3}
                fontFamily="var(--font-mono)"
                fontSize="8.5"
                fill="var(--secondary)"
              >
                {p.model.name}
              </text>
            </g>
          );
        })}

        {/* X-axis label */}
        <text
          x={PAD.left + chartW / 2}
          y={H - 6}
          textAnchor="middle"
          fontFamily="var(--font-mono)"
          fontSize="10"
          fill="var(--muted)"
        >
          Composite Quality Score →
        </text>
        {/* Y-axis label */}
        <text
          x={14}
          y={PAD.top + chartH / 2}
          textAnchor="middle"
          fontFamily="var(--font-mono)"
          fontSize="10"
          fill="var(--muted)"
          transform={`rotate(-90, 14, ${PAD.top + chartH / 2})`}
        >
          Cost $/1M tokens (log) →
        </text>
      </svg>
      </div>

      {/* Legend */}
      <div
        style={{
          display: 'flex',
          gap: 'var(--s5)',
          marginTop: 'var(--s3)',
          fontFamily: 'var(--font-mono)',
          fontSize: 'var(--text-2xs)',
          color: 'var(--muted)',
        }}
      >
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--s2)' }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--viz-1)' }} />
          Closed-source
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--s2)' }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--viz-2)' }} />
          Open-weight
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--s2)' }}>
          <span style={{ width: 16, height: 0, borderTop: '1.5px dashed var(--viz-1)', opacity: 0.5 }} />
          Value frontier
        </span>
      </div>

      {/* Tooltip */}
      {hoverModel && (
        <div
          style={{
            position: 'absolute',
            left: Math.min(mouse.x + 12, W - 200),
            top: mouse.y + 8,
            background: 'var(--bg)',
            border: '1px solid var(--stroke-dark)',
            borderRadius: 'var(--r-md)',
            padding: 'var(--s3) var(--s4)',
            boxShadow: 'var(--shadow-lift)',
            fontFamily: 'var(--font-sans)',
            fontSize: 'var(--text-xs)',
            color: 'var(--ink)',
            pointerEvents: 'none',
            zIndex: 10,
            maxWidth: 240,
          }}
        >
          <div style={{ fontWeight: 'var(--weight-semibold)', marginBottom: 'var(--s1)' }}>
            {hoverModel.model.name}
          </div>
          <div style={{ color: 'var(--secondary)' }}>
            Quality: {hoverModel.quality.toFixed(1)} · ${hoverModel.cost.toFixed(2)}/1M blended
          </div>
          <div style={{ color: 'var(--muted)', marginTop: 'var(--s1)' }}>
            {hoverModel.model.provider} · {hoverModel.model.contextWindow.toLocaleString()} ctx
          </div>
        </div>
      )}
    </div>
  );
}
