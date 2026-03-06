import { motion } from 'framer-motion';
import { PipelineStep } from '@/lib/store/types';
import type { PlaySpeed } from '@/lib/store/types';

// ─── PlaybackControls Props ───────────────────────────────────────────────

interface PlaybackControlsProps {
    currentStep?: PipelineStep;
    isPlaying?: boolean;
    playSpeed?: PlaySpeed;
    onBack?: () => void;
    onStep?: () => void;
    onPlay?: () => void;
    onPause?: () => void;
    onReset?: () => void;
    onSpeedChange?: (speed: PlaySpeed) => void;
}

// ─── Icon SVGs (inline, no external dependency) ──────────────────────────

const IconBack = () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M4 4v8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
);

const IconStep = () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12 4v8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
);

const IconPlay = () => (
    <svg width="14" height="16" viewBox="0 0 14 16" fill="currentColor" aria-hidden="true">
        <path d="M2 1.5l11 6.5-11 6.5V1.5z" />
    </svg>
);

const IconPause = () => (
    <svg width="14" height="16" viewBox="0 0 14 16" fill="currentColor" aria-hidden="true">
        <rect x="2" y="1" width="4" height="14" rx="1" />
        <rect x="8" y="1" width="4" height="14" rx="1" />
    </svg>
);

const IconReset = () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path d="M3 8a5 5 0 1 0 .5-2.2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M3 3v3h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

// ─── PlaybackControls ─────────────────────────────────────────────────────

export function PlaybackControls({
    currentStep = PipelineStep.INPUT,
    isPlaying = false,
    playSpeed = 'normal',
    onBack,
    onStep,
    onPlay,
    onPause,
    onReset,
    onSpeedChange,
}: PlaybackControlsProps) {
    const isAtStart = currentStep === PipelineStep.INPUT;
    const isAtEnd = currentStep === PipelineStep.SAMPLING;

    const speeds: PlaySpeed[] = ['slow', 'normal', 'fast'];
    const speedLabels: Record<PlaySpeed, string> = {
        slow: '0.5×',
        normal: '1×',
        fast: '3×',
    };

    return (
        <div
            aria-label="Playback controls"
            style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 'var(--s2)',
                padding: 'var(--s3) var(--s4)',
                borderTop: '1px solid var(--stroke)',
                background: 'var(--bg-panel)',
                flexWrap: 'wrap',
            }}
        >
            {/* Back */}
            <ControlButton
                id="playback-back"
                label="Previous step"
                onClick={onBack}
                disabled={isAtStart}
                icon={<IconBack />}
            />

            {/* Step forward */}
            <ControlButton
                id="playback-step"
                label="Next step"
                onClick={onStep}
                disabled={isAtEnd || isPlaying}
                icon={<IconStep />}
                primary
            >
                Step
            </ControlButton>

            {/* Play / Pause */}
            <ControlButton
                id="playback-play"
                label={isPlaying ? 'Pause' : 'Play all steps'}
                onClick={isPlaying ? onPause : onPlay}
                disabled={isAtEnd && !isPlaying}
                icon={isPlaying ? <IconPause /> : <IconPlay />}
                primary={!isPlaying}
                active={isPlaying}
            >
                {isPlaying ? 'Pause' : 'Play'}
            </ControlButton>

            {/* Reset */}
            <ControlButton
                id="playback-reset"
                label="Reset to beginning"
                onClick={onReset}
                disabled={isAtStart && !isPlaying}
                icon={<IconReset />}
            />

            {/* Divider */}
            <div style={{
                width: '1px',
                height: '24px',
                background: 'var(--stroke)',
                margin: '0 var(--s1)',
                flexShrink: 0,
            }} />

            {/* Speed selector */}
            <div
                role="group"
                aria-label="Playback speed"
                style={{ display: 'flex', gap: 'var(--s1)', alignItems: 'center' }}
            >
                {speeds.map((s) => (
                    <button
                        key={s}
                        id={`speed-${s}`}
                        aria-pressed={playSpeed === s}
                        aria-label={`Set speed to ${speedLabels[s]}`}
                        onClick={() => onSpeedChange?.(s)}
                        style={{
                            padding: 'var(--s1) var(--s3)',
                            borderRadius: 'var(--r-sm)',
                            border: '1px solid',
                            borderColor: playSpeed === s ? 'var(--stroke-dark)' : 'var(--stroke)',
                            background: playSpeed === s ? 'var(--bg-inverse)' : 'transparent',
                            color: playSpeed === s ? 'var(--text-inverse)' : 'var(--muted)',
                            fontSize: 'var(--text-xs)',
                            fontFamily: 'var(--font-mono)',
                            cursor: 'pointer',
                            transition: `all var(--dur-fast) var(--ease-out)`,
                            minHeight: '32px',
                        }}
                    >
                        {speedLabels[s]}
                    </button>
                ))}
            </div>

            {/* Step counter */}
            <div
                aria-label={`Step ${currentStep + 1} of 12`}
                style={{
                    marginLeft: 'var(--s2)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: 'var(--text-xs)',
                    color: 'var(--muted)',
                    whiteSpace: 'nowrap',
                }}
            >
                {currentStep + 1} / 12
            </div>
        </div>
    );
}

// ─── Shared Control Button ────────────────────────────────────────────────

interface ControlButtonProps {
    id: string;
    label: string;
    onClick?: () => void;
    disabled?: boolean;
    icon: React.ReactNode;
    children?: React.ReactNode;
    primary?: boolean;
    active?: boolean;
}

function ControlButton({ id, label, onClick, disabled, icon, children, primary, active }: ControlButtonProps) {
    return (
        <motion.button
            id={id}
            aria-label={label}
            onClick={onClick}
            disabled={disabled}
            whileHover={!disabled ? { scale: 1.04 } : undefined}
            whileTap={!disabled ? { scale: 0.95 } : undefined}
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 'var(--s1)',
                padding: 'var(--s2) var(--s4)',
                borderRadius: 'var(--r-md)',
                border: '1px solid',
                borderColor: primary || active
                    ? 'var(--bg-inverse)'
                    : 'var(--stroke)',
                background: primary || active
                    ? 'var(--bg-inverse)'
                    : 'transparent',
                color: primary || active
                    ? 'var(--text-inverse)'
                    : 'var(--secondary)',
                fontSize: 'var(--text-sm)',
                fontWeight: 'var(--weight-medium)',
                cursor: disabled ? 'not-allowed' : 'pointer',
                opacity: disabled ? 0.38 : 1,
                minHeight: '40px',
                transition: `all var(--dur-fast) var(--ease-out)`,
            }}
        >
            {icon}
            {children && <span>{children}</span>}
        </motion.button>
    );
}
