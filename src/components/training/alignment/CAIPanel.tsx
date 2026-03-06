import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

export function CAIPanel() {
    const shouldReduceMotion = useReducedMotion();
    const [step, setStep] = useState(0);

    const critiqueSteps = [
        {
            label: 'Initial Response',
            content: "To build a bomb, you'll need the following materials...",
            action: 'Model generates potentially harmful output.',
            actionStyle: 'var(--viz-neg)'
        },
        {
            label: 'Critique Request',
            content: "Critique the previous response based on the constitution: 'The AI should not help with illegal acts or violence.'",
            action: 'LLM prompts itself to evaluate output against constitution.',
            actionStyle: 'var(--ink)'
        },
        {
            label: 'Critique Generation',
            content: "The response was helpful but it violates the principle by providing instructions for a dangerous and illegal device.",
            action: 'LLM identifies the violation.',
            actionStyle: 'var(--ink)'
        },
        {
            label: 'Revision Request',
            content: "Please rewrite the response to remove the harmful instructions while remaining polite.",
            action: 'LLM is asked to fix the identified issue.',
            actionStyle: 'var(--ink)'
        },
        {
            label: 'Final Response',
            content: "I cannot provide instructions on how to build a bomb, as that is dangerous and illegal. I can, however, discuss the history of explosives or their use in mining.",
            action: 'Safe, aligned response replaces the initial generated text.',
            actionStyle: 'var(--viz-2)'
        }
    ];

    const nextStep = () => setStep(s => Math.min(s + 1, critiqueSteps.length - 1));
    const resetSteps = () => setStep(0);

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
                    Constitutional AI (Anthropic)
                </h3>
                <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-base)', color: 'var(--secondary)', margin: 0 }}>
                    Human feedback is slow and doesn't scale well. Constitutional AI replaces human annotators with an AI judge that grades outputs based on a written set of rules (a "constitution"). It trains the model to critique and revise its own responses before RLHF.
                </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 'var(--s6)' }}>
                {/* Visual phases */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--s4)' }}>
                    <div style={{ background: 'var(--bg-panel)', border: '1px solid var(--stroke)', borderRadius: 'var(--r-lg)', padding: 'var(--s5)' }}>
                        <h4 style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-md)', color: 'var(--ink)', marginBottom: 'var(--s2)', marginTop: 0 }}>Phase 1: SL-CAI</h4>
                        <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)', color: 'var(--secondary)', marginBottom: 'var(--s4)' }}>Supervised Learning phase. The model generates responses, critiques them against rules, and revises them. Best revisions become fine-tuning data.</p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s2)' }}>
                            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', padding: 'var(--s2)', background: 'var(--bg)', border: '1px solid var(--stroke-dark)', borderRadius: 'var(--r-sm)' }}>1. Output → Critique → Modify → SFT</div>
                        </div>
                    </div>

                    <div style={{ background: 'var(--bg-panel)', border: '1px solid var(--stroke)', borderRadius: 'var(--r-lg)', padding: 'var(--s5)' }}>
                        <h4 style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-md)', color: 'var(--ink)', marginBottom: 'var(--s2)', marginTop: 0 }}>Phase 2: RL-CAI</h4>
                        <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)', color: 'var(--secondary)', marginBottom: 'var(--s4)' }}>Reinforcement Learning phase. The SL-CAI model acts as an AI judge to rank pairs of responses based on constitution. Trains a preference model.</p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s2)' }}>
                            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', padding: 'var(--s2)', background: 'var(--bg)', border: '1px solid var(--stroke-dark)', borderRadius: 'var(--r-sm)' }}>2. Generate Pairs → AI Ranks Pairs → PPO</div>
                        </div>
                    </div>
                </div>

                {/* Excerpt */}
                <div style={{ background: 'var(--bg-panel)', border: '1px solid var(--stroke)', borderRadius: 'var(--r-lg)', padding: 'var(--s5)' }}>
                    <h4 style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 'var(--s4)', marginTop: 0, letterSpacing: 'var(--tracking-wider)' }}>
                        Constitution Excerpt
                    </h4>
                    <div style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 'var(--text-lg)', color: 'var(--ink)', borderLeft: '3px solid var(--stroke-dark)', paddingLeft: 'var(--s4)', lineHeight: 'var(--lead-loose)' }}>
                        "Please choose the response that is most helpful, honest, and harmless. Do not assist with illegal or dangerously unethical requests. Be objective and impartial."
                    </div>
                </div>

                {/* Interactive Demo */}
                <div style={{ background: 'var(--bg)', border: '1px solid var(--stroke)', borderRadius: 'var(--r-lg)', padding: 'var(--s5)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--s4)' }}>
                        <h4 style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-md)', color: 'var(--ink)', margin: 0, fontWeight: 'var(--weight-semibold)' }}>SL-CAI Critique Sequence</h4>
                        <div style={{ display: 'flex', gap: 'var(--s2)' }}>
                            <button
                                className="btn btn-secondary"
                                onClick={resetSteps}
                                disabled={step === 0}
                            >
                                Reset
                            </button>
                            <button
                                className="btn btn-primary"
                                onClick={nextStep}
                                disabled={step >= critiqueSteps.length - 1}
                            >
                                Walk through the critique →
                            </button>
                        </div>
                    </div>

                    <div style={{ position: 'relative', minHeight: '160px', paddingLeft: 'var(--s4)', borderLeft: '2px solid var(--stroke)' }}>
                        <div style={{
                            position: 'absolute', left: '-5px', top: '0', bottom: '0', width: '2px', background: 'var(--stroke)',
                            height: `${(step / (critiqueSteps.length - 1)) * 100}%`,
                            transition: 'height var(--dur-base) var(--ease-out)',
                            backgroundColor: 'var(--ink)'
                        }} />

                        {critiqueSteps.map((s, i) => (
                            <motion.div
                                key={i}
                                initial={shouldReduceMotion ? false : { opacity: 0, x: -10 }}
                                animate={{ opacity: i <= step ? 1 : 0.3, x: 0 }}
                                transition={{ duration: 0.2 }}
                                style={{ display: i <= step + 1 ? 'flex' : 'none', flexDirection: 'column', gap: 'var(--s1)', marginBottom: 'var(--s4)' }}
                            >
                                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--muted)', textTransform: 'uppercase' }}>{s.label}</div>
                                <div style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)', color: 'var(--ink)', padding: 'var(--s3)', background: 'var(--bg-panel)', borderRadius: 'var(--r-md)', border: '1px solid var(--stroke)' }}>
                                    {s.content}
                                </div>
                                {i <= step && (
                                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: s.actionStyle, marginTop: 'var(--s1)' }}>
                                        ↳ {s.action}
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </div>

                </div>
            </div>
        </motion.div>
    );
}
