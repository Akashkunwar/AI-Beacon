import { useMemo, useState, useCallback } from 'react';
import {
  BENCHMARK_MODELS,
  compositeScore,
  blendedPrice,
} from '@/data/benchmarkData';

type SortKey = 'rank' | 'name' | 'provider' | 'mmlu' | 'humanEval' | 'math' | 'gpqa' | 'arenaElo' | 'price';

function ScoreCell({ value }: { value: number | null }) {
  if (value == null) return <span style={{ color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>—</span>;
  const pct = Math.min(100, Math.max(0, value));
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--s2)' }}>
      <div
        style={{
          width: 48,
          height: 6,
          background: 'var(--stroke)',
          borderRadius: 'var(--r-pill)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: `${pct}%`,
            height: '100%',
            background: 'var(--viz-1)',
            borderRadius: 'var(--r-pill)',
          }}
        />
      </div>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--ink)', minWidth: 36 }}>
        {value.toFixed(1)}%
      </span>
    </div>
  );
}

function EloCell({ value }: { value: number | null }) {
  if (value == null) return <span style={{ color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>—</span>;
  return (
    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--ink)' }}>
      {Math.round(value)}
    </span>
  );
}

function SortHeader({
  label,
  sortKey,
  currentSort,
  direction,
  onSort,
}: {
  label: string;
  sortKey: SortKey;
  currentSort: SortKey;
  direction: 'asc' | 'desc';
  onSort: (key: SortKey) => void;
}) {
  const isActive = currentSort === sortKey;
  return (
    <th
      scope="col"
      style={{
        padding: 'var(--s3) var(--s4)',
        textAlign: 'left',
        fontFamily: 'var(--font-mono)',
        fontSize: 'var(--text-2xs)',
        fontWeight: 'var(--weight-medium)',
        color: isActive ? 'var(--ink)' : 'var(--muted)',
        textTransform: 'uppercase',
        letterSpacing: 'var(--tracking-wider)',
        borderBottom: '1px solid var(--stroke)',
        background: 'var(--table-header-bg)',
        cursor: 'pointer',
        userSelect: 'none',
      }}
      onClick={() => onSort(sortKey)}
    >
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--s1)' }}>
        {label}
        {isActive && (
          <span style={{ fontSize: '0.65rem', color: 'var(--ink)' }}>{direction === 'asc' ? '↑' : '↓'}</span>
        )}
      </span>
    </th>
  );
}

export function BenchmarkLeaderboard() {
  const [sortKey, setSortKey] = useState<SortKey>('rank');
  const [direction, setDirection] = useState<'asc' | 'desc'>('asc');

  const handleSort = useCallback((key: SortKey) => {
    setSortKey((prev) => {
      if (prev === key) {
        setDirection((d) => (d === 'asc' ? 'desc' : 'asc'));
        return key;
      }
      setDirection(key === 'rank' || key === 'mmlu' || key === 'humanEval' || key === 'math' || key === 'gpqa' || key === 'arenaElo' ? 'desc' : 'asc');
      return key;
    });
  }, []);

  const sorted = useMemo(() => {
    const withRank = BENCHMARK_MODELS.map((m) => ({
      ...m,
      rank: compositeScore(m),
      price: blendedPrice(m),
    }));
    const sortedList = [...withRank].sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case 'rank':
          cmp = a.rank - b.rank;
          break;
        case 'name':
          cmp = a.name.localeCompare(b.name);
          break;
        case 'provider':
          cmp = a.provider.localeCompare(b.provider);
          break;
        case 'mmlu':
          cmp = (a.scores.mmlu ?? 0) - (b.scores.mmlu ?? 0);
          break;
        case 'humanEval':
          cmp = (a.scores.humanEval ?? 0) - (b.scores.humanEval ?? 0);
          break;
        case 'math':
          cmp = (a.scores.math ?? 0) - (b.scores.math ?? 0);
          break;
        case 'gpqa':
          cmp = (a.scores.gpqa ?? 0) - (b.scores.gpqa ?? 0);
          break;
        case 'arenaElo':
          cmp = (a.scores.arenaElo ?? 0) - (b.scores.arenaElo ?? 0);
          break;
        case 'price': {
          const pa = a.price ?? Infinity;
          const pb = b.price ?? Infinity;
          cmp = pa - pb;
          break;
        }
        default:
          break;
      }
      return direction === 'asc' ? cmp : -cmp;
    });
    return sortedList;
  }, [sortKey, direction]);

  return (
    <div
      style={{
        background: 'var(--bg-panel)',
        border: '1px solid var(--stroke)',
        borderRadius: 'var(--r-lg)',
        boxShadow: 'var(--shadow-soft)',
        overflow: 'auto',
      }}
      role="region"
      aria-label="Sortable benchmark leaderboard"
    >
      <table
        className="benchmark-leaderboard-table"
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontFamily: 'var(--font-sans)',
          fontSize: 'var(--text-sm)',
        }}
      >
        <thead>
          <tr>
            <SortHeader label="Rank" sortKey="rank" currentSort={sortKey} direction={direction} onSort={handleSort} />
            <SortHeader label="Model" sortKey="name" currentSort={sortKey} direction={direction} onSort={handleSort} />
            <SortHeader label="Provider" sortKey="provider" currentSort={sortKey} direction={direction} onSort={handleSort} />
            <SortHeader label="MMLU" sortKey="mmlu" currentSort={sortKey} direction={direction} onSort={handleSort} />
            <SortHeader label="HumanEval" sortKey="humanEval" currentSort={sortKey} direction={direction} onSort={handleSort} />
            <SortHeader label="MATH" sortKey="math" currentSort={sortKey} direction={direction} onSort={handleSort} />
            <SortHeader label="GPQA" sortKey="gpqa" currentSort={sortKey} direction={direction} onSort={handleSort} />
            <SortHeader label="Arena ELO" sortKey="arenaElo" currentSort={sortKey} direction={direction} onSort={handleSort} />
            <SortHeader label="$/1M (blended)" sortKey="price" currentSort={sortKey} direction={direction} onSort={handleSort} />
          </tr>
        </thead>
        <tbody>
          {sorted.map((row, idx) => (
            <tr
              key={row.id}
              style={{
                borderBottom: idx < sorted.length - 1 ? '1px solid var(--stroke)' : 'none',
                background: 'transparent',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--table-row-hover)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
            >
              <td style={{ padding: 'var(--s3) var(--s4)', fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--ink)' }}>
                {row.rank.toFixed(1)}
              </td>
              <td style={{ padding: 'var(--s3) var(--s4)' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--s2)' }}>
                  {row.openSource && (
                    <span
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        background: 'var(--viz-2)',
                        flexShrink: 0,
                      }}
                      title="Open source"
                      aria-hidden
                    />
                  )}
                  <span style={{ fontWeight: 'var(--weight-medium)', color: 'var(--ink)' }}>{row.name}</span>
                </span>
              </td>
              <td style={{ padding: 'var(--s3) var(--s4)' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--s2)' }}>
                  <span
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: 'var(--r-sm)',
                      background: 'var(--bg-raised)',
                      border: '1px solid var(--stroke)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '10px',
                      fontWeight: 'var(--weight-medium)',
                      color: 'var(--secondary)',
                      flexShrink: 0,
                    }}
                    aria-hidden
                  >
                    {row.provider.charAt(0)}
                  </span>
                  <span style={{ color: 'var(--secondary)' }}>{row.provider}</span>
                </span>
              </td>
              <td style={{ padding: 'var(--s3) var(--s4)' }}>
                <ScoreCell value={row.scores.mmlu} />
              </td>
              <td style={{ padding: 'var(--s3) var(--s4)' }}>
                <ScoreCell value={row.scores.humanEval} />
              </td>
              <td style={{ padding: 'var(--s3) var(--s4)' }}>
                <ScoreCell value={row.scores.math} />
              </td>
              <td style={{ padding: 'var(--s3) var(--s4)' }}>
                <ScoreCell value={row.scores.gpqa} />
              </td>
              <td style={{ padding: 'var(--s3) var(--s4)' }}>
                <EloCell value={row.scores.arenaElo} />
              </td>
              <td style={{ padding: 'var(--s3) var(--s4)', fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--secondary)' }}>
                {row.price != null ? `$${row.price.toFixed(2)}` : '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <style>{`
        @media (max-width: 719px) {
          .benchmark-leaderboard-table thead tr th:first-child,
          .benchmark-leaderboard-table thead tr th:nth-child(2) {
            position: sticky;
            background: var(--table-header-bg);
            z-index: 2;
          }
          .benchmark-leaderboard-table thead tr th:first-child { left: 0; }
          .benchmark-leaderboard-table thead tr th:nth-child(2) { left: 52px; box-shadow: 2px 0 4px rgba(0,0,0,0.04); }
          .benchmark-leaderboard-table tbody tr td:first-child,
          .benchmark-leaderboard-table tbody tr td:nth-child(2) {
            position: sticky;
            background: var(--bg);
            z-index: 1;
          }
          .benchmark-leaderboard-table tbody tr td:first-child { left: 0; }
          .benchmark-leaderboard-table tbody tr td:nth-child(2) { left: 52px; box-shadow: 2px 0 4px rgba(0,0,0,0.04); }
          .benchmark-leaderboard-table tbody tr:hover td:first-child,
          .benchmark-leaderboard-table tbody tr:hover td:nth-child(2) {
            background: var(--table-row-hover);
          }
        }
      `}</style>
    </div>
  );
}
