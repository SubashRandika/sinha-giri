"use client";

import { useEffect, useRef } from "react";
import { PLATES, plateUrl } from "@/lib/journey/plates";
import { subscribeFrame } from "@/lib/journey/store";

/**
 * Plain-image world for the first paint, for devices without WebGL, and as
 * the LCP element. Crossfades today's photograph and the reconstruction.
 */
export function FallbackWorld({ hidden }: { hidden: boolean }) {
  const modernRef = useRef<HTMLImageElement>(null);
  const ancientRef = useRef<HTMLImageElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (hidden) return;
    let plate = "aerial";
    return subscribeFrame((s) => {
      const layer = s.layerMix > 0.5 ? s.layerB : s.layerA;
      const m = modernRef.current;
      const a = ancientRef.current;
      const w = wrapRef.current;
      if (!m || !a || !w) return;
      const visible = layer.mode === "photo";
      if (visible && layer.plate !== plate) {
        plate = layer.plate;
        const p = PLATES[layer.plate];
        m.srcset = `${plateUrl(p.modern, 1280)} 1280w, ${plateUrl(p.modern, 2400)} 2400w`;
        m.src = plateUrl(p.modern, 1280);
        a.src = plateUrl(p.ancient, 1280);
      }
      w.style.opacity = String(visible ? s.exposure * (1 - Math.sin(Math.PI * s.layerMix) * 0.4) : 0);
      a.style.opacity = String(layer.reveal);
      m.style.filter = s.drawing > 0.5 ? "grayscale(1) contrast(1.4) brightness(1.3)" : "";
    });
  }, [hidden]);

  return (
    <div ref={wrapRef} className={`fallback-world ${hidden ? "is-hidden" : ""}`}>
      {/* eslint-disable-next-line @next/next/no-img-element -- srcset-driven plate swapped imperatively per scene */}
      <img
        ref={modernRef}
        src="/plates/aerial-modern-1280.webp"
        srcSet="/plates/aerial-modern-1280.webp 1280w, /plates/aerial-modern-2400.webp 2400w"
        sizes="100vw"
        alt=""
        fetchPriority="high"
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img ref={ancientRef} src="/plates/aerial-ancient-1280.webp" alt="" style={{ opacity: 0 }} loading="lazy" />
    </div>
  );
}
