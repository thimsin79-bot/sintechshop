import { Suspense } from "react";
import { ProductsPage } from "@/components/pages/ProductsPage";

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="p-10 text-center text-sm text-slate-500">
          Loading products…
        </div>
      }
    >
      <ProductsPage />
    </Suspense>
  );
}
