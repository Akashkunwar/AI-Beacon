// src/components/shared/Nav.tsx
// Shared sticky navigation header — used by Home, Training, and future pages.
// Monochrome only. No colour.

import { Link, useLocation } from 'react-router-dom';

const NAV_LINKS = [
    { label: 'AI Timeline', to: '/timeline', live: true },
    { label: 'How LLMs Work', to: '/transformer-simulator', live: true },
    { label: 'How AI is Trained', to: '/transformer-training-simulator', live: true },
    { label: 'Benchmarks', to: null, live: false },
    { label: 'Automation Clock', to: null, live: false },
];

interface NavProps {
    /** Override active‑route detection (e.g. pass '/transformer-training-simulator' from Training page) */
    activeRoute?: string;
}

export function Nav({ activeRoute }: NavProps) {
    const location = useLocation();
    const currentPath = activeRoute ?? location.pathname;

    return (
        <nav
            aria-label="Main navigation"
            style={{
                position: 'sticky',
                top: 0,
                zIndex: 'var(--z-nav)',
                background: 'rgba(249,249,249,0.92)',
                backdropFilter: 'blur(12px)',
                borderBottom: '1px solid var(--stroke)',
                height: '52px',
                display: 'flex',
                alignItems: 'center',
            }}
        >
            <div className="depth-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                {/* Logo */}
                <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 'var(--s2)', textDecoration: 'none' }}>
                    <span style={{
                        fontFamily: 'var(--font-mono)',
                        fontWeight: 'var(--weight-medium)',
                        fontSize: 'var(--text-sm)',
                        color: 'var(--ink)',
                    }}>
                        AI Beacon
                    </span>
                    <span style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: 'var(--text-2xs)',
                        color: 'var(--muted)',
                        background: 'var(--bg-raised)',
                        borderRadius: 'var(--r-pill)',
                        padding: '2px 7px',
                        marginLeft: 'var(--s2)',
                    }}>
                        beta
                    </span>
                </Link>

                {/* Nav Links */}
                <div className="nav-links" style={{ display: 'flex', alignItems: 'center', gap: 'var(--s1)' }}>
                    {NAV_LINKS.map((link) => {
                        const isActive = link.live && link.to === currentPath;

                        if (link.live && link.to) {
                            return (
                                <Link
                                    key={link.label}
                                    to={link.to}
                                    style={{
                                        fontFamily: 'var(--font-sans)',
                                        fontSize: 'var(--text-sm)',
                                        fontWeight: isActive ? 'var(--weight-medium)' : 'var(--weight-regular)',
                                        color: isActive ? 'var(--ink)' : 'var(--secondary)',
                                        padding: 'var(--s2) var(--s3)',
                                        borderRadius: 'var(--r-sm)',
                                        textDecoration: 'none',
                                        background: isActive ? 'var(--bg-raised)' : 'transparent',
                                        transition: `all var(--dur-fast) var(--ease-out)`,
                                    }}
                                    onMouseEnter={(e) => {
                                        if (!isActive) {
                                            (e.currentTarget as HTMLAnchorElement).style.background = 'var(--bg-panel)';
                                            (e.currentTarget as HTMLAnchorElement).style.color = 'var(--ink)';
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (!isActive) {
                                            (e.currentTarget as HTMLAnchorElement).style.background = 'transparent';
                                            (e.currentTarget as HTMLAnchorElement).style.color = 'var(--secondary)';
                                        }
                                    }}
                                >
                                    {link.label}
                                </Link>
                            );
                        }

                        return (
                            <span
                                key={link.label}
                                style={{
                                    fontFamily: 'var(--font-sans)',
                                    fontSize: 'var(--text-sm)',
                                    fontWeight: 'var(--weight-regular)',
                                    color: 'var(--secondary)',
                                    padding: 'var(--s2) var(--s3)',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 'var(--s1)',
                                    opacity: 0.7,
                                }}
                            >
                                {link.label}
                                <span style={{
                                    fontFamily: 'var(--font-mono)',
                                    fontSize: 'var(--text-2xs)',
                                    color: 'var(--muted)',
                                    background: 'var(--bg-raised)',
                                    borderRadius: 'var(--r-pill)',
                                    padding: '2px 6px',
                                    marginLeft: 'var(--s1)',
                                }}>
                                    soon
                                </span>
                            </span>
                        );
                    })}
                </div>
            </div>
            <style>{`
                @media (max-width: 760px) {
                    .nav-links { display: none !important; }
                }
            `}</style>
        </nav>
    );
}
