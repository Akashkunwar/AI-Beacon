import { motion, AnimatePresence } from 'framer-motion';
import { PipelineStep, PIPELINE_STEP_LABELS } from '@/lib/store/types';
import { StepRouter } from './StepRouter';
import { PlaybackControls } from '@/components/controls/PlaybackControls';

interface PipelineCanvasProps {
    currentStep?: PipelineStep;
    isPlaying?: boolean;
    playSpeed?: import('@/lib/store/types').PlaySpeed;
    onBack?: () => void;
    onStep?: () => void;
    onPlay?: () => void;
    onPause?: () => void;
    onReset?: () => void;
    onSpeedChange?: (speed: import('@/lib/store/types').PlaySpeed) => void;
}

export function PipelineCanvas({
    currentStep = PipelineStep.INPUT,
    isPlaying = false,
    playSpeed = 'normal',
    onBack,
    onStep,
    onPlay,
    onPause,
    onReset,
    onSpeedChange,
}: PipelineCanvasProps) {
    const allSteps = Object.values(PipelineStep).filter(
        (v): v is PipelineStep => typeof v === 'number'
    );

    return (
        <main
            aria-label="Pipeline canvas"
            style={{
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                minWidth: 0,
                background: 'var(--bg)',
            }}
        >
            {/* ── Step Indicator Row ────────────────────────────────── */}
            <nav
                aria-label="Pipeline steps"
                style={{
                    padding: 'var(--s3) var(--s5)',
                    borderBottom: '1px solid var(--stroke)',
                    background: 'var(--bg-panel)',
                    flexShrink: 0,
                }}
            >
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0',
                    overflowX: 'auto',
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none',
                    paddingBottom: '2px',
                }}>
                    {allSteps.map((step, i) => {
                        const isActive = step === currentStep;
                        const isCompleted = step < currentStep;
                        const meta = PIPELINE_STEP_LABELS[step];

                        return (
                            <div
                                key={step}
                                style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}
                            >
                                {/* Node */}
                                <motion.div
                                    aria-label={`${meta.shortLabel}${isActive ? ' — current step' : isCompleted ? ' — completed' : ''}`}
                                    aria-current={isActive ? 'step' : undefined}
                                    style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        gap: 'var(--s1)',
                                        cursor: 'default',
                                    }}
                                    whileHover={{ scale: 1.05 }}
                                >
                                    <motion.div
                                        animate={{
                                            scale: isActive ? [1, 1.15, 1] : 1,
                                            opacity: isCompleted ? 0.6 : 1,
                                        }}
                                        transition={{
                                            scale: { duration: 1.4, repeat: isActive ? Infinity : 0 },
                                        }}
                                        style={{
                                            width: isActive ? '12px' : '9px',
                                            height: isActive ? '12px' : '9px',
                                            borderRadius: '50%',
                                            background: isActive
                                                ? 'var(--ink)'
                                                : isCompleted
                                                    ? 'var(--muted)'
                                                    : 'var(--stroke)',
                                            border: isActive
                                                ? '2px solid var(--stroke-dark)'
                                                : '1px solid var(--stroke)',
                                            transition: `all var(--dur-base) var(--ease-out)`,
                                        }}
                                    />
                                    <span style={{
                                        fontFamily: 'var(--font-mono)',
                                        fontSize: '9px',
                                        color: isActive
                                            ? 'var(--ink)'
                                            : isCompleted
                                                ? 'var(--secondary)'
                                                : 'var(--muted)',
                                        whiteSpace: 'nowrap',
                                        maxWidth: '52px',
                                        textAlign: 'center',
                                        lineHeight: 1.2,
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        transition: `color var(--dur-base) var(--ease-out)`,
                                    }}>
                                        {meta.shortLabel}
                                    </span>
                                </motion.div>

                                {/* Connector line */}
                                {i < allSteps.length - 1 && (
                                    <div style={{
                                        width: '24px',
                                        height: '1px',
                                        background: isCompleted ? 'var(--muted)' : 'var(--stroke)',
                                        flexShrink: 0,
                                        position: 'relative',
                                        top: '-8px',
                                    }}>
                                        {isCompleted && (
                                            <motion.div
                                                initial={{ scaleX: 0 }}
                                                animate={{ scaleX: 1 }}
                                                style={{
                                                    position: 'absolute',
                                                    inset: 0,
                                                    background: 'var(--ink)',
                                                    transformOrigin: 'left',
                                                }}
                                            />
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Current step label */}
                <AnimatePresence mode="wait">
                    <motion.p
                        key={currentStep}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.2 }}
                        style={{
                            marginTop: 'var(--s2)',
                            fontSize: 'var(--text-xs)',
                            color: 'var(--muted)',
                            fontFamily: 'var(--font-mono)',
                        }}
                    >
                        <span style={{ color: 'var(--ink)' }}>
                            {String(currentStep + 1).padStart(2, '0')}
                        </span>
                        {' — '}
                        {PIPELINE_STEP_LABELS[currentStep].label}
                    </motion.p>
                </AnimatePresence>
            </nav>

            {/* ── Active Step Visualization ─────────────────────────── */}
            <div style={{
                flex: 1,
                overflowY: 'auto',
                padding: 'clamp(var(--s4), 2vw, var(--s6))',
            }}>
                <StepRouter step={currentStep} />
            </div>

            {/* ── Playback Controls ─────────────────────────────────── */}
            <div style={{ flexShrink: 0 }}>
                <PlaybackControls
                    currentStep={currentStep}
                    isPlaying={isPlaying}
                    playSpeed={playSpeed}
                    onBack={onBack}
                    onStep={onStep}
                    onPlay={onPlay}
                    onPause={onPause}
                    onReset={onReset}
                    onSpeedChange={onSpeedChange}
                />
            </div>
        </main>
    );
}
