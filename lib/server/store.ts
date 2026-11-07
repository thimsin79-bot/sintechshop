import { prisma } from "@/lib/db/prisma";
import { Prisma } from "@/lib/generated/prisma/client";
import { seedData } from "@/lib/seed";
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
} from "@/lib/types";
import { nextCode, nextPurchaseId, todayISO } from "@/lib/utils";

type Tx = Prisma.TransactionClient;

export class StoreError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "StoreError";
  }
}

function num(value: unknown): number {
  return Number(value) || 0;
}

function productStatus(stock: number, minStock: number): ProductStatus {
  return stock <= minStock ? "low" : "active";
}

function normalizeName(value: string | null | undefined): string {
  return (value ?? "").trim();
}

async function resolveCategoryId(tx: Tx, name: string): Promise<number> {
  const trimmed = normalizeName(name) || "Uncategorized";
  const existing = await tx.category.findFirst({
    where: { name: { equals: trimmed, mode: "insensitive" } },
  });
  if (existing) return existing.id;
  const created = await tx.category.create({
    data: { name: trimmed, description: "" },
  });
  return created.id;
}

async function resolveSupplierId(
  tx: Tx,
  name: string,
): Promise<number | null> {
  const trimmed = normalizeName(name);
  if (!trimmed) return null;
  const existing = await tx.supplier.findFirst({
    where: { name: { equals: trimmed, mode: "insensitive" } },
  });
  return existing?.id ?? null;
}

async function nextSaleId(tx: Tx): Promise<string> {
  const rows = await tx.sale.findMany({ select: { id: true } });
  return nextCode("INV-", rows);
}

async function nextWarrantyId(tx: Tx): Promise<string> {
  const rows = await tx.warranty.findMany({ select: { id: true } });
  return nextCode("WR-", rows);
}

async function nextPurchaseCode(tx: Tx): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `PO-${year}-`;
  const rows = await tx.purchase.findMany({
    where: { id: { startsWith: prefix } },
    select: { id: true },
  });
  return nextPurchaseId(rows);
}

export async function getShopData(): Promise<ShopData> {
  const [
    products,
    categories,
    suppliers,
    purchases,
    sales,
    customers,
    warranties,
    stockMovements,
    users,
  ] = await Promise.all([
    prisma.product.findMany({
      include: { category: { select: { name: true } } },
      orderBy: { id: "asc" },
    }),
    prisma.category.findMany({ orderBy: { id: "asc" } }),
    prisma.supplier.findMany({ orderBy: { id: "asc" } }),
    prisma.purchase.findMany({ orderBy: { id: "desc" } }),
    prisma.sale.findMany({ orderBy: { id: "desc" } }),
    prisma.customer.findMany({ orderBy: { id: "asc" } }),
    prisma.warranty.findMany({ orderBy: { id: "desc" } }),
    prisma.stockMovement.findMany({ orderBy: { id: "desc" } }),
    prisma.user.findMany({ orderBy: { id: "asc" } }),
  ]);

  return {
    products: products.map((product) => ({
      id: product.id,
      sku: product.sku,
      name: product.name,
      category: product.category?.name ?? "Uncategorized",
      brand: product.brand,
      price: num(product.price),
      cost: num(product.cost),
      stock: product.stock,
      minStock: product.minStock,
      warranty: product.warranty,
      status: product.status as ProductStatus,
    })),
    categories: categories.map((category) => ({
      id: category.id,
      name: category.name,
      description: category.description,
    })),
    suppliers: suppliers.map((supplier) => ({
      id: supplier.id,
      name: supplier.name,
      contact: supplier.contact,
      email: supplier.email,
      phone: supplier.phone,
      city: supplier.city,
      products: supplier.products,
      status: supplier.status as ShopData["suppliers"][number]["status"],
    })),
    purchases: purchases.map((purchase) => ({
      id: purchase.id,
      supplier: purchase.supplierName,
      date: purchase.date,
      items: purchase.items,
      total: num(purchase.total),
      status: purchase.status as ShopData["purchases"][number]["status"],
    })),
    sales: sales.map((sale) => ({
      id: sale.id,
      customer: sale.customerName,
      date: sale.date,
      items: sale.items,
      total: num(sale.total),
      status: sale.status as ShopData["sales"][number]["status"],
      payment: sale.payment as ShopData["sales"][number]["payment"],
    })),
    customers: customers.map((customer) => ({
      id: customer.id,
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      orders: customer.orders,
      spent: num(customer.spent),
      type: customer.type as ShopData["customers"][number]["type"],
    })),
    warranties: warranties.map((warranty) => ({
      id: warranty.id,
      product: warranty.productName,
      serial: warranty.serial,
      customer: warranty.customerName,
      purchaseDate: warranty.purchaseDate,
      expiry: warranty.expiry,
      status: warranty.status as ShopData["warranties"][number]["status"],
    })),
    stockMovements: stockMovements.map((movement) => ({
      id: movement.id,
      type: movement.type as ShopData["stockMovements"][number]["type"],
      product: movement.productName,
      qty: movement.qty,
      ref: movement.ref,
      date: movement.date,
      user: movement.user,
    })),
    users: users.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      lastLogin: user.lastLogin,
      status: user.status as ShopData["users"][number]["status"],
    })),
  };
}

export async function seedDatabase(): Promise<void> {
  await prisma.$transaction(
    async (tx) => {
      await tx.$executeRawUnsafe(
        'TRUNCATE TABLE "StockMovement", "Warranty", "Sale", "Purchase", "Product", "Category", "Supplier", "Customer", "User" RESTART IDENTITY CASCADE',
      );

      const categories = await tx.category.createManyAndReturn({
        data: seedData.categories.map((category) => ({
          name: category.name,
          description: category.description,
        })),
        select: { id: true, name: true },
      });
      const categoryIds = new Map(
        categories.map((category) => [category.name, category.id]),
      );

      const products = await tx.product.createManyAndReturn({
        data: seedData.products.map((product) => ({
          sku: product.sku,
          name: product.name,
          categoryId: categoryIds.get(product.category) ?? null,
          brand: product.brand,
          price: product.price,
          cost: product.cost,
          stock: product.stock,
          minStock: product.minStock,
          warranty: product.warranty,
          status: product.status,
        })),
        select: { id: true, name: true },
      });
      const productIds = new Map(
        products.map((product) => [product.name, product.id]),
      );

      const suppliers = await tx.supplier.createManyAndReturn({
        data: seedData.suppliers.map((supplier) => ({
          name: supplier.name,
          contact: supplier.contact,
          email: supplier.email,
          phone: supplier.phone,
          city: supplier.city,
          products: supplier.products,
          status: supplier.status,
        })),
        select: { id: true, name: true },
      });
      const supplierIds = new Map(
        suppliers.map((supplier) => [supplier.name, supplier.id]),
      );

      const customers = await tx.customer.createManyAndReturn({
        data: seedData.customers.map((customer) => ({
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
          orders: customer.orders,
          spent: customer.spent,
          type: customer.type,
        })),
        select: { id: true, name: true },
      });
      const customerIds = new Map(
        customers.map((customer) => [customer.name, customer.id]),
      );

      await tx.user.createMany({
        data: seedData.users.map((user) => ({
          name: user.name,
          email: user.email,
          role: user.role,
          lastLogin: user.lastLogin,
          status: user.status,
        })),
      });

      await tx.purchase.createMany({
        data: seedData.purchases.map((purchase) => ({
          id: purchase.id,
          supplierId: supplierIds.get(purchase.supplier) ?? null,
          supplierName: purchase.supplier,
          date: purchase.date,
          items: purchase.items,
          total: purchase.total,
          status: purchase.status,
        })),
      });

      await tx.sale.createMany({
        data: seedData.sales.map((sale) => ({
          id: sale.id,
          customerId: customerIds.get(sale.customer) ?? null,
          customerName: sale.customer,
          date: sale.date,
          items: sale.items,
          total: sale.total,
          status: sale.status,
          payment: sale.payment,
        })),
      });

      await tx.warranty.createMany({
        data: seedData.warranties.map((warranty) => ({
          id: warranty.id,
          productId: productIds.get(warranty.product) ?? null,
          productName: warranty.product,
          serial: warranty.serial,
          customerId: customerIds.get(warranty.customer) ?? null,
          customerName: warranty.customer,
          purchaseDate: warranty.purchaseDate,
          expiry: warranty.expiry,
          status: warranty.status,
        })),
      });

      await tx.stockMovement.createMany({
        data: seedData.stockMovements.map((movement) => ({
          type: movement.type,
          productId: productIds.get(movement.product) ?? null,
          productName: movement.product,
          qty: movement.qty,
          ref: movement.ref,
          date: movement.date,
          user: movement.user,
        })),
      });
    },
    { maxWait: 15000, timeout: 60000 },
  );
}

async function deleteSale(tx: Tx, id: string): Promise<void> {
  const sale = await tx.sale.findUnique({ where: { id } });
  if (!sale) return;

  if (sale.status === "completed") {
    if (sale.productId) {
      const product = await tx.product.findUnique({
        where: { id: sale.productId },
      });
      if (product) {
        const stock = Math.max(0, product.stock + sale.items);
        await tx.product.update({
          where: { id: product.id },
          data: { stock, status: productStatus(stock, product.minStock) },
        });
      }
    }

    if (sale.customerId) {
      const customer = await tx.customer.findUnique({
        where: { id: sale.customerId },
      });
      if (customer) {
        await tx.customer.update({
          where: { id: customer.id },
          data: {
            orders: Math.max(0, customer.orders - 1),
            spent: Math.max(0, num(customer.spent) - num(sale.total)),
          },
        });
      }
    }
  }

  await tx.stockMovement.deleteMany({ where: { ref: sale.id } });
  await tx.sale.delete({ where: { id: sale.id } });
}

async function deleteRecord(
  collection: CollectionKey,
  id: number | string,
): Promise<void> {
  switch (collection) {
    case "products":
      await prisma.product.deleteMany({ where: { id: Number(id) } });
      return;
    case "categories":
      await prisma.category.deleteMany({ where: { id: Number(id) } });
      return;
    case "suppliers":
      await prisma.supplier.deleteMany({ where: { id: Number(id) } });
      return;
    case "customers":
      await prisma.customer.deleteMany({ where: { id: Number(id) } });
      return;
    case "users":
      await prisma.user.deleteMany({ where: { id: Number(id) } });
      return;
    case "purchases":
      await prisma.purchase.deleteMany({ where: { id: String(id) } });
      return;
    case "sales":
      await prisma.$transaction((tx) => deleteSale(tx, String(id)));
      return;
    case "warranties":
      await prisma.warranty.deleteMany({ where: { id: String(id) } });
      return;
    case "stockMovements":
      await deleteStockMovement(Number(id));
      return;
    default:
      throw new StoreError("Unknown collection");
  }
}

async function saveProduct(
  draft: ProductDraft,
  id?: number | null,
): Promise<void> {
  const status = productStatus(draft.stock, draft.minStock);

  await prisma.$transaction(async (tx) => {
    const categoryId = await resolveCategoryId(tx, draft.category);
    const data = {
      sku: draft.sku.trim(),
      name: draft.name.trim(),
      categoryId,
      brand: draft.brand,
      price: draft.price,
      cost: draft.cost,
      stock: draft.stock,
      minStock: draft.minStock,
      warranty: draft.warranty,
      status,
    };

    if (id != null) {
      const previous = await tx.product.findUnique({ where: { id } });
      await tx.product.update({ where: { id }, data });
      if (previous && previous.name !== data.name) {
        await tx.warranty.updateMany({
          where: { productId: id },
          data: { productName: data.name },
        });
        await tx.stockMovement.updateMany({
          where: { productId: id },
          data: { productName: data.name },
        });
      }
      return;
    }

    await tx.product.create({ data });
  });
}

async function saveCategory(
  draft: CategoryDraft,
  id?: number | null,
): Promise<void> {
  if (id != null) {
    await prisma.category.update({
      where: { id },
      data: { name: draft.name.trim(), description: draft.description },
    });
    return;
  }
  await prisma.category.create({
    data: { name: draft.name.trim(), description: draft.description },
  });
}

async function saveSupplier(
  draft: SupplierDraft,
  id?: number | null,
): Promise<void> {
  await prisma.$transaction(async (tx) => {
    if (id != null) {
      const previous = await tx.supplier.findUnique({ where: { id } });
      await tx.supplier.update({
        where: { id },
        data: {
          name: draft.name.trim(),
          contact: draft.contact,
          email: draft.email,
          phone: draft.phone,
          city: draft.city,
          status: draft.status,
        },
      });
      if (previous && previous.name !== draft.name.trim()) {
        await tx.purchase.updateMany({
          where: { supplierId: id },
          data: { supplierName: draft.name.trim() },
        });
      }
      return;
    }

    await tx.supplier.create({
      data: {
        name: draft.name.trim(),
        contact: draft.contact,
        email: draft.email,
        phone: draft.phone,
        city: draft.city,
        products: 0,
        status: draft.status,
      },
    });
  });
}

async function createPurchase(draft: PurchaseDraft): Promise<void> {
  await prisma.$transaction(async (tx) => {
    const supplierId = await resolveSupplierId(tx, draft.supplier);
    const id = await nextPurchaseCode(tx);
    await tx.purchase.create({
      data: {
        id,
        supplierId,
        supplierName: draft.supplier,
        date: draft.date,
        items: draft.items,
        total: draft.total,
        status: draft.status,
      },
    });
  });
}

async function updatePurchase(
  id: string,
  draft: PurchaseDraft,
): Promise<void> {
  await prisma.$transaction(async (tx) => {
    const supplierId = await resolveSupplierId(tx, draft.supplier);
    await tx.purchase.update({
      where: { id },
      data: {
        supplierId,
        supplierName: draft.supplier,
        date: draft.date,
        items: draft.items,
        total: draft.total,
        status: draft.status,
      },
    });
  });
}

async function receivePurchase(id: string): Promise<void> {
  await prisma.purchase.update({
    where: { id },
    data: { status: "received" },
  });
}

async function createSale(draft: SaleDraft): Promise<void> {
  if (draft.qty <= 0) throw new StoreError("Quantity must be greater than zero");

  await prisma.$transaction(async (tx) => {
    const customer = await tx.customer.findUnique({
      where: { id: draft.customerId },
    });
    const product = await tx.product.findUnique({
      where: { id: draft.productId },
    });

    if (!customer || !product) {
      throw new StoreError("Select a customer and product");
    }
    if (product.stock < draft.qty) {
      throw new StoreError(
        `Only ${product.stock} units of ${product.name} in stock`,
      );
    }

    const id = await nextSaleId(tx);
    const total = num(product.price) * draft.qty;
    const date = draft.date || todayISO();

    const stock = product.stock - draft.qty;
    await tx.product.update({
      where: { id: product.id },
      data: { stock, status: productStatus(stock, product.minStock) },
    });

    await tx.customer.update({
      where: { id: customer.id },
      data: {
        orders: customer.orders + 1,
        spent: num(customer.spent) + total,
      },
    });

    await tx.sale.create({
      data: {
        id,
        customerId: customer.id,
        customerName: customer.name,
        productId: product.id,
        date,
        items: draft.qty,
        total,
        status: "completed",
        payment: draft.payment,
      },
    });

    await tx.stockMovement.create({
      data: {
        type: "out",
        productId: product.id,
        productName: product.name,
        qty: draft.qty,
        ref: id,
        date,
        user: "Admin",
      },
    });
  });
}

async function refundSale(id: string): Promise<void> {
  await prisma.sale.update({ where: { id }, data: { status: "refunded" } });
}

async function saveCustomer(
  draft: CustomerDraft,
  id?: number | null,
): Promise<void> {
  await prisma.$transaction(async (tx) => {
    if (id != null) {
      const previous = await tx.customer.findUnique({ where: { id } });
      await tx.customer.update({
        where: { id },
        data: {
          name: draft.name.trim(),
          email: draft.email,
          phone: draft.phone,
          type: draft.type,
        },
      });
      if (previous && previous.name !== draft.name.trim()) {
        await tx.sale.updateMany({
          where: { customerId: id },
          data: { customerName: draft.name.trim() },
        });
        await tx.warranty.updateMany({
          where: { customerId: id },
          data: { customerName: draft.name.trim() },
        });
      }
      return;
    }

    await tx.customer.create({
      data: {
        name: draft.name.trim(),
        email: draft.email,
        phone: draft.phone,
        orders: 0,
        spent: 0,
        type: draft.type,
      },
    });
  });
}

async function saveWarranty(
  draft: WarrantyDraft,
  id?: string | null,
): Promise<void> {
  await prisma.$transaction(async (tx) => {
    const product = await tx.product.findFirst({
      where: { name: { equals: draft.product, mode: "insensitive" } },
    });
    const customer = await tx.customer.findFirst({
      where: { name: { equals: draft.customer, mode: "insensitive" } },
    });

    const data = {
      productId: product?.id ?? null,
      productName: draft.product,
      serial: draft.serial,
      customerId: customer?.id ?? null,
      customerName: draft.customer,
      purchaseDate: draft.purchaseDate,
      expiry: draft.expiry,
    };

    if (id != null) {
      await tx.warranty.update({ where: { id }, data });
      return;
    }

    const nextId = await nextWarrantyId(tx);
    await tx.warranty.create({
      data: { id: nextId, status: "active", ...data },
    });
  });
}

async function claimWarranty(id: string): Promise<void> {
  await prisma.warranty.update({ where: { id }, data: { status: "claimed" } });
}

async function saveUser(draft: UserDraft, id?: number | null): Promise<void> {
  if (id != null) {
    await prisma.user.update({
      where: { id },
      data: {
        name: draft.name,
        email: draft.email,
        role: draft.role,
        status: draft.status,
      },
    });
    return;
  }
  await prisma.user.create({
    data: {
      name: draft.name,
      email: draft.email,
      role: draft.role,
      lastLogin: "—",
      status: draft.status,
    },
  });
}

async function toggleUserStatus(id: number): Promise<void> {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) return;
  await prisma.user.update({
    where: { id },
    data: { status: user.status === "active" ? "inactive" : "active" },
  });
}

async function recordStock(
  type: "in" | "out",
  productId: number,
  qty: number,
  ref: string,
): Promise<void> {
  if (qty <= 0) throw new StoreError("Quantity must be greater than zero");

  await prisma.$transaction(async (tx) => {
    const product = await tx.product.findUnique({ where: { id: productId } });
    if (!product) throw new StoreError("Select a product");
    if (type === "out" && product.stock < qty) {
      throw new StoreError(
        `Only ${product.stock} units of ${product.name} in stock`,
      );
    }

    const stock = product.stock + (type === "in" ? qty : -qty);
    await tx.product.update({
      where: { id: product.id },
      data: { stock, status: productStatus(stock, product.minStock) },
    });

    await tx.stockMovement.create({
      data: {
        type,
        productId: product.id,
        productName: product.name,
        qty,
        ref: ref || (type === "in" ? "MANUAL-IN" : "MANUAL-OUT"),
        date: todayISO(),
        user: "Admin",
      },
    });
  });
}

async function updateStockMovement(
  id: number,
  draft: StockMovementDraft,
): Promise<void> {
  if (draft.qty <= 0) {
    throw new StoreError("Quantity must be greater than zero");
  }

  await prisma.$transaction(async (tx) => {
    const movement = await tx.stockMovement.findUnique({ where: { id } });
    if (!movement) throw new StoreError("Stock movement not found");

    const product = await tx.product.findUnique({
      where: { id: draft.productId },
    });
    if (!product) throw new StoreError("Select a product");

    const oldProduct = movement.productId
      ? await tx.product.findUnique({ where: { id: movement.productId } })
      : null;
    const oldEffect = movement.type === "in" ? movement.qty : -movement.qty;
    const newEffect = draft.type === "in" ? draft.qty : -draft.qty;

    if (oldProduct && oldProduct.id === product.id) {
      if (oldProduct.stock - oldEffect + newEffect < 0) {
        throw new StoreError(
          `Only ${oldProduct.stock + newEffect} units of ${product.name} in stock`,
        );
      }
    } else {
      if (oldProduct && oldProduct.stock - oldEffect < 0) {
        throw new StoreError(
          `Only ${oldProduct.stock} units of ${oldProduct.name} in stock`,
        );
      }
      if (product.stock + newEffect < 0) {
        throw new StoreError(
          `Only ${product.stock} units of ${product.name} in stock`,
        );
      }
    }

    if (oldProduct) {
      const stock = oldProduct.stock - oldEffect;
      await tx.product.update({
        where: { id: oldProduct.id },
        data: { stock, status: productStatus(stock, oldProduct.minStock) },
      });
    }

    const stock = product.stock + newEffect;
    await tx.product.update({
      where: { id: product.id },
      data: { stock, status: productStatus(stock, product.minStock) },
    });

    await tx.stockMovement.update({
      where: { id },
      data: {
        type: draft.type,
        productId: product.id,
        productName: product.name,
        qty: draft.qty,
        ref: draft.ref || (draft.type === "in" ? "MANUAL-IN" : "MANUAL-OUT"),
        date: draft.date || todayISO(),
        user: draft.user || "Admin",
      },
    });
  });
}

async function deleteStockMovement(id: number): Promise<void> {
  await prisma.$transaction(async (tx) => {
    const movement = await tx.stockMovement.findUnique({ where: { id } });
    if (!movement) return;

    if (movement.productId) {
      const product = await tx.product.findUnique({
        where: { id: movement.productId },
      });
      if (product) {
        const stock = Math.max(
          0,
          product.stock +
            (movement.type === "in" ? -movement.qty : movement.qty),
        );
        await tx.product.update({
          where: { id: product.id },
          data: { stock, status: productStatus(stock, product.minStock) },
        });
      }
    }

    await tx.stockMovement.delete({ where: { id } });
  });
}

export async function handleStoreAction(
  action: string,
  payload: Record<string, unknown>,
): Promise<void> {
  switch (action) {
    case "reset":
      await seedDatabase();
      return;
    case "deleteRecord":
      await deleteRecord(
        payload.collection as CollectionKey,
        payload.id as number | string,
      );
      return;
    case "saveProduct":
      await saveProduct(
        payload.draft as ProductDraft,
        payload.id as number | null | undefined,
      );
      return;
    case "saveCategory":
      await saveCategory(
        payload.draft as CategoryDraft,
        payload.id as number | null | undefined,
      );
      return;
    case "saveSupplier":
      await saveSupplier(
        payload.draft as SupplierDraft,
        payload.id as number | null | undefined,
      );
      return;
    case "createPurchase":
      await createPurchase(payload.draft as PurchaseDraft);
      return;
    case "updatePurchase":
      await updatePurchase(
        payload.id as string,
        payload.draft as PurchaseDraft,
      );
      return;
    case "receivePurchase":
      await receivePurchase(payload.id as string);
      return;
    case "createSale":
      await createSale(payload.draft as SaleDraft);
      return;
    case "refundSale":
      await refundSale(payload.id as string);
      return;
    case "deleteSale":
      await prisma.$transaction((tx) => deleteSale(tx, payload.id as string));
      return;
    case "saveCustomer":
      await saveCustomer(
        payload.draft as CustomerDraft,
        payload.id as number | null | undefined,
      );
      return;
    case "saveWarranty":
      await saveWarranty(
        payload.draft as WarrantyDraft,
        payload.id as string | null | undefined,
      );
      return;
    case "claimWarranty":
      await claimWarranty(payload.id as string);
      return;
    case "saveUser":
      await saveUser(
        payload.draft as UserDraft,
        payload.id as number | null | undefined,
      );
      return;
    case "toggleUserStatus":
      await toggleUserStatus(payload.id as number);
      return;
    case "recordStock":
      await recordStock(
        payload.type as "in" | "out",
        payload.productId as number,
        payload.qty as number,
        payload.ref as string,
      );
      return;
    case "updateStockMovement":
      await updateStockMovement(
        payload.id as number,
        payload.draft as StockMovementDraft,
      );
      return;
    case "deleteStockMovement":
      await deleteStockMovement(payload.id as number);
      return;
    default:
      throw new StoreError(`Unknown action: ${action}`);
  }
}
