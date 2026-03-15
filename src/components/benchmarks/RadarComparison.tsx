import { useMemo, useState } from 'react';
import {
  BENCHMARK_MODELS,
  blendedPrice,
  MODELS_WITH_SPEED,
} from '@/data/benchmarkData';
import type { BenchmarkModel } from '@/data/benchmarkData';

const RADAR_SIZE = 220;
const RADAR_CX = RADAR_SIZE / 2;
const RADAR_CY = RADAR_SIZE / 2;
const RADAR_R = RADAR_SIZE / 2 - 28;

const AXES = [
  { key: 'mmlu', label: 'Reasoning', get: (m: BenchmarkModel) => m.scores.mmlu },
  { key: 'humanEval', label: 'Coding', get: (m: BenchmarkModel) => m.scores.humanEval },
  { key: 'math', label: 'Math', get: (m: BenchmarkModel) => m.scores.math },
  { key: 'gpqa', label: 'Science', get: (m: BenchmarkModel) => m.scores.gpqa },
  {
    key: 'speed',
    label: 'Speed',
    get: (m: BenchmarkModel) => m.speed.tokensPerSecond,
  },
  {
    key: 'value',
    label: 'Value',
    get: (m: BenchmarkModel) => {
      const p = blendedPrice(m);
      if (p == null || p <= 0) return null;
      return 100 - Math.min(100, Math.log10(p + 0.1) * 25);
    },
  },
] as const;

function normalize(v: number | null, maxVal: number): number {
  if (v == null || maxVal <= 0) return 0;
  return Math.min(1, Math.max(0, v / maxVal));
}

function radarPoint(angleDeg: number, r: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return {
    x: RADAR_CX + RADAR_R * r * Math.sin(rad),
    y: RADAR_CY - RADAR_R * r * Math.cos(rad),
  };
}

export function RadarComparison() {
  const nonHistorical = useMemo(
    () => BENCHMARK_MODELS.filter((m) => m.tier !== 'historical'),
    []
  );
  const [modelAId, setModelAId] = useState(nonHistorical[0]?.id ?? '');
  const [modelBId, setModelBId] = useState(nonHistorical[1]?.id ?? '');

  const modelA = useMemo(
    () => BENCHMARK_MODELS.find((m) => m.id === modelAId) ?? nonHistorical[0],
    [modelAId, nonHistorical]
  );
  const modelB = useMemo(
    () => BENCHMARK_MODELS.find((m) => m.id === modelBId) ?? nonHistorical[1],
    [modelBId, nonHistorical]
  );

  const maxSpeed = useMemo(
    () => Math.max(...MODELS_WITH_SPEED.map((m) => m.speed.tokensPerSecond ?? 0), 1),
    []
  );

  const valuesA = useMemo(
    () =>
      AXES.map((ax) => {
        const v = ax.get(modelA);
        if (ax.key === 'speed') return normalize(v as number | null, maxSpeed);
        return typeof v === 'number' ? v / 100 : 0;
      }),
    [modelA, maxSpeed]
  );
  const valuesB = useMemo(
    () =>
      AXES.map((ax) => {
        const v = ax.get(modelB);
        if (ax.key === 'speed') return normalize(v as number | null, maxSpeed);
        return typeof v === 'number' ? v / 100 : 0;
      }),
    [modelB, maxSpeed]
  );

  const polygonA = useMemo(() => {
    return AXES.map((_, i) => {
      const angle = 90 - (i * 360) / AXES.length;
      return radarPoint(angle, valuesA[i]);
    });
  }, [valuesA]);
  const polygonB = useMemo(() => {
    return AXES.map((_, i) => {
      const angle = 90 - (i * 360) / AXES.length;
      return radarPoint(angle, valuesB[i]);
    });
  }, [valuesB]);

  const pathD = (points: Array<{ x: number; y: number }>) =>
    points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z';

  const labelPositions = useMemo(
    () =>
      AXES.map((ax, i) => {
        const angle = 90 - (i * 360) / AXES.length;
        const p = radarPoint(angle, 1.08);
        return { ...p, label: ax.label };
      }),
    []
  );

  return (
    <div
      style={{
        background: 'var(--bg-panel)',
        border: '1px solid var(--stroke)',
        borderRadius: 'var(--r-lg)',
        padding: 'var(--s6)',
        boxShadow: 'var(--shadow-soft)',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 'var(--s5)',
          alignItems: 'flex-start',
          marginBottom: 'var(--s5)',
        }}
      >
        <div>
          <label
            htmlFor="radar-model-a"
            style={{
              display: 'block',
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--text-2xs)',
              color: 'var(--muted)',
              marginBottom: 'var(--s2)',
              textTransform: 'uppercase',
              letterSpacing: 'var(--tracking-wider)',
            }}
          >
            Model A
          </label>
          <select
            id="radar-model-a"
            value={modelAId}
            onChange={(e) => setModelAId(e.target.value)}
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 'var(--text-sm)',
              color: 'var(--ink)',
              background: 'var(--bg)',
              border: '1px solid var(--stroke-dark)',
              borderRadius: 'var(--r-md)',
              padding: 'var(--s2) var(--s3)',
              minWidth: 180,
            }}
          >
            {nonHistorical.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label
            htmlFor="radar-model-b"
            style={{
              display: 'block',
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--text-2xs)',
              color: 'var(--muted)',
              marginBottom: 'var(--s2)',
              textTransform: 'uppercase',
              letterSpacing: 'var(--tracking-wider)',
            }}
          >
            Model B
          </label>
          <select
            id="radar-model-b"
            value={modelBId}
            onChange={(e) => setModelBId(e.target.value)}
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 'var(--text-sm)',
              color: 'var(--ink)',
              background: 'var(--bg)',
              border: '1px solid var(--stroke-dark)',
              borderRadius: 'var(--r-md)',
              padding: 'var(--s2) var(--s3)',
              minWidth: 180,
            }}
          >
            {nonHistorical.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <svg
        width={RADAR_SIZE}
        height={RADAR_SIZE}
        viewBox={`0 0 ${RADAR_SIZE} ${RADAR_SIZE}`}
        style={{ display: 'block', margin: '0 auto' }}
        aria-label="Radar comparison of two models"
      >
        {/* Grid circles */}
        {[0.25, 0.5, 0.75, 1].map((r) => (
          <circle
            key={r}
            cx={RADAR_CX}
            cy={RADAR_CY}
            r={RADAR_R * r}
            fill="none"
            stroke="var(--stroke)"
            strokeWidth={0.5}
          />
        ))}
        {/* Axis lines */}
        {AXES.map((_, i) => {
          const angle = 90 - (i * 360) / AXES.length;
          const p = radarPoint(angle, 1);
          return (
            <line
              key={i}
              x1={RADAR_CX}
              y1={RADAR_CY}
              x2={p.x}
              y2={p.y}
              stroke="var(--stroke)"
              strokeWidth={0.5}
            />
          );
        })}
        {/* Labels */}
        {labelPositions.map((pos, i) => (
          <text
            key={i}
            x={pos.x}
            y={pos.y}
            textAnchor="middle"
            dominantBaseline="middle"
            fontFamily="var(--font-mono)"
            fontSize="10"
            fill="var(--muted)"
          >
            {pos.label}
          </text>
        ))}
        {/* Model B polygon (behind) */}
        <path
          d={pathD(polygonB)}
          fill="var(--viz-3)"
          fillOpacity={0.25}
          stroke="var(--viz-3)"
          strokeWidth={1.5}
        />
        {/* Model A polygon */}
        <path
          d={pathD(polygonA)}
          fill="var(--viz-1)"
          fillOpacity={0.3}
          stroke="var(--viz-1)"
          strokeWidth={1.5}
        />
      </svg>

      {/* Legend */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: 'var(--s6)',
          marginTop: 'var(--s4)',
          fontFamily: 'var(--font-mono)',
          fontSize: 'var(--text-xs)',
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--s2)' }}>
          <span
            style={{
              width: 12,
              height: 12,
              background: 'var(--viz-1)',
              opacity: 0.8,
              borderRadius: 2,
            }}
          />
          {modelA.name}
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--s2)' }}>
          <span
            style={{
              width: 12,
              height: 12,
              background: 'var(--viz-3)',
              opacity: 0.8,
              borderRadius: 2,
            }}
          />
          {modelB.name}
        </span>
      </div>

      {/* Stat comparison table */}
      <table
        style={{
          width: '100%',
          marginTop: 'var(--s6)',
          borderCollapse: 'collapse',
          fontFamily: 'var(--font-sans)',
          fontSize: 'var(--text-sm)',
        }}
        aria-label="Comparison of selected models"
      >
        <thead>
          <tr>
            <th
              scope="col"
              style={{
                padding: 'var(--s3) var(--s4)',
                textAlign: 'left',
                fontFamily: 'var(--font-mono)',
                fontSize: 'var(--text-2xs)',
                color: 'var(--muted)',
                textTransform: 'uppercase',
                borderBottom: '1px solid var(--stroke)',
                background: 'var(--table-header-bg)',
              }}
            >
              Metric
            </th>
            <th
              scope="col"
              style={{
                padding: 'var(--s3) var(--s4)',
                textAlign: 'right',
                fontFamily: 'var(--font-mono)',
                fontSize: 'var(--text-2xs)',
                color: 'var(--ink)',
                borderBottom: '1px solid var(--stroke)',
                background: 'var(--table-header-bg)',
              }}
            >
              {modelA.name}
            </th>
            <th
              scope="col"
              style={{
                padding: 'var(--s3) var(--s4)',
                textAlign: 'right',
                fontFamily: 'var(--font-mono)',
                fontSize: 'var(--text-2xs)',
                color: 'var(--ink)',
                borderBottom: '1px solid var(--stroke)',
                background: 'var(--table-header-bg)',
              }}
            >
              {modelB.name}
            </th>
          </tr>
        </thead>
        <tbody>
          {AXES.map((ax) => {
            const vA = ax.get(modelA);
            const vB = ax.get(modelB);
            const dispA =
              ax.key === 'speed'
                ? vA != null
                  ? `${(vA as number).toFixed(0)}/s`
                  : '—'
                : vA != null
                  ? typeof vA === 'number' && vA <= 100
                    ? `${vA.toFixed(1)}%`
                    : String(vA)
                  : '—';
            const dispB =
              ax.key === 'speed'
                ? vB != null
                  ? `${(vB as number).toFixed(0)}/s`
                  : '—'
                : vB != null
                  ? typeof vB === 'number' && vB <= 100
                    ? `${vB.toFixed(1)}%`
                    : String(vB)
                  : '—';
            return (
              <tr key={ax.key} style={{ borderBottom: '1px solid var(--stroke)' }}>
                <td style={{ padding: 'var(--s3) var(--s4)', color: 'var(--secondary)' }}>
                  {ax.label}
                </td>
                <td style={{ padding: 'var(--s3) var(--s4)', textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)' }}>
                  {dispA}
                </td>
                <td style={{ padding: 'var(--s3) var(--s4)', textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)' }}>
                  {dispB}
                </td>
              </tr>
            );
          })}
          <tr style={{ borderBottom: '1px solid var(--stroke)' }}>
            <td style={{ padding: 'var(--s3) var(--s4)', color: 'var(--secondary)' }}>$/1M blended</td>
            <td style={{ padding: 'var(--s3) var(--s4)', textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)' }}>
              {blendedPrice(modelA) != null ? `$${blendedPrice(modelA)!.toFixed(2)}` : '—'}
            </td>
            <td style={{ padding: 'var(--s3) var(--s4)', textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)' }}>
              {blendedPrice(modelB) != null ? `$${blendedPrice(modelB)!.toFixed(2)}` : '—'}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
