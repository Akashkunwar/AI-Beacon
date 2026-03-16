import { Link } from 'react-router-dom';
import { Nav } from '@/components/shared/Nav';
import { Footer } from '@/components/shared/Footer';
import { SEO } from '@/components/common/SEO';
import { PrimaryButton } from '@/components/shared';
import { SITE_CONFIG } from '@/config/site';

export function NotFound() {
    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
            <SEO
                title="Page not found"
                description="The page you're looking for doesn't exist."
                canonical={`${SITE_CONFIG.baseUrl}/404`}
            />
            <Nav />
            <main id="main" className="depth-container" style={{ flex: 1, maxWidth: '560px', margin: '0 auto', paddingTop: 'var(--s8)', paddingBottom: 'var(--s8)', textAlign: 'center' }}>
                <h1 style={{
                    fontSize: 'var(--text-3xl)',
                    fontWeight: 'var(--weight-semibold)',
                    color: 'var(--ink)',
                    marginBottom: 'var(--s4)',
                    letterSpacing: 'var(--tracking-tight)',
                }}>
                    Page not found
                </h1>
                <p style={{ fontSize: 'var(--text-md)', color: 'var(--secondary)', lineHeight: 'var(--lead-body)', marginBottom: 'var(--s6)' }}>
                    The page you're looking for doesn't exist or has been moved.
                </p>
                <div style={{ display: 'flex', gap: 'var(--s3)', justifyContent: 'center', flexWrap: 'wrap' }}>
                    <PrimaryButton to="/" aria-label="Go to homepage">
                        Back to home
                    </PrimaryButton>
                    <Link
                        to="/timeline"
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 'var(--s2)',
                            padding: '0.6rem 1.25rem',
                            fontFamily: 'var(--font-sans)',
                            fontSize: 'var(--text-sm)',
                            fontWeight: 'var(--weight-medium)',
                            color: 'var(--secondary)',
                            textDecoration: 'none',
                            border: '1px solid var(--stroke-dark)',
                            borderRadius: 'var(--r-md)',
                        }}
                    >
                        Open AI Timeline
                    </Link>
                </div>
            </main>
            <Footer />
        </div>
    );
}
