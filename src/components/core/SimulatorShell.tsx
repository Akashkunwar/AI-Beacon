// src/components/core/SimulatorShell.tsx
// Layout for Module 02. Desktop: step rail + settings | step content | inspector.
// Narrower screens move the rail into a horizontal strip and the settings and
// inspector into drawers. ← / → step through the pipeline.

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    PIPELINE_PHASES, PIPELINE_STEP_LABELS, PipelineStep,
    type PipelinePhase, type TensorRegistry,
} from '@/lib/store/types';
import { useSimulatorStore } from '@/lib/store/simulatorStore';
import { countParameters } from '@/lib/store/stepMachine';
import { VOCAB_SIZE } from '@/lib/tokenizer/vocab';
import { getModule } from '@/config/modules';
import { Nav } from '@/components/shared/Nav';
import { CloseIcon } from '@/components/shared/Icons';
import { ModeToggle } from '@/components/controls/ModeToggle';
import { ModelSettings } from '@/components/controls/ModelSettings';
import { PlaybackControls } from '@/components/controls/PlaybackControls';
import { StepRouter } from './StepRouter';

type Drawer = 'settings' | 'inspector' | null;

export function SimulatorShell() {
    const mode = useSimulatorStore((s) => s.mode);
    const setMode = useSimulatorStore((s) => s.setMode);
    const currentStep = useSimulatorStore((s) => s.currentStep);
    const isPlaying = useSimulatorStore((s) => s.isPlaying);
    const playSpeed = useSimulatorStore((s) => s.playSpeed);
    const stepForward = useSimulatorStore((s) => s.stepForward);
    const stepBackward = useSimulatorStore((s) => s.stepBackward);
    const playAll = useSimulatorStore((s) => s.playAll);
    const pause = useSimulatorStore((s) => s.pause);
    const reset = useSimulatorStore((s) => s.reset);
    const setPlaySpeed = useSimulatorStore((s) => s.setPlaySpeed);
    const [drawer, setDrawer] = useState<Drawer>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const mod = getModule('simulator');

    // Start each step at the top of its content.
    useEffect(() => {
        scrollRef.current?.scrollTo({ top: 0 });
    }, [currentStep]);

    // Stop the play timer when leaving the page.
    useEffect(() => () => useSimulatorStore.getState().pause(), []);

    // ← / → step through the pipeline (ignored while typing or with a drawer open).
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey) return;
            const t = e.target as HTMLElement | null;
            if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
            if (e.key === 'Escape') setDrawer(null);
            if (drawer) return;
            if (e.key === 'ArrowRight') { e.preventDefault(); stepForward(); }
            if (e.key === 'ArrowLeft') { e.preventDefault(); stepBackward(); }
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [drawer, stepForward, stepBackward]);

    return (
        <div className="sim">
            <Nav />
            <header className="sim-bar">
                <div className="sim-bar-copy">
                    <p className="eyebrow">Module {mod.num} · {mod.title}</p>
                    <h1 className="sim-bar-title">Follow one sentence through a language model</h1>
                </div>
                <div className="sim-bar-actions">
                    <ModeToggle mode={mode} onToggle={setMode} />
                    <button type="button" className="btn btn-secondary btn-sm sim-show-lt-lg" onClick={() => setDrawer('settings')}>Settings</button>
                    <button type="button" className="btn btn-secondary btn-sm sim-show-lt-xl" onClick={() => setDrawer('inspector')}>Data so far</button>
                </div>
            </header>

            <div className="sim-body">
                <aside className="sim-rail" aria-label="Pipeline steps and settings">
                    <StepRail />
                    <div className="sim-rail-sep" />
                    <ModelSettings />
                </aside>

                <main id="main" className="sim-main">
                    <StepStrip />
                    <div ref={scrollRef} className="sim-scroll">
                        <StepRouter step={currentStep} />
                    </div>
                    <PlaybackControls
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
                </main>

                <aside className="sim-inspector" aria-label="Data computed so far">
                    <Inspector />
                </aside>
            </div>

            <DrawerPanel open={drawer === 'settings'} title="Model settings" side="left" onClose={() => setDrawer(null)}>
                <ModelSettings />
            </DrawerPanel>
            <DrawerPanel open={drawer === 'inspector'} title="Data so far" side="right" onClose={() => setDrawer(null)}>
                <Inspector />
            </DrawerPanel>
            <style>{SHELL_CSS}</style>
        </div>
    );
}

// ─── Step rail (desktop) and strip (narrow screens) ───────────────────────

function StepRail() {
    const currentStep = useSimulatorStore((s) => s.currentStep);
    const goToStep = useSimulatorStore((s) => s.goToStep);
    return (
        <nav aria-label="Pipeline steps" className="rail">
            {(Object.keys(PIPELINE_PHASES) as PipelinePhase[]).map((phase) => (
                <div key={phase} className="rail-group">
                    <p className="rail-phase">{PIPELINE_PHASES[phase].label}</p>
                    <ol className="rail-list">
                        {PIPELINE_PHASES[phase].steps.map((step) => {
                            const state = step < currentStep ? 'done' : step === currentStep ? 'current' : 'todo';
                            return (
                                <li key={step}>
                                    <button
                                        type="button"
                                        className={`rail-step is-${state}`}
                                        aria-current={state === 'current' ? 'step' : undefined}
                                        onClick={() => goToStep(step)}
                                    >
                                        <span className="rail-num">{state === 'done' ? '✓' : step + 1}</span>
                                        <span className="rail-copy">
                                            <span className="rail-label">{PIPELINE_STEP_LABELS[step].label}</span>
                                            {state === 'current' && <span className="rail-desc">{PIPELINE_STEP_LABELS[step].description}</span>}
                                        </span>
                                    </button>
                                </li>
                            );
                        })}
                    </ol>
                </div>
            ))}
        </nav>
    );
}

function StepStrip() {
    const currentStep = useSimulatorStore((s) => s.currentStep);
    const goToStep = useSimulatorStore((s) => s.goToStep);
    const listRef = useRef<HTMLOListElement>(null);
    useEffect(() => {
        const el = listRef.current?.querySelector<HTMLElement>('[aria-current="step"]');
        el?.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' });
    }, [currentStep]);
    const steps = Object.keys(PIPELINE_STEP_LABELS).map(Number) as PipelineStep[];
    return (
        <nav aria-label="Pipeline steps" className="strip">
            <ol ref={listRef}>
                {steps.map((step) => (
                    <li key={step}>
                        <button
                            type="button"
                            className={`strip-step ${step < currentStep ? 'is-done' : ''}`}
                            aria-current={step === currentStep ? 'step' : undefined}
                            onClick={() => goToStep(step)}
                        >
                            <span className="strip-num">{step + 1}</span>
                            {PIPELINE_STEP_LABELS[step].shortLabel}
                        </button>
                    </li>
                ))}
            </ol>
        </nav>
    );
}

// ─── Inspector: every tensor computed so far ──────────────────────────────

const shape = (dims: readonly number[]) => dims.join(' × ');

function trackerRows(t: TensorRegistry): Array<{ step: PipelineStep; label: string; value: string | null }> {
    return [
        { step: PipelineStep.TOKENIZE, label: 'Tokens', value: t.tokens ? `${t.tokens.raw.length}` : null },
        { step: PipelineStep.TOKEN_IDS, label: 'Token IDs', value: t.token_ids ? `${t.token_ids.ids.length}` : null },
        { step: PipelineStep.EMBEDDING, label: 'Embeddings', value: t.embed ? shape(t.embed.X.shape) : null },
        { step: PipelineStep.POSITIONAL_ENCODING, label: '+ positions', value: t.posenc ? shape(t.posenc.X_pos.shape) : null },
        { step: PipelineStep.ATTENTION, label: 'Attention output', value: t.attention ? shape(t.attention.multihead_out.shape) : null },
        { step: PipelineStep.RESIDUAL, label: 'After adding', value: t.residual ? shape(t.residual.X_res.shape) : null },
        { step: PipelineStep.LAYER_NORM, label: 'After normalizing', value: t.layernorm ? shape(t.layernorm.X_norm.shape) : null },
        { step: PipelineStep.FFN, label: 'Block output', value: t.ffn ? shape(t.ffn.output.shape) : null },
        { step: PipelineStep.LM_HEAD, label: 'Scores (logits)', value: t.lm_head ? `${VOCAB_SIZE}` : null },
        { step: PipelineStep.SOFTMAX, label: 'Probabilities', value: t.softmax ? `${VOCAB_SIZE}` : null },
        { step: PipelineStep.SAMPLING, label: 'Next token', value: t.sampling ? `“${t.sampling.selected_token}”` : null },
    ];
}

function Inspector() {
    const tensors = useSimulatorStore((s) => s.tensors);
    const currentStep = useSimulatorStore((s) => s.currentStep);
    const inputText = useSimulatorStore((s) => s.inputText);
    const config = useSimulatorStore((s) => s.config);
    const rows = trackerRows(tensors);

    return (
        <div className="insp">
            <section>
                <h2 className="insp-title">Your sentence</h2>
                <p className="insp-sentence">“{inputText.trim() || '…'}”</p>
            </section>
            <section>
                <h2 className="insp-title">Data so far</h2>
                <p className="insp-sub">What each step has produced. “3 × 8” means 3 tokens with 8 numbers each.</p>
                <ol className="insp-list">
                    {rows.map((r) => (
                        <li key={r.label} className={`${r.value ? 'is-ready' : ''} ${r.step === currentStep ? 'is-current' : ''}`}>
                            <span className="insp-num">{r.step + 1}</span>
                            <span className="insp-label">{r.label}</span>
                            <span className="insp-val">{r.value ?? '—'}</span>
                        </li>
                    ))}
                </ol>
            </section>
            {tensors.sampling && (
                <section className="insp-pred">
                    <span className="insp-pred-lbl">Predicted next token</span>
                    <span className="insp-pred-tok">“{tensors.sampling.selected_token}”</span>
                    <span className="insp-pred-sub">{(tensors.sampling.prob * 100).toFixed(2)}% probability · random weights</span>
                </section>
            )}
            <section className="insp-model">
                <h2 className="insp-title">This model</h2>
                <dl>
                    <div><dt>Parameters</dt><dd>{countParameters(config).toLocaleString()}</dd></div>
                    <div><dt>Layers</dt><dd>1</dd></div>
                    <div><dt>Heads</dt><dd>{config.nHeads}</dd></div>
                    <div><dt>Vocabulary</dt><dd>{VOCAB_SIZE}</dd></div>
                </dl>
            </section>
            <p className="insp-tip">Tip: use the ← and → keys to move between steps.</p>
        </div>
    );
}

// ─── Drawer ───────────────────────────────────────────────────────────────

function DrawerPanel({ open, title, side, onClose, children }: { open: boolean; title: string; side: 'left' | 'right'; onClose: () => void; children: ReactNode }) {
    const panelRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        if (open) panelRef.current?.querySelector<HTMLElement>('button, input')?.focus();
    }, [open]);
    return (
        <AnimatePresence>
            {open && (
                <>
                    <motion.div className="drawer-scrim" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
                    <motion.div
                        ref={panelRef}
                        role="dialog"
                        aria-modal="true"
                        aria-label={title}
                        className={`drawer drawer-${side}`}
                        initial={{ x: side === 'left' ? '-100%' : '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: side === 'left' ? '-100%' : '100%' }}
                        transition={{ type: 'tween', duration: 0.22, ease: [0.2, 0, 0, 1] }}
                    >
                        <div className="drawer-head">
                            <span className="drawer-title">{title}</span>
                            <button type="button" className="icon-btn" onClick={onClose} aria-label="Close"><CloseIcon /></button>
                        </div>
                        <div className="drawer-body">{children}</div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

// ─── CSS ──────────────────────────────────────────────────────────────────

const SHELL_CSS = `
.sim { height: 100vh; height: 100dvh; display: flex; flex-direction: column; background: var(--bg); overflow: hidden; }
.sim-bar { display: flex; align-items: center; justify-content: space-between; gap: var(--s4); padding: var(--s3) var(--s5); border-bottom: 1px solid var(--stroke); background: var(--bg-panel); flex-shrink: 0; }
.sim-bar-copy { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.sim-bar-title { font-size: var(--text-md); letter-spacing: var(--tracking-tight); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.sim-bar-actions { display: flex; align-items: center; gap: var(--s2); flex-shrink: 0; }
.sim-body { flex: 1; display: flex; min-height: 0; }

.sim-rail { width: 264px; flex-shrink: 0; border-right: 1px solid var(--stroke); background: var(--bg-panel); overflow-y: auto; padding: var(--s4); display: flex; flex-direction: column; gap: var(--s4); }
.sim-rail-sep { height: 1px; background: var(--stroke); }
.sim-main { flex: 1; min-width: 0; display: flex; flex-direction: column; }
.sim-scroll { flex: 1; overflow-y: auto; padding: var(--s6) var(--s5) var(--s7); scroll-behavior: auto; }
.sim-inspector { width: 272px; flex-shrink: 0; border-left: 1px solid var(--stroke); background: var(--bg-panel); overflow-y: auto; padding: var(--s4); }

.rail { display: flex; flex-direction: column; gap: var(--s3); }
.rail-phase { font-size: var(--text-2xs); font-family: var(--font-mono); text-transform: uppercase; letter-spacing: var(--tracking-wide); color: var(--muted); margin-bottom: 4px; }
.rail-list { list-style: none; display: flex; flex-direction: column; gap: 1px; }
.rail-step { width: 100%; display: flex; gap: var(--s2); align-items: flex-start; padding: 6px 8px; border-radius: var(--r-sm); text-align: left; color: var(--secondary); }
.rail-step:hover { background: var(--bg-raised); color: var(--ink); }
.rail-num { flex-shrink: 0; width: 22px; height: 22px; border-radius: 50%; display: grid; place-items: center; font-family: var(--font-mono); font-size: 10px; border: 1px solid var(--stroke-dark); color: var(--muted); background: var(--bg-panel); }
.rail-step.is-done .rail-num { background: var(--bg-raised); color: var(--ink); border-color: var(--stroke); }
.rail-step.is-current { background: var(--bg-raised); color: var(--ink); }
.rail-step.is-current .rail-num { background: var(--bg-inverse); color: var(--text-inverse); border-color: var(--bg-inverse); }
.rail-copy { display: flex; flex-direction: column; gap: 2px; padding-top: 2px; min-width: 0; }
.rail-label { font-size: var(--text-sm); line-height: 1.25; }
.rail-step.is-current .rail-label { font-weight: var(--weight-semibold); }
.rail-desc { font-size: var(--text-2xs); color: var(--secondary); line-height: 1.4; }

.strip { display: none; border-bottom: 1px solid var(--stroke); background: var(--bg-panel); }
.strip ol { list-style: none; display: flex; gap: 4px; overflow-x: auto; padding: var(--s2) var(--s3); scrollbar-width: none; }
.strip ol::-webkit-scrollbar { display: none; }
.strip-step { display: inline-flex; align-items: center; gap: 6px; white-space: nowrap; padding: 4px 10px 4px 4px; border-radius: var(--r-pill); font-size: var(--text-xs); color: var(--muted); border: 1px solid transparent; }
.strip-num { width: 20px; height: 20px; border-radius: 50%; display: grid; place-items: center; font-family: var(--font-mono); font-size: 10px; border: 1px solid var(--stroke-dark); }
.strip-step.is-done { color: var(--secondary); }
.strip-step.is-done .strip-num { background: var(--bg-raised); border-color: var(--stroke); }
.strip-step[aria-current="step"] { color: var(--ink); border-color: var(--stroke-dark); font-weight: var(--weight-medium); }
.strip-step[aria-current="step"] .strip-num { background: var(--bg-inverse); color: var(--text-inverse); border-color: var(--bg-inverse); }

.insp { display: flex; flex-direction: column; gap: var(--s5); }
.insp-title { font-size: var(--text-2xs); font-family: var(--font-mono); text-transform: uppercase; letter-spacing: var(--tracking-wide); color: var(--muted); font-weight: var(--weight-medium); margin-bottom: 6px; }
.insp-sentence { font-size: var(--text-sm); color: var(--ink); font-family: var(--font-mono); word-break: break-word; }
.insp-sub { font-size: var(--text-2xs); color: var(--muted); margin-bottom: var(--s2); }
.insp-list { list-style: none; display: flex; flex-direction: column; }
.insp-list li { display: grid; grid-template-columns: 20px 1fr auto; gap: var(--s2); align-items: baseline; padding: 5px 6px; border-radius: var(--r-xs); font-size: var(--text-xs); color: var(--muted); opacity: 0.55; }
.insp-list li.is-ready { opacity: 1; color: var(--secondary); }
.insp-list li.is-current { background: var(--bg-raised); color: var(--ink); }
.insp-num { font-family: var(--font-mono); font-size: 10px; color: var(--muted); }
.insp-val { font-family: var(--font-mono); color: var(--ink); white-space: nowrap; }
.insp-pred { display: flex; flex-direction: column; gap: 2px; padding: var(--s4); border-radius: var(--r-md); background: var(--bg-inverse); color: var(--text-inverse); }
.insp-pred-lbl { font-size: var(--text-2xs); opacity: 0.7; text-transform: uppercase; letter-spacing: var(--tracking-wide); font-family: var(--font-mono); }
.insp-pred-tok { font-size: var(--text-xl); font-weight: var(--weight-semibold); font-family: var(--font-mono); }
.insp-pred-sub { font-size: var(--text-2xs); opacity: 0.7; }
.insp-model dl { display: grid; grid-template-columns: 1fr 1fr; gap: var(--s2); }
.insp-model dt { font-size: var(--text-2xs); color: var(--muted); }
.insp-model dd { font-size: var(--text-sm); color: var(--ink); font-weight: var(--weight-medium); font-variant-numeric: tabular-nums; }
.insp-tip { font-size: var(--text-2xs); color: var(--muted); }

.drawer-scrim { position: fixed; inset: 0; background: var(--overlay); z-index: var(--z-overlay); }
.drawer { position: fixed; top: 0; bottom: 0; width: min(340px, 88vw); background: var(--bg-panel); z-index: var(--z-modal); display: flex; flex-direction: column; box-shadow: var(--shadow-lift); }
.drawer-left { left: 0; border-right: 1px solid var(--stroke); }
.drawer-right { right: 0; border-left: 1px solid var(--stroke); }
.drawer-head { display: flex; align-items: center; justify-content: space-between; padding: var(--s3) var(--s4); border-bottom: 1px solid var(--stroke); }
.drawer-title { font-weight: var(--weight-semibold); color: var(--ink); }
.drawer-body { flex: 1; overflow-y: auto; padding: var(--s4); padding-bottom: calc(var(--s4) + env(safe-area-inset-bottom)); }

.sim-show-lt-lg, .sim-show-lt-xl { display: none; }
@media (max-width: 1279px) {
    .sim-inspector { display: none; }
    .sim-show-lt-xl { display: inline-flex; }
}
@media (max-width: 1023px) {
    .sim-rail { display: none; }
    .strip { display: block; }
    .sim-show-lt-lg { display: inline-flex; }
    .sim-scroll { padding: var(--s5) var(--s4) var(--s6); }
}
@media (max-width: 767px) {
    .sim-bar { padding: var(--s2) var(--s3); flex-wrap: wrap; gap: var(--s2); }
    .sim-bar-copy .eyebrow { display: none; }
    .sim-bar-title { font-size: var(--text-sm); white-space: normal; }
    .sim-bar-actions { width: 100%; }
    .sim-bar-actions .segmented { flex: 1; }
    .sim-bar-actions .segmented > button { flex: 1; }
    .sim-scroll { padding: var(--s4) var(--s3) var(--s6); }
}
`;
