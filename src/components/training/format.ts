// Number formatting for the training module.

export const fmtBig = (n: number): string => {
    if (n >= 1e12) return `${+(n / 1e12).toFixed(n >= 1e14 ? 0 : 1)}T`;
    if (n >= 1e9) return `${+(n / 1e9).toFixed(n >= 1e10 ? 0 : 1)}B`;
    if (n >= 1e6) return `${+(n / 1e6).toFixed(n >= 1e7 ? 0 : 1)}M`;
    if (n >= 1e3) return `${+(n / 1e3).toFixed(n >= 1e4 ? 0 : 1)}K`;
    return `${Math.round(n)}`;
};

/** 3.8e25 → "3.8 × 10²⁵" */
export function sci(n: number, digits = 1): string {
    const exp = Math.floor(Math.log10(n));
    const mant = n / 10 ** exp;
    const sup = String(exp).split('').map((c) => '⁰¹²³⁴⁵⁶⁷⁸⁹'[+c] ?? c).join('');
    return `${mant.toFixed(digits)} × 10${sup}`;
}
