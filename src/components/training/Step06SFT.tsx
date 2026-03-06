import { useState, useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ErrorBoundary } from '@/components/shared/ErrorBoundary';

const SFT_DATASET = [
    { prompt: "Write a haiku about a robot learning to paint.", response: "Silver brush in hand\nColors bloom on canvas white\nSoul in circuitry" },
    { prompt: "Explain quantum computing in one sentence.", response: "Quantum computing uses the principles of quantum mechanics, like superposition and entanglement, to perform complex calculations exponentially faster than classical computers." },
    { prompt: "Translate 'Hello, how are you?' to French.", response: "Bonjour, comment allez-vous ?" },
    { prompt: "Summarize the plot of Romeo and Juliet.", response: "Two young star-crossed lovers from feuding families fall in love, but their secret romance tragically leads to their untimely deaths, ultimately uniting their warring households." },
    { prompt: "What is the capital of Japan?", response: "The capital of Japan is Tokyo." },
    { prompt: "Write a python function to calculate the factorial of a number.", response: "def factorial(n):\n    if n == 0:\n        return 1\n    else:\n        return n * factorial(n-1)" },
    { prompt: "Who painted the Mona Lisa?", response: "Leonardo da Vinci painted the Mona Lisa." },
    { prompt: "Give me a recipe for chocolate chip cookies.", response: "Cream 1 cup butter and 1 cup sugar. Add 2 eggs and 1 tsp vanilla. Mix in 3 cups flour, 1 tsp baking soda, and 0.5 tsp salt. Fold in 2 cups chocolate chips. Bake at 350°F for 10 minutes." }
];

const LORA_RANKS = [4, 8, 16, 32, 64];
const MODEL_DIM = 4096;
const ORIGINAL_PARAMS = MODEL_DIM * MODEL_DIM;

interface Step06SFTProps {
    stepNumber: number;
    totalSteps: number;
    onNext: () => void;
    onPrev: () => void;
}

export function Step06SFT({ stepNumber, totalSteps, onNext: _onNext, onPrev: _onPrev }: Step06SFTProps) {
    const shouldReduceMotion = useReducedMotion();

    const [pageIndex, setPageIndex] = useState(0);
    const [loraRank, setLoraRank] = useState<number>(16);

    const currentPair = SFT_DATASET[pageIndex];
    // Rough estimation of token count
    const promptTokenCount = useMemo(() => Math.ceil(currentPair.prompt.split(' ').length * 1.3), [currentPair.prompt]);
    const responseTokenCount = useMemo(() => Math.ceil(currentPair.response.split(' ').length * 1.3), [currentPair.response]);

    const loraParams = (MODEL_DIM * loraRank) + (loraRank * MODEL_DIM);
    const compressionPercent = ((loraParams / ORIGINAL_PARAMS) * 100).toFixed(2);

    const dummySeq = ["Write", "a", "script", "Assistant:", "Sure,", "here", "is", "a", "script..."];
    const promptLen = 3;

    // --- Sub-components ---

    const OverviewSection = () => (
        <section aria-labelledby="sft-overview-heading" style={{ marginBottom: 'var(--s8)' }}>
            <h2 style={{
                fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)', color: 'var(--muted)',
                textTransform: 'uppercase', letterSpacing: 'var(--tracking-wider)', marginBottom: 'var(--s4)'
            }}>
                Step {stepNumber < 10 ? `0${stepNumber}` : stepNumber} — Supervised
            </h2>
            <h1
                id="sft-overview-heading"
                style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: 'var(--text-xl)',
                    fontWeight: 'var(--weight-semibold)',
                    color: 'var(--ink)',
                    lineHeight: 'var(--lead-tight)',
                    letterSpacing: 'var(--tracking-snug)',
                    margin: '0 0 var(--s4)',
                }}
            >
                Teaching the model how to converse.
            </h1>
            <p
                style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: 'var(--text-sm)',
                    fontWeight: 'var(--weight-light)',
                    color: 'var(--secondary)',
                    lineHeight: 'var(--lead-body)',
                    maxWidth: '62ch',
                    margin: 0,
                }}
            >
                Pre-training objective is document continuation. To make an AI assistant, we curate
                thousands of high-quality (prompt, response) pairs and fine-tune the model to understand the dialog format.
            </p>
        </section>
    );

    const DatasetExplorerSection = () => (
        <section style={{ marginBottom: 'var(--s8)' }}>
            <h3 style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xl)', color: 'var(--ink)', fontWeight: 'var(--weight-medium)', marginBottom: 'var(--s4)' }}>
                Dataset Explorer
            </h3>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)', color: 'var(--secondary)', marginBottom: 'var(--s5)' }}>
                SFT datasets consist of structured instructions and ideal responses.
            </p>
            <div style={{
                background: 'var(--bg-panel)', border: '1px solid var(--stroke)', borderRadius: 'var(--r-lg)',
                padding: 'var(--s5)', display: 'flex', flexDirection: 'column', gap: 'var(--s4)'
            }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--s5)' }}>
                    {/* Prompt Box */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s3)' }}>
                        <div style={{
                            fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--muted)', textTransform: 'uppercase',
                            letterSpacing: 'var(--tracking-wider)'
                        }}>
                            USER PROMPT
                        </div>
                        <div style={{
                            background: 'var(--bg)', border: '1px solid var(--stroke-dark)', borderRadius: 'var(--r-md)',
                            padding: 'var(--s4)', flexShrink: 0, minHeight: '120px'
                        }}>
                            <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-md)', color: 'var(--ink)', margin: 0, whiteSpace: 'pre-wrap' }}>
                                {currentPair.prompt}
                            </p>
                        </div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--muted)', textAlign: 'right' }}>
                            ~{promptTokenCount} tokens
                        </div>
                    </div>

                    {/* Response Box */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s3)' }}>
                        <div style={{
                            fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--muted)', textTransform: 'uppercase',
                            letterSpacing: 'var(--tracking-wider)'
                        }}>
                            ASSISTANT RESPONSE
                        </div>
                        <div style={{
                            background: 'var(--bg)', border: '1px solid var(--stroke-dark)', borderRadius: 'var(--r-md)',
                            padding: 'var(--s4)', flexShrink: 0, minHeight: '120px'
                        }}>
                            <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-md)', color: 'var(--ink)', margin: 0, whiteSpace: 'pre-wrap' }}>
                                {currentPair.response}
                            </p>
                        </div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--muted)', textAlign: 'right' }}>
                            ~{responseTokenCount} tokens
                        </div>
                    </div>
                </div>

                {/* Pagination Controls */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--s4)', marginTop: 'var(--s2)' }}>
                    <button
                        onClick={() => setPageIndex(Math.max(0, pageIndex - 1))}
                        disabled={pageIndex === 0}
                        style={{
                            fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)', color: 'var(--ink)', background: 'transparent',
                            border: '1px solid var(--stroke-dark)', borderRadius: 'var(--r-sm)', padding: 'var(--s2) var(--s4)',
                            cursor: pageIndex === 0 ? 'not-allowed' : 'pointer', opacity: pageIndex === 0 ? 0.3 : 1
                        }}
                    >
                        ← Prev
                    </button>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)', color: 'var(--secondary)' }}>
                        {pageIndex + 1} / {SFT_DATASET.length}
                    </span>
                    <button
                        onClick={() => setPageIndex(Math.min(SFT_DATASET.length - 1, pageIndex + 1))}
                        disabled={pageIndex === SFT_DATASET.length - 1}
                        style={{
                            fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)', color: 'var(--ink)', background: 'transparent',
                            border: '1px solid var(--stroke-dark)', borderRadius: 'var(--r-sm)', padding: 'var(--s2) var(--s4)',
                            cursor: pageIndex === SFT_DATASET.length - 1 ? 'not-allowed' : 'pointer', opacity: pageIndex === SFT_DATASET.length - 1 ? 0.3 : 1
                        }}
                    >
                        Next →
                    </button>
                </div>
            </div>
        </section>
    );

    const ObjectiveSection = () => (
        <section aria-labelledby="sft-objective-heading" style={{ marginBottom: 'var(--s8)' }}>
            <h3 id="sft-objective-heading" style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xl)', color: 'var(--ink)', fontWeight: 'var(--weight-medium)', marginBottom: 'var(--s4)' }}>
                SFT vs Pre-Training Objective
            </h3>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)', color: 'var(--secondary)', marginBottom: 'var(--s5)' }}>
                During pre-training, loss is calculated on every token. In SFT, gradients only flow through the assistant's response tokens. The user prompt is masked out of the loss calculation.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--s5)' }}>
                {/* CLM Visualization */}
                <div style={{ background: 'var(--bg-panel)', border: '1px solid var(--stroke)', borderRadius: 'var(--r-lg)', padding: 'var(--s5)' }}>
                    <h4 style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-md)', color: 'var(--ink)', margin: '0 0 var(--s4) 0' }}>Causal LM Objective (Pre-training)</h4>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--s2)' }}>
                        {dummySeq.map((tok, i) => (
                            <div key={i} style={{
                                fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)', padding: 'var(--s1) var(--s2)',
                                borderRadius: 'var(--r-xs)', border: '1px solid var(--stroke-dark)',
                                background: 'var(--bg)', color: 'var(--ink)'
                            }}>
                                {tok}
                            </div>
                        ))}
                    </div>
                    <p style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--muted)', marginTop: 'var(--s4)' }}>Loss calculated on all {dummySeq.length} tokens.</p>
                </div>

                {/* SFT Visualization */}
                <div style={{ background: 'var(--bg-panel)', border: '1px solid var(--stroke)', borderRadius: 'var(--r-lg)', padding: 'var(--s5)' }}>
                    <h4 style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-md)', color: 'var(--ink)', margin: '0 0 var(--s4) 0' }}>SFT Objective (Instruct Tuning)</h4>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--s2)' }}>
                        {dummySeq.map((tok, i) => {
                            const isResponse = i > promptLen; // after "Assistant:"
                            return (
                                <div key={i} style={{
                                    fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)', padding: 'var(--s1) var(--s2)',
                                    borderRadius: 'var(--r-xs)',
                                    border: isResponse ? '1px solid var(--ink)' : '1px solid transparent',
                                    background: isResponse ? 'var(--ink)' : 'transparent',
                                    color: isResponse ? 'var(--text-inverse)' : 'var(--muted)',
                                    opacity: isResponse ? 1 : 0.6
                                }}>
                                    {tok}
                                </div>
                            );
                        })}
                    </div>
                    <p style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--muted)', marginTop: 'var(--s4)' }}>
                        Loss calculated on {dummySeq.length - promptLen - 1} response tokens. Prompt tokens are masked.
                    </p>
                </div>
            </div>
            <div style={{
                marginTop: 'var(--s4)', padding: 'var(--s3) var(--s4)', borderLeft: '3px solid var(--ink)',
                background: 'var(--bg-panel)', fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)', color: 'var(--secondary)'
            }}>
                <strong>Key Insight:</strong> Gradients only flow through response tokens, teaching the model to <em>generate</em> answers, not memorize the prompt.
            </div>
        </section>
    );

    const LoRASection = () => (
        <section aria-labelledby="sft-lora-heading" style={{ marginBottom: 'var(--s8)' }}>
            <h3 id="sft-lora-heading" style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xl)', color: 'var(--ink)', fontWeight: 'var(--weight-medium)', marginBottom: 'var(--s4)' }}>
                LoRA (Low-Rank Adaptation)
            </h3>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)', color: 'var(--secondary)', marginBottom: 'var(--s5)' }}>
                Full-parameter fine-tuning is extremely expensive. Low-Rank Adaptation (LoRA) freezes the original model weights and injects trainable rank decomposition matrices.
            </p>

            <div style={{
                background: 'var(--bg-panel)', border: '1px solid var(--stroke)', borderRadius: 'var(--r-lg)', padding: 'var(--s5)',
                display: 'flex', flexDirection: 'column', gap: 'var(--s5)'
            }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--s6)', alignItems: 'center', justifyContent: 'center' }}>
                    {/* Visual representation of matrices */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--s3)' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--s2)' }}>
                            <div style={{
                                width: '120px', height: '120px', background: 'var(--bg)', border: '2px solid var(--stroke-dark)',
                                borderRadius: 'var(--r-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontFamily: 'var(--font-mono)', color: 'var(--muted)'
                            }}>
                                W (Frozen)
                            </div>
                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>d × d</span>
                        </div>

                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-lg)', color: 'var(--ink)', padding: 'var(--s2)' }}>+</div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--s2)' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--s2)' }}>
                                <div style={{
                                    width: '30px', height: '120px', background: 'var(--bg-inverse)', borderRadius: 'var(--r-sm)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-inverse)',
                                    fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)'
                                }}>
                                    A
                                </div>
                                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>d × r</span>
                            </div>
                            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-md)', color: 'var(--ink)' }}>×</div>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--s2)' }}>
                                <div style={{
                                    width: '120px', height: '30px', background: 'var(--bg-inverse)', borderRadius: 'var(--r-sm)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-inverse)',
                                    fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)'
                                }}>
                                    B
                                </div>
                                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>r × d</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* LoRA Rank Selector */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s3)', borderTop: '1px solid var(--stroke)', paddingTop: 'var(--s4)' }}>
                    <div style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)', color: 'var(--ink)', fontWeight: 'var(--weight-medium)' }}>
                        Select Rank (r)
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--s3)' }}>
                        {LORA_RANKS.map(r => (
                            <button
                                key={r}
                                onClick={() => setLoraRank(r)}
                                style={{
                                    fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)',
                                    padding: 'var(--s2) var(--s4)', borderRadius: 'var(--r-pill)',
                                    border: loraRank === r ? '1px solid var(--ink)' : '1px solid var(--stroke-dark)',
                                    background: loraRank === r ? 'var(--bg-inverse)' : 'transparent',
                                    color: loraRank === r ? 'var(--text-inverse)' : 'var(--ink)',
                                    cursor: 'pointer',
                                    transition: 'all var(--dur-fast) var(--ease-out)'
                                }}
                            >
                                r = {r}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Live Stats */}
                <div style={{
                    display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 'var(--s4)',
                    background: 'var(--bg)', borderRadius: 'var(--r-md)', padding: 'var(--s4)', border: '1px dashed var(--stroke-dark)'
                }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s1)' }}>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--muted)', textTransform: 'uppercase' }}>Frozen Params (W)</span>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-lg)', color: 'var(--ink)' }}>{ORIGINAL_PARAMS.toLocaleString()}</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s1)' }}>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--muted)', textTransform: 'uppercase' }}>Trainable Params (A+B)</span>
                        <motion.span
                            key={loraParams}
                            initial={shouldReduceMotion ? false : { opacity: 0.5, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-lg)', color: 'var(--ink)' }}
                        >
                            {loraParams.toLocaleString()}
                        </motion.span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s1)' }}>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--muted)', textTransform: 'uppercase' }}>Compression</span>
                        <motion.span
                            key={compressionPercent}
                            initial={shouldReduceMotion ? false : { opacity: 0.5, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-lg)', color: 'var(--ink)', fontWeight: 'var(--weight-semibold)' }}
                        >
                            {compressionPercent}%
                        </motion.span>
                    </div>
                </div>

                {/* QLoRA Callout */}
                <div style={{
                    marginTop: 'var(--s2)', padding: 'var(--s3) var(--s4)', borderLeft: '3px solid var(--ink)',
                    background: 'var(--bg)', fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)', color: 'var(--secondary)'
                }}>
                    <strong>QLoRA:</strong> By quantizing the frozen weights to 4-bit and using LoRA, you can fine-tune a 65B parameter model on a single 48GB GPU!
                </div>
            </div>
        </section>
    );

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: [0.2, 0, 0, 1] }}
            style={{
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--s6)'
            }}
        >
            <ErrorBoundary>
                <article
                    aria-label={`Step ${stepNumber} of ${totalSteps}: Supervised Fine-Tuning`}
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 0,
                    }}
                >
                    <OverviewSection />
                    <DatasetExplorerSection />
                    <ObjectiveSection />
                    <LoRASection />

                    {/* Note: Footer navigation is handled by the parent Training.tsx component */}
                </article>
            </ErrorBoundary>
        </motion.div>
    );
}

// Ensure it can be easily lazily loaded or imported regularly.
