"use client";

import { Chapter, type Build } from "@/components/journey/Chapter";
import { DiscoverPanel } from "@/components/ui/DiscoverPanel";
import { CHAPTERS } from "@/content/chapters";

const data = CHAPTERS.find((c) => c.id === "summit")!;

const build: Build = (tl, _root, { q, enter, leave }) => {
  tl.from(q(".summit__num"), { ...enter(20), duration: 0.06 }, 0.3);
  tl.from(q(".summit__title"), { ...enter(60), duration: 0.14 }, 0.34);
  tl.from(q(".summit__meta"), { autoAlpha: 0, duration: 0.1 }, 0.5);
  tl.from(q(".summit .discover"), { autoAlpha: 0, duration: 0.06 }, 0.58);
  tl.to(q(".summit__copy"), { ...leave(-40), duration: 0.1 }, 0.88);
};

export function Summit() {
  return (
    <Chapter id="summit" build={build} stageClassName="summit">
      <div className="summit__copy copy copy--bottom-center">
        <p className="chapter-num summit__num">Chapter 08 · 477 CE</p>
        <h2 id="summit-title" className="display display--wide summit__title">
          The Palace Above the Forest
        </h2>
        <p className="summit__meta ui-label">Sigiriya · c. 5th Century CE</p>
        <DiscoverPanel label={data.discover!.label}>{data.discover!.body}</DiscoverPanel>
      </div>
    </Chapter>
  );
}
