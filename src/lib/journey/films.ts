import type { PlateImage } from "./plates";

export type FilmId =
  | "dawn"
  | "rise"
  | "aerial-time"
  | "gardens-time"
  | "gardens-walk"
  | "lion-walk"
  | "lion-time"
  | "summit-fall"
  | "summit-orbit";

/**
 * How a clip relates to the evidence. Every clip is generated with Higgsfield
 * from a real photograph (its first frame); "animated" clips only add camera
 * and atmosphere, "timelapse" clips end on a reconstruction.
 */
export type FilmKind = "animated" | "timelapse";

/**
 * `aspect` is the clip's true picture shape. The 1080p masters were upscaled
 * into a 16:9 frame, so their pixels can be stretched; sampling with this
 * aspect puts the picture back in proportion.
 */
export interface Film extends Pick<PlateImage, "aspect" | "zoom" | "dx" | "dy"> {
  id: FilmId;
  kind: FilmKind;
}

const film = (id: FilmId, kind: FilmKind, w: number, h: number, fit: Partial<Film> = {}): Film => ({ id, kind, aspect: w / h, ...fit });

export const FILMS: Record<FilmId, Film> = {
  dawn: film("dawn", "animated", 1280, 720),
  rise: film("rise", "animated", 1280, 720),
  "aerial-time": film("aerial-time", "timelapse", 1280, 720),
  "gardens-time": film("gardens-time", "timelapse", 1208, 760),
  "gardens-walk": film("gardens-walk", "animated", 1208, 760),
  "lion-walk": film("lion-walk", "animated", 1200, 764),
  "lion-time": film("lion-time", "timelapse", 1200, 764),
  // Starts on the summit reconstruction, so it shares that plate's alignment.
  "summit-fall": film("summit-fall", "timelapse", 1276, 720, { zoom: 1.1, dx: 0.025, dy: 0 }),
  "summit-orbit": film("summit-orbit", "animated", 1476, 620),
};

export type FilmSize = 480 | 720 | 1080;

/** Picks the lightest encoding that still looks sharp on this screen. */
export function filmSize(): FilmSize {
  const px = window.innerWidth * Math.min(window.devicePixelRatio || 1, 2);
  return px <= 900 ? 480 : px < 1700 ? 720 : 1080;
}

export function filmUrl(id: FilmId, size: FilmSize) {
  return `/films/${id}-${size}.mp4`;
}

/** Clips that have decoded a frame and can replace their plate. Written by the world canvas. */
export const readyFilms = new Set<FilmId>();
