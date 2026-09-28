// Stage 8 — Test before release.

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { BenchmarkProgress } from '@/components/benchmarks/BenchmarkProgress';
import { METRIC_BY_ID, type MetricId } from '@/data/benchmarkData';
import { Block, CardGrid, Note, Sources, Tabs } from './TrainingKit';

const SHOWN: MetricId[] = ['mmlu', 'gpqa', 'swe', 'hle'];

export function StageEvaluation() {
    const [metric, setMetric] = useState<MetricId>('mmlu');
    const m = METRIC_BY_ID[metric];

    return (
        <>
            <Block title="What gets tested" intro="A modern release is checked in several different ways, because no single test captures what matters.">
                <CardGrid
                    min={220}
                    items={[
                        { tag: 'Capabilities', title: 'Benchmarks', body: 'Fixed question sets with automatic grading: expert science (GPQA), competition maths (AIME), real software bugs (SWE-bench), and very hard exams (Humanity’s Last Exam).' },
                        { tag: 'Preferences', title: 'Head-to-head ratings', body: 'People compare two anonymous answers and pick the better one. LMArena turns millions of such votes into a leaderboard.' },
                        { tag: 'Safety', title: 'Dangerous capabilities', body: 'Does the model give meaningful help with biological, chemical or cyber attacks? Can it act autonomously in risky ways? Results decide which safeguards are required.' },
                        { tag: 'Robustness', title: 'Red-teaming', body: 'Specialists try to break the model with jailbreaks and tricky prompts, looking for harmful, biased or false outputs.' },
                        { tag: 'Independence', title: 'External testing', body: 'Government bodies such as the UK AI Security Institute and the US Center for AI Standards and Innovation, and independent groups, test some models before launch.' },
                        { tag: 'Disclosure', title: 'System cards', body: 'Labs publish the results, known limitations and safeguards in a model card or system card alongside the release.' },
                    ]}
                />
            </Block>

            <Block
                title="Benchmarks wear out"
                intro="Each dot is a model’s reported score on its release date; the line tracks the best score so far. Tests that once seemed impossible get saturated within a few years, so the field keeps building harder ones."
                aside={<Tabs label="Benchmark" value={metric} onChange={setMetric} options={SHOWN.map((id) => ({ id, label: METRIC_BY_ID[id].name }))} />}
            >
                <div className="tk-panel">
                    <p className="ev-measures"><strong>{m.name}:</strong> {m.measures}</p>
                    <BenchmarkProgress metric={metric} openOnly={false} />
                    <p className="ev-status">{m.statusNote}</p>
                </div>
                <Link to="/benchmarks" className="btn btn-secondary btn-sm ev-cta">Explore every score and source in Module 04 →</Link>
            </Block>

            <Block title="Why a score can mislead">
                <div className="tk-two">
                    <Note title="Contamination">
                        If test questions (or their answers) end up in the training data, the model can memorise them. Labs try to filter
                        benchmarks out of training data, and newer tests keep their questions private.
                    </Note>
                    <Note title="Settings change results">
                        Scores depend on the prompt, how many attempts are allowed, whether tools are available and how long the model may
                        “think”. Two labs’ numbers for the same test are not always comparable.
                    </Note>
                    <Note title="Small differences are noise">
                        GPQA Diamond has 198 questions and AIME 30, so a gap of one or two points between models often means nothing.
                    </Note>
                    <Note title="Teaching to the test">
                        Once a benchmark becomes a target, development starts optimising for it. Real-world usefulness — reliability,
                        honesty, cost — is only partly visible in leaderboards.
                    </Note>
                </div>
                <Sources items={[
                    { label: 'UK AI Security Institute', url: 'https://www.aisi.gov.uk/' },
                    { label: 'LMArena', url: 'https://lmarena.ai/' },
                ]} />
            </Block>
            <style>{`
                .ev-measures { font-size: var(--text-sm); color: var(--secondary); line-height: var(--lead-body); }
                .ev-measures strong { color: var(--ink); }
                .ev-status { font-size: var(--text-xs); color: var(--muted); }
                .ev-cta { align-self: flex-start; }
            `}</style>
        </>
    );
}
