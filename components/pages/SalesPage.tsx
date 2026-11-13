"use client";

import { useState } from "react";
import { SaleModal } from "@/components/modals/SaleModal";
import { SaleInvoiceModal } from "@/components/modals/SaleInvoiceModal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Pagination } from "@/components/ui/Pagination";
import { useData } from "@/lib/store";
import { useToast } from "@/lib/toast";
import { usePagination } from "@/lib/pagination";
import { primaryButton } from "@/lib/styles";
import { formatCurrency } from "@/lib/utils";
import type { Sale } from "@/lib/types";

export function SalesPage() {
  const { data, refundSale, deleteSale } = useData();
  const { showToast } = useToast();
  const [creating, setCreating] = useState(false);
  const [viewing, setViewing] = useState<Sale | null>(null);
  const [deleting, setDeleting] = useState<Sale | null>(null);
  const pagination = usePagination(data.sales, 10);

  function handleRefund(sale: Sale) {
    if (sale.status === "refunded") {
      showToast("This invoice is already refunded");
      return;
    }
    refundSale(sale.id);
    setViewing(null);
    showToast(`${sale.id} marked as refunded`);
  }

  function handlePrint(sale: Sale) {
    setViewing(sale);
    setTimeout(() => window.print(), 150);
  }

  function handleDelete() {
    if (!deleting) return;
    deleteSale(deleting.id);
    setDeleting(null);
    showToast("Sale deleted");
  }

  return (
    <div className="fade-in space-y-5">
      <div className="flex justify-between items-center">
        <p className="text-sm text-slate-500">
          {data.sales.length} recent invoices
        </p>
        <button
          type="button"
          onClick={() => setCreating(true)}
          className={primaryButton}
        >
          <i className="fas fa-plus" /> New Sale
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr className="text-left">
                <th className="px-5 py-3.5 font-medium">Invoice</th>
                <th className="px-5 py-3.5 font-medium">Customer</th>
                <th className="px-5 py-3.5 font-medium">Items</th>
                <th className="px-5 py-3.5 font-medium">Total</th>
                <th className="px-5 py-3.5 font-medium">Payment</th>
                <th className="px-5 py-3.5 font-medium">Status</th>
                <th className="px-5 py-3.5 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pagination.pageItems.map((sale) => (
                <tr
                  key={sale.id}
                  className="table-row border-t border-slate-50"
                >
                  <td className="px-5 py-3.5 font-medium text-brand-600">
                    {sale.id}
                  </td>
                  <td className="px-5 py-3.5">{sale.customer}</td>
                  <td className="px-5 py-3.5">{sale.items}</td>
                  <td className="px-5 py-3.5 font-semibold">
                    {formatCurrency(sale.total)}
                  </td>
                  <td className="px-5 py-3.5 capitalize">{sale.payment}</td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`badge ${
                        sale.status === "completed"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {sale.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => setViewing(sale)}
                      className="text-slate-400 hover:text-brand-600 p-1.5"
                      title="View"
                    >
                      <i className="fas fa-eye" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handlePrint(sale)}
                      className="text-slate-400 hover:text-brand-600 p-1.5"
                      title="Print"
                    >
                      <i className="fas fa-print" />
                    </button>
                    {sale.status !== "refunded" ? (
                      <button
                        type="button"
                        onClick={() => handleRefund(sale)}
                        className="text-slate-400 hover:text-amber-600 p-1.5"
                        title="Refund"
                      >
                        <i className="fas fa-rotate-left" />
                      </button>
                    ) : null}
                    <button
                      type="button"
                      onClick={() => setDeleting(sale)}
                      className="text-slate-400 hover:text-rose-600 p-1.5"
                      title="Delete"
                    >
                      <i className="fas fa-trash" />
                    </button>
                  </td>
                </tr>
              ))}
              {!data.sales.length ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-5 py-10 text-center text-slate-500"
                  >
                    No sales yet
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
          itemLabel="invoices"
        />
      </div>

      <SaleModal open={creating} onClose={() => setCreating(false)} />
      <SaleInvoiceModal
        open={Boolean(viewing)}
        sale={viewing}
        onClose={() => setViewing(null)}
      />
      <ConfirmDialog
        open={Boolean(deleting)}
        title="Delete sale"
        message={`Are you sure you want to delete ${deleting?.id ?? "this sale"}? Linked stock movements will be removed and stock levels restored.`}
        onCancel={() => setDeleting(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
