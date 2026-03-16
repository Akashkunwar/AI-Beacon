/**
 * Site-wide config for canonical URLs and external links.
 * Override at build time with env: VITE_SITE_URL, VITE_GITHUB_URL.
 *
 * For social previews: add og-image.png (1200×630) to public/ so ogImageUrl resolves.
 */

const base = typeof import.meta.env?.VITE_SITE_URL === 'string'
    ? import.meta.env.VITE_SITE_URL.replace(/\/$/, '')
    : 'https://ai-beacon.pages.dev';

export const SITE_CONFIG = {
    /** Canonical base URL (no trailing slash) */
    baseUrl: base,
    /** OG image path (absolute URL) */
    ogImageUrl: `${base}/og-image.png`,
    /** GitHub repo URL — set VITE_GITHUB_URL or replace this default */
    githubUrl: typeof import.meta.env?.VITE_GITHUB_URL === 'string'
        ? import.meta.env.VITE_GITHUB_URL
        : 'https://github.com/Akashkunwar/AI-Beacon',
} as const;
