"use client";

import { useState } from "react";
import { useAppState } from "@/components/AppState";
import {
  opportunities,
  workflowById,
  totalMonthlySpend,
} from "@/data/mockEnterprise";
import { usdK, usdKRange } from "@/lib/format";

export function BudgetDraftPanel() {
  const {
    draftItems,
    draftTitle,
    setDraftTitle,
    draftNotes,
    setDraftNotes,
    toggleDraft,
  } = useAppState();

  const [open, setOpen] = useState(true);
  const [copied, setCopied] = useState(false);

  const items = draftItems
    .map((d) => ({ draft: d, opp: opportunities.find((o) => o.id === d.oppId)! }))
    .filter((x) => x.opp);

  const deltaLow = items.reduce((s, x) => s + x.opp.spendDeltaLow, 0);
  const deltaHigh = items.reduce((s, x) => s + x.opp.spendDeltaHigh, 0);
  const projLow = totalMonthlySpend + deltaLow;
  const projHigh = totalMonthlySpend + deltaHigh;

  function buildMarkdown(): string {
    const lines: string[] = [];
    lines.push(`# ${draftTitle}`, "");
    lines.push(
      `**Directional envelope:** current ${usdK(totalMonthlySpend)}/mo → ~${usdKRange(
        projLow,
        projHigh
      )}/mo if these items proceed (non-binding).`,
      ""
    );
    lines.push(`## Items (${items.length})`, "");
    for (const { opp } of items) {
      const wf = workflowById(opp.workflowId)!;
      lines.push(`### ${opp.title}`);
      lines.push(`- Change: ${opp.draftChangeLabel}`);
      lines.push(`- Directional spend: +${usdKRange(opp.spendDeltaLow, opp.spendDeltaHigh)}/mo`);
      lines.push(`- Value signal: ${wf.primarySignal.label} (${opp.confidence} confidence)`);
      lines.push(`- Monitor: ${opp.whatWeLearn.metric}`);
      lines.push("");
    }
    if (draftNotes.trim()) {
      lines.push(`## Notes`, "", draftNotes.trim(), "");
    }
    lines.push(
      "_This draft is one input to the broader tooling / headcount tradeoff. It is not an applied budget change._"
    );
    return lines.join("\n");
  }

  function copy() {
    const md = buildMarkdown();
    navigator.clipboard?.writeText(md).then(
      () => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
      },
      () => {}
    );
  }

  return (
    <div className="rounded-xl border border-line bg-panel shadow-card">
      {/* Header */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-4 px-6 py-4 text-left"
      >
        <div className="flex items-center gap-3">
          <svg
            viewBox="0 0 20 20"
            className={`h-4 w-4 text-ink-faint transition-transform ${open ? "rotate-90" : ""}`}
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          >
            <path d="M7 4l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <div>
            <div className="text-sm font-semibold text-ink">Budget draft</div>
            <div className="text-2xs text-ink-faint">
              A working memo to take into planning — nothing here is applied.
            </div>
          </div>
        </div>
        <div className="flex items-center gap-5">
          <div className="text-right">
            <div className="text-2xs font-medium uppercase tracking-wide text-ink-faint">
              Directional envelope
            </div>
            <div className="text-sm font-semibold text-ink">
              {items.length === 0 ? (
                <span className="text-ink-faint">{usdK(totalMonthlySpend)}/mo (no items)</span>
              ) : (
                <>
                  {usdK(totalMonthlySpend)} → ~{usdKRange(projLow, projHigh)}/mo
                </>
              )}
            </div>
          </div>
          <span className="rounded-full bg-ink/[0.06] px-2.5 py-1 text-2xs font-semibold text-ink-soft">
            {items.length} item{items.length === 1 ? "" : "s"}
          </span>
        </div>
      </button>

      {open && (
        <div className="border-t border-line px-6 py-5">
          {items.length === 0 ? (
            <p className="text-sm leading-relaxed text-ink-faint">
              Move opportunities here to assemble a budget draft you can annotate
              and export. The directional envelope updates as you add items —
              it&apos;s a planning artifact, not a committed change.
            </p>
          ) : (
            <>
              {/* Editable title */}
              <input
                value={draftTitle}
                onChange={(e) => setDraftTitle(e.target.value)}
                className="w-full rounded-lg border border-transparent bg-transparent px-1 py-1 text-base font-semibold text-ink outline-none hover:border-line focus:border-accent"
              />

              {/* Items */}
              <div className="mt-3 space-y-3">
                {items.map(({ opp }) => {
                  const wf = workflowById(opp.workflowId)!;
                  return (
                    <div key={opp.id} className="flex items-start justify-between gap-3 rounded-lg border border-line bg-surface p-4">
                      <div>
                        <div className="text-sm font-medium text-ink">{opp.title}</div>
                        <div className="mt-0.5 text-xs text-ink-soft">
                          {opp.draftChangeLabel} · directional +
                          {usdKRange(opp.spendDeltaLow, opp.spendDeltaHigh)}/mo ·{" "}
                          {opp.confidence} confidence
                        </div>
                        <div className="mt-1 text-2xs text-ink-faint">
                          Monitors {wf.primarySignal.label.toLowerCase()}
                        </div>
                      </div>
                      <button
                        onClick={() => toggleDraft(opp.id)}
                        className="shrink-0 rounded-md p-1 text-ink-faint transition-colors hover:bg-line/50 hover:text-ink"
                        aria-label="Remove from draft"
                      >
                        <svg viewBox="0 0 20 20" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.8">
                          <path d="M5 5l10 10M15 5L5 15" strokeLinecap="round" />
                        </svg>
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Overall notes */}
              <div className="mt-4">
                <div className="mb-1.5 text-2xs font-semibold uppercase tracking-[0.08em] text-ink-faint">
                  Notes
                </div>
                <textarea
                  value={draftNotes}
                  onChange={(e) => setDraftNotes(e.target.value)}
                  rows={2}
                  placeholder="Context for the planning conversation — e.g. how this weighs against other tooling and headcount."
                  className="w-full resize-none rounded-lg border border-line bg-panel px-3 py-2 text-sm text-ink outline-none placeholder:text-ink-faint focus:border-accent"
                />
              </div>

              <div className="mt-4 flex items-center justify-between gap-4">
                <p className="text-2xs leading-snug text-ink-faint">
                  One input to your broader tooling / headcount tradeoff — not an
                  applied budget change.
                </p>
                <button
                  onClick={copy}
                  className="shrink-0 rounded-lg bg-ink px-3.5 py-1.5 text-xs font-medium text-canvas transition-colors hover:bg-ink/90"
                >
                  {copied ? "Copied to clipboard" : "Export draft"}
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
