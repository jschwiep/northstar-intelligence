"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import type { Role, DepartmentId } from "@/data/mockEnterprise";

// A contextual note/question the executive sends to a workflow's LOB owner.
export interface OwnerNote {
  id: string;
  workflowId: string;
  workflowName: string;
  from: string; // e.g. "Dana Whitfield (Exec)"
  text: string;
}

// A line in the executive's budget draft (keyed by opportunity id).
export interface DraftItem {
  oppId: string;
  note: string;
}

interface AppState {
  role: Role;
  setRole: (r: Role) => void;
  dept: DepartmentId;
  setDept: (d: DepartmentId) => void;

  // Budget draft (executive) ------------------------------------------------
  draftTitle: string;
  setDraftTitle: (t: string) => void;
  draftNotes: string;
  setDraftNotes: (t: string) => void;
  draftItems: DraftItem[];
  isDrafted: (oppId: string) => boolean;
  toggleDraft: (oppId: string) => void;
  setDraftItemNote: (oppId: string, note: string) => void;

  // Exec → owner notes ------------------------------------------------------
  ownerNotes: OwnerNote[];
  sendOwnerNote: (n: Omit<OwnerNote, "id">) => void;
  notesForWorkflow: (workflowId: string) => OwnerNote[];
}

const Ctx = createContext<AppState | null>(null);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role>("lob");
  const [dept, setDept] = useState<DepartmentId>("engineering");

  const [draftTitle, setDraftTitle] = useState("Q4 intelligence budget — draft");
  const [draftNotes, setDraftNotes] = useState("");
  const [draftItems, setDraftItems] = useState<DraftItem[]>([]);
  const [ownerNotes, setOwnerNotes] = useState<OwnerNote[]>([]);

  const isDrafted = useCallback(
    (oppId: string) => draftItems.some((d) => d.oppId === oppId),
    [draftItems]
  );

  const toggleDraft = useCallback((oppId: string) => {
    setDraftItems((items) =>
      items.some((d) => d.oppId === oppId)
        ? items.filter((d) => d.oppId !== oppId)
        : [...items, { oppId, note: "" }]
    );
  }, []);

  const setDraftItemNote = useCallback((oppId: string, note: string) => {
    setDraftItems((items) =>
      items.map((d) => (d.oppId === oppId ? { ...d, note } : d))
    );
  }, []);

  const sendOwnerNote = useCallback((n: Omit<OwnerNote, "id">) => {
    setOwnerNotes((notes) => [
      ...notes,
      { ...n, id: `${n.workflowId}-${notes.length}-${Date.now()}` },
    ]);
  }, []);

  const notesForWorkflow = useCallback(
    (workflowId: string) => ownerNotes.filter((n) => n.workflowId === workflowId),
    [ownerNotes]
  );

  return (
    <Ctx.Provider
      value={{
        role,
        setRole,
        dept,
        setDept,
        draftTitle,
        setDraftTitle,
        draftNotes,
        setDraftNotes,
        draftItems,
        isDrafted,
        toggleDraft,
        setDraftItemNote,
        ownerNotes,
        sendOwnerNote,
        notesForWorkflow,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useAppState(): AppState {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAppState must be used within AppStateProvider");
  return v;
}
