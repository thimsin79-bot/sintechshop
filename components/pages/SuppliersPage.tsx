"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SupplierModal } from "@/components/modals/SupplierModal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useData } from "@/lib/store";
import { useToast } from "@/lib/toast";
import { primaryButton } from "@/lib/styles";
import { initials } from "@/lib/utils";
import type { Supplier } from "@/lib/types";

export function SuppliersPage() {
  const { data, deleteRecord } = useData();
  const { showToast } = useToast();
  const router = useRouter();
  const [editing, setEditing] = useState<Supplier | null | undefined>(
    undefined,
  );
  const [deleting, setDeleting] = useState<Supplier | null>(null);

  function handleDelete() {
    if (!deleting) return;
    deleteRecord("suppliers", deleting.id);
    setDeleting(null);
    showToast("Supplier deleted");
  }

  return (
    <div className="fade-in space-y-5">
      <div className="flex justify-between items-center">
        <p className="text-sm text-slate-500">
          {data.suppliers.length} suppliers
        </p>
        <button
          type="button"
          onClick={() => setEditing(null)}
          className={primaryButton}
        >
          <i className="fas fa-plus" /> Add Supplier
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {data.suppliers.map((supplier) => (
          <div
            key={supplier.id}
            className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm card-hover"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center text-lg font-bold">
                  {initials(supplier.name)}
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">
                    {supplier.name}
                  </h3>
                  <p className="text-xs text-slate-500">{supplier.city}</p>
                </div>
              </div>
              <span
                className={`badge ${
                  supplier.status === "active"
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                {supplier.status}
              </span>
            </div>
            <div className="mt-4 space-y-2 text-sm">
              <p className="flex items-center gap-2 text-slate-600">
                <i className="fas fa-user w-4 text-slate-400" />
                {supplier.contact}
              </p>
              <p className="flex items-center gap-2 text-slate-600">
                <i className="fas fa-envelope w-4 text-slate-400" />
                {supplier.email}
              </p>
              <p className="flex items-center gap-2 text-slate-600">
                <i className="fas fa-phone w-4 text-slate-400" />
                {supplier.phone}
              </p>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                {supplier.products} linked products
              </span>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => router.push("/purchasing")}
                  className="text-xs text-brand-600 font-medium hover:underline"
                >
                  Orders
                </button>
                <button
                  type="button"
                  onClick={() => setEditing(supplier)}
                  className="text-xs text-slate-500 hover:text-brand-600"
                  title="Edit"
                >
                  <i className="fas fa-edit" />
                </button>
                <button
                  type="button"
                  onClick={() => setDeleting(supplier)}
                  className="text-xs text-slate-500 hover:text-rose-600"
                  title="Delete"
                >
                  <i className="fas fa-trash" />
                </button>
              </div>
            </div>
          </div>
        ))}
        {!data.suppliers.length ? (
          <p className="text-sm text-slate-500">No suppliers yet.</p>
        ) : null}
      </div>

      <SupplierModal
        open={editing !== undefined}
        supplier={editing ?? null}
        onClose={() => setEditing(undefined)}
      />
      <ConfirmDialog
        open={Boolean(deleting)}
        title="Delete supplier"
        message={`Are you sure you want to delete ${deleting?.name ?? "this supplier"}? This action cannot be undone.`}
        onCancel={() => setDeleting(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
