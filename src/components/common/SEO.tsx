import { Helmet } from 'react-helmet-async';

interface ISEOProps {
    title?: string;
    description?: string;
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
    canonical = 'https://ai-beacon.vercel.app/',
    ogTitle,
    ogDescription,
    ogImage = 'https://ai-beacon.vercel.app/og-image.png',
    twitterTitle,
    twitterDescription,
    twitterImage,
    structuredData,
}: ISEOProps) {
    const fullTitle = title ? `${title} | AI Beacon — LLM Visualizer` : 'AI Beacon — LLM Visualizer | How Large Language Models Work';
    const fullDescription = description || 'Step through the internals of a transformer LLM — from tokenization to sampling. Interactive, precise, and open. No handwaving.';

    return (
        <Helmet>
            {/* Primary Meta Tags */}
            <title>{fullTitle}</title>
            <meta name="description" content={fullDescription} />
            <link rel="canonical" href={canonical} />

            {/* Open Graph / Facebook */}
            <meta property="og:type" content="website" />
            <meta property="og:url" content={canonical} />
            <meta property="og:title" content={ogTitle || fullTitle} />
            <meta property="og:description" content={ogDescription || fullDescription} />
            <meta property="og:image" content={ogImage} />

            {/* Twitter */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:url" content={canonical} />
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
