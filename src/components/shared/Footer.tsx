import { Link } from 'react-router-dom';
import { SITE_CONFIG } from '@/config/site';
import { MODULES } from '@/config/modules';
import { DATASET_META } from '@/data/datasetMeta';
import { formatDate } from '@/utils/timeline';
import { BeaconMark } from './Icons';

export function Footer() {
    const shortHash = typeof __COMMIT_HASH__ === 'string' && __COMMIT_HASH__ !== 'dev'
        ? __COMMIT_HASH__.substring(0, 7)
        : 'dev';

    return (
        <footer aria-label="Site footer" className="site-footer">
            <div className="container-wide site-footer-grid">
                <div className="site-footer-brand">
                    <Link to="/" className="site-logo" aria-label="AI Beacon home">
                        <BeaconMark size={24} />
                        <span className="site-logo-text">AI Beacon</span>
                    </Link>
                    <p>
                        A free, open-source, interactive guide to how modern AI works — built to make AI legible
                        for students, engineers, educators and the curious.
                    </p>
                    <p className="site-footer-meta">
                        Data last reviewed {formatDate(DATASET_META.lastUpdated, 'long')} · build {shortHash}
                    </p>
                </div>

                <nav aria-label="Modules" className="site-footer-col">
                    <p className="eyebrow">Modules</p>
                    {MODULES.map((m) => (
                        <Link key={m.id} to={m.route}>{m.title}</Link>
                    ))}
                </nav>

                <nav aria-label="Project" className="site-footer-col">
                    <p className="eyebrow">Project</p>
                    <Link to="/about">About &amp; methodology</Link>
                    <a href={SITE_CONFIG.githubUrl} target="_blank" rel="noopener noreferrer">Source code ↗</a>
                    <a href={`${SITE_CONFIG.githubUrl}/issues/new/choose`} target="_blank" rel="noopener noreferrer">
                        Report an error ↗
                    </a>
                    <a href={`${SITE_CONFIG.githubUrl}/blob/main/docs/DATA-GUIDE.md`} target="_blank" rel="noopener noreferrer">
                        Update the data ↗
                    </a>
                </nav>
            </div>
            <div className="container-wide site-footer-bottom">
                <span>© {new Date().getFullYear()} AI Beacon contributors · MIT License</span>
                <span>Educational resource. Figures are cited where available; always check the linked source.</span>
            </div>
            <style>{FOOTER_CSS}</style>
        </footer>
    );
}

const FOOTER_CSS = `
.site-footer {
    border-top: 1px solid var(--stroke);
    background: var(--bg);
    padding-top: var(--s7);
    margin-top: auto;
}
.site-footer-grid {
    display: grid;
    grid-template-columns: minmax(0, 2fr) minmax(0, 1fr) minmax(0, 1fr);
    gap: var(--s6);
}
.site-footer-brand { display: flex; flex-direction: column; gap: var(--s3); max-width: 44ch; }
.site-footer-brand p { font-size: var(--text-sm); color: var(--secondary); }
.site-footer-brand .site-footer-meta { font-family: var(--font-mono); font-size: var(--text-2xs); color: var(--muted); }
.site-footer-col { display: flex; flex-direction: column; gap: var(--s2); font-size: var(--text-sm); }
.site-footer-col .eyebrow { margin-bottom: var(--s1); }
.site-footer-col a { color: var(--secondary); width: fit-content; transition: color var(--dur-fast) var(--ease-out); }
.site-footer-col a:hover { color: var(--ink); }
.site-footer-bottom {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    gap: var(--s2) var(--s5);
    padding-block: var(--s5);
    margin-top: var(--s6);
    border-top: 1px solid var(--stroke);
    font-size: var(--text-2xs);
    color: var(--muted);
}
@media (max-width: 767px) {
    .site-footer-grid { grid-template-columns: 1fr 1fr; }
    .site-footer-brand { grid-column: 1 / -1; }
}
`;
