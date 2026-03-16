import { Link } from 'react-router-dom';
import { SITE_CONFIG } from '@/config/site';

export function Footer() {
    const shortHash = typeof __COMMIT_HASH__ === 'string' ? __COMMIT_HASH__.substring(0, 7) : 'dev';

    return (
        <footer
            aria-label="Site footer"
            style={{
                paddingBlock: 'var(--s6)',
                borderTop: '1px solid var(--stroke)',
            }}
        >
            <div className="depth-container" style={{ maxWidth: '1100px', margin: '0 auto' }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: 'var(--s3)',
                }}>
                    <span style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: 'var(--text-xs)',
                        color: 'var(--ink)',
                    }}>
                        AI Beacon — LLM Visualizer
                    </span>

                    <div style={{ display: 'flex', gap: 'var(--s5)', alignItems: 'center' }}>
                        <a
                            href={SITE_CONFIG.githubUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="AI Beacon on GitHub"
                            style={{
                                fontFamily: 'var(--font-sans)',
                                fontSize: 'var(--text-xs)',
                                color: 'var(--secondary)',
                                textDecoration: 'none',
                                transition: 'color var(--dur-fast) var(--ease-out)',
                            }}
                            onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = 'var(--ink)'; }}
                            onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = 'var(--secondary)'; }}
                        >
                            GitHub
                        </a>
                        <Link
                            to="/about"
                            style={{
                                fontFamily: 'var(--font-sans)',
                                fontSize: 'var(--text-xs)',
                                color: 'var(--secondary)',
                                textDecoration: 'none',
                                transition: 'color var(--dur-fast) var(--ease-out)',
                            }}
                            onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = 'var(--ink)'; }}
                            onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = 'var(--secondary)'; }}
                        >
                            About
                        </Link>
                        <div style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: '10px',
                            color: 'var(--muted)',
                            background: 'var(--bg-panel)',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            border: '1px solid var(--stroke)',
                        }}>
                            v{shortHash}
                        </div>
                    </div>

                    <span style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: 'var(--text-xs)',
                        color: 'var(--muted)',
                    }}>
                        Open source — MIT
                    </span>
                </div>

                <div style={{ textAlign: 'center', marginTop: 'var(--s4)' }}>
                    <span style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: 'var(--text-xs)',
                        color: 'var(--muted)',
                    }}>
                        Built to make AI legible.
                    </span>
                </div>
            </div>
        </footer>
    );
}
