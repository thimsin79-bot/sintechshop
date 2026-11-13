"use client";

import { useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { ModalHeader } from "@/components/ui/ModalHeader";
import { FormActions } from "@/components/forms/FormActions";
import { FormError } from "@/components/forms/FormError";
import { FormField } from "@/components/forms/FormField";
import { useData } from "@/lib/store";
import { useToast } from "@/lib/toast";
import { useForm } from "@/lib/useForm";
import { validatePurchase } from "@/lib/validation";
import { inputClass } from "@/lib/styles";
import { nextPurchaseId } from "@/lib/utils";
import type { Purchase, PurchaseDraft, PurchaseStatus } from "@/lib/types";

interface PurchaseModalProps {
  open: boolean;
  purchase?: Purchase | null;
  onClose: () => void;
}

export function PurchaseModal({
  open,
  purchase,
  onClose,
}: PurchaseModalProps) {
  const { data, createPurchase, updatePurchase } = useData();
  const { showToast } = useToast();
  const availableSuppliers = data.suppliers.filter(
    (supplier) =>
      supplier.status === "active" || supplier.name === purchase?.supplier,
  );
  const { values, errors, formError, setValue, reset, submit } =
    useForm<PurchaseDraft>(
      {
        supplier:
          data.suppliers.find((supplier) => supplier.status === "active")
            ?.name ?? "",
        items: 1,
        total: 0,
        status: "ordered",
      },
      (draft) => validatePurchase(draft, availableSuppliers),
    );

  useEffect(() => {
    if (!open) return;
    reset(
      purchase
        ? {
            supplier: purchase.supplier,
            items: purchase.items,
            total: purchase.total,
            status: purchase.status,
          }
        : {
            supplier:
              data.suppliers.find((supplier) => supplier.status === "active")
                ?.name ?? "",
            items: 1,
            total: 0,
            status: "ordered",
          },
    );
  }, [open, purchase, data.suppliers, reset]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    submit(event, (draft) => {
      if (purchase) {
        updatePurchase(purchase.id, draft);
        showToast("Purchase order updated");
      } else {
        createPurchase(draft);
        showToast("Purchase order created");
      }
      onClose();
    });
  }

  return (
    <Modal open={open} onClose={onClose}>
      <div className="p-6">
        <ModalHeader
          title={purchase ? "Edit Purchase Order" : "New Purchase Order"}
          subtitle={purchase ? purchase.id : nextPurchaseId(data.purchases)}
          onClose={onClose}
        />
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <FormField label="Supplier" required error={errors.supplier}>
            <select
              value={values.supplier}
              onChange={(event) => setValue("supplier", event.target.value)}
              className={inputClass}
            >
              {availableSuppliers.length ? (
                availableSuppliers.map((supplier) => (
                  <option key={supplier.id} value={supplier.name}>
                    {supplier.name}
                  </option>
                ))
              ) : (
                <option value="">No active suppliers</option>
              )}
            </select>
          </FormField>
          <FormField label="Status">
            <select
              value={values.status}
              onChange={(event) =>
                setValue("status", event.target.value as PurchaseStatus)
              }
              className={inputClass}
            >
              <option value="ordered">Ordered</option>
              <option value="partial">Partial</option>
              <option value="received">Received</option>
            </select>
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Items" error={errors.items}>
              <input
                type="number"
                min={1}
                value={values.items}
                onChange={(event) =>
                  setValue("items", Number(event.target.value))
                }
                className={inputClass}
              />
            </FormField>
            <FormField label="Total Cost" error={errors.total}>
              <input
                type="number"
                min={0}
                step="0.01"
                value={values.total}
                onChange={(event) =>
                  setValue("total", Number(event.target.value))
                }
                className={inputClass}
              />
            </FormField>
          </div>
          <FormError message={formError} />
          <FormActions
            onCancel={onClose}
            submitLabel={
              purchase ? "Save Changes" : "Create Purchase Order"
            }
          />
        </form>
      </div>
    </Modal>
  );
}
