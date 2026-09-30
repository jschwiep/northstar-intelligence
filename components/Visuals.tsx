import type { Workflow } from "@/data/mockEnterprise";
import { usdK, formatSignal, pct, isImprovement } from "@/lib/format";

function Arrow() {
  return (
    <div className="flex shrink-0 items-center px-1 text-line-strong">
      <svg viewBox="0 0 24 12" className="h-3 w-6" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M1 6h20M17 2l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

// The central mental model: AI consumption → work performed → value signal
export function ValueChain({
  w,
  outcomeAvailable = true,
}: {
  w: Workflow;
  outcomeAvailable?: boolean;
}) {
  const improved = isImprovement(w);
  return (
    <div className="flex items-stretch">
      {/* Consumption */}
      <div className="flex-1">
        <div className="text-2xs font-medium uppercase tracking-wide text-ink-faint">
          Claude consumption
        </div>
        <div className="mt-1 text-lg font-semibold text-ink">
          {usdK(w.spendMonthly)}
          <span className="ml-1 text-2xs font-normal text-ink-faint">/ mo</span>
        </div>
      </div>

      <Arrow />

      {/* Work performed */}
      <div className="flex-1">
        <div className="text-2xs font-medium uppercase tracking-wide text-ink-faint">
          Work performed
        </div>
        <div className="mt-1 text-lg font-semibold text-ink">
          {w.workUnit.count.toLocaleString("en-US")}
        </div>
        <div className="text-2xs text-ink-faint">{w.workUnit.label}</div>
      </div>

      <Arrow />

      {/* Value signal */}
      <div className="flex-[1.3]">
        <div className="text-2xs font-medium uppercase tracking-wide text-ink-faint">
          Value signal
        </div>
        {outcomeAvailable ? (
          <>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-lg font-semibold text-ink">
                {formatSignal(w, w.primarySignal.current)}
              </span>
              <span
                className={`text-xs font-semibold ${
                  improved ? "text-signal-high" : "text-signal-low"
                }`}
              >
                {pct(w.changePct)}
              </span>
            </div>
            <div className="text-2xs text-ink-faint">
              {w.primarySignal.label.toLowerCase()}
            </div>
          </>
        ) : (
          <>
            <div className="mt-1 text-lg font-semibold text-ink-faint">
              Awaiting data
            </div>
            <div className="text-2xs text-ink-faint">
              {w.primarySignal.label.toLowerCase()} — connect a source to measure
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// Understated baseline vs current comparison
export function CompareBars({ w }: { w: Workflow }) {
  const { current, baseline } = w.primarySignal;
  const max = Math.max(current, baseline);
  const improved = isImprovement(w);
  const currentColor = improved ? "bg-signal-high/70" : "bg-signal-low/70";
  return (
    <div className="space-y-2.5">
      <div>
        <div className="mb-1 flex items-center justify-between text-2xs text-ink-faint">
          <span>Historical baseline</span>
          <span className="font-medium text-ink-soft">
            {formatSignal(w, baseline)}
          </span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-line/60">
          <div
            className="h-full rounded-full bg-ink/25"
            style={{ width: `${(baseline / max) * 100}%` }}
          />
        </div>
      </div>
      <div>
        <div className="mb-1 flex items-center justify-between text-2xs text-ink-faint">
          <span>Current (with Claude)</span>
          <span className="font-medium text-ink">{formatSignal(w, current)}</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-line/60">
          <div
            className={`h-full rounded-full ${currentColor}`}
            style={{ width: `${(current / max) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}

// Data source status chips
export function SourceChips({ w }: { w: Workflow }) {
  const dot: Record<string, string> = {
    connected: "bg-signal-high",
    partial: "bg-signal-med",
    missing: "bg-signal-low",
  };
  return (
    <div className="flex flex-wrap gap-1.5">
      {w.dataSources.map((s) => (
        <span
          key={s.name}
          title={s.note}
          className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-2.5 py-1 text-2xs text-ink-soft"
        >
          <span className={`h-1.5 w-1.5 rounded-full ${dot[s.status]}`} />
          {s.name}
        </span>
      ))}
    </div>
  );
}
