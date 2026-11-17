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
import { applyDiscount, formatCurrency, nextCode } from "@/lib/utils";
import type { PaymentMethod, Sale, SaleDraft } from "@/lib/types";

interface SaleModalProps {
  open: boolean;
  onClose: () => void;
  sale?: Sale | null;
}

export function SaleModal({ open, onClose, sale }: SaleModalProps) {
  const { data, createSale, updateSale } = useData();
  const { showToast } = useToast();
  const availableProducts = sale
    ? data.products.map((item) =>
        item.id === sale.productId
          ? { ...item, stock: item.stock + sale.items }
          : item,
      )
    : data.products;
  const { values, errors, formError, setValue, setFormError, reset, submit } =
    useForm<SaleDraft>(
      {
        customerId: data.customers[0]?.id ?? 0,
        productId: data.products[0]?.id ?? 0,
        qty: 1,
        discount: 0,
        payment: "card",
      },
      (draft) => validateSale(draft, availableProducts, data.customers),
    );

  useEffect(() => {
    if (!open) return;
    if (sale) {
      reset({
        customerId:
          sale.customerId ??
          data.customers.find((item) => item.name === sale.customer)?.id ??
          data.customers[0]?.id ??
          0,
        productId:
          sale.productId ??
          data.products.find(
            (item) => item.name === (sale.productName || sale.product),
          )?.id ??
          data.products[0]?.id ??
          0,
        qty: sale.items,
        discount: sale.discount ?? 0,
        payment: sale.payment,
      });
      return;
    }
    reset({
      customerId: data.customers[0]?.id ?? 0,
      productId: data.products[0]?.id ?? 0,
      qty: 1,
      discount: 0,
      payment: "card",
    });
  }, [open, sale, data.customers, data.products, reset]);

  const product = data.products.find((item) => item.id === values.productId);
  const subtotal = product ? product.price * Math.max(values.qty, 0) : 0;
  const discountedTotal = applyDiscount(subtotal, values.discount);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    submit(event, (draft) => {
      const error = sale ? updateSale(sale.id, draft) : createSale(draft);
      if (error) {
        setFormError(error);
        return;
      }
      showToast(
        sale
          ? `Sale ${sale.id} updated`
          : `Sale ${nextCode("INV-", data.sales)} completed`,
      );
      onClose();
    });
  }

  return (
    <Modal open={open} onClose={onClose}>
      <div className="p-6">
        <ModalHeader
          title={sale ? "Edit Sale" : "New Sale"}
          subtitle={sale ? sale.id : nextCode("INV-", data.sales)}
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
              {data.customers.length ? (
                data.customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name}
                  </option>
                ))
              ) : (
                <option value={0}>No customers available</option>
              )}
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
              {availableProducts.length ? (
                availableProducts.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name} — {formatCurrency(item.price)} ({item.stock} in
                    stock)
                  </option>
                ))
              ) : (
                <option value={0}>No products available</option>
              )}
            </select>
          </FormField>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
            <FormField label="Discount (%)" error={errors.discount}>
              <input
                type="number"
                min={0}
                max={100}
                step={0.01}
                value={values.discount}
                onChange={(event) =>
                  setValue("discount", Number(event.target.value))
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
          {product ? (
            <div className="rounded-xl bg-slate-50 p-3 text-xs space-y-1.5">
              <div className="flex justify-between text-slate-500">
                <span>Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              {discountedTotal < subtotal ? (
                <div className="flex justify-between text-slate-500">
                  <span>Discount ({values.discount}%)</span>
                  <span className="text-emerald-600">
                    -{formatCurrency(subtotal - discountedTotal)}
                  </span>
                </div>
              ) : null}
              <div className="flex justify-between border-t border-slate-200 pt-1.5 font-semibold text-slate-700">
                <span>Total</span>
                <span>{formatCurrency(discountedTotal)}</span>
              </div>
            </div>
          ) : null}
          <FormError message={formError} />
          <FormActions
            onCancel={onClose}
            submitLabel={sale ? "Save Changes" : "Complete Sale"}
          />
        </form>
      </div>
    </Modal>
  );
}
