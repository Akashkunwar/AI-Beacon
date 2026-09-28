// Theme-aware colour helpers for data visualisations.
// They return CSS `color-mix()` expressions built from design tokens, so every
// chart automatically adapts to the light and dark themes.

/** A token colour at the given opacity (0–1), e.g. tint('--viz-1', 0.4). */
export function tint(token: string, alpha: number): string {
    const pct = Math.round(Math.max(0, Math.min(1, alpha)) * 100);
    return `color-mix(in srgb, var(${token}) ${pct}%, transparent)`;
}

/** Sequential heat scale between --viz-heat-lo (t=0) and --viz-heat-hi (t=1). */
export function heat(t: number): string {
    const pct = Math.round(Math.max(0, Math.min(1, t)) * 100);
    return `color-mix(in srgb, var(--viz-heat-hi) ${pct}%, var(--viz-heat-lo))`;
}

/** Diverging fill: positive → --viz-1, negative → --viz-neg; |v| (0–1) sets opacity. */
export function signed(v: number, minAlpha = 0.15, range = 0.75): string {
    const a = minAlpha + Math.min(1, Math.abs(v)) * range;
    return v >= 0 ? tint('--viz-1', a) : tint('--viz-neg', a);
}
