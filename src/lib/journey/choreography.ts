import type { ChapterId } from "@/content/chapters";
import { lerp, overgrowth, smoothstep, span, standing } from "@/lib/time/curve";
import type { FilmId } from "./films";
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

/** No footage: the plate and its reveal mask carry the scene. */
const still = { film0: null, time0: 0, film1: null, time1: 0, filmMix: 0 } as const;
/** One clip, scrubbed to `time` (0..1) or playing by itself (-1). */
const film = (id: FilmId, time: number) => ({ film0: id, time0: time, film1: null, time1: 0, filmMix: 0 });

/** Defaults every chapter inherits: the physical state implied by the year. */
function base(year: number): Look {
  return {
    layer: { mode: "photo", plate: "aerial", mask: "accrete", reveal: standing(year), camera: cam(1.15, 0.6, 0.55), ...still },
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
    // Dawn drone footage plays by itself; scroll adds only a slight push.
    Object.assign(l.layer, film("dawn", -1));
    l.layer.camera = camLerp(cam(1.04, 0.6, 0.52), cam(1.12, 0.61, 0.54), t);
    l.fog = lerp(0.5, 0.35, t);
    l.warmth = 0.1;
    l.exposure = 0.92;
    return l;
  },

  rock: (t, year) => {
    const l = base(year);
    // Scroll pulls the drone back until the rock stands alone in the forest.
    Object.assign(l.layer, film("rise", smoothstep(0.02, 0.95, t)));
    l.layer.camera = cam(1.06, 0.58, 0.54);
    l.fog = lerp(0.55, 0.28, t);
    l.warmth = lerp(0.1, 0.2, t);
    return l;
  },

  king: (t, year) => {
    const l = base(year);
    // Pull back from the rock to reveal the whole capital as it rebuilds.
    // The time-lapse runs on the year itself: each frame is a point in time.
    Object.assign(l.layer, film("aerial-time", l.layer.reveal));
    l.layer.camera = camLerp(cam(1.14, 0.58, 0.54), cam(1.04, 0.52, 0.56), smoothstep(0.05, 0.75, t));
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
    // Once the pools are full (t = 0.62) the fountains keep playing live
    // for the rest of the chapter. A gentle push keeps both basins in frame.
    const reveal = smoothstep(0.22, 0.62, t);
    l.layer = {
      mode: "photo",
      plate: "gardens",
      mask: "water",
      reveal,
      camera: camLerp(cam(1.0, 0.5, 0.56), cam(1.1, 0.5, 0.6), smoothstep(0, 1, t)),
      ...film("gardens-time", reveal),
    };
    l.fog = 0.04;
    l.warmth = lerp(0.1, 0.18, t);
    l.exposure = 1.04;
    l.dust = 0.12;
    return l;
  },

  ascent: (t) => {
    const l = base(485);
    l.layer = { mode: "rock", plate: "lion", mask: "accrete", reveal: 1, camera: cam(1, 0.5, 0.5), ...still };
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
      // Held at the top of the frame so the head stays whole as it rises,
      // then into the open mouth.
      camera: camLerp(cam(1.0, 0.5, 0.4), cam(3.4, 0.5, 0.32), enter * enter),
      ...film("lion-time", build),
    };
    l.exposure = 1 - enter;
    l.warmth = 0.4;
    l.fog = 0.08;
    l.dust = 0.5;
    return l;
  },

  frescoes: () => {
    const l = base(490);
    l.layer = { mode: "void", plate: "lion", mask: "accrete", reveal: 1, camera: cam(1, 0.5, 0.5), ...still };
    l.exposure = 0;
    l.fog = 0;
    return l;
  },

  summit: (t) => {
    const l = base(495);
    const reveal = smoothstep(0.04, 0.42, t);
    l.layer = {
      mode: "photo",
      plate: "summit",
      mask: "accrete",
      reveal,
      camera: camLerp(cam(1.14, 0.5, 0.4), cam(1.02, 0.5, 0.46), smoothstep(0, 1, t)),
      // The fall-of-time clip played backwards: the palace rebuilds.
      ...film("summit-fall", 1 - reveal),
    };
    l.warmth = lerp(0.35, 0.8, t);
    l.exposure = lerp(0.3, 1, span(t, 0, 0.15));
    l.fog = 0.18;
    return l;
  },

  mirror: () => {
    const l = base(700);
    l.layer = { mode: "void", plate: "summit", mask: "accrete", reveal: 1, camera: cam(1, 0.5, 0.5), ...still };
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
      ...film("summit-fall", 1 - standing(year)),
    };
    l.fog = 0.15 + 0.35 * Math.sin(Math.PI * t);
    l.warmth = lerp(0.5, 0.1, t);
    l.exposure = lerp(1, 0.86, Math.sin(Math.PI * t));
    l.dust = 0.4;
    return l;
  },

  discovery: (t, year) => {
    const l = base(year);
    l.layer = { mode: "photo", plate: "aerial", mask: "accrete", reveal: 0, camera: camLerp(cam(1.05, 0.5, 0.55), cam(1.25, 0.55, 0.58), t), ...still };
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
      // After the cut the photograph starts to move: a drone circles the summit.
      ...(cut >= 1 ? film("summit-orbit", span(t, 0.37, 1)) : still),
    };
    l.silhouette = 1 - smoothstep(0.6, 0.78, t);
    l.warmth = 0.35;
    l.fog = 0.1;
    return l;
  },

  visit: (t) => {
    const l = base(2026);
    // Three shots of a visit today, joined by dissolves: the water gardens,
    // the Lion Gate, and a last look back from the air.
    const shot = t < 0.45 ? "gardens" : t < 0.76 ? "lion" : "aerial";
    const early = t < 0.6;
    l.layer = {
      mode: "photo",
      plate: shot,
      mask: "accrete",
      reveal: 0,
      // A slow push carries the walk; it eases back as the drone shot takes over.
      camera: cam(lerp(1, 1.14, smoothstep(0, 0.5, t)) - 0.11 * smoothstep(0.72, 0.8, t), 0.5, 0.5),
      film0: early ? "gardens-walk" : "rise",
      time0: early ? span(t, 0, 0.45) : span(t, 0.74, 1),
      film1: "lion-walk",
      time1: span(t, 0.42, 0.78),
      filmMix: early ? smoothstep(0.4, 0.5, t) : 1 - smoothstep(0.72, 0.8, t),
    };
    l.fog = 0.08;
    l.warmth = 0.3;
    l.dust = 0.2;
    return l;
  },

  thennow: () => {
    const l = base(2026);
    l.layer = { mode: "void", plate: "aerial", mask: "accrete", reveal: 0, camera: cam(1, 0.5, 0.5), ...still };
    l.exposure = 0;
    return l;
  },

  finale: () => {
    const l = base(2026);
    l.layer = { mode: "void", plate: "aerial", mask: "accrete", reveal: 0, camera: cam(1, 0.5, 0.5), ...still };
    l.exposure = 0;
    l.dust = 0.15;
    return l;
  },
};
