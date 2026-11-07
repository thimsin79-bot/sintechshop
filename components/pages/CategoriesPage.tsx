"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CategoryModal } from "@/components/modals/CategoryModal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Pagination } from "@/components/ui/Pagination";
import { useData } from "@/lib/store";
import { useToast } from "@/lib/toast";
import { usePagination } from "@/lib/pagination";
import { primaryButton } from "@/lib/styles";
import type { Category } from "@/lib/types";

export function CategoriesPage() {
  const { data, deleteRecord } = useData();
  const { showToast } = useToast();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<Category | null | undefined>(
    undefined,
  );
  const [deleting, setDeleting] = useState<Category | null>(null);

  const filtered = data.categories.filter((category) => {
    const q = query.trim().toLowerCase();
    return (
      !q ||
      category.name.toLowerCase().includes(q) ||
      category.description.toLowerCase().includes(q)
    );
  });
  const pagination = usePagination(
    filtered,
    10,
    query.trim().toLowerCase(),
  );

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative">
          <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
          <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search categories..."
            className="pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 w-64 bg-white"
          />
        </div>
        <button
          type="button"
          onClick={() => setEditing(null)}
          className={primaryButton}
        >
          <i className="fas fa-plus" /> Add Category
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-semibold">Category List</h3>
          <span className="text-xs text-slate-500">
            {filtered.length} categor{filtered.length !== 1 ? "ies" : "y"}
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr className="text-left">
                <th className="px-5 py-3.5 font-medium">Category</th>
                <th className="px-5 py-3.5 font-medium">Description</th>
                <th className="px-5 py-3.5 font-medium">Products</th>
                <th className="px-5 py-3.5 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pagination.pageItems.map((category) => (
                <tr
                  key={category.id}
                  className="table-row border-t border-slate-50"
                >
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center">
                        <i className="fas fa-tag text-sm" />
                      </div>
                      <span className="font-medium">{category.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-slate-500 max-w-md">
                    {category.description || "—"}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="badge bg-slate-100 text-slate-600">
                      {countFor(category.name)} products
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() =>
                        router.push(
                          `/products?category=${encodeURIComponent(category.name)}`,
                        )
                      }
                      className="text-xs text-brand-600 font-medium hover:underline mr-3"
                    >
                      View products
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditing(category)}
                      className="text-slate-400 hover:text-brand-600 p-1.5"
                      title="Edit"
                    >
                      <i className="fas fa-edit" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleting(category)}
                      className="text-slate-400 hover:text-rose-600 p-1.5"
                      title="Delete"
                    >
                      <i className="fas fa-trash" />
                    </button>
                  </td>
                </tr>
              ))}
              {!filtered.length ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-5 py-10 text-center text-slate-500"
                  >
                    No categories match your search.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
        <Pagination
          page={pagination.page}
          totalPages={pagination.totalPages}
          totalItems={pagination.totalItems}
          startIndex={pagination.startIndex}
          endIndex={pagination.endIndex}
          onPageChange={pagination.goToPage}
          itemLabel="categories"
        />
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
