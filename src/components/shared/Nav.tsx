import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { SkipToMain } from '@/components/common/SkipToMain';
import { MODULES } from '@/config/modules';
import { SITE_CONFIG } from '@/config/site';
import { BeaconMark, CloseIcon, GitHubIcon, MenuIcon } from './Icons';
import { ThemeToggle } from './ThemeToggle';

interface NavProps {
    /** Force a route to be highlighted (defaults to the current path). */
    activeRoute?: string;
}

export function Nav({ activeRoute }: NavProps) {
    const location = useLocation();
    const currentPath = activeRoute ?? location.pathname;
    const [open, setOpen] = useState(false);

    // Close the mobile menu on navigation.
    useEffect(() => {
        setOpen(false);
    }, [location.pathname]);

    // Lock page scroll and allow Escape to close while the mobile menu is open.
    useEffect(() => {
        if (!open) return;
        const prev = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setOpen(false);
        };
        window.addEventListener('keydown', onKey);
        return () => {
            document.body.style.overflow = prev;
            window.removeEventListener('keydown', onKey);
        };
    }, [open]);

    return (
        <>
            <SkipToMain />
            <header className="site-nav" data-open={open || undefined}>
                <div className="container-wide site-nav-inner">
                    <Link to="/" className="site-logo" aria-label="AI Beacon home">
                        <BeaconMark size={26} />
                        <span className="site-logo-text">AI Beacon</span>
                    </Link>

                    <nav aria-label="Main navigation" className="site-nav-links">
                        {MODULES.map((m) => (
                            <NavLink
                                key={m.id}
                                to={m.route}
                                className="site-nav-link"
                                aria-current={currentPath === m.route ? 'page' : undefined}
                            >
                                {m.navLabel}
                            </NavLink>
                        ))}
                    </nav>

                    <div className="site-nav-actions">
                        <ThemeToggle />
                        <a
                            href={SITE_CONFIG.githubUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="icon-btn site-nav-github"
                            aria-label="AI Beacon on GitHub (opens in a new tab)"
                            title="View source on GitHub"
                        >
                            <GitHubIcon size={17} />
                        </a>
                        <button
                            type="button"
                            className="icon-btn site-nav-menu-btn"
                            onClick={() => setOpen((v) => !v)}
                            aria-label={open ? 'Close menu' : 'Open menu'}
                            aria-expanded={open}
                            aria-controls="mobile-navigation"
                        >
                            {open ? <CloseIcon /> : <MenuIcon />}
                        </button>
                    </div>
                </div>

                {open && (
                    <div id="mobile-navigation" className="site-mobile-menu">
                        <nav aria-label="Mobile navigation" className="container-wide">
                            <Link to="/" className="site-mobile-link" aria-current={currentPath === '/' ? 'page' : undefined}>
                                <span className="site-mobile-num">00</span>
                                <span>
                                    <span className="site-mobile-title">Home</span>
                                    <span className="site-mobile-desc">Start here — overview of all modules.</span>
                                </span>
                            </Link>
                            {MODULES.map((m) => (
                                <Link
                                    key={m.id}
                                    to={m.route}
                                    className="site-mobile-link"
                                    aria-current={currentPath === m.route ? 'page' : undefined}
                                >
                                    <span className="site-mobile-num">{m.num}</span>
                                    <span>
                                        <span className="site-mobile-title">{m.title}</span>
                                        <span className="site-mobile-desc">{m.summary}</span>
                                    </span>
                                </Link>
                            ))}
                            <div className="site-mobile-footer">
                                <Link to="/about" className="text-link">About &amp; methodology</Link>
                                <a href={SITE_CONFIG.githubUrl} target="_blank" rel="noopener noreferrer" className="text-link">
                                    GitHub ↗
                                </a>
                            </div>
                        </nav>
                    </div>
                )}
            </header>
            <style>{NAV_CSS}</style>
        </>
    );
}

const NAV_CSS = `
.site-nav {
    position: sticky;
    top: 0;
    z-index: var(--z-nav);
    height: var(--nav-height);
    background: color-mix(in srgb, var(--bg) 82%, transparent);
    backdrop-filter: saturate(180%) blur(12px);
    -webkit-backdrop-filter: saturate(180%) blur(12px);
    border-bottom: 1px solid var(--stroke);
}
.site-nav-inner {
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--s4);
}
.site-logo {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    flex-shrink: 0;
    border-radius: var(--r-sm);
}
.site-logo-text {
    font-weight: var(--weight-semibold);
    font-size: var(--text-base);
    letter-spacing: var(--tracking-snug);
    color: var(--ink);
}
.site-nav-links {
    display: flex;
    align-items: center;
    gap: 2px;
}
.site-nav-link {
    padding: 7px 12px;
    border-radius: var(--r-sm);
    font-size: var(--text-sm);
    color: var(--secondary);
    white-space: nowrap;
    transition: background var(--dur-fast) var(--ease-out), color var(--dur-fast) var(--ease-out);
}
.site-nav-link:hover { color: var(--ink); background: var(--bg-raised); }
.site-nav-link[aria-current='page'] {
    color: var(--ink);
    background: var(--bg-raised);
    font-weight: var(--weight-medium);
}
.site-nav-actions { display: flex; align-items: center; gap: var(--s2); }
.site-nav-menu-btn { display: none; }

.site-mobile-menu {
    position: fixed;
    inset: var(--nav-height) 0 0 0;
    background: var(--bg);
    overflow-y: auto;
    padding-block: var(--s3) var(--s6);
    animation: fade-up var(--dur-base) var(--ease-out);
}
.site-mobile-link {
    display: grid;
    grid-template-columns: 2.25rem 1fr;
    gap: var(--s2);
    padding: var(--s4) 0;
    border-bottom: 1px solid var(--stroke);
}
.site-mobile-num { font-family: var(--font-mono); font-size: var(--text-xs); color: var(--muted); padding-top: 3px; }
.site-mobile-title { display: block; font-size: var(--text-md); font-weight: var(--weight-semibold); color: var(--ink); }
.site-mobile-desc { display: block; font-size: var(--text-xs); color: var(--secondary); margin-top: 2px; line-height: var(--lead-snug); }
.site-mobile-link[aria-current='page'] .site-mobile-title { text-decoration: underline; text-underline-offset: 4px; }
.site-mobile-footer { display: flex; gap: var(--s5); padding-top: var(--s5); font-size: var(--text-sm); }

@media (max-width: 1023px) {
    .site-nav-links { display: none; }
    .site-nav-menu-btn { display: inline-grid; }
}
@media (max-width: 479px) {
    .site-nav-github { display: none; }
}
`;
