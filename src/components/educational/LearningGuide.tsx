interface LearningGuideItem {
  label: string;
  text: string;
}

interface LearningGuideProps {
  title: string;
  intro: string;
  items: LearningGuideItem[];
  note?: string;
  ariaLabel?: string;
}

export function LearningGuide({ title, intro, items, note, ariaLabel }: LearningGuideProps) {
  return (
    <section
      aria-label={ariaLabel ?? title}
      style={{
        padding: 'var(--s5)',
        background: 'var(--bg-panel)',
        border: '1px solid var(--stroke)',
        borderRadius: 'var(--r-lg)',
        boxShadow: 'var(--shadow-soft)',
      }}
    >
      <div style={{ maxWidth: '72ch', marginBottom: 'var(--s4)' }}>
        <h2
          style={{
            margin: '0 0 var(--s2)',
            color: 'var(--ink)',
            fontSize: 'var(--text-lg)',
            fontWeight: 'var(--weight-semibold)',
            letterSpacing: 'var(--tracking-snug)',
          }}
        >
          {title}
        </h2>
        <p
          style={{
            margin: 0,
            color: 'var(--secondary)',
            fontSize: 'var(--text-sm)',
            lineHeight: 'var(--lead-body)',
            fontWeight: 'var(--weight-light)',
          }}
        >
          {intro}
        </p>
      </div>

      <div
        className="learning-guide-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
          gap: 'var(--s3)',
        }}
      >
        {items.map((item) => (
          <div
            key={item.label}
            style={{
              padding: 'var(--s3)',
              background: 'var(--bg)',
              border: '1px solid var(--stroke)',
              borderRadius: 'var(--r-md)',
            }}
          >
            <p
              style={{
                margin: '0 0 var(--s1)',
                color: 'var(--muted)',
                fontFamily: 'var(--font-mono)',
                fontSize: 'var(--text-2xs)',
                letterSpacing: 'var(--tracking-wider)',
                textTransform: 'uppercase',
              }}
            >
              {item.label}
            </p>
            <p
              style={{
                margin: 0,
                color: 'var(--secondary)',
                fontSize: 'var(--text-xs)',
                lineHeight: 'var(--lead-body)',
              }}
            >
              {item.text}
            </p>
          </div>
        ))}
      </div>

      {note && (
        <p
          style={{
            margin: 'var(--s4) 0 0',
            paddingTop: 'var(--s3)',
            borderTop: '1px solid var(--stroke)',
            color: 'var(--muted)',
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--text-2xs)',
            lineHeight: 'var(--lead-body)',
          }}
        >
          {note}
        </p>
      )}
    </section>
  );
}
