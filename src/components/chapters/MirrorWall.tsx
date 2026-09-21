"use client";

import { useEffect, useRef } from "react";
import { Chapter, type Build } from "@/components/journey/Chapter";
import { DiscoverPanel } from "@/components/ui/DiscoverPanel";
import { CHAPTERS } from "@/content/chapters";
import { useJourney } from "@/components/journey/context";

const data = CHAPTERS.find((c) => c.id === "mirror")!;

/** Paraphrased themes of the verses: illustrative, not quotations. */
const VERSES = [
  { text: "on the painted women, who do not answer", x: 8, y: 22, r: -2 },
  { text: "on climbing all this way to see them", x: 52, y: 14, r: 1.5 },
  { text: "on a beauty that outlasts the one who saw it", x: 30, y: 46, r: -1 },
  { text: "on the king, long gone", x: 66, y: 40, r: 2.5 },
  { text: "on longing, and the wind in the gallery", x: 12, y: 70, r: 1 },
  { text: "on being here, once", x: 58, y: 72, r: -2.5 },
];

const build: Build = (tl, _root, { q, enter, leave }) => {
  tl.from(q(".mirror__num"), { ...enter(20), duration: 0.05 }, 0.02);
  tl.from(q(".mirror__title"), { ...enter(40), duration: 0.08 }, 0.03);
  tl.from(q(".mirror__lead"), { ...enter(20), duration: 0.06 }, 0.1);
  // Light travels across the polished plaster.
  tl.fromTo(q(".wall"), { "--sheen": "-30%" }, { "--sheen": "130%", duration: 0.3, ease: "sine.inOut" }, 0.04);
  tl.to(q(".mirror__intro"), { ...leave(-30), duration: 0.06 }, 0.32);
  // Centuries pass: the surface dulls, and the verses arrive.
  tl.to(q(".wall"), { "--polish": 0, duration: 0.4 }, 0.34);
  tl.from(q(".mirror__line--1"), { ...enter(20), duration: 0.06 }, 0.36);
  q(".verse").forEach((el, i) => tl.fromTo(el, { "--cut": 0 }, { "--cut": 1, duration: 0.06 }, 0.42 + i * 0.05));
  tl.to(q(".mirror__line--1"), { autoAlpha: 0, duration: 0.05 }, 0.64);
  tl.from(q(".mirror__line--2"), { ...enter(20), duration: 0.06 }, 0.68);
  tl.from(q(".mirror__you"), { autoAlpha: 0, duration: 0.06 }, 0.8);
  tl.from(q(".mirror .discover, .mirror__note"), { autoAlpha: 0, duration: 0.05 }, 0.8);
  tl.to(q(".mirror__line--2, .mirror__you, .mirror__outro"), { ...leave(-20), duration: 0.05 }, 0.94);
};

export function MirrorWall() {
  const wallRef = useRef<HTMLDivElement>(null);
  const { reduced } = useJourney();

  // The visitor's own light moves on the wall.
  useEffect(() => {
    const wall = wallRef.current;
    if (!wall || reduced) return;
    const onMove = (e: PointerEvent) => {
      const r = wall.getBoundingClientRect();
      wall.style.setProperty("--px", `${((e.clientX - r.left) / r.width) * 100}%`);
      wall.style.setProperty("--py", `${((e.clientY - r.top) / r.height) * 100}%`);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [reduced]);

  return (
    <Chapter id="mirror" build={build} stageClassName="mirror">
      <div ref={wallRef} className="wall" style={{ ["--sheen" as string]: "-30%", ["--polish" as string]: 1 }}>
        <div className="wall__verses">
          {VERSES.map((v) => (
            <p
              key={v.text}
              className="verse"
              style={{ left: `${v.x}%`, top: `${v.y}%`, ["--r" as string]: `${v.r}deg`, ["--cut" as string]: 0 }}
            >
              <span>— {v.text}</span>
            </p>
          ))}
        </div>
      </div>

      <div className="mirror__intro copy copy--top-left">
        <p className="chapter-num mirror__num">Chapter 09</p>
        <h2 id="mirror-title" className="display mirror__title">
          The Mirror Wall
        </h2>
        <p className="lead mirror__lead">Once polished until it shone.</p>
      </div>

      <p className="mirror__line mirror__line--1 display display--line">They came here before us.</p>
      <p className="mirror__line mirror__line--2 display display--line">They left their words behind.</p>

      <div className="mirror__outro copy copy--bottom-left">
        <p className="lead mirror__you">And now you are reading them. Visitors today are asked not to add their own.</p>
        <p className="mirror__note ui-note">Verses shown as paraphrased themes, not transcriptions.</p>
        <DiscoverPanel label={data.discover!.label}>{data.discover!.body}</DiscoverPanel>
      </div>
    </Chapter>
  );
}
