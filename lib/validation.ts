import type {
  Category,
  CategoryDraft,
  Customer,
  CustomerDraft,
  Product,
  ProductDraft,
  PurchaseDraft,
  SaleDraft,
  StockMovement,
  StockMovementDraft,
  Supplier,
  SupplierDraft,
  User,
  UserDraft,
  WarrantyDraft,
} from "./types";

export type FieldErrors<T> = Partial<Record<keyof T, string>>;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^\+?[\d\s().-]{6,}$/;

export function hasErrors<T>(errors: FieldErrors<T>): boolean {
  return Object.keys(errors).length > 0;
}

function isBlank(value: string | null | undefined): boolean {
  return !value || value.trim().length === 0;
}

function isValidEmail(value: string): boolean {
  return EMAIL_PATTERN.test(value.trim());
}

function isValidPhone(value: string): boolean {
  return PHONE_PATTERN.test(value.trim());
}

function isNonNegative(value: number): boolean {
  return Number.isFinite(value) && value >= 0;
}

function isPositiveInteger(value: number): boolean {
  return Number.isInteger(value) && value > 0;
}

function isNonNegativeInteger(value: number): boolean {
  return Number.isInteger(value) && value >= 0;
}

function isDuplicate<T extends { id: number | string }>(
  items: T[],
  currentId: number | string | null | undefined,
  predicate: (item: T) => boolean,
): boolean {
  return items.some(
    (item) => predicate(item) && String(item.id) !== String(currentId ?? ""),
  );
}

function emailError(
  email: string,
  label = "Email",
): string | undefined {
  if (isBlank(email)) return undefined;
  return isValidEmail(email) ? undefined : `${label} is not valid`;
}

function phoneError(phone: string): string | undefined {
  if (isBlank(phone)) return undefined;
  return isValidPhone(phone) ? undefined : "Phone number is not valid";
}

export function validateProduct(
  form: ProductDraft,
  products: Product[],
  currentId?: number | null,
): FieldErrors<ProductDraft> {
  const errors: FieldErrors<ProductDraft> = {};

  if (isBlank(form.sku)) {
    errors.sku = "SKU is required";
  } else if (
    isDuplicate(
      products,
      currentId,
      (product) => product.sku.toLowerCase() === form.sku.trim().toLowerCase(),
    )
  ) {
    errors.sku = "This SKU is already in use";
  }

  if (isBlank(form.name)) errors.name = "Product name is required";
  if (isBlank(form.category)) errors.category = "Select a category";
  if (!isNonNegative(form.cost)) errors.cost = "Cost must be zero or greater";
  if (!isNonNegative(form.price) || form.price === 0) {
    errors.price = "Price must be greater than zero";
  }
  if (!isNonNegativeInteger(form.stock)) {
    errors.stock = "Stock must be a whole number";
  }
  if (!isNonNegativeInteger(form.minStock)) {
    errors.minStock = "Minimum stock must be a whole number";
  }
  if (!isNonNegativeInteger(form.warranty)) {
    errors.warranty = "Warranty must be a whole number of months";
  }

  return errors;
}

export function validateCategory(
  form: CategoryDraft,
  categories: Category[],
  currentId?: number | null,
): FieldErrors<CategoryDraft> {
  const errors: FieldErrors<CategoryDraft> = {};

  if (isBlank(form.name)) {
    errors.name = "Category name is required";
  } else if (
    isDuplicate(
      categories,
      currentId,
      (category) =>
        category.name.toLowerCase() === form.name.trim().toLowerCase(),
    )
  ) {
    errors.name = "A category with this name already exists";
  }

  if (form.description.trim().length > 200) {
    errors.description = "Description must be 200 characters or fewer";
  }

  return errors;
}

export function validateSupplier(
  form: SupplierDraft,
  suppliers: Supplier[],
  currentId?: number | null,
): FieldErrors<SupplierDraft> {
  const errors: FieldErrors<SupplierDraft> = {};

  if (isBlank(form.name)) {
    errors.name = "Supplier name is required";
  } else if (
    isDuplicate(
      suppliers,
      currentId,
      (supplier) =>
        supplier.name.toLowerCase() === form.name.trim().toLowerCase(),
    )
  ) {
    errors.name = "A supplier with this name already exists";
  }

  const email = emailError(form.email);
  if (email) errors.email = email;

  const phone = phoneError(form.phone);
  if (phone) errors.phone = phone;

  return errors;
}

export function validateCustomer(
  form: CustomerDraft,
  customers: Customer[],
  currentId?: number | null,
): FieldErrors<CustomerDraft> {
  const errors: FieldErrors<CustomerDraft> = {};

  if (isBlank(form.name)) {
    errors.name = "Customer name is required";
  } else if (
    isDuplicate(
      customers,
      currentId,
      (customer) =>
        customer.name.toLowerCase() === form.name.trim().toLowerCase() &&
        customer.phone === form.phone.trim(),
    )
  ) {
    errors.name = "A customer with this name and phone already exists";
  }

  const email = emailError(form.email);
  if (email) errors.email = email;

  const phone = phoneError(form.phone);
  if (phone) errors.phone = phone;

  return errors;
}

export function validateUser(
  form: UserDraft,
  users: User[],
  currentId?: number | null,
): FieldErrors<UserDraft> {
  const errors: FieldErrors<UserDraft> = {};

  if (isBlank(form.name)) errors.name = "Full name is required";

  if (isBlank(form.email)) {
    errors.email = "Email is required";
  } else if (!isValidEmail(form.email)) {
    errors.email = "Email is not valid";
  } else if (
    isDuplicate(
      users,
      currentId,
      (user) => user.email.toLowerCase() === form.email.trim().toLowerCase(),
    )
  ) {
    errors.email = "This email is already registered";
  }

  if (isBlank(form.role)) errors.role = "Select a role";

  return errors;
}

export function validateWarranty(
  form: WarrantyDraft,
): FieldErrors<WarrantyDraft> {
  const errors: FieldErrors<WarrantyDraft> = {};

  if (isBlank(form.product)) errors.product = "Select a product";
  if (isBlank(form.serial)) errors.serial = "Serial number is required";
  if (isBlank(form.customer)) errors.customer = "Select a customer";
  if (isBlank(form.purchaseDate)) {
    errors.purchaseDate = "Purchase date is required";
  }
  if (isBlank(form.expiry)) {
    errors.expiry = "Expiry date is required";
  } else if (
    form.purchaseDate &&
    form.expiry &&
    form.expiry < form.purchaseDate
  ) {
    errors.expiry = "Expiry must be on or after the purchase date";
  }

  return errors;
}

export function validatePurchase(
  form: PurchaseDraft,
  suppliers: Supplier[],
): FieldErrors<PurchaseDraft> {
  const errors: FieldErrors<PurchaseDraft> = {};

  if (isBlank(form.supplier)) {
    errors.supplier = "Select a supplier";
  } else if (!suppliers.some((supplier) => supplier.name === form.supplier)) {
    errors.supplier = "Selected supplier is not available";
  }

  if (isBlank(form.date)) errors.date = "Order date is required";
  if (!isPositiveInteger(form.items)) {
    errors.items = "Items must be a whole number of at least 1";
  }
  if (!isNonNegative(form.total)) {
    errors.total = "Total cost must be zero or greater";
  }

  return errors;
}

export function validateSale(
  form: SaleDraft,
  products: Product[],
  customers: Customer[],
): FieldErrors<SaleDraft> {
  const errors: FieldErrors<SaleDraft> = {};

  if (!customers.some((customer) => customer.id === form.customerId)) {
    errors.customerId = "Select a customer";
  }

  const product = products.find((item) => item.id === form.productId);
  if (!product) {
    errors.productId = "Select a product";
  }

  if (!isPositiveInteger(form.qty)) {
    errors.qty = "Quantity must be a whole number of at least 1";
  } else if (product && form.qty > product.stock) {
    errors.qty = `Only ${product.stock} units in stock`;
  }

  if (isBlank(form.date)) errors.date = "Sale date is required";

  return errors;
}

export interface LoginValues {
  email: string;
  password: string;
}

export function validateLogin(form: LoginValues): FieldErrors<LoginValues> {
  const errors: FieldErrors<LoginValues> = {};

  if (isBlank(form.email)) {
    errors.email = "Email is required";
  } else if (!isValidEmail(form.email)) {
    errors.email = "Enter a valid email address";
  }

  if (isBlank(form.password)) {
    errors.password = "Password is required";
  } else if (form.password.length < 6) {
    errors.password = "Password must be at least 6 characters";
  }

  return errors;
}

export interface SignupValues {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export function validateSignup(form: SignupValues): FieldErrors<SignupValues> {
  const errors: FieldErrors<SignupValues> = {};

  if (isBlank(form.name)) errors.name = "Full name is required";

  if (isBlank(form.email)) {
    errors.email = "Email is required";
  } else if (!isValidEmail(form.email)) {
    errors.email = "Enter a valid email address";
  }

  if (isBlank(form.password)) {
    errors.password = "Password is required";
  } else if (form.password.length < 6) {
    errors.password = "Password must be at least 6 characters";
  }

  if (isBlank(form.confirmPassword)) {
    errors.confirmPassword = "Confirm your password";
  } else if (form.confirmPassword !== form.password) {
    errors.confirmPassword = "Passwords do not match";
  }

  return errors;
}

export function validateStockMovement(
  form: StockMovementDraft,
  products: Product[],
  movement?: StockMovement | null,
): FieldErrors<StockMovementDraft> {
  const errors: FieldErrors<StockMovementDraft> = {};
  const product = products.find((item) => item.id === form.productId);

  if (!product) {
    errors.productId = "Select a product";
  }

  if (!isPositiveInteger(form.qty)) {
    errors.qty = "Quantity must be a whole number of at least 1";
  } else if (product && form.type === "out") {
    const sameProduct = movement?.product === product.name;
    const previousEffect = movement
      ? movement.type === "in"
        ? movement.qty
        : -movement.qty
      : 0;
    const available = sameProduct
      ? product.stock - previousEffect
      : product.stock;

    if (form.qty > available) {
      errors.qty = `Only ${Math.max(available, 0)} units available`;
    }
  }

  if (isBlank(form.date)) errors.date = "Date is required";

  return errors;
}
