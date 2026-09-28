// src/components/pipeline/PositionalEncodingStep.tsx
// Step 5: add a sine/cosine position signal to every token vector.

import { useMemo, useState } from 'react';
import { useSimulatorStore } from '@/lib/store/simulatorStore';
import { PipelineStep } from '@/lib/store/types';
import { Advanced, Callout, Formula, MatrixGrid, Panel, Shapes, StepFrame, TokenPicker, tokenText } from './StepKit';

export function PositionalEncodingStep() {
    const raw = useSimulatorStore((s) => s.tensors.tokens?.raw) ?? [];
    const embed = useSimulatorStore((s) => s.tensors.embed);
    const posenc = useSimulatorStore((s) => s.tensors.posenc);
    const dModel = useSimulatorStore((s) => s.config.dModel);
    const [pick, setPick] = useState(0);

    const mats = useMemo(() => ({
        X: embed?.X.toMatrix() ?? [],
        PE: posenc?.PE.toMatrix() ?? [],
        Xp: posenc?.X_pos.toMatrix() ?? [],
    }), [embed, posenc]);
    if (!embed || !posenc) return null;

    const row = Math.min(pick, raw.length - 1);
    const max = Math.max(1e-6, ...mats.Xp.flat().map(Math.abs), ...mats.PE.flat().map(Math.abs));

    return (
        <StepFrame
            step={PipelineStep.POSITIONAL_ENCODING}
            lede="So far “dog bites man” and “man bites dog” would look the same to the model: same tokens, same vectors. This step adds a position signal to each vector, so the model can tell first from second from third."
        >
            <Panel title="The position signal" meta="one row per position">
                <PEWaves n={raw.length} dModel={dModel} />
                <MatrixGrid
                    rows={mats.PE}
                    rowLabels={raw.map((_, i) => `position ${i}`)}
                    scale="signed"
                    maxAbs={1}
                    ariaLabel="Positional encoding values for each position"
                />
            </Panel>

            <Panel title="Token vector + position signal = input to the transformer">
                <TokenPicker tokens={raw.map(tokenText)} value={row} onChange={setPick} />
                <div className="pe-sum">
                    <div>
                        <p className="field-label">Embedding of “{tokenText(raw[row])}”</p>
                        <MatrixGrid rows={[mats.X[row]]} rowLabels={['X']} scale="signed" maxAbs={max} ariaLabel="Embedding vector" />
                    </div>
                    <div>
                        <p className="field-label">+ position {row} signal</p>
                        <MatrixGrid rows={[mats.PE[row]]} rowLabels={['PE']} scale="signed" maxAbs={max} ariaLabel="Position vector" />
                    </div>
                    <div>
                        <p className="field-label">= what the transformer receives</p>
                        <MatrixGrid rows={[mats.Xp[row]]} rowLabels={['X + PE']} scale="signed" maxAbs={max} ariaLabel="Sum vector" />
                    </div>
                </div>
                <Shapes items={[{ name: 'PE', shape: posenc.PE.shape }, { name: 'X_pos', shape: posenc.X_pos.shape }]} />
            </Panel>

            <Callout title="Why waves?">
                Each pair of numbers follows a sine and cosine wave at a different speed: the first pair changes quickly from one
                position to the next, later pairs change slowly. Together they give every position a unique pattern — like the
                hands of a clock — and nearby positions get similar patterns.
            </Callout>
            <Advanced>
                <Formula caption="The formula from “Attention Is All You Need” (2017). i indexes pairs of dimensions.">
{`PE(pos, 2i)   = sin(pos / 10000^(2i / d_model))
PE(pos, 2i+1) = cos(pos / 10000^(2i / d_model))
X_pos = X + PE`}
                </Formula>
            </Advanced>
            <style>{`.pe-sum { display: flex; flex-direction: column; gap: var(--s3); } .pe-sum .field-label { display: block; margin-bottom: 4px; }`}</style>
        </StepFrame>
    );
}

// Sine/cosine curves for the first four dimensions, with dots at each token position.
function PEWaves({ n, dModel }: { n: number; dModel: number }) {
    const W = 560, H = 120, padL = 8, padR = 8, padT = 10, padB = 20;
    const dims = [0, 1, 2, 3].filter((d) => d < dModel);
    const colors = ['var(--viz-1)', 'var(--viz-2)', 'var(--viz-3)', 'var(--viz-4)'];
    const span = Math.max(n - 1, 1);
    const x = (pos: number) => padL + (pos / span) * (W - padL - padR);
    const y = (v: number) => padT + (1 - (v + 1) / 2) * (H - padT - padB);
    const val = (pos: number, d: number) => {
        const angle = pos / Math.pow(10000, (2 * Math.floor(d / 2)) / dModel);
        return d % 2 === 0 ? Math.sin(angle) : Math.cos(angle);
    };
    const path = (d: number) => {
        const pts: string[] = [];
        for (let k = 0; k <= 80; k++) {
            const pos = (k / 80) * span;
            pts.push(`${k ? 'L' : 'M'}${x(pos).toFixed(1)},${y(val(pos, d)).toFixed(1)}`);
        }
        return pts.join('');
    };

    return (
        <figure className="pw">
            <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label="Sine and cosine curves for the first four position dimensions">
                <line x1={padL} x2={W - padR} y1={y(0)} y2={y(0)} stroke="var(--viz-grid)" />
                {Array.from({ length: n }, (_, p) => (
                    <g key={p}>
                        <line x1={x(p)} x2={x(p)} y1={padT} y2={H - padB} stroke="var(--viz-grid)" strokeDasharray="2 3" />
                        <text x={x(p)} y={H - 6} textAnchor="middle" fontSize="10" fill="var(--muted)" fontFamily="var(--font-mono)">{p}</text>
                    </g>
                ))}
                {dims.map((d, i) => (
                    <g key={d}>
                        <path d={path(d)} fill="none" stroke={colors[i]} strokeWidth={2} />
                        {Array.from({ length: n }, (_, p) => (
                            <circle key={p} cx={x(p)} cy={y(val(p, d))} r={3} fill={colors[i]} stroke="var(--bg-panel)" strokeWidth={1.5} />
                        ))}
                    </g>
                ))}
            </svg>
            <figcaption className="pw-legend">
                {dims.map((d, i) => (
                    <span key={d}><i style={{ background: colors[i] }} />dim {d} ({d % 2 === 0 ? 'sin' : 'cos'})</span>
                ))}
                <span className="pw-axis">x-axis: token position</span>
            </figcaption>
            <style>{`
                .pw { display: flex; flex-direction: column; gap: 6px; }
                .pw-legend { display: flex; flex-wrap: wrap; gap: var(--s3); font-size: var(--text-2xs); color: var(--secondary); font-family: var(--font-mono); }
                .pw-legend i { display: inline-block; width: 14px; height: 2px; margin-right: 6px; vertical-align: middle; border-radius: 1px; }
                .pw-axis { color: var(--muted); margin-left: auto; }
            `}</style>
        </figure>
    );
}
