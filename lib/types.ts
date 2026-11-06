export type ProductStatus = "active" | "low";
export type SupplierStatus = "active" | "inactive";
export type PurchaseStatus = "ordered" | "partial" | "received";
export type SaleStatus = "completed" | "refunded";
export type PaymentMethod = "card" | "cash" | "transfer";
export type CustomerType = "retail" | "wholesale";
export type WarrantyStatus = "active" | "claimed";
export type UserStatus = "active" | "inactive";
export type StockMovementType = "in" | "out";

export interface Product {
  id: number;
  sku: string;
  name: string;
  category: string;
  brand: string;
  price: number;
  cost: number;
  stock: number;
  minStock: number;
  warranty: number;
  status: ProductStatus;
}

export interface Category {
  id: number;
  name: string;
  description: string;
}

export interface Supplier {
  id: number;
  name: string;
  contact: string;
  email: string;
  phone: string;
  city: string;
  products: number;
  status: SupplierStatus;
}

export interface Purchase {
  id: string;
  supplier: string;
  date: string;
  items: number;
  total: number;
  status: PurchaseStatus;
}

export interface Sale {
  id: string;
  customer: string;
  date: string;
  items: number;
  total: number;
  status: SaleStatus;
  payment: PaymentMethod;
}

export interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
  orders: number;
  spent: number;
  type: CustomerType;
}

export interface Warranty {
  id: string;
  product: string;
  serial: string;
  customer: string;
  purchaseDate: string;
  expiry: string;
  status: WarrantyStatus;
}

export interface StockMovement {
  id: number;
  type: StockMovementType;
  product: string;
  qty: number;
  ref: string;
  date: string;
  user: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  lastLogin: string;
  status: UserStatus;
}

export interface ShopData {
  products: Product[];
  categories: Category[];
  suppliers: Supplier[];
  purchases: Purchase[];
  sales: Sale[];
  customers: Customer[];
  warranties: Warranty[];
  stockMovements: StockMovement[];
  users: User[];
}

export type CollectionKey = keyof ShopData;

export type ProductDraft = Omit<Product, "id" | "status">;
export type CategoryDraft = Pick<Category, "name" | "description">;
export type SupplierDraft = Omit<Supplier, "id" | "products">;
export type CustomerDraft = Pick<Customer, "name" | "email" | "phone" | "type">;
export type WarrantyDraft = Pick<Warranty, "product" | "serial" | "customer" | "purchaseDate" | "expiry">;
export type UserDraft = Pick<User, "name" | "email" | "role" | "status">;
export type PurchaseDraft = Pick<Purchase, "supplier" | "date" | "items" | "total" | "status">;
export type StockMovementDraft = {
  type: StockMovementType;
  productId: number;
  qty: number;
  ref: string;
  date: string;
  user: string;
};
export type SaleDraft = {
  customerId: number;
  productId: number;
  qty: number;
  payment: PaymentMethod;
  date: string;
};
