"use client";

import { Modal } from "@/components/ui/Modal";
import { useCompany } from "@/lib/company";
import { formatCurrency } from "@/lib/utils";
import type { Sale } from "@/lib/types";

interface SaleInvoiceModalProps {
  open: boolean;
  sale: Sale | null;
  onClose: () => void;
}

export function SaleInvoiceModal({
  open,
  sale,
  onClose,
}: SaleInvoiceModalProps) {
  const { profile } = useCompany();

  if (!sale) return null;

  const contactLine = [profile.email, profile.phone]
    .filter(Boolean)
    .join(" · ");

  return (
    <Modal open={open} onClose={onClose} printable className="max-w-2xl">
      <div className="p-8">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div className="flex items-start gap-3 min-w-0">
            {profile.logo ? (
              <img
                src={profile.logo}
                alt={`${profile.name} logo`}
                className="w-11 h-11 rounded-lg object-contain bg-white border border-slate-100 shrink-0"
              />
            ) : (
              <div className="w-11 h-11 rounded-lg bg-brand-600 text-white flex items-center justify-center shrink-0">
                <i className="fas fa-laptop" />
              </div>
            )}
            <div className="min-w-0">
              <p className="font-bold text-lg truncate">{profile.name}</p>
              {profile.address ? (
                <p className="text-xs text-slate-500 mt-1 whitespace-pre-line">
                  {profile.address}
                </p>
              ) : null}
              {contactLine ? (
                <p className="text-xs text-slate-500 mt-1">{contactLine}</p>
              ) : null}
              {profile.website ? (
                <p className="text-xs text-slate-500 mt-1">
                  {profile.website}
                </p>
              ) : null}
              {profile.taxId ? (
                <p className="text-xs text-slate-500 mt-1">
                  Tax ID: {profile.taxId}
                </p>
              ) : null}
            </div>
          </div>
          <div className="text-right shrink-0">
            <p className="text-xs text-slate-500 uppercase tracking-wide">
              Invoice
            </p>
            <p className="font-bold">{sale.id}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm border-t border-b border-slate-100 py-4 mb-4">
          <div>
            <p className="text-xs text-slate-500">Billed To</p>
            <p className="font-medium">{sale.customer}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-500">Payment</p>
            <p className="font-medium capitalize">{sale.payment}</p>
          </div>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-slate-500 border-b border-slate-100">
              <th className="pb-2 font-medium">Description</th>
              <th className="pb-2 font-medium text-center">Qty</th>
              <th className="pb-2 font-medium text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-slate-50">
              <td className="py-3">Items purchased</td>
              <td className="py-3 text-center">{sale.items}</td>
              <td className="py-3 text-right">{formatCurrency(sale.total)}</td>
            </tr>
          </tbody>
        </table>
        <div className="flex justify-end mt-4">
          <div className="w-52 text-sm">
            <div className="flex justify-between font-semibold text-base pt-2 border-t border-slate-200">
              <span>Total</span>
              <span>{formatCurrency(sale.total)}</span>
            </div>
          </div>
        </div>
        <p className="text-xs text-slate-400 mt-8 text-center">
          Thank you for shopping with {profile.name}.
        </p>
        <div className="no-print flex justify-end gap-3 pt-5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
          >
            Close
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="px-4 py-2 text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 rounded-lg"
          >
            <i className="fas fa-print mr-1" /> Print
          </button>
        </div>
      </div>
    </Modal>
  );
}
