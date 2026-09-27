"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import type { Role, DepartmentId } from "@/data/mockEnterprise";

interface AppState {
  role: Role;
  setRole: (r: Role) => void;
  dept: DepartmentId;
  setDept: (d: DepartmentId) => void;
}

const Ctx = createContext<AppState | null>(null);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role>("lob");
  const [dept, setDept] = useState<DepartmentId>("engineering");
  return (
    <Ctx.Provider value={{ role, setRole, dept, setDept }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAppState(): AppState {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAppState must be used within AppStateProvider");
  return v;
}
