"use client";

import { useEffect, useRef, useState } from "react";
import { NAV_CHAPTERS, type ChapterId } from "@/content/chapters";
import { eraOf, formatYear } from "@/lib/time/curve";
import { subscribeFrame } from "@/lib/journey/store";
import { evidence, type EvidenceKind } from "@/lib/journey/controller";
import { useJourney } from "@/components/journey/context";
import { Stratigraphy } from "./Stratigraphy";
import { SoundToggle } from "./SoundToggle";

const EVIDENCE_TEXT: Record<EvidenceKind, { title: string; note: string }> = {
  photograph: { title: "Photograph", note: "What survives today" },
  reconstruction: { title: "Reconstruction", note: "Artistic interpretation" },
  illustration: { title: "Illustration", note: "Not a photograph" },
  none: { title: "", note: "" },
};

/** Chapters where the HUD year steps aside for a chapter's own typography. */
const QUIET: ChapterId[] = ["hero", "king", "finale", "thennow"];

export function Hud() {
  const { goTo } = useJourney();
  const yearRef = useRef<HTMLSpanElement>(null);
  const approxRef = useRef<HTMLSpanElement>(null);
  const suffixRef = useRef<HTMLSpanElement>(null);
  const eraRef = useRef<HTMLSpanElement>(null);
  const barRef = useRef<HTMLSpanElement>(null);
  const progressRef = useRef<HTMLSpanElement>(null);
  const [kind, setKind] = useState<EvidenceKind>("photograph");
  const [quiet, setQuiet] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    let lastValue = "";
    let lastEra = "";
    let lastKind: EvidenceKind = "photograph";
    let lastQuiet = true;
    return subscribeFrame((s) => {
      const f = formatYear(s.year);
      if (f.value !== lastValue && yearRef.current) {
        yearRef.current.textContent = f.value;
        approxRef.current!.style.visibility = f.approx ? "visible" : "hidden";
        suffixRef.current!.textContent = f.suffix;
        lastValue = f.value;
      }
      const era = eraOf(s.year).label;
      if (era !== lastEra && eraRef.current) {
        eraRef.current.textContent = era;
        lastEra = era;
      }
      if (barRef.current) barRef.current.style.transform = `scaleX(${evidence.share.toFixed(3)})`;
      if (progressRef.current) progressRef.current.style.transform = `scaleX(${s.journey.toFixed(4)})`;
      if (evidence.kind !== lastKind) {
        lastKind = evidence.kind;
        setKind(evidence.kind);
      }
      const tone = s.drawing > 0.5 ? "paper" : "night";
      if (document.documentElement.dataset.tone !== tone) document.documentElement.dataset.tone = tone;
      const q = QUIET.includes(s.chapter);
      if (q !== lastQuiet) {
        lastQuiet = q;
        setQuiet(q);
      }
    });
  }, []);

  useEffect(() => {
    const d = dialogRef.current;
    if (!d) return;
    if (menuOpen && !d.open) d.showModal();
    if (!menuOpen && d.open) d.close();
  }, [menuOpen]);

  const ev = EVIDENCE_TEXT[kind];

  return (
    <>
      <a className="skip-link" href="#notes">
        Skip to sources and historical notes
      </a>
      <header className={`hud-top ${quiet ? "is-quiet" : ""}`}>
        <a href="#chapter-hero" className="hud-mark" onClick={(e) => { e.preventDefault(); goTo("hero"); }}>
          Sigiriya
        </a>
        <div className="hud-actions">
          <SoundToggle />
          <button type="button" className="hud-btn" onClick={() => setMenuOpen(true)} aria-haspopup="dialog">
            Chapters
          </button>
        </div>
        <span className="hud-progress" aria-hidden="true">
          <span ref={progressRef} />
        </span>
      </header>

      <Stratigraphy />

      <div className={`hud-year ${quiet ? "is-quiet" : ""}`} aria-hidden="true">
        <span className="hud-year__line">
          <span ref={approxRef} className="hud-year__approx" style={{ visibility: "hidden" }}>c.</span>
          <span ref={yearRef} className="hud-year__value">2026</span>
          <span ref={suffixRef} className="hud-year__suffix" />
        </span>
        <span ref={eraRef} className="hud-year__era">World Heritage site</span>
      </div>

      <div className={`hud-evidence ${kind === "none" ? "is-hidden" : ""}`} role="note" aria-label={`Image type: ${ev.title}. ${ev.note}.`}>
        <span className="hud-evidence__kind">
          <i className={`hud-evidence__dot hud-evidence__dot--${kind}`} aria-hidden="true" />
          {ev.title}
        </span>
        <span className="hud-evidence__note">{ev.note}</span>
        <span className="hud-evidence__bar" aria-hidden="true">
          <span ref={barRef} />
        </span>
      </div>

      <dialog ref={dialogRef} className="chapter-menu" onClose={() => setMenuOpen(false)} aria-label="Chapters">
        <div className="chapter-menu__inner">
          <p className="chapter-menu__eyebrow">2026 → 477 CE → 2026</p>
          <ol>
            {NAV_CHAPTERS.map((c) => (
              <li key={c.id}>
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    goTo(c.id);
                  }}
                >
                  <span className="chapter-menu__num">{String(c.index).padStart(2, "0")}</span>
                  <span className="chapter-menu__title">{c.title}</span>
                </button>
              </li>
            ))}
          </ol>
          <button type="button" className="hud-btn chapter-menu__close" onClick={() => setMenuOpen(false)}>
            Close
          </button>
        </div>
      </dialog>
    </>
  );
}
