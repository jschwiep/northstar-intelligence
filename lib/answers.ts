// ---------------------------------------------------------------------------
// Demo-safe Q&A. No real model call — questions are keyword-matched and
// answered from the same mock data that drives the rest of the app, so the
// answers stay internally consistent. Falls back gracefully so a live demo
// never dead-ends.
// ---------------------------------------------------------------------------
import type { Workflow, DeploymentOpportunity } from "@/data/mockEnterprise";
import { formatSignal } from "@/lib/format";

function has(text: string, ...keys: string[]): boolean {
  return keys.some((k) => text.includes(k));
}

// Questions about a value measurement (LOB "How this is measured").
export function answerMeasurementQuestion(w: Workflow, question: string): string {
  const q = question.toLowerCase();
  const cur = formatSignal(w, w.primarySignal.current);
  const base = formatSignal(w, w.primarySignal.baseline);

  if (has(q, "causal", "cause", "prove", "proof", "attribut", "correlat"))
    return `It's an observed association, not proof of causation. ${w.limitations[0]} We report the signal alongside its confidence rather than claiming Claude caused the change.`;

  if (has(q, "confiden", "reliable", "trust", "sure"))
    return `${w.confidenceRationale} That's why it reads as ${w.confidence} confidence.`;

  if (has(q, "baseline", "before", "compare", "comparison"))
    return `Baseline period: ${w.baselinePeriod}. ${w.calculation}`;

  if (has(q, "stronger", "higher confidence", "improve", "better measurement", "what would"))
    return `To strengthen it: ${w.improveConfidence.join("; ")}.`;

  if (has(q, "limit", "caveat", "risk", "weak", "wrong", "flaw"))
    return `Caveats: ${w.limitations.join(" ")}`;

  if (has(q, "driv", "why", "cause of", "explain", "what's behind", "reason"))
    return `The signal is ${w.primarySignal.label.toLowerCase()}, moving from ${base} to ${cur}. It's computed over ${w.workUnit.count.toLocaleString(
      "en-US"
    )} ${w.workUnit.label.toLowerCase()} with attributable Claude activity.`;

  if (has(q, "how", "calculat", "measur", "work", "compute", "method"))
    return w.calculation;

  if (has(q, "source", "data", "where", "system"))
    return `Sources: ${w.dataSources
      .map((s) => `${s.name} (${s.status})`)
      .join(", ")}.`;

  return `I can explain the calculation, the baseline, why it's ${w.confidence} confidence, whether it's causal, the limitations, or what would make it stronger. What would you like to know?`;
}

// Questions about a deployment opportunity (exec "View evidence & plan").
export function answerOpportunityQuestion(
  opp: DeploymentOpportunity,
  w: Workflow,
  question: string
): string {
  const q = question.toLowerCase();

  if (has(q, "why this", "why that", "why the", "chose", "pick", "select", "why are", "why is"))
    return `${opp.recommendation} ${opp.evidence[0]}`;

  if (has(q, "risk", "downside", "wrong", "fail", "danger", "worst"))
    return `The main risk is bounded by the revert trigger: ${opp.whatWeLearn.revert} It's a reversible test, not a permanent change.`;

  if (has(q, "cost", "spend", "much", "consumption", "budget", "expensive"))
    return `${opp.proposedChange.spendChange}${
      opp.draftable ? "" : " This one isn't a spend change — it's a measurement gap to close first."
    }`;

  if (has(q, "capabilit", "autonom", "reasoning", "tool", "access", "what changes", "change"))
    return opp.proposedChange.capabilityChange;

  if (has(q, "confiden", "sure", "strong", "evidence", "how do we know"))
    return `${opp.confidence} confidence. ${opp.evidence
      .slice(0, 2)
      .join(" ")} It's derived from the ${w.name} signal in Value measurement.`;

  if (has(q, "learn", "monitor", "success", "measure", "metric", "how long", "duration"))
    return `We'd monitor ${opp.whatWeLearn.metric} over ${opp.whatWeLearn.duration} Expand if ${opp.whatWeLearn.expand}`;

  if (has(q, "who", "team", "users", "people", "cohort"))
    return `Affected: ${opp.proposedChange.affected}.`;

  return `I can explain why this workflow, what capability changes, the added consumption, the risk and revert trigger, or what we'd monitor. Or send the question to ${
    w.department === "engineering" ? "Priya" : "Marcus"
  } if it's a judgment call.`;
}
