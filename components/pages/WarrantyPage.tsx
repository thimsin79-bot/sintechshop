"use client";

import { useState } from "react";
import { WarrantyModal } from "@/components/modals/WarrantyModal";
import { WarrantyViewModal } from "@/components/modals/WarrantyViewModal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Pagination } from "@/components/ui/Pagination";
import { useData } from "@/lib/store";
import { useToast } from "@/lib/toast";
import { usePagination } from "@/lib/pagination";
import { primaryButton } from "@/lib/styles";
import type { Warranty } from "@/lib/types";

export function WarrantyPage() {
  const { data, deleteRecord, claimWarranty } = useData();
  const { showToast } = useToast();
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Warranty | null>(null);
  const [viewing, setViewing] = useState<Warranty | null>(null);
  const [deleting, setDeleting] = useState<Warranty | null>(null);
  const pagination = usePagination(data.warranties, 10);

  function handleClaim(warranty: Warranty) {
    if (warranty.status === "claimed") {
      showToast("This warranty was already claimed");
      return;
    }
    claimWarranty(warranty.id);
    setViewing(null);
    showToast(`${warranty.id} marked as claimed`);
  }

  function handleDelete() {
    if (!deleting) return;
    deleteRecord("warranties", deleting.id);
    setDeleting(null);
    showToast("Warranty deleted");
  }

  return (
    <div className="fade-in space-y-5">
      <div className="flex justify-between items-center">
        <p className="text-sm text-slate-500">
          {data.warranties.length} warranty records
        </p>
        <button
          type="button"
          onClick={() => setCreating(true)}
          className={primaryButton}
        >
          <i className="fas fa-plus" /> Register Warranty
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr className="text-left">
                <th className="px-5 py-3.5 font-medium">Warranty ID</th>
                <th className="px-5 py-3.5 font-medium">Product / Serial</th>
                <th className="px-5 py-3.5 font-medium">Customer</th>
                <th className="px-5 py-3.5 font-medium">Status</th>
                <th className="px-5 py-3.5 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pagination.pageItems.map((warranty) => (
                <tr
                  key={warranty.id}
                  className="table-row border-t border-slate-50"
                >
                  <td className="px-5 py-3.5 font-medium text-brand-600">
                    {warranty.id}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="font-medium">{warranty.product}</div>
                    <div className="text-xs text-slate-500 font-mono">
                      {warranty.serial}
                    </div>
                  </td>
                  <td className="px-5 py-3.5">{warranty.customer}</td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`badge ${
                        warranty.status === "active"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {warranty.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => handleClaim(warranty)}
                      className="text-slate-400 hover:text-amber-600 p-1.5"
                      title="Claim"
                    >
                      <i className="fas fa-file-medical" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewing(warranty)}
                      className="text-slate-400 hover:text-brand-600 p-1.5"
                      title="View"
                    >
                      <i className="fas fa-eye" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditing(warranty)}
                      className="text-slate-400 hover:text-brand-600 p-1.5"
                      title="Edit"
                    >
                      <i className="fas fa-edit" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleting(warranty)}
                      className="text-slate-400 hover:text-rose-600 p-1.5"
                      title="Delete"
                    >
                      <i className="fas fa-trash" />
                    </button>
                  </td>
                </tr>
              ))}
              {!data.warranties.length ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-5 py-10 text-center text-slate-500"
                  >
                    No warranty records yet
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
          itemLabel="warranties"
        />
      </div>

      <WarrantyModal open={creating} onClose={() => setCreating(false)} />
      <WarrantyModal
        open={Boolean(editing)}
        warranty={editing}
        onClose={() => setEditing(null)}
      />
      <WarrantyViewModal
        open={Boolean(viewing)}
        warranty={viewing}
        onClose={() => setViewing(null)}
        onClaim={() => {
          if (viewing) handleClaim(viewing);
        }}
      />
      <ConfirmDialog
        open={Boolean(deleting)}
        title="Delete warranty"
        message={`Are you sure you want to delete ${deleting?.id ?? "this warranty"}? This action cannot be undone.`}
        onCancel={() => setDeleting(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
