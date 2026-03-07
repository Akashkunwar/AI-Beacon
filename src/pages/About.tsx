import { motion } from 'framer-motion';
import { Nav } from '@/components/shared/Nav';
import { SEO } from '@/components/common/SEO';

const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: (delay: number = 0) => ({
        opacity: 1,
        y: 0,
        transition: { duration: 0.5, delay, ease: [0.2, 0, 0, 1] },
    }),
};

export function About() {
    const buildDate = new Date(__BUILD_TIME__).toLocaleString();
    const shortHash = __COMMIT_HASH__ === 'dev' ? 'Development' : __COMMIT_HASH__.substring(0, 7);

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
            <SEO title="About AI Beacon" description="Learn about the mission, history, and development of AI Beacon." />
            <Nav />
            <main className="depth-container" style={{ maxWidth: '800px', margin: '0 auto', paddingTop: 'var(--s8)', paddingBottom: 'var(--s8)' }}>
                <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0.05}>
                    <h1 style={{
                        fontSize: 'var(--text-3xl)',
                        fontWeight: 'var(--weight-semibold)',
                        color: 'var(--ink)',
                        marginBottom: 'var(--s6)',
                        letterSpacing: 'var(--tracking-tight)',
                    }}>
                        About AI Beacon
                    </h1>
                </motion.div>

                <motion.section initial="hidden" animate="visible" variants={fadeUp} custom={0.1} style={{ marginBottom: 'var(--s8)' }}>
                    <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--weight-medium)', color: 'var(--ink)', marginBottom: 'var(--s4)' }}>
                        Making AI Legible
                    </h2>
                    <p style={{ fontSize: 'var(--text-md)', color: 'var(--secondary)', lineHeight: 'var(--lead-body)', marginBottom: 'var(--s4)' }}>
                        AI Beacon started as "AiViz" (DEPTH), a project dedicated to demystifying the complex inner workings of Large Language Models. Our goal is to provide a zero-backend, interactive bridge between abstract mathematical concepts and intuitive visual understanding.
                    </p>
                    <p style={{ fontSize: 'var(--text-md)', color: 'var(--secondary)', lineHeight: 'var(--lead-body)' }}>
                        We believe that the best way to learn is by doing. By allowing users to input their own text and watch it flow through every matrix multiplication and sampling step, we transform a "black box" into a legible, navigable map of intelligence.
                    </p>
                </motion.section>

                <motion.section initial="hidden" animate="visible" variants={fadeUp} custom={0.15} style={{ marginBottom: 'var(--s8)' }}>
                    <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 'var(--weight-medium)', color: 'var(--ink)', marginBottom: 'var(--s4)' }}>
                        Why We Built This
                    </h2>
                    <p style={{ fontSize: 'var(--text-md)', color: 'var(--secondary)', lineHeight: 'var(--lead-body)' }}>
                        The AI revolution is moving at a breakneck pace. While there are countless resources explaining "what" AI can do, there are far fewer that legibly show "how" it does it. AI Beacon is our contribution to open-source education — a tool for students, researchers, and the curious to explore the science of the transformer.
                    </p>
                </motion.section>

                <motion.section initial="hidden" animate="visible" variants={fadeUp} custom={0.2} style={{ padding: 'var(--s6)', background: 'var(--bg-panel)', borderRadius: 'var(--r-lg)', border: '1px solid var(--stroke)' }}>
                    <h2 style={{
                        fontSize: 'var(--text-xs)',
                        fontFamily: 'var(--font-mono)',
                        color: 'var(--muted)',
                        textTransform: 'uppercase',
                        letterSpacing: 'var(--tracking-wider)',
                        marginBottom: 'var(--s4)'
                    }}>
                        Deployment Status
                    </h2>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--s4)' }}>
                        <div>
                            <p style={{ fontSize: 'var(--text-2xs)', fontFamily: 'var(--font-mono)', color: 'var(--muted)', marginBottom: 'var(--s1)' }}>LATEST COMMIT</p>
                            <p style={{ fontSize: 'var(--text-sm)', fontFamily: 'var(--font-mono)', color: 'var(--ink)' }}>{shortHash}</p>
                        </div>
                        <div>
                            <p style={{ fontSize: 'var(--text-2xs)', fontFamily: 'var(--font-mono)', color: 'var(--muted)', marginBottom: 'var(--s1)' }}>BUILD TIME (UTC)</p>
                            <p style={{ fontSize: 'var(--text-sm)', fontFamily: 'var(--font-mono)', color: 'var(--ink)' }}>{buildDate}</p>
                        </div>
                    </div>
                </motion.section>
            </main>

            <footer style={{ paddingBlock: 'var(--s6)', borderTop: '1px solid var(--stroke)', textAlign: 'center' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>
                    AI Beacon — Open Source AI Education
                </span>
            </footer>
        </div>
    );
}
