import type { ChapterId } from "@/content/chapters";

export type PlateId = "aerial" | "gardens" | "lion" | "summit";
export type SceneMode = "photo" | "rock" | "void";
export type MaskMode = "accrete" | "rise" | "water";

export interface Camera {
  zoom: number;
  /** Focus point in plate coordinates (x right, y down, 0..1). */
  x: number;
  y: number;
}

/** Everything one layer of the world needs to render a frame. */
export interface LayerState {
  mode: SceneMode;
  plate: PlateId;
  mask: MaskMode;
  /** 0 = photograph of today, 1 = full reconstruction. */
  reveal: number;
  camera: Camera;
}

/**
 * The TimeTransition: the single physical state of the world at the
 * current scroll position. Written by the journey controller once per
 * frame, read by the WebGL world, the HUD and the audio engine.
 */
export interface TimeState {
  year: number;
  /** Signed centuries-per-second: how fast time is moving. */
  speed: number;
  chapter: ChapterId;
  /** Progress through the current chapter's pinned stage, 0..1. */
  local: number;
  /** Progress through the whole journey, 0..1. */
  journey: number;
  layerA: LayerState;
  layerB: LayerState;
  /** Crossfade between scene layers during chapter hand-offs. */
  layerMix: number;
  vegetation: number;
  fog: number;
  warmth: number;
  exposure: number;
  drawing: number;
  silhouette: number;
  dust: number;
  climb: number;
  /** 0..1 share of the frame that is reconstruction rather than photograph. */
  evidence: number;
}

const defaultLayer: LayerState = {
  mode: "photo",
  plate: "aerial",
  mask: "accrete",
  reveal: 0,
  camera: { zoom: 1.15, x: 0.6, y: 0.55 },
};

export const timeState: TimeState = {
  year: 2026,
  speed: 0,
  chapter: "hero",
  local: 0,
  journey: 0,
  layerA: { ...defaultLayer, camera: { ...defaultLayer.camera } },
  layerB: { ...defaultLayer, camera: { ...defaultLayer.camera } },
  layerMix: 0,
  vegetation: 0,
  fog: 0.9,
  warmth: 0.15,
  exposure: 0.9,
  drawing: 0,
  silhouette: 0,
  dust: 0.3,
  climb: 0,
  evidence: 0,
};

type Listener = (s: TimeState) => void;
const listeners = new Set<Listener>();

/** Frame subscribers are called after the state is written, once per tick. */
export function subscribeFrame(fn: Listener) {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

export function emitFrame() {
  for (const fn of listeners) fn(timeState);
}
