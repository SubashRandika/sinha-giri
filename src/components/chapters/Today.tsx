"use client";

import { Chapter, type Build } from "@/components/journey/Chapter";

const build: Build = (tl, _root, { q, enter, leave }) => {
  tl.from(q(".today__num"), { ...enter(20), duration: 0.05 }, 0.04);
  tl.fromTo(q(".today__cut--then"), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.05 }, 0.08);
  tl.to(q(".today__cut--then"), { autoAlpha: 0, duration: 0.02 }, 0.34);
  tl.fromTo(q(".today__cut--now"), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.02 }, 0.36);
  tl.to(q(".today__cut--now, .today__num"), { autoAlpha: 0, duration: 0.05 }, 0.6);
  tl.from(q(".today__line"), { ...enter(30), duration: 0.1 }, 0.14);
  tl.to(q(".today__line"), { ...leave(-30), duration: 0.08 }, 0.58);
  tl.from(q(".today__name"), { ...enter(60), duration: 0.12 }, 0.7);
  tl.from(q(".today__status"), { autoAlpha: 0, duration: 0.08 }, 0.78);
  tl.to(q(".today__final"), { ...leave(-30), duration: 0.06 }, 0.94);
};

export function Today() {
  return (
    <Chapter id="today" build={build} stageClassName="today">
      <p className="chapter-num today__num">Chapter 12 · Today</p>
      <p className="today__cut today__cut--then ui-label" aria-hidden="true">
        Silhouette · reconstruction
      </p>
      <p className="today__cut today__cut--now ui-label" aria-hidden="true">
        Silhouette · today
      </p>
      <p className="today__line display display--line">What remains is enough to remember.</p>
      <div className="today__final copy copy--center">
        <h2 id="today-title" className="display display--xl today__name">
          Sigiriya
        </h2>
        <p className="today__status ui-label">UNESCO World Heritage Site · 1982</p>
      </div>
    </Chapter>
  );
}
