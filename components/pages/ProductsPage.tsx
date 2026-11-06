"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ProductModal } from "@/components/modals/ProductModal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Pagination } from "@/components/ui/Pagination";
import { useData } from "@/lib/store";
import { useToast } from "@/lib/toast";
import { usePagination } from "@/lib/pagination";
import { primaryButton } from "@/lib/styles";
import { formatCurrency } from "@/lib/utils";
import type { Product } from "@/lib/types";

export function ProductsPage() {
  const { data, deleteRecord } = useData();
  const { showToast } = useToast();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [editing, setEditing] = useState<Product | null | undefined>(undefined);
  const [deleting, setDeleting] = useState<Product | null>(null);

  useEffect(() => {
    setQuery(searchParams.get("q") ?? "");
    setCategory(searchParams.get("category") ?? "");
  }, [searchParams]);

  const filtered = data.products.filter((product) => {
    const q = query.trim().toLowerCase();
    const matchText =
      !q ||
      `${product.name} ${product.sku} ${product.brand}`
        .toLowerCase()
        .includes(q);
    const matchCategory = !category || product.category === category;
    return matchText && matchCategory;
  });
  const pagination = usePagination(
    filtered,
    10,
    `${query.trim().toLowerCase()}|${category}`,
  );

  function handleDelete() {
    if (!deleting) return;
    deleteRecord("products", deleting.id);
    setDeleting(null);
    showToast("Product deleted");
  }

  return (
    <div className="fade-in space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
            <input
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search products..."
              className="pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 w-64 bg-white"
            />
          </div>
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white"
          >
            <option value="">All Categories</option>
            {data.categories.map((item) => (
              <option key={item.id} value={item.name}>
                {item.name}
              </option>
            ))}
          </select>
        </div>
        <button
          type="button"
          onClick={() => setEditing(null)}
          className={primaryButton}
        >
          <i className="fas fa-plus" /> Add Product
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr className="text-left">
                <th className="px-5 py-3.5 font-medium">SKU / Product</th>
                <th className="px-5 py-3.5 font-medium">Category</th>
                <th className="px-5 py-3.5 font-medium">Stock</th>
                <th className="px-5 py-3.5 font-medium">Cost</th>
                <th className="px-5 py-3.5 font-medium">Price</th>
                <th className="px-5 py-3.5 font-medium">Warranty</th>
                <th className="px-5 py-3.5 font-medium">Status</th>
                <th className="px-5 py-3.5 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pagination.pageItems.map((product) => (
                <tr
                  key={product.id}
                  className="table-row border-t border-slate-50"
                >
                  <td className="px-5 py-3.5">
                    <div className="font-medium text-slate-900">
                      {product.name}
                    </div>
                    <div className="text-xs text-slate-500">{product.sku}</div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="badge bg-slate-100 text-slate-600">
                      {product.category}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`font-semibold ${
                        product.stock <= product.minStock
                          ? "text-amber-600"
                          : "text-slate-800"
                      }`}
                    >
                      {product.stock}
                    </span>
                    <span className="text-xs text-slate-400">
                      {" "}
                      / {product.minStock} min
                    </span>
                  </td>
                  <td className="px-5 py-3.5">{formatCurrency(product.cost)}</td>
                  <td className="px-5 py-3.5 font-medium">
                    {formatCurrency(product.price)}
                  </td>
                  <td className="px-5 py-3.5">{product.warranty} mo</td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`badge ${
                        product.stock <= product.minStock
                          ? "bg-amber-100 text-amber-700"
                          : "bg-emerald-100 text-emerald-700"
                      }`}
                    >
                      {product.stock <= product.minStock
                        ? "Low Stock"
                        : "In Stock"}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => setEditing(product)}
                      className="text-slate-400 hover:text-brand-600 p-1.5"
                      title="Edit"
                    >
                      <i className="fas fa-edit" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleting(product)}
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
                    colSpan={8}
                    className="px-5 py-10 text-center text-slate-500"
                  >
                    No products match your filters.
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
          itemLabel="products"
        />
      </div>

      <ProductModal
        open={editing !== undefined}
        product={editing ?? null}
        onClose={() => setEditing(undefined)}
      />
      <ConfirmDialog
        open={Boolean(deleting)}
        title="Delete product"
        message={`Are you sure you want to delete ${deleting?.name ?? "this product"}? This action cannot be undone.`}
        onCancel={() => setDeleting(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
