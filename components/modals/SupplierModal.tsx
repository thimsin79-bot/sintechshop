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
import { validateSupplier } from "@/lib/validation";
import { inputClass } from "@/lib/styles";
import type { Supplier, SupplierDraft } from "@/lib/types";

interface SupplierModalProps {
  open: boolean;
  supplier?: Supplier | null;
  onClose: () => void;
}

const emptySupplier: SupplierDraft = {
  name: "",
  contact: "",
  email: "",
  phone: "",
  city: "",
  status: "active",
};

export function SupplierModal({ open, supplier, onClose }: SupplierModalProps) {
  const { data, saveSupplier } = useData();
  const { showToast } = useToast();
  const { values, errors, formError, setValue, reset, submit } =
    useForm<SupplierDraft>(emptySupplier, (draft) =>
      validateSupplier(draft, data.suppliers, supplier?.id ?? null),
    );

  useEffect(() => {
    if (!open) return;
    reset(
      supplier
        ? {
            name: supplier.name,
            contact: supplier.contact,
            email: supplier.email,
            phone: supplier.phone,
            city: supplier.city,
            status: supplier.status,
          }
        : emptySupplier,
    );
  }, [open, supplier, reset]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    submit(event, (draft) => {
      saveSupplier(draft, supplier?.id ?? null);
      showToast(supplier ? "Supplier updated" : "Supplier added");
      onClose();
    });
  }

  return (
    <Modal open={open} onClose={onClose}>
      <div className="p-6">
        <ModalHeader
          title={supplier ? "Edit Supplier" : "Add Supplier"}
          onClose={onClose}
        />
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <FormField label="Company Name" required error={errors.name}>
            <input
              value={values.name}
              onChange={(event) => setValue("name", event.target.value)}
              className={inputClass}
              placeholder="TechDistributors Inc."
            />
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Contact Person">
              <input
                value={values.contact}
                onChange={(event) => setValue("contact", event.target.value)}
                className={inputClass}
              />
            </FormField>
            <FormField label="City">
              <input
                value={values.city}
                onChange={(event) => setValue("city", event.target.value)}
                className={inputClass}
              />
            </FormField>
          </div>
          <FormField label="Email" error={errors.email}>
            <input
              type="email"
              value={values.email}
              onChange={(event) => setValue("email", event.target.value)}
              className={inputClass}
            />
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Phone" error={errors.phone}>
              <input
                value={values.phone}
                onChange={(event) => setValue("phone", event.target.value)}
                className={inputClass}
              />
            </FormField>
            <FormField label="Status">
              <select
                value={values.status}
                onChange={(event) =>
                  setValue(
                    "status",
                    event.target.value as SupplierDraft["status"],
                  )
                }
                className={inputClass}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </FormField>
          </div>
          <FormError message={formError} />
          <FormActions
            onCancel={onClose}
            submitLabel={supplier ? "Save Changes" : "Save Supplier"}
          />
        </form>
      </div>
    </Modal>
  );
}
