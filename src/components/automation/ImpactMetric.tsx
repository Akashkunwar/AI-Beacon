import { motion } from 'framer-motion';

export interface ImpactMetricProps {
  label: string;
  value: string | number;
  sublabel?: string;
  index?: number;
}

function formatNumber(n: number): string {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(0)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

export function ImpactMetric({ label, value, sublabel, index = 0 }: ImpactMetricProps) {
  const displayValue = typeof value === 'number' ? formatNumber(value) : value;

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.05, ease: [0.2, 0, 0, 1] }}
      style={{
        padding: 'var(--s5)',
        background: 'var(--bg-panel)',
        border: '1px solid var(--stroke)',
        borderRadius: 'var(--r-lg)',
        boxShadow: 'var(--shadow-soft)',
      }}
      aria-label={`${label}: ${displayValue}${sublabel ? ` ${sublabel}` : ''}`}
    >
      <div
        style={{
          fontSize: 'var(--text-2xs)',
          fontFamily: 'var(--font-mono)',
          color: 'var(--muted)',
          textTransform: 'uppercase',
          letterSpacing: 'var(--tracking-wider)',
          marginBottom: 'var(--s2)',
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 'var(--text-2xl)',
          fontWeight: 'var(--weight-semibold)',
          color: 'var(--ink)',
          lineHeight: 'var(--lead-tight)',
        }}
      >
        {displayValue}
      </div>
      {sublabel && (
        <div
          style={{
            fontSize: 'var(--text-xs)',
            color: 'var(--secondary)',
            marginTop: 'var(--s1)',
          }}
        >
          {sublabel}
        </div>
      )}
    </motion.div>
  );
}
