"use client";

import { useEffect, useRef } from "react";
import type * as THREE from "three";
import { subscribeFrame, type LayerState, type PlateId } from "@/lib/journey/store";
import { PLATES, fitOf, plateUrl } from "@/lib/journey/plates";
import { clampCamera, coverExtent } from "@/lib/journey/projection";
import { fragmentShader, vertexShader } from "./shader";

const MODE = { photo: 0, rock: 1, void: 2 } as const;
const MASK = { accrete: 0, rise: 1, water: 2 } as const;
/** Load order follows the journey so the next scene is ready before it's needed. */
const LOAD_ORDER: PlateId[] = ["aerial", "gardens", "lion", "summit"];

interface Props {
  reduced: boolean;
  onReady: () => void;
}

/**
 * The world: a single full-screen WebGL plane. It never re-renders through
 * React; it subscribes to the journey's frame and pushes uniforms.
 */
export default function WorldCanvas({ reduced, onReady }: Props) {
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
        const u0 = plateUrl(plate.modern, width);
        const u1 = plateUrl(plate.ancient, width);
        uniforms[`u${p}0`].value = textures.get(u0) ?? blank;
        uniforms[`u${p}1`].value = textures.get(u1) ?? blank;
        (uniforms[`u${p}0fit`].value as THREE.Vector4).fromArray(fitOf(plate.modern));
        (uniforms[`u${p}1fit`].value as THREE.Vector4).fromArray(fitOf(plate.ancient));
        const c = clampCamera(l.camera, aspect);
        (uniforms[`u${p}cam`].value as THREE.Vector3).set(c.zoom, c.x, c.y);
        uniforms[`u${p}reveal`].value = l.reveal;
        uniforms[`u${p}mode`].value = MODE[l.mode];
        uniforms[`u${p}mask`].value = MASK[l.mask];
      };

      const start = performance.now();
      const unsubscribe = subscribeFrame((s) => {
        bindLayer(s.layerA, "A");
        bindLayer(s.layerB, "B");
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
        material.dispose();
        renderer.dispose();
        renderer.domElement.remove();
      };

      // Hero pair first, then the rest in journey order.
      const heroPlate = PLATES.aerial;
      await Promise.all([load(plateUrl(heroPlate.modern, width)), load(plateUrl(heroPlate.ancient, width))]);
      if (disposed) return;
      readyRef.current();
      for (const id of LOAD_ORDER.slice(1)) {
        if (disposed) return;
        await Promise.all([load(plateUrl(PLATES[id].modern, width)), load(plateUrl(PLATES[id].ancient, width))]);
      }
    })();

    return () => {
      disposed = true;
      cleanup();
    };
  }, [reduced]);

  return <div ref={hostRef} className="world-canvas" />;
}
