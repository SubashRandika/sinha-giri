"use client";

import { Chapter, type Build } from "@/components/journey/Chapter";
import { DiscoverPanel } from "@/components/ui/DiscoverPanel";
import { CHAPTERS } from "@/content/chapters";

const data = CHAPTERS.find((c) => c.id === "gardens")!;

const FLOW = [
  { id: "rain", label: "Rain", note: "Monsoon rainfall" },
  { id: "reservoir", label: "Reservoir", note: "Stored in tanks and moats" },
  { id: "channels", label: "Channels", note: "Carried by gravity, above and below ground" },
  { id: "pools", label: "Pools", note: "Held in symmetrical basins" },
  { id: "fountains", label: "Fountains", note: "Worked by gravity and pressure" },
];

const build: Build = (tl, _root, { q, enter, leave }) => {
  tl.from(q(".gardens__num"), { ...enter(20), duration: 0.06 }, 0.02);
  tl.from(q(".gardens__title"), { ...enter(50), duration: 0.1 }, 0.03);
  tl.from(q(".gardens__lead--today"), { ...enter(24), duration: 0.08 }, 0.1);
  tl.to(q(".gardens__lead--today"), { autoAlpha: 0, duration: 0.05 }, 0.34);
  tl.from(q(".gardens__lead--then"), { ...enter(24), duration: 0.08 }, 0.38);
  tl.from(q(".flow"), { autoAlpha: 0, duration: 0.06 }, 0.14);
  q(".flow__step").forEach((el, i) => {
    tl.to(el, { "--lit": 1, duration: 0.05 }, 0.18 + i * 0.07);
  });
  tl.from(q(".gardens .discover"), { autoAlpha: 0, duration: 0.06 }, 0.5);
  // The pools are full at 0.62: the type steps aside for the fountains.
  tl.to(q(".flow"), { autoAlpha: 0, duration: 0.05 }, 0.6);
  tl.to(q(".gardens__copy"), { ...leave(-40), duration: 0.06 }, 0.62);
};

export function Gardens() {
  return (
    <Chapter id="gardens" build={build} stageClassName="gardens">
      <div className="gardens__copy copy copy--top-left">
        <p className="chapter-num gardens__num">Chapter 04</p>
        <h2 id="gardens-title" className="display gardens__title">
          The Water Gardens
        </h2>
        <div className="gardens__leads">
          <p className="lead gardens__lead--today">Today, the pools are outlines in the grass.</p>
          <p className="lead gardens__lead--then">Follow the water, and they fill again.</p>
        </div>
        <DiscoverPanel label={data.discover!.label}>{data.discover!.body}</DiscoverPanel>
      </div>

      <ol className="flow" aria-label="How water reached the gardens">
        {FLOW.map((f, i) => (
          <li key={f.id} className="flow__step" style={{ ["--lit" as string]: 0 }}>
            <span className="flow__dot" aria-hidden="true" />
            <span className="flow__label">{f.label}</span>
            <span className="flow__note">{f.note}</span>
            {i < FLOW.length - 1 && (
              <svg className="flow__pipe" viewBox="0 0 2 40" preserveAspectRatio="none" aria-hidden="true">
                <line x1="1" y1="0" x2="1" y2="40" />
              </svg>
            )}
          </li>
        ))}
      </ol>
    </Chapter>
  );
}
