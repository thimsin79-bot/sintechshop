"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  buildNotifications,
  loadNotificationState,
  saveNotificationState,
  type AppNotification,
  type NotificationState,
} from "@/lib/notifications";
import { PAGE_META, pageKeyForPath } from "@/lib/navigation";
import { useData } from "@/lib/store";
import { DatabaseStatusPill } from "@/components/system/DatabaseStatus";

const TONE_STYLES: Record<AppNotification["tone"], string> = {
  danger: "bg-rose-500/15 text-rose-300",
  warning: "bg-amber-500/15 text-amber-300",
  info: "bg-sky-500/15 text-sky-300",
};

export function Header({ onMenuClick }: { onMenuClick: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const { data } = useData();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [notificationState, setNotificationState] = useState<NotificationState>(
    { read: [], dismissed: [] },
  );
  const panelRef = useRef<HTMLDivElement | null>(null);
  const meta = PAGE_META[pageKeyForPath(pathname)];

  useEffect(() => {
    setNotificationState(loadNotificationState());
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    saveNotificationState(notificationState);
  }, [notificationState, loaded]);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: MouseEvent) {
      if (
        panelRef.current &&
        !panelRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const notifications = buildNotifications(data).filter(
    (item) => !notificationState.dismissed.includes(item.id),
  );
  const unread = notifications.filter(
    (item) => !notificationState.read.includes(item.id),
  ).length;

  function markRead(id: string) {
    setNotificationState((current) =>
      current.read.includes(id)
        ? current
        : { ...current, read: [...current.read, id] },
    );
  }

  function markAllRead() {
    setNotificationState((current) => {
      const ids = new Set(current.read);
      notifications.forEach((item) => ids.add(item.id));
      return { ...current, read: Array.from(ids) };
    });
  }

  function dismiss(id: string) {
    setNotificationState((current) =>
      current.dismissed.includes(id)
        ? current
        : { ...current, dismissed: [...current.dismissed, id] },
    );
  }

  function clearAll() {
    setNotificationState((current) => {
      const ids = new Set(current.dismissed);
      notifications.forEach((item) => ids.add(item.id));
      return { ...current, dismissed: Array.from(ids) };
    });
  }

  function openNotification(item: AppNotification) {
    markRead(item.id);
    setOpen(false);
    router.push(item.href);
  }

  function handleSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) {
      router.push("/products");
      return;
    }
    router.push(`/products?q=${encodeURIComponent(trimmed)}`);
  }

  return (
    <header className="header-dark h-16 border-b border-slate-800 flex items-center justify-between px-6 shadow-lg z-20 shrink-0">
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={onMenuClick}
          className="lg:hidden text-slate-300 hover:text-white"
          aria-label="Toggle navigation"
        >
          <i className="fas fa-bars text-lg" />
        </button>
        <div>
          <h2 className="text-lg font-semibold text-white">{meta.title}</h2>
          <p className="text-xs text-slate-400">{meta.subtitle}</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <form onSubmit={handleSearch} className="relative hidden md:block">
          <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search products, SKUs..."
            className="pl-9 pr-4 py-2 text-sm border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent w-64 bg-white/5 text-white placeholder:text-slate-400"
          />
        </form>
        <DatabaseStatusPill className="hidden sm:inline-flex" />
        <div className="relative" ref={panelRef}>
          <button
            type="button"
            className="relative p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            onClick={() => setOpen((value) => !value)}
            aria-label="Notifications"
            aria-haspopup="menu"
            aria-expanded={open}
          >
            <i className="fas fa-bell" />
            {unread > 0 ? (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
                {unread > 9 ? "9+" : unread}
              </span>
            ) : null}
          </button>
          {open ? (
            <div
              role="menu"
              className="absolute right-0 mt-2 w-80 sm:w-96 bg-slate-900 text-slate-200 rounded-xl border border-slate-800 shadow-2xl overflow-hidden z-50"
            >
              <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-slate-800">
                <div>
                  <p className="text-sm font-semibold text-white">
                    Notifications
                  </p>
                  <p className="text-xs text-slate-400">
                    {unread} unread · {notifications.length} total
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={markAllRead}
                    disabled={unread === 0}
                    className="text-xs font-medium text-brand-400 hover:text-brand-300 disabled:text-slate-600 disabled:cursor-not-allowed"
                  >
                    Mark all read
                  </button>
                  <button
                    type="button"
                    onClick={clearAll}
                    disabled={notifications.length === 0}
                    className="text-xs font-medium text-slate-400 hover:text-rose-400 disabled:text-slate-600 disabled:cursor-not-allowed"
                  >
                    Clear all
                  </button>
                </div>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.length ? (
                  notifications.map((item) => {
                    const isRead = notificationState.read.includes(item.id);
                    return (
                      <div
                        key={item.id}
                        className="group flex items-start gap-1 border-b border-slate-800 last:border-0 hover:bg-slate-800/60"
                      >
                        <button
                          type="button"
                          role="menuitem"
                          onClick={() => openNotification(item)}
                          className="flex flex-1 items-start gap-3 px-4 py-3 text-left min-w-0"
                        >
                          <span
                            className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${TONE_STYLES[item.tone]}`}
                          >
                            <i className={`fas ${item.icon} text-xs`} />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="flex items-center gap-2">
                              <span className="text-sm font-medium text-slate-100 truncate">
                                {item.title}
                              </span>
                              {isRead ? null : (
                                <span className="w-1.5 h-1.5 rounded-full bg-brand-400 shrink-0" />
                              )}
                            </span>
                            <span className="block text-xs text-slate-400 mt-0.5 truncate">
                              {item.detail}
                            </span>
                          </span>
                          <i className="fas fa-chevron-right text-[10px] text-slate-600 mt-2 shrink-0" />
                        </button>
                        <button
                          type="button"
                          onClick={() => dismiss(item.id)}
                          className="p-2 mr-1 mt-1 text-slate-600 hover:text-rose-400 opacity-0 group-hover:opacity-100 focus:opacity-100"
                          aria-label={`Dismiss ${item.title}`}
                          title="Dismiss"
                        >
                          <i className="fas fa-times text-xs" />
                        </button>
                      </div>
                    );
                  })
                ) : (
                  <div className="px-6 py-10 text-center">
                    <div className="w-12 h-12 rounded-full bg-emerald-500/15 text-emerald-300 flex items-center justify-center mx-auto mb-3">
                      <i className="fas fa-check" />
                    </div>
                    <p className="text-sm font-medium text-slate-200">
                      You&apos;re all caught up
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      New stock, purchase, and warranty alerts appear here.
                    </p>
                  </div>
                )}
              </div>
              {notifications.length ? (
                <div className="px-4 py-2 border-t border-slate-800 text-[11px] text-slate-500">
                  Click a notification to open the related page.
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
