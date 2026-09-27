"use client";

import Link from "next/link";
import { useAppState } from "@/components/AppState";
import { TopBar } from "@/components/TopBar";
import { OpportunityCard } from "@/components/allocation/OpportunityCard";
import { Card, Metric, ClaudeNote } from "@/components/ui";
import {
  opportunities,
  departments,
  deptSpend,
  totalMonthlySpend,
  credibleSpendPct,
  highOrMediumWorkflowCount,
  lowConfidenceWorkflowCount,
  companyForecast,
  workflows,
} from "@/data/mockEnterprise";
import { usdK, usdKRange } from "@/lib/format";

export default function AllocationPage() {
  const { role } = useAppState();

  if (role !== "exec") {
    return (
      <>
        <TopBar breadcrumb="Organization · Analytics" title="Intelligence allocation" />
        <div className="mx-auto max-w-2xl px-8 py-20 text-center">
          <Card className="p-10">
            <h2 className="text-base font-semibold text-ink">
              Executive / Admin view
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-ink-soft">
              Intelligence allocation compares deployment across all lines of
              business, so it is available to enterprise administrators. Switch to
              the Executive / Admin view using the control in the top bar.
            </p>
            <Link
              href="/value"
              className="mt-5 inline-block rounded-lg border border-line bg-surface px-4 py-2 text-sm font-medium text-ink transition-colors hover:bg-line/40"
            >
              Back to Value
            </Link>
          </Card>
        </div>
      </>
    );
  }

  return (
    <>
      <TopBar
        breadcrumb="Organization · Analytics"
        title="Intelligence allocation"
      />

      <div className="mx-auto max-w-5xl px-8 py-7">
        <p className="max-w-3xl text-sm leading-relaxed text-ink-soft">
          Measurement is not the end product. Given what we now know about the
          value each workflow creates, this view helps decide where and how to
          deploy more — or less — AI. Every opportunity spans three dimensions:{" "}
          <span className="font-medium text-ink">who / which workflow</span>,{" "}
          <span className="font-medium text-ink">which capability</span>, and{" "}
          <span className="font-medium text-ink">how much consumption</span>.
        </p>

        {/* Restrained overview strip */}
        <Card className="mt-6 p-6">
          <div className="grid grid-cols-4 gap-6">
            <Metric
              label="Monthly Claude spend"
              value={usdK(totalMonthlySpend)}
              sub={`${departments
                .map((d) => `${d.name.split(" ")[0]} ${usdK(deptSpend(d.id))}`)
                .join(" · ")}`}
            />
            <Metric
              label="Forecast next month"
              value={usdKRange(companyForecast.low, companyForecast.high)}
              sub="modeled from planned work"
            />
            <Metric
              label="Spend with credible value signal"
              value={`${credibleSpendPct}%`}
              sub="high or medium confidence"
            />
            <Metric
              label="Measured workflows"
              value={`${highOrMediumWorkflowCount} of ${workflows.length}`}
              sub={`${lowConfidenceWorkflowCount} needs better measurement`}
            />
          </div>
        </Card>

        <ClaudeNote>
          <span className="font-medium text-ink">
            Claude surfaced {opportunities.length} evidence-backed deployment
            opportunities.
          </span>{" "}
          These are not a ranking of departments by ROI. Each is a specific,
          reversible test — expand consumption where the signal is strong,
          expand capability where the workflow is ready, and hold where
          measurement is not yet credible.
        </ClaudeNote>

        {/* Deployment opportunities */}
        <div className="mt-6">
          <h2 className="mb-3 text-sm font-semibold text-ink">
            Deployment opportunities
          </h2>
          <div className="space-y-5">
            {opportunities.map((opp) => (
              <OpportunityCard key={opp.id} opp={opp} />
            ))}
          </div>
        </div>

        <p className="mt-8 text-center text-xs leading-relaxed text-ink-faint">
          Claude is becoming a production input for knowledge work. This surface
          helps enterprises allocate it deliberately — the right capability, to
          the right workflow, at the right level of consumption — while keeping
          the human as the decision-maker.
        </p>
      </div>
    </>
  );
}
