import { NextRequest, NextResponse } from "next/server";
import { workflowById, opportunities } from "@/data/mockEnterprise";
import { answerMeasurementQuestion, answerOpportunityQuestion } from "@/lib/answers";
import { formatSignal } from "@/lib/format";

// "Ask Claude" backend.
// - If ANTHROPIC_API_KEY is set, answer with a real Claude (Haiku 4.5) call,
//   grounded in the same mock data that drives the UI.
// - Otherwise, fall back to the deterministic, data-derived answers so the
//   public demo works with no key, no cost, and no live dependency.
export const runtime = "nodejs";

interface AskBody {
  kind: "measurement" | "opportunity";
  id: string;
  question: string;
}

function measurementContext(workflowId: string): string | null {
  const w = workflowById(workflowId);
  if (!w) return null;
  return [
    `Workflow: ${w.name} (${w.department})`,
    `Primary value signal: ${w.primarySignal.label}`,
    `Current: ${formatSignal(w, w.primarySignal.current)}, baseline: ${formatSignal(
      w,
      w.primarySignal.baseline
    )}, change: ${w.changePct}%`,
    `Signal strength: ${w.strength}. Measurement confidence: ${w.confidence}.`,
    `Confidence rationale: ${w.confidenceRationale}`,
    `Calculation: ${w.calculation}`,
    `Baseline period: ${w.baselinePeriod}`,
    `Claude spend: $${w.spendMonthly}/mo over ${w.workUnit.count} ${w.workUnit.label}.`,
    `Data sources: ${w.dataSources.map((s) => `${s.name} (${s.status})`).join(", ")}.`,
    `Limitations: ${w.limitations.join(" ")}`,
    `Would improve confidence: ${w.improveConfidence.join("; ")}.`,
  ].join("\n");
}

function opportunityContext(oppId: string): string | null {
  const opp = opportunities.find((o) => o.id === oppId);
  if (!opp) return null;
  const w = workflowById(opp.workflowId);
  return [
    `Deployment opportunity: ${opp.title} (${opp.kindLabel})`,
    `Recommendation: ${opp.recommendation}`,
    `Confidence: ${opp.confidence}.`,
    `Who/workflow: ${opp.dimensions.who}`,
    `Capability change: ${opp.dimensions.capability}`,
    `Consumption change: ${opp.dimensions.consumption}`,
    `Evidence: ${opp.evidence.join(" ")}`,
    `Proposed change — affected: ${opp.proposedChange.affected}; capability: ${opp.proposedChange.capabilityChange}; spend: ${opp.proposedChange.spendChange}`,
    `What we'll monitor: ${opp.whatWeLearn.metric} over ${opp.whatWeLearn.duration}`,
    `Expand if: ${opp.whatWeLearn.expand} Maintain if: ${opp.whatWeLearn.maintain} Revert if: ${opp.whatWeLearn.revert}`,
    w ? `Derived from the ${w.name} value signal (currently ${w.confidence} confidence).` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

const SYSTEM = `You are Claude, embedded in Northstar's Claude Enterprise "Value & deployment" analytics product.
You answer a line-of-business owner's or executive's question about a specific value measurement or deployment opportunity.

Rules:
- Answer ONLY from the provided context. Do not invent numbers, dates, or sources not present.
- Be concise: 2–4 sentences, plain language, no preamble.
- Treat results as observed associations, never as proof of causation.
- Surface uncertainty honestly; if the context says data is missing or confidence is low, say so.
- Do not translate everything into dollars or manufacture ROI.`;

async function askClaude(context: string, question: string): Promise<string> {
  const { default: Anthropic } = await import("@anthropic-ai/sdk");
  const client = new Anthropic();
  const response = await client.messages.create({
    model: "claude-haiku-4-5",
    max_tokens: 400,
    system: SYSTEM,
    messages: [
      {
        role: "user",
        content: `Context for this question:\n${context}\n\nQuestion: ${question}`,
      },
    ],
  });
  const text = response.content
    .map((b) => (b.type === "text" ? b.text : ""))
    .join("")
    .trim();
  return text || "I wasn't able to produce an answer for that.";
}

export async function POST(req: NextRequest) {
  let body: AskBody;
  try {
    body = (await req.json()) as AskBody;
  } catch {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }

  const { kind, id, question } = body;
  if (!kind || !id || !question?.trim()) {
    return NextResponse.json({ error: "missing fields" }, { status: 400 });
  }

  const context =
    kind === "measurement" ? measurementContext(id) : opportunityContext(id);
  if (!context) {
    return NextResponse.json({ error: "unknown id" }, { status: 404 });
  }

  // Deterministic fallback answer (also the response when no API key is set).
  const mock =
    kind === "measurement"
      ? answerMeasurementQuestion(workflowById(id)!, question)
      : (() => {
          const opp = opportunities.find((o) => o.id === id)!;
          return answerOpportunityQuestion(opp, workflowById(opp.workflowId)!, question);
        })();

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ answer: mock, source: "mock" });
  }

  try {
    const answer = await askClaude(context, question);
    return NextResponse.json({ answer, source: "claude" });
  } catch (err) {
    // Never fail the demo — fall back to the deterministic answer.
    return NextResponse.json({ answer: mock, source: "mock-fallback" });
  }
}
