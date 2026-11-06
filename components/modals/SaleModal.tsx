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
import { validateSale } from "@/lib/validation";
import { inputClass } from "@/lib/styles";
import { formatCurrency, nextCode, todayISO } from "@/lib/utils";
import type { PaymentMethod, SaleDraft } from "@/lib/types";

interface SaleModalProps {
  open: boolean;
  onClose: () => void;
}

export function SaleModal({ open, onClose }: SaleModalProps) {
  const { data, createSale } = useData();
  const { showToast } = useToast();
  const { values, errors, formError, setValue, setFormError, reset, submit } =
    useForm<SaleDraft>(
      {
        customerId: data.customers[0]?.id ?? 0,
        productId: data.products[0]?.id ?? 0,
        qty: 1,
        payment: "card",
        date: todayISO(),
      },
      (draft) => validateSale(draft, data.products, data.customers),
    );

  useEffect(() => {
    if (!open) return;
    reset({
      customerId: data.customers[0]?.id ?? 0,
      productId: data.products[0]?.id ?? 0,
      qty: 1,
      payment: "card",
      date: todayISO(),
    });
  }, [open, data.customers, data.products, reset]);

  const product = data.products.find((item) => item.id === values.productId);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    submit(event, (draft) => {
      const error = createSale(draft);
      if (error) {
        setFormError(error);
        return;
      }
      showToast(`Sale ${nextCode("INV-", data.sales)} completed`);
      onClose();
    });
  }

  return (
    <Modal open={open} onClose={onClose}>
      <div className="p-6">
        <ModalHeader
          title="New Sale"
          subtitle={nextCode("INV-", data.sales)}
          onClose={onClose}
        />
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <FormField label="Customer" required error={errors.customerId}>
            <select
              value={values.customerId}
              onChange={(event) =>
                setValue("customerId", Number(event.target.value))
              }
              className={inputClass}
            >
              {data.customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.name}
                </option>
              ))}
            </select>
          </FormField>
          <FormField label="Product" required error={errors.productId}>
            <select
              value={values.productId}
              onChange={(event) =>
                setValue("productId", Number(event.target.value))
              }
              className={inputClass}
            >
              {data.products.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name} — {formatCurrency(item.price)} ({item.stock} in
                  stock)
                </option>
              ))}
            </select>
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Quantity" required error={errors.qty}>
              <input
                type="number"
                min={1}
                value={values.qty}
                onChange={(event) =>
                  setValue("qty", Number(event.target.value))
                }
                className={inputClass}
              />
            </FormField>
            <FormField label="Payment Method">
              <select
                value={values.payment}
                onChange={(event) =>
                  setValue("payment", event.target.value as PaymentMethod)
                }
                className={inputClass}
              >
                <option value="card">Card</option>
                <option value="cash">Cash</option>
                <option value="transfer">Bank Transfer</option>
              </select>
            </FormField>
          </div>
          <FormField label="Sale Date" required error={errors.date}>
            <input
              type="date"
              value={values.date}
              onChange={(event) => setValue("date", event.target.value)}
              className={inputClass}
            />
          </FormField>
          {product ? (
            <p className="text-xs text-slate-500">
              Line total:{" "}
              <span className="font-semibold text-slate-700">
                {formatCurrency(product.price * Math.max(values.qty, 0))}
              </span>
            </p>
          ) : null}
          <FormError message={formError} />
          <FormActions onCancel={onClose} submitLabel="Complete Sale" />
        </form>
      </div>
    </Modal>
  );
}
