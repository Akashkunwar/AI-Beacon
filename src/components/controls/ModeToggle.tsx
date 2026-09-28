import type { AppMode } from '@/lib/store/types';

/** Simple = plain-language explanations; Advanced = adds shapes, formulas and PyTorch code. */
export function ModeToggle({ mode, onToggle }: { mode: AppMode; onToggle: (mode: AppMode) => void }) {
    return (
        <div className="segmented" role="radiogroup" aria-label="Level of detail">
            {(['simple', 'advanced'] as const).map((m) => (
                <button
                    key={m}
                    type="button"
                    role="radio"
                    aria-checked={mode === m}
                    onClick={() => onToggle(m)}
                    title={m === 'simple' ? 'Plain-language explanations' : 'Also show tensor shapes, formulas and PyTorch code'}
                >
                    {m === 'simple' ? 'Simple' : 'Advanced'}
                </button>
            ))}
        </div>
    );
}
