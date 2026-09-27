"use client";

import { useRouter, usePathname } from "next/navigation";
import { useAppState } from "./AppState";
import type { Role } from "@/data/mockEnterprise";

const roleMeta: Record<Role, { name: string; title: string; initials: string }> = {
  lob: { name: "Priya Nair", title: "VP Engineering · LOB owner", initials: "PN" },
  exec: { name: "Dana Whitfield", title: "COO · Enterprise admin", initials: "DW" },
};

export function TopBar({
  title,
  breadcrumb,
}: {
  title: string;
  breadcrumb: string;
}) {
  const { role, setRole } = useAppState();
  const router = useRouter();
  const pathname = usePathname();
  const meta = roleMeta[role];

  function switchRole(next: Role) {
    setRole(next);
    // The allocation view is executive-only; leave it if we drop to LOB.
    if (next === "lob" && pathname === "/allocation") {
      router.push("/value");
    }
  }

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between border-b border-line bg-canvas/85 px-8 py-3 backdrop-blur">
      <div>
        <div className="text-2xs font-medium uppercase tracking-wide text-ink-faint">
          {breadcrumb}
        </div>
        <h1 className="text-lg font-semibold text-ink">{title}</h1>
      </div>

      <div className="flex items-center gap-4">
        {/* Role switcher — unobtrusive segmented control */}
        <div className="flex items-center gap-2">
          <span className="text-2xs font-medium uppercase tracking-wide text-ink-faint">
            View as
          </span>
          <div className="flex rounded-lg border border-line bg-surface p-0.5">
            <button
              onClick={() => switchRole("lob")}
              className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                role === "lob"
                  ? "bg-panel text-ink shadow-card"
                  : "text-ink-faint hover:text-ink-soft"
              }`}
            >
              LOB owner
            </button>
            <button
              onClick={() => switchRole("exec")}
              className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                role === "exec"
                  ? "bg-panel text-ink shadow-card"
                  : "text-ink-faint hover:text-ink-soft"
              }`}
            >
              Executive / Admin
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2.5 border-l border-line pl-4">
          <div className="text-right leading-tight">
            <div className="text-xs font-medium text-ink">{meta.name}</div>
            <div className="text-2xs text-ink-faint">{meta.title}</div>
          </div>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-ink/[0.06] text-xs font-semibold text-ink-soft">
            {meta.initials}
          </div>
        </div>
      </div>
    </header>
  );
}
