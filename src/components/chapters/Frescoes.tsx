"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { Chapter, type Build } from "@/components/journey/Chapter";
import { DiscoverPanel } from "@/components/ui/DiscoverPanel";
import { CHAPTERS } from "@/content/chapters";
import { subscribeFrame } from "@/lib/journey/store";

const data = CHAPTERS.find((c) => c.id === "frescoes")!;

/** Deterministic scatter so server and client render the same motes. */
const hash = (n: number) => {
  const s = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
};
const DUST = Array.from({ length: 22 }, (_, i) => ({
  x: hash(i) * 100,
  dur: 14 + hash(i + 40) * 12,
  delay: hash(i + 80) * 26,
  depth: 0.35 + hash(i + 120) * 0.65,
}));

/** Camera x that brings an element's centre to the middle of the frame. */
const centre = (el: HTMLElement) => () => -(el.offsetLeft + el.offsetWidth / 2 - window.innerWidth / 2);

/**
 * Someone walking the gallery with a lamp. The wall does not slide past at a
 * constant rate: the camera travels, settles on a painting and leans in, then
 * moves on. The lamp stays with the walker, near the middle of the frame, and
 * the pigment comes back to life only inside the pool of light it casts.
 */
const build: Build = (tl, root, { q, enter, leave, reduced }) => {
  const face = root.querySelector<HTMLElement>(".rockface");
  const dolly = root.querySelector<HTMLElement>(".rockface__dolly");
  const strip = root.querySelector<HTMLElement>(".rockface__strip");
  const a = root.querySelector<HTMLElement>(".fresco--a");
  const b = root.querySelector<HTMLElement>(".fresco--b");

  tl.from(q(".frescoes__num"), { ...enter(20), duration: 0.06 }, 0.02);
  tl.from(q(".frescoes__title"), { ...enter(40), duration: 0.1 }, 0.04);
  tl.to(q(".frescoes__head"), { ...leave(-30), duration: 0.08 }, 0.3);

  if (strip && a && b) {
    // Travel, hold, travel, hold, travel out. The gaps are the held beats.
    const walk = (to: () => number, at: number, dur: number) =>
      tl.to(strip, { x: to, duration: reduced ? 0.001 : dur, ease: "power1.inOut" }, at);
    walk(centre(a), 0.05, 0.21);
    walk(centre(b), 0.4, 0.22);
    walk(() => -(strip.scrollWidth - window.innerWidth), 0.76, 0.18);

    if (!reduced) {
      // The nearer panel travels further than the far one, which reads as depth.
      tl.fromTo(a, { x: 70 }, { x: -70, duration: 0.9 }, 0.05);
      tl.fromTo(b, { x: 26 }, { x: -26, duration: 0.9 }, 0.05);
    }
  }

  // Each painting emerges from the dark as it is approached and sinks back after.
  if (a && b) {
    tl.fromTo(a, { autoAlpha: 0.12 }, { autoAlpha: 1, duration: 0.14, ease: "sine.out" }, 0.12);
    tl.to(a, { autoAlpha: 0.22, duration: 0.14, ease: "sine.in" }, 0.44);
    tl.fromTo(b, { autoAlpha: 0.12 }, { autoAlpha: 1, duration: 0.14, ease: "sine.out" }, 0.48);
    tl.to(b, { autoAlpha: 0.25, duration: 0.12, ease: "sine.in" }, 0.84);
  }
  tl.from(q(".fresco--a figcaption"), { autoAlpha: 0, duration: 0.05 }, 0.3);
  tl.from(q(".fresco--b figcaption"), { autoAlpha: 0, duration: 0.05 }, 0.66);

  if (dolly && !reduced) {
    // A lean towards each painting while the camera is stopped in front of it.
    for (const at of [0.26, 0.62]) {
      tl.to(dolly, { scale: 1.06, duration: 0.14, ease: "sine.inOut" }, at);
      tl.to(dolly, { scale: 1, duration: 0.12, ease: "sine.inOut" }, at + 0.14);
    }
  }

  if (face) {
    // The lamp is carried, so it wanders near the middle rather than sweeping past.
    tl.fromTo(
      face,
      { "--lx": "42%", "--ly": "50%" },
      { "--lx": "55%", "--ly": "45%", duration: 0.45, ease: "sine.inOut" },
      0.05,
    );
    tl.to(face, { "--lx": "46%", "--ly": "52%", duration: 0.45, ease: "sine.inOut" }, 0.5);
    // The rock itself, the furthest layer, creeps by more slowly than anything on it.
    if (!reduced) tl.fromTo(face, { "--grain": "0px" }, { "--grain": "-90px", duration: 0.9 }, 0.05);
  }

  tl.from(q(".frescoes__context"), { ...enter(20), duration: 0.08 }, 0.56);
  tl.to(q(".frescoes__context"), { ...leave(-20), duration: 0.06 }, 0.93);
};

export function Frescoes() {
  const dustRef = useRef<HTMLDivElement>(null);

  // Motes catch the light and streak when the camera is moving quickly. The
  // chapter covers three years, so its own clock is still — this follows the
  // reader's progress through the gallery instead.
  useEffect(() => {
    let last = -1;
    let drift = 0;
    let written = -1;
    return subscribeFrame((s) => {
      const el = dustRef.current;
      if (!el || s.chapter !== "frescoes") return;
      const step = last < 0 ? 0 : Math.abs(s.local - last);
      last = s.local;
      drift += (Math.min(1, step * 90) - drift) * 0.12;
      const v = Math.round(drift * 20) / 20;
      if (v === written) return;
      written = v;
      el.style.setProperty("--drift", String(v));
    });
  }, []);

  return (
    <Chapter id="frescoes" build={build} stageClassName="frescoes">
      <div className="rockface" style={{ ["--lx" as string]: "42%", ["--ly" as string]: "50%", ["--grain" as string]: "0px" }}>
        <div className="rockface__dolly">
          <div className="rockface__strip">
            <figure className="fresco fresco--a">
              <Image src="/frescoes/fresco-a.webp" alt="Painted women on the rock face, holding flowers and a tray, their bodies ending in clouds; ochre, green and red pigments on plaster." width={750} height={750} sizes="(max-width: 900px) 80vw, 40vw" />
              <figcaption>Photograph · western rock face</figcaption>
            </figure>
            <figure className="fresco fresco--b">
              <Image src="/frescoes/fresco-b.webp" alt="Two painted figures in profile, one holding lotus flowers, the other an attendant; the plaster around them cracked and lost." width={800} height={600} sizes="(max-width: 900px) 80vw, 36vw" />
              <figcaption>Photograph · painted on lime plaster</figcaption>
            </figure>
          </div>
        </div>
        {/* Where the lamp falls the pigment is saturated back to life; the grade
            is the only thing added, so the paint stays the paint. */}
        <div className="rockface__lamp" aria-hidden="true" />
        <div className="rockface__light" aria-hidden="true" />
        <div ref={dustRef} className="dust" aria-hidden="true">
          {DUST.map((d, i) => (
            <i key={i} style={{ left: `${d.x}%`, animationDuration: `${d.dur}s`, animationDelay: `${-d.delay}s`, ["--depth" as string]: d.depth.toFixed(2) }} />
          ))}
        </div>
      </div>

      <div className="frescoes__head copy copy--center">
        <p className="chapter-num frescoes__num">Chapter 07</p>
        <h2 id="frescoes-title" className="display frescoes__title">
          Colors that survived centuries
        </h2>
      </div>

      <div className="frescoes__context copy copy--bottom-left">
        <p className="lead">Who the women are is still debated. The paint has outlasted every answer.</p>
        <DiscoverPanel label={data.discover!.label}>{data.discover!.body}</DiscoverPanel>
      </div>
    </Chapter>
  );
}
