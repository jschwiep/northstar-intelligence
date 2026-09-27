"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAppState } from "./AppState";
import { ReactNode } from "react";

function NavItem({
  href,
  active,
  disabled,
  children,
  badge,
}: {
  href?: string;
  active?: boolean;
  disabled?: boolean;
  children: ReactNode;
  badge?: string;
}) {
  const base =
    "flex items-center justify-between rounded-lg px-3 py-1.5 text-sm transition-colors";
  if (disabled || !href) {
    return (
      <div
        className={`${base} cursor-default text-ink-faint hover:bg-line/40`}
        aria-disabled
      >
        <span>{children}</span>
        {badge && (
          <span className="rounded-full bg-accent/10 px-1.5 py-0.5 text-2xs font-semibold text-accent">
            {badge}
          </span>
        )}
      </div>
    );
  }
  return (
    <Link
      href={href}
      className={`${base} ${
        active
          ? "bg-ink/[0.06] font-medium text-ink"
          : "text-ink-soft hover:bg-line/50 hover:text-ink"
      }`}
    >
      <span>{children}</span>
      {badge && (
        <span className="rounded-full bg-accent/10 px-1.5 py-0.5 text-2xs font-semibold text-accent">
          {badge}
        </span>
      )}
    </Link>
  );
}

function GroupLabel({ children }: { children: ReactNode }) {
  return (
    <div className="px-3 pb-1 pt-4 text-2xs font-semibold uppercase tracking-[0.08em] text-ink-faint">
      {children}
    </div>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const { role } = useAppState();

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r border-line bg-canvas">
      {/* Org header */}
      <div className="flex items-center gap-2.5 px-4 py-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-ink text-sm font-semibold text-canvas">
          N
        </div>
        <div className="leading-tight">
          <div className="text-sm font-semibold text-ink">Northstar</div>
          <div className="text-2xs text-ink-faint">Enterprise plan</div>
        </div>
      </div>

      <div className="border-t border-line" />

      <nav className="flex-1 overflow-y-auto px-2 pb-6">
        <GroupLabel>Organization</GroupLabel>
        <NavItem disabled>Organization</NavItem>
        <NavItem disabled>Members</NavItem>
        <NavItem disabled>Groups</NavItem>
        <NavItem disabled>Billing &amp; usage</NavItem>

        <GroupLabel>AI configuration</GroupLabel>
        <NavItem disabled>Models</NavItem>
        <NavItem disabled>Integrations</NavItem>
        <NavItem disabled>Usage analytics</NavItem>

        <GroupLabel>Value &amp; deployment</GroupLabel>
        <NavItem
          href="/value"
          active={pathname === "/value" || pathname === "/"}
          badge="New"
        >
          Value
        </NavItem>
        {role === "exec" && (
          <NavItem
            href="/allocation"
            active={pathname === "/allocation"}
            badge="New"
          >
            Intelligence allocation
          </NavItem>
        )}
      </nav>

      <div className="border-t border-line px-4 py-3 text-2xs text-ink-faint">
        Value &amp; deployment is a prototype surface added to
        Organization&nbsp;settings.
      </div>
    </aside>
  );
}
