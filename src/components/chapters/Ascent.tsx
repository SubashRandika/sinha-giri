"use client";

import { Chapter, type Build } from "@/components/journey/Chapter";

const WAYPOINTS = ["Water gardens", "Boulder gardens", "Terraced gardens", "The western gallery", "Lion platform"];

const build: Build = (tl, _root, { q, enter, leave }) => {
  tl.from(q(".ascent__num"), { ...enter(20), duration: 0.06 }, 0.02);
  tl.from(q(".ascent__title"), { ...enter(50), duration: 0.1 }, 0.03);
  tl.to(q(".ascent__head"), { ...leave(-60), duration: 0.1 }, 0.3);
  tl.from(q(".ascent__line--1"), { ...enter(30), duration: 0.08 }, 0.3);
  tl.to(q(".ascent__line--1"), { ...leave(-30), duration: 0.08 }, 0.52);
  tl.from(q(".ascent__line--2"), { ...enter(30), duration: 0.08 }, 0.58);
  tl.to(q(".ascent__line--2"), { ...leave(-30), duration: 0.08 }, 0.86);
  // The route gauge: the climber's marker rises past each waypoint.
  tl.fromTo(q(".route__climber"), { "--p": 0 }, { "--p": 1, duration: 0.96 }, 0.02);
  q(".route__stop").forEach((el, i) => tl.to(el, { "--on": 1, duration: 0.03 }, 0.02 + (i / (WAYPOINTS.length - 1)) * 0.94));
};

export function Ascent() {
  return (
    <Chapter id="ascent" build={build} stageClassName="ascent">
      <div className="ascent__head copy copy--center">
        <p className="chapter-num ascent__num">Chapter 05</p>
        <h2 id="ascent-title" className="display ascent__title">
          The Ascent
        </h2>
      </div>
      <p className="lead lead--large ascent__line ascent__line--1">The path winds up through boulders and terraces.</p>
      <p className="lead lead--large ascent__line ascent__line--2">Then it clings to the rock itself.</p>

      <ol className="route" aria-label="The route to the summit, from the gardens upward">
        {WAYPOINTS.map((w) => (
          <li key={w} className="route__stop" style={{ ["--on" as string]: 0 }}>
            {w}
          </li>
        ))}
        <li className="route__climber" aria-hidden="true" style={{ ["--p" as string]: 0 }} />
      </ol>
    </Chapter>
  );
}
