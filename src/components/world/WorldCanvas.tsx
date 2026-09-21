"use client";

import { useEffect, useRef } from "react";
import type * as THREE from "three";
import { subscribeFrame, type LayerState, type PlateId } from "@/lib/journey/store";
import { PLATES, fitOf, plateUrl } from "@/lib/journey/plates";
import { FILMS, filmUrl, readyFilms, type FilmId } from "@/lib/journey/films";
import { clampCamera, coverExtent } from "@/lib/journey/projection";
import { fragmentShader, vertexShader } from "./shader";

const MODE = { photo: 0, rock: 1, void: 2 } as const;
const MASK = { accrete: 0, rise: 1, water: 2, dissolve: 3 } as const;
/** Load order follows the journey so the next scene is ready before it's needed. */
const LOAD_ORDER: (PlateId | FilmId)[] = [
  "dawn", "rise", "aerial-time", "gardens", "gardens-time", "lion", "lion-time",
  "summit", "summit-fall", "summit-orbit", "gardens-walk", "lion-walk",
];

type Fit = [number, number, number, number];

interface FilmSlot {
  video: HTMLVideoElement;
  texture: THREE.VideoTexture;
  fit: Fit;
  /** Where the scroll wants the playhead, in seconds. */
  target: number;
  url: string;
}

interface Props {
  reduced: boolean;
  /** Load and show the video clips (off for reduced motion and Save-Data). */
  films: boolean;
  onReady: () => void;
}

/**
 * The world: a single full-screen WebGL plane. It never re-renders through
 * React; it subscribes to the journey's frame and pushes uniforms.
 */
export default function WorldCanvas({ reduced, films: filmsOn, onReady }: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const readyRef = useRef(onReady);
  useEffect(() => {
    readyRef.current = onReady;
  }, [onReady]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    let disposed = false;
    let cleanup = () => {};

    (async () => {
      const T = await import("three");
      if (disposed) return;

      const small = window.matchMedia("(max-width: 900px)").matches;
      const renderer = new T.WebGLRenderer({ antialias: false, alpha: false, powerPreference: "high-performance" });
      const dpr = Math.min(window.devicePixelRatio || 1, small ? 1.25 : 1.5);
      renderer.setPixelRatio(dpr);
      renderer.outputColorSpace = T.SRGBColorSpace;
      host.appendChild(renderer.domElement);
      renderer.domElement.setAttribute("aria-hidden", "true");

      const blank = new T.DataTexture(new Uint8Array([12, 9, 7, 255]), 1, 1);
      blank.needsUpdate = true;
      const textures = new Map<string, THREE.Texture>();
      const loader = new T.TextureLoader();
      const width = small ? 1280 : 2400;

      const load = (url: string) =>
        new Promise<void>((resolve) => {
          loader.load(
            url,
            (tex) => {
              tex.colorSpace = T.SRGBColorSpace;
              tex.minFilter = T.LinearMipmapLinearFilter;
              tex.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());
              textures.set(url, tex);
              resolve();
            },
            undefined,
            () => resolve(),
          );
        });

      // Video clips: each is downloaded whole (so any frame can be sought at
      // once), then either driven by the scroll or left to play by itself.
      const films = new Map<FilmId, FilmSlot>();
      const inUse = new Set<FilmId>();

      const loadFilm = async (id: FilmId) => {
        try {
          const res = await fetch(filmUrl(id, small));
          if (!res.ok || disposed) return;
          const url = URL.createObjectURL(await res.blob());
          if (disposed) return URL.revokeObjectURL(url);
          const video = document.createElement("video");
          video.muted = true;
          video.playsInline = true;
          video.preload = "auto";
          video.src = url;
          const texture = new T.VideoTexture(video);
          texture.colorSpace = T.SRGBColorSpace;
          const slot: FilmSlot = { video, texture, fit: fitOf(FILMS[id]), target: 0, url };
          video.addEventListener("seeked", () => {
            texture.needsUpdate = true;
            // The scroll moved on while this seek was running: catch up.
            if (video.paused && Math.abs(video.currentTime - slot.target) > 0.02) video.currentTime = slot.target;
          });
          await new Promise<void>((resolve) => {
            if (video.readyState >= 2) return resolve();
            video.addEventListener("loadeddata", () => resolve(), { once: true });
            video.addEventListener("error", () => resolve(), { once: true });
          });
          if (disposed || video.readyState < 2) return URL.revokeObjectURL(url);
          texture.needsUpdate = true;
          films.set(id, slot);
          readyFilms.add(id);
        } catch {
          // A clip that fails to load leaves its plate in place.
        }
      };

      /** Moves a clip's playhead to `time` (0..1), or lets it play on its own (-1). */
      const drive = (id: FilmId, time: number): FilmSlot | null => {
        const f = films.get(id);
        if (!f) return null;
        inUse.add(id);
        const v = f.video;
        if (time < 0) {
          if (v.paused && !v.ended) {
            v.playbackRate = 0.8;
            v.play().catch(() => {});
          }
          return f;
        }
        if (!v.paused) v.pause();
        f.target = time * Math.max(0, v.duration - 0.06);
        if (!v.seeking && Math.abs(v.currentTime - f.target) > 0.02) v.currentTime = f.target;
        return f;
      };

      const uniforms: Record<string, THREE.IUniform> = {
        uA0: { value: blank }, uA1: { value: blank }, uB0: { value: blank }, uB1: { value: blank },
        uA0fit: { value: new T.Vector4(1, 1, 0, 0) }, uA1fit: { value: new T.Vector4(1, 1, 0, 0) },
        uB0fit: { value: new T.Vector4(1, 1, 0, 0) }, uB1fit: { value: new T.Vector4(1, 1, 0, 0) },
        uAcam: { value: new T.Vector3(1, 0.5, 0.5) }, uBcam: { value: new T.Vector3(1, 0.5, 0.5) },
        uAreveal: { value: 0 }, uBreveal: { value: 0 },
        uAmode: { value: 0 }, uBmode: { value: 0 },
        uAmask: { value: 0 }, uBmask: { value: 0 },
        uMix: { value: 0 },
        uExtent: { value: new T.Vector2(1, 1) },
        uRes: { value: new T.Vector2(1, 1) },
        uTime: { value: 0 },
        uFog: { value: 0 }, uWarm: { value: 0 }, uExposure: { value: 1 }, uVeg: { value: 0 },
        uDraw: { value: 0 }, uSil: { value: 0 }, uSpeed: { value: 0 }, uDust: { value: 0 }, uClimb: { value: 0 },
        uSimple: { value: reduced ? 1 : 0 },
        uPointer: { value: new T.Vector2(0, 0) },
      };

      const material = new T.ShaderMaterial({ vertexShader, fragmentShader, uniforms, depthTest: false, depthWrite: false });
      const scene = new T.Scene();
      const camera = new T.OrthographicCamera(-1, 1, 1, -1, 0, 1);
      scene.add(new T.Mesh(new T.PlaneGeometry(2, 2), material));

      let aspect = 1;
      const resize = () => {
        const w = window.innerWidth;
        const h = window.innerHeight;
        renderer.setSize(w, h, false);
        aspect = w / h;
        const [kx, ky] = coverExtent(aspect);
        (uniforms.uExtent.value as THREE.Vector2).set(kx, ky);
        (uniforms.uRes.value as THREE.Vector2).set(w * dpr, h * dpr);
      };
      resize();
      window.addEventListener("resize", resize);

      const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
      const onPointer = (e: PointerEvent) => {
        pointer.tx = (e.clientX / window.innerWidth - 0.5) * 2;
        pointer.ty = (e.clientY / window.innerHeight - 0.5) * 2;
      };
      if (!reduced) window.addEventListener("pointermove", onPointer, { passive: true });

      const bindLayer = (l: LayerState, p: "A" | "B") => {
        const plate = PLATES[l.plate];
        const modern = textures.get(plateUrl(plate.modern, width)) ?? blank;
        let t0: THREE.Texture = modern;
        let t1: THREE.Texture = textures.get(plateUrl(plate.ancient, width)) ?? blank;
        let fit0: Fit = fitOf(plate.modern);
        let fit1: Fit = fitOf(plate.ancient);
        let reveal = l.reveal;
        let mask: number = MASK[l.mask];

        // A clip replaces the plate as soon as it can; until then the plate
        // (whose photograph is the clip's first frame) stands in for it.
        const f0 = l.film0 ? drive(l.film0, l.time0) : null;
        const f1 = l.film1 ? drive(l.film1, l.time1) : null;
        if (l.film1) {
          // Two shots dissolving into each other.
          if (f0) [t0, fit0] = [f0.texture, f0.fit];
          [t1, fit1] = f1 ? [f1.texture, f1.fit] : [modern, fitOf(plate.modern)];
          reveal = l.filmMix;
          mask = MASK.dissolve;
        } else if (f0) {
          [t0, fit0] = [f0.texture, f0.fit];
          reveal = 0;
        }

        uniforms[`u${p}0`].value = t0;
        uniforms[`u${p}1`].value = t1;
        (uniforms[`u${p}0fit`].value as THREE.Vector4).fromArray(fit0);
        (uniforms[`u${p}1fit`].value as THREE.Vector4).fromArray(fit1);
        const c = clampCamera(l.camera, aspect);
        (uniforms[`u${p}cam`].value as THREE.Vector3).set(c.zoom, c.x, c.y);
        uniforms[`u${p}reveal`].value = reveal;
        uniforms[`u${p}mode`].value = MODE[l.mode];
        uniforms[`u${p}mask`].value = mask;
      };

      const start = performance.now();
      const unsubscribe = subscribeFrame((s) => {
        inUse.clear();
        if (s.layerMix < 0.999) bindLayer(s.layerA, "A");
        if (s.layerMix > 0.001) bindLayer(s.layerB, "B");
        // Clips that left the screen stop decoding.
        films.forEach((f, id) => {
          if (!inUse.has(id) && !f.video.paused) f.video.pause();
        });
        pointer.x += (pointer.tx - pointer.x) * 0.04;
        pointer.y += (pointer.ty - pointer.y) * 0.04;
        // Pointer influence only on the summit, where the brief invites it.
        const sway = s.chapter === "summit" || s.chapter === "hero" ? 1 : 0.25;
        (uniforms.uPointer.value as THREE.Vector2).set(pointer.x * sway, -pointer.y * sway);
        uniforms.uMix.value = s.layerMix;
        uniforms.uTime.value = (performance.now() - start) / 1000;
        uniforms.uFog.value = s.fog;
        uniforms.uWarm.value = s.warmth;
        uniforms.uExposure.value = s.exposure;
        uniforms.uVeg.value = s.vegetation;
        uniforms.uDraw.value = s.drawing;
        uniforms.uSil.value = s.silhouette;
        uniforms.uSpeed.value = reduced ? 0 : s.speed;
        uniforms.uDust.value = small ? s.dust * 0.5 : s.dust;
        uniforms.uClimb.value = s.climb;
        renderer.render(scene, camera);
      });

      cleanup = () => {
        unsubscribe();
        window.removeEventListener("resize", resize);
        window.removeEventListener("pointermove", onPointer);
        textures.forEach((t) => t.dispose());
        films.forEach((f) => {
          f.video.pause();
          f.texture.dispose();
          f.video.removeAttribute("src");
          f.video.load();
          URL.revokeObjectURL(f.url);
        });
        readyFilms.clear();
        material.dispose();
        renderer.dispose();
        renderer.domElement.remove();
      };

      // Hero pair first, then plates and clips in journey order.
      const heroPlate = PLATES.aerial;
      await Promise.all([load(plateUrl(heroPlate.modern, width)), load(plateUrl(heroPlate.ancient, width))]);
      if (disposed) return;
      readyRef.current();
      for (const id of LOAD_ORDER) {
        if (disposed) return;
        if (id in PLATES) {
          const plate = PLATES[id as PlateId];
          await Promise.all([load(plateUrl(plate.modern, width)), load(plateUrl(plate.ancient, width))]);
        } else if (filmsOn) {
          await loadFilm(id as FilmId);
        }
      }
    })();

    return () => {
      disposed = true;
      cleanup();
    };
  }, [reduced, filmsOn]);

  return <div ref={hostRef} className="world-canvas" />;
}
