"use client";

import { useEffect, useRef, useState } from "react";
import type { Ambience } from "@/lib/audio/ambience";

/** Sound starts off; the audio graph is only built on the first opt-in. */
export function SoundToggle() {
  const [on, setOn] = useState(false);
  const engine = useRef<Ambience | null>(null);

  useEffect(() => () => engine.current?.destroy(), []);

  const toggle = async () => {
    const next = !on;
    if (next && !engine.current) {
      const { Ambience } = await import("@/lib/audio/ambience");
      engine.current = new Ambience();
    }
    await engine.current?.setEnabled(next);
    setOn(next);
  };

  return (
    <button type="button" className="hud-btn hud-sound" aria-pressed={on} aria-label="Ambient sound" onClick={toggle}>
      <span className={`hud-sound__bars ${on ? "is-on" : ""}`} aria-hidden="true">
        <i />
        <i />
        <i />
      </span>
      {on ? "Sound on" : "Sound off"}
    </button>
  );
}
