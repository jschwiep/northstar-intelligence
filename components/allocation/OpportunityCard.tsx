"use client";

import { useState } from "react";
import type { DeploymentOpportunity } from "@/data/mockEnterprise";
import { workflowById } from "@/data/mockEnterprise";
import { Card, ConfidenceBadge, ClaudeMark } from "@/components/ui";
import { Drawer } from "@/components/Drawer";
import { usdK } from "@/lib/format";

const kindStyle: Record<DeploymentOpportunity["kind"], string> = {
  "expand-consumption": "border-signal-high/30 bg-signal-high/10 text-signal-high",
  "expand-capability": "border-accent-soft bg-accent-wash text-accent",
  investigate: "border-signal-low/30 bg-signal-low/10 text-signal-low",
  "tune-capability": "border-line-strong bg-surface text-ink-soft",
};

function DimensionRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex-1">
      <div className="text-2xs font-semibold uppercase tracking-[0.06em] text-ink-faint">
        {label}
      </div>
      <div className="mt-1 text-xs leading-snug text-ink-soft">{value}</div>
    </div>
  );
}

export function OpportunityCard({ opp }: { opp: DeploymentOpportunity }) {
  const [open, setOpen] = useState(false);
  const wf = workflowById(opp.workflowId)!;

  return (
    <Card className="overflow-hidden">
      <div className="px-6 pt-5">
        <div className="flex items-center justify-between gap-3">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-2xs font-semibold uppercase tracking-wide ${kindStyle[opp.kind]}`}
          >
            {opp.kindLabel}
          </span>
          <ConfidenceBadge level={opp.confidence} />
        </div>

        <h3 className="mt-3 text-base font-semibold text-ink">{opp.title}</h3>
        <p className="mt-1.5 flex items-start gap-2 text-sm leading-relaxed text-ink-soft">
          <span className="mt-0.5 text-accent">
            <ClaudeMark className="h-3.5 w-3.5" />
          </span>
          <span>{opp.recommendation}</span>
        </p>
      </div>

      {/* Three dimensions of every deployment decision */}
      <div className="mt-4 flex gap-5 border-t border-line bg-surface/50 px-6 py-4">
        <DimensionRow label="Who / workflow" value={opp.dimensions.who} />
        <div className="w-px bg-line" />
        <DimensionRow label="Which capability" value={opp.dimensions.capability} />
        <div className="w-px bg-line" />
        <DimensionRow label="How much consumption" value={opp.dimensions.consumption} />
      </div>

      <div className="flex items-center justify-between gap-4 border-t border-line px-6 py-3">
        <div className="text-xs text-ink-faint">
          Current limit{" "}
          <span className="font-medium text-ink-soft">
            {usdK(wf.spendLimitMonthly)}/mo
          </span>{" "}
          · {wf.limitUtilizationPct}% utilized · spend{" "}
          <span className="font-medium text-ink-soft">{usdK(wf.spendMonthly)}/mo</span>
        </div>
        <button
          onClick={() => setOpen(true)}
          className="shrink-0 rounded-lg bg-ink px-3.5 py-1.5 text-xs font-medium text-canvas transition-colors hover:bg-ink/90"
        >
          {opp.cta}
        </button>
      </div>

      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        eyebrow={opp.kindLabel}
        title={opp.title}
        footer={
          <div className="flex items-center justify-between gap-4">
            <p className="text-2xs leading-snug text-ink-faint">
              Claude recommends a test. It does not autonomously reallocate
              budget — you remain the decision-maker.
            </p>
            <button
              onClick={() => setOpen(false)}
              className="shrink-0 rounded-lg bg-ink px-3.5 py-1.5 text-xs font-medium text-canvas transition-colors hover:bg-ink/90"
            >
              {opp.cta}
            </button>
          </div>
        }
      >
        <OpportunityDetail opp={opp} />
      </Drawer>
    </Card>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-2 text-2xs font-semibold uppercase tracking-[0.08em] text-ink-faint">
        {title}
      </div>
      {children}
    </div>
  );
}

function OpportunityDetail({ opp }: { opp: DeploymentOpportunity }) {
  const wf = workflowById(opp.workflowId)!;
  return (
    <div className="space-y-6">
      <p className="text-sm leading-relaxed text-ink-soft">{opp.recommendation}</p>

      <Section title="Evidence">
        <ul className="space-y-1.5">
          {opp.evidence.map((e) => (
            <li key={e} className="flex gap-2 text-sm leading-relaxed text-ink-soft">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-ink-faint" />
              <span>{e}</span>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Proposed deployment change">
        <div className="space-y-3 rounded-xl border border-line bg-surface p-4">
          <ChangeRow label="Affected workflow / users" value={opp.proposedChange.affected} />
          <ChangeRow label="Capability change" value={opp.proposedChange.capabilityChange} />
          <ChangeRow label="Spend / headroom change" value={opp.proposedChange.spendChange} />
        </div>
      </Section>

      <Section title="What we'll learn">
        <div className="space-y-3">
          <ChangeRow label="Metric to monitor" value={opp.whatWeLearn.metric} />
          <ChangeRow label="Duration / sample" value={opp.whatWeLearn.duration} />
          <div className="grid gap-2 rounded-xl border border-line bg-surface p-4">
            <Outcome color="text-signal-high" label="Expand if" value={opp.whatWeLearn.expand} />
            <Outcome color="text-ink-soft" label="Maintain if" value={opp.whatWeLearn.maintain} />
            <Outcome color="text-signal-low" label="Revert if" value={opp.whatWeLearn.revert} />
          </div>
        </div>
      </Section>

      <Section title="Underlying measurement">
        <p className="text-xs leading-relaxed text-ink-faint">
          This opportunity is derived from the {wf.name} value signal in Value
          measurement: {wf.primarySignal.label.toLowerCase()}, currently at{" "}
          {wf.confidence.toLowerCase()} confidence.
        </p>
      </Section>
    </div>
  );
}

function ChangeRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-2xs font-medium uppercase tracking-wide text-ink-faint">
        {label}
      </div>
      <div className="mt-0.5 text-sm leading-relaxed text-ink-soft">{value}</div>
    </div>
  );
}

function Outcome({
  color,
  label,
  value,
}: {
  color: string;
  label: string;
  value: string;
}) {
  return (
    <div className="flex gap-2 text-sm leading-relaxed">
      <span className={`shrink-0 font-semibold ${color}`}>{label}</span>
      <span className="text-ink-soft">{value}</span>
    </div>
  );
}
