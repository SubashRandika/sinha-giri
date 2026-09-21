"use client";

import { Chapter, type Build } from "@/components/journey/Chapter";
import { DiscoverPanel } from "@/components/ui/DiscoverPanel";
import { CHAPTERS } from "@/content/chapters";

const data = CHAPTERS.find((c) => c.id === "discovery")!;

const LOG = [
  { when: "19th century", what: "Colonial officers and surveyors describe the ruins in the forest." },
  { when: "1890s", what: "H. C. P. Bell of the Archaeological Survey of Ceylon begins systematic excavation." },
  { when: "1982", what: "Sigiriya is inscribed on the UNESCO World Heritage List." },
  { when: "1980s → today", what: "The Central Cultural Fund leads excavation, documentation and conservation." },
];

const build: Build = (tl, _root, { q, enter, leave }) => {
  tl.from(q(".sheet"), { autoAlpha: 0, duration: 0.08 }, 0.08);
  tl.from(q(".disc__num"), { ...enter(20), duration: 0.06 }, 0.1);
  tl.from(q(".disc__title"), { ...enter(40), duration: 0.1 }, 0.12);
  tl.from(q(".disc__lead"), { ...enter(20), duration: 0.08 }, 0.2);
  q(".log__item").forEach((el, i) => tl.from(el, { ...enter(16), duration: 0.06 }, 0.3 + i * 0.1));
  tl.from(q(".disc .discover"), { autoAlpha: 0, duration: 0.05 }, 0.66);
  tl.to(q(".disc__copy, .sheet"), { ...leave(-20), duration: 0.08 }, 0.9);
};

export function Discovery() {
  return (
    <Chapter id="discovery" build={build} stageClassName="disc">
      <div className="disc__copy copy copy--top-left copy--ink">
        <p className="chapter-num disc__num">Chapter 11</p>
        <h2 id="discovery-title" className="display disc__title">
          Found, Measured, Conserved
        </h2>
        <p className="lead disc__lead">What visitors see today is the result of fifteen centuries of change, and more than a century of careful investigation.</p>
        <ol className="log">
          {LOG.map((l) => (
            <li key={l.when} className="log__item">
              <span className="log__when">{l.when}</span>
              <span className="log__what">{l.what}</span>
            </li>
          ))}
        </ol>
        <DiscoverPanel label={data.discover!.label}>{data.discover!.body}</DiscoverPanel>
      </div>

      <div className="sheet" aria-hidden="true">
        <svg className="sheet__north" viewBox="0 0 40 60">
          <path d="M20 4 L30 40 L20 32 L10 40 Z" />
          <text x="20" y="56" textAnchor="middle">N</text>
        </svg>
        <dl className="sheet__block">
          <div><dt>Site</dt><dd>Sigiriya</dd></div>
          <div><dt>Drawing</dt><dd>Survey sheet 11</dd></div>
          <div><dt>Scale</dt><dd>Not to scale</dd></div>
          <div><dt>Source</dt><dd>Traced from a present-day aerial photograph</dd></div>
        </dl>
      </div>
    </Chapter>
  );
}
