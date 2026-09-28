import { Link, useLocation } from 'react-router-dom';
import { SEO } from '@/components/common/SEO';
import { MODULES } from '@/config/modules';
import { Nav } from '@/components/shared/Nav';
import { Footer } from '@/components/shared/Footer';
import { ButtonLink } from '@/components/shared/ButtonLink';

export function NotFound() {
    const { pathname } = useLocation();
    return (
        <div className="page">
            <SEO title="Page not found" description="The page you’re looking for doesn’t exist." noindex />
            <Nav />
            <main id="main" className="page-main nf">
                <div className="container-narrow nf-inner">
                    <p className="eyebrow">Error 404</p>
                    <h1 className="nf-title">This page isn’t in our vocabulary.</h1>
                    <p className="nf-lede">
                        A model maps words it doesn’t know to <code>&lt;unk&gt;</code>. We can’t find <code>{pathname}</code> either — it may
                        have moved, or the link may have a typo.
                    </p>
                    <div className="nf-actions">
                        <ButtonLink to="/">Back to home</ButtonLink>
                        <ButtonLink to="/timeline" variant="secondary">Open the AI Timeline</ButtonLink>
                    </div>
                    <p className="field-label nf-or">Or jump to a module</p>
                    <ul className="nf-list">
                        {MODULES.map((m) => (
                            <li key={m.id}>
                                <Link to={m.route} className="nf-link">
                                    <span className="nf-num">{m.num}</span>
                                    <span><strong>{m.title}</strong> — {m.summary}</span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            </main>
            <Footer />
            <style>{`
                .nf-inner { padding-block: var(--s8) var(--s7); display: flex; flex-direction: column; gap: var(--s4); }
                .nf-title { font-size: var(--text-2xl); letter-spacing: var(--tracking-tight); line-height: 1.15; }
                .nf-lede { font-size: var(--text-md); color: var(--secondary); line-height: 1.6; }
                .nf-lede code { font-family: var(--font-mono); font-size: 0.9em; background: var(--bg-raised); padding: 1px 6px; border-radius: var(--r-xs); color: var(--ink); word-break: break-all; }
                .nf-actions { display: flex; flex-wrap: wrap; gap: var(--s2); }
                .nf-or { margin-top: var(--s5); }
                .nf-list { list-style: none; display: flex; flex-direction: column; border-top: 1px solid var(--stroke); }
                .nf-link { display: flex; gap: var(--s3); padding: var(--s3) 0; border-bottom: 1px solid var(--stroke); font-size: var(--text-sm); color: var(--secondary); line-height: 1.5; }
                .nf-link:hover strong { text-decoration: underline; text-underline-offset: 3px; }
                .nf-link strong { color: var(--ink); font-weight: var(--weight-semibold); }
                .nf-num { font-family: var(--font-mono); font-size: var(--text-xs); color: var(--muted); padding-top: 2px; }
            `}</style>
        </div>
    );
}
