"use client";

import { Chapter, type Build } from "@/components/journey/Chapter";

const STEPS = ["Royal city", "Palace abandoned", "Vegetation returns", "Structures collapse", "Centuries pass", "Ruins remain"];

const build: Build = (tl, _root, { q, enter, leave }) => {
  tl.from(q(".fall__num"), { ...enter(20), duration: 0.04 }, 0.01);
  tl.to(q(".fall__num"), { autoAlpha: 0, duration: 0.04 }, 0.12);
  const steps = q(".fall__step");
  const slot = 0.9 / steps.length;
  steps.forEach((el, i) => {
    const at = 0.04 + i * slot;
    tl.from(el, { ...enter(24), duration: slot * 0.3 }, at);
    if (i < steps.length - 1) tl.to(el, { ...leave(-24), duration: slot * 0.25 }, at + slot * 0.72);
  });
  q(".fall__tick").forEach((el, i) => tl.to(el, { "--on": 1, duration: 0.02 }, 0.04 + i * slot));
  tl.from(q(".fall__line"), { autoAlpha: 0, duration: 0.06 }, 0.2);
  tl.to(q(".fall__line"), { autoAlpha: 0, duration: 0.06 }, 0.9);
  tl.to(q(".fall__step:last-child"), { ...leave(-24), duration: 0.05 }, 0.95);
};

export function FallOfTime() {
  return (
    <Chapter id="time" build={build} stageClassName="fall">
      <h2 id="time-title" className="sr-only">
        The Fall of Time
      </h2>
      <p className="chapter-num fall__num">Chapter 10 · The Fall of Time</p>
      <ol className="fall__steps" aria-label="What happened after the court left">
        {STEPS.map((s) => (
          <li key={s} className="fall__step display display--line">
            {s}
          </li>
        ))}
      </ol>
      <ol className="fall__ticks" aria-hidden="true">
        {STEPS.map((s) => (
          <li key={s} className="fall__tick" style={{ ["--on" as string]: 0 }} />
        ))}
      </ol>
      <p className="fall__line lead">After the court left, the forest took the city back, slowly.</p>
    </Chapter>
  );
}
