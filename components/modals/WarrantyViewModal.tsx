"use client";

import { Modal } from "@/components/ui/Modal";
import { ModalHeader } from "@/components/ui/ModalHeader";
import type { Warranty } from "@/lib/types";

interface WarrantyViewModalProps {
  open: boolean;
  warranty: Warranty | null;
  onClose: () => void;
  onClaim: () => void;
}

export function WarrantyViewModal({
  open,
  warranty,
  onClose,
  onClaim,
}: WarrantyViewModalProps) {
  if (!warranty) return null;

  return (
    <Modal open={open} onClose={onClose}>
      <div className="p-6">
        <ModalHeader
          title="Warranty Details"
          subtitle={warranty.id}
          onClose={onClose}
        />
        <div className="space-y-3 text-sm">
          <Row label="Product" value={warranty.product} />
          <Row label="Serial" value={warranty.serial} mono />
          <Row label="Customer" value={warranty.customer} />
          <div className="flex justify-between">
            <span className="text-slate-500">Status</span>
            <span
              className={`badge ${
                warranty.status === "active"
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-amber-100 text-amber-700"
              }`}
            >
              {warranty.status}
            </span>
          </div>
        </div>
        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-5">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
          >
            Close
          </button>
          {warranty.status === "active" ? (
            <button
              type="button"
              onClick={onClaim}
              className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 rounded-lg"
            >
              File Claim
            </button>
          ) : (
            <span className="w-full sm:w-auto text-center px-4 py-2 text-sm font-medium text-slate-400 bg-slate-100 rounded-lg cursor-not-allowed">
              Claimed
            </span>
          )}
        </div>
      </div>
    </Modal>
  );
}

function Row({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex justify-between gap-4 border-b border-slate-100 pb-2">
      <span className="text-slate-500 shrink-0">{label}</span>
      <span
        className={`text-right min-w-0 truncate ${mono ? "font-mono" : ""}`}
      >
        {value}
      </span>
    </div>
  );
}
