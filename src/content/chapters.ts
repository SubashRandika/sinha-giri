import type { YearEase } from "@/lib/time/curve";

export type ChapterId =
  | "hero"
  | "rock"
  | "king"
  | "city"
  | "gardens"
  | "ascent"
  | "lion"
  | "frescoes"
  | "summit"
  | "mirror"
  | "time"
  | "discovery"
  | "today"
  | "visit"
  | "thennow"
  | "finale";

export type VisualMode = "modern" | "transition" | "ancient";

export interface HistoricalChapter {
  id: ChapterId;
  /** Chapter number shown in navigation; null for hero, coda and finale. */
  index: number | null;
  navLabel: string;
  title: string;
  /** Year range the visitor travels through inside this chapter. */
  years: [number, number];
  yearEase: YearEase;
  /** Scroll length of the chapter, in viewport heights (desktop). */
  length: number;
  visualMode: VisualMode;
  /** Short factual note for the Discover panel. */
  discover?: { label: string; body: string };
  sources: string[];
}

export const CHAPTERS: HistoricalChapter[] = [
  {
    id: "hero",
    index: null,
    navLabel: "Start",
    title: "Sigiriya",
    years: [2026, 2026],
    yearEase: "linear",
    length: 1.6,
    visualMode: "modern",
    sources: ["unesco"],
  },
  {
    id: "rock",
    index: 1,
    navLabel: "Rock",
    title: "The Rock",
    years: [2026, 2026],
    yearEase: "linear",
    length: 2.2,
    visualMode: "modern",
    discover: {
      label: "Discover the rock",
      body: "A granite outcrop rising about 180 metres above the surrounding plain in Sri Lanka’s Central Province. Its name comes from Sinhagiri, “Lion Rock”.",
    },
    sources: ["unesco", "sltda"],
  },
  {
    id: "king",
    index: 2,
    navLabel: "King",
    title: "Kashyapa I",
    years: [2026, 495],
    yearEase: "plunge",
    length: 3.8,
    visualMode: "transition",
    discover: {
      label: "Discover the king",
      body: "The Cūḷavaṃsa chronicle records that Kashyapa I moved the royal capital from Anuradhapura to Sigiriya. His reign is usually dated 477–495 CE. After his death the capital returned to Anuradhapura.",
    },
    sources: ["unesco", "culavamsa"],
  },
  {
    id: "city",
    index: 3,
    navLabel: "City",
    title: "The City",
    years: [495, 493],
    yearEase: "linear",
    length: 2.8,
    visualMode: "ancient",
    discover: {
      label: "Discover the city plan",
      body: "The capital was laid out around the rock: moats and ramparts enclosing an inner city, a symmetrical axis of water gardens to the west, boulder and terraced gardens at the rock’s foot, and the royal precinct on the summit.",
    },
    sources: ["unesco", "bandaranayake"],
  },
  {
    id: "gardens",
    index: 4,
    navLabel: "Gardens",
    title: "The Water Gardens",
    years: [493, 490],
    yearEase: "linear",
    length: 3.4,
    visualMode: "transition",
    discover: {
      label: "Discover the water gardens",
      body: "The gardens combine symmetrical pools, channels and fountains fed by gravity through surface and underground conduits. They are among the oldest surviving landscaped gardens in Asia.",
    },
    sources: ["unesco", "ccf", "bandaranayake"],
  },
  {
    id: "ascent",
    index: 5,
    navLabel: "Ascent",
    title: "The Ascent",
    years: [490, 487],
    yearEase: "linear",
    length: 3.0,
    visualMode: "ancient",
    sources: ["unesco"],
  },
  {
    id: "lion",
    index: 6,
    navLabel: "Lion",
    title: "The Lion Gate",
    years: [487, 484],
    yearEase: "linear",
    length: 3.8,
    visualMode: "transition",
    discover: {
      label: "Discover the Lion Gate",
      body: "The final stairway to the summit passed through a colossal lion built of brick and plaster against the rock. Today only the paws survive. The shape of the body and head shown here is an artistic interpretation.",
    },
    sources: ["unesco", "bandaranayake"],
  },
  {
    id: "frescoes",
    index: 7,
    navLabel: "Frescoes",
    title: "The Frescoes",
    years: [484, 481],
    yearEase: "linear",
    length: 3.2,
    visualMode: "ancient",
    discover: {
      label: "Discover the paintings",
      body: "Painted on plaster in a sheltered pocket of the western rock face, only a small group of the paintings survive. Who the women are is still debated: celestial beings, ladies of the court and figures in a religious procession are among the readings scholars have proposed.",
    },
    sources: ["unesco", "sltda"],
  },
  {
    id: "summit",
    index: 8,
    navLabel: "Summit",
    title: "The Palace Above the Forest",
    years: [481, 477],
    yearEase: "linear",
    length: 3.0,
    visualMode: "ancient",
    discover: {
      label: "Discover the summit",
      body: "Brick foundations, terraces and a large rock-cut cistern survive on the 1.6-hectare summit. What the palace buildings above them looked like is not known; this view is an interpretation.",
    },
    sources: ["unesco", "bandaranayake"],
  },
  {
    id: "mirror",
    index: 9,
    navLabel: "Mirror wall",
    title: "The Mirror Wall",
    years: [477, 1000],
    yearEase: "linear",
    length: 3.4,
    visualMode: "transition",
    discover: {
      label: "Discover the verses",
      body: "The wall’s plaster was once highly polished. Visitors later scratched hundreds of verses into it, most dated to between the 8th and 10th centuries, many addressed to the painted women.",
    },
    sources: ["paranavitana", "unesco"],
  },
  {
    id: "time",
    index: 10,
    navLabel: "Time",
    title: "The Fall of Time",
    years: [1000, 1850],
    yearEase: "linear",
    length: 4.0,
    visualMode: "transition",
    sources: ["unesco"],
  },
  {
    id: "discovery",
    index: 11,
    navLabel: "Discovery",
    title: "Found, Measured, Conserved",
    years: [1850, 1982],
    yearEase: "linear",
    length: 3.0,
    visualMode: "modern",
    discover: {
      label: "Discover the archaeology",
      body: "Systematic excavation began in the 1890s under H. C. P. Bell of the Archaeological Survey of Ceylon. Since the 1980s the Central Cultural Fund has led excavation and conservation at the site.",
    },
    sources: ["ccf", "unesco"],
  },
  {
    id: "today",
    index: 12,
    navLabel: "Today",
    title: "Sigiriya Today",
    years: [1982, 2026],
    yearEase: "linear",
    length: 3.2,
    visualMode: "modern",
    sources: ["unesco"],
  },
  {
    id: "visit",
    index: null,
    navLabel: "Visit",
    title: "Walk It Today",
    years: [2026, 2026],
    yearEase: "linear",
    length: 4.6,
    visualMode: "modern",
    discover: {
      label: "Plan a visit",
      body: "The usual route runs east through the water gardens and boulder gardens, up stairways and the gallery past the frescoes and Mirror Wall, to the Lion Gate terrace and the final climb to the summit.",
    },
    sources: ["sltda", "ccf"],
  },
  {
    id: "thennow",
    index: null,
    navLabel: "Then / Now",
    title: "Two Sigiriyas",
    years: [2026, 2026],
    yearEase: "linear",
    length: 2.0,
    visualMode: "transition",
    sources: [],
  },
  {
    id: "finale",
    index: null,
    navLabel: "Epilogue",
    title: "It Left a Story",
    years: [2026, 2026],
    yearEase: "linear",
    length: 3.2,
    visualMode: "modern",
    sources: [],
  },
];

export const NAV_CHAPTERS = CHAPTERS.filter((c) => c.index !== null);
