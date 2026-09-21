import type { ChapterId } from "@/content/chapters";
import { lerp, overgrowth, smoothstep, span, standing } from "@/lib/time/curve";
import type { Camera, LayerState } from "./store";

/** What a chapter asks of the world at a given moment. */
export interface Look {
  layer: LayerState;
  vegetation: number;
  fog: number;
  warmth: number;
  exposure: number;
  drawing: number;
  silhouette: number;
  dust: number;
  climb: number;
}

const cam = (zoom: number, x: number, y: number): Camera => ({ zoom, x, y });
const camLerp = (a: Camera, b: Camera, t: number): Camera => ({
  zoom: lerp(a.zoom, b.zoom, t),
  x: lerp(a.x, b.x, t),
  y: lerp(a.y, b.y, t),
});

/** Defaults every chapter inherits: the physical state implied by the year. */
function base(year: number): Look {
  return {
    layer: { mode: "photo", plate: "aerial", mask: "accrete", reveal: standing(year), camera: cam(1.15, 0.6, 0.55) },
    vegetation: overgrowth(year),
    fog: 0.2,
    warmth: 0.2,
    exposure: 1,
    drawing: 0,
    silhouette: 0,
    dust: 0.25,
    climb: 0,
  };
}

type Choreo = (t: number, year: number) => Look;

/**
 * The single choreography table. Each chapter is a function of its local
 * progress `t` and of the world year; nothing else animates the world.
 */
export const CHOREOGRAPHY: Record<ChapterId, Choreo> = {
  hero: (t, year) => {
    const l = base(year);
    l.layer.camera = camLerp(cam(1.08, 0.6, 0.52), cam(1.2, 0.61, 0.55), t);
    l.fog = lerp(0.75, 0.55, t);
    l.warmth = 0.1;
    l.exposure = 0.92;
    return l;
  },

  rock: (t, year) => {
    const l = base(year);
    l.layer.camera = camLerp(cam(1.2, 0.61, 0.55), cam(1.55, 0.61, 0.54), t);
    l.fog = lerp(0.55, 0.28, t);
    l.warmth = lerp(0.1, 0.2, t);
    return l;
  },

  king: (t, year) => {
    const l = base(year);
    // Pull back from the rock to reveal the whole capital as it rebuilds.
    l.layer.camera = camLerp(cam(1.55, 0.61, 0.54), cam(1.08, 0.52, 0.56), smoothstep(0.05, 0.75, t));
    l.fog = lerp(0.28, 0.35, span(t, 0.3, 0.6)) - 0.2 * span(t, 0.6, 1);
    l.warmth = lerp(0.2, 0.45, span(t, 0.2, 0.8));
    l.exposure = 1 - 0.12 * Math.sin(Math.PI * span(t, 0.1, 0.5));
    return l;
  },

  city: (t, year) => {
    const l = base(year);
    l.layer.camera = camLerp(cam(1.08, 0.52, 0.56), cam(1.22, 0.45, 0.6), smoothstep(0, 1, t));
    l.fog = 0.15;
    l.warmth = 0.45;
    return l;
  },

  gardens: (t) => {
    const l = base(482);
    // Today's dry outlines first, then water returns through the system.
    l.layer = {
      mode: "photo",
      plate: "gardens",
      mask: "water",
      reveal: smoothstep(0.38, 0.86, t),
      camera: camLerp(cam(1.02, 0.5, 0.55), cam(1.32, 0.5, 0.52), t),
    };
    l.fog = 0.12;
    l.warmth = lerp(0.25, 0.4, t);
    return l;
  },

  ascent: (t) => {
    const l = base(485);
    l.layer = { mode: "rock", plate: "lion", mask: "accrete", reveal: 1, camera: cam(1, 0.5, 0.5) };
    l.climb = t;
    l.fog = 0.1 + 0.25 * t;
    l.warmth = 0.3;
    l.exposure = 0.95;
    l.dust = 0.8;
    return l;
  },

  lion: (t) => {
    const l = base(488);
    // Foundations, paws, body, head, entrance; then into the mouth.
    const build = smoothstep(0.1, 0.7, t);
    const enter = smoothstep(0.74, 1, t);
    l.layer = {
      mode: "photo",
      plate: "lion",
      mask: "rise",
      reveal: build,
      camera: camLerp(cam(1.04, 0.5, 0.52), cam(3.4, 0.5, 0.24), enter * enter),
    };
    l.exposure = 1 - enter;
    l.warmth = 0.4;
    l.fog = 0.08;
    l.dust = 0.5;
    return l;
  },

  frescoes: () => {
    const l = base(490);
    l.layer = { mode: "void", plate: "lion", mask: "accrete", reveal: 1, camera: cam(1, 0.5, 0.5) };
    l.exposure = 0;
    l.fog = 0;
    return l;
  },

  summit: (t) => {
    const l = base(495);
    l.layer = {
      mode: "photo",
      plate: "summit",
      mask: "accrete",
      reveal: smoothstep(0.04, 0.42, t),
      camera: camLerp(cam(1.14, 0.5, 0.4), cam(1.02, 0.5, 0.46), smoothstep(0, 1, t)),
    };
    l.warmth = lerp(0.35, 0.8, t);
    l.exposure = lerp(0.3, 1, span(t, 0, 0.15));
    l.fog = 0.18;
    return l;
  },

  mirror: () => {
    const l = base(700);
    l.layer = { mode: "void", plate: "summit", mask: "accrete", reveal: 1, camera: cam(1, 0.5, 0.5) };
    l.exposure = 0;
    return l;
  },

  time: (t, year) => {
    const l = base(year);
    l.layer = {
      mode: "photo",
      plate: "summit",
      mask: "accrete",
      reveal: standing(year),
      camera: camLerp(cam(1.25, 0.5, 0.45), cam(1.04, 0.5, 0.5), t),
    };
    l.fog = 0.15 + 0.35 * Math.sin(Math.PI * t);
    l.warmth = lerp(0.5, 0.1, t);
    l.exposure = lerp(1, 0.86, Math.sin(Math.PI * t));
    l.dust = 0.4;
    return l;
  },

  discovery: (t, year) => {
    const l = base(year);
    l.layer = { mode: "photo", plate: "aerial", mask: "accrete", reveal: 0, camera: camLerp(cam(1.05, 0.5, 0.55), cam(1.25, 0.55, 0.58), t) };
    l.drawing = smoothstep(0, 0.2, t) * (1 - smoothstep(0.88, 1, t));
    l.fog = 0;
    l.warmth = 0;
    l.dust = 0;
    return l;
  },

  today: (t) => {
    const l = base(2026);
    // Match-cut: ancient silhouette, modern silhouette, photograph.
    const cut = smoothstep(0.34, 0.37, t);
    l.layer = {
      mode: "photo",
      plate: "summit",
      mask: "accrete",
      reveal: 1 - cut,
      camera: camLerp(cam(1.12, 0.5, 0.48), cam(1.02, 0.5, 0.5), t),
    };
    l.silhouette = 1 - smoothstep(0.6, 0.78, t);
    l.warmth = 0.35;
    l.fog = 0.1;
    return l;
  },

  thennow: () => {
    const l = base(2026);
    l.layer = { mode: "void", plate: "aerial", mask: "accrete", reveal: 0, camera: cam(1, 0.5, 0.5) };
    l.exposure = 0;
    return l;
  },

  finale: () => {
    const l = base(2026);
    l.layer = { mode: "void", plate: "aerial", mask: "accrete", reveal: 0, camera: cam(1, 0.5, 0.5) };
    l.exposure = 0;
    l.dust = 0.15;
    return l;
  },
};
