import { FRAME_ASPECT } from "./projection";
import type { PlateId } from "./store";

export interface PlateImage {
  /** Base path without width suffix, e.g. /plates/aerial-modern */
  src: string;
  aspect: number;
  /** Alignment tweak inside the 16:9 frame: extra zoom and uv offset. */
  zoom?: number;
  dx?: number;
  dy?: number;
  alt: string;
}

export interface Plate {
  id: PlateId;
  modern: PlateImage;
  ancient: PlateImage;
}

export const PLATES: Record<PlateId, Plate> = {
  aerial: {
    id: "aerial",
    modern: { src: "/plates/aerial-modern", aspect: 1280 / 720, alt: "Aerial photograph of Sigiriya rock rising above the forest, with the Pidurangala rock behind it." },
    ancient: { src: "/plates/aerial-ancient", aspect: 1280 / 724, alt: "Cinematic reconstruction: the same aerial view with a palace on the summit, moats, water gardens and a city at the rock’s foot." },
  },
  gardens: {
    id: "gardens",
    modern: { src: "/plates/gardens-modern", aspect: 2400 / 1515, alt: "Photograph of the water gardens today: brick outlines of pools on a central path leading toward the rock." },
    ancient: { src: "/plates/gardens-ancient", aspect: 1280 / 724, alt: "Cinematic reconstruction: the pools filled with water, fountains running and a pavilion on an island." },
  },
  lion: {
    id: "lion",
    modern: { src: "/plates/lion-modern", aspect: 2400 / 1528, alt: "Photograph of the Lion Gate today: two giant lion paws in brick and plaster either side of a stairway, with a metal staircase above." },
    ancient: { src: "/plates/lion-ancient", aspect: 1280 / 724, alt: "Cinematic reconstruction: a colossal plastered lion against the rock, the stairway climbing into its open mouth." },
  },
  summit: {
    id: "summit",
    modern: { src: "/plates/summit-modern", aspect: 2400 / 1011, alt: "Aerial photograph of the summit: brick foundations and terraces on the flat top of the rock." },
    // Calibrated so the rock rim lines up with the tighter present-day photograph.
    ancient: { src: "/plates/summit-ancient", aspect: 1280 / 724, zoom: 1.1, dx: 0.025, dy: 0, alt: "Cinematic interpretation: plastered terraces, pillared halls with tiled roofs and a rock-cut pool on the summit at sunset." },
  },
};

/** Texture-space fit (scale.xy, offset.xy) that covers the 16:9 frame. */
export function fitOf(img: Pick<PlateImage, "aspect" | "zoom" | "dx" | "dy">): [number, number, number, number] {
  const z = img.zoom ?? 1;
  const sx = img.aspect > FRAME_ASPECT ? FRAME_ASPECT / img.aspect : 1;
  const sy = img.aspect > FRAME_ASPECT ? 1 : img.aspect / FRAME_ASPECT;
  return [sx / z, sy / z, img.dx ?? 0, img.dy ?? 0];
}

/** The same calibration as a CSS transform, for plain <img> comparisons. */
export function cssFit(img: PlateImage): string | undefined {
  const z = img.zoom ?? 1;
  if (z === 1 && !img.dx && !img.dy) return undefined;
  const tx = -(img.dx ?? 0) * z * 100;
  const ty = (img.dy ?? 0) * z * 100;
  return `translate(${tx.toFixed(2)}%, ${ty.toFixed(2)}%) scale(${z})`;
}

export function plateUrl(img: PlateImage, width: 1280 | 2400) {
  return `${img.src}-${width}.webp`;
}
