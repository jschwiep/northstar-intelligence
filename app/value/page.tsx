"use client";

import { useAppState } from "@/components/AppState";
import { TopBar } from "@/components/TopBar";
import { DeptSwitcher } from "@/components/DeptSwitcher";
import { WorkflowCard } from "@/components/value/WorkflowCard";
import { ForecastPanel } from "@/components/value/ForecastPanel";
import { ClaudeNote } from "@/components/ui";
import {
  workflowsByDept,
  departmentById,
  deptSpend,
} from "@/data/mockEnterprise";
import { usdK } from "@/lib/format";

export default function ValuePage() {
  const { dept } = useAppState();
  const department = departmentById(dept)!;
  const flows = workflowsByDept(dept);

  return (
    <>
      <TopBar breadcrumb="Organization · Analytics" title="Value" />

      <div className="mx-auto max-w-5xl px-8 py-7">
        {/* Context row */}
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="max-w-2xl text-sm leading-relaxed text-ink-soft">
              Value measurement for a line of business. Claude examines your
              existing Claude activity and connected work systems, identifies the
              workflows where it is being used, and proposes how to measure the
              value each one creates.
            </p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className="text-2xs font-medium uppercase tracking-wide text-ink-faint">
              Line of business
            </span>
            <DeptSwitcher />
          </div>
        </div>

        {/* Claude proposal framing */}
        <ClaudeNote>
          <span className="font-medium text-ink">
            Claude found {flows.length} workflows in {department.name} and
            recommends measuring value this way.
          </span>{" "}
          Review each measurement, adjust how it&apos;s computed, or connect data
          to strengthen it.
        </ClaudeNote>

        {/* Workflow cards */}
        <div className="mt-6 space-y-5">
          {flows.map((w) => (
            <WorkflowCard key={w.id} workflow={w} />
          ))}
        </div>

        {/* Cost predictability (supporting) */}
        <div className="mt-8">
          <h2 className="mb-1 text-sm font-semibold text-ink">
            Cost predictability
          </h2>
          <p className="mb-3 text-xs text-ink-faint">
            Current {department.name} Claude spend is {usdK(deptSpend(dept))}/mo
            across {flows.length} measured workflows.
          </p>
          <ForecastPanel dept={dept} />
        </div>
      </div>
    </>
  );
}
