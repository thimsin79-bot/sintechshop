"use client";

import { useState } from "react";
import { StockModal } from "@/components/modals/StockModal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Pagination } from "@/components/ui/Pagination";
import { useData } from "@/lib/store";
import { useToast } from "@/lib/toast";
import { usePagination } from "@/lib/pagination";
import { formatDate } from "@/lib/utils";
import type { StockMovement, StockMovementType } from "@/lib/types";

export function InventoryPage() {
  const { data, deleteStockMovement } = useData();
  const { showToast } = useToast();
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<"" | StockMovementType>("");
  const [stockType, setStockType] = useState<StockMovementType | null>(null);
  const [editing, setEditing] = useState<StockMovement | null>(null);
  const [deleting, setDeleting] = useState<StockMovement | null>(null);

  const filtered = data.stockMovements.filter((movement) => {
    const q = query.trim().toLowerCase();
    const matchText =
      !q ||
      movement.product.toLowerCase().includes(q) ||
      movement.ref.toLowerCase().includes(q) ||
      movement.user.toLowerCase().includes(q);
    const matchType = !typeFilter || movement.type === typeFilter;
    return matchText && matchType;
  });
  const pagination = usePagination(
    filtered,
    10,
    `${query.trim().toLowerCase()}|${typeFilter}`,
  );

  function handleDelete() {
    if (!deleting) return;
    deleteStockMovement(deleting.id);
    setDeleting(null);
    showToast("Stock movement deleted");
  }

  return (
    <div className="fade-in space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-col sm:flex-row gap-3 flex-1">
          <div className="relative flex-1 max-w-md">
            <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
            <input
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by product, reference, user..."
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent bg-white"
            />
          </div>
          <select
            value={typeFilter}
            onChange={(event) =>
              setTypeFilter(event.target.value as "" | StockMovementType)
            }
            className="text-sm border border-slate-200 rounded-xl px-3 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="">All Types</option>
            <option value="in">Stock In</option>
            <option value="out">Stock Out</option>
          </select>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setStockType("in")}
            className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium px-5 py-2.5 rounded-xl shadow-sm transition"
          >
            <i className="fas fa-arrow-down" /> Stock In
          </button>
          <button
            type="button"
            onClick={() => setStockType("out")}
            className="inline-flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-700 text-white text-sm font-medium px-5 py-2.5 rounded-xl shadow-sm transition"
          >
            <i className="fas fa-arrow-up" /> Stock Out
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-semibold">Stock Movement History</h3>
          <span className="text-xs text-slate-500">
            {filtered.length} record{filtered.length !== 1 ? "s" : ""}
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr className="text-left">
                <th className="px-5 py-3.5 font-medium">Type</th>
                <th className="px-5 py-3.5 font-medium">Product</th>
                <th className="px-5 py-3.5 font-medium">Qty</th>
                <th className="px-5 py-3.5 font-medium">Reference</th>
                <th className="px-5 py-3.5 font-medium">Date</th>
                <th className="px-5 py-3.5 font-medium">User</th>
                <th className="px-5 py-3.5 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pagination.pageItems.map((movement) => (
                <tr
                  key={movement.id}
                  className="table-row border-t border-slate-50"
                >
                  <td className="px-5 py-3.5">
                    <span
                      className={`badge ${
                        movement.type === "in"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-rose-100 text-rose-700"
                      }`}
                    >
                      <i
                        className={`fas fa-arrow-${
                          movement.type === "in" ? "down" : "up"
                        } mr-1`}
                      />
                      {movement.type.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 font-medium">
                    {movement.product}
                  </td>
                  <td
                    className={`px-5 py-3.5 font-semibold ${
                      movement.type === "in"
                        ? "text-emerald-600"
                        : "text-rose-600"
                    }`}
                  >
                    {movement.type === "in" ? "+" : "-"}
                    {movement.qty}
                  </td>
                  <td className="px-5 py-3.5 text-brand-600">
                    {movement.ref}
                  </td>
                  <td className="px-5 py-3.5">{formatDate(movement.date)}</td>
                  <td className="px-5 py-3.5">{movement.user}</td>
                  <td className="px-5 py-3.5 text-right whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => setEditing(movement)}
                      className="text-slate-400 hover:text-brand-600 p-1.5"
                      title="Edit"
                    >
                      <i className="fas fa-edit" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleting(movement)}
                      className="text-slate-400 hover:text-rose-600 p-1.5"
                      title="Delete"
                    >
                      <i className="fas fa-trash" />
                    </button>
                  </td>
                </tr>
              ))}
              {!filtered.length ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-5 py-10 text-center text-slate-500"
                  >
                    No stock movements match your search.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
        <Pagination
          page={pagination.page}
          totalPages={pagination.totalPages}
          totalItems={pagination.totalItems}
          startIndex={pagination.startIndex}
          endIndex={pagination.endIndex}
          onPageChange={pagination.goToPage}
          itemLabel="stock movements"
        />
      </div>

      <StockModal
        open={stockType !== null}
        type={stockType ?? "in"}
        onClose={() => setStockType(null)}
      />
      <StockModal
        open={Boolean(editing)}
        movement={editing}
        onClose={() => setEditing(null)}
      />
      <ConfirmDialog
        open={Boolean(deleting)}
        title="Delete stock movement"
        message={`Delete this ${deleting?.type === "in" ? "stock in" : "stock out"} of ${deleting?.qty ?? 0} × ${deleting?.product ?? "this product"}? Stock levels will be adjusted.`}
        onCancel={() => setDeleting(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
