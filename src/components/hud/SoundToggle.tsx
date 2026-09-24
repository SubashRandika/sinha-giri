"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Ambience } from "@/lib/audio/ambience";

/**
 * The gestures browsers accept as permission to start audio. A wheel scroll is
 * not one of them, so on a page read by scrolling the sound arrives with the
 * visitor's first click, tap or key.
 */
const GESTURES = ["pointerdown", "keydown", "touchend"] as const;

/**
 * Sound is on by default: the audio graph is still built lazily, but it is
 * built and started at the first gesture the browser honours rather than
 * waiting to be asked. The bars only move once sound is truly audible.
 */
export function SoundToggle() {
  const [on, setOn] = useState(true);
  const [playing, setPlaying] = useState(false);
  const engine = useRef<Ambience | null>(null);
  const btn = useRef<HTMLButtonElement>(null);
  const alive = useRef(false);

  const start = useCallback(async (e?: Event) => {
    // A press on the toggle is answered by the toggle, not by this listener.
    if (e && btn.current?.contains(e.target as Node)) return;
    if (!engine.current) {
      const { Ambience } = await import("@/lib/audio/ambience");
      if (!alive.current) return;
      engine.current = new Ambience();
      engine.current.onRunningChange = setPlaying;
    }
    engine.current.setEnabled(true);
    setPlaying(engine.current.running);
  }, []);

  useEffect(() => {
    alive.current = true;
    // Someone who clicked or typed while the page was still loading has given
    // permission already, and the listeners below would never see that gesture.
    // Without it, building the graph now would only earn an autoplay warning.
    if (navigator.userActivation?.hasBeenActive) void start();
    return () => {
      alive.current = false;
      engine.current?.destroy();
      engine.current = null;
    };
  }, [start]);

  useEffect(() => {
    if (!on || playing) return;
    for (const type of GESTURES) window.addEventListener(type, start, { passive: true });
    return () => {
      for (const type of GESTURES) window.removeEventListener(type, start);
    };
  }, [on, playing, start]);

  const toggle = () => {
    const next = !on;
    setOn(next);
    if (next) {
      void start();
    } else {
      engine.current?.setEnabled(false);
      setPlaying(false);
    }
  };

  return (
    <button ref={btn} type="button" className="hud-btn hud-sound" aria-pressed={on} aria-label="Ambient sound" onClick={toggle}>
      <span className={`hud-sound__bars ${playing ? "is-on" : ""}`} aria-hidden="true">
        <i />
        <i />
        <i />
      </span>
      {on ? "Sound on" : "Sound off"}
    </button>
  );
}
