import { motion, useReducedMotion } from 'framer-motion';

export function DPOPanel() {
    const shouldReduceMotion = useReducedMotion();

    const variants = [
        { name: 'DPO', diff: 'Original Direct Preference Optimization. Parameterizes reward model implicitly via policy.', paired: 'Yes' },
        { name: 'IPO', diff: 'Identity Preference Optimization. Adds regularizer to prevent overfitting to preferences.', paired: 'Yes' },
        { name: 'KTO', diff: 'Kahneman-Tversky Optimization. Uses un-paired positive/negative examples, inspired by prospect theory.', paired: 'No' },
        { name: 'ORPO', diff: 'Odds Ratio Preference Optimization. Combines SFT and preference alignment into a single step.', paired: 'Yes' },
        { name: 'SimPO', diff: 'Simple Preference Optimization. Uses average log prob instead of sum, drops reference model.', paired: 'Yes' }
    ];

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
                    Direct Preference Optimization (DPO)
                </h3>
                <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-base)', color: 'var(--secondary)', margin: 0 }}>
                    DPO bypasses the need to train a separate reward model and run complex PPO reinforcement learning. It mathematically maps the reward function directly to the language model policy, allowing optimization with a simple classification loss.
                </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--s5)' }}>
                {/* RLHF Pipeline */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s4)', background: 'var(--bg-panel)', padding: 'var(--s5)', borderRadius: 'var(--r-lg)', border: '1px solid var(--stroke)', opacity: 0.6 }}>
                    <h4 style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 'var(--tracking-wider)', margin: 0 }}>
                        Traditional RLHF
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s2)' }}>
                        <div style={{ padding: 'var(--s3)', background: 'var(--bg)', border: '1px solid var(--stroke-dark)', borderRadius: 'var(--r-sm)', fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)', color: 'var(--ink)', textDecoration: 'line-through' }}>
                            1. Supervised Fine-Tuning (SFT Model)
                        </div>
                        <div style={{ textAlign: 'center', color: 'var(--muted)' }}>↓</div>
                        <div style={{ padding: 'var(--s3)', background: 'var(--bg)', border: '1px solid var(--stroke-dark)', borderRadius: 'var(--r-sm)', fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)', color: 'var(--ink)', textDecoration: 'line-through' }}>
                            2. Train Reward Model (RM)
                        </div>
                        <div style={{ textAlign: 'center', color: 'var(--muted)' }}>↓</div>
                        <div style={{ padding: 'var(--s3)', background: 'var(--bg)', border: '1px solid var(--stroke-dark)', borderRadius: 'var(--r-sm)', fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)', color: 'var(--ink)', textDecoration: 'line-through' }}>
                            3. Reinforcement Learning (PPO) loop
                        </div>
                    </div>
                </div>

                {/* DPO Pipeline */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s4)', background: 'var(--bg-panel)', padding: 'var(--s5)', borderRadius: 'var(--r-lg)', border: '1px solid var(--ink)', position: 'relative' }}>
                    <div style={{ position: 'absolute', top: '-10px', right: 'var(--s4)', background: 'var(--bg-inverse)', color: 'var(--text-inverse)', fontFamily: 'var(--font-mono)', fontSize: 'var(--text-2xs)', padding: '2px 8px', borderRadius: 'var(--r-pill)', textTransform: 'uppercase', letterSpacing: 'var(--tracking-wider)' }}>
                        Modern Standard
                    </div>
                    <h4 style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)', color: 'var(--ink)', textTransform: 'uppercase', letterSpacing: 'var(--tracking-wider)', margin: 0 }}>
                        DPO Shortcut
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s2)' }}>
                        <div style={{ padding: 'var(--s3)', background: 'var(--bg)', border: '1px solid var(--stroke-dark)', borderRadius: 'var(--r-sm)', fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)', color: 'var(--ink)' }}>
                            1. Supervised Fine-Tuning (SFT Model)
                        </div>
                        <div style={{ textAlign: 'center', color: 'var(--ink)' }}>↓</div>
                        <div style={{ padding: 'var(--s4)', background: 'var(--bg)', border: '2px solid var(--ink)', borderRadius: 'var(--r-sm)', fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)', color: 'var(--ink)', display: 'flex', flexDirection: 'column', gap: 'var(--s2)', boxShadow: 'var(--shadow-soft)' }}>
                            <div style={{ fontWeight: 'var(--weight-medium)', textAlign: 'center' }}>DPO Direct Optimization</div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', marginTop: 'var(--s2)' }}>
                                <span style={{ color: 'var(--viz-2)' }}>P(chosen) ↑</span>
                                <span style={{ color: 'var(--viz-neg)' }}>P(rejected) ↓</span>
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            {/* Sub-variants */}
            <div style={{ background: 'var(--bg)', border: '1px solid var(--stroke)', borderRadius: 'var(--r-lg)', padding: 'var(--s5)' }}>
                <h4 style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-md)', color: 'var(--ink)', margin: '0 0 var(--s3) 0', fontWeight: 'var(--weight-semibold)' }}>
                    DPO Variants
                </h4>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)' }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid var(--stroke-dark)', color: 'var(--muted)', fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)' }}>
                                <th style={{ padding: 'var(--s2)' }}>Method</th>
                                <th style={{ padding: 'var(--s2)' }}>Key Difference</th>
                                <th style={{ padding: 'var(--s2)' }}>Needs Paired Data?</th>
                            </tr>
                        </thead>
                        <tbody>
                            {variants.map((v, i) => (
                                <tr key={i} style={{ borderBottom: '1px solid var(--stroke)' }}>
                                    <td style={{ padding: 'var(--s3) var(--s2)', fontFamily: 'var(--font-mono)', color: 'var(--ink)', fontWeight: 'var(--weight-medium)' }}>{v.name}</td>
                                    <td style={{ padding: 'var(--s3) var(--s2)', color: 'var(--secondary)' }}>{v.diff}</td>
                                    <td style={{ padding: 'var(--s3) var(--s2)', fontFamily: 'var(--font-mono)', color: v.paired === 'No' ? 'var(--ink)' : 'var(--muted)' }}>
                                        {v.paired}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            <div style={{
                padding: 'var(--s3) var(--s4)', borderLeft: '3px solid var(--ink)',
                background: 'var(--bg-panel)', fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)', color: 'var(--secondary)'
            }}>
                <strong>Why it matters:</strong> DPO avoids the mode-collapse and instability of PPO. It's much simpler to code, faster to train, and requires significantly less memory.
            </div>
        </motion.div>
    );
}
