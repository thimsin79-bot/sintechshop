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
import { validateCustomer } from "@/lib/validation";
import { inputClass } from "@/lib/styles";
import type { Customer, CustomerDraft } from "@/lib/types";

interface CustomerModalProps {
  open: boolean;
  customer?: Customer | null;
  onClose: () => void;
}

const emptyCustomer: CustomerDraft = {
  name: "",
  email: "",
  phone: "",
  type: "retail",
};

export function CustomerModal({ open, customer, onClose }: CustomerModalProps) {
  const { data, saveCustomer } = useData();
  const { showToast } = useToast();
  const { values, errors, formError, setValue, reset, submit } =
    useForm<CustomerDraft>(emptyCustomer, (draft) =>
      validateCustomer(draft, data.customers, customer?.id ?? null),
    );

  useEffect(() => {
    if (!open) return;
    reset(
      customer
        ? {
            name: customer.name,
            email: customer.email,
            phone: customer.phone,
            type: customer.type,
          }
        : emptyCustomer,
    );
  }, [open, customer, reset]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    submit(event, (draft) => {
      saveCustomer(draft, customer?.id ?? null);
      showToast(customer ? "Customer updated" : "Customer added");
      onClose();
    });
  }

  return (
    <Modal open={open} onClose={onClose}>
      <div className="p-6">
        <ModalHeader
          title={customer ? "Edit Customer" : "Add Customer"}
          onClose={onClose}
        />
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <FormField label="Name" required error={errors.name}>
            <input
              value={values.name}
              onChange={(event) => setValue("name", event.target.value)}
              className={inputClass}
              placeholder="Full name or company"
            />
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Email" error={errors.email}>
              <input
                type="email"
                value={values.email}
                onChange={(event) => setValue("email", event.target.value)}
                className={inputClass}
              />
            </FormField>
            <FormField label="Phone" error={errors.phone}>
              <input
                value={values.phone}
                onChange={(event) => setValue("phone", event.target.value)}
                className={inputClass}
              />
            </FormField>
          </div>
          <FormField label="Type">
            <select
              value={values.type}
              onChange={(event) =>
                setValue("type", event.target.value as CustomerDraft["type"])
              }
              className={inputClass}
            >
              <option value="retail">Retail</option>
              <option value="wholesale">Wholesale</option>
            </select>
          </FormField>
          <FormError message={formError} />
          <FormActions
            onCancel={onClose}
            submitLabel={customer ? "Save Changes" : "Save Customer"}
          />
        </form>
      </div>
    </Modal>
  );
}
