"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";
import gsap from "gsap";
import { CHAPTERS, type ChapterId } from "@/content/chapters";
import { useJourney } from "./context";

export interface BuildTools {
  reduced: boolean;
  /** Entrance vars: a rise in normal mode, opacity only under reduced motion. */
  enter: (distance?: number) => gsap.TweenVars;
  /** Exit vars, mirroring enter. */
  leave: (distance?: number) => gsap.TweenVars;
  q: (selector: string) => Element[];
}

export type Build = (tl: gsap.core.Timeline, root: HTMLElement, tools: BuildTools) => void;

interface Props {
  id: ChapterId;
  build?: Build;
  children: ReactNode;
  className?: string;
  stageClassName?: string;
}

/**
 * A chapter is a tall section with a sticky, full-viewport stage. Its
 * timeline is a paused GSAP timeline normalised to a duration of 1; the
 * journey controller scrubs it with the chapter's local progress.
 */
export function Chapter({ id, build, children, className = "", stageClassName = "" }: Props) {
  const ref = useRef<HTMLElement>(null);
  const { registerSection, registerTimeline, reduced } = useJourney();
  const length = CHAPTERS.find((c) => c.id === id)?.length ?? 2;

  useLayoutEffect(() => {
    registerSection(id, ref.current);
    return () => registerSection(id, null);
  }, [id, registerSection]);

  useLayoutEffect(() => {
    const root = ref.current;
    if (!build || !root) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ paused: true, defaults: { ease: "none", duration: 0.1 } });
      build(tl, root, {
        reduced,
        enter: (d = 40) => (reduced ? { autoAlpha: 0 } : { autoAlpha: 0, y: d }),
        leave: (d = -30) => (reduced ? { autoAlpha: 0 } : { autoAlpha: 0, y: d }),
        q: (s) => gsap.utils.toArray<Element>(s, root),
      });
      tl.set({}, {}, 1);
      registerTimeline(id, tl);
    }, root);
    return () => ctx.revert();
  }, [build, id, reduced, registerTimeline]);

  return (
    <section
      id={`chapter-${id}`}
      ref={ref}
      data-chapter={id}
      className={`chapter ${className}`}
      style={{ ["--len" as string]: length }}
      aria-labelledby={`${id}-title`}
    >
      <div className={`stage ${stageClassName}`}>{children}</div>
    </section>
  );
}
