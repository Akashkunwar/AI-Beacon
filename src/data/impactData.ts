/**
 * AI Impact Index — data for the "AI & Jobs" module.
 *
 * Two kinds of content live here and must never be mixed up:
 *
 * 1. EVIDENCE — figures quoted from published studies. Each has a source link
 *    and year; quote them exactly as published.
 * 2. SCENARIO — the sector "exposure index" is an editorial, illustrative
 *    estimate (0–100) synthesised from the evidence patterns below (clerical,
 *    software and customer-facing text work most exposed; physical work least).
 *    It is NOT a measurement or forecast, and the UI must always say so.
 */

export const IMPACT_LAST_UPDATED = '2026-09-28';

// ─── 1. Evidence ─────────────────────────────────────────────────────────────

export type EvidenceKind = 'exposure' | 'jobs' | 'observed' | 'productivity';

export interface Evidence {
    id: string;
    kind: EvidenceKind;
    figure: string;
    claim: string;
    detail: string;
    source: string;
    title: string;
    year: number;
    url: string;
}

export const EVIDENCE_GROUPS: Array<{ kind: EvidenceKind; title: string; intro: string }> = [
    {
        kind: 'exposure',
        title: 'How much work is exposed?',
        intro: '“Exposed” means AI could perform or speed up some of a job’s tasks. It does not mean the job disappears.',
    },
    {
        kind: 'jobs',
        title: 'What happens to the number of jobs?',
        intro: 'Projections combine surveys and models. They depend heavily on assumptions and include many drivers besides AI.',
    },
    {
        kind: 'observed',
        title: 'What has actually happened so far?',
        intro: 'Measured effects, from payroll data and real usage — the best check on predictions.',
    },
    {
        kind: 'productivity',
        title: 'Does AI make workers more productive?',
        intro: 'Controlled studies show large gains in some settings and none — or losses — in others.',
    },
];

export const EVIDENCE: Evidence[] = [
    {
        id: 'ilo-2025', kind: 'exposure', figure: '25%',
        claim: 'of global employment is in occupations with some exposure to generative AI.',
        detail: 'Only 3.3% of jobs fall in the highest-exposure group. Exposure is far higher in high-income countries (34% of jobs) than low-income ones (11%), clerical work is the most exposed, and women are more exposed than men. The ILO concludes that transforming jobs is more likely than replacing them.',
        source: 'International Labour Organization', title: 'Generative AI and Jobs: A Refined Global Index of Occupational Exposure (Working Paper 140)', year: 2025,
        url: 'https://www.ilo.org/publications/generative-ai-and-jobs-refined-global-index-occupational-exposure',
    },
    {
        id: 'imf-2024', kind: 'exposure', figure: '≈40%',
        claim: 'of global employment is exposed to AI — about 60% in advanced economies and 26% in low-income countries.',
        detail: 'The IMF estimates that roughly half of exposed jobs could benefit from AI complementing workers, while the other half may see lower labour demand. It warns AI could widen inequality without policy responses.',
        source: 'International Monetary Fund', title: 'Gen-AI: Artificial Intelligence and the Future of Work (SDN/2024/001)', year: 2024,
        url: 'https://www.imf.org/en/publications/staff-discussion-notes/issues/2024/01/14/gen-ai-artificial-intelligence-and-the-future-of-work-542379',
    },
    {
        id: 'eloundou-2023', kind: 'exposure', figure: '80%',
        claim: 'of US workers could have at least 10% of their tasks affected by large language models.',
        detail: 'About 19% of workers could see at least half of their tasks affected. Higher-wage occupations were generally more exposed — the opposite of earlier automation waves.',
        source: 'Eloundou, Manning, Mishkin & Rock (OpenAI / University of Pennsylvania)', title: 'GPTs are GPTs: An Early Look at the Labor Market Impact Potential of Large Language Models', year: 2023,
        url: 'https://arxiv.org/abs/2303.10130',
    },
    {
        id: 'goldman-2023', kind: 'jobs', figure: '300M',
        claim: 'full-time-job equivalents worldwide could be exposed to automation by generative AI.',
        detail: 'Goldman Sachs economists also estimated generative AI could raise global GDP by about 7% over ten years, and noted that most exposed jobs are more likely to be complemented than substituted.',
        source: 'Goldman Sachs Research', title: 'The Potentially Large Effects of Artificial Intelligence on Economic Growth', year: 2023,
        url: 'https://www.goldmansachs.com/insights/articles/generative-ai-could-raise-global-gdp-by-7-percent',
    },
    {
        id: 'wef-2025', kind: 'jobs', figure: '+78M',
        claim: 'net new jobs by 2030 in employers’ expectations: 170 million created and 92 million displaced.',
        detail: 'A survey of 1,000+ employers across 55 economies. The churn (22% of jobs) is driven by technology, the green transition, demographics and economics together — not AI alone. Employers expect 39% of workers’ core skills to change by 2030.',
        source: 'World Economic Forum', title: 'The Future of Jobs Report 2025', year: 2025,
        url: 'https://www.weforum.org/publications/the-future-of-jobs-report-2025/',
    },
    {
        id: 'mckinsey-2023', kind: 'jobs', figure: '30%',
        claim: 'of hours worked in the US could be automated by 2030, accelerated by generative AI (midpoint scenario).',
        detail: 'McKinsey expects the largest shifts in office support, customer service and food service, and estimates up to 12 million US occupational transitions may be needed by 2030.',
        source: 'McKinsey Global Institute', title: 'Generative AI and the Future of Work in America', year: 2023,
        url: 'https://www.mckinsey.com/mgi/our-research/generative-ai-and-the-future-of-work-in-america',
    },
    {
        id: 'stanford-canaries', kind: 'observed', figure: '−13%',
        claim: 'relative employment for 22–25-year-olds in the most AI-exposed occupations since late 2022.',
        detail: 'Using US payroll data, the Stanford Digital Economy Lab found early-career workers in exposed jobs (e.g. software developers, customer service) lost ground while older workers in the same jobs did not. Its August 2026 update found no widespread displacement overall, but the gap for young workers had widened to about 19%.',
        source: 'Brynjolfsson, Chandar & Chen (Stanford Digital Economy Lab)', title: 'Canaries in the Coal Mine? Six Facts about the Recent Employment Effects of Artificial Intelligence', year: 2025,
        url: 'https://digitaleconomy.stanford.edu/publication/canaries-in-the-coal-mine-six-facts-about-the-recent-employment-effects-of-artificial-intelligence/',
    },
    {
        id: 'anthropic-index-2026', kind: 'observed', figure: '49%',
        claim: 'of occupations had at least a quarter of their tasks carried out with Claude in Anthropic’s usage data.',
        detail: 'In the November 2025 sample, 52% of conversations augmented human work (collaborating, learning, iterating) and 45% automated it. Coding remained the largest use, and usage was concentrated in mid-to-high-wage occupations.',
        source: 'Anthropic Economic Index', title: 'Anthropic Economic Index report: Economic primitives (January 2026)', year: 2026,
        url: 'https://www.anthropic.com/research/anthropic-economic-index-january-2026-report',
    },
    {
        id: 'ai-index-2025', kind: 'observed', figure: '78%',
        claim: 'of organisations reported using AI in 2024, up from 55% a year earlier.',
        detail: 'Adoption is broad but often shallow: many firms report use in a few functions, and measured financial impact is still modest for most.',
        source: 'Stanford HAI', title: 'AI Index Report 2025', year: 2025,
        url: 'https://hai.stanford.edu/ai-index/2025-ai-index-report',
    },
    {
        id: 'brynjolfsson-2023', kind: 'productivity', figure: '+14%',
        claim: 'more customer-support issues resolved per hour when agents used an AI assistant.',
        detail: 'Novice and low-skilled agents improved by about 34%, while the most experienced saw little gain — AI spread the know-how of top performers.',
        source: 'Brynjolfsson, Li & Raymond (NBER; Quarterly Journal of Economics)', title: 'Generative AI at Work', year: 2023,
        url: 'https://www.nber.org/papers/w31161',
    },
    {
        id: 'metr-2025', kind: 'productivity', figure: '−19%',
        claim: 'slower: experienced open-source developers took longer to finish real tasks when allowed to use early-2025 AI tools.',
        detail: 'In this randomised trial, developers expected AI to speed them up by 24% and still believed afterwards it had helped. Results depend on task, codebase familiarity and tool maturity.',
        source: 'METR', title: 'Measuring the Impact of Early-2025 AI on Experienced Open-Source Developer Productivity', year: 2025,
        url: 'https://arxiv.org/abs/2507.09089',
    },
];

/** Why exposure estimates range from 25% to 80%: they count different things. */
export const EXPOSURE_DEFINITIONS = [
    { study: 'ILO (2025)', figure: '25% of global jobs', counts: 'Occupations where GenAI could automate a meaningful share of tasks, weighted by worker surveys and expert review.', scope: 'World' },
    { study: 'IMF (2024)', figure: '≈40% of global jobs', counts: 'Occupations with high exposure to AI in general (not only generative AI), before considering complementarity.', scope: 'World' },
    { study: 'Eloundou et al. (2023)', figure: '80% of US workers', counts: 'Workers with at least 10% of tasks where an LLM could cut completion time by half or more.', scope: 'United States' },
    { study: 'Goldman Sachs (2023)', figure: '300M full-time equivalents', counts: 'Share of work tasks automatable, converted into an equivalent number of full-time jobs.', scope: 'World' },
];

// ─── 2. Scenario explorer (illustrative) ────────────────────────────────────

export const SCENARIO_YEARS = [2022, 2024, 2026, 2028, 2030] as const;
export const SCENARIO_FIRST = 2022;
export const SCENARIO_LAST = 2030;
/** Years after this are projections */
export const SCENARIO_NOW = 2026;

export interface SectorScenario {
    id: string;
    label: string;
    /** Illustrative exposure index at each SCENARIO_YEARS point (0–100) */
    index: [number, number, number, number, number];
    aiDoes: string;
    staysHuman: string;
    examples: string[];
}

export const SECTORS: SectorScenario[] = [
    { id: 'software', label: 'Software engineering', index: [15, 45, 75, 83, 88], aiDoes: 'Writes and reviews code, fixes bugs, runs tests, and completes multi-file changes as an agent.', staysHuman: 'Deciding what to build, system design, security review, and owning production.', examples: ['Coding agents', 'AI code review', 'Test generation'] },
    { id: 'customer-service', label: 'Customer service', index: [15, 40, 70, 78, 83], aiDoes: 'Answers routine questions, drafts replies, routes tickets and handles simple account changes.', staysHuman: 'Complex, emotional or high-stakes cases and exceptions to policy.', examples: ['Support agents', 'Voice assistants', 'Reply drafting'] },
    { id: 'accounting', label: 'Accounting & bookkeeping', index: [15, 38, 65, 73, 78], aiDoes: 'Categorises transactions, reconciles accounts, extracts data from documents and drafts reports.', staysHuman: 'Judgement on estimates, audit sign-off, advising clients and regulators.', examples: ['Document extraction', 'Reconciliation', 'Anomaly detection'] },
    { id: 'marketing', label: 'Marketing & advertising', index: [12, 40, 62, 70, 75], aiDoes: 'Drafts copy and visuals, generates variants for testing and summarises campaign results.', staysHuman: 'Brand strategy, taste, client relationships and accountability for claims.', examples: ['Copy generation', 'Image generation', 'Campaign analytics'] },
    { id: 'finance', label: 'Finance & banking', index: [12, 32, 58, 66, 72], aiDoes: 'Summarises filings, drafts research, screens for fraud and automates document-heavy operations.', staysHuman: 'Investment decisions, risk ownership, client trust and regulatory responsibility.', examples: ['Research assistants', 'Fraud models', 'KYC document checks'] },
    { id: 'legal', label: 'Legal', index: [8, 30, 55, 63, 70], aiDoes: 'Searches case law, reviews and compares contracts, and drafts first versions of standard documents.', staysHuman: 'Legal strategy, advocacy, negotiation and professional liability — AI citations must be checked.', examples: ['Contract review', 'Legal research', 'e-Discovery'] },
    { id: 'creative', label: 'Creative & design', index: [10, 38, 55, 62, 68], aiDoes: 'Generates concepts, images, video, music and layout options; speeds up editing.', staysHuman: 'Creative direction, originality, client briefs and final judgement of quality.', examples: ['Image and video models', 'Design assistants'] },
    { id: 'journalism', label: 'Journalism & media', index: [8, 32, 55, 62, 67], aiDoes: 'Transcribes, summarises, translates and drafts routine stories such as earnings or sports results.', staysHuman: 'Reporting, sourcing, verification, investigation and editorial ethics.', examples: ['Transcription', 'Summarisation', 'Translation'] },
    { id: 'cybersecurity', label: 'Cybersecurity', index: [10, 28, 55, 64, 70], aiDoes: 'Triages alerts, explains malware, and — with frontier models — finds and helps fix vulnerabilities.', staysHuman: 'Validation, incident command and decisions with legal or business consequences.', examples: ['Alert triage', 'Vulnerability discovery'] },
    { id: 'hr', label: 'HR & recruiting', index: [10, 30, 52, 60, 66], aiDoes: 'Drafts job ads, screens applications, answers policy questions and schedules interviews.', staysHuman: 'Hiring decisions, employee relations and fairness oversight (often regulated).', examples: ['Screening tools', 'HR assistants'] },
    { id: 'research', label: 'Scientific research', index: [6, 22, 45, 56, 64], aiDoes: 'Searches literature, writes analysis code, proposes hypotheses and predicts structures.', staysHuman: 'Choosing questions, running experiments, interpreting results and peer review.', examples: ['Literature agents', 'AlphaFold-style models'] },
    { id: 'education', label: 'Education', index: [5, 22, 42, 50, 56], aiDoes: 'Tutors students, generates practice material and helps with marking and admin.', staysHuman: 'Motivation, classroom management, care and judgement about each learner.', examples: ['AI tutors', 'Lesson planning'] },
    { id: 'real-estate', label: 'Real estate', index: [6, 20, 40, 47, 53], aiDoes: 'Writes listings, estimates values, answers buyer questions and processes paperwork.', staysHuman: 'Viewings, negotiation and trust-based relationships.', examples: ['Valuation models', 'Listing assistants'] },
    { id: 'healthcare', label: 'Healthcare', index: [5, 16, 35, 43, 50], aiDoes: 'Takes clinical notes, codes and bills, drafts patient messages and supports image reading.', staysHuman: 'Diagnosis and treatment decisions, physical care and patient relationships.', examples: ['Ambient scribes', 'Imaging support'] },
    { id: 'retail', label: 'Retail & e-commerce', index: [8, 18, 35, 42, 48], aiDoes: 'Powers product search, recommendations, demand forecasting and online support.', staysHuman: 'In-store service, merchandising and most physical logistics.', examples: ['Recommendation systems', 'Shopping assistants'] },
    { id: 'manufacturing', label: 'Manufacturing', index: [6, 12, 25, 31, 37], aiDoes: 'Visual inspection, predictive maintenance, scheduling and documentation.', staysHuman: 'Most hands-on production work — robotics adoption is slower and capital-intensive.', examples: ['Visual inspection', 'Predictive maintenance'] },
    { id: 'transport', label: 'Transport & logistics', index: [5, 10, 20, 26, 32], aiDoes: 'Route optimisation, dispatch, paperwork and limited autonomous driving in some cities.', staysHuman: 'Most driving, loading and delivery; autonomy remains geographically limited.', examples: ['Routing', 'Robotaxi pilots'] },
    { id: 'agriculture', label: 'Agriculture', index: [3, 7, 15, 20, 25], aiDoes: 'Crop monitoring from imagery, yield forecasts and precision spraying.', staysHuman: 'Nearly all fieldwork, animal care and farm management.', examples: ['Satellite monitoring', 'Precision agriculture'] },
];

/** Linear interpolation of a sector's index for any (fractional) year. */
export function sectorIndexAt(sector: SectorScenario, year: number): number {
    const ys = SCENARIO_YEARS;
    if (year <= ys[0]) return sector.index[0];
    if (year >= ys[ys.length - 1]) return sector.index[ys.length - 1];
    for (let i = 0; i < ys.length - 1; i++) {
        if (year >= ys[i] && year <= ys[i + 1]) {
            const t = (year - ys[i]) / (ys[i + 1] - ys[i]);
            return sector.index[i] + (sector.index[i + 1] - sector.index[i]) * t;
        }
    }
    return sector.index[0];
}

// ─── 3. Milestones (facts, plus clearly labelled scenario years) ────────────

export const MILESTONES: Array<{ year: number; projection: boolean; items: string[] }> = [
    { year: 2022, projection: false, items: ['GitHub Copilot becomes generally available (June)', 'Stable Diffusion released with open weights (August)', 'ChatGPT launches (November 30)'] },
    { year: 2023, projection: false, items: ['GPT-4 launches (March)', 'Llama 2 released with open weights (July)', 'EU institutions reach political agreement on the AI Act (December)'] },
    { year: 2024, projection: false, items: ['GPT-4o brings real-time voice and vision (May)', 'EU AI Act enters into force (August 1)', 'OpenAI o1 introduces reasoning models (September)'] },
    { year: 2025, projection: false, items: ['DeepSeek-R1: open-weights reasoning model (January)', 'Coding agents go mainstream: Claude Code, Codex, Jules', 'EU AI Act obligations for general-purpose AI apply (August 2)', 'GPT-5 (August) and Gemini 3 (November)'] },
    { year: 2026, projection: false, items: ['Claude Mythos Preview and Project Glasswing: AI finds thousands of software vulnerabilities (April)', 'DeepSeek V4 releases open weights at 1M-token context (April)', 'Claude Fable 5 (June) and GPT-6 Astra (September) push the frontier'] },
    { year: 2028, projection: true, items: ['Scenario: agents handle more multi-step digital work under human supervision', 'Open question: how quickly employers redesign roles and training'] },
    { year: 2030, projection: true, items: ['WEF employer expectations: 170M jobs created and 92M displaced across all drivers', 'McKinsey midpoint: up to 30% of US work hours automated'] },
];
