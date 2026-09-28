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

/** "How to read this page" card: a short intro plus 3–4 key ideas. */
export function LearningGuide({ title, intro, items, note, ariaLabel }: LearningGuideProps) {
  return (
    <section aria-label={ariaLabel ?? title} className="card lg-card">
      <div className="lg-head">
        <h2 className="section-title">{title}</h2>
        <p className="section-desc">{intro}</p>
      </div>
      <div className="lg-grid">
        {items.map((item, i) => (
          <div key={item.label} className="lg-item">
            <span className="lg-num">{i + 1}</span>
            <p className="lg-label">{item.label}</p>
            <p className="lg-text">{item.text}</p>
          </div>
        ))}
      </div>
      {note && <p className="lg-note">{note}</p>}
      <style>{`
        .lg-card { padding: var(--s5); }
        .lg-head { max-width: 72ch; margin-bottom: var(--s4); display: flex; flex-direction: column; gap: var(--s2); }
        .lg-head .section-title { font-size: var(--text-lg); }
        .lg-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: var(--s3); }
        .lg-item { position: relative; padding: var(--s4); background: var(--bg-sunken); border: 1px solid var(--stroke); border-radius: var(--r-md); }
        .lg-num { position: absolute; top: var(--s3); right: var(--s3); font-family: var(--font-mono); font-size: var(--text-2xs); color: var(--muted); }
        .lg-label { font-weight: var(--weight-semibold); color: var(--ink); font-size: var(--text-sm); margin-bottom: var(--s1); padding-right: var(--s4); }
        .lg-text { color: var(--secondary); font-size: var(--text-xs); line-height: var(--lead-body); }
        .lg-note { margin-top: var(--s4); padding-top: var(--s3); border-top: 1px solid var(--stroke); color: var(--muted); font-size: var(--text-xs); }
      `}</style>
    </section>
  );
}
