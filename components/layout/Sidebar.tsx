"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_SECTIONS } from "@/lib/navigation";
import { useToast } from "@/lib/toast";
import { cn } from "@/lib/utils";

interface SidebarProps {
  open: boolean;
  onNavigate: () => void;
}

export function Sidebar({ open, onNavigate }: SidebarProps) {
  const pathname = usePathname();
  const { showToast } = useToast();

  return (
    <aside
      className={cn(
        "w-64 shrink-0 bg-white border-r border-slate-200 flex-col shadow-sm z-30",
        open ? "flex fixed inset-y-0 left-0 lg:static" : "hidden lg:flex",
      )}
    >
      <div className="p-5 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white shadow-lg shadow-brand-500/30">
            <i className="fas fa-laptop text-lg" />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight text-slate-900">
              TechVault
            </h1>
            <p className="text-xs text-slate-500">Inventory System</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {NAV_SECTIONS.map((section) => (
          <div key={section.label}>
            <p className="px-3 text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2 mt-4 first:mt-0">
              {section.label}
            </p>
            {section.items.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.key}
                  href={item.href}
                  onClick={onNavigate}
                  className={cn(
                    "sidebar-link flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                    active ? "active" : "text-slate-600",
                  )}
                >
                  <i className={`fas ${item.icon} w-5 text-center`} />
                  {item.label}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-semibold text-sm">
            AD
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">Admin User</p>
            <p className="text-xs text-slate-500 truncate">
              admin@techvault.com
            </p>
          </div>
          <button
            type="button"
            className="text-slate-400 hover:text-slate-600"
            title="Logout"
            onClick={() =>
              showToast("Logout is not available in this demo")
            }
          >
            <i className="fas fa-sign-out-alt" />
          </button>
        </div>
      </div>
    </aside>
  );
}
