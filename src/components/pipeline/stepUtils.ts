// Small helpers shared by the simulator steps.

import { useSimulatorStore } from '@/lib/store/simulatorStore';

/** True when the user has switched the simulator to Advanced mode. */
export function useIsAdvanced(): boolean {
    return useSimulatorStore((s) => s.mode === 'advanced');
}

/** Display form of a token (visible marker for whitespace-only strings). */
export function tokenText(t: string): string {
    return t.trim() === '' ? '␣' : t;
}
