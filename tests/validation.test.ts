import test from "node:test";
import assert from "node:assert/strict";
import type {
  Customer,
  Product,
  ProductDraft,
  PurchaseDraft,
  SaleDraft,
  StockMovementDraft,
  Supplier,
} from "../lib/types";
import {
  hasErrors,
  validateLogin,
  validateProduct,
  validatePurchase,
  validateSale,
  validateSignup,
  validateStockMovement,
} from "../lib/validation";

const product: Product = {
  id: 1,
  sku: "GPU-001",
  name: "RTX 4070",
  categoryId: 1,
  category: "Graphics Cards",
  brand: "NVIDIA",
  price: 599,
  cost: 480,
  stock: 10,
  minStock: 2,
  warranty: 24,
  status: "active",
};

const customer: Customer = {
  id: 1,
  name: "Jane Doe",
  email: "jane@example.com",
  phone: "+1 555 0100",
  orders: 0,
  spent: 0,
  type: "retail",
};

const supplier: Supplier = {
  id: 1,
  name: "Acme Parts",
  contact: "Sales",
  email: "sales@acme.test",
  phone: "+1 555 0200",
  city: "Austin",
  products: 0,
  status: "active",
};

function draft(overrides: Partial<ProductDraft> = {}): ProductDraft {
  return {
    sku: "GPU-002",
    name: "RTX 4080",
    categoryId: 1,
    category: "Graphics Cards",
    brand: "NVIDIA",
    price: 999,
    cost: 800,
    stock: 5,
    minStock: 1,
    warranty: 24,
    ...overrides,
  };
}

test("validateProduct accepts a valid draft", () => {
  assert.equal(hasErrors(validateProduct(draft(), [product])), false);
});

test("validateProduct rejects blank and duplicate SKUs", () => {
  assert.equal(validateProduct(draft({ sku: "  " }), [product]).sku, "SKU is required");
  assert.equal(
    validateProduct(draft({ sku: "gpu-001" }), [product]).sku,
    "This SKU is already in use",
  );
});

test("validateProduct enforces price and whole-number stock", () => {
  assert.equal(
    validateProduct(draft({ price: 0 }), [product]).price,
    "Price must be greater than zero",
  );
  assert.equal(
    validateProduct(draft({ stock: 1.5 }), [product]).stock,
    "Stock must be a whole number",
  );
});

test("validateSale requires an in-stock product and customer", () => {
  const base: SaleDraft = {
    customerId: customer.id,
    productId: product.id,
    qty: 2,
    discount: 0,
    payment: "card",
  };

  assert.equal(hasErrors(validateSale(base, [product], [customer])), false);
  assert.equal(
    validateSale({ ...base, qty: 11 }, [product], [customer]).qty,
    "Only 10 units in stock",
  );
  assert.equal(
    validateSale({ ...base, discount: 101 }, [product], [customer]).discount,
    "Discount must be between 0 and 100",
  );
  assert.equal(
    validateSale({ ...base, customerId: 99 }, [product], [customer]).customerId,
    "Select a customer",
  );
});

test("validateStockMovement blocks stock-out beyond availability", () => {
  const form: StockMovementDraft = {
    type: "out",
    productId: product.id,
    qty: 5,
    ref: "",
    user: "Admin",
  };

  assert.equal(hasErrors(validateStockMovement(form, [product])), false);
  assert.equal(
    validateStockMovement({ ...form, qty: 20 }, [product]).qty,
    "Only 10 units available",
  );
});

test("validatePurchase requires a known supplier and positive items", () => {
  const form: PurchaseDraft = {
    supplier: supplier.name,
    items: 3,
    total: 1500,
    status: "ordered",
  };

  assert.equal(hasErrors(validatePurchase(form, [supplier])), false);
  assert.equal(
    validatePurchase({ ...form, supplier: "Unknown" }, [supplier]).supplier,
    "Selected supplier is not available",
  );
  assert.equal(
    validatePurchase({ ...form, items: 0 }, [supplier]).items,
    "Items must be a whole number of at least 1",
  );
});

test("validateLogin checks username format and password length", () => {
  assert.equal(hasErrors(validateLogin({ username: "admin", password: "secret123" })), false);
  assert.equal(
    validateLogin({ username: "", password: "secret123" }).username,
    "Username is required",
  );
  assert.equal(
    validateLogin({ username: "admin", password: "short" }).password,
    "Password must be at least 8 characters",
  );
});

test("validateSignup enforces the username pattern", () => {
  assert.equal(hasErrors(validateSignup({ username: "john.doe", password: "secret123" })), false);
  assert.equal(
    validateSignup({ username: "-bad", password: "secret123" }).username,
    "Use 3-32 letters, numbers, dots, dashes or underscores",
  );
});
