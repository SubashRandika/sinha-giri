"use client";

import { useEffect, useRef } from "react";
import { Chapter, type Build } from "@/components/journey/Chapter";
import { DiscoverPanel } from "@/components/ui/DiscoverPanel";
import { CHAPTERS } from "@/content/chapters";
import { plateToScreen } from "@/lib/journey/projection";
import { subscribeFrame } from "@/lib/journey/store";

const data = CHAPTERS.find((c) => c.id === "city")!;

/** Label anchors in plate coordinates of the aerial view (approximate). */
const LABELS = [
  { id: "water", text: "Water gardens", x: 0.3, y: 0.6 },
  { id: "boulder", text: "Boulder gardens", x: 0.42, y: 0.72 },
  { id: "terraced", text: "Terraced gardens", x: 0.49, y: 0.56 },
  { id: "royal", text: "Royal precinct", x: 0.6, y: 0.38 },
  { id: "moat", text: "Moats & ramparts", x: 0.2, y: 0.86 },
];

const build: Build = (tl, _root, { q, enter, leave }) => {
  tl.from(q(".city__num"), { ...enter(20), duration: 0.08 }, 0.02);
  tl.from(q(".city__title"), { ...enter(50), duration: 0.12 }, 0.04);
  tl.from(q(".city__lead"), { ...enter(24), duration: 0.1 }, 0.14);
  q(".city-label").forEach((el, i) => tl.from(el, { autoAlpha: 0, duration: 0.06 }, 0.22 + i * 0.07));
  tl.from(q(".city .discover"), { autoAlpha: 0, duration: 0.06 }, 0.3);
  tl.from(q(".city__note"), { autoAlpha: 0, duration: 0.06 }, 0.58);
  tl.to(q(".city-label"), { autoAlpha: 0, duration: 0.06 }, 0.9);
  tl.to(q(".city__copy"), { ...leave(-40), duration: 0.08 }, 0.9);
};

export function City() {
  const layerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return subscribeFrame((s) => {
      const host = layerRef.current;
      if (!host || (s.chapter !== "city" && s.chapter !== "king")) return;
      const layer = s.layerMix > 0.5 ? s.layerB : s.layerA;
      const aspect = window.innerWidth / window.innerHeight;
      host.querySelectorAll<HTMLElement>(".city-label").forEach((el, i) => {
        const l = LABELS[i];
        const [sx, sy] = plateToScreen(l.x, l.y, layer.camera, aspect);
        el.style.transform = `translate3d(${(sx * 100).toFixed(2)}vw, ${(sy * 100).toFixed(2)}vh, 0)`;
      });
    });
  }, []);

  return (
    <Chapter id="city" build={build} stageClassName="city">
      <div ref={layerRef} className="city__labels">
        {LABELS.map((l) => (
          <span key={l.id} className="city-label">
            <i aria-hidden="true" />
            {l.text}
          </span>
        ))}
      </div>
      <div className="city__copy copy copy--top-left">
        <p className="chapter-num city__num">Chapter 03</p>
        <h2 id="city-title" className="display city__title">
          The City
        </h2>
        <p className="lead city__lead">A capital planned around a rock: gardens, water and walls, with the palace above them all.</p>
        <DiscoverPanel label={data.discover!.label}>{data.discover!.body}</DiscoverPanel>
      </div>
      <p className="city__note ui-note">Label positions are approximate.</p>
    </Chapter>
  );
}
