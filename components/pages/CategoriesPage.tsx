"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CategoryModal } from "@/components/modals/CategoryModal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useData } from "@/lib/store";
import { useToast } from "@/lib/toast";
import { primaryButton } from "@/lib/styles";
import type { Category } from "@/lib/types";

export function CategoriesPage() {
  const { data, deleteRecord } = useData();
  const { showToast } = useToast();
  const router = useRouter();
  const [editing, setEditing] = useState<Category | null | undefined>(
    undefined,
  );
  const [deleting, setDeleting] = useState<Category | null>(null);

  function countFor(name: string) {
    return data.products.filter((product) => product.category === name).length;
  }

  function handleDelete() {
    if (!deleting) return;
    deleteRecord("categories", deleting.id);
    setDeleting(null);
    showToast("Category deleted");
  }

  return (
    <div className="fade-in space-y-5">
      <div className="flex justify-between items-center">
        <p className="text-sm text-slate-500">
          {data.categories.length} categories
        </p>
        <button
          type="button"
          onClick={() => setEditing(null)}
          className={primaryButton}
        >
          <i className="fas fa-plus" /> Add Category
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {data.categories.map((category) => (
          <div
            key={category.id}
            className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm card-hover"
          >
            <div className="flex items-start justify-between">
              <div className="w-11 h-11 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center text-lg">
                <i className="fas fa-tag" />
              </div>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => setEditing(category)}
                  className="text-slate-400 hover:text-brand-600 p-1"
                  title="Edit"
                >
                  <i className="fas fa-edit text-sm" />
                </button>
                <button
                  type="button"
                  onClick={() => setDeleting(category)}
                  className="text-slate-400 hover:text-rose-600 p-1"
                  title="Delete"
                >
                  <i className="fas fa-trash text-sm" />
                </button>
              </div>
            </div>
            <h3 className="font-semibold mt-4 text-slate-900">
              {category.name}
            </h3>
            <p className="text-sm text-slate-500 mt-1">
              {category.description}
            </p>
            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                {countFor(category.name)} products
              </span>
              <button
                type="button"
                onClick={() =>
                  router.push(
                    `/products?category=${encodeURIComponent(category.name)}`,
                  )
                }
                className="text-xs text-brand-600 font-medium hover:underline"
              >
                View products →
              </button>
            </div>
          </div>
        ))}
        {!data.categories.length ? (
          <p className="text-sm text-slate-500">No categories yet.</p>
        ) : null}
      </div>

      <CategoryModal
        open={editing !== undefined}
        category={editing ?? null}
        onClose={() => setEditing(undefined)}
      />
      <ConfirmDialog
        open={Boolean(deleting)}
        title="Delete category"
        message={`Are you sure you want to delete ${deleting?.name ?? "this category"}? This action cannot be undone.`}
        onCancel={() => setDeleting(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
