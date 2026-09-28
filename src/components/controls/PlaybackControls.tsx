// Bottom bar of the simulator: back / next / play-all / restart, speed, and
// the step counter. ← and → keys are handled in SimulatorShell.

import { PIPELINE_STEP_COUNT, PIPELINE_STEP_LABELS, PipelineStep, type PlaySpeed } from '@/lib/store/types';

interface PlaybackControlsProps {
    currentStep: PipelineStep;
    isPlaying: boolean;
    playSpeed: PlaySpeed;
    onBack: () => void;
    onStep: () => void;
    onPlay: () => void;
    onPause: () => void;
    onReset: () => void;
    onSpeedChange: (speed: PlaySpeed) => void;
}

const SPEEDS: { id: PlaySpeed; label: string }[] = [
    { id: 'slow', label: 'Slow' },
    { id: 'normal', label: 'Normal' },
    { id: 'fast', label: 'Fast' },
];

export function PlaybackControls({
    currentStep, isPlaying, playSpeed, onBack, onStep, onPlay, onPause, onReset, onSpeedChange,
}: PlaybackControlsProps) {
    const atStart = currentStep === PipelineStep.INPUT;
    const atEnd = currentStep === PipelineStep.SAMPLING;
    const next = atEnd ? null : PIPELINE_STEP_LABELS[(currentStep + 1) as PipelineStep];

    return (
        <div className="pb" role="group" aria-label="Step controls">
            <button type="button" className="btn btn-secondary pb-back" onClick={onBack} disabled={atStart || isPlaying} aria-label="Previous step">
                <span aria-hidden="true">←</span><span className="pb-lbl"> Back</span>
            </button>
            <button type="button" className="btn btn-primary pb-next" onClick={onStep} disabled={atEnd || isPlaying} aria-keyshortcuts="ArrowRight">
                {next ? <><span>Next<span className="pb-lbl">: {next.label}</span></span><span aria-hidden="true">→</span></> : 'Finished'}
            </button>
            <button
                type="button"
                className="btn btn-secondary"
                onClick={isPlaying ? onPause : onPlay}
                disabled={atEnd && !isPlaying}
                aria-label={isPlaying ? 'Pause' : 'Play all remaining steps'}
            >
                {isPlaying ? 'Pause' : 'Play all'}
            </button>
            <button type="button" className="btn btn-ghost pb-reset" onClick={onReset} disabled={atStart && !isPlaying}>
                Restart
            </button>

            <div className="pb-right">
                <div className="segmented pb-speed" role="radiogroup" aria-label="Play speed">
                    {SPEEDS.map((s) => (
                        <button key={s.id} type="button" role="radio" aria-checked={playSpeed === s.id} onClick={() => onSpeedChange(s.id)}>
                            {s.label}
                        </button>
                    ))}
                </div>
                <span className="pb-count" aria-live="polite">
                    Step <strong>{currentStep + 1}</strong> of {PIPELINE_STEP_COUNT}
                </span>
            </div>
            <style>{`
                .pb { display: flex; align-items: center; gap: var(--s2); padding: var(--s3) var(--s4); border-top: 1px solid var(--stroke); background: var(--bg-panel); flex-wrap: wrap; }
                .pb .btn:disabled { opacity: 0.4; cursor: not-allowed; }
                .pb-next { min-width: 180px; justify-content: space-between; }
                .pb-right { margin-left: auto; display: flex; align-items: center; gap: var(--s3); }
                .pb-count { font-family: var(--font-mono); font-size: var(--text-xs); color: var(--muted); white-space: nowrap; }
                .pb-count strong { color: var(--ink); }
                @media (max-width: 1100px) { .pb-speed { display: none; } }
                @media (max-width: 639px) {
                    .pb { padding: var(--s2) var(--s3); gap: 6px; }
                    .pb-lbl, .pb-reset { display: none; }
                    .pb-next { flex: 1; min-width: 0; justify-content: center; }
                    .pb-right { margin-left: 0; }
                }
            `}</style>
        </div>
    );
}
