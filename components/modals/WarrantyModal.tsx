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
import { validateWarranty } from "@/lib/validation";
import { inputClass } from "@/lib/styles";
import { nextCode } from "@/lib/utils";
import type { Warranty, WarrantyDraft } from "@/lib/types";

interface WarrantyModalProps {
  open: boolean;
  warranty?: Warranty | null;
  onClose: () => void;
}

export function WarrantyModal({
  open,
  warranty,
  onClose,
}: WarrantyModalProps) {
  const { data, saveWarranty } = useData();
  const { showToast } = useToast();
  const { values, errors, formError, setValue, reset, submit } =
    useForm<WarrantyDraft>(
      {
        product: data.products[0]?.name ?? "",
        serial: "",
        customer: data.customers[0]?.name ?? "",
      },
      validateWarranty,
    );

  useEffect(() => {
    if (!open) return;
    if (warranty) {
      reset({
        product: warranty.product,
        serial: warranty.serial,
        customer: warranty.customer,
      });
      return;
    }

    reset({
      product: data.products[0]?.name ?? "",
      serial: "",
      customer: data.customers[0]?.name ?? "",
    });
  }, [open, warranty, data.products, data.customers, reset]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    submit(event, (draft) => {
      saveWarranty(draft, warranty?.id ?? null);
      showToast(warranty ? "Warranty updated" : "Warranty registered");
      onClose();
    });
  }

  return (
    <Modal open={open} onClose={onClose}>
      <div className="p-6">
        <ModalHeader
          title={warranty ? "Edit Warranty" : "Register Warranty"}
          subtitle={warranty ? warranty.id : nextCode("WR-", data.warranties)}
          onClose={onClose}
        />
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <FormField label="Product" required error={errors.product}>
            <select
              value={values.product}
              onChange={(event) => setValue("product", event.target.value)}
              className={inputClass}
            >
              {data.products.map((product) => (
                <option key={product.id} value={product.name}>
                  {product.name}
                </option>
              ))}
            </select>
          </FormField>
          <FormField label="Serial Number" required error={errors.serial}>
            <input
              value={values.serial}
              onChange={(event) => setValue("serial", event.target.value)}
              className={inputClass}
              placeholder="e.g. NV-4090-A8F29C"
            />
          </FormField>
          <FormField label="Customer" required error={errors.customer}>
            <select
              value={values.customer}
              onChange={(event) => setValue("customer", event.target.value)}
              className={inputClass}
            >
              {data.customers.map((customer) => (
                <option key={customer.id} value={customer.name}>
                  {customer.name}
                </option>
              ))}
            </select>
          </FormField>
          <FormError message={formError} />
          <FormActions
            onCancel={onClose}
            submitLabel={warranty ? "Save Changes" : "Register Warranty"}
          />
        </form>
      </div>
    </Modal>
  );
}
