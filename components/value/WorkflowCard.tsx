"use client";

import { useState } from "react";
import type { Workflow } from "@/data/mockEnterprise";
import { Card, ConfidenceBadge, StrengthTag, ClaudeMark } from "@/components/ui";
import { ValueChain, CompareBars, SourceChips } from "@/components/Visuals";
import { Drawer } from "@/components/Drawer";
import { formatSignal, pct, isImprovement } from "@/lib/format";

export function WorkflowCard({ workflow }: { workflow: Workflow }) {
  const [accepted, setAccepted] = useState(workflow.status === "accepted");
  const [editing, setEditing] = useState(false);
  const [primaryLabel, setPrimaryLabel] = useState(workflow.primarySignal.label);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const improved = isImprovement(workflow);

  return (
    <Card className="overflow-hidden">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 px-6 pt-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h3 className="text-base font-semibold text-ink">{workflow.name}</h3>
            {accepted ? (
              <span className="inline-flex items-center gap-1 rounded-full border border-line bg-surface px-2 py-0.5 text-2xs font-medium text-ink-soft">
                <svg viewBox="0 0 16 16" className="h-3 w-3 text-signal-high" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 8.5l3 3 7-7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Measurement accepted
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full border border-accent-soft bg-accent-wash px-2 py-0.5 text-2xs font-medium text-accent">
                <ClaudeMark className="h-2.5 w-2.5" />
                Proposed by Claude
              </span>
            )}
          </div>
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-ink-soft">
            {workflow.summary}
          </p>
        </div>
        <ConfidenceBadge level={workflow.confidence} />
      </div>

      {/* Primary signal + strength */}
      <div className="mt-4 px-6">
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-line bg-surface px-4 py-3">
          <div>
            <div className="text-2xs font-medium uppercase tracking-wide text-ink-faint">
              Primary value signal
            </div>
            <div className="mt-0.5 text-sm font-medium text-ink">{primaryLabel}</div>
          </div>
          <StrengthTag strength={workflow.strength} />
        </div>
      </div>

      {/* ------- ACCEPTED (State B): computed value view ------- */}
      {accepted ? (
        <>
          <div className="mt-5 border-t border-line px-6 py-5">
            <ValueChain w={workflow} />
          </div>
          <div className="flex items-center justify-between gap-4 border-t border-line bg-surface/60 px-6 py-3">
            <div className="text-xs text-ink-faint">
              {improved ? "Improvement" : "Change"} vs baseline:{" "}
              <span
                className={`font-semibold ${
                  improved ? "text-signal-high" : "text-signal-low"
                }`}
              >
                {pct(workflow.changePct)}
              </span>{" "}
              · {workflow.supportingSignals[0].label}:{" "}
              <span className="text-ink-soft">
                {workflow.supportingSignals[0].value}
              </span>
            </div>
            <button
              onClick={() => setDrawerOpen(true)}
              className="shrink-0 rounded-lg border border-line bg-panel px-3 py-1.5 text-xs font-medium text-ink transition-colors hover:bg-line/40"
            >
              How this is measured
            </button>
          </div>
        </>
      ) : (
        /* ------- PROPOSED (State A): Claude's recommendation ------- */
        <>
          <div className="mt-5 grid grid-cols-2 gap-6 border-t border-line px-6 py-5">
            <div>
              <div className="mb-2 text-2xs font-medium uppercase tracking-wide text-ink-faint">
                Claude's candidate observation
              </div>
              <CompareBars w={workflow} />
              <div className="mt-3 text-xs text-ink-faint">
                {improved ? "Directional improvement" : "Change"} of{" "}
                <span
                  className={`font-semibold ${
                    improved ? "text-signal-high" : "text-signal-low"
                  }`}
                >
                  {pct(workflow.changePct)}
                </span>{" "}
                over {workflow.workUnit.count.toLocaleString("en-US")}{" "}
                {workflow.workUnit.label.toLowerCase()}.
              </div>
            </div>
            <div>
              <div className="mb-2 text-2xs font-medium uppercase tracking-wide text-ink-faint">
                Data available
              </div>
              <SourceChips w={workflow} />
              <div className="mt-3 text-2xs font-medium uppercase tracking-wide text-ink-faint">
                Supporting signals
              </div>
              <ul className="mt-1.5 space-y-1">
                {workflow.supportingSignals.map((s) => (
                  <li key={s.label} className="text-xs text-ink-soft">
                    {s.label}: <span className="text-ink">{s.value}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Edit / alternative metric */}
          {editing && (
            <div className="border-t border-line bg-surface px-6 py-4">
              <label className="text-2xs font-medium uppercase tracking-wide text-ink-faint">
                Choose the primary metric
              </label>
              <select
                value={primaryLabel}
                onChange={(e) => setPrimaryLabel(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-line bg-panel px-3 py-2 text-sm text-ink outline-none focus:border-accent"
              >
                <option value={workflow.primarySignal.label}>
                  {workflow.primarySignal.label} (Claude's recommendation)
                </option>
                {workflow.alternativeMetrics.map((m) => (
                  <option key={m.label} value={m.label}>
                    {m.label}
                  </option>
                ))}
              </select>
              {primaryLabel !== workflow.primarySignal.label && (
                <p className="mt-2 text-2xs text-ink-faint">
                  {
                    workflow.alternativeMetrics.find((m) => m.label === primaryLabel)
                      ?.note
                  }
                </p>
              )}
            </div>
          )}

          <div className="flex items-center gap-2 border-t border-line bg-surface/60 px-6 py-3">
            <button
              onClick={() => setAccepted(true)}
              className="rounded-lg bg-ink px-3.5 py-1.5 text-xs font-medium text-canvas transition-colors hover:bg-ink/90"
            >
              Accept measurement
            </button>
            <button
              onClick={() => setEditing((v) => !v)}
              className="rounded-lg border border-line bg-panel px-3 py-1.5 text-xs font-medium text-ink transition-colors hover:bg-line/40"
            >
              {editing ? "Done" : "Edit"}
            </button>
            <button
              onClick={() => setDrawerOpen(true)}
              className="ml-auto text-xs font-medium text-ink-soft underline-offset-2 hover:underline"
            >
              See what data Claude used
            </button>
          </div>
        </>
      )}

      {/* Measurement detail drawer */}
      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        eyebrow={`${workflow.name} · measurement`}
        title="How this is measured"
      >
        <MeasurementDetail workflow={workflow} />
      </Drawer>
    </Card>
  );
}

function MeasurementDetail({ workflow }: { workflow: Workflow }) {
  const improved = isImprovement(workflow);
  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-line bg-surface p-4">
        <CompareBars w={workflow} />
        <div className="mt-3 text-xs text-ink-soft">
          Current is{" "}
          <span
            className={`font-semibold ${
              improved ? "text-signal-high" : "text-signal-low"
            }`}
          >
            {pct(workflow.changePct)}
          </span>{" "}
          vs the historical baseline. This is an observed association, not proof
          of causation.
        </div>
      </div>

      <Field label="Primary signal">
        {workflow.primarySignal.label} — currently{" "}
        {formatSignal(workflow, workflow.primarySignal.current)} vs baseline{" "}
        {formatSignal(workflow, workflow.primarySignal.baseline)}.
      </Field>

      <Field label="Source systems">
        <SourceChips w={workflow} />
      </Field>

      <Field label="Calculation">{workflow.calculation}</Field>

      <Field label="Baseline period">{workflow.baselinePeriod}</Field>

      <Field label="Why this confidence level">
        {workflow.confidenceRationale}
      </Field>

      <Field label="Limitations">
        <ul className="list-disc space-y-1 pl-4">
          {workflow.limitations.map((l) => (
            <li key={l}>{l}</li>
          ))}
        </ul>
      </Field>

      <Field label="What would improve confidence">
        <ul className="list-disc space-y-1 pl-4">
          {workflow.improveConfidence.map((l) => (
            <li key={l}>{l}</li>
          ))}
        </ul>
      </Field>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-1.5 text-2xs font-semibold uppercase tracking-[0.08em] text-ink-faint">
        {label}
      </div>
      <div className="text-sm leading-relaxed text-ink-soft">{children}</div>
    </div>
  );
}
