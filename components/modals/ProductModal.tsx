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
import { validateProduct } from "@/lib/validation";
import { inputClass } from "@/lib/styles";
import type { Product, ProductDraft } from "@/lib/types";

interface ProductModalProps {
  open: boolean;
  product?: Product | null;
  onClose: () => void;
}

const emptyProduct: ProductDraft = {
  sku: "",
  name: "",
  category: "",
  brand: "",
  cost: 0,
  price: 0,
  stock: 0,
  minStock: 5,
  warranty: 36,
};

export function ProductModal({ open, product, onClose }: ProductModalProps) {
  const { data, saveProduct } = useData();
  const { showToast } = useToast();
  const { values, errors, formError, setValue, reset, submit } =
    useForm<ProductDraft>(
      {
        ...emptyProduct,
        category: data.categories[0]?.name ?? "Uncategorized",
      },
      (draft) => validateProduct(draft, data.products, product?.id ?? null),
    );

  useEffect(() => {
    if (!open) return;
    reset(
      product
        ? {
            sku: product.sku,
            name: product.name,
            category: product.category,
            brand: product.brand,
            cost: product.cost,
            price: product.price,
            stock: product.stock,
            minStock: product.minStock,
            warranty: product.warranty,
          }
        : {
            ...emptyProduct,
            category: data.categories[0]?.name ?? "Uncategorized",
          },
    );
  }, [open, product, data.categories, reset]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    submit(event, (draft) => {
      saveProduct(draft, product?.id ?? null);
      showToast(product ? "Product updated" : "Product added");
      onClose();
    });
  }

  return (
    <Modal open={open} onClose={onClose}>
      <div className="p-6">
        <ModalHeader
          title={product ? "Edit Product" : "Add New Product"}
          subtitle={product ? product.sku : "Create a product in your catalog"}
          onClose={onClose}
        />
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField label="SKU" required error={errors.sku}>
              <input
                value={values.sku}
                onChange={(event) => setValue("sku", event.target.value)}
                className={inputClass}
                placeholder="CPU-XXX-000"
              />
            </FormField>
            <FormField label="Category" required error={errors.category}>
              <select
                value={values.category}
                onChange={(event) => setValue("category", event.target.value)}
                className={inputClass}
              >
                {data.categories.map((category) => (
                  <option key={category.id} value={category.name}>
                    {category.name}
                  </option>
                ))}
              </select>
            </FormField>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Product Name" required error={errors.name}>
              <input
                value={values.name}
                onChange={(event) => setValue("name", event.target.value)}
                className={inputClass}
                placeholder="Full product name"
              />
            </FormField>
            <FormField label="Brand">
              <input
                value={values.brand}
                onChange={(event) => setValue("brand", event.target.value)}
                className={inputClass}
                placeholder="AMD, NVIDIA..."
              />
            </FormField>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <FormField label="Cost" error={errors.cost}>
              <input
                type="number"
                min={0}
                step="0.01"
                value={values.cost}
                onChange={(event) =>
                  setValue("cost", Number(event.target.value))
                }
                className={inputClass}
              />
            </FormField>
            <FormField label="Price" error={errors.price}>
              <input
                type="number"
                min={0}
                step="0.01"
                value={values.price}
                onChange={(event) =>
                  setValue("price", Number(event.target.value))
                }
                className={inputClass}
              />
            </FormField>
            <FormField label="Warranty (mo)" error={errors.warranty}>
              <input
                type="number"
                min={0}
                value={values.warranty}
                onChange={(event) =>
                  setValue("warranty", Number(event.target.value))
                }
                className={inputClass}
              />
            </FormField>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField
              label={product ? "Stock" : "Initial Stock"}
              error={errors.stock}
            >
              <input
                type="number"
                min={0}
                value={values.stock}
                onChange={(event) =>
                  setValue("stock", Number(event.target.value))
                }
                className={inputClass}
              />
            </FormField>
            <FormField label="Min Stock Level" error={errors.minStock}>
              <input
                type="number"
                min={0}
                value={values.minStock}
                onChange={(event) =>
                  setValue("minStock", Number(event.target.value))
                }
                className={inputClass}
              />
            </FormField>
          </div>
          <FormError message={formError} />
          <FormActions
            onCancel={onClose}
            submitLabel={product ? "Save Changes" : "Save Product"}
          />
        </form>
      </div>
    </Modal>
  );
}
