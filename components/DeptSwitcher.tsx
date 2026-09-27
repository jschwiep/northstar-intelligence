"use client";

import { useAppState } from "./AppState";
import { departments } from "@/data/mockEnterprise";

export function DeptSwitcher() {
  const { dept, setDept } = useAppState();
  return (
    <div className="flex rounded-lg border border-line bg-surface p-0.5">
      {departments.map((d) => (
        <button
          key={d.id}
          onClick={() => setDept(d.id)}
          className={`rounded-md px-3.5 py-1.5 text-xs font-medium transition-colors ${
            dept === d.id
              ? "bg-panel text-ink shadow-card"
              : "text-ink-faint hover:text-ink-soft"
          }`}
        >
          {d.name}
        </button>
      ))}
    </div>
  );
}
