// src/data/timeline.ts
// Typed access to the three timeline datasets (models, papers, tools).
// Each dataset is loaded on demand so visitors only download what they view,
// then normalised into a common TimelineItem shape for the canvas and table.

import { slugify } from '@/utils/timeline';

export type TimelineKind = 'models' | 'papers' | 'tools';

// ─── Raw dataset shapes (mirror the JSON files) ─────────────────────────────

export type Modality = 'text' | 'code' | 'image' | 'audio' | 'video' | '3d' | 'science';

export interface ModelEntry {
    id: number;
    company: string;
    company_website: string;
    model_family: string;
    model_name: string;
    model_version: string;
    model_type: string;
    category: string;
    architecture: string;
    modalities: Modality[];
    parameters: number | null;
    parameter_unit: 'million' | 'billion' | null;
    training_tokens: number | null;
    open_source: boolean;
    license: string;
    api_available: boolean;
    context_window_tokens: number | null;
    training_data_cutoff: string | null;
    release_date: string;
    country: string;
    description: string;
    use_cases: string[];
    notable_features: string[];
    pricing_per_1m_tokens: { input: number | null; output: number | null };
    official_model_link: string | null;
    huggingface_url: string | null;
    paper_url: string | null;
    predecessor: string | null;
    successor: string | null;
}

export interface PaperEntry {
    id: number;
    title: string;
    authors: string[];
    institution: string;
    publication_date: string;
    published_in: string;
    topic: string;
    category: string;
    description: string;
    key_contributions: string[];
    paper_url: string | null;
    code_url: string | null;
    citations: number | null;
}

export interface ToolEntry {
    id: number;
    name: string;
    company: string;
    release_date: string;
    date_precision?: 'day' | 'month';
    open_source: boolean;
    license: string;
    category: string;
    group: string;
    description: string;
    key_features: string[];
    url: string | null;
}

// ─── Normalised item ────────────────────────────────────────────────────────

interface ItemBase {
    id: number;
    slug: string;
    name: string;
    org: string;
    date: string;
    datePrecision: 'day' | 'month';
    category: string;
    openSource: boolean | null;
    /** Short secondary line for cards (params, citations, category…) */
    meta: string;
    /** Lower-cased text used by the search box */
    haystack: string;
}

export type TimelineItem =
    | (ItemBase & { kind: 'models'; raw: ModelEntry })
    | (ItemBase & { kind: 'papers'; raw: PaperEntry })
    | (ItemBase & { kind: 'tools'; raw: ToolEntry });

export interface TimelineDataset {
    kind: TimelineKind;
    items: TimelineItem[];
    lastUpdated: string;
}

// ─── Labels & ordered option lists ─────────────────────────────────────────

export const KIND_LABELS: Record<TimelineKind, { plural: string; lower: string; singular: string; org: string }> = {
    models: { plural: 'AI models', lower: 'AI models', singular: 'model', org: 'Company' },
    papers: { plural: 'Research papers', lower: 'research papers', singular: 'paper', org: 'Institution' },
    tools: { plural: 'AI tools', lower: 'AI tools', singular: 'tool', org: 'Company' },
};

export const MODEL_CATEGORIES = [
    'Language', 'Reasoning', 'Multimodal', 'Small & fast', 'Coding', 'Image generation', 'Video generation',
    'Audio & speech', 'Vision', 'Science', 'Robotics', 'World & 3D', 'Architecture',
] as const;

export const PAPER_CATEGORIES = [
    'Architecture', 'Training & scaling', 'Language & NLP', 'Vision & multimodal', 'Generative media', 'Reasoning',
    'Reinforcement learning', 'Alignment & safety', 'Interpretability', 'Agents', 'Efficiency', 'Evaluation',
    'Science', 'Models & reports',
] as const;

export const TOOL_GROUPS = [
    'Coding', 'Agents & automation', 'Developer platforms', 'Assistants & research', 'Creative',
] as const;

export const MODALITY_LABELS: Record<Modality, string> = {
    text: 'Text',
    code: 'Code',
    image: 'Images',
    audio: 'Audio',
    video: 'Video',
    '3d': '3D',
    science: 'Scientific data',
};

export function categoriesFor(kind: TimelineKind): readonly string[] {
    return kind === 'models' ? MODEL_CATEGORIES : kind === 'papers' ? PAPER_CATEGORIES : TOOL_GROUPS;
}

// ─── Formatting helpers used when normalising ──────────────────────────────

function paramLabel(m: ModelEntry): string {
    if (m.parameters == null) return m.category;
    if (m.parameter_unit === 'million') return `${m.parameters}M params`;
    return m.parameters >= 1000 ? `${+(m.parameters / 1000).toFixed(2)}T params` : `${m.parameters}B params`;
}

function uniqueSlugs<T extends { slug: string }>(items: T[]): T[] {
    const seen = new Map<string, number>();
    for (const it of items) {
        const n = seen.get(it.slug) ?? 0;
        seen.set(it.slug, n + 1);
        if (n > 0) it.slug = `${it.slug}-${n + 1}`;
    }
    return items;
}

function normaliseModels(models: ModelEntry[]): TimelineItem[] {
    return uniqueSlugs(
        [...models]
            .sort((a, b) => a.release_date.localeCompare(b.release_date))
            .map((m) => ({
                kind: 'models' as const,
                raw: m,
                id: m.id,
                slug: slugify(m.model_name),
                name: m.model_name,
                org: m.company,
                date: m.release_date,
                datePrecision: 'day' as const,
                category: m.category,
                openSource: m.open_source,
                meta: paramLabel(m),
                haystack: [m.model_name, m.company, m.model_type, m.category, m.model_family, m.description]
                    .join(' ')
                    .toLowerCase(),
            })),
    );
}

function normalisePapers(papers: PaperEntry[]): TimelineItem[] {
    return uniqueSlugs(
        [...papers]
            .sort((a, b) => a.publication_date.localeCompare(b.publication_date))
            .map((p) => ({
                kind: 'papers' as const,
                raw: p,
                id: p.id,
                slug: slugify(p.title).slice(0, 80),
                name: p.title,
                org: p.institution,
                date: p.publication_date,
                datePrecision: 'day' as const,
                category: p.category,
                openSource: null,
                meta: p.published_in || p.category,
                haystack: [p.title, p.institution, p.topic, p.category, p.authors.join(' '), p.description]
                    .join(' ')
                    .toLowerCase(),
            })),
    );
}

function normaliseTools(tools: ToolEntry[]): TimelineItem[] {
    return uniqueSlugs(
        [...tools]
            .sort((a, b) => a.release_date.localeCompare(b.release_date))
            .map((t) => ({
                kind: 'tools' as const,
                raw: t,
                id: t.id,
                slug: slugify(t.name),
                name: t.name,
                org: t.company,
                date: t.release_date,
                datePrecision: t.date_precision ?? 'day',
                category: t.group,
                openSource: t.open_source,
                meta: t.category,
                haystack: [t.name, t.company, t.category, t.group, t.description].join(' ').toLowerCase(),
            })),
    );
}

// ─── Loading (cached) ───────────────────────────────────────────────────────

const cache = new Map<TimelineKind, Promise<TimelineDataset>>();

export function loadTimeline(kind: TimelineKind): Promise<TimelineDataset> {
    const hit = cache.get(kind);
    if (hit) return hit;
    let p: Promise<TimelineDataset>;
    if (kind === 'models') {
        p = import('@/data/LLM_Timeline_Dataset.json').then((mod) => {
            const data = mod.default as unknown as { metadata: { last_updated: string }; models: ModelEntry[] };
            return { kind, items: normaliseModels(data.models), lastUpdated: data.metadata.last_updated };
        });
    } else if (kind === 'papers') {
        p = import('@/data/Research_Papers_Dataset.json').then((mod) => {
            const data = mod.default as unknown as { metadata: { last_updated: string }; papers: PaperEntry[] };
            return { kind, items: normalisePapers(data.papers), lastUpdated: data.metadata.last_updated };
        });
    } else {
        p = import('@/data/AI_Tools_Dataset.json').then((mod) => {
            const data = mod.default as unknown as { metadata: { last_updated: string }; tools: ToolEntry[] };
            return { kind, items: normaliseTools(data.tools), lastUpdated: data.metadata.last_updated };
        });
    }
    // Do not cache failures, so a later retry can succeed.
    p.catch(() => cache.delete(kind));
    cache.set(kind, p);
    return p;
}
