"use client";

import { useEffect, useState } from "react";

/**
 * A short veil while the first plates reach the GPU. It never holds the
 * page for more than two seconds; the photograph underneath is already there.
 */
export function LoadingVeil({ ready }: { ready: boolean }) {
  const [gone, setGone] = useState(false);
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    const t = window.setTimeout(() => setTimedOut(true), 2000);
    return () => window.clearTimeout(t);
  }, []);

  const done = ready || timedOut;
  useEffect(() => {
    if (!done) return;
    const t = window.setTimeout(() => setGone(true), 1200);
    return () => window.clearTimeout(t);
  }, [done]);

  if (gone) return null;
  return (
    <div className={`loading-veil ${done ? "is-done" : ""}`} aria-hidden="true">
      <span className="loading-veil__mark">සීගිරිය</span>
      <span className="loading-veil__line" />
    </div>
  );
}
