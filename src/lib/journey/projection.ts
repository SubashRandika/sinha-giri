import type { Camera } from "./store";

/** Every plate is composed inside a 16:9 frame; textures are fitted into it. */
export const FRAME_ASPECT = 16 / 9;

/** Visible share of the frame at zoom 1 when it covers a viewport. */
export function coverExtent(viewAspect: number): [number, number] {
  return viewAspect > FRAME_ASPECT ? [1, FRAME_ASPECT / viewAspect] : [viewAspect / FRAME_ASPECT, 1];
}

/** Keeps the camera inside the frame so no edge is ever sampled. */
export function clampCamera(cam: Camera, viewAspect: number): Camera {
  const [kx, ky] = coverExtent(viewAspect);
  const zoom = Math.max(1, cam.zoom);
  const hx = kx / (2 * zoom);
  const hy = ky / (2 * zoom);
  return {
    zoom,
    x: Math.min(1 - hx, Math.max(hx, cam.x)),
    y: Math.min(1 - hy, Math.max(hy, cam.y)),
  };
}

/** Plate coordinates (0..1, y down) to screen fractions (0..1, y down). */
export function plateToScreen(px: number, py: number, cam: Camera, viewAspect: number): [number, number] {
  const [kx, ky] = coverExtent(viewAspect);
  const c = clampCamera(cam, viewAspect);
  return [((px - c.x) * c.zoom) / kx + 0.5, ((py - c.y) * c.zoom) / ky + 0.5];
}
