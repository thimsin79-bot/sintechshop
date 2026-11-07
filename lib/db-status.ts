"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type DatabaseConnectionState =
  | "checking"
  | "connected"
  | "disconnected";

export interface DatabaseStatus {
  status: DatabaseConnectionState;
  latencyMs: number | null;
  message: string;
  checkedAt: string | null;
}

const INITIAL_STATUS: DatabaseStatus = {
  status: "checking",
  latencyMs: null,
  message: "Checking database connection...",
  checkedAt: null,
};

export function useDatabaseStatus(intervalMs = 30000) {
  const [status, setStatus] = useState<DatabaseStatus>(INITIAL_STATUS);
  const mounted = useRef(true);

  const refresh = useCallback(async () => {
    setStatus((current) => ({ ...current, status: "checking" }));

    try {
      const response = await fetch("/api/db-status", { cache: "no-store" });
      const payload = (await response.json()) as Partial<DatabaseStatus>;
      if (!mounted.current) return;

      setStatus({
        status:
          payload.status === "connected" ? "connected" : "disconnected",
        latencyMs:
          typeof payload.latencyMs === "number" ? payload.latencyMs : null,
        message: typeof payload.message === "string" ? payload.message : "",
        checkedAt:
          typeof payload.checkedAt === "string" ? payload.checkedAt : null,
      });
    } catch {
      if (!mounted.current) return;
      setStatus({
        status: "disconnected",
        latencyMs: null,
        message: "Unable to reach the status endpoint.",
        checkedAt: new Date().toISOString(),
      });
    }
  }, []);

  useEffect(() => {
    mounted.current = true;
    void refresh();
    const timer = setInterval(() => void refresh(), intervalMs);

    return () => {
      mounted.current = false;
      clearInterval(timer);
    };
  }, [refresh, intervalMs]);

  return { ...status, refresh };
}
