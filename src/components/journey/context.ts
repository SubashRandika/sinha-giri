"use client";

import { createContext, useContext } from "react";
import type { ChapterId } from "@/content/chapters";

export interface JourneyApi {
  reduced: boolean;
  registerSection: (id: ChapterId, el: HTMLElement | null) => void;
  registerTimeline: (id: ChapterId, tl: gsap.core.Timeline) => void;
  goTo: (id: ChapterId) => void;
}

export const JourneyContext = createContext<JourneyApi | null>(null);

export function useJourney() {
  const api = useContext(JourneyContext);
  if (!api) throw new Error("useJourney must be used inside <Journey>");
  return api;
}
