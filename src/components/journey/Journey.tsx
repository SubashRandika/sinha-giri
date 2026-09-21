"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import type { ChapterId } from "@/content/chapters";
import { JourneyController } from "@/lib/journey/controller";
import { JourneyContext, type JourneyApi } from "./context";
import { FallbackWorld } from "@/components/world/FallbackWorld";
import { Hud } from "@/components/hud/Hud";
import { LoadingVeil } from "@/components/ui/LoadingVeil";
import { Hero } from "@/components/chapters/Hero";
import { Rock } from "@/components/chapters/Rock";
import { King } from "@/components/chapters/King";
import { City } from "@/components/chapters/City";
import { Gardens } from "@/components/chapters/Gardens";
import { Ascent } from "@/components/chapters/Ascent";
import { LionGate } from "@/components/chapters/LionGate";
import { Frescoes } from "@/components/chapters/Frescoes";
import { Summit } from "@/components/chapters/Summit";
import { MirrorWall } from "@/components/chapters/MirrorWall";
import { FallOfTime } from "@/components/chapters/FallOfTime";
import { Discovery } from "@/components/chapters/Discovery";
import { Today } from "@/components/chapters/Today";
import { ThenNow } from "@/components/chapters/ThenNow";
import { Finale } from "@/components/chapters/Finale";

// Three.js is only downloaded on the client, after first paint.
const WorldCanvas = dynamic(() => import("@/components/world/WorldCanvas"), { ssr: false });

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return reduced;
}

let webglCache: boolean | undefined;
function hasWebGL() {
  if (webglCache !== undefined) return webglCache;
  try {
    const c = document.createElement("canvas");
    webglCache = !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    webglCache = false;
  }
  return webglCache;
}
const noSubscribe = () => () => {};

export function Journey({ notes }: { notes: ReactNode }) {
  const reduced = usePrefersReducedMotion();
  const sections = useRef(new Map<ChapterId, HTMLElement>());
  const timelines = useRef(new Map<ChapterId, gsap.core.Timeline>());
  const controller = useRef<JourneyController | null>(null);
  const [worldReady, setWorldReady] = useState(false);
  const webgl = useSyncExternalStore<boolean | null>(noSubscribe, hasWebGL, () => null);
  const [veil, setVeil] = useState(false);

  const registerSection = useCallback((id: ChapterId, el: HTMLElement | null) => {
    if (el) sections.current.set(id, el);
    else sections.current.delete(id);
  }, []);

  const registerTimeline = useCallback((id: ChapterId, tl: gsap.core.Timeline) => {
    timelines.current.set(id, tl);
    controller.current?.registerTimeline(id, tl);
  }, []);

  useLayoutEffect(() => {
    const c = new JourneyController(sections.current, { reduced });
    timelines.current.forEach((tl, id) => c.registerTimeline(id, tl));
    controller.current = c;
    return () => {
      c.destroy();
      controller.current = null;
    };
  }, [reduced]);

  const goTo = useCallback(
    (id: ChapterId) => {
      const c = controller.current;
      if (!c) return;
      if (reduced) {
        c.jumpTo(id);
        return;
      }
      // Travelling across centuries by menu: a short fade through black.
      setVeil(true);
      window.setTimeout(() => {
        c.jumpTo(id);
        window.setTimeout(() => setVeil(false), 120);
      }, 380);
    },
    [reduced],
  );

  const api = useMemo<JourneyApi>(() => ({ reduced, registerSection, registerTimeline, goTo }), [reduced, registerSection, registerTimeline, goTo]);

  return (
    <JourneyContext.Provider value={api}>
      <div className="world" aria-hidden="true">
        <FallbackWorld hidden={worldReady && webgl === true} />
        {webgl && <WorldCanvas reduced={reduced} onReady={() => setWorldReady(true)} />}
      </div>
      <div className={`travel-veil ${veil ? "is-on" : ""}`} aria-hidden="true" />
      <LoadingVeil ready={worldReady || webgl === false} />
      <Hud />
      <main id="journey" className="journey">
        <Hero />
        <Rock />
        <King />
        <City />
        <Gardens />
        <Ascent />
        <LionGate />
        <Frescoes />
        <Summit />
        <MirrorWall />
        <FallOfTime />
        <Discovery />
        <Today />
        <ThenNow />
        <Finale />
        {notes}
      </main>
    </JourneyContext.Provider>
  );
}
