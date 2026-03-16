import { Helmet } from 'react-helmet-async';
import { SITE_CONFIG } from '@/config/site';

interface ISEOProps {
    title?: string;
    description?: string;
    /** Full canonical URL for this page (defaults to baseUrl + pathname from Helmet context or base) */
    canonical?: string;
    ogTitle?: string;
    ogDescription?: string;
    ogImage?: string;
    twitterTitle?: string;
    twitterDescription?: string;
    twitterImage?: string;
    structuredData?: object;
}

export function SEO({
    title,
    description,
    canonical,
    ogTitle,
    ogDescription,
    ogImage = SITE_CONFIG.ogImageUrl,
    twitterTitle,
    twitterDescription,
    twitterImage,
    structuredData,
}: ISEOProps) {
    const fullTitle = title ? `${title} | AI Beacon — LLM Visualizer` : 'AI Beacon — LLM Visualizer | How Large Language Models Work';
    const fullDescription = description || 'Step through the internals of a transformer LLM — from tokenization to sampling. Interactive, precise, and open. No handwaving.';
    const canonicalUrl = canonical ?? `${SITE_CONFIG.baseUrl}/`;

    return (
        <Helmet>
            {/* Primary Meta Tags */}
            <title>{fullTitle}</title>
            <meta name="description" content={fullDescription} />
            <link rel="canonical" href={canonicalUrl} />

            {/* Open Graph / Facebook */}
            <meta property="og:type" content="website" />
            <meta property="og:url" content={canonicalUrl} />
            <meta property="og:title" content={ogTitle || fullTitle} />
            <meta property="og:description" content={ogDescription || fullDescription} />
            <meta property="og:image" content={ogImage} />

            {/* Twitter */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:url" content={canonicalUrl} />
            <meta name="twitter:title" content={twitterTitle || ogTitle || fullTitle} />
            <meta name="twitter:description" content={twitterDescription || ogDescription || fullDescription} />
            <meta name="twitter:image" content={twitterImage || ogImage} />

            {/* Structured Data */}
            {structuredData && (
                <script type="application/ld+json">
                    {JSON.stringify(structuredData)}
                </script>
            )}
        </Helmet>
    );
}
