import type { Confidence, Workflow } from "@/data/mockEnterprise";

export function usd(n: number): string {
  return `$${Math.round(n).toLocaleString("en-US")}`;
}

// Compact $K formatting used across cards: 18400 -> "$18.4K"
export function usdK(n: number): string {
  if (Math.abs(n) >= 1000) {
    const k = n / 1000;
    // one decimal, but drop trailing .0
    const s = k.toFixed(1).replace(/\.0$/, "");
    return `$${s}K`;
  }
  return usd(n);
}

export function usdKRange(low: number, high: number): string {
  return `${usdK(low)}–${usdK(high)}`;
}

export function pct(n: number): string {
  const sign = n > 0 ? "+" : "";
  return `${sign}${n}%`;
}

// Format a signal value according to its display format.
export function formatSignal(w: Workflow, value: number): string {
  switch (w.primarySignal.displayFormat) {
    case "days":
      return `${value} days`;
    case "minutes":
      return `${value} min`;
    case "hours":
      return `${value} h`;
    case "percent":
      return `${value}%`;
    case "count":
      return `${value.toLocaleString("en-US")}`;
    default:
      return `${value}`;
  }
}

export const confidenceColor: Record<Confidence, string> = {
  High: "text-signal-high",
  Medium: "text-signal-med",
  Low: "text-signal-low",
};

export const confidenceDot: Record<Confidence, string> = {
  High: "bg-signal-high",
  Medium: "bg-signal-med",
  Low: "bg-signal-low",
};

// Is a change an improvement given the metric's better-direction?
export function isImprovement(w: Workflow): boolean {
  if (w.primarySignal.betterDirection === "lower") return w.changePct < 0;
  return w.changePct > 0;
}
