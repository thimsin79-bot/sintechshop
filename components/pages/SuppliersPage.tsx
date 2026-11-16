"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SupplierModal } from "@/components/modals/SupplierModal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Pagination } from "@/components/ui/Pagination";
import { useData } from "@/lib/store";
import { useToast } from "@/lib/toast";
import { usePagination } from "@/lib/pagination";
import { primaryButton } from "@/lib/styles";
import { initials } from "@/lib/utils";
import type { Supplier, SupplierStatus } from "@/lib/types";

export function SuppliersPage() {
  const { data, deleteRecord } = useData();
  const { showToast } = useToast();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"" | SupplierStatus>("");
  const [editing, setEditing] = useState<Supplier | null | undefined>(
    undefined,
  );
  const [deleting, setDeleting] = useState<Supplier | null>(null);

  const filtered = data.suppliers.filter((supplier) => {
    const q = query.trim().toLowerCase();
    const matchText =
      !q ||
      supplier.name.toLowerCase().includes(q) ||
      supplier.contact.toLowerCase().includes(q) ||
      supplier.email.toLowerCase().includes(q) ||
      supplier.city.toLowerCase().includes(q);
    const matchStatus = !statusFilter || supplier.status === statusFilter;
    return matchText && matchStatus;
  });
  const pagination = usePagination(
    filtered,
    10,
    `${query.trim().toLowerCase()}|${statusFilter}`,
  );

  function handleDelete() {
    if (!deleting) return;
    deleteRecord("suppliers", deleting.id);
    setDeleting(null);
    showToast("Supplier deleted");
  }

  return (
    <div className="fade-in space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
            <input
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search suppliers..."
              className="pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 w-64 bg-white"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value as "" | SupplierStatus)
            }
            className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white"
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
        <button
          type="button"
          onClick={() => setEditing(null)}
          className={primaryButton}
        >
          <i className="fas fa-plus" /> Add Supplier
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-semibold">Supplier List</h3>
          <span className="text-xs text-slate-500">
            {filtered.length} supplier{filtered.length !== 1 ? "s" : ""}
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr className="text-left">
                <th className="px-5 py-3.5 font-medium">Supplier</th>
                <th className="px-5 py-3.5 font-medium">Contact</th>
                <th className="px-5 py-3.5 font-medium">City</th>
                <th className="px-5 py-3.5 font-medium">Products</th>
                <th className="px-5 py-3.5 font-medium">Status</th>
                <th className="px-5 py-3.5 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pagination.pageItems.map((supplier) => (
                <tr
                  key={supplier.id}
                  className="table-row border-t border-slate-50"
                >
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-xs font-bold">
                        {initials(supplier.name)}
                      </div>
                      <div>
                        <div className="font-medium">{supplier.name}</div>
                        <div className="text-xs text-slate-500">
                          {supplier.contact}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="text-slate-700">{supplier.email}</div>
                    <div className="text-xs text-slate-500">
                      {supplier.phone}
                    </div>
                  </td>
                  <td className="px-5 py-3.5">{supplier.city}</td>
                  <td className="px-5 py-3.5">
                    <span className="badge bg-slate-100 text-slate-600">
                      {supplier.products} linked
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`badge ${
                        supplier.status === "active"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {supplier.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => router.push("/purchasing")}
                      className="text-xs text-brand-600 font-medium hover:underline mr-3"
                    >
                      Orders
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditing(supplier)}
                      className="text-slate-400 hover:text-brand-600 p-1.5"
                      title="Edit"
                    >
                      <i className="fas fa-edit" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleting(supplier)}
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
                    colSpan={6}
                    className="px-5 py-10 text-center text-slate-500"
                  >
                    No suppliers match your search.
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
          itemLabel="suppliers"
        />
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
