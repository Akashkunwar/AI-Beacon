import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const GLOSSARY = [
  {
    id: 'mmlu',
    name: 'MMLU',
    oneLiner: 'Knowledge across 57 subjects.',
    full: 'Massive Multitask Language Understanding: 15,908 multiple-choice questions across STEM, humanities, and professional topics. Zero-shot or few-shot. Human expert baseline ~89.8%, random ~34.5%.',
    format: '15,908 multiple-choice questions',
    baseline: '~89.8% expert, ~34.5% random',
    caveat: 'Scores depend on prompting and subject mix, and public test questions may appear in training data.',
  },
  {
    id: 'humanEval',
    name: 'HumanEval',
    oneLiner: 'Python code generation from docstrings.',
    full: 'OpenAI’s benchmark for functional correctness of Python code: model reads a docstring and signature, writes code that passes hidden unit tests. Measures comprehension, algorithms, and implementation. Pass@1 and pass@k metrics.',
    format: '164 problems, pass@1',
    baseline: 'N/A',
    caveat: 'Passing the supplied tests does not prove the code is correct for every valid input; pass@k also depends on the sampling budget.',
  },
  {
    id: 'math',
    name: 'MATH',
    oneLiner: 'Competition math (AMC, AIME level).',
    full: '12,500 problems from AMC, AIME, and similar competitions. Five difficulty levels. Tests step-by-step mathematical reasoning. College students score ~40% on average.',
    format: '12,500 problems, 5 difficulty levels',
    baseline: '~40% (college students)',
    caveat: 'Scoring can be sensitive to answer extraction, tool use, and whether the model is allowed extra reasoning tokens.',
  },
  {
    id: 'gpqa',
    name: 'GPQA',
    oneLiner: 'Graduate-level science reasoning.',
    full: '448 multiple-choice questions written and verified by PhD holders. Designed to be hard for non-experts and to reduce contamination. Domain experts reach ~65%.',
    format: '448 questions, verified by PhDs',
    baseline: '~65% domain experts',
    caveat: 'Published results may use different subsets, such as GPQA Diamond, so the dataset variant must match.',
  },
  {
    id: 'gsm8k',
    name: 'GSM8K',
    oneLiner: 'Multi-step arithmetic word problems.',
    full: 'Grade School Math 8K: roughly 8,500 grade-school word problems that require multi-step arithmetic reasoning. Models are usually measured by exact-answer accuracy.',
    format: '8,500 problems',
    baseline: '~97% trained annotators',
    caveat: 'A high score reflects this particular word-problem format, not all mathematical reasoning.',
  },
  {
    id: 'arena',
    name: 'Arena rating',
    oneLiner: 'Human preference in blind A/B tests.',
    full: 'Chatbot Arena uses crowdsourced, blind pairwise comparisons. Users choose the better response or a tie, and statistical ratings aggregate those preferences. It complements fixed exam-style benchmarks.',
    format: 'Crowdsourced comparisons',
    baseline: 'N/A',
    caveat: 'Ratings move over time and can reflect response style, prompt mix, voter population, and sampling uncertainty.',
  },
];

export function BenchmarkGlossary() {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--s3)',
      }}
    >
      {GLOSSARY.map((item) => {
        const isOpen = openId === item.id;
        return (
          <div
            key={item.id}
            style={{
              background: 'var(--bg-panel)',
              border: '1px solid var(--stroke)',
              borderRadius: 'var(--r-md)',
              overflow: 'hidden',
              boxShadow: 'var(--shadow-soft)',
            }}
          >
            <button
              type="button"
              onClick={() => setOpenId(isOpen ? null : item.id)}
              style={{
                width: '100%',
                padding: 'var(--s4) var(--s5)',
                textAlign: 'left',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'var(--font-sans)',
                fontSize: 'var(--text-sm)',
                color: 'var(--ink)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 'var(--s2)',
              }}
              aria-expanded={isOpen}
              aria-controls={`glossary-${item.id}`}
              id={`glossary-btn-${item.id}`}
            >
              <span style={{ fontWeight: 'var(--weight-medium)' }}>{item.name}</span>
              <span style={{ color: 'var(--muted)', fontWeight: 'var(--weight-light)', flex: '1 1 220px' }}>
                {item.oneLiner}
              </span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>
                {isOpen ? '−' : '+'}
              </span>
            </button>
            <AnimatePresence>
              {isOpen && (
                <motion.div
                  id={`glossary-${item.id}`}
                  role="region"
                  aria-labelledby={`glossary-btn-${item.id}`}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.22, ease: [0.2, 0, 0, 1] as [number, number, number, number] }}
                  style={{ overflow: 'hidden' }}
                >
                  <div
                    style={{
                      padding: '0 var(--s5) var(--s5)',
                      borderTop: '1px solid var(--stroke)',
                      paddingTop: 'var(--s4)',
                    }}
                  >
                    <p
                      style={{
                        margin: 0,
                        fontSize: 'var(--text-sm)',
                        color: 'var(--secondary)',
                        lineHeight: 'var(--lead-body)',
                        fontWeight: 'var(--weight-light)',
                      }}
                    >
                      {item.full}
                    </p>
                    <div
                      style={{
                        marginTop: 'var(--s3)',
                        display: 'flex',
                        gap: 'var(--s5)',
                        flexWrap: 'wrap',
                        fontFamily: 'var(--font-mono)',
                        fontSize: 'var(--text-2xs)',
                        color: 'var(--muted)',
                      }}
                    >
                      <span>Format: {item.format}</span>
                      <span>Human baseline: {item.baseline}</span>
                    </div>
                    <p
                      style={{
                        margin: 'var(--s3) 0 0',
                        paddingTop: 'var(--s3)',
                        borderTop: '1px solid var(--stroke)',
                        color: 'var(--muted)',
                        fontSize: 'var(--text-xs)',
                        lineHeight: 'var(--lead-body)',
                      }}
                    >
                      <strong style={{ color: 'var(--secondary)' }}>Watch for:</strong> {item.caveat}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
