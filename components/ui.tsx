import type { Confidence, SignalStrength } from "@/data/mockEnterprise";
import { confidenceDot } from "@/lib/format";
import { ReactNode } from "react";

export function ConfidenceBadge({ level }: { level: Confidence }) {
  const label =
    level === "High"
      ? "High confidence"
      : level === "Medium"
      ? "Medium confidence"
      : "Low confidence";
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-2.5 py-1 text-2xs font-medium text-ink-soft">
      <span className={`h-1.5 w-1.5 rounded-full ${confidenceDot[level]}`} />
      {label}
    </span>
  );
}

const strengthStyle: Record<SignalStrength, string> = {
  "Strong signal": "text-signal-high",
  Directional: "text-signal-med",
  "Observed association": "text-ink-soft",
  "More data needed": "text-signal-low",
};

export function StrengthTag({ strength }: { strength: SignalStrength }) {
  return (
    <span className={`text-2xs font-medium uppercase tracking-wide ${strengthStyle[strength]}`}>
      {strength}
    </span>
  );
}

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-xl border border-line bg-panel shadow-card ${className}`}
    >
      {children}
    </div>
  );
}

export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <div className="text-2xs font-semibold uppercase tracking-[0.08em] text-ink-faint">
      {children}
    </div>
  );
}

// Small inline Claude-style "sparkle" mark used where Claude speaks.
export function ClaudeMark({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={className}
      fill="currentColor"
    >
      <path d="M12 2.2c.35 2.9 1.2 4.9 2.6 6.2 1.4 1.4 3.4 2.25 6.2 2.6v2c-2.8.35-4.8 1.2-6.2 2.6-1.4 1.35-2.25 3.35-2.6 6.2h-2c-.35-2.85-1.2-4.85-2.6-6.2C6 14.2 4 13.35 1.2 13v-2c2.8-.35 4.8-1.2 6.2-2.6C8.8 7.1 9.65 5.1 10 2.2h2z" />
    </svg>
  );
}

// A pill that introduces Claude-authored guidance.
export function ClaudeNote({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-accent-soft bg-accent-wash px-4 py-3">
      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent/10 text-accent">
        <ClaudeMark className="h-3.5 w-3.5" />
      </span>
      <div className="text-sm leading-relaxed text-ink-soft">{children}</div>
    </div>
  );
}

// A labelled value cell used in overview strips.
export function Metric({
  label,
  value,
  sub,
}: {
  label: string;
  value: ReactNode;
  sub?: ReactNode;
}) {
  return (
    <div>
      <div className="text-2xs font-medium uppercase tracking-wide text-ink-faint">
        {label}
      </div>
      <div className="mt-1 text-xl font-semibold text-ink">{value}</div>
      {sub && <div className="mt-0.5 text-xs text-ink-faint">{sub}</div>}
    </div>
  );
}
