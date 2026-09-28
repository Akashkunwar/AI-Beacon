/* ─── Timeline utilities: formatting + canvas layout ─── */

/** URL-safe identifier derived from a name, e.g. "GPT-4o mini" → "gpt-4o-mini". */
export function slugify(name: string): string {
    return name
        .toLowerCase()
        .replace(/\+/g, ' plus ')
        .normalize('NFKD')
        .replace(/[̀-ͯ]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

export function formatParams(parameters: number | null, unit: 'million' | 'billion' | null): string {
    if (parameters === null) return '—';
    if (unit === 'million') return `${parameters}M`;
    if (unit === 'billion') return parameters >= 1000 ? `${+(parameters / 1000).toFixed(2)}T` : `${parameters}B`;
    return `${parameters}`;
}

export function formatDate(dateString: string | null, format: 'short' | 'long' | 'mono'): string {
    if (!dateString) return '—';

    // dateString is expected to be YYYY-MM-DD. Date-only ISO strings parse as
    // UTC midnight, so format in UTC too — otherwise users west of Greenwich
    // would see the previous day (and "2020-06-01" would read as "May 2020").
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '—';

    if (format === 'short') {   // "Jun 2020"
        return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric', timeZone: 'UTC' });
    }
    if (format === 'long') {    // "June 11, 2020"
        return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
    }
    if (format === 'mono') {    // "2020-06-11"
        return date.toISOString().split('T')[0];
    }
    return '—';
}

/** Long date, or "Month YYYY" when only the month is known. */
export function formatDatePrecise(dateString: string, precision: 'day' | 'month' = 'day'): string {
    if (precision === 'month') {
        const d = new Date(dateString);
        if (isNaN(d.getTime())) return '—';
        return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' });
    }
    return formatDate(dateString, 'long');
}

export function formatContextWindow(tokens: number | null, format: 'short' | 'long' = 'short'): string {
    if (tokens === null) return '—';
    if (format === 'long') {
        return `${tokens.toLocaleString('en-US')} tokens`;
    }
    if (tokens >= 1_000_000) {
        return `${+(tokens / 1_000_000).toFixed(2)}M`;
    }
    if (tokens >= 1000) {
        return `${Math.round(tokens / 1000)}K`;
    }
    return `${tokens}`;
}

export function formatCutoff(cutoffString: string | null): string {
    if (!cutoffString) return '—';
    // cutoffString is "YYYY-MM"
    const [year, month] = cutoffString.split('-');
    if (!year || !month) return '—';
    const date = new Date(Date.UTC(parseInt(year), parseInt(month) - 1, 1));
    if (isNaN(date.getTime())) return '—';
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' });
}

export function formatPrice(p: { input: number | null; output: number | null } | undefined): string {
    if (!p || p.input == null || p.output == null) return '—';
    const f = (n: number) => `$${n < 1 ? n.toFixed(2).replace(/0$/, '') : n % 1 === 0 ? n.toFixed(0) : n.toFixed(2)}`;
    return `${f(p.input)} in / ${f(p.output)} out`;
}

// ─── Canvas layout ──────────────────────────────────────────────────────────
// The timeline is a horizontal axis of months. Each month gets a width that is
// at least `basePx`, and wide enough that all of its entries fit across the
// available lanes without overlapping. Busy months therefore expand
// automatically (no hard-coded "zoom 2023+" rule) and quiet years stay compact.

export interface LayoutInput {
    id: number;
    date: string; // YYYY-MM-DD
}

export interface PlacedNode {
    id: number;
    x: number;        // centre of the card, in px
    dateX: number;    // true date position on the axis, in px
    lane: number;     // 0..lanes-1
    above: boolean;
    level: number;    // 1..lanesPerSide, distance from the spine
}

export interface TimelineLayout {
    startYear: number;
    endYear: number;
    width: number;
    /** x offset of the start of each month (length = months + 1) */
    monthStarts: number[];
    nodes: PlacedNode[];
    /** x position → year, for the "active year" indicator */
    yearAt: (x: number) => number;
    /** x position of a date */
    xOf: (date: string) => number;
}

export interface LayoutOptions {
    basePx: number;       // minimum px per month
    nodeWidth: number;    // card width incl. gap
    lanesPerSide: number;
    startYear?: number;
    endYear?: number;
}

function parseYMD(date: string): { y: number; m: number; d: number } {
    const [y, m, d] = date.split('-').map((v) => parseInt(v, 10));
    return { y, m: (m || 1) - 1, d: d || 1 };
}

export function layoutTimeline(items: LayoutInput[], opts: LayoutOptions): TimelineLayout {
    const { basePx, nodeWidth, lanesPerSide } = opts;
    const lanes = lanesPerSide * 2;
    const years = items.map((i) => parseYMD(i.date).y);
    const startYear = opts.startYear ?? (years.length ? Math.min(...years) : 2017);
    const endYear = opts.endYear ?? (years.length ? Math.max(...years) : 2026);
    const months = (endYear - startYear + 1) * 12;

    // 1. Month widths from density.
    const counts = new Array<number>(months).fill(0);
    for (const it of items) {
        const { y, m } = parseYMD(it.date);
        const idx = (y - startYear) * 12 + m;
        if (idx >= 0 && idx < months) counts[idx]++;
    }
    const widths = counts.map((c) => Math.max(basePx, Math.ceil(c / lanes) * nodeWidth * 1.15));
    const monthStarts = [0];
    for (let i = 0; i < months; i++) monthStarts.push(monthStarts[i] + widths[i]);
    const width = monthStarts[months];

    const xOf = (date: string) => {
        const { y, m, d } = parseYMD(date);
        const idx = Math.max(0, Math.min(months - 1, (y - startYear) * 12 + m));
        const frac = Math.min((d - 1) / 30, 0.97);
        return monthStarts[idx] + frac * widths[idx];
    };

    // 2. Lane assignment: nearest-to-spine free lane first; if every lane is
    //    busy, nudge the card right to the earliest free slot (never overlap).
    const order = Array.from({ length: lanes }, (_, i) => i); // 0: above-1, 1: below-1, 2: above-2 …
    const laneFreeAt = new Array<number>(lanes).fill(-Infinity);
    const sorted = [...items].sort((a, b) => a.date.localeCompare(b.date) || a.id - b.id);
    const nodes: PlacedNode[] = [];
    for (const it of sorted) {
        const dateX = xOf(it.date);
        let lane = order.find((l) => laneFreeAt[l] <= dateX);
        let x = dateX;
        if (lane === undefined) {
            lane = order.reduce((best, l) => (laneFreeAt[l] < laneFreeAt[best] ? l : best), 0);
            x = laneFreeAt[lane];
        }
        laneFreeAt[lane] = x + nodeWidth;
        nodes.push({ id: it.id, x, dateX, lane, above: lane % 2 === 0, level: Math.floor(lane / 2) + 1 });
    }

    const yearStarts = Array.from({ length: endYear - startYear + 1 }, (_, i) => monthStarts[i * 12]);
    const yearAt = (x: number) => {
        let yr = startYear;
        for (let i = 0; i < yearStarts.length; i++) if (x >= yearStarts[i]) yr = startYear + i;
        return yr;
    };

    return { startYear, endYear, width: Math.max(width, ...nodes.map((n) => n.x + nodeWidth)), monthStarts, nodes, yearAt, xOf };
}
