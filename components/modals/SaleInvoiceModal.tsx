"use client";

import { Modal } from "@/components/ui/Modal";
import { formatCurrency, formatDate } from "@/lib/utils";
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
  if (!sale) return null;

  return (
    <Modal open={open} onClose={onClose} printable className="max-w-2xl">
      <div className="p-8">
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-brand-600 text-white flex items-center justify-center">
                <i className="fas fa-laptop" />
              </div>
              <span className="font-bold text-lg">TechVault</span>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Computer Shop Inventory
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-500 uppercase tracking-wide">
              Invoice
            </p>
            <p className="font-bold">{sale.id}</p>
            <p className="text-xs text-slate-500 mt-1">
              {formatDate(sale.date)}
            </p>
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
          Thank you for shopping with TechVault.
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
