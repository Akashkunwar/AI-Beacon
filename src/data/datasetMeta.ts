/**
 * Lightweight dataset summary for the homepage, kept separate from the large
 * timeline JSON files so the landing page stays fast.
 *
 * Keep these numbers in sync with the JSON files — `npm test` fails if they
 * drift (see src/__tests__/data/datasets.test.ts).
 */
export const DATASET_META = {
    models: 312,
    papers: 98,
    tools: 129,
    /** Date the timeline datasets were last reviewed (YYYY-MM-DD). */
    lastUpdated: '2026-09-28',
} as const;
