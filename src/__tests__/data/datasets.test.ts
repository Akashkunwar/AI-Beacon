// Data integrity checks for the timeline datasets.
// Run with `npm test`. These catch the most common mistakes when adding or
// updating entries by hand: typos in dates, duplicate names, unknown
// categories, broken links, and homepage counts drifting out of sync.

import { describe, it, expect } from 'vitest';
import models from '@/data/LLM_Timeline_Dataset.json';
import papers from '@/data/Research_Papers_Dataset.json';
import tools from '@/data/AI_Tools_Dataset.json';
import { DATASET_META } from '@/data/datasetMeta';
import { MODEL_CATEGORIES, PAPER_CATEGORIES, TOOL_GROUPS, MODALITY_LABELS } from '@/data/timeline';
import { slugify } from '@/utils/timeline';

const ISO_DATE = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;
const today = new Date().toISOString().slice(0, 10);

function expectValidDate(date: string, label: string) {
    expect(date, `${label}: date must be YYYY-MM-DD`).toMatch(ISO_DATE);
    expect(Number.isNaN(new Date(date).getTime()), `${label}: invalid calendar date`).toBe(false);
    expect(date <= today, `${label}: date ${date} is in the future`).toBe(true);
}

function expectUrl(url: string | null | undefined, label: string) {
    if (url == null) return;
    expect(url, `${label}: links must be absolute http(s) URLs`).toMatch(/^https?:\/\/[^\s]+\.[^\s]+/);
    expect(url, `${label}: placeholder link`).not.toMatch(/XXXX|example\.com|^https:\/\/arxiv\.org\/?$/);
}

function expectUnique(values: string[], label: string) {
    const seen = new Set<string>();
    const dups = values.filter((v) => (seen.has(v) ? true : (seen.add(v), false)));
    expect(dups, `${label}: duplicates found`).toEqual([]);
}

describe('LLM_Timeline_Dataset.json', () => {
    const list = models.models;

    it('matches the homepage summary', () => {
        expect(list.length).toBe(DATASET_META.models);
        expect(models.metadata.total_models).toBe(list.length);
    });

    it('has unique ids and names', () => {
        expectUnique(list.map((m) => String(m.id)), 'model ids');
        expectUnique(list.map((m) => slugify(m.model_name)), 'model names');
    });

    it('has valid, required fields', () => {
        const cats = new Set<string>(MODEL_CATEGORIES);
        const mods = new Set(Object.keys(MODALITY_LABELS));
        for (const m of list) {
            const label = `model "${m.model_name}"`;
            expect(m.model_name.trim(), label).not.toBe('');
            expect(m.company.trim(), `${label}: company`).not.toBe('');
            expect(m.description.length, `${label}: description too short`).toBeGreaterThan(20);
            expectValidDate(m.release_date, label);
            expect(cats.has(m.category), `${label}: unknown category "${m.category}"`).toBe(true);
            expect(m.modalities.length, `${label}: needs at least one modality`).toBeGreaterThan(0);
            for (const x of m.modalities) expect(mods.has(x), `${label}: unknown modality "${x}"`).toBe(true);
            expect(typeof m.open_source, `${label}: open_source`).toBe('boolean');
            if (m.parameters != null) expect(m.parameter_unit, `${label}: parameters need a unit`).toMatch(/^(million|billion)$/);
            if (m.context_window_tokens != null) expect(m.context_window_tokens, `${label}: context`).toBeGreaterThan(0);
            if (m.training_data_cutoff) {
                expect(m.training_data_cutoff, `${label}: cutoff must be YYYY-MM`).toMatch(/^\d{4}-(0[1-9]|1[0-2])$/);
                expect(m.training_data_cutoff <= m.release_date.slice(0, 7), `${label}: cutoff after release`).toBe(true);
            }
            const p = m.pricing_per_1m_tokens;
            if (p.input != null || p.output != null) {
                expect(p.input != null && p.output != null, `${label}: give both input and output price`).toBe(true);
            }
            expectUrl(m.official_model_link, label);
            expectUrl(m.huggingface_url, label);
            expectUrl(m.paper_url, label);
        }
    });

    it('is sorted by date with sequential ids', () => {
        for (let i = 1; i < list.length; i++) {
            expect(list[i - 1].release_date <= list[i].release_date, `order at ${list[i].model_name}`).toBe(true);
            expect(list[i].id).toBe(i + 1);
        }
    });
});

describe('Research_Papers_Dataset.json', () => {
    const list = papers.papers;

    it('matches the homepage summary', () => {
        expect(list.length).toBe(DATASET_META.papers);
        expect(papers.metadata.total_papers).toBe(list.length);
    });

    it('has unique titles and valid fields', () => {
        expectUnique(list.map((p) => slugify(p.title)), 'paper titles');
        const cats = new Set<string>(PAPER_CATEGORIES);
        for (const p of list) {
            const label = `paper "${p.title}"`;
            expectValidDate(p.publication_date, label);
            expect(cats.has(p.category), `${label}: unknown category "${p.category}"`).toBe(true);
            expect(p.institution.trim(), `${label}: institution`).not.toBe('');
            expect(p.paper_url, `${label}: every paper needs a link`).toBeTruthy();
            expectUrl(p.paper_url, label);
            expectUrl(p.code_url, label);
        }
    });
});

describe('AI_Tools_Dataset.json', () => {
    const list = tools.tools;

    it('matches the homepage summary', () => {
        expect(list.length).toBe(DATASET_META.tools);
        expect(tools.metadata.total_tools).toBe(list.length);
    });

    it('has unique names and valid fields', () => {
        expectUnique(list.map((t) => slugify(t.name)), 'tool names');
        const groups = new Set<string>(TOOL_GROUPS);
        for (const t of list) {
            const label = `tool "${t.name}"`;
            expectValidDate(t.release_date, label);
            expect(groups.has(t.group), `${label}: unknown group "${t.group}"`).toBe(true);
            expect(typeof t.open_source, `${label}: open_source`).toBe('boolean');
            expectUrl(t.url, label);
        }
    });
});

describe('datasetMeta', () => {
    it('uses the most recent review date of the three datasets', () => {
        const latest = [models.metadata.last_updated, papers.metadata.last_updated, tools.metadata.last_updated].sort().at(-1);
        expect(DATASET_META.lastUpdated).toBe(latest);
    });
});
