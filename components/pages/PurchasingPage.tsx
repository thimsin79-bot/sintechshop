"use client";

import { useState } from "react";
import { PurchaseModal } from "@/components/modals/PurchaseModal";
import { PurchaseViewModal } from "@/components/modals/PurchaseViewModal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Pagination } from "@/components/ui/Pagination";
import { useData } from "@/lib/store";
import { useToast } from "@/lib/toast";
import { usePagination } from "@/lib/pagination";
import { primaryButton } from "@/lib/styles";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Purchase } from "@/lib/types";

export function PurchasingPage() {
  const { data, deleteRecord, receivePurchase } = useData();
  const { showToast } = useToast();
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Purchase | null>(null);
  const [viewing, setViewing] = useState<Purchase | null>(null);
  const [deleting, setDeleting] = useState<Purchase | null>(null);
  const pagination = usePagination(data.purchases, 10);

  function handleReceive(purchase: Purchase) {
    if (purchase.status === "received") {
      showToast("This purchase order is already received");
      return;
    }
    receivePurchase(purchase.id);
    setViewing(null);
    showToast(`${purchase.id} marked as received`);
  }

  function handleDelete() {
    if (!deleting) return;
    deleteRecord("purchases", deleting.id);
    setDeleting(null);
    showToast("Purchase order deleted");
  }

  return (
    <div className="fade-in space-y-5">
      <div className="flex justify-between items-center">
        <p className="text-sm text-slate-500">
          {data.purchases.length} purchase orders
        </p>
        <button
          type="button"
          onClick={() => setCreating(true)}
          className={primaryButton}
        >
          <i className="fas fa-plus" /> New Purchase Order
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr className="text-left">
                <th className="px-5 py-3.5 font-medium">PO Number</th>
                <th className="px-5 py-3.5 font-medium">Supplier</th>
                <th className="px-5 py-3.5 font-medium">Date</th>
                <th className="px-5 py-3.5 font-medium">Items</th>
                <th className="px-5 py-3.5 font-medium">Total</th>
                <th className="px-5 py-3.5 font-medium">Status</th>
                <th className="px-5 py-3.5 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pagination.pageItems.map((purchase) => (
                <tr
                  key={purchase.id}
                  className="table-row border-t border-slate-50"
                >
                  <td className="px-5 py-3.5 font-medium text-brand-600">
                    {purchase.id}
                  </td>
                  <td className="px-5 py-3.5">{purchase.supplier}</td>
                  <td className="px-5 py-3.5">{formatDate(purchase.date)}</td>
                  <td className="px-5 py-3.5">{purchase.items}</td>
                  <td className="px-5 py-3.5 font-semibold">
                    {formatCurrency(purchase.total)}
                  </td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`badge ${
                        purchase.status === "received"
                          ? "bg-emerald-100 text-emerald-700"
                          : purchase.status === "partial"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {purchase.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => setViewing(purchase)}
                      className="text-slate-400 hover:text-brand-600 p-1.5"
                      title="View"
                    >
                      <i className="fas fa-eye" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditing(purchase)}
                      className="text-slate-400 hover:text-brand-600 p-1.5"
                      title="Edit"
                    >
                      <i className="fas fa-edit" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleReceive(purchase)}
                      className="text-slate-400 hover:text-emerald-600 p-1.5"
                      title="Mark as received"
                    >
                      <i className="fas fa-check" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleting(purchase)}
                      className="text-slate-400 hover:text-rose-600 p-1.5"
                      title="Delete"
                    >
                      <i className="fas fa-trash" />
                    </button>
                  </td>
                </tr>
              ))}
              {!data.purchases.length ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-5 py-10 text-center text-slate-500"
                  >
                    No purchase orders yet
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
          itemLabel="purchase orders"
        />
      </div>

      <PurchaseModal open={creating} onClose={() => setCreating(false)} />
      <PurchaseModal
        open={Boolean(editing)}
        purchase={editing}
        onClose={() => setEditing(null)}
      />
      <PurchaseViewModal
        open={Boolean(viewing)}
        purchase={viewing}
        onClose={() => setViewing(null)}
        onReceive={() => {
          if (viewing) handleReceive(viewing);
        }}
      />
      <ConfirmDialog
        open={Boolean(deleting)}
        title="Delete purchase order"
        message={`Are you sure you want to delete ${deleting?.id ?? "this purchase order"}? This action cannot be undone.`}
        onCancel={() => setDeleting(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
