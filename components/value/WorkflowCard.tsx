"use client";

import { useMemo, useState } from "react";
import type { Workflow, MeasurementAdjustment, Confidence } from "@/data/mockEnterprise";
import { adjustmentsFor, leversFor } from "@/data/mockEnterprise";
import { useAppState } from "@/components/AppState";
import { Card, ConfidenceBadge, StrengthTag, ClaudeMark } from "@/components/ui";
import { ValueChain, CompareBars, SourceChips } from "@/components/Visuals";
import { Drawer } from "@/components/Drawer";
import { AskBox } from "@/components/AskBox";
import { answerMeasurementQuestion } from "@/lib/answers";
import { askApi } from "@/lib/askClient";
import { formatSignal, pct, isImprovement } from "@/lib/format";

const rank: Record<Confidence, number> = { Low: 0, Medium: 1, High: 2 };

// Enterprise connectors available through Claude (mock list for the picker).
const CONNECTORS = [
  "GitHub",
  "GitLab",
  "Linear",
  "Jira",
  "Salesforce",
  "HubSpot",
  "PagerDuty",
  "Snowflake",
  "Google Drive",
  "Confluence",
  "Notion",
  "Zendesk",
];

// Light, demo-safe intent matching — no real model call.
function matchAdjustment(
  input: string,
  options: MeasurementAdjustment[]
): MeasurementAdjustment | null {
  const text = input.toLowerCase();
  let best: { adj: MeasurementAdjustment; score: number } | null = null;
  for (const adj of options) {
    let score = 0;
    for (const k of adj.keywords) if (text.includes(k)) score += 1;
    if (score > 0 && (!best || score > best.score)) best = { adj, score };
  }
  return best?.adj ?? null;
}

export function WorkflowCard({ workflow }: { workflow: Workflow }) {
  const { notesForWorkflow } = useAppState();
  const [accepted, setAccepted] = useState(workflow.status === "accepted");
  const [adjustOpen, setAdjustOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Live measurement state driven by Connect + Adjust
  const [connected, setConnected] = useState<string[]>([]);
  const [applied, setApplied] = useState<MeasurementAdjustment | null>(null);

  const levers = leversFor(workflow.id);
  const execNotes = notesForWorkflow(workflow.id);

  const leverConfidence = levers
    .filter((l) => connected.includes(l.id))
    .reduce<Confidence>(
      (acc, l) => (rank[l.raisesTo] > rank[acc] ? l.raisesTo : acc),
      workflow.confidence
    );

  const view: Workflow = useMemo(() => {
    if (applied?.result) {
      const r = applied.result;
      return {
        ...workflow,
        confidence: r.confidence,
        strength: r.strength,
        changePct: r.changePct,
        primarySignal: { ...workflow.primarySignal, current: r.current, baseline: r.baseline },
      };
    }
    return { ...workflow, confidence: leverConfidence };
  }, [applied, leverConfidence, workflow]);

  const improved = isImprovement(view);
  const openLevers = levers.filter((l) => !connected.includes(l.id));

  function connectLever(id: string) {
    setConnected((c) => (c.includes(id) ? c : [...c, id]));
  }

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
                Tracking · recomputed daily
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
        <ConfidenceBadge level={view.confidence} />
      </div>

      {/* Exec note callout (arrives from the allocation view) */}
      {execNotes.length > 0 && (
        <div className="mx-6 mt-3 rounded-lg border border-accent-soft bg-accent-wash px-3 py-2">
          {execNotes.map((n) => (
            <p key={n.id} className="text-xs leading-relaxed text-ink-soft">
              <span className="font-medium text-ink">{n.from}:</span> “{n.text}”
            </p>
          ))}
        </div>
      )}

      {/* Primary signal + strength */}
      <div className="mt-4 px-6">
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-line bg-surface px-4 py-3">
          <div>
            <div className="text-2xs font-medium uppercase tracking-wide text-ink-faint">
              Primary value signal
            </div>
            <div className="mt-0.5 text-sm font-medium text-ink">
              {workflow.primarySignal.label}
            </div>
          </div>
          <StrengthTag strength={view.strength} />
        </div>
      </div>

      {/* Body: computed value (accepted) or Claude's candidate observation */}
      {accepted ? (
        <div className="mt-5 border-t border-line px-6 py-5">
          <ValueChain w={view} />
        </div>
      ) : (
        <div className="mt-5 grid grid-cols-2 gap-6 border-t border-line px-6 py-5">
          <div>
            <div className="mb-2 text-2xs font-medium uppercase tracking-wide text-ink-faint">
              Claude&apos;s candidate observation
            </div>
            <CompareBars w={view} />
            <div className="mt-3 text-xs text-ink-faint">
              {improved ? "Directional improvement" : "Change"} of{" "}
              <span className={`font-semibold ${improved ? "text-signal-high" : "text-signal-low"}`}>
                {pct(view.changePct)}
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
      )}

      {/* Shared actions — consistent across every card */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line bg-surface/60 px-6 py-3">
        <div className="text-xs text-ink-faint">
          {improved ? "Improvement" : "Change"} vs baseline:{" "}
          <span className={`font-semibold ${improved ? "text-signal-high" : "text-signal-low"}`}>
            {pct(view.changePct)}
          </span>{" "}
          · {workflow.supportingSignals[0].label}:{" "}
          <span className="text-ink-soft">{workflow.supportingSignals[0].value}</span>
        </div>
        <div className="flex items-center gap-2">
          {accepted ? (
            <span className="inline-flex items-center gap-1 rounded-lg border border-line bg-panel px-3 py-1.5 text-xs font-medium text-ink-faint">
              <svg viewBox="0 0 16 16" className="h-3 w-3 text-signal-high" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 8.5l3 3 7-7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Accepted
            </span>
          ) : (
            <button
              onClick={() => setAccepted(true)}
              className="rounded-lg bg-ink px-3.5 py-1.5 text-xs font-medium text-canvas transition-colors hover:bg-ink/90"
            >
              Accept measurement
            </button>
          )}
          <button
            onClick={() => setAdjustOpen((v) => !v)}
            className="rounded-lg border border-line bg-panel px-3 py-1.5 text-xs font-medium text-ink transition-colors hover:bg-line/40"
          >
            Adjust measurement
          </button>
          <button
            onClick={() => setDrawerOpen(true)}
            className="rounded-lg border border-line bg-panel px-3 py-1.5 text-xs font-medium text-ink transition-colors hover:bg-line/40"
          >
            How this is measured
          </button>
        </div>
      </div>

      {/* Slim confidence hint → opens Adjust (where data can be connected) */}
      {openLevers.length > 0 && !adjustOpen && (
        <button
          onClick={() => setAdjustOpen(true)}
          className="flex w-full items-center gap-1.5 border-t border-line bg-panel px-6 py-2 text-left text-2xs text-ink-faint transition-colors hover:bg-surface"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-signal-med" />
          Confidence is <span className="font-medium text-ink-soft">{view.confidence}</span> —
          connect {openLevers.map((l) => l.sourceName).join(", ")} to reach{" "}
          {openLevers[0].raisesTo}.
        </button>
      )}
      {levers.length > 0 && openLevers.length === 0 && (
        <div className="flex items-center gap-1.5 border-t border-line px-6 py-2 text-2xs text-signal-high">
          <svg viewBox="0 0 16 16" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 8.5l3 3 7-7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {levers.map((l) => l.sourceName).join(", ")} connected — confidence raised to {view.confidence}.
        </div>
      )}

      {/* Adjust panel (natural language + add data) */}
      {adjustOpen && (
        <AdjustPanel
          workflow={workflow}
          connected={connected}
          onApply={(adj) => setApplied(adj)}
          onRevert={() => setApplied(null)}
          onConnect={connectLever}
          applied={applied}
          onAcceptRevised={() => {
            setAccepted(true);
            setAdjustOpen(false);
          }}
        />
      )}

      {/* Measurement detail drawer */}
      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        eyebrow={`${workflow.name} · measurement`}
        title="How this is measured"
      >
        <MeasurementDetail workflow={view} baseWorkflow={workflow} />
      </Drawer>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Adjust panel — conversational recompute + add data
// ---------------------------------------------------------------------------
function AdjustPanel({
  workflow,
  connected,
  applied,
  onApply,
  onRevert,
  onConnect,
  onAcceptRevised,
}: {
  workflow: Workflow;
  connected: string[];
  applied: MeasurementAdjustment | null;
  onApply: (adj: MeasurementAdjustment) => void;
  onRevert: () => void;
  onConnect: (leverId: string) => void;
  onAcceptRevised: () => void;
}) {
  const adjustments = adjustmentsFor(workflow.id);
  const levers = leversFor(workflow.id);
  const openLevers = levers.filter((l) => !connected.includes(l.id));

  const [input, setInput] = useState("");
  const [response, setResponse] = useState<
    | { type: "applied"; adj: MeasurementAdjustment }
    | { type: "blocked"; adj: MeasurementAdjustment }
    | null
  >(applied ? { type: "applied", adj: applied } : null);

  const [sourceAck, setSourceAck] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);

  function applyAdjustment(adj: MeasurementAdjustment) {
    if (adj.requiresLeverId && !connected.includes(adj.requiresLeverId)) {
      setResponse({ type: "blocked", adj });
      return;
    }
    onApply(adj);
    setResponse({ type: "applied", adj });
  }

  // One input handles both intents: an instruction Claude can act on
  // (recompute the signal), or a data source to add.
  function submit(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;
    const adj = matchAdjustment(text, adjustments);
    if (adj) {
      applyAdjustment(adj);
      setSourceAck(null);
    } else {
      setSourceAck(
        `Noted — I'll flag “${text}” for your workspace admin to connect. Once it's in, I can factor it into this measurement.`
      );
      setResponse(null);
    }
    setInput("");
  }

  function connectConnector(name: string) {
    setSourceAck(
      `Connecting ${name} via Claude connectors — once authorized, I can factor its signals into this measurement.`
    );
    setPickerOpen(false);
  }

  return (
    <div className="border-t border-line bg-surface px-6 py-4">
      <div className="flex items-center gap-2">
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent/10 text-accent">
          <ClaudeMark className="h-3 w-3" />
        </span>
        <span className="text-xs font-medium text-ink">Adjust the measurement</span>
        <span className="text-2xs text-ink-faint">
          Tell Claude how to change it, or connect data to strengthen it.
        </span>
      </div>

      {/* Suggested instructions */}
      <div className="mt-2.5 flex flex-wrap gap-1.5">
        {adjustments.map((a) => (
          <button
            key={a.id}
            onClick={() => {
              applyAdjustment(a);
              setSourceAck(null);
            }}
            className="rounded-full border border-line bg-panel px-2.5 py-1 text-2xs font-medium text-ink-soft transition-colors hover:border-accent-soft hover:text-ink"
          >
            {a.instruction}
          </button>
        ))}
      </div>

      {/* One input + connectors button */}
      <form onSubmit={submit} className="mt-2.5 flex flex-wrap items-center gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Tell Claude how to change this, or manually give Claude data…"
          className="min-w-0 flex-1 rounded-lg border border-line bg-panel px-3 py-2 text-sm text-ink outline-none placeholder:text-ink-faint focus:border-accent"
        />
        <button
          type="button"
          onClick={() => setPickerOpen((v) => !v)}
          className="flex shrink-0 items-center gap-1.5 rounded-lg border border-line bg-panel px-3 py-2 text-xs font-medium text-ink transition-colors hover:bg-line/40"
        >
          <ClaudeMark className="h-3 w-3 text-accent" />
          Connect via Claude connectors
        </button>
      </form>

      {/* Connector picker */}
      {pickerOpen && (
        <div className="mt-2.5 rounded-lg border border-line bg-panel p-3">
          <div className="mb-2 text-2xs font-medium uppercase tracking-wide text-ink-faint">
            Choose a connector
          </div>
          <div className="flex flex-wrap gap-1.5">
            {CONNECTORS.map((c) => (
              <button
                key={c}
                onClick={() => connectConnector(c)}
                className="rounded-lg border border-line bg-surface px-2.5 py-1.5 text-xs font-medium text-ink-soft transition-colors hover:border-accent-soft hover:text-ink"
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Recommended sources to connect (raise confidence) */}
      {openLevers.length > 0 && (
        <div className="mt-3 space-y-2">
          {openLevers.map((l) => (
            <div key={l.id} className="flex items-center justify-between gap-3">
              <div className="text-xs text-ink-soft">
                <span className="text-ink-faint">Recommended → {l.raisesTo}:</span>{" "}
                connect <span className="font-medium text-ink">{l.sourceName}</span> — {l.description}
              </div>
              <button
                onClick={() => onConnect(l.id)}
                className="shrink-0 rounded-lg border border-line bg-panel px-3 py-1.5 text-xs font-medium text-ink transition-colors hover:bg-line/40"
              >
                Connect
              </button>
            </div>
          ))}
        </div>
      )}
      {levers.length > 0 && openLevers.length === 0 && (
        <p className="mt-3 text-2xs text-signal-high">
          {levers.map((l) => l.sourceName).join(", ")} connected — confidence raised.
        </p>
      )}

      {/* Response */}
      {response?.type === "blocked" && (
        <div className="mt-3 rounded-lg border border-signal-low/30 bg-signal-low/[0.06] px-3.5 py-3">
          <p className="text-xs leading-relaxed text-ink-soft">{response.adj.blockedResponse}</p>
          {(() => {
            const lever = levers.find((l) => l.id === response.adj.requiresLeverId);
            if (!lever) return null;
            return (
              <button
                onClick={() => {
                  onConnect(lever.id);
                  onApply(response.adj);
                  setResponse({ type: "applied", adj: response.adj });
                }}
                className="mt-2.5 rounded-lg bg-ink px-3 py-1.5 text-xs font-medium text-canvas transition-colors hover:bg-ink/90"
              >
                Connect {lever.sourceName}
              </button>
            );
          })()}
        </div>
      )}

      {response?.type === "applied" && response.adj.result && (
        <div className="mt-3 rounded-lg border border-accent-soft bg-panel px-3.5 py-3">
          <div className="flex items-center gap-2 text-xs font-medium text-ink">
            <ClaudeMark className="h-3 w-3 text-accent" />
            Recomputed — {response.adj.instruction.toLowerCase()}
          </div>
          <div className="mt-2 flex items-baseline gap-2 text-sm">
            <span className="font-semibold text-ink">
              {formatSignal(workflow, response.adj.result.current)}
            </span>
            <span className="text-2xs text-ink-faint">
              vs {formatSignal(workflow, response.adj.result.baseline)} baseline
            </span>
            <span
              className={`text-xs font-semibold ${
                (workflow.primarySignal.betterDirection === "lower"
                  ? response.adj.result.changePct < 0
                  : response.adj.result.changePct > 0)
                  ? "text-signal-high"
                  : "text-signal-low"
              }`}
            >
              {pct(response.adj.result.changePct)}
            </span>
            <span className="text-2xs text-ink-faint">
              · confidence {response.adj.result.confidence}
            </span>
          </div>
          <p className="mt-2 text-xs leading-relaxed text-ink-soft">
            {response.adj.result.explanation}
          </p>
          <div className="mt-3 flex items-center gap-2">
            <button
              onClick={onAcceptRevised}
              className="rounded-lg bg-ink px-3 py-1.5 text-xs font-medium text-canvas transition-colors hover:bg-ink/90"
            >
              Accept revised measurement
            </button>
            <button
              onClick={() => {
                onRevert();
                setResponse(null);
                setInput("");
              }}
              className="rounded-lg border border-line bg-panel px-3 py-1.5 text-xs font-medium text-ink transition-colors hover:bg-line/40"
            >
              Revert
            </button>
          </div>
        </div>
      )}

      {/* Connect / data-offer acknowledgement */}
      {sourceAck && (
        <p className="mt-3 flex items-start gap-2 text-xs leading-relaxed text-ink-soft">
          <ClaudeMark className="mt-0.5 h-3 w-3 shrink-0 text-accent" />
          {sourceAck}
        </p>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
function MeasurementDetail({
  workflow,
  baseWorkflow,
}: {
  workflow: Workflow;
  baseWorkflow: Workflow;
}) {
  const improved = isImprovement(workflow);
  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-line bg-surface p-4">
        <CompareBars w={workflow} />
        <div className="mt-3 text-xs text-ink-soft">
          Current is{" "}
          <span className={`font-semibold ${improved ? "text-signal-high" : "text-signal-low"}`}>
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
        <SourceChips w={baseWorkflow} />
      </Field>

      <Field label="Calculation">{baseWorkflow.calculation}</Field>

      <Field label="Baseline period">{baseWorkflow.baselinePeriod}</Field>

      <Field label="Why this confidence level">{baseWorkflow.confidenceRationale}</Field>

      <Field label="Limitations">
        <ul className="list-disc space-y-1 pl-4">
          {baseWorkflow.limitations.map((l) => (
            <li key={l}>{l}</li>
          ))}
        </ul>
      </Field>

      <Field label="What would improve confidence">
        <ul className="list-disc space-y-1 pl-4">
          {baseWorkflow.improveConfidence.map((l) => (
            <li key={l}>{l}</li>
          ))}
        </ul>
      </Field>

      {/* Ask about this measurement */}
      <div className="border-t border-line pt-5">
        <div className="mb-2 flex items-center gap-2">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent/10 text-accent">
            <ClaudeMark className="h-3 w-3" />
          </span>
          <span className="text-2xs font-semibold uppercase tracking-[0.08em] text-ink-faint">
            Ask about this measurement
          </span>
        </div>
        <AskBox
          suggestions={[
            "Why this confidence level?",
            "Is this causal?",
            "What would make it stronger?",
          ]}
          placeholder="Ask about the calculation, baseline, or limitations…"
          onAsk={async (q) => {
            try {
              return await askApi("measurement", baseWorkflow.id, q);
            } catch {
              return answerMeasurementQuestion(baseWorkflow, q);
            }
          }}
        />
      </div>
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
