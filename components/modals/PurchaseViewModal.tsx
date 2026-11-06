"use client";

import { Modal } from "@/components/ui/Modal";
import { ModalHeader } from "@/components/ui/ModalHeader";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Purchase } from "@/lib/types";

interface PurchaseViewModalProps {
  open: boolean;
  purchase: Purchase | null;
  onClose: () => void;
  onReceive: () => void;
}

export function PurchaseViewModal({
  open,
  purchase,
  onClose,
  onReceive,
}: PurchaseViewModalProps) {
  if (!purchase) return null;

  return (
    <Modal open={open} onClose={onClose}>
      <div className="p-6">
        <ModalHeader
          title="Purchase Order"
          subtitle={purchase.id}
          onClose={onClose}
        />
        <div className="space-y-3 text-sm">
          <Row label="Supplier" value={purchase.supplier} />
          <Row label="Date" value={formatDate(purchase.date)} />
          <Row label="Items" value={String(purchase.items)} />
          <Row label="Total" value={formatCurrency(purchase.total)} strong />
          <div className="flex justify-between">
            <span className="text-slate-500">Status</span>
            <span className="badge bg-slate-100 text-slate-600">
              {purchase.status}
            </span>
          </div>
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
            onClick={onReceive}
            className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg"
          >
            Mark Received
          </button>
        </div>
      </div>
    </Modal>
  );
}

function Row({
  label,
  value,
  strong,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div className="flex justify-between border-b border-slate-100 pb-2">
      <span className="text-slate-500">{label}</span>
      <span className={strong ? "font-semibold" : ""}>{value}</span>
    </div>
  );
}
