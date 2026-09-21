"use client";

import { Chapter, type Build } from "@/components/journey/Chapter";
import { DiscoverPanel } from "@/components/ui/DiscoverPanel";
import { CHAPTERS } from "@/content/chapters";

const data = CHAPTERS.find((c) => c.id === "rock")!;

const build: Build = (tl, _root, { q, enter, leave }) => {
  tl.from(q(".rock__num"), { ...enter(20), duration: 0.12 }, 0.05);
  tl.from(q(".rock__title"), { ...enter(60), duration: 0.18 }, 0.08);
  tl.from(q(".rock__lead"), { ...enter(30), duration: 0.16 }, 0.22);
  tl.from(q(".rock .discover"), { autoAlpha: 0, duration: 0.1 }, 0.36);
  tl.to(q(".rock__copy"), { ...leave(-40), duration: 0.14 }, 0.84);
};

export function Rock() {
  return (
    <Chapter id="rock" build={build} stageClassName="rock">
      <div className="rock__copy copy copy--bottom-left">
        <p className="chapter-num rock__num">Chapter 01</p>
        <h2 id="rock-title" className="display rock__title">
          The Rock
        </h2>
        <p className="lead rock__lead">Rising above the forests of central Sri Lanka, Sigiriya has watched centuries pass beneath it.</p>
        <DiscoverPanel label={data.discover!.label}>{data.discover!.body}</DiscoverPanel>
      </div>
    </Chapter>
  );
}
