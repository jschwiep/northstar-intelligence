// Client helper for the "Ask Claude" surfaces. POSTs to /api/ask, which calls
// a real Claude model when ANTHROPIC_API_KEY is set and otherwise returns the
// deterministic, data-derived answer. Throws on any failure so callers can fall
// back to a local answer and never dead-end the demo.
export async function askApi(
  kind: "measurement" | "opportunity",
  id: string,
  question: string
): Promise<string> {
  const res = await fetch("/api/ask", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ kind, id, question }),
  });
  if (!res.ok) throw new Error(`ask failed: ${res.status}`);
  const data = (await res.json()) as { answer?: string };
  if (!data.answer) throw new Error("no answer");
  return data.answer;
}
