"use client";

import { Modal } from "@/components/ui/Modal";
import { ModalHeader } from "@/components/ui/ModalHeader";
import { formatCurrency } from "@/lib/utils";
import type { Customer, Sale } from "@/lib/types";

interface CustomerViewModalProps {
  open: boolean;
  customer: Customer | null;
  sales: Sale[];
  onClose: () => void;
  onEdit: () => void;
}

export function CustomerViewModal({
  open,
  customer,
  sales,
  onClose,
  onEdit,
}: CustomerViewModalProps) {
  if (!customer) return null;

  return (
    <Modal open={open} onClose={onClose}>
      <div className="p-6">
        <ModalHeader
          title={customer.name}
          subtitle={
            customer.type === "wholesale"
              ? "Wholesale customer"
              : "Retail customer"
          }
          onClose={onClose}
        />
        <div className="grid grid-cols-2 gap-3 mb-5 text-sm">
          <Info label="Email" value={customer.email || "—"} />
          <Info label="Phone" value={customer.phone || "—"} />
          <Info label="Orders" value={String(customer.orders)} />
          <Info label="Total Spent" value={formatCurrency(customer.spent)} />
        </div>
        <h4 className="font-semibold text-sm mb-2">Recent Invoices</h4>
        <div className="space-y-2">
          {sales.slice(0, 5).map((sale) => (
            <div
              key={sale.id}
              className="flex items-center justify-between p-3 bg-slate-50 rounded-xl text-sm"
            >
              <div>
                <p className="font-medium text-brand-600">{sale.id}</p>
                <p className="text-xs text-slate-500">
                  {sale.items} items
                </p>
              </div>
              <span className="font-semibold">
                {formatCurrency(sale.total)}
              </span>
            </div>
          ))}
          {!sales.length ? (
            <p className="text-sm text-slate-500">
              No invoices for this customer yet.
            </p>
          ) : null}
        </div>
        <div className="flex justify-end gap-3 pt-5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
          >
            Close
          </button>
          <button
            type="button"
            onClick={onEdit}
            className="px-4 py-2 text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 rounded-lg"
          >
            Edit Customer
          </button>
        </div>
      </div>
    </Modal>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-slate-50 rounded-xl p-3">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="font-medium truncate">{value}</p>
    </div>
  );
}
