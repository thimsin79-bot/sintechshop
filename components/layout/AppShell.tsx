"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { useAuth } from "@/lib/auth";
import { useData } from "@/lib/store";

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, ready } = useAuth();
  const { ready: dataReady } = useData();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isAuthPage = pathname === "/login" || pathname === "/signup";

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!ready || isAuthPage) return;
    if (!user) router.replace("/login");
  }, [ready, isAuthPage, user, router]);

  useEffect(() => {
    if (!sidebarOpen) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setSidebarOpen(false);
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [sidebarOpen]);

  if (isAuthPage) return <>{children}</>;

  if (!ready || !user || !dataReady) {
    return (
      <div className="flex h-dvh items-center justify-center bg-transparent">
        <div className="flex flex-col items-center gap-3 text-slate-400">
          <i className="fas fa-circle-notch fa-spin text-2xl text-brand-500" />
          <p className="text-sm">Loading workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-dvh overflow-hidden">
      {sidebarOpen ? (
        <button
          type="button"
          aria-label="Close navigation"
          className="fixed inset-0 z-30 bg-slate-900/50 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      ) : null}
      <Sidebar open={sidebarOpen} onNavigate={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <Header
          menuOpen={sidebarOpen}
          onMenuClick={() => setSidebarOpen((value) => !value)}
        />
        <main id="content" className="flex-1 overflow-y-auto p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
