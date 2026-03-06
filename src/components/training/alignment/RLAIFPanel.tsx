import { motion, useReducedMotion } from 'framer-motion';

export function RLAIFPanel() {
    const shouldReduceMotion = useReducedMotion();

    return (
        <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: [0.2, 0, 0, 1] }}
            style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s6)' }}
        >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s4)' }}>
                <h3 style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xl)', color: 'var(--ink)', fontWeight: 'var(--weight-medium)', margin: 0 }}>
                    RLAIF (RL from AI Feedback)
                </h3>
                <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-base)', color: 'var(--secondary)', margin: 0 }}>
                    As models become smarter than average annotators, human feedback becomes a bottleneck. RLAIF uses a powerful frontier model (like GPT-4 or Claude 3.5 Opus) as an "AI Judge" to provide preference labels for a smaller model.
                </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--s5)' }}>
                {/* Human Annotator */}
                <div style={{ background: 'var(--bg-panel)', border: '1px solid var(--stroke)', borderRadius: 'var(--r-lg)', padding: 'var(--s5)', display: 'flex', flexDirection: 'column', gap: 'var(--s4)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--s3)' }}>
                        <div style={{ width: '40px', height: '40px', background: 'var(--bg)', border: '1px solid var(--stroke-dark)', borderRadius: 'var(--r-pill)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-mono)', fontSize: 'var(--text-lg)', color: 'var(--ink)' }}>
                            🧍
                        </div>
                        <h4 style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-md)', color: 'var(--ink)', margin: 0, fontWeight: 'var(--weight-medium)' }}>Human Annotator</h4>
                    </div>
                    <ul style={{ paddingLeft: 'var(--s4)', margin: 0, fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)', color: 'var(--secondary)', display: 'flex', flexDirection: 'column', gap: 'var(--s2)' }}>
                        <li>Slow (minutes per prompt)</li>
                        <li>High cost ($10-$50+ per hour)</li>
                        <li>Inconsistent (subjective biases, fatigue)</li>
                        <li>Struggles with advanced coding/math</li>
                    </ul>
                </div>

                {/* AI Judge */}
                <div style={{ background: 'var(--bg)', border: '2px solid var(--ink)', borderRadius: 'var(--r-lg)', padding: 'var(--s5)', display: 'flex', flexDirection: 'column', gap: 'var(--s4)', boxShadow: 'var(--shadow-soft)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--s3)' }}>
                        <div style={{ width: '40px', height: '40px', background: 'var(--bg-inverse)', borderRadius: 'var(--r-pill)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-mono)', fontSize: 'var(--text-lg)', color: 'var(--text-inverse)' }}>
                            🤖
                        </div>
                        <h4 style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-md)', color: 'var(--ink)', margin: 0, fontWeight: 'var(--weight-medium)' }}>LLM Judge (Frontier Model)</h4>
                    </div>
                    <ul style={{ paddingLeft: 'var(--s4)', margin: 0, fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)', color: 'var(--ink)', display: 'flex', flexDirection: 'column', gap: 'var(--s2)' }}>
                        <li>Near-instant (milliseconds per prompt)</li>
                        <li>Scalable (generate millions of pairings)</li>
                        <li>Consistent (follows rules exactly)</li>
                        <li>Can leverage chain-of-thought to evaluate</li>
                    </ul>
                </div>
            </div>

            {/* Tradeoff Table */}
            <div style={{ background: 'var(--bg)', border: '1px solid var(--stroke)', borderRadius: 'var(--r-lg)', padding: 'var(--s5)' }}>
                <h4 style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-md)', color: 'var(--ink)', margin: '0 0 var(--s3) 0', fontWeight: 'var(--weight-semibold)' }}>
                    Tradeoff Analysis
                </h4>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)' }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid var(--stroke-dark)', color: 'var(--muted)', fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)' }}>
                                <th style={{ padding: 'var(--s2)' }}>Metric</th>
                                <th style={{ padding: 'var(--s2)' }}>RLHF (Human)</th>
                                <th style={{ padding: 'var(--s2)' }}>RLAIF (AI)</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr style={{ borderBottom: '1px solid var(--stroke)' }}>
                                <td style={{ padding: 'var(--s3) var(--s2)', fontFamily: 'var(--font-mono)', color: 'var(--ink)' }}>Cost per 1M labels</td>
                                <td style={{ padding: 'var(--s3) var(--s2)', color: 'var(--secondary)' }}>~$500,000+</td>
                                <td style={{ padding: 'var(--s3) var(--s2)', color: 'var(--ink)', fontWeight: 'var(--weight-medium)' }}>~$2,000 (API costs)</td>
                            </tr>
                            <tr style={{ borderBottom: '1px solid var(--stroke)' }}>
                                <td style={{ padding: 'var(--s3) var(--s2)', fontFamily: 'var(--font-mono)', color: 'var(--ink)' }}>Time to scale</td>
                                <td style={{ padding: 'var(--s3) var(--s2)', color: 'var(--secondary)' }}>Months (hiring, managing)</td>
                                <td style={{ padding: 'var(--s3) var(--s2)', color: 'var(--ink)', fontWeight: 'var(--weight-medium)' }}>Hours (batch processing)</td>
                            </tr>
                            <tr style={{ borderBottom: '1px solid var(--stroke)' }}>
                                <td style={{ padding: 'var(--s3) var(--s2)', fontFamily: 'var(--font-mono)', color: 'var(--ink)' }}>Quality Ceiling</td>
                                <td style={{ padding: 'var(--s3) var(--s2)', color: 'var(--ink)', fontWeight: 'var(--weight-medium)' }}>Ground truth / Expert level</td>
                                <td style={{ padding: 'var(--s3) var(--s2)', color: 'var(--secondary)' }}>Capped by Judge model</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <div style={{
                padding: 'var(--s3) var(--s4)', borderLeft: '3px solid var(--ink)',
                background: 'var(--bg-panel)', fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)', color: 'var(--secondary)'
            }}>
                <strong>Distillation Pipeline:</strong> By having LLaMA-3-8B prefer responses chosen by GPT-4, you are effectively distilling GPT-4's reasoning capabilities into the smaller, open-source model.
            </div>

        </motion.div>
    );
}
