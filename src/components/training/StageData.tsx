// Stage 1 — Gather and clean the data.

import { useMemo, useState } from 'react';
import { Block, CardGrid, Note, Sources, Steps, Tabs } from './TrainingKit';

// Published training mixtures. Shares are of training tokens as reported in each paper.
type MixId = 'gpt3' | 'llama' | 'llama3';
const MIXES: Record<MixId, { label: string; model: string; tokens: string; note: string; parts: Array<{ name: string; pct: number }>; source: { label: string; url: string } }> = {
    gpt3: {
        label: 'GPT-3 (2020)',
        model: 'GPT-3, OpenAI',
        tokens: '300 billion tokens seen in training',
        note: 'Share of training batches drawn from each source. Smaller, higher-quality sources were sampled more often than their size alone would suggest.',
        parts: [
            { name: 'Common Crawl (filtered web)', pct: 60 },
            { name: 'WebText2 (linked web pages)', pct: 22 },
            { name: 'Books1', pct: 8 },
            { name: 'Books2', pct: 8 },
            { name: 'Wikipedia', pct: 3 },
        ],
        source: { label: 'Brown et al. 2020, Table 2.2', url: 'https://arxiv.org/abs/2005.14165' },
    },
    llama: {
        label: 'LLaMA (2023)',
        model: 'LLaMA, Meta',
        tokens: '1.4 trillion tokens (largest models)',
        note: 'Built entirely from publicly available data.',
        parts: [
            { name: 'Common Crawl (web)', pct: 67 },
            { name: 'C4 (cleaned web)', pct: 15 },
            { name: 'GitHub (code)', pct: 4.5 },
            { name: 'Wikipedia', pct: 4.5 },
            { name: 'Books', pct: 4.5 },
            { name: 'ArXiv + StackExchange', pct: 4.5 },
        ],
        source: { label: 'Touvron et al. 2023, Table 1', url: 'https://arxiv.org/abs/2302.13971' },
    },
    llama3: {
        label: 'Llama 3 (2024)',
        model: 'Llama 3, Meta',
        tokens: 'about 15 trillion tokens',
        note: 'Reported by content type rather than source. Meta used classifiers to down-weight over-represented web topics and chose the mix with small-scale experiments.',
        parts: [
            { name: 'General knowledge', pct: 50 },
            { name: 'Maths and reasoning', pct: 25 },
            { name: 'Code', pct: 17 },
            { name: 'Multilingual', pct: 8 },
        ],
        source: { label: 'Llama Team 2024, “The Llama 3 Herd of Models”', url: 'https://arxiv.org/abs/2407.21783' },
    },
};
// Categorical order is fixed; a sixth slice falls back to neutral grey.
const SLICE_COLORS = ['var(--viz-1)', 'var(--viz-2)', 'var(--viz-3)', 'var(--viz-4)', 'var(--viz-5)', 'var(--muted)'];

const DEDUP_LINES = [
    'The transformer architecture was introduced in 2017.',
    'Language models predict the next token in a sequence.',
    'The transformer architecture was introduced in 2017.',
    'BERT reads text in both directions during pre-training.',
    'the transformer architecture was introduced in 2017',
    'Language models predict the next token in a sequence.',
    'GPT models generate text from left to right.',
    'Language Models predict the next token in a sequence!',
];
const normalise = (s: string) => s.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, '').replace(/\s+/g, ' ').trim();
type DedupStage = 'raw' | 'exact' | 'near';

export function StageData() {
    const [mixId, setMixId] = useState<MixId>('llama');
    const mix = MIXES[mixId];
    const total = mix.parts.reduce((a, p) => a + p.pct, 0);

    return (
        <>
            <Block
                title="What goes into a real model"
                intro="Most labs no longer publish their data mixes, but a few did. These are the reported shares for three well-known models."
                aside={<Tabs label="Choose a model" value={mixId} onChange={setMixId} options={(Object.keys(MIXES) as MixId[]).map((id) => ({ id, label: MIXES[id].label }))} />}
            >
                <div className="tk-panel">
                    <div className="dm-meta">
                        <strong>{mix.model}</strong> · {mix.tokens}
                    </div>
                    <div className="dm-bar" role="img" aria-label={`${mix.model} training data mix: ${mix.parts.map((p) => `${p.name} ${p.pct}%`).join(', ')}`}>
                        {mix.parts.map((p, i) => (
                            <span key={p.name} style={{ flexGrow: p.pct / total, background: SLICE_COLORS[i] }} title={`${p.name}: ${p.pct}%`}>
                                {p.pct >= 8 && <em>{p.pct}%</em>}
                            </span>
                        ))}
                    </div>
                    <ul className="tk-legend" aria-hidden="true">
                        {mix.parts.map((p, i) => (
                            <span key={p.name}><i style={{ background: SLICE_COLORS[i] }} />{p.name} · {p.pct}%</span>
                        ))}
                    </ul>
                    <p className="dm-note">{mix.note}</p>
                    <Sources items={[mix.source]} />
                </div>
            </Block>

            <Block
                title="From raw web pages to training text"
                intro="Web crawls are enormous but messy. A typical cleaning pipeline throws most of the raw text away. FineWeb, an open dataset built this way, turned 96 Common Crawl snapshots into 15 trillion tokens; its “educational” subset keeps just 1.3 trillion."
            >
                <Steps
                    items={[
                        { title: 'Extract text', text: 'Strip HTML, menus, adverts and boilerplate from each page.' },
                        { title: 'Filter by language & URL', text: 'Keep target languages; drop known spam, adult and malware domains.' },
                        { title: 'Score quality', text: 'Heuristics and classifier models remove gibberish, lists and low-value pages.' },
                        { title: 'Remove duplicates', text: 'Exact and near-duplicate pages are dropped so the model does not memorise them.' },
                        { title: 'Scrub personal data', text: 'Mask emails, phone numbers and similar identifiers.' },
                        { title: 'Mix & document', text: 'Balance sources and topics, hold out test data, and record what was used.' },
                    ]}
                />
                <Sources items={[{ label: 'Penedo et al. 2024, “The FineWeb Datasets”', url: 'https://arxiv.org/abs/2406.17557' }]} />
            </Block>

            <DedupDemo />

            <Block title="How ideas about data changed" intro="The field moved from “as much text as possible” to “the best text we can find or make”.">
                <CardGrid
                    items={[
                        { tag: '2019', title: 'Let people vote', meta: 'GPT-2 · WebText', body: 'Used pages linked from Reddit posts with at least 3 karma as a cheap signal of quality.' },
                        { tag: '2020', title: 'Filter the whole web', meta: 'GPT-3 · filtered Common Crawl', body: 'Trained a classifier to keep web pages that resemble high-quality reference text, then removed near-duplicates.' },
                        { tag: '2023', title: 'Textbook-quality data', meta: 'Phi-1 · Microsoft', body: 'Showed that a small model trained on carefully chosen and synthetic “textbook” data can rival much larger ones on coding tests.' },
                        { tag: '2024', title: 'Models judge the data', meta: 'FineWeb-Edu · Llama 3', body: 'Existing language models rate pages for educational value, and those ratings train fast filters for trillions of tokens.' },
                    ]}
                />
            </Block>

            <Note tone="caveat" title="Permission, privacy and the law">
                <p>
                    Whether training on copyrighted work without permission is legal is still being argued in courts around the world.
                    In July 2026 a US court gave final approval to a <strong>$1.5 billion settlement</strong> in <em>Bartz v. Anthropic</em>,
                    over roughly 500,000 books downloaded from pirate sites. Many sites now block AI crawlers in their robots.txt file,
                    and data teams also have to remove personal information.
                </p>
                <Sources items={[{ label: 'Authors Guild — final approval of the Anthropic settlement', url: 'https://authorsguild.org/news/court-grants-final-approval-anthropic-copyright-settlement/' }]} />
            </Note>
            <style>{`
                .dm-meta { font-size: var(--text-sm); color: var(--secondary); }
                .dm-meta strong { color: var(--ink); }
                .dm-bar { display: flex; gap: 2px; height: 36px; border-radius: 4px; overflow: hidden; }
                .dm-bar span { display: flex; align-items: center; padding-left: 8px; min-width: 3px; transition: flex-grow var(--dur-base) var(--ease-out); }
                .dm-bar em { font-style: normal; font-family: var(--font-mono); font-size: var(--text-2xs); color: var(--viz-on-fill); font-weight: var(--weight-semibold); }
                .dm-note { font-size: var(--text-xs); color: var(--muted); max-width: 80ch; }
            `}</style>
        </>
    );
}

function DedupDemo() {
    const [stage, setStage] = useState<DedupStage>('raw');
    const rows = useMemo(() => {
        const seenExact = new Set<string>();
        const seenNear = new Set<string>();
        return DEDUP_LINES.map((text) => {
            const exactDup = seenExact.has(text);
            seenExact.add(text);
            const key = normalise(text);
            const nearDup = !exactDup && seenNear.has(key);
            seenNear.add(key);
            return { text, exactDup, nearDup };
        });
    }, []);
    const removed = rows.filter((r) => r.exactDup || (stage === 'near' && r.nearDup)).length;
    const kept = stage === 'raw' ? rows.length : rows.length - removed;

    return (
        <Block
            title="Try it: remove duplicates"
            intro="Repeated text wastes compute and makes models memorise passages word for word. Exact matches are easy to catch; near-duplicates — the same sentence with different capitals or punctuation — need fuzzier matching (at web scale, techniques like MinHash)."
            aside={
                <Tabs
                    label="Deduplication stage"
                    value={stage}
                    onChange={setStage}
                    options={[{ id: 'raw', label: 'Raw' }, { id: 'exact', label: 'Remove exact' }, { id: 'near', label: '+ near-duplicates' }]}
                />
            }
        >
            <div className="tk-panel">
                <ol className="dd-list">
                    {rows.map((r, i) => {
                        const gone = stage !== 'raw' && (r.exactDup || (stage === 'near' && r.nearDup));
                        const flag = r.exactDup ? 'exact duplicate' : r.nearDup ? 'near-duplicate' : null;
                        return (
                            <li key={i} className={gone ? 'is-gone' : ''}>
                                <span className="tk-mono">{r.text}</span>
                                {flag && stage !== 'raw' && (gone || stage === 'exact') && <span className="chip">{gone ? `removed · ${flag}` : `kept · ${flag}`}</span>}
                            </li>
                        );
                    })}
                </ol>
                <p className="dd-sum">
                    {stage === 'raw'
                        ? `${rows.length} lines, several repeated.`
                        : `${kept} of ${rows.length} lines kept — ${Math.round((1 - kept / rows.length) * 100)}% removed.`}
                </p>
            </div>
            <style>{`
                .dd-list { list-style: none; display: flex; flex-direction: column; gap: 4px; }
                .dd-list li { display: flex; justify-content: space-between; align-items: center; gap: var(--s3); padding: 6px 10px; border-radius: var(--r-sm); font-size: var(--text-xs); color: var(--primary); background: var(--bg-sunken); }
                .dd-list li.is-gone { opacity: 0.45; text-decoration: line-through; text-decoration-color: var(--muted); }
                .dd-list .chip { flex-shrink: 0; text-decoration: none; }
                .dd-sum { font-size: var(--text-sm); color: var(--ink); font-weight: var(--weight-medium); }
            `}</style>
        </Block>
    );
}
