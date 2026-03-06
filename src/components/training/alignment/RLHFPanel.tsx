import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

export function RLHFPanel() {
    const shouldReduceMotion = useReducedMotion();
    const [problemsOpen, setProblemsOpen] = useState(false);

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
                    Reinforcement Learning from Human Feedback
                </h3>
                <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-base)', color: 'var(--secondary)', margin: 0 }}>
                    The pioneering technique (used for ChatGPT). It uses human preferences as a reward signal to fine-tune the model policy using Proximal Policy Optimization (PPO).
                </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s4)' }}>
                {/* Step 1 */}
                <div style={{ background: 'var(--bg-panel)', border: '1px solid var(--stroke)', borderRadius: 'var(--r-lg)', padding: 'var(--s5)', display: 'flex', flexDirection: 'column', gap: 'var(--s3)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--s3)' }}>
                        <div style={{ width: '28px', height: '28px', background: 'var(--bg-inverse)', color: 'var(--text-inverse)', borderRadius: 'var(--r-pill)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)' }}>1</div>
                        <h4 style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-md)', color: 'var(--ink)', margin: 0, fontWeight: 'var(--weight-medium)' }}>Human Annotators Rank Responses</h4>
                    </div>
                    <div style={{ display: 'flex', gap: 'var(--s4)', flexWrap: 'wrap', marginTop: 'var(--s2)' }}>
                        <div style={{ flex: 1, minWidth: '200px', padding: 'var(--s3)', background: 'var(--bg)', border: '1px dashed var(--stroke-dark)', borderRadius: 'var(--r-md)', fontSize: 'var(--text-sm)' }}>
                            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--muted)', marginBottom: 'var(--s2)' }}>PROMPT: Explain black holes</div>
                            <div style={{ fontFamily: 'var(--font-sans)', color: 'var(--ink)' }}>A black hole is a region of spacetime...</div>
                            <div style={{ marginTop: 'var(--s3)', padding: 'var(--s1) var(--s2)', background: 'var(--bg-raised)', color: 'var(--viz-2)', fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', borderRadius: 'var(--r-sm)', display: 'inline-block' }}>Rank 1 (Chosen)</div>
                        </div>
                        <div style={{ flex: 1, minWidth: '200px', padding: 'var(--s3)', background: 'var(--bg)', border: '1px dashed var(--stroke-dark)', borderRadius: 'var(--r-md)', fontSize: 'var(--text-sm)', opacity: 0.7 }}>
                            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--muted)', marginBottom: 'var(--s2)' }}>PROMPT: Explain black holes</div>
                            <div style={{ fontFamily: 'var(--font-sans)', color: 'var(--ink)' }}>Well basically it's like a big vacuum...</div>
                            <div style={{ marginTop: 'var(--s3)', padding: 'var(--s1) var(--s2)', background: 'var(--bg-raised)', color: 'var(--viz-neg)', fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', borderRadius: 'var(--r-sm)', display: 'inline-block' }}>Rank 2 (Rejected)</div>
                        </div>
                    </div>
                </div>

                <div style={{ textAlign: 'center', color: 'var(--stroke-dark)' }}>↓</div>

                {/* Step 2 */}
                <div style={{ background: 'var(--bg-panel)', border: '1px solid var(--stroke)', borderRadius: 'var(--r-lg)', padding: 'var(--s5)', display: 'flex', flexDirection: 'column', gap: 'var(--s3)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--s3)' }}>
                        <div style={{ width: '28px', height: '28px', background: 'var(--bg-inverse)', color: 'var(--text-inverse)', borderRadius: 'var(--r-pill)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)' }}>2</div>
                        <h4 style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-md)', color: 'var(--ink)', margin: 0, fontWeight: 'var(--weight-medium)' }}>Train Reward Model</h4>
                    </div>
                    <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)', color: 'var(--secondary)', margin: 0 }}>
                        A second LLM (the reward model) is trained on those rankings. Its job is to ingest a (prompt, response) pair and output a scalar scalar value representing how "good" it is, imitating the human rankers.
                    </p>
                </div>

                <div style={{ textAlign: 'center', color: 'var(--stroke-dark)' }}>↓</div>

                {/* Step 3 */}
                <div style={{ background: 'var(--bg-panel)', border: '1px solid var(--stroke)', borderRadius: 'var(--r-lg)', padding: 'var(--s5)', display: 'flex', flexDirection: 'column', gap: 'var(--s3)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--s3)' }}>
                        <div style={{ width: '28px', height: '28px', background: 'var(--bg-inverse)', color: 'var(--text-inverse)', borderRadius: 'var(--r-pill)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)' }}>3</div>
                        <h4 style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-md)', color: 'var(--ink)', margin: 0, fontWeight: 'var(--weight-medium)' }}>PPO Loop (Proximal Policy Optimization)</h4>
                    </div>
                    <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)', color: 'var(--secondary)', margin: 0 }}>
                        The original SFT model generates responses. The reward model grades them. PPO updates the SFT model's weights to maximize the reward. A KL penalty prevents the model from generating gibberish that just "hacks" the reward model.
                    </p>
                    <div style={{ marginTop: 'var(--s3)', padding: 'var(--s3)', background: 'var(--bg)', borderRadius: 'var(--r-md)', border: '1px solid var(--stroke)', display: 'inline-block', fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)', color: 'var(--ink)', textAlign: 'center' }}>
                        Reward = RM(response) - β * KL(policy, reference)
                    </div>
                </div>
            </div>

            {/* Problems Collapsible */}
            <div style={{ border: '1px solid var(--stroke)', borderRadius: 'var(--r-md)', overflow: 'hidden' }}>
                <button
                    onClick={() => setProblemsOpen(!problemsOpen)}
                    style={{
                        width: '100%', padding: 'var(--s4)', background: 'var(--bg-panel)', border: 'none', borderBottom: problemsOpen ? '1px solid var(--stroke)' : 'none',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer',
                        fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-semibold)', color: 'var(--ink)',
                        transition: 'background var(--dur-fast) var(--ease-out)'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-raised)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'var(--bg-panel)'}
                >
                    Problems with RLHF
                    <span style={{ fontFamily: 'var(--font-mono)', transition: 'transform var(--dur-base) var(--ease-out)', transform: problemsOpen ? 'rotate(180deg)' : 'none' }}>
                        ▼
                    </span>
                </button>
                <motion.div
                    initial={false}
                    animate={{ height: problemsOpen ? 'auto' : 0, opacity: problemsOpen ? 1 : 0 }}
                    style={{ overflow: 'hidden', background: 'var(--bg)' }}
                >
                    <ul style={{ padding: 'var(--s4) var(--s4) var(--s4) var(--s6)', margin: 0, fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)', color: 'var(--secondary)', display: 'flex', flexDirection: 'column', gap: 'var(--s2)' }}>
                        <li><strong>Reward Hacking:</strong> The policy model finds a loophole to get high rewards without actually generating good text (e.g. outputting long, sycophantic text).</li>
                        <li><strong>Alignment Tax:</strong> RLHF can hurt performance on standard benchmarks or make the model refuse safe prompts (over-refusal).</li>
                        <li><strong>Complexity:</strong> Managing 4 models simultaneously (Policy, Reference, Reward, Value) requires massive VRAM and intricate orchestration.</li>
                        <li><strong>Mode Collapse:</strong> The model loses its original diversity and outputs very formulaic "AI sounding" text ("As an AI language model...").</li>
                    </ul>
                </motion.div>
            </div>
        </motion.div>
    );
}
