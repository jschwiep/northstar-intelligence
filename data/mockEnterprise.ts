// ---------------------------------------------------------------------------
// Northstar — mock Claude Enterprise dataset
// ---------------------------------------------------------------------------
// One coherent dataset powers both experiences:
//   1. Value measurement  (line-of-business view)
//   2. Intelligence allocation (executive view)
//
// The executive recommendations in Experience 2 are derived from the workflow
// measurements defined here. Edit numbers in this file to reshape the demo —
// everything downstream reads from these objects.
// ---------------------------------------------------------------------------

export type Confidence = "High" | "Medium" | "Low";

export type SignalStrength =
  | "Strong signal"
  | "Directional"
  | "Observed association"
  | "More data needed";

export type DepartmentId = "engineering" | "sales-marketing";

export type Role = "lob" | "exec";

export interface DataSource {
  name: string;
  status: "connected" | "partial" | "missing";
  note?: string;
}

export interface AlternativeMetric {
  label: string;
  note: string;
}

// Deployment has three dimensions. "Capability" is NOT product surface
// (Claude Code vs chat vs Cowork) — it is the shape of intelligence applied.
export interface CapabilityConfig {
  reasoning: string; // e.g. "Standard effort"
  autonomy: string; // e.g. "Assistive (human in the loop)"
  toolAccess: string[]; // tools / actions Claude can take
  enterpriseContext: string[]; // context sources Claude can read
  headroomNote: string; // consumption headroom posture
}

export interface Workflow {
  id: string;
  department: DepartmentId;
  name: string;
  // Setup state — one workflow ships already accepted so the demo can proceed.
  status: "accepted" | "proposed";
  summary: string;

  // Primary value signal ---------------------------------------------------
  primarySignal: {
    label: string;
    unit: string;
    current: number;
    baseline: number;
    // lower is better for time metrics; higher is better for output metrics
    betterDirection: "lower" | "higher";
    displayFormat: "days" | "minutes" | "hours" | "percent" | "count";
  };
  changePct: number; // signed; negative = metric went down
  strength: SignalStrength;

  supportingSignals: { label: string; value: string }[];

  // Consumption → work performed ------------------------------------------
  spendMonthly: number; // USD, current month
  spendPrevMonth: number; // USD, prior month (for trend)
  workUnit: { label: string; count: number; assistedNote: string };

  // Measurement metadata ---------------------------------------------------
  confidence: Confidence;
  confidenceRationale: string;
  baselinePeriod: string;
  calculation: string;
  dataSources: DataSource[];
  limitations: string[];
  improveConfidence: string[];
  alternativeMetrics: AlternativeMetric[];

  // Capability + consumption posture (feeds allocation view) ---------------
  capability: CapabilityConfig;
  spendLimitMonthly: number; // configured limit / allocation
  limitUtilizationPct: number; // how close to the cap
}

export interface Department {
  id: DepartmentId;
  name: string;
  owner: string;
  plannedWorkNextMonth: { label: string; count: number };
  // Forecast is driven by this workflow's primary work unit. Consumption per
  // unit = total department spend / this workflow's current work-unit count.
  forecastDriverWorkflowId: string;
  forecastDriverUnit: string; // e.g. "issue"
}

export interface DeploymentOpportunity {
  id: string;
  kind: "expand-consumption" | "expand-capability" | "investigate" | "tune-capability";
  kindLabel: string;
  workflowId: string;
  department: DepartmentId;
  title: string;
  recommendation: string;
  cta: string;
  // Three dimensions of every deployment decision
  dimensions: {
    who: string; // which workflow / users
    capability: string; // which capability changes
    consumption: string; // how much consumption
  };
  evidence: string[];
  confidence: Confidence;
  proposedChange: {
    affected: string;
    capabilityChange: string;
    spendChange: string;
  };
  whatWeLearn: {
    metric: string;
    duration: string;
    expand: string; // result that would justify expanding
    maintain: string; // result that would justify maintaining
    revert: string; // result that would justify reverting
  };
}

// ===========================================================================
// Departments
// ===========================================================================

export const departments: Department[] = [
  {
    id: "engineering",
    name: "Engineering",
    owner: "Priya Nair — VP Engineering",
    plannedWorkNextMonth: { label: "planned engineering issues", count: 340 },
    forecastDriverWorkflowId: "feature-development",
    forecastDriverUnit: "issue",
  },
  {
    id: "sales-marketing",
    name: "Sales & Marketing",
    owner: "Marcus Bell — VP Revenue",
    plannedWorkNextMonth: { label: "planned qualified opportunities", count: 520 },
    forecastDriverWorkflowId: "account-research",
    forecastDriverUnit: "qualified opportunity",
  },
];

// ===========================================================================
// Workflows
// ===========================================================================

export const workflows: Workflow[] = [
  // --- ENGINEERING --------------------------------------------------------
  {
    id: "feature-development",
    department: "engineering",
    name: "Feature development",
    status: "accepted",
    summary:
      "Engineers use Claude Code across the issue → PR lifecycle: scaffolding, implementation, and test authoring.",
    primarySignal: {
      label: "Median issue → merged PR cycle time",
      unit: "days",
      current: 4.1,
      baseline: 5.6,
      betterDirection: "lower",
      displayFormat: "days",
    },
    changePct: -27,
    strength: "Strong signal",
    supportingSignals: [
      { label: "Merged PRs (Claude-assisted)", value: "312 / mo" },
      { label: "Post-merge revert rate", value: "2.4% (was 3.1%)" },
    ],
    spendMonthly: 18400,
    spendPrevMonth: 17600,
    workUnit: {
      label: "Claude-assisted issues",
      count: 312,
      assistedNote: "issues with attributable Claude Code activity",
    },
    confidence: "High",
    confidenceRationale:
      "GitHub + Linear timestamps exist for the same workflow both before and after Claude adoption, so the baseline and the current period are directly comparable.",
    baselinePeriod: "Rolling 90 days pre-adoption (Feb–Apr 2026)",
    calculation:
      "For each issue with attributable Claude Code activity, measure elapsed time from Linear issue 'started' to GitHub PR 'merged'. Report the median. Baseline uses the same team and issue types before Claude adoption.",
    dataSources: [
      { name: "Claude Code activity", status: "connected" },
      { name: "GitHub", status: "connected", note: "PR + merge timestamps" },
      { name: "Linear", status: "connected", note: "issue lifecycle timestamps" },
    ],
    limitations: [
      "Issue mix shifts over time; very large epics are excluded from the median.",
      "Association, not proof of causation — other process changes may contribute.",
    ],
    improveConfidence: [
      "Tag issues by complexity to compare like-for-like.",
      "Add a matched control cohort of non-Claude issues.",
    ],
    alternativeMetrics: [
      { label: "Merged PRs per engineer / week", note: "Throughput proxy; noisier per-person." },
      { label: "Review-to-merge time", note: "Isolates the review tail rather than full cycle." },
      { label: "Change failure rate", note: "Quality-weighted; needs deploy data to be reliable." },
    ],
    capability: {
      reasoning: "Standard effort",
      autonomy: "Supervised agentic (engineer reviews every change)",
      toolAccess: ["Repository read/write", "Test runner", "CI status"],
      enterpriseContext: ["Codebase", "Linear issues", "PR history"],
      headroomNote: "Team routinely reaches its monthly consumption cap.",
    },
    spendLimitMonthly: 20000,
    limitUtilizationPct: 92,
  },
  {
    id: "code-review",
    department: "engineering",
    name: "Code review / refactoring",
    status: "accepted",
    summary:
      "Claude reviews open PRs and drafts refactors, flagging risk before human review.",
    primarySignal: {
      label: "Post-merge revert rate",
      unit: "%",
      current: 3.1,
      baseline: 4.4,
      betterDirection: "lower",
      displayFormat: "percent",
    },
    changePct: -30,
    strength: "Directional",
    supportingSignals: [
      { label: "PRs reviewed (Claude-assisted)", value: "890 / mo" },
      { label: "Median review turnaround", value: "6.2h (was 8.9h)" },
    ],
    spendMonthly: 11100,
    spendPrevMonth: 10200,
    workUnit: {
      label: "Claude-assisted PR reviews",
      count: 890,
      assistedNote: "PRs where Claude produced review comments or a refactor draft",
    },
    confidence: "Medium",
    confidenceRationale:
      "Revert rate is observable from GitHub, but reverts are relatively rare events, so month-to-month movement is noisy and the effect size is less certain than cycle time.",
    baselinePeriod: "Rolling 90 days pre-adoption (Feb–Apr 2026)",
    calculation:
      "Share of merged PRs reverted or hotfixed within 14 days of merge. Compared against the same window pre-adoption.",
    dataSources: [
      { name: "Claude Code activity", status: "connected" },
      { name: "GitHub", status: "connected", note: "PR, merge, revert events" },
      { name: "Deploy / release logs", status: "partial", note: "hotfix linkage incomplete" },
    ],
    limitations: [
      "Reverts are low-frequency; small absolute changes swing the percentage.",
      "Hotfixes not always linked back to the originating PR.",
    ],
    improveConfidence: [
      "Connect release tooling to link hotfixes to source PRs.",
      "Extend the observation window to 6 months to stabilize the rate.",
    ],
    alternativeMetrics: [
      { label: "Review turnaround time", note: "Faster to move; less tied to quality." },
      { label: "Comments resolved per PR", note: "Engagement proxy; gameable." },
    ],
    capability: {
      reasoning: "Standard effort",
      autonomy: "Assistive (drafts comments, human decides)",
      toolAccess: ["Repository read", "Static analysis"],
      enterpriseContext: ["Codebase", "PR history"],
      headroomNote: "Well within its cap; consumption is steady.",
    },
    spendLimitMonthly: 16000,
    limitUtilizationPct: 69,
  },
  {
    id: "incident-investigation",
    department: "engineering",
    name: "Incident investigation",
    status: "proposed",
    summary:
      "On-call engineers use Claude to triage alerts, correlate logs, and draft remediation steps.",
    primarySignal: {
      label: "Median time to resolution",
      unit: "min",
      current: 43,
      baseline: 51,
      betterDirection: "lower",
      displayFormat: "minutes",
    },
    changePct: -16,
    strength: "Observed association",
    supportingSignals: [
      { label: "Incidents resolved with Claude", value: "84 / mo" },
      { label: "Incidents where Claude was invoked", value: "63%" },
    ],
    spendMonthly: 7200,
    spendPrevMonth: 6600,
    workUnit: {
      label: "Claude-assisted incidents",
      count: 84,
      assistedNote: "incidents with Claude activity in the response timeline",
    },
    confidence: "Medium",
    confidenceRationale:
      "Incident-management timestamps are reliable going forward, but the pre-adoption baseline sample is smaller and the severity mix differs between periods.",
    baselinePeriod: "Partial — 6 weeks pre-adoption (baseline sample is incomplete)",
    calculation:
      "Median elapsed time from incident 'acknowledged' to 'resolved' for incidents with Claude activity in the response timeline.",
    dataSources: [
      { name: "Claude activity", status: "connected" },
      { name: "Incident management (PagerDuty)", status: "connected", note: "ack/resolve timestamps" },
      { name: "Severity tagging", status: "partial", note: "inconsistent before adoption" },
    ],
    limitations: [
      "Historical baseline is incomplete — only 6 weeks of clean pre-adoption data.",
      "Severity mix may differ between baseline and current periods.",
    ],
    improveConfidence: [
      "Backfill severity tags on historical incidents.",
      "Segment resolution time by severity to compare like-for-like.",
    ],
    alternativeMetrics: [
      { label: "Time to first mitigation", note: "Captures early impact; noisier to define." },
      { label: "Reopened-incident rate", note: "Quality signal; low frequency." },
    ],
    capability: {
      reasoning: "Standard effort",
      autonomy: "Assistive (suggests, human executes)",
      toolAccess: ["Log search (read)", "Runbook retrieval"],
      enterpriseContext: ["Runbooks", "Recent deploys"],
      headroomNote: "Bursty; spikes during incidents but low steady-state.",
    },
    spendLimitMonthly: 12000,
    limitUtilizationPct: 60,
  },

  // --- SALES & MARKETING --------------------------------------------------
  {
    id: "account-research",
    department: "sales-marketing",
    name: "Account research",
    status: "accepted",
    summary:
      "Reps use Claude to compile account briefs and qualify opportunities from CRM and public sources.",
    primarySignal: {
      label: "Research time per qualified opportunity",
      unit: "hours",
      current: 2.4,
      baseline: 3.6,
      betterDirection: "lower",
      displayFormat: "hours",
    },
    changePct: -33,
    strength: "Directional",
    supportingSignals: [
      { label: "Opportunities researched", value: "460 / mo" },
      { label: "Research artifacts produced", value: "512 briefs / mo" },
    ],
    spendMonthly: 9800,
    spendPrevMonth: 9100,
    workUnit: {
      label: "Qualified opportunities researched",
      count: 460,
      assistedNote: "opportunities with a Claude-generated research brief",
    },
    confidence: "Medium",
    confidenceRationale:
      "Research time is inferred from CRM activity timestamps and Claude session duration rather than directly logged, so it is a good proxy but not an exact measure.",
    baselinePeriod: "Rolling 90 days pre-adoption (Feb–Apr 2026)",
    calculation:
      "Estimated research time per opportunity from CRM stage-entry timestamps and Claude session activity, divided by opportunities reaching 'qualified'. Compared to pre-adoption baseline.",
    dataSources: [
      { name: "Claude activity", status: "connected" },
      { name: "CRM (Salesforce)", status: "connected", note: "opportunity stage timestamps" },
      { name: "Research artifact store", status: "partial", note: "some briefs saved outside CRM" },
    ],
    limitations: [
      "Research time is inferred, not directly logged.",
      "Reps vary in how they log activity in CRM.",
    ],
    improveConfidence: [
      "Standardize where research briefs are stored so they can be counted.",
      "Add lightweight time attribution to Claude research sessions.",
    ],
    alternativeMetrics: [
      { label: "Qualified opps per rep / week", note: "Capacity proxy; affected by pipeline supply." },
      { label: "Brief acceptance rate", note: "Quality proxy; needs rep feedback capture." },
    ],
    capability: {
      reasoning: "Standard effort",
      autonomy: "Assistive (rep prompts manually, mostly copy/paste)",
      toolAccess: ["Web search"],
      enterpriseContext: ["Manually pasted CRM snippets"],
      headroomNote: "Low utilization; workflow is mostly manual today.",
    },
    spendLimitMonthly: 14000,
    limitUtilizationPct: 70,
  },
  {
    id: "sales-call-prep",
    department: "sales-marketing",
    name: "Sales-call preparation",
    status: "proposed",
    summary:
      "Claude assembles call plans, discovery questions, and objection handling ahead of customer calls.",
    primarySignal: {
      label: "Prep time per customer call",
      unit: "min",
      current: 22,
      baseline: 31,
      betterDirection: "lower",
      displayFormat: "minutes",
    },
    changePct: -29,
    strength: "Observed association",
    supportingSignals: [
      { label: "Calls prepared with Claude", value: "720 / mo" },
      { label: "Reps using the workflow", value: "38 of 54" },
    ],
    spendMonthly: 4600,
    spendPrevMonth: 4200,
    workUnit: {
      label: "Calls prepared with Claude",
      count: 720,
      assistedNote: "calls with a Claude-generated prep document",
    },
    confidence: "Medium",
    confidenceRationale:
      "Prep time is inferred from calendar and document-creation timestamps. A reliable pre-adoption baseline exists for a subset of reps.",
    baselinePeriod: "Rolling 60 days pre-adoption (subset of reps)",
    calculation:
      "Elapsed time between prep-doc creation and the scheduled call, cross-referenced with Claude session activity. Compared to reps' pre-adoption prep patterns.",
    dataSources: [
      { name: "Claude activity", status: "connected" },
      { name: "Calendar", status: "connected", note: "call scheduling" },
      { name: "CRM (Salesforce)", status: "partial", note: "call outcomes not always logged" },
    ],
    limitations: [
      "Prep time is inferred from surrounding timestamps.",
      "Call outcome linkage is incomplete, so downstream impact is not yet measured.",
    ],
    improveConfidence: [
      "Capture call outcomes in CRM to link prep to win rate.",
      "Expand the baseline to all reps.",
    ],
    alternativeMetrics: [
      { label: "Calls per rep / week", note: "Capacity proxy." },
      { label: "Next-step conversion rate", note: "Outcome proxy; needs outcome logging." },
    ],
    capability: {
      reasoning: "Standard effort",
      autonomy: "Assistive",
      toolAccess: ["Web search"],
      enterpriseContext: ["Calendar", "Pasted account notes"],
      headroomNote: "Low steady consumption.",
    },
    spendLimitMonthly: 8000,
    limitUtilizationPct: 58,
  },
  {
    id: "content-production",
    department: "sales-marketing",
    name: "Campaign / content production",
    status: "accepted",
    summary:
      "Marketing drafts campaign assets, emails, and landing copy with Claude across multiple channels.",
    primarySignal: {
      label: "Approved campaign assets produced",
      unit: "assets",
      current: 128,
      baseline: 98,
      betterDirection: "higher",
      displayFormat: "count",
    },
    changePct: 31,
    strength: "More data needed",
    supportingSignals: [
      { label: "Assets drafted with Claude", value: "410 / mo" },
      { label: "Approval / revision data", value: "unavailable" },
    ],
    spendMonthly: 12300,
    spendPrevMonth: 8900,
    workUnit: {
      label: "Assets drafted with Claude",
      count: 410,
      assistedNote: "draft assets with Claude activity (approval status unknown)",
    },
    confidence: "Low",
    confidenceRationale:
      "We can count drafts produced, but the approval and revision system is not connected — so we cannot tell how many drafts became approved, published assets that created value.",
    baselinePeriod: "Draft counts only; no reliable outcome baseline",
    calculation:
      "Count of assets marked approved in the CMS. Approval workflow is not currently connected, so 'approved' is estimated from published URLs and is likely undercounted.",
    dataSources: [
      { name: "Claude activity", status: "connected" },
      { name: "CMS / DAM", status: "missing", note: "approval + revision history not connected" },
      { name: "Campaign performance", status: "missing", note: "no linkage to outcomes" },
    ],
    limitations: [
      "Approval and revision data is unavailable — we count drafts, not approved value.",
      "No linkage between assets and campaign performance.",
      "Spend rose 38% month-over-month while measurable output is uncertain.",
    ],
    improveConfidence: [
      "Connect the CMS approval workflow to count approved assets.",
      "Capture revision counts to measure rework.",
      "Link assets to campaign performance for a value signal.",
    ],
    alternativeMetrics: [
      { label: "Approved assets per campaign", note: "Needs approval data (not connected)." },
      { label: "Draft → approval time", note: "Needs revision history (not connected)." },
      { label: "Revisions per asset", note: "Rework proxy; needs CMS integration." },
    ],
    capability: {
      reasoning: "Standard effort",
      autonomy: "Assistive",
      toolAccess: ["Web search"],
      enterpriseContext: ["Brand guidelines (pasted)"],
      headroomNote: "Consumption up 38% MoM with no connected outcome measure.",
    },
    spendLimitMonthly: 16000,
    limitUtilizationPct: 77,
  },
];

// ===========================================================================
// Deployment opportunities (executive view)
// Each is derived from the workflow measurements above.
// ===========================================================================

export const opportunities: DeploymentOpportunity[] = [
  {
    id: "opp-feature-expand",
    kind: "expand-consumption",
    kindLabel: "Expand consumption",
    workflowId: "feature-development",
    department: "engineering",
    title: "Feature development — Engineering",
    recommendation:
      "Increase consumption headroom for Feature Development. The value signal is strong and the team is consumption-constrained.",
    cta: "Review change",
    dimensions: {
      who: "Feature development — 41 engineers",
      capability: "No capability change — more consumption headroom",
      consumption: "+20% monthly limit (test range)",
    },
    evidence: [
      "High-confidence value signal: cycle time down 27% (4.1d vs 5.6d baseline).",
      "GitHub + Linear timestamps give a directly comparable before/after baseline.",
      "Team reaches 92% of its monthly limit and is being throttled at month-end.",
      "312 assisted issues/mo — a large, credible sample of observations.",
    ],
    confidence: "High",
    proposedChange: {
      affected: "Feature development workflow (41 engineers)",
      capabilityChange: "None — this is a consumption headroom change, not a capability change.",
      spendChange: "Raise monthly limit from $20.0K to $24.0K (+20%). Expected realized spend +$3.4K–$3.9K.",
    },
    whatWeLearn: {
      metric: "Issue → merged PR cycle time, held against post-merge revert rate as a quality guardrail.",
      duration: "One month (~340 planned issues) — enough to hold significance.",
      expand:
        "Cycle time holds or improves and revert rate stays flat → make the higher limit permanent and test a further increase.",
      maintain: "Cycle time flat with no quality regression → keep the new limit, stop increasing.",
      revert: "Revert rate rises or cycle time worsens → return to the prior $20.0K limit.",
    },
  },
  {
    id: "opp-account-capability",
    kind: "expand-capability",
    kindLabel: "Expand capability",
    workflowId: "account-research",
    department: "sales-marketing",
    title: "Account research — Sales",
    recommendation:
      "Test agentic execution for Account Research with CRM read access. The workflow is repetitive and mostly manual today.",
    cta: "Design pilot",
    dimensions: {
      who: "Account research — 22 reps (pilot cohort of 8)",
      capability: "Assistive → supervised agentic + CRM read access",
      consumption: "+$3K–$5K/mo during the pilot",
    },
    evidence: [
      "Directional value signal: research time per qualified opportunity down 33% (2.4h vs 3.6h) even in today's manual, copy-paste workflow.",
      "460 opportunities researched/mo — a repetitive, high-volume workflow.",
      "Current usage is mostly assistive: reps prompt manually and paste CRM snippets by hand.",
      "Enough confidence in the signal to justify testing more autonomy — the ceiling looks higher than the current manual pattern.",
    ],
    confidence: "Medium",
    proposedChange: {
      affected: "Account research pilot — 8 of 22 reps",
      capabilityChange:
        "Move from assistive prompting to supervised agentic execution with scoped CRM read access, so Claude can pull account context directly instead of reps pasting it.",
      spendChange: "Estimated +$3K–$5K/mo additional consumption during the pilot (agentic runs cost more per opportunity).",
    },
    whatWeLearn: {
      metric: "Research time per qualified opportunity and qualified opportunities per rep, with brief-acceptance rate as a quality check.",
      duration: "6 weeks, 8 reps, ~120 opportunities.",
      expand:
        "Research time drops further and quality holds → roll agentic access out to the full team.",
      maintain: "Modest gains → keep for the pilot cohort while improving guardrails.",
      revert: "No time gain or quality drops → return to assistive mode; the added autonomy isn't paying off.",
    },
  },
  {
    id: "opp-content-investigate",
    kind: "investigate",
    kindLabel: "Investigate before expanding",
    workflowId: "content-production",
    department: "sales-marketing",
    title: "Campaign / content production — Marketing",
    recommendation:
      "Hold current deployment and connect approval data before expanding. Spend is rising faster than measurable value.",
    cta: "Improve measurement",
    dimensions: {
      who: "Content production — Marketing team",
      capability: "No change until measurement improves",
      consumption: "Hold at current limit — do not expand",
    },
    evidence: [
      "Spend up 38% month-over-month ($8.9K → $12.3K).",
      "Draft output up 31% — but that counts drafts, not approved assets.",
      "Approval and revision data is unavailable — the CMS is not connected.",
      "Value confidence is Low: we cannot yet tell whether more drafts create more value.",
    ],
    confidence: "Low",
    proposedChange: {
      affected: "Content production workflow (Marketing)",
      capabilityChange: "No capability or consumption change until measurement improves.",
      spendChange: "Hold at the current $16.0K limit. Revisit once approval data is connected.",
    },
    whatWeLearn: {
      metric: "Once the CMS approval workflow is connected: approved assets produced and draft → approval time.",
      duration: "Connect data first, then observe for one month before any expansion.",
      expand:
        "If approved-asset output tracks the spend increase → expansion is justified.",
      maintain: "If approvals lag drafts → the extra drafting spend isn't converting to value; keep the current limit.",
      revert: "If most drafts never get approved → reduce consumption until the workflow is tuned.",
    },
  },
  {
    id: "opp-incident-tune",
    kind: "tune-capability",
    kindLabel: "Tune capability",
    workflowId: "incident-investigation",
    department: "engineering",
    title: "Incident investigation — Engineering",
    recommendation:
      "Test higher reasoning effort and observability tool access for incident response — not simply more budget.",
    dimensions: {
      who: "Incident investigation — on-call rotation (12 engineers)",
      capability: "Higher reasoning effort + observability (metrics/traces) read access",
      consumption: "Modest — bounded by incident volume, not a limit increase",
    },
    cta: "Design pilot",
    evidence: [
      "Observed association: resolution time down 16% (43min vs 51min) even with only log-search access.",
      "Claude is invoked in 63% of incidents — adoption is real.",
      "The workflow is capability-limited, not budget-limited: consumption is bursty and well under its cap (60% utilization).",
      "Baseline is incomplete (6 weeks), so treat as a test, not a proven win.",
    ],
    confidence: "Medium",
    proposedChange: {
      affected: "Incident investigation — on-call rotation (12 engineers)",
      capabilityChange:
        "Enable higher reasoning effort for complex incidents and add read access to metrics/traces (not just logs). This is a capability change, not a limit increase.",
      spendChange: "Higher per-incident cost from deeper reasoning; total stays bounded by incident volume. Estimated +$1.5K–$2.5K/mo.",
    },
    whatWeLearn: {
      metric: "Time to resolution and reopened-incident rate, segmented by severity.",
      duration: "8 weeks or 60 incidents, whichever comes first.",
      expand:
        "Resolution time improves on high-severity incidents without more reopens → keep higher effort for that tier.",
      maintain: "Gains only on low-severity incidents → scope the capability to those.",
      revert: "No improvement or more reopens → return to standard effort and log-only access.",
    },
  },
];

// ===========================================================================
// Derived / rollup helpers — keep both experiences consistent
// ===========================================================================

export function workflowsByDept(dept: DepartmentId): Workflow[] {
  return workflows.filter((w) => w.department === dept);
}

export function workflowById(id: string): Workflow | undefined {
  return workflows.find((w) => w.id === id);
}

export function departmentById(id: DepartmentId): Department | undefined {
  return departments.find((d) => d.id === id);
}

export const totalMonthlySpend = workflows.reduce((s, w) => s + w.spendMonthly, 0);

export const totalPrevMonthSpend = workflows.reduce((s, w) => s + w.spendPrevMonth, 0);

// Spend covered by a credible (High or Medium confidence) value measurement.
export const credibleSpend = workflows
  .filter((w) => w.confidence !== "Low")
  .reduce((s, w) => s + w.spendMonthly, 0);

export const credibleSpendPct = Math.round((credibleSpend / totalMonthlySpend) * 100);

export const highOrMediumWorkflowCount = workflows.filter(
  (w) => w.confidence !== "Low"
).length;

export const lowConfidenceWorkflowCount = workflows.filter(
  (w) => w.confidence === "Low"
).length;

// Department-level spend rollups
export function deptSpend(dept: DepartmentId): number {
  return workflowsByDept(dept).reduce((s, w) => s + w.spendMonthly, 0);
}

export function deptPrevSpend(dept: DepartmentId): number {
  return workflowsByDept(dept).reduce((s, w) => s + w.spendPrevMonth, 0);
}

// ---------------------------------------------------------------------------
// Forecasting — spend projected from expected WORK, not token extrapolation.
// Per-unit consumption is derived from current spend and current work volume,
// then applied to next month's planned workload with a modeled range.
// ---------------------------------------------------------------------------
export interface Forecast {
  dept: DepartmentId;
  plannedLabel: string;
  plannedCount: number;
  perUnitCost: number; // derived $ per work unit
  low: number;
  high: number;
  basis: string;
}

export function departmentForecast(dept: DepartmentId): Forecast {
  const d = departmentById(dept)!;
  const spend = deptSpend(dept);
  // Consumption per unit of primary work = total department spend divided by
  // the current volume of the department's driver workflow. This models the
  // fully-loaded Claude cost of getting one unit of primary work done.
  const driver = workflowById(d.forecastDriverWorkflowId)!;
  const perUnitCost = spend / driver.workUnit.count;
  const planned = d.plannedWorkNextMonth.count;
  // Model a range (-6% / +11%) to reflect workload/deployment uncertainty.
  const central = perUnitCost * planned;
  const low = Math.round((central * 0.94) / 1000) * 1000;
  const high = Math.round((central * 1.11) / 1000) * 1000;
  return {
    dept,
    plannedLabel: d.plannedWorkNextMonth.label,
    plannedCount: planned,
    perUnitCost,
    low,
    high,
    basis: `${planned} ${d.plannedWorkNextMonth.label} × current consumption per ${d.forecastDriverUnit}`,
  };
}

// Company forecast range = sum of department forecasts.
export const companyForecast = {
  low: departments.reduce((s, d) => s + departmentForecast(d.id).low, 0),
  high: departments.reduce((s, d) => s + departmentForecast(d.id).high, 0),
};
