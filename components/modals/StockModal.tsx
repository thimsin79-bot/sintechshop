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
import { validateStockMovement } from "@/lib/validation";
import { inputClass } from "@/lib/styles";
import type {
  StockMovement,
  StockMovementDraft,
  StockMovementType,
} from "@/lib/types";

interface StockModalProps {
  open: boolean;
  type?: StockMovementType;
  movement?: StockMovement | null;
  onClose: () => void;
}

interface StockForm {
  type: StockMovementType;
  productId: number;
  qty: number;
  ref: string;
  user: string;
  notes: string;
}

export function StockModal({
  open,
  type = "in",
  movement,
  onClose,
}: StockModalProps) {
  const { data, recordStock, updateStockMovement } = useData();
  const { showToast } = useToast();
  const { values, errors, formError, setValue, setFormError, reset, submit } =
    useForm<StockForm>(
      {
        type,
        productId: data.products[0]?.id ?? 0,
        qty: 1,
        ref: "",
        user: "Admin",
        notes: "",
      },
      (draft) =>
        validateStockMovement(
          {
            type: draft.type,
            productId: draft.productId,
            qty: draft.qty,
            ref: draft.ref,
            user: draft.user,
          },
          data.products,
          movement,
        ),
    );

  const isEdit = Boolean(movement);
  const isIn = values.type === "in";

  useEffect(() => {
    if (!open) return;
    if (movement) {
      const product = data.products.find(
        (item) => item.name === movement.product,
      );
      reset({
        type: movement.type,
        productId: product?.id ?? data.products[0]?.id ?? 0,
        qty: movement.qty,
        ref: movement.ref,
        user: movement.user,
        notes: "",
      });
      return;
    }
    reset({
      type,
      productId: data.products[0]?.id ?? 0,
      qty: 1,
      ref: "",
      user: "Admin",
      notes: "",
    });
  }, [open, movement, type, data.products, reset]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    submit(event, (draft) => {
      const payload: StockMovementDraft = {
        type: draft.type,
        productId: draft.productId,
        qty: draft.qty,
        ref: draft.ref,
        user: draft.user,
      };
      const error =
        isEdit && movement
          ? updateStockMovement(movement.id, payload)
          : recordStock(draft.type, draft.productId, draft.qty, draft.ref);

      if (error) {
        setFormError(error);
        return;
      }

      showToast(
        isEdit
          ? "Stock movement updated"
          : draft.type === "in"
            ? "Stock in recorded"
            : "Stock out recorded",
      );
      onClose();
    });
  }

  return (
    <Modal open={open} onClose={onClose}>
      <div className="p-6">
        <ModalHeader
          title={isEdit ? "Edit Stock Movement" : isIn ? "Stock In" : "Stock Out"}
          subtitle={isEdit ? `Movement #${movement?.id}` : undefined}
          onClose={onClose}
        />
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Product" required error={errors.productId}>
              <select
                value={values.productId}
                onChange={(event) =>
                  setValue("productId", Number(event.target.value))
                }
                className={inputClass}
              >
                {data.products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name} ({product.stock} in stock)
                  </option>
                ))}
              </select>
            </FormField>
            {isEdit ? (
              <FormField label="Type">
                <select
                  value={values.type}
                  onChange={(event) =>
                    setValue(
                      "type",
                      event.target.value as StockMovementType,
                    )
                  }
                  className={inputClass}
                >
                  <option value="in">Stock In</option>
                  <option value="out">Stock Out</option>
                </select>
              </FormField>
            ) : null}
          </div>
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
            <FormField label="Reference">
              <input
                value={values.ref}
                onChange={(event) => setValue("ref", event.target.value)}
                className={inputClass}
                placeholder={isIn ? "PO-XXXX" : "INV-XXXX"}
              />
            </FormField>
          </div>
          {isEdit ? (
            <FormField label="User">
              <input
                value={values.user}
                onChange={(event) => setValue("user", event.target.value)}
                className={inputClass}
                placeholder="Admin"
              />
            </FormField>
          ) : null}
          <FormField label="Notes">
            <textarea
              rows={2}
              value={values.notes}
              onChange={(event) => setValue("notes", event.target.value)}
              className={inputClass}
              placeholder="Optional notes..."
            />
          </FormField>
          <FormError message={formError} />
          <FormActions
            onCancel={onClose}
            submitLabel={
              isEdit
                ? "Save Changes"
                : isIn
                  ? "Confirm Stock In"
                  : "Confirm Stock Out"
            }
            variant={isIn ? "success" : "danger"}
          />
        </form>
      </div>
    </Modal>
  );
}
