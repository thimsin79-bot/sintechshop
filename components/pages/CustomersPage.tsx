"use client";

import { useState } from "react";
import { CustomerModal } from "@/components/modals/CustomerModal";
import { CustomerViewModal } from "@/components/modals/CustomerViewModal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Pagination } from "@/components/ui/Pagination";
import { useData } from "@/lib/store";
import { useToast } from "@/lib/toast";
import { usePagination } from "@/lib/pagination";
import { primaryButton } from "@/lib/styles";
import { formatCurrency, initials } from "@/lib/utils";
import type { Customer } from "@/lib/types";

export function CustomersPage() {
  const { data, deleteRecord } = useData();
  const { showToast } = useToast();
  const [editing, setEditing] = useState<Customer | null | undefined>(
    undefined,
  );
  const [viewing, setViewing] = useState<Customer | null>(null);
  const [deleting, setDeleting] = useState<Customer | null>(null);
  const pagination = usePagination(data.customers, 10);

  const customerSales = viewing
    ? data.sales.filter((sale) => sale.customer === viewing.name)
    : [];

  function handleDelete() {
    if (!deleting) return;
    deleteRecord("customers", deleting.id);
    setDeleting(null);
    showToast("Customer deleted");
  }

  return (
    <div className="fade-in space-y-5">
      <div className="flex justify-between items-center">
        <p className="text-sm text-slate-500">
          {data.customers.length} customers
        </p>
        <button
          type="button"
          onClick={() => setEditing(null)}
          className={primaryButton}
        >
          <i className="fas fa-plus" /> Add Customer
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr className="text-left">
                <th className="px-5 py-3.5 font-medium">Customer</th>
                <th className="px-5 py-3.5 font-medium">Contact</th>
                <th className="px-5 py-3.5 font-medium">Type</th>
                <th className="px-5 py-3.5 font-medium">Orders</th>
                <th className="px-5 py-3.5 font-medium">Total Spent</th>
                <th className="px-5 py-3.5 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pagination.pageItems.map((customer) => (
                <tr
                  key={customer.id}
                  className="table-row border-t border-slate-50"
                >
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-xs font-bold">
                        {initials(customer.name)}
                      </div>
                      <div>
                        <div className="font-medium">{customer.name}</div>
                        <div className="text-xs text-slate-500">
                          {customer.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">{customer.phone}</td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`badge ${
                        customer.type === "wholesale"
                          ? "bg-violet-100 text-violet-700"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {customer.type}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">{customer.orders}</td>
                  <td className="px-5 py-3.5 font-semibold">
                    {formatCurrency(customer.spent)}
                  </td>
                  <td className="px-5 py-3.5 text-right whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => setViewing(customer)}
                      className="text-slate-400 hover:text-brand-600 p-1.5"
                      title="View"
                    >
                      <i className="fas fa-eye" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditing(customer)}
                      className="text-slate-400 hover:text-brand-600 p-1.5"
                      title="Edit"
                    >
                      <i className="fas fa-edit" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleting(customer)}
                      className="text-slate-400 hover:text-rose-600 p-1.5"
                      title="Delete"
                    >
                      <i className="fas fa-trash" />
                    </button>
                  </td>
                </tr>
              ))}
              {!data.customers.length ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-10 text-center text-slate-500"
                  >
                    No customers yet
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
          itemLabel="customers"
        />
      </div>

      <CustomerModal
        open={editing !== undefined}
        customer={editing ?? null}
        onClose={() => setEditing(undefined)}
      />
      <CustomerViewModal
        open={Boolean(viewing)}
        customer={viewing}
        sales={customerSales}
        onClose={() => setViewing(null)}
        onEdit={() => {
          setEditing(viewing);
          setViewing(null);
        }}
      />
      <ConfirmDialog
        open={Boolean(deleting)}
        title="Delete customer"
        message={`Are you sure you want to delete ${deleting?.name ?? "this customer"}? This action cannot be undone.`}
        onCancel={() => setDeleting(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
