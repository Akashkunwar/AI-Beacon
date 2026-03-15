import { FIRST_YEAR, LAST_YEAR } from '@/data/automationData';

const TIMELINE_TICKS: { year: number; label: string; isProjection: boolean }[] = [
  { year: 2022, label: 'ChatGPT launch', isProjection: false },
  { year: 2023, label: 'GPT-4, Claude', isProjection: false },
  { year: 2024, label: 'Sora, Gemini', isProjection: false },
  { year: 2025, label: 'Agentic workflows', isProjection: false },
  { year: 2026, label: 'Today', isProjection: false },
  { year: 2027, label: 'Projected', isProjection: true },
  { year: 2028, label: 'Projected', isProjection: true },
  { year: 2029, label: 'Projected', isProjection: true },
  { year: 2030, label: 'Projected', isProjection: true },
];

export interface YearSliderProps {
  value: number;
  onChange: (year: number) => void;
  phase: string;
  isProjection: boolean;
  min?: number;
  max?: number;
  step?: number;
}

export function YearSlider({
  value,
  onChange,
  phase,
  isProjection,
  min = FIRST_YEAR,
  max = LAST_YEAR,
  step = 0.1,
}: YearSliderProps) {
  return (
    <section
      style={{
        padding: 'var(--s6)',
        background: 'var(--bg-panel)',
        border: '1px solid var(--stroke)',
        borderRadius: 'var(--r-md)',
        boxShadow: 'var(--shadow-soft)',
        position: 'relative',
      }}
      aria-label="Year selector for AI impact timeline"
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          marginBottom: 'var(--s5)',
          flexWrap: 'wrap',
          gap: 'var(--s3)',
        }}
      >
        <div>
          <span
            style={{
              fontSize: 'var(--text-2xs)',
              fontFamily: 'var(--font-mono)',
              color: 'var(--muted)',
              textTransform: 'uppercase',
              letterSpacing: 'var(--tracking-wider)',
            }}
          >
            Temporal axis
          </span>
          <div
            style={{
              fontSize: 'var(--text-xl)',
              fontWeight: 'var(--weight-semibold)',
              color: 'var(--ink)',
              fontFamily: 'var(--font-mono)',
              marginTop: 'var(--s1)',
            }}
          >
            {value.toFixed(1)}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <span
            style={{
              fontSize: 'var(--text-2xs)',
              fontFamily: 'var(--font-mono)',
              color: 'var(--muted)',
              textTransform: 'uppercase',
              letterSpacing: 'var(--tracking-wider)',
            }}
          >
            Phase
          </span>
          <div
            style={{
              fontSize: 'var(--text-lg)',
              fontWeight: 'var(--weight-semibold)',
              color: 'var(--ink)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginTop: 'var(--s1)',
            }}
          >
            {phase}
            {isProjection && (
              <span
                style={{
                  marginLeft: 'var(--s2)',
                  fontSize: 'var(--text-xs)',
                  fontWeight: 'var(--weight-regular)',
                  color: 'var(--muted)',
                  textTransform: 'none',
                }}
              >
                (projected)
              </span>
            )}
          </div>
        </div>
      </div>

      <div style={{ position: 'relative', paddingTop: 'var(--s2)', paddingBottom: 'var(--s6)' }}>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          aria-label="Select year from 2022 to 2030"
          style={{
            position: 'relative',
            zIndex: 1,
            width: '100%',
            accentColor: 'var(--ink)',
            cursor: 'ew-resize',
            height: 6,
            margin: 0,
            background: 'transparent',
          }}
          className="automation-year-slider"
        />
        <div
          role="list"
          aria-label="Timeline: key AI milestones by year"
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${TIMELINE_TICKS.length}, 1fr)`,
            gap: 'var(--s2)',
            marginTop: 'var(--s5)',
            paddingTop: 'var(--s3)',
            borderTop: '1px solid var(--stroke)',
          }}
        >
          {TIMELINE_TICKS.map(({ year, label, isProjection }) => (
            <div
              key={year}
              role="listitem"
              style={{
                textAlign: 'center',
                minWidth: 0,
              }}
            >
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 'var(--text-sm)',
                  fontWeight: 'var(--weight-semibold)',
                  color: isProjection ? 'var(--muted)' : 'var(--ink)',
                }}
              >
                {year}
              </div>
              <div
                style={{
                  fontSize: 'var(--text-2xs)',
                  color: 'var(--muted)',
                  marginTop: 'var(--s1)',
                  lineHeight: 1.3,
                }}
              >
                {label}
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .automation-year-slider {
          -webkit-appearance: none;
          appearance: none;
          background: transparent;
        }
        .automation-year-slider::-webkit-slider-runnable-track {
          width: 100%;
          height: 6px;
          cursor: pointer;
          background: var(--stroke);
          border-radius: 3px;
        }
        .automation-year-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          height: 18px;
          width: 18px;
          border-radius: 50%;
          background: var(--ink);
          cursor: pointer;
          border: 2px solid var(--bg);
          box-shadow: var(--shadow-soft);
          margin-top: -6px;
        }
        .automation-year-slider::-moz-range-track {
          width: 100%;
          height: 6px;
          cursor: pointer;
          background: var(--stroke);
          border-radius: 3px;
        }
        .automation-year-slider::-moz-range-thumb {
          height: 18px;
          width: 18px;
          border-radius: 50%;
          background: var(--ink);
          cursor: pointer;
          border: 2px solid var(--bg);
          box-shadow: var(--shadow-soft);
        }
        .automation-year-slider:focus {
          outline: none;
        }
        .automation-year-slider:focus-visible::-webkit-slider-thumb {
          box-shadow: 0 0 0 2px var(--bg), 0 0 0 4px var(--stroke-dark);
        }
        .automation-year-slider:focus-visible::-moz-range-thumb {
          box-shadow: 0 0 0 2px var(--bg), 0 0 0 4px var(--stroke-dark);
        }
      `}</style>
    </section>
  );
}
