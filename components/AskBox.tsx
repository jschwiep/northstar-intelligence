"use client";

import { useState } from "react";
import { ClaudeMark } from "@/components/ui";

interface Turn {
  role: "user" | "claude";
  text: string;
}

export function AskBox({
  suggestions,
  onAsk,
  placeholder,
  escalate,
  sentNotes,
}: {
  suggestions: string[];
  onAsk: (q: string) => string;
  placeholder: string;
  // Optional human-escalation on the same input (exec → LOB owner).
  escalate?: { ownerName: string; onEscalate: (q: string) => void };
  sentNotes?: { id: string; text: string }[];
}) {
  const [input, setInput] = useState("");
  const [turns, setTurns] = useState<Turn[]>([]);

  function ask(text: string) {
    const t = text.trim();
    if (!t) return;
    setTurns((prev) => [...prev, { role: "user", text: t }, { role: "claude", text: onAsk(t) }]);
    setInput("");
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    ask(input);
  }

  function doEscalate() {
    const t = input.trim();
    if (!t || !escalate) return;
    escalate.onEscalate(t);
    setInput("");
  }

  return (
    <div>
      {/* Conversation log */}
      {turns.length > 0 && (
        <div className="mb-2.5 space-y-2">
          {turns.map((t, i) =>
            t.role === "user" ? (
              <div key={i} className="flex justify-end">
                <div className="max-w-[85%] rounded-lg rounded-br-sm bg-ink/[0.06] px-3 py-1.5 text-xs text-ink">
                  {t.text}
                </div>
              </div>
            ) : (
              <div key={i} className="flex items-start gap-2">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent/10 text-accent">
                  <ClaudeMark className="h-2.5 w-2.5" />
                </span>
                <div className="max-w-[85%] rounded-lg rounded-tl-sm border border-line bg-panel px-3 py-2 text-xs leading-relaxed text-ink-soft">
                  {t.text}
                </div>
              </div>
            )
          )}
        </div>
      )}

      {/* Escalated notes (sent to owner) */}
      {sentNotes && sentNotes.length > 0 && (
        <div className="mb-2.5 space-y-1.5">
          {sentNotes.map((n) => (
            <div
              key={n.id}
              className="flex items-start gap-2 rounded-lg border border-line bg-surface px-3 py-2 text-xs text-ink-soft"
            >
              <svg viewBox="0 0 16 16" className="mt-0.5 h-3 w-3 shrink-0 text-signal-high" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 8.5l3 3 7-7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span>
                Sent · “{n.text}” — {escalate?.ownerName} will see this on their Value tab.
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Suggestions */}
      <div className="mb-2 flex flex-wrap gap-1.5">
        {suggestions.map((s) => (
          <button
            key={s}
            onClick={() => ask(s)}
            className="rounded-full border border-line bg-panel px-2.5 py-1 text-2xs font-medium text-ink-soft transition-colors hover:border-accent-soft hover:text-ink"
          >
            {s}
          </button>
        ))}
      </div>

      {/* Input */}
      <form onSubmit={submit} className="flex items-center gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={placeholder}
          className="flex-1 rounded-lg border border-line bg-panel px-3 py-2 text-sm text-ink outline-none placeholder:text-ink-faint focus:border-accent"
        />
        <button
          type="submit"
          className="shrink-0 rounded-lg bg-ink px-3 py-2 text-xs font-medium text-canvas transition-colors hover:bg-ink/90"
        >
          Ask Claude
        </button>
        {escalate && (
          <button
            type="button"
            onClick={doEscalate}
            className="shrink-0 rounded-lg border border-line bg-panel px-3 py-2 text-xs font-medium text-ink transition-colors hover:bg-line/40"
          >
            Ask {escalate.ownerName}
          </button>
        )}
      </form>
    </div>
  );
}
