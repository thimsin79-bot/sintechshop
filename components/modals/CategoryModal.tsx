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
import { validateCategory } from "@/lib/validation";
import { inputClass } from "@/lib/styles";
import type { Category, CategoryDraft } from "@/lib/types";

interface CategoryModalProps {
  open: boolean;
  category?: Category | null;
  onClose: () => void;
}

const emptyCategory: CategoryDraft = { name: "", description: "" };

export function CategoryModal({ open, category, onClose }: CategoryModalProps) {
  const { data, saveCategory } = useData();
  const { showToast } = useToast();
  const { values, errors, formError, setValue, reset, submit } =
    useForm<CategoryDraft>(emptyCategory, (draft) =>
      validateCategory(draft, data.categories, category?.id ?? null),
    );

  useEffect(() => {
    if (!open) return;
    reset(
      category
        ? { name: category.name, description: category.description }
        : emptyCategory,
    );
  }, [open, category, reset]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    submit(event, (draft) => {
      saveCategory(draft, category?.id ?? null);
      showToast(category ? "Category updated" : "Category added");
      onClose();
    });
  }

  return (
    <Modal open={open} onClose={onClose}>
      <div className="p-6">
        <ModalHeader
          title={category ? "Edit Category" : "Add Category"}
          onClose={onClose}
        />
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <FormField label="Name" required error={errors.name}>
            <input
              value={values.name}
              onChange={(event) => setValue("name", event.target.value)}
              className={inputClass}
              placeholder="Graphics Cards"
            />
          </FormField>
          <FormField
            label="Description"
            error={errors.description}
            hint="Optional, up to 200 characters"
          >
            <textarea
              rows={3}
              value={values.description}
              onChange={(event) => setValue("description", event.target.value)}
              className={inputClass}
              placeholder="Short description..."
            />
          </FormField>
          <FormError message={formError} />
          <FormActions
            onCancel={onClose}
            submitLabel={category ? "Save Changes" : "Save Category"}
          />
        </form>
      </div>
    </Modal>
  );
}
