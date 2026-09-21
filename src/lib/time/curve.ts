/**
 * The time model. One number, `year`, is the physical state of the world.
 * Every visual and audible parameter is derived from it (plus the local
 * progress of the chapter the visitor is standing in).
 */

export const PRESENT = 2026;
export const REIGN_START = 477;
export const REIGN_END = 495;

export const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const smoothstep = (e0: number, e1: number, x: number) => {
  const t = clamp01((x - e0) / (e1 - e0));
  return t * t * (3 - 2 * t);
};
/** Local window: remaps t from [a,b] to [0,1], clamped. */
export const span = (t: number, a: number, b: number) => clamp01((t - a) / (b - a));

/**
 * How much of the royal city stands, as a function of the year.
 * Full through the reign and the early monastic centuries, decaying
 * between c. 1000 and c. 1600, ruins afterwards.
 */
export function standing(year: number) {
  return 1 - smoothstep(1000, 1600, year);
}

/**
 * How much the forest has reclaimed the site. Rises as the site is
 * abandoned, falls as it is cleared for survey and conservation.
 */
export function overgrowth(year: number) {
  return smoothstep(1100, 1450, year) * (1 - smoothstep(1860, 1990, year));
}

export type EraId = "royal" | "monastic" | "forest" | "survey" | "heritage";

export interface Stratum {
  id: EraId;
  label: string;
  from: number;
  to: number;
  /** Share of the stratigraphic column (narrative weight, not duration). */
  weight: number;
  /** SVG hatch pattern drawn in this layer, section-drawing style. */
  hatch: "brick" | "dots" | "roots" | "lines" | "plain";
}

/** Top of the column is the present; the deepest layer is the reign. */
export const STRATA: Stratum[] = [
  { id: "heritage", label: "World Heritage site", from: 1982, to: PRESENT, weight: 0.1, hatch: "plain" },
  { id: "survey", label: "Survey & excavation", from: 1850, to: 1982, weight: 0.13, hatch: "lines" },
  { id: "forest", label: "The forest returns", from: 1300, to: 1850, weight: 0.2, hatch: "roots" },
  { id: "monastic", label: "Monastery & visitors", from: REIGN_END, to: 1300, weight: 0.25, hatch: "dots" },
  { id: "royal", label: "Royal capital · Kashyapa I", from: REIGN_START, to: REIGN_END, weight: 0.32, hatch: "brick" },
];

export function eraOf(year: number): Stratum {
  for (const s of STRATA) if (year >= s.from) return s;
  return STRATA[STRATA.length - 1];
}

/** Depth in the column: 0 = surface (present), 1 = bottom of the reign. */
export function depthOf(year: number) {
  let top = 0;
  for (const s of STRATA) {
    if (year >= s.from || s === STRATA[STRATA.length - 1]) {
      const t = clamp01((s.to - year) / (s.to - s.from));
      return top + t * s.weight;
    }
    top += s.weight;
  }
  return 1;
}

/** Older dates are approximate, so they are rounded and marked "c.". */
export function formatYear(year: number): { value: string; suffix: string; approx: boolean } {
  const y = Math.round(year);
  if (y >= 1500) return { value: String(y), suffix: "", approx: false };
  const r = Math.round(y / 10) * 10;
  return { value: String(Math.max(REIGN_START, r)), suffix: "CE", approx: true };
}

export type YearEase = "linear" | "plunge" | "rise" | "inOut";

export function easeYear(kind: YearEase, t: number) {
  switch (kind) {
    case "plunge":
      // Centuries fly past, then time slows as the reign approaches.
      return 1 - Math.pow(1 - t, 2.2);
    case "rise":
      return t * t;
    case "inOut":
      return t * t * (3 - 2 * t);
    default:
      return t;
  }
}
