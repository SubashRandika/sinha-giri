"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { CHAPTERS, type ChapterId } from "@/content/chapters";
import { easeYear, lerp, smoothstep } from "@/lib/time/curve";
import { CHOREOGRAPHY, type Look } from "./choreography";
import { FILMS, readyFilms } from "./films";
import { emitFrame, timeState, type LayerState } from "./store";

gsap.registerPlugin(ScrollTrigger);

interface Entry {
  id: ChapterId;
  index: number;
  trigger: ScrollTrigger;
  timeline?: gsap.core.Timeline;
  lastProgress: number;
}

export type EvidenceKind = "photograph" | "animated" | "reconstruction" | "illustration" | "none";

/** Which chapters show non-photographic imagery that is not a plate blend. */
const EVIDENCE_OVERRIDE: Partial<Record<ChapterId, EvidenceKind>> = {
  ascent: "illustration",
  frescoes: "photograph",
  mirror: "illustration",
  discovery: "illustration",
  thennow: "none",
  finale: "none",
};

export const evidence = { kind: "photograph" as EvidenceKind, share: 0 };

function copyLayer(dst: LayerState, src: LayerState) {
  dst.mode = src.mode;
  dst.plate = src.plate;
  dst.mask = src.mask;
  dst.reveal = src.reveal;
  dst.camera.zoom = src.camera.zoom;
  dst.camera.x = src.camera.x;
  dst.camera.y = src.camera.y;
  dst.film0 = src.film0;
  dst.time0 = src.time0;
  dst.film1 = src.film1;
  dst.time1 = src.time1;
  dst.filmMix = src.filmMix;
}

/** What the visitor is looking at in a layer, given which clips can play. */
function evidenceOf(l: LayerState): { kind: EvidenceKind; share: number } {
  const slot = l.film1 && l.filmMix > 0.5 ? 1 : 0;
  const id = slot ? l.film1 : l.film0;
  if (id && readyFilms.has(id)) {
    // A time-lapse starts on the photograph and ends on the reconstruction.
    const share = FILMS[id].kind === "timelapse" ? (slot ? l.time1 : l.time0) : 0;
    return { kind: share > 0.5 ? "reconstruction" : "animated", share };
  }
  return { kind: l.reveal > 0.5 ? "reconstruction" : "photograph", share: l.reveal };
}

/**
 * One scroll reader drives the whole journey. Chapters are measured with
 * ScrollTrigger (for correct refresh on resize), but no trigger has its own
 * callback: a single gsap.ticker function computes the year and writes the
 * world state, then scrubs each chapter's paused DOM timeline.
 */
export class JourneyController {
  private entries: Entry[] = [];
  private smoothY = 0;
  private lastYear = 2026;
  private lastTime = 0;
  private reduced: boolean;
  private tick = () => this.update();
  intro = { fog: 1 };

  constructor(sections: Map<ChapterId, HTMLElement>, opts: { reduced: boolean }) {
    this.reduced = opts.reduced;
    CHAPTERS.forEach((c, index) => {
      const el = sections.get(c.id);
      if (!el) return;
      const trigger = ScrollTrigger.create({ trigger: el, start: "top top", end: "bottom bottom" });
      this.entries.push({ id: c.id, index, trigger, lastProgress: -1 });
    });
    this.smoothY = window.scrollY;
    gsap.ticker.add(this.tick);
    if (!this.reduced) gsap.to(this.intro, { fog: 0, duration: 4.5, ease: "power2.out", delay: 0.2 });
    else this.intro.fog = 0;
  }

  registerTimeline(id: ChapterId, tl: gsap.core.Timeline) {
    const e = this.entries.find((x) => x.id === id);
    if (e) {
      e.timeline = tl;
      e.lastProgress = -1;
    }
  }

  /** Scroll position that shows a chapter's stage at the given progress. */
  positionOf(id: ChapterId, progress = 0) {
    const e = this.entries.find((x) => x.id === id);
    if (!e) return 0;
    return e.trigger.start + (e.trigger.end - e.trigger.start) * progress;
  }

  jumpTo(id: ChapterId) {
    const y = this.positionOf(id, 0.02);
    window.scrollTo({ top: y, behavior: "instant" as ScrollBehavior });
    this.smoothY = y;
  }

  destroy() {
    gsap.ticker.remove(this.tick);
    this.entries.forEach((e) => e.trigger.kill());
  }

  private look(entry: Entry, local: number): Look {
    const c = CHAPTERS[entry.index];
    const year = lerp(c.years[0], c.years[1], easeYear(c.yearEase, local));
    const look = CHOREOGRAPHY[c.id](local, year);
    if (this.reduced) {
      // Static compositions: keep the chapter's mid-point framing.
      look.layer.camera = CHOREOGRAPHY[c.id](0.5, year).layer.camera;
      look.climb = 0.5;
    }
    return look;
  }

  private update() {
    if (!this.entries.length) return;
    const now = performance.now();
    const dt = Math.min(0.1, (now - (this.lastTime || now)) / 1000) || 1 / 60;
    this.lastTime = now;

    const target = window.scrollY;
    this.smoothY = this.reduced ? target : lerp(this.smoothY, target, 1 - Math.exp(-dt * 7));
    if (Math.abs(this.smoothY - target) < 0.3) this.smoothY = target;
    const y = this.smoothY;

    // Find the chapter whose stage is on screen, and any hand-off in progress.
    let i = 0;
    for (let k = 0; k < this.entries.length; k++) if (y >= this.entries[k].trigger.start - 0.5) i = k;
    const cur = this.entries[i];
    const span = Math.max(1, cur.trigger.end - cur.trigger.start);
    const local = Math.min(1, Math.max(0, (y - cur.trigger.start) / span));
    const next = this.entries[i + 1];
    let mix = 0;
    if (next && y > cur.trigger.end) {
      mix = smoothstep(0, 1, (y - cur.trigger.end) / Math.max(1, next.trigger.start - cur.trigger.end));
    }

    const chapter = CHAPTERS[cur.index];
    const year = lerp(chapter.years[0], chapter.years[1], easeYear(chapter.yearEase, local));
    const a = this.look(cur, local);
    const b = next && mix > 0 ? this.look(next, 0) : a;

    const s = timeState;
    s.year = year;
    const rawSpeed = (year - this.lastYear) / 100 / dt;
    s.speed = lerp(s.speed, rawSpeed, 1 - Math.exp(-dt * 6));
    this.lastYear = year;
    s.chapter = mix > 0.5 && next ? next.id : cur.id;
    s.local = local;
    const docEnd = document.documentElement.scrollHeight - window.innerHeight;
    s.journey = docEnd > 0 ? y / docEnd : 0;

    copyLayer(s.layerA, a.layer);
    copyLayer(s.layerB, b.layer);
    s.layerMix = mix;
    s.vegetation = lerp(a.vegetation, b.vegetation, mix);
    s.fog = Math.min(1, lerp(a.fog, b.fog, mix) + this.intro.fog * 0.45);
    s.warmth = lerp(a.warmth, b.warmth, mix);
    s.exposure = lerp(a.exposure, b.exposure, mix);
    s.drawing = lerp(a.drawing, b.drawing, mix);
    s.silhouette = lerp(a.silhouette, b.silhouette, mix);
    s.dust = lerp(a.dust, b.dust, mix);
    s.climb = lerp(a.climb, b.climb, mix);

    const shown = s.chapter;
    const override = EVIDENCE_OVERRIDE[shown];
    const shownLayer = mix > 0.5 ? s.layerB : s.layerA;
    if (override) {
      evidence.kind = override;
      evidence.share = override === "illustration" ? 1 : 0;
    } else {
      const e = evidenceOf(shownLayer);
      evidence.kind = e.kind;
      evidence.share = e.share;
    }
    s.evidence = evidence.share;

    // Scrub chapter timelines: finished chapters stay finished.
    for (let k = 0; k < this.entries.length; k++) {
      const e = this.entries[k];
      if (!e.timeline) continue;
      const p = k < i ? 1 : k > i ? 0 : local;
      if (Math.abs(p - e.lastProgress) > 1e-4) {
        e.timeline.progress(p);
        e.lastProgress = p;
      }
    }

    emitFrame();
  }
}
