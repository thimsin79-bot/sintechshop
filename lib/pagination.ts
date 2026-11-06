"use client";

import { useEffect, useMemo, useState } from "react";

export interface PaginationState<T> {
  page: number;
  totalPages: number;
  totalItems: number;
  startIndex: number;
  endIndex: number;
  pageItems: T[];
  goToPage: (page: number) => void;
}

export function usePagination<T>(
  items: T[],
  pageSize = 10,
  resetKey?: unknown,
): PaginationState<T> {
  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
  }, [resetKey]);

  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const currentPage = Math.min(Math.max(page, 1), totalPages);

  const pageItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, currentPage, pageSize]);

  const startIndex =
    items.length === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(currentPage * pageSize, items.length);

  function goToPage(nextPage: number) {
    setPage(Math.min(Math.max(nextPage, 1), totalPages));
  }

  return {
    page: currentPage,
    totalPages,
    totalItems: items.length,
    startIndex,
    endIndex,
    pageItems,
    goToPage,
  };
}
