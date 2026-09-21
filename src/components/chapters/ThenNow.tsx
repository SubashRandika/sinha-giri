"use client";

import { useEffect, useRef, useState } from "react";
import { Chapter, type Build } from "@/components/journey/Chapter";
import { PLATES, cssFit, plateUrl } from "@/lib/journey/plates";
import { subscribeFrame, type PlateId } from "@/lib/journey/store";

const PAIRS: { id: PlateId; label: string }[] = [
  { id: "aerial", label: "The city" },
  { id: "gardens", label: "Water gardens" },
  { id: "lion", label: "Lion Gate" },
  { id: "summit", label: "Summit" },
];

const build: Build = (tl, _root, { q, enter }) => {
  tl.from(q(".tn__title"), { ...enter(40), duration: 0.1 }, 0.02);
  tl.from(q(".tn__frame"), { autoAlpha: 0, duration: 0.1 }, 0.06);
  tl.from(q(".tn__pairs, .tn__hint"), { autoAlpha: 0, duration: 0.08 }, 0.2);
};

/**
 * The signature coda: one image, two eras. Scroll opens the seam until the
 * visitor takes hold of it; after that the handle is theirs (pointer, touch
 * or arrow keys through the native range input).
 */
export function ThenNow() {
  const [pair, setPair] = useState<PlateId>("aerial");
  const [split, setSplit] = useState(100);
  const touched = useRef(false);

  useEffect(() => {
    return subscribeFrame((s) => {
      if (touched.current || s.chapter !== "thennow") return;
      const v = Math.round(100 - Math.min(1, s.local / 0.6) * 50);
      setSplit((prev) => (prev === v ? prev : v));
    });
  }, []);

  const plate = PLATES[pair];

  return (
    <Chapter id="thennow" build={build} stageClassName="tn">
      <h2 id="thennow-title" className="display tn__title">
        Two Sigiriyas
      </h2>
      <div className="tn__frame" style={{ ["--split" as string]: `${split}%` }}>
        {/* eslint-disable-next-line @next/next/no-img-element -- matched pair must share identical box and object-position */}
        <img className="tn__img tn__img--now" src={plateUrl(plate.modern, 1280)} srcSet={`${plateUrl(plate.modern, 1280)} 1280w, ${plateUrl(plate.modern, 2400)} 2400w`} sizes="90vw" alt={plate.modern.alt} loading="lazy" />
        <div className="tn__then">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className="tn__img"
            src={plateUrl(plate.ancient, 1280)}
            srcSet={`${plateUrl(plate.ancient, 1280)} 1280w, ${plateUrl(plate.ancient, 2400)} 2400w`}
            sizes="90vw"
            alt={plate.ancient.alt}
            loading="lazy"
            style={{ transform: cssFit(plate.ancient) }}
          />
        </div>
        <span className="tn__tag tn__tag--then">
          Then<small>c. 5th century · reconstruction</small>
        </span>
        <span className="tn__tag tn__tag--now">
          Now<small>2026 · photograph</small>
        </span>
        <span className="tn__seam" aria-hidden="true">
          <i />
        </span>
        <input
          className="tn__range"
          type="range"
          min={0}
          max={100}
          value={split}
          aria-label="Move the boundary between then and now"
          aria-valuetext={`${split}% reconstruction visible`}
          onChange={(e) => {
            touched.current = true;
            setSplit(Number(e.target.value));
          }}
        />
      </div>
      <div className="tn__pairs" role="group" aria-label="Choose a place">
        {PAIRS.map((p) => (
          <button key={p.id} type="button" aria-pressed={pair === p.id} onClick={() => setPair(p.id)}>
            {p.label}
          </button>
        ))}
      </div>
      <p className="tn__hint ui-note">Drag the seam, or use the arrow keys.</p>
    </Chapter>
  );
}
