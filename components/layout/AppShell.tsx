"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { useAuth } from "@/lib/auth";

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, ready } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isAuthPage = pathname === "/login" || pathname === "/signup";

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!ready || isAuthPage) return;
    if (!user) router.replace("/login");
  }, [ready, isAuthPage, user, router]);

  if (isAuthPage) return <>{children}</>;

  if (!ready || !user) {
    return (
      <div className="flex h-screen items-center justify-center bg-transparent">
        <div className="flex flex-col items-center gap-3 text-slate-400">
          <i className="fas fa-circle-notch fa-spin text-2xl text-brand-500" />
          <p className="text-sm">Loading workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar open={sidebarOpen} onNavigate={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <Header onMenuClick={() => setSidebarOpen((value) => !value)} />
        <main id="content" className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
