import { SimulatorShell } from '@/components/core/SimulatorShell';
import { SEO } from '@/components/common/SEO';

export function SimulatorPage() {
    const simulatorStructuredData = {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        'name': 'AI Beacon Transformer Simulator',
        'description': 'Interactive visualizer for transformer architecture. Explore self-attention, feed-forward networks, and layer normalization in real-time.',
        'applicationCategory': 'EducationalApplication',
        'operatingSystem': 'Web',
    };

    return (
        <>
            <SEO
                title="LLM Simulator"
                description="Interactive transformer visualizer. See every matrix multiply, every attention score, and every layer in real-time."
                structuredData={simulatorStructuredData}
            />
            <SimulatorShell />
        </>
    );
}
