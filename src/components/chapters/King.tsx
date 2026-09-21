"use client";

import { useEffect, useRef } from "react";
import { Chapter, type Build } from "@/components/journey/Chapter";
import { DiscoverPanel } from "@/components/ui/DiscoverPanel";
import { CHAPTERS } from "@/content/chapters";
import { formatYear } from "@/lib/time/curve";
import { subscribeFrame } from "@/lib/journey/store";

const data = CHAPTERS.find((c) => c.id === "king")!;

/** Landmarks passed on the way down, newest first. */
const MILESTONES: { year: number; text: string }[] = [
  { year: 1982, text: "1982 · Inscribed on the World Heritage List" },
  { year: 1895, text: "1890s · First systematic excavations" },
  { year: 1350, text: "c. 14th century · Monastic use fades" },
  { year: 950, text: "8th–10th centuries · Visitors write verses on the Mirror Wall" },
  { year: 520, text: "495 CE · The reign of Kashyapa I ends" },
];

const build: Build = (tl, _root, { q, enter, leave }) => {
  tl.from(q(".king__prompt"), { autoAlpha: 0, duration: 0.05 }, 0.01);
  tl.to(q(".king__prompt"), { autoAlpha: 0, duration: 0.05 }, 0.12);
  tl.from(q(".king__interp"), { autoAlpha: 0, duration: 0.06 }, 0.2);
  tl.to(q(".king__interp"), { autoAlpha: 0, duration: 0.06 }, 0.5);
  tl.to(q(".king__counter"), { ...leave(-60), duration: 0.1 }, 0.54);
  tl.from(q(".king__num"), { ...enter(20), duration: 0.06 }, 0.6);
  tl.from(q(".king__title"), { ...enter(80), duration: 0.12 }, 0.62);
  tl.from(q(".king__dates"), { ...enter(30), duration: 0.08 }, 0.7);
  tl.from(q(".king__lead"), { ...enter(30), duration: 0.08 }, 0.76);
  tl.from(q(".king .discover"), { autoAlpha: 0, duration: 0.06 }, 0.8);
  tl.to(q(".king__copy"), { ...leave(-40), duration: 0.08 }, 0.92);
};

export function King() {
  const valueRef = useRef<HTMLSpanElement>(null);
  const suffixRef = useRef<HTMLSpanElement>(null);
  const noteRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    let last = "";
    let lastNote = "";
    return subscribeFrame((s) => {
      if (s.chapter !== "king" && s.chapter !== "rock") return;
      const f = formatYear(s.year);
      const label = f.value;
      if (label !== last && valueRef.current && suffixRef.current) {
        valueRef.current.textContent = label;
        suffixRef.current.textContent = f.suffix;
        last = label;
      }
      const m = [...MILESTONES].reverse().find((x) => s.year <= x.year && s.chapter === "king");
      const note = m?.text ?? "";
      if (note !== lastNote && noteRef.current) {
        noteRef.current.textContent = note;
        noteRef.current.classList.remove("is-fresh");
        void noteRef.current.offsetWidth;
        noteRef.current.classList.add("is-fresh");
        lastNote = note;
      }
    });
  }, []);

  return (
    <Chapter id="king" build={build} stageClassName="king">
      <p className="king__prompt ui-label">Keep scrolling to travel back fifteen centuries</p>

      <div className="king__counter" aria-hidden="true">
        <span className="king__year">
          <span ref={valueRef}>2026</span>
          <span ref={suffixRef} className="king__suffix" />
        </span>
        <p ref={noteRef} className="king__milestone" />
      </div>

      <p className="king__interp ui-label">A visual interpretation of 5th-century Sigiriya</p>

      <div className="king__copy copy copy--center">
        <p className="chapter-num king__num">Chapter 02 · The King</p>
        <h2 id="king-title" className="display display--xl king__title">
          Kashyapa I
        </h2>
        <p className="king__dates">477–495 CE</p>
        <p className="lead king__lead">He moved the royal capital to this rock, and built a city around it.</p>
        <DiscoverPanel label={data.discover!.label}>{data.discover!.body}</DiscoverPanel>
      </div>
    </Chapter>
  );
}
