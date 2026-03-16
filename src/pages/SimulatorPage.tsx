import { SimulatorShell } from '@/components/core/SimulatorShell';
import { SEO } from '@/components/common/SEO';
import { ErrorBoundary } from '@/components/shared/ErrorBoundary';
import { SITE_CONFIG } from '@/config/site';

export function SimulatorPage() {
    const simulatorStructuredData = {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: 'AI Beacon Transformer Simulator',
        description: 'Interactive visualizer for transformer architecture. Explore self-attention, feed-forward networks, and layer normalization in real-time.',
        applicationCategory: 'EducationalApplication',
        operatingSystem: 'Web',
    };

    return (
        <>
            <SEO
                title="LLM Simulator"
                description="Interactive transformer visualizer. See every matrix multiply, every attention score, and every layer in real-time."
                canonical={`${SITE_CONFIG.baseUrl}/transformer-simulator`}
                structuredData={simulatorStructuredData}
            />
            <ErrorBoundary
                fallback={
                    <div className="error-boundary" style={{ minHeight: '100vh' }}>
                        <p className="error-boundary-title">Simulator error</p>
                        <p className="error-boundary-message">Something went wrong in the visualizer. Try refreshing or going back home.</p>
                        <a href="/" className="btn btn-primary">Back to home</a>
                    </div>
                }
            >
                <SimulatorShell />
            </ErrorBoundary>
        </>
    );
}
