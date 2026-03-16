import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PipelineStep, PIPELINE_STEP_LABELS, type ModelConfig, type AppMode } from '@/lib/store/types';
import { useSimulatorStore } from '@/lib/store/simulatorStore';
import { ControlPanel } from '@/components/controls/ControlPanel';
import { ModeToggle } from '@/components/controls/ModeToggle';
import { PipelineCanvas } from './PipelineCanvas';
import { Nav } from '@/components/shared/Nav';

// ─── SimulatorShell ───────────────────────────────────────────────────────

export function SimulatorShell() {
    const {
        mode, setMode,
        currentStep,
        isPlaying, playSpeed,
        config, updateConfig,
        inputText, setInput,
        tensors,
        stepForward, stepBackward,
        playAll, pause, reset,
        setPlaySpeed,
    } = useSimulatorStore();

    const [inspectorOpen, setInspectorOpen] = useState(false);
    const [controlsOpen, setControlsOpen] = useState(false);

    return (
        <div
            style={{
                height: '100vh',
                display: 'flex',
                flexDirection: 'column',
                background: 'var(--bg)',
                overflow: 'hidden',
            }}
        >
            {/* ── Global Nav ────────────────────────────────────────── */}
            <Nav activeRoute="/transformer-simulator" />

            {/* ── Action Toolbar ────────────────────────────────────── */}
            <ActionToolbar
                mode={mode}
                onModeToggle={setMode}
                onInspectorToggle={() => setInspectorOpen((v) => !v)}
                onControlsToggle={() => setControlsOpen((v) => !v)}
            />

            {/* ── Main Layout ───────────────────────────────────────── */}
            <div id="main" role="main" style={{ flex: 1, display: 'flex', overflow: 'hidden', position: 'relative' }}>

                {/* LEFT: Control Panel */}
                <div
                    aria-label="Left control panel"
                    className="control-panel-desktop"
                    style={{
                        width: '280px',
                        flexShrink: 0,
                        height: '100%',
                        overflow: 'hidden',
                    }}
                >
                    <ControlPanel
                        config={config}
                        onConfigChange={updateConfig}
                        inputText={inputText}
                        onInputChange={setInput}
                    />
                </div>

                {/* CENTER: Pipeline Canvas */}
                <div style={{ flex: 1, minWidth: 0, height: '100%', overflow: 'hidden' }}>
                    <PipelineCanvas
                        currentStep={currentStep}
                        isPlaying={isPlaying}
                        playSpeed={playSpeed}
                        onBack={stepBackward}
                        onStep={stepForward}
                        onPlay={playAll}
                        onPause={pause}
                        onReset={reset}
                        onSpeedChange={setPlaySpeed}
                    />
                </div>

                {/* RIGHT: Inspector Panel */}
                <AnimatePresence>
                    {(inspectorOpen || true) && (
                        <InspectorPanel
                            step={currentStep}
                            mode={mode}
                            tensors={tensors}
                            config={config}
                            isOpen={inspectorOpen}
                            onClose={() => setInspectorOpen(false)}
                        />
                    )}
                </AnimatePresence>
            </div>

            {/* MOBILE: Bottom drawer for controls */}
            <MobileControlDrawer
                isOpen={controlsOpen}
                onClose={() => setControlsOpen(false)}
                config={config}
                onConfigChange={updateConfig}
                inputText={inputText}
                onInputChange={setInput}
            />

            <style>{SHELL_CSS}</style>
        </div>
    );
}

// ─── Action Toolbar ───────────────────────────────────────────────────────

interface ActionToolbarProps {
    mode: AppMode;
    onModeToggle: (m: AppMode) => void;
    onInspectorToggle: () => void;
    onControlsToggle: () => void;
}

function ActionToolbar({ mode, onModeToggle, onInspectorToggle, onControlsToggle }: ActionToolbarProps) {
    return (
        <div
            aria-label="Simulator actions"
            style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                padding: 'var(--s2) var(--s4)',
                borderBottom: '1px solid var(--stroke)',
                background: 'var(--bg-panel)',
                flexShrink: 0,
                gap: 'var(--s2)',
                zIndex: 'var(--z-nav)',
            }}
        >
            {/* Center: Mode toggle */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--s2)', marginRight: 'auto' }}>
                <ModeToggle mode={mode} onToggle={onModeToggle} />
            </div>

            {/* Right: Action buttons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--s2)' }}>
                <button
                    id="inspector-toggle"
                    className="inspector-toggle-btn"
                    aria-label="Toggle inspector panel"
                    onClick={onInspectorToggle}
                    style={{
                        padding: 'var(--s1) var(--s3)',
                        background: 'transparent',
                        border: '1px solid var(--stroke)',
                        borderRadius: 'var(--r-md)',
                        color: 'var(--muted)',
                        fontSize: 'var(--text-xs)',
                        fontFamily: 'var(--font-mono)',
                        cursor: 'pointer',
                        minHeight: '34px',
                        display: 'none',
                    }}
                >
                    Inspector
                </button>

                <button
                    id="controls-drawer-toggle"
                    className="controls-drawer-btn"
                    aria-label="Toggle controls drawer"
                    onClick={onControlsToggle}
                    style={{
                        padding: 'var(--s1) var(--s3)',
                        background: 'var(--bg-raised)',
                        border: '1px solid var(--stroke-dark)',
                        borderRadius: 'var(--r-md)',
                        color: 'var(--ink)',
                        fontSize: 'var(--text-xs)',
                        fontFamily: 'var(--font-mono)',
                        cursor: 'pointer',
                        minHeight: '34px',
                        display: 'none',
                    }}
                >
                    ⚙ Config
                </button>
            </div>
        </div>
    );
}

// ─── Inspector Panel ──────────────────────────────────────────────────────

function InspectorPanel({
    step, mode, tensors, config, isOpen, onClose,
}: {
    step: PipelineStep;
    mode: AppMode;
    tensors: import('@/lib/store/types').TensorRegistry;
    config: ModelConfig;
    isOpen: boolean;
    onClose: () => void;
}) {
    const meta = PIPELINE_STEP_LABELS[step];

    return (
        <>
            {/* Desktop: static right panel */}
            <aside
                aria-label="Inspector panel"
                className="inspector-desktop"
                style={{
                    width: '300px',
                    flexShrink: 0,
                    height: '100%',
                    borderLeft: '1px solid var(--stroke)',
                    background: 'var(--bg-panel)',
                    display: 'flex',
                    flexDirection: 'column',
                    overflowY: 'auto',
                }}
            >
                <InspectorContent step={step} meta={meta} mode={mode} tensors={tensors} config={config} />
            </aside>

            {/* Tablet/Mobile: slide-in overlay */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        <motion.div
                            className="inspector-overlay"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={onClose}
                            style={{
                                position: 'absolute',
                                inset: 0,
                                background: 'rgba(249,249,249,0.6)',
                                zIndex: 'var(--z-overlay)',
                            }}
                        />
                        <motion.aside
                            className="inspector-mobile"
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'tween', duration: 0.22, ease: [0.2, 0, 0, 1] }}
                            aria-label="Inspector panel"
                            style={{
                                position: 'absolute',
                                right: 0,
                                top: 0,
                                bottom: 0,
                                width: '300px',
                                background: 'var(--bg-panel)',
                                borderLeft: '1px solid var(--stroke)',
                                zIndex: 'var(--z-raised)',
                                overflowY: 'auto',
                            }}
                        >
                            <div style={{ padding: 'var(--s3) var(--s4)', borderBottom: '1px solid var(--stroke)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 'var(--tracking-wider)' }}>Inspector</span>
                                <button aria-label="Close inspector" onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: 'var(--text-lg)', lineHeight: 1, padding: '0 var(--s1)' }}>×</button>
                            </div>
                            <InspectorContent step={step} meta={meta} mode={mode} tensors={tensors} config={config} />
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}

// ─── Inspector Content ────────────────────────────────────────────────────

function InspectorContent({
    step, meta, mode, tensors, config,
}: {
    step: PipelineStep;
    meta: { label: string; shortLabel: string; description: string };
    mode: AppMode;
    tensors: import('@/lib/store/types').TensorRegistry;
    config: ModelConfig;
}) {
    const n = tensors.tokens?.raw.length ?? '?';
    const d = config.dModel;
    const V = '512';

    const tensorRows = [
        { key: 'Input', ready: step > PipelineStep.INPUT, shape: tensors.tokens ? `${tensors.tokens.raw.length} words` : '—' },
        { key: 'Tokens', ready: tensors.tokens !== undefined, shape: tensors.tokens ? `(${n},) str` : '(n,)' },
        { key: 'Token IDs', ready: tensors.token_ids !== undefined, shape: tensors.token_ids ? `(${tensors.token_ids.ids.length},) int` : `(n,) int` },
        { key: 'X embed', ready: tensors.embed !== undefined, shape: tensors.embed ? tensors.embed.X.shapeStr() : `(n, ${d})` },
        { key: 'X + PE', ready: tensors.posenc !== undefined, shape: tensors.posenc ? tensors.posenc.X_pos.shapeStr() : `(n, ${d})` },
        { key: 'Attn Output', ready: tensors.attention !== undefined, shape: tensors.attention ? tensors.attention.multihead_out.shapeStr() : `(n, ${d})` },
        { key: 'X Residual', ready: tensors.residual !== undefined, shape: tensors.residual ? tensors.residual.X_res.shapeStr() : `(n, ${d})` },
        { key: 'X Normed', ready: tensors.layernorm !== undefined, shape: tensors.layernorm ? tensors.layernorm.X_norm.shapeStr() : `(n, ${d})` },
        { key: 'FFN Output', ready: tensors.ffn !== undefined, shape: tensors.ffn ? tensors.ffn.output.shapeStr() : `(n, ${d})` },
        { key: 'Logits', ready: tensors.lm_head !== undefined, shape: tensors.lm_head ? tensors.lm_head.logits.shapeStr() : `(${V},)` },
        { key: 'Probs', ready: tensors.softmax !== undefined, shape: tensors.softmax ? tensors.softmax.probs.shapeStr() : `(${V},)` },
        { key: 'Next Token', ready: tensors.sampling !== undefined, shape: tensors.sampling ? `"${tensors.sampling.selected_token}" (id ${tensors.sampling.selected_id})` : 'string' },
    ];

    return (
        <div style={{ padding: 'var(--s4)', display: 'flex', flexDirection: 'column', gap: 'var(--s4)' }}>
            {/* Current step info */}
            <section aria-labelledby="inspector-step-label">
                <div style={{
                    padding: 'var(--s3)',
                    background: 'var(--bg-raised)',
                    border: '1px solid var(--stroke)',
                    borderRadius: 'var(--r-md)',
                }}>
                    <p style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-2xs)', color: 'var(--muted)', letterSpacing: 'var(--tracking-wider)', textTransform: 'uppercase', marginBottom: 'var(--s1)' }}>
                        Active Step
                    </p>
                    <p id="inspector-step-label" style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-semibold)', color: 'var(--ink)', marginBottom: 'var(--s1)' }}>
                        {String(step + 1).padStart(2, '0')}  {meta.label}
                    </p>
                    <p style={{ fontSize: 'var(--text-xs)', color: 'var(--secondary)', lineHeight: 'var(--lead-snug)' }}>
                        {meta.description}
                    </p>
                </div>
            </section>

            {/* Mode indicator */}
            <section>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-2xs)', color: 'var(--muted)', letterSpacing: 'var(--tracking-wider)', textTransform: 'uppercase', marginBottom: 'var(--s2)' }}>
                    Mode
                </p>
                <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 'var(--s1)',
                    padding: 'var(--s1) var(--s3)',
                    background: 'var(--bg-inverse)',
                    border: '1px solid var(--bg-inverse)',
                    borderRadius: 'var(--r-sm)',
                    fontSize: 'var(--text-xs)',
                    color: 'var(--text-inverse)',
                    fontFamily: 'var(--font-mono)',
                }}>
                    {mode === 'simple' ? 'Simple' : 'Advanced'}
                </div>
            </section>

            {/* Tensor shape tracker */}
            <section aria-labelledby="tensor-tracker-label">
                <p id="tensor-tracker-label" style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 'var(--text-2xs)',
                    color: 'var(--muted)',
                    letterSpacing: 'var(--tracking-wider)',
                    textTransform: 'uppercase',
                    marginBottom: 'var(--s2)',
                }}>
                    Tensor Shapes
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s1)' }}>
                    {tensorRows.map(({ key, shape, ready }) => (
                        <div
                            key={key}
                            aria-label={`${key}: ${ready ? shape : 'not yet computed'}`}
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: 'var(--s1) var(--s2)',
                                borderRadius: 'var(--r-sm)',
                                background: ready ? 'var(--bg-raised)' : 'transparent',
                                opacity: ready ? 1 : 0.35,
                                transition: `all var(--dur-base) var(--ease-out)`,
                            }}
                        >
                            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--secondary)', fontFamily: 'var(--font-mono)' }}>
                                {key}
                            </span>
                            <span style={{
                                fontSize: 'var(--text-xs)',
                                fontFamily: 'var(--font-mono)',
                                color: ready ? 'var(--ink)' : 'var(--muted)',
                            }}>
                                {ready ? shape : '—'}
                            </span>
                        </div>
                    ))}
                </div>
            </section>

            {/* Sampling result */}
            {tensors.sampling && (
                <section>
                    <p style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: 'var(--text-2xs)',
                        color: 'var(--muted)',
                        letterSpacing: 'var(--tracking-wider)',
                        textTransform: 'uppercase',
                        marginBottom: 'var(--s2)',
                    }}>
                        Prediction
                    </p>
                    <div style={{
                        padding: 'var(--s3)',
                        background: 'var(--bg-inverse)',
                        border: '1px solid var(--bg-inverse)',
                        borderRadius: 'var(--r-md)',
                        textAlign: 'center',
                    }}>
                        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-inverse)', marginBottom: 'var(--s1)', fontFamily: 'var(--font-mono)', opacity: 0.7 }}>
                            Next token
                        </p>
                        <p style={{
                            fontSize: 'var(--text-2xl)',
                            fontWeight: 'var(--weight-semibold)',
                            color: 'var(--text-inverse)',
                            fontFamily: 'var(--font-mono)',
                        }}>
                            "{tensors.sampling.selected_token}"
                        </p>
                        <p style={{ fontSize: 'var(--text-2xs)', color: 'var(--text-inverse)', marginTop: 'var(--s1)', fontFamily: 'var(--font-mono)', opacity: 0.7 }}>
                            id: {tensors.sampling.selected_id}
                        </p>
                    </div>
                </section>
            )}

            {/* Concept card placeholder */}
            <section>
                <p style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 'var(--text-2xs)',
                    color: 'var(--muted)',
                    letterSpacing: 'var(--tracking-wider)',
                    textTransform: 'uppercase',
                    marginBottom: 'var(--s2)',
                }}>
                    Concept
                </p>
                <div style={{
                    padding: 'var(--s3)',
                    background: 'var(--bg-raised)',
                    border: '1px dashed var(--stroke-dark)',
                    borderRadius: 'var(--r-md)',
                    fontSize: 'var(--text-xs)',
                    color: 'var(--muted)',
                    lineHeight: 'var(--lead-body)',
                    fontStyle: 'italic',
                }}>
                    ConceptCard educational content available in Step 6+
                </div>
            </section>
        </div>
    );
}

// ─── Mobile Control Drawer ────────────────────────────────────────────────

function MobileControlDrawer({
    isOpen, onClose, config, onConfigChange, inputText, onInputChange,
}: {
    isOpen: boolean;
    onClose: () => void;
    config: ModelConfig;
    onConfigChange: (patch: Partial<ModelConfig>) => void;
    inputText: string;
    onInputChange: (t: string) => void;
}) {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        style={{
                            position: 'fixed',
                            inset: 0,
                            background: 'rgba(249,249,249,0.7)',
                            zIndex: 'var(--z-overlay)',
                        }}
                    />
                    <motion.div
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ type: 'tween', duration: 0.28, ease: [0.2, 0, 0, 1] }}
                        style={{
                            position: 'fixed',
                            bottom: 0,
                            left: 0,
                            right: 0,
                            maxHeight: '80vh',
                            background: 'var(--bg-panel)',
                            borderTop: '1px solid var(--stroke)',
                            borderRadius: 'var(--r-xl) var(--r-xl) 0 0',
                            zIndex: 'var(--z-modal)',
                            overflowY: 'auto',
                        }}
                    >
                        {/* Handle */}
                        <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--s3) 0 var(--s1)' }}>
                            <div style={{ width: '32px', height: '4px', borderRadius: 'var(--r-pill)', background: 'var(--stroke-dark)' }} />
                        </div>
                        <div style={{ padding: '0 0 env(safe-area-inset-bottom)' }}>
                            <ControlPanel
                                config={config}
                                onConfigChange={onConfigChange}
                                inputText={inputText}
                                onInputChange={onInputChange}
                            />
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

// ─── Responsive CSS ────────────────────────────────────────────────────────

const SHELL_CSS = `
@media (min-width: 1280px) {
  .control-panel-desktop { display: flex !important; flex-direction: column; }
  .inspector-desktop { display: flex !important; }
  .inspector-toggle-btn { display: none !important; }
  .controls-drawer-btn { display: none !important; }
  .inspector-overlay { display: none !important; }
  .inspector-mobile { display: none !important; }
}

@media (min-width: 768px) and (max-width: 1279px) {
  .control-panel-desktop { display: none !important; }
  .inspector-desktop { display: none !important; }
  .inspector-toggle-btn { display: flex !important; }
  .controls-drawer-btn { display: flex !important; }
  .header-subtitle { display: none; }
  .header-divider { display: none; }
}

@media (max-width: 767px) {
  .control-panel-desktop { display: none !important; }
  .inspector-desktop { display: none !important; }
  .inspector-toggle-btn { display: none !important; }
  .controls-drawer-btn { display: flex !important; }
  .header-subtitle { display: none; }
  .header-divider { display: none; }
}
`;
