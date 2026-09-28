// src/config/modules.ts
// Single registry of the learning modules. Nav, Home, Footer and the 404 page
// all read from here so names, numbers, routes and descriptions never drift.

export interface ModuleInfo {
    /** Stable key */
    id: 'timeline' | 'simulator' | 'training' | 'benchmarks' | 'impact';
    /** Display number, e.g. "01" */
    num: string;
    /** Full title */
    title: string;
    /** Short label for the navigation bar */
    navLabel: string;
    route: string;
    /** One-line description of what the page is */
    summary: string;
    /** What a first-time visitor will learn or be able to do */
    learn: string;
    /** Rough time to explore */
    time: string;
}

export const MODULES: readonly ModuleInfo[] = [
    {
        id: 'timeline',
        num: '01',
        title: 'AI Timeline',
        navLabel: 'Timeline',
        route: '/timeline',
        summary: 'Every notable AI model, research paper and developer tool since 2012, on one zoomable timeline.',
        learn: 'See who released what and when, filter by company or type, and open any entry for specs and sources.',
        time: '5–15 min',
    },
    {
        id: 'simulator',
        num: '02',
        title: 'How LLMs Work',
        navLabel: 'How LLMs Work',
        route: '/transformer-simulator',
        summary: 'Type a sentence and step through a real (tiny) transformer, from tokens to the next predicted word.',
        learn: 'Tokenization, embeddings, attention, feed-forward layers and sampling — with the actual numbers.',
        time: '10–20 min',
    },
    {
        id: 'training',
        num: '03',
        title: 'How AI Is Trained',
        navLabel: 'How AI Is Trained',
        route: '/transformer-training-simulator',
        summary: 'The ten stages that turn raw text into a deployed assistant, each with an interactive demo.',
        learn: 'Data, tokenizers, pre-training, fine-tuning, RLHF/DPO, evaluation, inference and deployment.',
        time: '20–40 min',
    },
    {
        id: 'benchmarks',
        num: '04',
        title: 'Benchmarks',
        navLabel: 'Benchmarks',
        route: '/benchmarks',
        summary: 'Compare leading models on the tests labs actually report today, plus price — every number linked to its source.',
        learn: 'What GPQA, SWE-bench, AIME and Humanity’s Last Exam measure, and why a score is not "intelligence".',
        time: '5–10 min',
    },
    {
        id: 'impact',
        num: '05',
        title: 'AI Impact Index',
        navLabel: 'AI & Jobs',
        route: '/automation-clock',
        summary: 'How exposed different kinds of work are to AI — the published evidence, and an illustrative scenario explorer.',
        learn: 'The difference between task exposure and job loss, and what major studies (ILO, IMF, WEF…) actually found.',
        time: '5–10 min',
    },
] as const;

export function getModule(id: ModuleInfo['id']): ModuleInfo {
    const m = MODULES.find((x) => x.id === id);
    if (!m) throw new Error(`Unknown module ${id}`);
    return m;
}
