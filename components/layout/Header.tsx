"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { PAGE_META, pageKeyForPath } from "@/lib/navigation";
import { useToast } from "@/lib/toast";

export function Header({ onMenuClick }: { onMenuClick: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const { showToast } = useToast();
  const [query, setQuery] = useState("");
  const meta = PAGE_META[pageKeyForPath(pathname)];

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
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shadow-sm z-20 shrink-0">
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={onMenuClick}
          className="lg:hidden text-slate-500 hover:text-slate-700"
          aria-label="Toggle navigation"
        >
          <i className="fas fa-bars text-lg" />
        </button>
        <div>
          <h2 className="text-lg font-semibold text-slate-900">{meta.title}</h2>
          <p className="text-xs text-slate-500">{meta.subtitle}</p>
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
            className="pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent w-64 bg-slate-50"
          />
        </form>
        <button
          type="button"
          className="relative p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg"
          onClick={() => showToast("You have no new notifications")}
          aria-label="Notifications"
        >
          <i className="fas fa-bell" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
        </button>
        <button
          type="button"
          className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg"
          onClick={() => showToast("Settings are not available in this demo")}
          aria-label="Settings"
        >
          <i className="fas fa-cog" />
        </button>
      </div>
    </header>
  );
}
