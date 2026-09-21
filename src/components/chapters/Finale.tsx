"use client";

import { Chapter, type Build } from "@/components/journey/Chapter";
import { useJourney } from "@/components/journey/context";

const LINES = ["The fifth century built it.", "Fifteen centuries changed it.", "Time did not erase Sigiriya."];

const build: Build = (tl, _root, { q, enter }) => {
  // Each line holds, then yields: pauses are part of the text.
  q(".finale__line").forEach((el, i) => {
    tl.from(el, { ...enter(16), duration: 0.08 }, 0.04 + i * 0.18);
    tl.to(el, { opacity: 0.28, duration: 0.06 }, 0.16 + i * 0.18);
  });
  tl.from(q(".finale__story"), { ...enter(24), duration: 0.1 }, 0.62);
  tl.from(q(".finale__cta"), { autoAlpha: 0, duration: 0.08 }, 0.78);
};

export function Finale() {
  const { goTo } = useJourney();
  return (
    <Chapter id="finale" build={build} stageClassName="finale">
      <h2 id="finale-title" className="sr-only">
        Epilogue
      </h2>
      <div className="finale__text">
        {LINES.map((l) => (
          <p key={l} className="finale__line">
            {l}
          </p>
        ))}
        <p className="finale__story display">It left a story.</p>
      </div>
      <div className="finale__cta">
        <a className="cta" href="https://www.srilanka.travel/" target="_blank" rel="noopener noreferrer">
          Explore Sri Lanka <span aria-hidden="true">→</span>
          <span className="sr-only">(opens the Sri Lanka Tourism website in a new tab)</span>
        </a>
        <button type="button" className="cta cta--quiet" onClick={() => goTo("hero")}>
          Travel again <span aria-hidden="true">↑</span>
        </button>
      </div>
    </Chapter>
  );
}
