"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { Chapter, type Build } from "@/components/journey/Chapter";
import { useJourney } from "@/components/journey/context";

// Scroll moves the wrappers; the load-in intro animates what's inside them,
// so the two never fight over the same property.
const build: Build = (tl, root, { reduced }) => {
  tl.to(root.querySelector(".hero__cue-wrap"), { autoAlpha: 0, duration: 0.12 }, 0.02);
  tl.to(root.querySelector(".hero__minor"), { autoAlpha: 0, duration: 0.3 }, 0.12);
  tl.to(
    root.querySelector(".hero__title-wrap"),
    reduced ? { autoAlpha: 0, duration: 0.5 } : { autoAlpha: 0, scale: 1.1, filter: "blur(8px)", duration: 0.6 },
    0.2,
  );
};

export function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const { reduced } = useJourney();

  // The one time-based sequence: an almost silent opening.
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      if (reduced) {
        gsap.from(el.querySelectorAll(".hero__intro"), { autoAlpha: 0, duration: 1, stagger: 0.2 });
        return;
      }
      gsap
        .timeline({ delay: 0.6 })
        .from(el.querySelectorAll(".hero__title .l"), { autoAlpha: 0, filter: "blur(14px)", y: 14, duration: 2.2, stagger: 0.09, ease: "power2.out" })
        .from(el.querySelector(".hero__sub"), { autoAlpha: 0, letterSpacing: "1.1em", duration: 2.2, ease: "power2.out" }, "-=1.3")
        .from(el.querySelectorAll(".hero__meta, .hero__native"), { autoAlpha: 0, duration: 1.4 }, "-=0.9")
        .from(el.querySelector(".hero__cue"), { autoAlpha: 0, y: -8, duration: 1 }, "+=0.3");
    }, el);
    return () => ctx.revert();
  }, [reduced]);

  return (
    <Chapter id="hero" build={build} stageClassName="hero">
      <div ref={ref} className="hero__inner">
        <div className="hero__title-wrap">
          <p className="hero__native hero__intro" lang="si">
            සීගිරිය
          </p>
          <h1 id="hero-title" className="hero__title hero__intro" aria-label="Sigiriya">
            {"SIGIRIYA".split("").map((ch, i) => (
              <span key={i} className="l" aria-hidden="true">
                {ch}
              </span>
            ))}
          </h1>
        </div>
        <div className="hero__minor">
          <p className="hero__sub hero__intro">Lion Rock</p>
          <p className="hero__meta hero__intro">Sri Lanka · Ancient City · c. 5th Century CE</p>
        </div>
        <div className="hero__cue-wrap">
          <p className="hero__cue hero__intro" aria-hidden="true">
            <span>Scroll to enter</span>
            <i />
          </p>
        </div>
      </div>
    </Chapter>
  );
}
