"use client";

import { cn } from "@/lib/utils";
import {
  useDatabaseStatus,
  type DatabaseConnectionState,
} from "@/lib/db-status";

const TONE: Record<
  DatabaseConnectionState,
  { dot: string; text: string; surface: string; icon: string }
> = {
  checking: {
    dot: "bg-amber-400",
    text: "text-amber-600",
    surface: "bg-amber-50 text-amber-600",
    icon: "fa-circle-notch fa-spin",
  },
  connected: {
    dot: "bg-emerald-500",
    text: "text-emerald-600",
    surface: "bg-emerald-50 text-emerald-600",
    icon: "fa-database",
  },
  disconnected: {
    dot: "bg-rose-500",
    text: "text-rose-600",
    surface: "bg-rose-50 text-rose-600",
    icon: "fa-triangle-exclamation",
  },
};

const LABEL: Record<DatabaseConnectionState, string> = {
  checking: "Checking database",
  connected: "Database online",
  disconnected: "Database offline",
};

function detailTitle(status: DatabaseConnectionState, message: string, checkedAt: string | null) {
  if (!checkedAt) return message;
  return `${message} Last checked ${new Date(checkedAt).toLocaleTimeString()}. Click to refresh.`;
}

export function DatabaseStatusPill({ className }: { className?: string }) {
  const { status, latencyMs, message, checkedAt, refresh } = useDatabaseStatus();
  const tone = TONE[status];

  return (
    <button
      type="button"
      onClick={() => void refresh()}
      title={detailTitle(status, message, checkedAt)}
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium transition hover:bg-slate-50",
        tone.text,
        className,
      )}
    >
      <span className="relative flex h-2 w-2">
        {status === "connected" ? (
          <span
            className={cn(
              "absolute inline-flex h-full w-full animate-ping rounded-full opacity-75",
              tone.dot,
            )}
          />
        ) : null}
        <span
          className={cn("relative inline-flex h-2 w-2 rounded-full", tone.dot)}
        />
      </span>
      <span>{LABEL[status]}</span>
      {status === "connected" && latencyMs !== null ? (
        <span className="text-slate-400">· {latencyMs} ms</span>
      ) : null}
    </button>
  );
}

export function DatabaseStatusCard({ className }: { className?: string }) {
  const { status, latencyMs, message, checkedAt, refresh } = useDatabaseStatus();
  const tone = TONE[status];

  return (
    <div
      className={cn(
        "bg-white rounded-2xl p-5 border border-slate-100 shadow-sm",
        className,
      )}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-semibold text-slate-800">Database Status</h3>
          <p className="text-xs text-slate-500">
            Live connection to Neon Postgres
          </p>
        </div>
        <div
          className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center",
            tone.surface,
          )}
        >
          <i className={`fas ${tone.icon}`} />
        </div>
      </div>

      <div className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 bg-slate-50/60">
        <span className="relative flex h-2.5 w-2.5">
          <span
            className={cn("relative inline-flex h-2.5 w-2.5 rounded-full", tone.dot)}
          />
        </span>
        <div className="min-w-0 flex-1">
          <p className={cn("text-sm font-medium", tone.text)}>
            {LABEL[status]}
          </p>
          <p className="text-xs text-slate-500 truncate" title={message}>
            {message}
          </p>
        </div>
        {status === "connected" && latencyMs !== null ? (
          <span className="text-xs font-semibold text-slate-500">
            {latencyMs} ms
          </span>
        ) : null}
      </div>

      <div className="mt-3 flex items-center justify-between gap-3">
        <p className="text-[11px] text-slate-400">
          {checkedAt
            ? `Last checked ${new Date(checkedAt).toLocaleTimeString()}`
            : "Not checked yet"}
        </p>
        <button
          type="button"
          onClick={() => void refresh()}
          className="inline-flex items-center gap-2 text-xs font-medium text-brand-600 hover:text-brand-700"
        >
          <i className="fas fa-rotate" /> Refresh
        </button>
      </div>
    </div>
  );
}
