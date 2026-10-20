"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { isDeptId, type DeptId } from "@/lib/departments";

interface Session {
  name: string;
  dept: DeptId | null;
  /** Presets answer instantly from the authored script (zero latency on stage). */
  instantDemo: boolean;
  ready: boolean;
  enter: (name: string, dept: DeptId) => void;
  setDept: (dept: DeptId) => void;
  setInstantDemo: (v: boolean) => void;
  leave: () => void;
}

const SessionContext = createContext<Session | null>(null);
const KEY = "allure-interne:session";

function safeRead(): { name?: string; dept?: string; instantDemo?: boolean } {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "{}");
  } catch {
    return {};
  }
}
function safeWrite(v: object) {
  try {
    localStorage.setItem(KEY, JSON.stringify(v));
  } catch {
    /* private mode — session lives in memory only */
  }
}

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [name, setName] = useState("");
  const [dept, setDeptState] = useState<DeptId | null>(null);
  const [instantDemo, setInstant] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const s = safeRead();
    /* eslint-disable react-hooks/set-state-in-effect -- hydrate from localStorage once */
    if (s.name) setName(s.name);
    if (isDeptId(s.dept)) setDeptState(s.dept);
    if (s.instantDemo) setInstant(true);
    setReady(true);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  useEffect(() => {
    if (ready) safeWrite({ name, dept, instantDemo });
  }, [name, dept, instantDemo, ready]);

  const enter = useCallback((n: string, d: DeptId) => {
    setName(n.trim());
    setDeptState(d);
  }, []);
  const leave = useCallback(() => {
    setDeptState(null);
  }, []);

  const value = useMemo<Session>(
    () => ({
      name,
      dept,
      instantDemo,
      ready,
      enter,
      setDept: setDeptState,
      setInstantDemo: setInstant,
      leave,
    }),
    [name, dept, instantDemo, ready, enter, leave],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): Session {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession must be used inside SessionProvider");
  return ctx;
}
