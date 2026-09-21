"use client";

import { Chapter, type Build } from "@/components/journey/Chapter";
import { DiscoverPanel } from "@/components/ui/DiscoverPanel";
import { CHAPTERS } from "@/content/chapters";

const data = CHAPTERS.find((c) => c.id === "lion")!;

/** Stages of the build, bottom to top; thresholds follow the rise mask (0.1–0.7). */
const STAGES = [
  { id: "foundations", label: "Foundations", status: "Survives" },
  { id: "paws", label: "Paws", status: "Survives" },
  { id: "body", label: "Body", status: "Interpretation" },
  { id: "head", label: "Head", status: "Interpretation" },
  { id: "entrance", label: "Entrance", status: "Interpretation" },
];

const build: Build = (tl, _root, { q, enter, leave }) => {
  tl.from(q(".lion__num"), { ...enter(20), duration: 0.05 }, 0.01);
  tl.from(q(".lion__title"), { ...enter(50), duration: 0.08 }, 0.02);
  tl.from(q(".lion__lead--today"), { ...enter(24), duration: 0.06 }, 0.06);
  tl.to(q(".lion__lead--today"), { autoAlpha: 0, duration: 0.04 }, 0.3);
  tl.from(q(".lion__lead--then"), { ...enter(24), duration: 0.06 }, 0.33);
  tl.from(q(".stages"), { autoAlpha: 0, duration: 0.05 }, 0.08);
  q(".stages__item").forEach((el, i) => tl.to(el, { "--on": 1, duration: 0.03 }, 0.12 + i * 0.12));
  tl.from(q(".lion .discover"), { autoAlpha: 0, duration: 0.05 }, 0.4);
  tl.to(q(".lion__copy, .stages"), { ...leave(-30), duration: 0.06 }, 0.72);
  tl.from(q(".lion__into"), { autoAlpha: 0, duration: 0.05 }, 0.78);
  tl.to(q(".lion__into"), { autoAlpha: 0, duration: 0.05 }, 0.93);
};

export function LionGate() {
  return (
    <Chapter id="lion" build={build} stageClassName="lion">
      <div className="lion__copy copy copy--top-left">
        <p className="chapter-num lion__num">Chapter 06</p>
        <h2 id="lion-title" className="display lion__title">
          The Lion Gate
        </h2>
        <div className="gardens__leads">
          <p className="lead lion__lead--today">What survives: two paws, at the foot of the final climb.</p>
          <p className="lead lion__lead--then">What stood: a lion you walked into. Sinhagiri, the Lion Rock, is named for it.</p>
        </div>
        <DiscoverPanel label={data.discover!.label}>{data.discover!.body}</DiscoverPanel>
      </div>

      <ol className="stages" aria-label="The gate, from the ground up">
        {STAGES.map((s) => (
          <li key={s.id} className={`stages__item stages__item--${s.status === "Survives" ? "real" : "interp"}`} style={{ ["--on" as string]: 0 }}>
            <span className="stages__label">{s.label}</span>
            <span className="stages__status">{s.status}</span>
          </li>
        ))}
      </ol>

      <p className="lion__into lead lead--large">Through the lion’s mouth, the stair continues upward.</p>
    </Chapter>
  );
}
