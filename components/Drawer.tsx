"use client";

import { ReactNode, useEffect } from "react";

export function Drawer({
  open,
  onClose,
  title,
  eyebrow,
  children,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  eyebrow?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (open) {
      document.addEventListener("keydown", onKey);
      return () => document.removeEventListener("keydown", onKey);
    }
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40">
      <div
        className="absolute inset-0 animate-fade-in bg-ink/20"
        onClick={onClose}
      />
      <div className="absolute right-0 top-0 flex h-full w-full max-w-[560px] animate-drawer-in flex-col border-l border-line bg-canvas shadow-drawer">
        <div className="flex items-start justify-between border-b border-line px-7 py-5">
          <div>
            {eyebrow && (
              <div className="text-2xs font-semibold uppercase tracking-[0.08em] text-ink-faint">
                {eyebrow}
              </div>
            )}
            <h2 className="mt-1 text-lg font-semibold text-ink">{title}</h2>
          </div>
          <button
            onClick={onClose}
            className="ml-4 rounded-md p-1.5 text-ink-faint transition-colors hover:bg-line/50 hover:text-ink"
            aria-label="Close"
          >
            <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M5 5l10 10M15 5L5 15" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-7 py-6">{children}</div>
        {footer && (
          <div className="border-t border-line bg-surface px-7 py-4">{footer}</div>
        )}
      </div>
    </div>
  );
}
