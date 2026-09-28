import { SimulatorShell } from '@/components/core/SimulatorShell';
import { SEO } from '@/components/common/SEO';
import { ErrorBoundary } from '@/components/shared/ErrorBoundary';
import { SITE_CONFIG } from '@/config/site';

export function SimulatorPage() {
    const simulatorStructuredData = {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: 'AI Beacon — How LLMs Work',
        description: 'Step through a tiny, real transformer in your browser: tokenization, embeddings, multi-head attention, feed-forward layers and next-token prediction.',
        applicationCategory: 'EducationalApplication',
        operatingSystem: 'Web',
    };

    return (
        <>
            <SEO
                title="How LLMs Work — interactive transformer walkthrough"
                description="Type a sentence and follow it through a real (tiny) transformer, step by step: tokens, embeddings, multi-head attention, feed-forward layers, softmax and sampling. Every number is computed live in your browser."
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
