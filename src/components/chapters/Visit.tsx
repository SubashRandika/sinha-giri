"use client";

import { Chapter, type Build } from "@/components/journey/Chapter";
import { DiscoverPanel } from "@/components/ui/DiscoverPanel";
import { CHAPTERS } from "@/content/chapters";

const data = CHAPTERS.find((c) => c.id === "visit")!;

/** The three shots, in the order a visitor meets them; t is where each is on screen. */
const STOPS = [
  { id: "gardens", place: "Water gardens", line: "Walk the royal axis between the pools, toward the rock.", from: 0.15, to: 0.4 },
  { id: "lion", place: "Lion Gate terrace", line: "Between the paws, the last stairway begins.", from: 0.48, to: 0.72 },
  { id: "away", place: "Leaving Sigiriya", line: "From the air, the rock stands alone in the forest again.", from: 0.8, to: 0.97 },
];

const build: Build = (tl, _root, { q, enter, leave }) => {
  tl.from(q(".visit__head"), { ...enter(30), duration: 0.06 }, 0.01);
  tl.to(q(".visit__head"), { ...leave(-20), duration: 0.04 }, 0.1);
  tl.from(q(".route"), { autoAlpha: 0, duration: 0.05 }, 0.02);
  tl.fromTo(q(".route__fill"), { scaleX: 0 }, { scaleX: 1, duration: 0.96 }, 0.02);
  STOPS.forEach((s) => {
    tl.from(q(`.visit__shot--${s.id}`), { ...enter(24), duration: 0.05 }, s.from);
    tl.to(q(`.visit__shot--${s.id}`), { ...leave(-20), duration: 0.04 }, s.to);
    tl.to(q(`.route__stop--${s.id}`), { "--on": 1, duration: 0.03 }, s.from);
  });
  tl.to(q(".route"), { autoAlpha: 0, duration: 0.03 }, 0.97);
};

export function Visit() {
  return (
    <Chapter id="visit" build={build} stageClassName="visit">
      <div className="visit__head copy copy--top-left">
        <p className="chapter-num">Present day</p>
        <h2 id="visit-title" className="display">
          Walk It Today
        </h2>
        <DiscoverPanel label={data.discover!.label}>{data.discover!.body}</DiscoverPanel>
      </div>

      {STOPS.map((s) => (
        <p key={s.id} className={`visit__shot visit__shot--${s.id} display display--line`}>
          {s.line}
        </p>
      ))}

      <div className="route">
        <span className="route__fill" aria-hidden="true" />
        <ol className="route__stops" aria-label="Route through the site">
          {STOPS.map((s) => (
            <li key={s.id} className={`route__stop route__stop--${s.id}`} style={{ ["--on" as string]: 0 }}>
              {s.place}
            </li>
          ))}
        </ol>
      </div>
    </Chapter>
  );
}
