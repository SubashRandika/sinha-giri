"use client";

import { useEffect, useRef, useState } from "react";
import { CHAPTERS, NAV_CHAPTERS, type ChapterId, type HistoricalChapter } from "@/content/chapters";
import { STRATA, depthOf, easeYear, formatYear, lerp } from "@/lib/time/curve";
import { subscribeFrame } from "@/lib/journey/store";
import { useJourney } from "@/components/journey/context";

const DESCENT_END = CHAPTERS.findIndex((c) => c.id === "summit");

function midYear(c: HistoricalChapter) {
  return lerp(c.years[0], c.years[1], easeYear(c.yearEase, 0.5));
}

/**
 * The signature instrument: an excavation section drawing. Depth is age.
 * The marker sinks through the strata on the way to 477 CE and climbs back
 * to the surface on the way home. Descending chapters are pinned to the
 * left wall of the trench, returning chapters to the right wall.
 */
export function Stratigraphy() {
  const { goTo } = useJourney();
  const markerRef = useRef<HTMLDivElement>(null);
  const tagRef = useRef<HTMLSpanElement>(null);
  const [active, setActive] = useState<ChapterId>("hero");

  useEffect(() => {
    let last = "";
    let lastChapter: ChapterId = "hero";
    return subscribeFrame((s) => {
      const d = depthOf(s.year);
      if (markerRef.current) markerRef.current.style.transform = `translate3d(0, ${(d * 100).toFixed(3)}cqh, 0)`;
      const f = formatYear(s.year);
      const label = `${f.approx ? "c. " : ""}${f.value}${f.suffix ? " " + f.suffix : ""}`;
      if (label !== last && tagRef.current) {
        tagRef.current.textContent = label;
        last = label;
      }
      if (s.chapter !== lastChapter) {
        lastChapter = s.chapter;
        setActive(s.chapter);
      }
    });
  }, []);

  return (
    <nav className={`strata ${active === "hero" ? "is-quiet" : ""}`} aria-label="Chapters, arranged by depth in time">
      <div className="strata__labels" aria-hidden="true">
        <span>Now</span>
        <span>477 CE</span>
      </div>
      <div className="strata__column">
        {STRATA.map((s) => (
          <div key={s.id} className={`strata__layer strata__layer--${s.hatch}`} style={{ flexGrow: s.weight }}>
            <span className="strata__era">{s.label}</span>
          </div>
        ))}
        <div ref={markerRef} className="strata__marker" aria-hidden="true">
          <span ref={tagRef} className="strata__tag">2026</span>
        </div>
        <ol className="strata__ticks">
          {NAV_CHAPTERS.map((c) => {
            const order = CHAPTERS.indexOf(c);
            const side = order <= DESCENT_END ? "down" : "up";
            return (
              <li key={c.id} className={`strata__tick strata__tick--${side}`} style={{ top: `${depthOf(midYear(c)) * 100}%` }}>
                <button
                  type="button"
                  onClick={() => goTo(c.id)}
                  aria-current={active === c.id ? "step" : undefined}
                  className="strata__btn"
                >
                  <span className="strata__num" aria-hidden="true">
                    {String(c.index).padStart(2, "0")}
                  </span>
                  <span className="strata__name">{c.navLabel}</span>
                </button>
              </li>
            );
          })}
        </ol>
      </div>
    </nav>
  );
}
