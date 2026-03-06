/* ─── Timeline Utilities ─── */

export interface LLMModel {
    id: number;
    company: string;
    company_website: string;
    company_logo_url: string;
    model_family: string;
    model_name: string;
    model_version: string;
    model_type: string;
    architecture: string;
    modalities: string[];
    parameters: number | null;
    parameter_unit: 'million' | 'billion' | null;
    training_tokens: number | null;
    open_source: boolean;
    license: string;
    api_available: boolean;
    context_window_tokens: number | null;
    training_data_cutoff: string | null;
    release_date: string;
    country: string;
    description: string;
    use_cases: string[];
    notable_features: string[];
    benchmark_scores: Record<string, any>;
    pricing_per_1m_tokens: {
        input: number | null;
        output: number | null;
    };
    official_model_link: string | null;
    huggingface_url: string | null;
    paper_url: string | null;
    predecessor: string | null;
    successor: string | null;

    // Extensions for Research Papers
    title?: string;
    authors?: string[];
    institution?: string;
    published_in?: string;
    topic?: string;
    key_contributions?: string[];
    citations?: number;
    code_url?: string | null;
}

export type PlacedModel = LLMModel & {
    laneIndex: number;
    laneDirection: 'above' | 'below';
    laneOffset: number;
};

export function formatParams(parameters: number | null, unit: 'million' | 'billion' | null): string {
    if (parameters === null) return '—';
    if (unit === 'billion') return `${parameters}B`;
    if (unit === 'million') return `${parameters}M`;
    return `${parameters}`;
}

export function formatDate(dateString: string | null, format: 'short' | 'long' | 'mono'): string {
    if (!dateString) return '—';

    // dateString is expected to be YYYY-MM-DD
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '—';

    if (format === 'short') {   // "Jun 2020"
        return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    }
    if (format === 'long') {    // "June 11, 2020"
        return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    }
    if (format === 'mono') {    // "2020-06-11"
        return date.toISOString().split('T')[0];
    }
    return '—';
}

export function formatContextWindow(tokens: number | null, format: 'short' | 'long' = 'short'): string {
    if (tokens === null) return '—';
    if (format === 'long') {
        return `${tokens.toLocaleString()} tokens`;
    }
    if (tokens >= 1000) {
        return `${tokens / 1000}K`;
    }
    return `${tokens}`;
}

export function formatCutoff(cutoffString: string | null): string {
    if (!cutoffString) return '—';
    // cutoffString is "YYYY-MM"
    const [year, month] = cutoffString.split('-');
    if (!year || !month) return '—';

    const date = new Date(parseInt(year), parseInt(month) - 1);
    if (isNaN(date.getTime())) return '—';

    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

// Global baseline for timeline mapping defaults to 2017, but can be dynamic
const START_MONTH = 0; // 0-indexed Jan

function getMonthIndex(dateString: string, startYear: number): number {
    const [year, month, day] = dateString.split('-');
    if (!year || !month) return 0;

    const y = parseInt(year);
    const m = parseInt(month) - 1; // 0-11
    // Default to 1st of month if day is missing, though the dataset usually has YYYY-MM-DD
    const d = day ? parseInt(day) : 1;

    // We can assume roughly 30 days per month for the visual fraction
    const fraction = Math.min((d - 1) / 30, 0.99);

    return (y - startYear) * 12 + (m - START_MONTH) + fraction;
}

// 2023 onwards is scaled 2.8x to accommodate denser model releases
export function getPixelPosition(monthIndex: number, basePPM: number, startYear: number): number {
    const threshold = (2023 - startYear) * 12;
    const scaleFactor = 2.8; // Increased zoom by 40% from 2.0x

    if (monthIndex <= threshold) {
        return monthIndex * basePPM;
    } else {
        const basePixels = threshold * basePPM;
        const extraMonths = monthIndex - threshold;
        return basePixels + (extraMonths * basePPM * scaleFactor);
    }
}

export function getXPosition(dateString: string, basePPM: number, startYear: number): number {
    return getPixelPosition(getMonthIndex(dateString, startYear), basePPM, startYear);
}

export function assignLanes(models: LLMModel[], pixelsPerMonth: number, startYear: number): PlacedModel[] {
    const placedModels: PlacedModel[] = [];

    // Sort overall models by date to process in order
    const sorted = [...models].sort((a, b) => a.release_date.localeCompare(b.release_date));

    const laneSequence = [
        { dir: 'above', lanesFromSpine: 1 }, // Index 0
        { dir: 'below', lanesFromSpine: 1 }, // Index 1
        { dir: 'above', lanesFromSpine: 2 }, // Index 2
        { dir: 'below', lanesFromSpine: 2 }, // Index 3
        { dir: 'above', lanesFromSpine: 3 }, // Index 4
        { dir: 'below', lanesFromSpine: 3 }, // Index 5
        { dir: 'above', lanesFromSpine: 4 }, // Index 6
        { dir: 'below', lanesFromSpine: 4 }, // Index 7
    ] as const;

    const LANE_HEIGHT = 70;

    // Track when each lane is free again (in absolute pixel X-coordinate)
    // TimelineNode component has a fixed width of 120px.
    // X coordinate maps to the exact center (translateX(-50%)).
    // To avoid overlap, the next node's center must be at least 120px + gap away.
    const MODEL_PIXEL_WIDTH = 136; // 120px width + 16px gap
    const laneNextAvailableX = new Array(laneSequence.length).fill(-Infinity);

    for (const model of sorted) {
        const xPos = getXPosition(model.release_date, pixelsPerMonth, startYear);

        // Find first lane that is available
        let assignedLane = -1;
        for (let i = 0; i < laneSequence.length; i++) {
            if (xPos >= laneNextAvailableX[i]) {
                assignedLane = i;
                break;
            }
        }

        // If all lanes are full, force pick the one that becomes available first
        if (assignedLane === -1) {
            let minVal = Infinity;
            let minIdx = laneSequence.length - 1; // default fallback
            for (let i = 0; i < laneSequence.length; i++) {
                if (laneNextAvailableX[i] < minVal) {
                    minVal = laneNextAvailableX[i];
                    minIdx = i;
                }
            }
            assignedLane = minIdx;
        }

        // Reserve this lane until the model's visual width is cleared
        laneNextAvailableX[assignedLane] = xPos + MODEL_PIXEL_WIDTH;

        const seq = laneSequence[assignedLane];

        placedModels.push({
            ...model,
            laneIndex: assignedLane,
            laneDirection: seq.dir,
            laneOffset: seq.lanesFromSpine * LANE_HEIGHT
        });
    }

    return placedModels;
}
