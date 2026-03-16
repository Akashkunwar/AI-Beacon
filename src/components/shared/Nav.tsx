import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { SkipToMain } from '@/components/common/SkipToMain';

const NAV_LINKS = [
    { label: 'AI Timeline', to: '/timeline', live: true },
    { label: 'How LLMs Work', to: '/transformer-simulator', live: true },
    { label: 'How AI is Trained', to: '/transformer-training-simulator', live: true },
    { label: 'Benchmarks', to: '/benchmarks', live: true },
    { label: 'Automation Clock', to: '/automation-clock', live: true },
];

interface NavProps {
    /** Override active‑route detection (e.g. pass '/transformer-training-simulator' from Training page) */
    activeRoute?: string;
}

export function Nav({ activeRoute }: NavProps) {
    const location = useLocation();
    const currentPath = activeRoute ?? location.pathname;
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Lock scroll when mobile menu is open
    useEffect(() => {
        if (isMobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isMobileMenuOpen]);

    const navHeight = '52px';

    return (
        <>
            <SkipToMain />
            <nav
                aria-label="Main navigation"
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    zIndex: 'var(--z-nav)',
                    background: 'rgba(249,249,249,0.92)',
                    backdropFilter: 'blur(12px)',
                    borderBottom: '1px solid var(--stroke)',
                    height: navHeight,
                    display: 'flex',
                    alignItems: 'center',
                }}
            >
            <div className="depth-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
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

                {/* Desktop Nav Links */}
                <div className="nav-links-desktop" style={{ display: 'flex', alignItems: 'center', gap: 'var(--s1)' }}>
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

                {/* Mobile Toggle Button */}
                <button
                    className="mobile-toggle"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
                    style={{
                        display: 'none',
                        background: 'none',
                        border: 'none',
                        padding: 'var(--s2)',
                        cursor: 'pointer',
                        color: 'var(--ink)',
                    }}
                >
                    {isMobileMenuOpen ? (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    ) : (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="3" y1="12" x2="21" y2="12"></line>
                            <line x1="3" y1="6" x2="21" y2="6"></line>
                            <line x1="3" y1="18" x2="21" y2="18"></line>
                        </svg>
                    )}
                </button>
            </div>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        style={{
                            position: 'absolute',
                            top: '52px',
                            left: 0,
                            right: 0,
                            background: 'var(--bg)',
                            borderBottom: '1px solid var(--stroke)',
                            padding: 'var(--s4) var(--s6)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 'var(--s4)',
                            zIndex: 'var(--z-nav)',
                            boxShadow: 'var(--shadow-lg)',
                        }}
                    >
                        {NAV_LINKS.map((link) => {
                            const isActive = link.live && link.to === currentPath;

                            if (link.live && link.to) {
                                return (
                                    <Link
                                        key={link.label}
                                        to={link.to}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        style={{
                                            fontFamily: 'var(--font-sans)',
                                            fontSize: 'var(--text-md)',
                                            fontWeight: isActive ? 'var(--weight-medium)' : 'var(--weight-regular)',
                                            color: isActive ? 'var(--ink)' : 'var(--secondary)',
                                            textDecoration: 'none',
                                            padding: 'var(--s2) 0',
                                        }}
                                    >
                                        {link.label}
                                    </Link>
                                );
                            }

                            return (
                                <div
                                    key={link.label}
                                    style={{
                                        fontFamily: 'var(--font-sans)',
                                        fontSize: 'var(--text-md)',
                                        fontWeight: 'var(--weight-regular)',
                                        color: 'var(--muted)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        padding: 'var(--s2) 0',
                                    }}
                                >
                                    {link.label}
                                    <span style={{
                                        fontFamily: 'var(--font-mono)',
                                        fontSize: 'var(--text-2xs)',
                                        background: 'var(--bg-raised)',
                                        borderRadius: 'var(--r-pill)',
                                        padding: '2px 8px',
                                    }}>
                                        soon
                                    </span>
                                </div>
                            );
                        })}
                    </motion.div>
                )}
            </AnimatePresence>

            <style>{`
                @media (max-width: 719px) {
                    .nav-links-desktop { display: none !important; }
                    .mobile-toggle { display: block !important; }
                }
                .mobile-toggle { min-width: 44px; min-height: 44px; }
            `}</style>
        </nav>
            <div aria-hidden="true" style={{ height: navHeight, flexShrink: 0 }} />
        </>
    );
}
