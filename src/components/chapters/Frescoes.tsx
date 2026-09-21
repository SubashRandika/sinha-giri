"use client";

import Image from "next/image";
import { Chapter, type Build } from "@/components/journey/Chapter";
import { DiscoverPanel } from "@/components/ui/DiscoverPanel";
import { CHAPTERS } from "@/content/chapters";

const data = CHAPTERS.find((c) => c.id === "frescoes")!;

/** Deterministic scatter so server and client render the same motes. */
const hash = (n: number) => {
  const s = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
};
const DUST = Array.from({ length: 18 }, (_, i) => ({
  x: hash(i) * 100,
  dur: 14 + hash(i + 40) * 12,
  delay: hash(i + 80) * 26,
}));

const build: Build = (tl, root, { q, enter, leave, reduced }) => {
  const strip = root.querySelector<HTMLElement>(".rockface__strip");
  tl.from(q(".frescoes__num"), { ...enter(20), duration: 0.06 }, 0.02);
  tl.from(q(".frescoes__title"), { ...enter(40), duration: 0.1 }, 0.04);
  tl.to(q(".frescoes__head"), { ...leave(-30), duration: 0.08 }, 0.3);
  // A slow camera along the rock face, with a pool of warm light ahead of it.
  if (strip) {
    tl.fromTo(
      strip,
      { x: 0 },
      { x: () => -(strip.scrollWidth - window.innerWidth), duration: reduced ? 0.001 : 0.9, ease: "sine.inOut" },
      0.05,
    );
  }
  tl.fromTo(q(".rockface"), { "--lx": "8%" }, { "--lx": "92%", duration: 0.9, ease: "sine.inOut" }, 0.05);
  tl.from(q(".frescoes__context"), { ...enter(20), duration: 0.08 }, 0.56);
  tl.to(q(".frescoes__context"), { ...leave(-20), duration: 0.06 }, 0.93);
};

export function Frescoes() {
  return (
    <Chapter id="frescoes" build={build} stageClassName="frescoes">
      <div className="rockface" style={{ ["--lx" as string]: "8%" }}>
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
        <div className="rockface__light" aria-hidden="true" />
        <div className="dust" aria-hidden="true">
          {DUST.map((d, i) => (
            <i key={i} style={{ left: `${d.x}%`, animationDuration: `${d.dur}s`, animationDelay: `${-d.delay}s` }} />
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
