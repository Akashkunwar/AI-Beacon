import { AUTOMATION_DATA, AUTOMATION_YEARS } from '@/data/automationData';
import type { SectorData, YearSnapshot } from '@/data/automationData';

/**
 * Linearly interpolates between two numbers.
 */
export function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * t;
}

/**
 * Parses a percentage string like "1.8%" to a number for interpolation.
 */
function parsePct(s: string): number {
  return parseFloat(s.replace('%', '')) || 0;
}

/**
 * Formats a number as a percentage string (e.g. 1.8 -> "1.8%").
 */
function formatPct(n: number): string {
  return `${n.toFixed(1)}%`;
}

/**
 * Returns the two bounding year keys for a given year float.
 */
function getBoundingYears(yearFloat: number): { floor: number; ceil: number } {
  const sorted = [...AUTOMATION_YEARS].sort((a, b) => a - b);
  let floor = sorted[0];
  let ceil = sorted[sorted.length - 1];
  for (let i = 0; i < sorted.length; i++) {
    if (sorted[i] <= yearFloat) floor = sorted[i];
    if (sorted[i] >= yearFloat) {
      ceil = sorted[i];
      break;
    }
  }
  return { floor, ceil };
}

export interface InterpolatedSnapshot {
  year: number;
  phase: string;
  isProjection: boolean;
  globalJobsAtRisk: number;
  globalGDPContribution: string;
  tasksAutomatable: number;
  newJobsCreated: number;
  jobsDisplaced: number;
  sectors: Record<string, SectorData>;
  milestones: string[];
  summary: string;
}

/**
 * Returns an interpolated snapshot for any year between FIRST_YEAR and LAST_YEAR.
 * Numeric fields are lerped; phase, summary, milestones and sector metadata come from the nearest year.
 */
export function getInterpolatedData(yearFloat: number): InterpolatedSnapshot {
  const { floor, ceil } = getBoundingYears(yearFloat);
  const dFloor = AUTOMATION_DATA[floor];
  const dCeil = AUTOMATION_DATA[ceil];

  if (floor === ceil) {
    return { ...dFloor, year: yearFloat };
  }

  const t = (yearFloat - floor) / (ceil - floor);
  const nearest = t >= 0.5 ? dCeil : dFloor;

  const sectors: Record<string, SectorData> = {};
  const sectorKeys = Object.keys(dFloor.sectors) as (keyof typeof dFloor.sectors)[];
  for (const key of sectorKeys) {
    const sFloor = dFloor.sectors[key];
    const sCeil = dCeil.sectors[key];
    if (!sFloor || !sCeil) continue;
    sectors[key] = {
      ...sFloor,
      automationPct: lerp(sFloor.automationPct, sCeil.automationPct, t),
      jobsAtRisk: Math.round(lerp(sFloor.jobsAtRisk, sCeil.jobsAtRisk, t)),
      description: nearest.sectors[key]?.description ?? sFloor.description,
      source: nearest.sectors[key]?.source ?? sFloor.source,
    };
  }

  const gdpNum = lerp(parsePct(dFloor.globalGDPContribution), parsePct(dCeil.globalGDPContribution), t);

  return {
    year: yearFloat,
    phase: nearest.phase,
    isProjection: nearest.isProjection,
    globalJobsAtRisk: Math.round(lerp(dFloor.globalJobsAtRisk, dCeil.globalJobsAtRisk, t)),
    globalGDPContribution: formatPct(gdpNum),
    tasksAutomatable: Math.round(lerp(dFloor.tasksAutomatable, dCeil.tasksAutomatable, t)),
    newJobsCreated: Math.round(lerp(dFloor.newJobsCreated, dCeil.newJobsCreated, t)),
    jobsDisplaced: Math.round(lerp(dFloor.jobsDisplaced, dCeil.jobsDisplaced, t)),
    sectors,
    milestones: nearest.milestones,
    summary: nearest.summary,
  };
}

/**
 * Returns the nearest full-year snapshot (no interpolation). Useful for context copy and sources.
 */
export function getNearestSnapshot(yearFloat: number): YearSnapshot {
  const yearInt = Math.round(yearFloat);
  const clamped = Math.max(2022, Math.min(2030, yearInt));
  return AUTOMATION_DATA[clamped] ?? AUTOMATION_DATA[2026];
}
