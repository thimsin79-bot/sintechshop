"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useAuth } from "./auth";
import type {
  CategoryDraft,
  CollectionKey,
  CustomerDraft,
  ProductDraft,
  PurchaseDraft,
  SaleDraft,
  ShopData,
  StockMovementDraft,
  SupplierDraft,
  UserDraft,
  WarrantyDraft,
} from "./types";

const emptyData: ShopData = {
  products: [],
  categories: [],
  suppliers: [],
  purchases: [],
  sales: [],
  customers: [],
  warranties: [],
  stockMovements: [],
  users: [],
};

const LEGACY_STORAGE_KEYS = [
  "techvault.data.v1",
  "techvault.session.v1",
  "techvault.accounts.v1",
];

interface StoreContextValue {
  data: ShopData;
  ready: boolean;
  reset: () => void;
  deleteRecord: (collection: CollectionKey, id: number | string) => void;
  saveProduct: (draft: ProductDraft, id?: number | null) => void;
  saveCategory: (draft: CategoryDraft, id?: number | null) => void;
  saveSupplier: (draft: SupplierDraft, id?: number | null) => void;
  createPurchase: (draft: PurchaseDraft) => void;
  updatePurchase: (id: string, draft: PurchaseDraft) => void;
  receivePurchase: (id: string) => void;
  createSale: (draft: SaleDraft) => string | null;
  refundSale: (id: string) => void;
  deleteSale: (id: string) => void;
  saveCustomer: (draft: CustomerDraft, id?: number | null) => void;
  saveWarranty: (draft: WarrantyDraft, id?: string | null) => void;
  claimWarranty: (id: string) => void;
  saveUser: (draft: UserDraft, id?: number | null) => void;
  toggleUserStatus: (id: number) => void;
  recordStock: (
    type: "in" | "out",
    productId: number,
    qty: number,
    ref: string,
  ) => string | null;
  updateStockMovement: (
    id: number,
    draft: StockMovementDraft,
  ) => string | null;
  deleteStockMovement: (id: number) => void;
}

const StoreContext = createContext<StoreContextValue | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  const { user, ready: authReady } = useAuth();
  const [data, setData] = useState<ShopData>(emptyData);
  const [ready, setReady] = useState(false);
  const queue = useRef<Promise<void>>(Promise.resolve());

  const load = useCallback(async () => {
    const response = await fetch("/api/store", { cache: "no-store" });

    if (response.status === 401) {
      setData(emptyData);
      return;
    }

    if (!response.ok) {
      throw new Error(`Unable to load shop data (${response.status})`);
    }

    const body = (await response.json()) as { data?: ShopData };
    if (body.data) setData(body.data);
  }, []);

  useEffect(() => {
    try {
      LEGACY_STORAGE_KEYS.forEach((key) => localStorage.removeItem(key));
    } catch (error) {
      console.warn("Unable to clear legacy browser data.", error);
    }
  }, []);

  useEffect(() => {
    if (!authReady) return;

    if (!user) {
      setData(emptyData);
      setReady(true);
      return;
    }

    let active = true;
    setReady(false);

    load()
      .catch((error) => {
        console.warn("Unable to load shop data.", error);
      })
      .finally(() => {
        if (active) setReady(true);
      });

    return () => {
      active = false;
    };
  }, [authReady, user, load]);

  const dispatch = useCallback(
    (action: string, payload?: Record<string, unknown>) => {
      queue.current = queue.current.then(async () => {
        try {
          const response = await fetch("/api/store", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action, payload }),
          });

          const body = (await response.json().catch(() => ({}))) as {
            data?: ShopData;
            error?: string;
          };

          if (!response.ok) {
            console.warn(body.error ?? "Unable to update shop data.");
            await load().catch(() => undefined);
            return;
          }

          if (body.data) setData(body.data);
        } catch (error) {
          console.warn("Unable to reach the data service.", error);
          await load().catch(() => undefined);
        }
      });
    },
    [load],
  );

  const reset = useCallback(() => {
    dispatch("reset");
  }, [dispatch]);

  const deleteRecord = useCallback(
    (collection: CollectionKey, id: number | string) => {
      dispatch("deleteRecord", { collection, id });
    },
    [dispatch],
  );

  const saveProduct = useCallback(
    (draft: ProductDraft, id?: number | null) => {
      dispatch("saveProduct", { draft, id: id ?? null });
    },
    [dispatch],
  );

  const saveCategory = useCallback(
    (draft: CategoryDraft, id?: number | null) => {
      dispatch("saveCategory", { draft, id: id ?? null });
    },
    [dispatch],
  );

  const saveSupplier = useCallback(
    (draft: SupplierDraft, id?: number | null) => {
      dispatch("saveSupplier", { draft, id: id ?? null });
    },
    [dispatch],
  );

  const createPurchase = useCallback(
    (draft: PurchaseDraft) => {
      dispatch("createPurchase", { draft });
    },
    [dispatch],
  );

  const updatePurchase = useCallback(
    (id: string, draft: PurchaseDraft) => {
      dispatch("updatePurchase", { id, draft });
    },
    [dispatch],
  );

  const receivePurchase = useCallback(
    (id: string) => {
      dispatch("receivePurchase", { id });
    },
    [dispatch],
  );

  const createSale = useCallback(
    (draft: SaleDraft): string | null => {
      const customer = data.customers.find(
        (item) => item.id === draft.customerId,
      );
      const product = data.products.find(
        (item) => item.id === draft.productId,
      );

      if (!customer || !product) return "Select a customer and product";
      if (draft.qty <= 0) return "Quantity must be greater than zero";
      if (product.stock < draft.qty) {
        return `Only ${product.stock} units of ${product.name} in stock`;
      }

      dispatch("createSale", { draft });
      return null;
    },
    [data.customers, data.products, dispatch],
  );

  const refundSale = useCallback(
    (id: string) => {
      dispatch("refundSale", { id });
    },
    [dispatch],
  );

  const deleteSale = useCallback(
    (id: string) => {
      dispatch("deleteSale", { id });
    },
    [dispatch],
  );

  const saveCustomer = useCallback(
    (draft: CustomerDraft, id?: number | null) => {
      dispatch("saveCustomer", { draft, id: id ?? null });
    },
    [dispatch],
  );

  const saveWarranty = useCallback(
    (draft: WarrantyDraft, id?: string | null) => {
      dispatch("saveWarranty", { draft, id: id ?? null });
    },
    [dispatch],
  );

  const claimWarranty = useCallback(
    (id: string) => {
      dispatch("claimWarranty", { id });
    },
    [dispatch],
  );

  const saveUser = useCallback(
    (draft: UserDraft, id?: number | null) => {
      dispatch("saveUser", { draft, id: id ?? null });
    },
    [dispatch],
  );

  const toggleUserStatus = useCallback(
    (id: number) => {
      dispatch("toggleUserStatus", { id });
    },
    [dispatch],
  );

  const recordStock = useCallback(
    (
      type: "in" | "out",
      productId: number,
      qty: number,
      ref: string,
    ): string | null => {
      const product = data.products.find((item) => item.id === productId);
      if (!product) return "Select a product";
      if (qty <= 0) return "Quantity must be greater than zero";
      if (type === "out" && product.stock < qty) {
        return `Only ${product.stock} units of ${product.name} in stock`;
      }

      dispatch("recordStock", { type, productId, qty, ref });
      return null;
    },
    [data.products, dispatch],
  );

  const updateStockMovement = useCallback(
    (id: number, draft: StockMovementDraft): string | null => {
      const movement = data.stockMovements.find((item) => item.id === id);
      if (!movement) return "Stock movement not found";

      const product = data.products.find((item) => item.id === draft.productId);
      if (!product) return "Select a product";
      if (draft.qty <= 0) return "Quantity must be greater than zero";

      const oldProduct = data.products.find(
        (item) => item.name === movement.product,
      );
      const oldEffect = movement.type === "in" ? movement.qty : -movement.qty;
      const newEffect = draft.type === "in" ? draft.qty : -draft.qty;

      if (oldProduct && oldProduct.id === product.id) {
        const available = oldProduct.stock - oldEffect;
        if (available + newEffect < 0) {
          return `Only ${Math.max(available, 0)} units of ${product.name} in stock`;
        }
      } else {
        if (oldProduct && oldProduct.stock - oldEffect < 0) {
          return `Only ${Math.max(oldProduct.stock, 0)} units of ${oldProduct.name} in stock`;
        }
        if (product.stock + newEffect < 0) {
          return `Only ${product.stock} units of ${product.name} in stock`;
        }
      }

      dispatch("updateStockMovement", { id, draft });
      return null;
    },
    [data.products, data.stockMovements, dispatch],
  );

  const deleteStockMovement = useCallback(
    (id: number) => {
      dispatch("deleteStockMovement", { id });
    },
    [dispatch],
  );

  return (
    <StoreContext.Provider
      value={{
        data,
        ready,
        reset,
        deleteRecord,
        saveProduct,
        saveCategory,
        saveSupplier,
        createPurchase,
        updatePurchase,
        receivePurchase,
        createSale,
        refundSale,
        deleteSale,
        saveCustomer,
        saveWarranty,
        claimWarranty,
        saveUser,
        toggleUserStatus,
        recordStock,
        updateStockMovement,
        deleteStockMovement,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useData(): StoreContextValue {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error("useData must be used inside a DataProvider");
  }
  return context;
}
