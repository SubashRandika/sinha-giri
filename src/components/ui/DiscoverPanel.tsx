import type { ReactNode } from "react";

/**
 * Secondary historical detail, closed by default so it never interrupts a
 * sequence. Native <details> keeps it keyboard and screen-reader friendly.
 */
export function DiscoverPanel({ label, children, className = "" }: { label: string; children: ReactNode; className?: string }) {
  return (
    <details className={`discover ${className}`}>
      <summary>
        <span>{label}</span>
        <span className="discover__arrow" aria-hidden="true">
          →
        </span>
      </summary>
      <div className="discover__body">{children}</div>
    </details>
  );
}
