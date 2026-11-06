"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { seedData } from "./seed";
import type {
  CategoryDraft,
  CollectionKey,
  CustomerDraft,
  ProductDraft,
  ProductStatus,
  PurchaseDraft,
  SaleDraft,
  ShopData,
  StockMovementDraft,
  SupplierDraft,
  UserDraft,
  WarrantyDraft,
} from "./types";
import {
  cloneData,
  nextCode,
  nextId,
  nextPurchaseId,
  todayISO,
} from "./utils";

const STORAGE_KEY = "techvault.data.v1";

function loadData(): ShopData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const saved = JSON.parse(raw) as Record<string, unknown>;
      const merged = cloneData(seedData) as unknown as Record<string, unknown>;
      Object.keys(merged).forEach((key) => {
        if (Array.isArray(saved[key])) merged[key] = saved[key];
      });
      return merged as unknown as ShopData;
    }
  } catch (error) {
    console.warn("Unable to load saved data, using seed data.", error);
  }
  return cloneData(seedData);
}

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
  const [data, setData] = useState<ShopData>(() => cloneData(seedData));
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setData(loadData());
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.warn("Unable to persist data.", error);
    }
  }, [data, ready]);

  const mutate = useCallback((updater: (draft: ShopData) => void) => {
    setData((previous) => {
      const draft = cloneData(previous);
      updater(draft);
      return draft;
    });
  }, []);

  const reset = useCallback(() => {
    setData(cloneData(seedData));
  }, []);

  const deleteRecord = useCallback(
    (collection: CollectionKey, id: number | string) => {
      mutate((draft) => {
        const list = draft[collection] as unknown as {
          id: number | string;
        }[];
        const filtered = list.filter((item) => String(item.id) !== String(id));
        (
          draft as unknown as Record<CollectionKey, { id: number | string }[]>
        )[collection] = filtered;
      });
    },
    [mutate],
  );

  const saveProduct = useCallback(
    (draft: ProductDraft, id?: number | null) => {
      mutate((next) => {
        const status: ProductStatus =
          draft.stock <= draft.minStock ? "low" : "active";
        if (id != null) {
          const product = next.products.find(
            (item) => String(item.id) === String(id),
          );
          if (product) Object.assign(product, draft, { status });
        } else {
          next.products.push({ id: nextId(next.products), ...draft, status });
        }
      });
    },
    [mutate],
  );

  const saveCategory = useCallback(
    (draft: CategoryDraft, id?: number | null) => {
      mutate((next) => {
        if (id != null) {
          const category = next.categories.find(
            (item) => String(item.id) === String(id),
          );
          if (!category) return;
          if (category.name !== draft.name) {
            next.products.forEach((product) => {
              if (product.category === category.name) {
                product.category = draft.name;
              }
            });
          }
          category.name = draft.name;
          category.description = draft.description;
        } else {
          next.categories.push({
            id: nextId(next.categories),
            ...draft,
          });
        }
      });
    },
    [mutate],
  );

  const saveSupplier = useCallback(
    (draft: SupplierDraft, id?: number | null) => {
      mutate((next) => {
        if (id != null) {
          const supplier = next.suppliers.find(
            (item) => String(item.id) === String(id),
          );
          if (supplier) Object.assign(supplier, draft);
        } else {
          next.suppliers.push({
            id: nextId(next.suppliers),
            products: 0,
            ...draft,
          });
        }
      });
    },
    [mutate],
  );

  const createPurchase = useCallback(
    (draft: PurchaseDraft) => {
      mutate((next) => {
        next.purchases.unshift({
          id: nextPurchaseId(next.purchases),
          ...draft,
        });
      });
    },
    [mutate],
  );

  const updatePurchase = useCallback(
    (id: string, draft: PurchaseDraft) => {
      mutate((next) => {
        const purchase = next.purchases.find((item) => item.id === id);
        if (purchase) Object.assign(purchase, draft);
      });
    },
    [mutate],
  );

  const receivePurchase = useCallback(
    (id: string) => {
      mutate((next) => {
        const purchase = next.purchases.find((item) => item.id === id);
        if (purchase) purchase.status = "received";
      });
    },
    [mutate],
  );

  const createSale = useCallback(
    (draft: SaleDraft): string | null => {
      const customer = data.customers.find((item) => item.id === draft.customerId);
      const product = data.products.find((item) => item.id === draft.productId);
      if (!customer || !product) return "Select a customer and product";
      if (draft.qty <= 0) return "Quantity must be greater than zero";
      if (product.stock < draft.qty) {
        return `Only ${product.stock} units of ${product.name} in stock`;
      }

      mutate((next) => {
        const nextCustomer = next.customers.find(
          (item) => item.id === draft.customerId,
        );
        const nextProduct = next.products.find(
          (item) => item.id === draft.productId,
        );
        if (!nextCustomer || !nextProduct) return;

        const id = nextCode("INV-", next.sales);
        const total = nextProduct.price * draft.qty;
        nextProduct.stock -= draft.qty;
        nextProduct.status =
          nextProduct.stock <= nextProduct.minStock ? "low" : "active";
        nextCustomer.orders += 1;
        nextCustomer.spent += total;

        next.sales.unshift({
          id,
          customer: nextCustomer.name,
          date: draft.date || todayISO(),
          items: draft.qty,
          total,
          status: "completed",
          payment: draft.payment,
        });
        next.stockMovements.unshift({
          id: nextId(next.stockMovements),
          type: "out",
          product: nextProduct.name,
          qty: draft.qty,
          ref: id,
          date: draft.date || todayISO(),
          user: "Admin",
        });
      });

      return null;
    },
    [data.customers, data.products, mutate],
  );

  const refundSale = useCallback(
    (id: string) => {
      mutate((next) => {
        const sale = next.sales.find((item) => item.id === id);
        if (sale) sale.status = "refunded";
      });
    },
    [mutate],
  );

  const deleteSale = useCallback(
    (id: string) => {
      mutate((next) => {
        const sale = next.sales.find((item) => item.id === id);
        if (!sale) return;

        if (sale.status === "completed") {
          const customer = next.customers.find(
            (item) => item.name === sale.customer,
          );
          if (customer) {
            customer.orders = Math.max(0, customer.orders - 1);
            customer.spent = Math.max(0, customer.spent - sale.total);
          }
        }

        const linkedMovements = next.stockMovements.filter(
          (movement) => movement.ref === id,
        );
        if (sale.status === "completed") {
          linkedMovements.forEach((movement) => {
            const product = next.products.find(
              (item) => item.name === movement.product,
            );
            if (!product) return;
            product.stock = Math.max(
              0,
              product.stock + (movement.type === "out" ? movement.qty : -movement.qty),
            );
            product.status =
              product.stock <= product.minStock ? "low" : "active";
          });
        }

        next.stockMovements = next.stockMovements.filter(
          (movement) => movement.ref !== id,
        );
        next.sales = next.sales.filter((saleItem) => saleItem.id !== id);
      });
    },
    [mutate],
  );

  const saveCustomer = useCallback(
    (draft: CustomerDraft, id?: number | null) => {
      mutate((next) => {
        if (id != null) {
          const customer = next.customers.find(
            (item) => String(item.id) === String(id),
          );
          if (!customer) return;
          const oldName = customer.name;
          Object.assign(customer, draft);
          if (oldName !== draft.name) {
            next.sales.forEach((sale) => {
              if (sale.customer === oldName) sale.customer = draft.name;
            });
            next.warranties.forEach((warranty) => {
              if (warranty.customer === oldName) warranty.customer = draft.name;
            });
          }
        } else {
          next.customers.push({
            id: nextId(next.customers),
            orders: 0,
            spent: 0,
            ...draft,
          });
        }
      });
    },
    [mutate],
  );

  const saveWarranty = useCallback(
    (draft: WarrantyDraft, id?: string | null) => {
      mutate((next) => {
        if (id != null) {
          const warranty = next.warranties.find((item) => item.id === id);
          if (warranty) Object.assign(warranty, draft);
          return;
        }
        next.warranties.unshift({
          id: nextCode("WR-", next.warranties),
          status: "active",
          ...draft,
        });
      });
    },
    [mutate],
  );

  const claimWarranty = useCallback(
    (id: string) => {
      mutate((next) => {
        const warranty = next.warranties.find((item) => item.id === id);
        if (warranty) warranty.status = "claimed";
      });
    },
    [mutate],
  );

  const saveUser = useCallback(
    (draft: UserDraft, id?: number | null) => {
      mutate((next) => {
        if (id != null) {
          const user = next.users.find(
            (item) => String(item.id) === String(id),
          );
          if (user) Object.assign(user, draft);
        } else {
          next.users.push({
            id: nextId(next.users),
            lastLogin: "—",
            ...draft,
          });
        }
      });
    },
    [mutate],
  );

  const toggleUserStatus = useCallback(
    (id: number) => {
      mutate((next) => {
        const user = next.users.find((item) => item.id === id);
        if (user) user.status = user.status === "active" ? "inactive" : "active";
      });
    },
    [mutate],
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

      mutate((next) => {
        const nextProduct = next.products.find(
          (item) => item.id === productId,
        );
        if (!nextProduct) return;
        nextProduct.stock += type === "in" ? qty : -qty;
        nextProduct.status =
          nextProduct.stock <= nextProduct.minStock ? "low" : "active";
        next.stockMovements.unshift({
          id: nextId(next.stockMovements),
          type,
          product: nextProduct.name,
          qty,
          ref: ref || (type === "in" ? "MANUAL-IN" : "MANUAL-OUT"),
          date: todayISO(),
          user: "Admin",
        });
      });

      return null;
    },
    [data.products, mutate],
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
        if (oldProduct.stock - oldEffect + newEffect < 0) {
          return `Only ${oldProduct.stock + newEffect} units of ${product.name} in stock`;
        }
      } else {
        if (oldProduct && oldProduct.stock - oldEffect < 0) {
          return `Only ${oldProduct.stock} units of ${oldProduct.name} in stock`;
        }
        if (product.stock + newEffect < 0) {
          return `Only ${product.stock} units of ${product.name} in stock`;
        }
      }

      mutate((next) => {
        const nextMovement = next.stockMovements.find(
          (item) => item.id === id,
        );
        if (!nextMovement) return;

        const nextOldProduct = next.products.find(
          (item) => item.name === movement.product,
        );
        if (nextOldProduct) {
          nextOldProduct.stock -= oldEffect;
          nextOldProduct.status =
            nextOldProduct.stock <= nextOldProduct.minStock ? "low" : "active";
        }

        const nextProduct = next.products.find(
          (item) => item.id === draft.productId,
        );
        if (!nextProduct) return;
        nextProduct.stock += newEffect;
        nextProduct.status =
          nextProduct.stock <= nextProduct.minStock ? "low" : "active";

        Object.assign(nextMovement, {
          type: draft.type,
          product: nextProduct.name,
          qty: draft.qty,
          ref: draft.ref || (draft.type === "in" ? "MANUAL-IN" : "MANUAL-OUT"),
          date: draft.date || todayISO(),
          user: draft.user || "Admin",
        });
      });

      return null;
    },
    [data.products, data.stockMovements, mutate],
  );

  const deleteStockMovement = useCallback(
    (id: number) => {
      mutate((next) => {
        const movement = next.stockMovements.find((item) => item.id === id);
        if (!movement) return;

        const product = next.products.find(
          (item) => item.name === movement.product,
        );
        if (product) {
          product.stock = Math.max(
            0,
            product.stock +
              (movement.type === "in" ? -movement.qty : movement.qty),
          );
          product.status =
            product.stock <= product.minStock ? "low" : "active";
        }

        next.stockMovements = next.stockMovements.filter(
          (item) => item.id !== id,
        );
      });
    },
    [mutate],
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
