"use client";

import { cn } from "@/lib/utils";

interface PaginationProps {
  page: number;
  totalPages: number;
  totalItems: number;
  startIndex: number;
  endIndex: number;
  onPageChange: (page: number) => void;
  itemLabel?: string;
}

function pageNumbers(current: number, total: number): (number | "...")[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, index) => index + 1);
  }

  const pages: (number | "...")[] = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);

  if (start > 2) pages.push("...");
  for (let page = start; page <= end; page += 1) pages.push(page);
  if (end < total - 1) pages.push("...");
  pages.push(total);

  return pages;
}

export function Pagination({
  page,
  totalPages,
  totalItems,
  startIndex,
  endIndex,
  onPageChange,
  itemLabel = "items",
}: PaginationProps) {
  if (totalItems === 0) return null;

  const pages = pageNumbers(page, totalPages);

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4 border-t border-slate-100">
      <p className="text-xs text-slate-500">
        Showing {startIndex}–{endIndex} of {totalItems} {itemLabel}
      </p>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="px-2.5 py-1.5 text-sm text-slate-600 rounded-lg hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-transparent"
          aria-label="Previous page"
        >
          <i className="fas fa-chevron-left text-xs" />
        </button>
        {pages.map((value, index) =>
          value === "..." ? (
            <span
              key={`ellipsis-${index}`}
              className="px-2 text-sm text-slate-400"
            >
              …
            </span>
          ) : (
            <button
              key={value}
              type="button"
              onClick={() => onPageChange(value)}
              className={cn(
                "min-w-8 px-2.5 py-1.5 text-sm rounded-lg transition-colors",
                value === page
                  ? "bg-brand-600 text-white font-medium"
                  : "text-slate-600 hover:bg-slate-100",
              )}
              aria-current={value === page ? "page" : undefined}
            >
              {value}
            </button>
          ),
        )}
        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="px-2.5 py-1.5 text-sm text-slate-600 rounded-lg hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-transparent"
          aria-label="Next page"
        >
          <i className="fas fa-chevron-right text-xs" />
        </button>
      </div>
    </div>
  );
}
