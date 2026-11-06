// ==================== MODALS & CRUD HANDLERS ====================
function modalHeader(title, subtitle = '') {
  return `
    <div class="flex items-start justify-between mb-5">
      <div>
        <h3 class="text-lg font-semibold">${escapeHtml(title)}</h3>
        ${subtitle ? `<p class="text-xs text-slate-500 mt-0.5">${escapeHtml(subtitle)}</p>` : ''}
      </div>
      <button onclick="closeModal()" class="text-slate-400 hover:text-slate-600"><i class="fas fa-times"></i></button>
    </div>
  `;
}

function modalFooter(submitLabel, colorClass = 'bg-brand-600 hover:bg-brand-700') {
  return `
    <div class="flex justify-end gap-3 pt-2">
      <button type="button" onclick="closeModal()" class="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
      <button type="submit" class="px-4 py-2 text-sm font-medium text-white ${colorClass} rounded-lg">${escapeHtml(submitLabel)}</button>
    </div>
  `;
}

const inputClass = 'w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none';
const labelClass = 'block text-sm font-medium text-slate-700 mb-1';

function selected(value, current) {
  return String(value) === String(current) ? 'selected' : '';
}

function addMonths(dateStr, months) {
  const date = new Date(dateStr || todayISO());
  if (Number.isNaN(date.getTime())) return todayISO();
  const day = date.getDate();
  date.setMonth(date.getMonth() + Number(months || 0));
  if (date.getDate() < day) date.setDate(0);
  return date.toISOString().slice(0, 10);
}

function refreshPage() {
  if (typeof navigate === 'function' && typeof currentPage !== 'undefined') {
    navigate(currentPage);
  }
}

// ==================== PRODUCTS ====================
function showProductModal(id) {
  const product = id != null ? findBy('products', id) : null;
  const categoryOptions = data.categories.map(c => `<option ${selected(c.name, product ? product.category : '')}>${escapeHtml(c.name)}</option>`).join('');
  openModal(`
    <div class="p-6">
      ${modalHeader(product ? 'Edit Product' : 'Add New Product', product ? product.sku : 'Create a product in your catalog')}
      <form onsubmit="event.preventDefault(); saveProduct(${product ? product.id : 'null'})" class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="${labelClass}">SKU</label>
            <input id="productSku" required value="${escapeHtml(product ? product.sku : '')}" class="${inputClass}" placeholder="CPU-XXX-000" />
          </div>
          <div>
            <label class="${labelClass}">Category</label>
            <select id="productCategory" class="${inputClass}">${categoryOptions}</select>
          </div>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="${labelClass}">Product Name</label>
            <input id="productName" required value="${escapeHtml(product ? product.name : '')}" class="${inputClass}" placeholder="Full product name" />
          </div>
          <div>
            <label class="${labelClass}">Brand</label>
            <input id="productBrand" value="${escapeHtml(product ? product.brand : '')}" class="${inputClass}" placeholder="AMD, NVIDIA..." />
          </div>
        </div>
        <div class="grid grid-cols-3 gap-4">
          <div>
            <label class="${labelClass}">Cost</label>
            <input id="productCost" type="number" min="0" step="0.01" value="${product ? product.cost : 0}" class="${inputClass}" />
          </div>
          <div>
            <label class="${labelClass}">Price</label>
            <input id="productPrice" type="number" min="0" step="0.01" value="${product ? product.price : 0}" class="${inputClass}" />
          </div>
          <div>
            <label class="${labelClass}">Warranty (mo)</label>
            <input id="productWarranty" type="number" min="0" value="${product ? product.warranty : 36}" class="${inputClass}" />
          </div>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="${labelClass}">${product ? 'Stock' : 'Initial Stock'}</label>
            <input id="productStock" type="number" min="0" value="${product ? product.stock : 0}" class="${inputClass}" />
          </div>
          <div>
            <label class="${labelClass}">Min Stock Level</label>
            <input id="productMinStock" type="number" min="0" value="${product ? product.minStock : 5}" class="${inputClass}" />
          </div>
        </div>
        ${modalFooter(product ? 'Save Changes' : 'Save Product')}
      </form>
    </div>
  `);
}

function saveProduct(id) {
  const sku = formValue('productSku');
  const name = formValue('productName');
  if (!sku || !name) {
    showToast('SKU and product name are required');
    return;
  }
  const payload = {
    sku,
    name,
    category: formValue('productCategory') || 'Uncategorized',
    brand: formValue('productBrand') || 'Generic',
    cost: formNumber('productCost'),
    price: formNumber('productPrice'),
    stock: formNumber('productStock'),
    minStock: formNumber('productMinStock'),
    warranty: formNumber('productWarranty'),
  };
  payload.status = payload.stock <= payload.minStock ? 'low' : 'active';

  if (id != null) {
    const product = findBy('products', id);
    if (product) Object.assign(product, payload);
  } else {
    data.products.push({ id: nextId(data.products), ...payload });
  }
  saveData();
  closeModal();
  refreshPage();
  showToast(id != null ? 'Product updated' : 'Product added');
}

// ==================== CATEGORIES ====================
function showCategoryModal(id) {
  const category = id != null ? findBy('categories', id) : null;
  openModal(`
    <div class="p-6">
      ${modalHeader(category ? 'Edit Category' : 'Add Category')}
      <form onsubmit="event.preventDefault(); saveCategory(${category ? category.id : 'null'})" class="space-y-4">
        <div>
          <label class="${labelClass}">Name</label>
          <input id="categoryName" required value="${escapeHtml(category ? category.name : '')}" class="${inputClass}" placeholder="Graphics Cards" />
        </div>
        <div>
          <label class="${labelClass}">Description</label>
          <textarea id="categoryDescription" rows="3" class="${inputClass}" placeholder="Short description...">${escapeHtml(category ? category.description : '')}</textarea>
        </div>
        ${modalFooter(category ? 'Save Changes' : 'Save Category')}
      </form>
    </div>
  `);
}

function saveCategory(id) {
  const name = formValue('categoryName');
  if (!name) {
    showToast('Category name is required');
    return;
  }
  if (id != null) {
    const category = findBy('categories', id);
    if (category) {
      if (category.name !== name) {
        data.products.forEach(p => {
          if (p.category === category.name) p.category = name;
        });
      }
      category.name = name;
      category.description = formValue('categoryDescription');
    }
  } else {
    data.categories.push({ id: nextId(data.categories), name, description: formValue('categoryDescription'), products: 0 });
  }
  saveData();
  closeModal();
  refreshPage();
  showToast(id != null ? 'Category updated' : 'Category added');
}

function viewCategoryProducts(id) {
  const category = findBy('categories', id);
  if (!category) return;
  navigate('products');
  const select = document.getElementById('catFilter');
  if (select) {
    select.value = category.name;
    filterProducts();
  }
}

// ==================== SUPPLIERS ====================
function showSupplierModal(id) {
  const supplier = id != null ? findBy('suppliers', id) : null;
  openModal(`
    <div class="p-6">
      ${modalHeader(supplier ? 'Edit Supplier' : 'Add Supplier')}
      <form onsubmit="event.preventDefault(); saveSupplier(${supplier ? supplier.id : 'null'})" class="space-y-4">
        <div>
          <label class="${labelClass}">Company Name</label>
          <input id="supplierName" required value="${escapeHtml(supplier ? supplier.name : '')}" class="${inputClass}" placeholder="TechDistributors Inc." />
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="${labelClass}">Contact Person</label>
            <input id="supplierContact" value="${escapeHtml(supplier ? supplier.contact : '')}" class="${inputClass}" />
          </div>
          <div>
            <label class="${labelClass}">City</label>
            <input id="supplierCity" value="${escapeHtml(supplier ? supplier.city : '')}" class="${inputClass}" />
          </div>
        </div>
        <div>
          <label class="${labelClass}">Email</label>
          <input id="supplierEmail" type="email" value="${escapeHtml(supplier ? supplier.email : '')}" class="${inputClass}" />
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="${labelClass}">Phone</label>
            <input id="supplierPhone" value="${escapeHtml(supplier ? supplier.phone : '')}" class="${inputClass}" />
          </div>
          <div>
            <label class="${labelClass}">Status</label>
            <select id="supplierStatus" class="${inputClass}">
              <option value="active" ${selected('active', supplier ? supplier.status : 'active')}>Active</option>
              <option value="inactive" ${selected('inactive', supplier ? supplier.status : '')}>Inactive</option>
            </select>
          </div>
        </div>
        ${modalFooter(supplier ? 'Save Changes' : 'Save Supplier')}
      </form>
    </div>
  `);
}

function saveSupplier(id) {
  const name = formValue('supplierName');
  if (!name) {
    showToast('Supplier name is required');
    return;
  }
  const payload = {
    name,
    contact: formValue('supplierContact'),
    email: formValue('supplierEmail'),
    phone: formValue('supplierPhone'),
    city: formValue('supplierCity'),
    status: formValue('supplierStatus') || 'active',
  };
  if (id != null) {
    const supplier = findBy('suppliers', id);
    if (supplier) Object.assign(supplier, payload);
  } else {
    data.suppliers.push({ id: nextId(data.suppliers), products: 0, ...payload });
  }
  saveData();
  closeModal();
  refreshPage();
  showToast(id != null ? 'Supplier updated' : 'Supplier added');
}

// ==================== PURCHASING ====================
function showPurchaseModal() {
  const supplierOptions = data.suppliers
    .filter(s => s.status === 'active')
    .map(s => `<option>${escapeHtml(s.name)}</option>`)
    .join('') || '<option value="">No active suppliers</option>';
  openModal(`
    <div class="p-6">
      ${modalHeader('New Purchase Order', nextPurchaseId())}
      <form onsubmit="event.preventDefault(); savePurchase()" class="space-y-4">
        <div>
          <label class="${labelClass}">Supplier</label>
          <select id="purchaseSupplier" required class="${inputClass}">${supplierOptions}</select>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="${labelClass}">Order Date</label>
            <input id="purchaseDate" type="date" value="${todayISO()}" class="${inputClass}" />
          </div>
          <div>
            <label class="${labelClass}">Status</label>
            <select id="purchaseStatus" class="${inputClass}">
              <option value="ordered">Ordered</option>
              <option value="partial">Partial</option>
              <option value="received">Received</option>
            </select>
          </div>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="${labelClass}">Items</label>
            <input id="purchaseItems" type="number" min="0" value="1" class="${inputClass}" />
          </div>
          <div>
            <label class="${labelClass}">Total Cost</label>
            <input id="purchaseTotal" type="number" min="0" step="0.01" value="0" class="${inputClass}" />
          </div>
        </div>
        ${modalFooter('Create Purchase Order')}
      </form>
    </div>
  `);
}

function savePurchase() {
  const supplier = formValue('purchaseSupplier');
  if (!supplier) {
    showToast('Select a supplier first');
    return;
  }
  data.purchases.unshift({
    id: nextPurchaseId(),
    supplier,
    date: formValue('purchaseDate') || todayISO(),
    items: formNumber('purchaseItems'),
    total: formNumber('purchaseTotal'),
    status: formValue('purchaseStatus') || 'ordered',
  });
  saveData();
  closeModal();
  refreshPage();
  showToast('Purchase order created');
}

function showPurchaseView(id) {
  const purchase = findBy('purchases', id);
  if (!purchase) return;
  openModal(`
    <div class="p-6">
      ${modalHeader('Purchase Order', purchase.id)}
      <div class="space-y-3 text-sm">
        <div class="flex justify-between border-b border-slate-100 pb-2"><span class="text-slate-500">Supplier</span><span class="font-medium">${escapeHtml(purchase.supplier)}</span></div>
        <div class="flex justify-between border-b border-slate-100 pb-2"><span class="text-slate-500">Date</span><span>${formatDate(purchase.date)}</span></div>
        <div class="flex justify-between border-b border-slate-100 pb-2"><span class="text-slate-500">Items</span><span>${purchase.items}</span></div>
        <div class="flex justify-between border-b border-slate-100 pb-2"><span class="text-slate-500">Total</span><span class="font-semibold">${formatCurrency(purchase.total)}</span></div>
        <div class="flex justify-between"><span class="text-slate-500">Status</span><span class="badge bg-slate-100 text-slate-600">${escapeHtml(purchase.status)}</span></div>
      </div>
      <div class="flex justify-end gap-3 pt-5">
        <button onclick="closeModal()" class="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg">Close</button>
        <button onclick="receivePurchase(${jsStr(purchase.id)})" class="px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg">Mark Received</button>
      </div>
    </div>
  `);
}

function receivePurchase(id) {
  const purchase = findBy('purchases', id);
  if (!purchase) return;
  if (purchase.status === 'received') {
    showToast('This purchase order is already received');
    return;
  }
  purchase.status = 'received';
  saveData();
  closeModal();
  refreshPage();
  showToast(`${purchase.id} marked as received`);
}

// ==================== SALES ====================
function showSaleModal() {
  const customerOptions = data.customers.map(c => `<option value="${c.id}">${escapeHtml(c.name)}</option>`).join('');
  const productOptions = data.products.map(p => `<option value="${p.id}">${escapeHtml(p.name)} — ${formatCurrency(p.price)} (${p.stock} in stock)</option>`).join('');
  if (!customerOptions || !productOptions) {
    showToast('Add at least one customer and product first');
    return;
  }
  openModal(`
    <div class="p-6">
      ${modalHeader('New Sale', nextCode('INV-', data.sales))}
      <form onsubmit="event.preventDefault(); saveSale()" class="space-y-4">
        <div>
          <label class="${labelClass}">Customer</label>
          <select id="saleCustomer" class="${inputClass}">${customerOptions}</select>
        </div>
        <div>
          <label class="${labelClass}">Product</label>
          <select id="saleProduct" class="${inputClass}">${productOptions}</select>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="${labelClass}">Quantity</label>
            <input id="saleQty" type="number" min="1" value="1" class="${inputClass}" />
          </div>
          <div>
            <label class="${labelClass}">Payment Method</label>
            <select id="salePayment" class="${inputClass}">
              <option value="card">Card</option>
              <option value="cash">Cash</option>
              <option value="transfer">Bank Transfer</option>
            </select>
          </div>
        </div>
        <div>
          <label class="${labelClass}">Sale Date</label>
          <input id="saleDate" type="date" value="${todayISO()}" class="${inputClass}" />
        </div>
        ${modalFooter('Complete Sale')}
      </form>
    </div>
  `);
}

function saveSale() {
  const customer = data.customers.find(c => String(c.id) === formValue('saleCustomer'));
  const product = data.products.find(p => String(p.id) === formValue('saleProduct'));
  const qty = formNumber('saleQty');
  const date = formValue('saleDate') || todayISO();
  if (!customer || !product) {
    showToast('Select a customer and product');
    return;
  }
  if (qty <= 0) {
    showToast('Quantity must be greater than zero');
    return;
  }
  if (product.stock < qty) {
    showToast(`Only ${product.stock} units of ${product.name} in stock`);
    return;
  }

  const id = nextCode('INV-', data.sales);
  const total = product.price * qty;

  product.stock -= qty;
  product.status = product.stock <= product.minStock ? 'low' : 'active';
  customer.orders = Number(customer.orders || 0) + 1;
  customer.spent = Number(customer.spent || 0) + total;

  data.sales.unshift({
    id,
    customer: customer.name,
    date,
    items: qty,
    total,
    status: 'completed',
    payment: formValue('salePayment') || 'cash',
  });
  data.stockMovements.unshift({
    id: nextId(data.stockMovements),
    type: 'out',
    product: product.name,
    qty,
    ref: id,
    date,
    user: 'Admin',
  });

  saveData();
  closeModal();
  refreshPage();
  showToast(`Sale ${id} completed`);
}

function saleInvoiceHtml(sale) {
  return `
    <div class="p-8">
      <div class="flex items-start justify-between mb-6">
        <div>
          <div class="flex items-center gap-2">
            <div class="w-9 h-9 rounded-lg bg-brand-600 text-white flex items-center justify-center"><i class="fas fa-laptop"></i></div>
            <span class="font-bold text-lg">TechVault</span>
          </div>
          <p class="text-xs text-slate-500 mt-2">Computer Shop Inventory</p>
        </div>
        <div class="text-right">
          <p class="text-xs text-slate-500 uppercase tracking-wide">Invoice</p>
          <p class="font-bold">${escapeHtml(sale.id)}</p>
          <p class="text-xs text-slate-500 mt-1">${formatDate(sale.date)}</p>
        </div>
      </div>
      <div class="grid grid-cols-2 gap-4 text-sm border-t border-b border-slate-100 py-4 mb-4">
        <div>
          <p class="text-xs text-slate-500">Billed To</p>
          <p class="font-medium">${escapeHtml(sale.customer)}</p>
        </div>
        <div class="text-right">
          <p class="text-xs text-slate-500">Payment</p>
          <p class="font-medium capitalize">${escapeHtml(sale.payment)}</p>
        </div>
      </div>
      <table class="w-full text-sm">
        <thead>
          <tr class="text-left text-slate-500 border-b border-slate-100">
            <th class="pb-2 font-medium">Description</th>
            <th class="pb-2 font-medium text-center">Qty</th>
            <th class="pb-2 font-medium text-right">Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr class="border-b border-slate-50">
            <td class="py-3">Items purchased</td>
            <td class="py-3 text-center">${sale.items}</td>
            <td class="py-3 text-right">${formatCurrency(sale.total)}</td>
          </tr>
        </tbody>
      </table>
      <div class="flex justify-end mt-4">
        <div class="w-52 text-sm">
          <div class="flex justify-between font-semibold text-base pt-2 border-t border-slate-200">
            <span>Total</span>
            <span>${formatCurrency(sale.total)}</span>
          </div>
        </div>
      </div>
      <p class="text-xs text-slate-400 mt-8 text-center">Thank you for shopping with TechVault.</p>
      <div class="no-print flex justify-end gap-3 pt-5">
        <button onclick="closeModal()" class="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg">Close</button>
        <button onclick="window.print()" class="px-4 py-2 text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 rounded-lg"><i class="fas fa-print mr-1"></i> Print</button>
      </div>
    </div>
  `;
}

function showSaleView(id) {
  const sale = findBy('sales', id);
  if (!sale) return;
  openModal(saleInvoiceHtml(sale));
}

function printSale(id) {
  showSaleView(id);
  setTimeout(() => window.print(), 150);
}

function refundSale(id) {
  const sale = findBy('sales', id);
  if (!sale) return;
  if (sale.status === 'refunded') {
    showToast('This invoice is already refunded');
    return;
  }
  sale.status = 'refunded';
  saveData();
  closeModal();
  refreshPage();
  showToast(`${sale.id} marked as refunded`);
}

// ==================== CUSTOMERS ====================
function showCustomerModal(id) {
  const customer = id != null ? findBy('customers', id) : null;
  openModal(`
    <div class="p-6">
      ${modalHeader(customer ? 'Edit Customer' : 'Add Customer')}
      <form onsubmit="event.preventDefault(); saveCustomer(${customer ? customer.id : 'null'})" class="space-y-4">
        <div>
          <label class="${labelClass}">Name</label>
          <input id="customerName" required value="${escapeHtml(customer ? customer.name : '')}" class="${inputClass}" placeholder="Full name or company" />
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="${labelClass}">Email</label>
            <input id="customerEmail" type="email" value="${escapeHtml(customer ? customer.email : '')}" class="${inputClass}" />
          </div>
          <div>
            <label class="${labelClass}">Phone</label>
            <input id="customerPhone" value="${escapeHtml(customer ? customer.phone : '')}" class="${inputClass}" />
          </div>
        </div>
        <div>
          <label class="${labelClass}">Type</label>
          <select id="customerType" class="${inputClass}">
            <option value="retail" ${selected('retail', customer ? customer.type : 'retail')}>Retail</option>
            <option value="wholesale" ${selected('wholesale', customer ? customer.type : '')}>Wholesale</option>
          </select>
        </div>
        ${modalFooter(customer ? 'Save Changes' : 'Save Customer')}
      </form>
    </div>
  `);
}

function saveCustomer(id) {
  const name = formValue('customerName');
  if (!name) {
    showToast('Customer name is required');
    return;
  }
  const payload = {
    name,
    email: formValue('customerEmail'),
    phone: formValue('customerPhone'),
    type: formValue('customerType') || 'retail',
  };
  if (id != null) {
    const customer = findBy('customers', id);
    if (customer) {
      const oldName = customer.name;
      Object.assign(customer, payload);
      if (oldName !== name) {
        data.sales.forEach(s => { if (s.customer === oldName) s.customer = name; });
        data.warranties.forEach(w => { if (w.customer === oldName) w.customer = name; });
      }
    }
  } else {
    data.customers.push({ id: nextId(data.customers), orders: 0, spent: 0, ...payload });
  }
  saveData();
  closeModal();
  refreshPage();
  showToast(id != null ? 'Customer updated' : 'Customer added');
}

function showCustomerView(id) {
  const customer = findBy('customers', id);
  if (!customer) return;
  const sales = data.sales.filter(s => s.customer === customer.name);
  openModal(`
    <div class="p-6">
      ${modalHeader(customer.name, customer.type === 'wholesale' ? 'Wholesale customer' : 'Retail customer')}
      <div class="grid grid-cols-2 gap-3 mb-5 text-sm">
        <div class="bg-slate-50 rounded-xl p-3">
          <p class="text-xs text-slate-500">Email</p>
          <p class="font-medium truncate">${escapeHtml(customer.email || '—')}</p>
        </div>
        <div class="bg-slate-50 rounded-xl p-3">
          <p class="text-xs text-slate-500">Phone</p>
          <p class="font-medium">${escapeHtml(customer.phone || '—')}</p>
        </div>
        <div class="bg-slate-50 rounded-xl p-3">
          <p class="text-xs text-slate-500">Orders</p>
          <p class="font-medium">${customer.orders}</p>
        </div>
        <div class="bg-slate-50 rounded-xl p-3">
          <p class="text-xs text-slate-500">Total Spent</p>
          <p class="font-medium">${formatCurrency(customer.spent)}</p>
        </div>
      </div>
      <h4 class="font-semibold text-sm mb-2">Recent Invoices</h4>
      <div class="space-y-2">
        ${sales.slice(0, 5).map(s => `
          <div class="flex items-center justify-between p-3 bg-slate-50 rounded-xl text-sm">
            <div>
              <p class="font-medium text-brand-600">${escapeHtml(s.id)}</p>
              <p class="text-xs text-slate-500">${formatDate(s.date)} · ${s.items} items</p>
            </div>
            <span class="font-semibold">${formatCurrency(s.total)}</span>
          </div>
        `).join('') || '<p class="text-sm text-slate-500">No invoices for this customer yet.</p>'}
      </div>
      <div class="flex justify-end gap-3 pt-5">
        <button onclick="closeModal()" class="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg">Close</button>
        <button onclick="showCustomerModal(${customer.id})" class="px-4 py-2 text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 rounded-lg">Edit Customer</button>
      </div>
    </div>
  `);
}

// ==================== WARRANTY ====================
function showWarrantyModal() {
  if (!data.products.length) {
    showToast('Add a product before registering a warranty');
    return;
  }
  const productOptions = data.products.map(p => `<option value="${p.id}">${escapeHtml(p.name)}</option>`).join('');
  const customerOptions = data.customers.map(c => `<option value="${c.id}">${escapeHtml(c.name)}</option>`).join('');
  if (!customerOptions) {
    showToast('Add a customer before registering a warranty');
    return;
  }
  const firstWarranty = data.products[0].warranty;
  openModal(`
    <div class="p-6">
      ${modalHeader('Register Warranty', nextCode('WR-', data.warranties))}
      <form onsubmit="event.preventDefault(); saveWarranty()" class="space-y-4">
        <div>
          <label class="${labelClass}">Product</label>
          <select id="warrantyProduct" class="${inputClass}" onchange="updateWarrantyExpiry()">${productOptions}</select>
        </div>
        <div>
          <label class="${labelClass}">Serial Number</label>
          <input id="warrantySerial" required class="${inputClass}" placeholder="e.g. NV-4090-A8F29C" />
        </div>
        <div>
          <label class="${labelClass}">Customer</label>
          <select id="warrantyCustomer" class="${inputClass}">${customerOptions}</select>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="${labelClass}">Purchase Date</label>
            <input id="warrantyPurchaseDate" type="date" value="${todayISO()}" class="${inputClass}" onchange="updateWarrantyExpiry()" />
          </div>
          <div>
            <label class="${labelClass}">Expiry Date</label>
            <input id="warrantyExpiry" type="date" value="${addMonths(todayISO(), firstWarranty)}" class="${inputClass}" />
          </div>
        </div>
        ${modalFooter('Register Warranty')}
      </form>
    </div>
  `);
}

function updateWarrantyExpiry() {
  const product = data.products.find(p => String(p.id) === formValue('warrantyProduct'));
  const purchaseDate = formValue('warrantyPurchaseDate');
  const expiryEl = document.getElementById('warrantyExpiry');
  if (product && expiryEl) {
    expiryEl.value = addMonths(purchaseDate, product.warranty);
  }
}

function saveWarranty() {
  const product = data.products.find(p => String(p.id) === formValue('warrantyProduct'));
  const customer = data.customers.find(c => String(c.id) === formValue('warrantyCustomer'));
  const serial = formValue('warrantySerial');
  if (!product || !customer || !serial) {
    showToast('Product, customer and serial are required');
    return;
  }
  data.warranties.unshift({
    id: nextCode('WR-', data.warranties),
    product: product.name,
    serial,
    customer: customer.name,
    purchaseDate: formValue('warrantyPurchaseDate') || todayISO(),
    expiry: formValue('warrantyExpiry') || addMonths(todayISO(), product.warranty),
    status: 'active',
  });
  saveData();
  closeModal();
  refreshPage();
  showToast('Warranty registered');
}

function claimWarranty(id) {
  const warranty = findBy('warranties', id);
  if (!warranty) return;
  if (warranty.status === 'claimed') {
    showToast('This warranty was already claimed');
    return;
  }
  warranty.status = 'claimed';
  saveData();
  closeModal();
  refreshPage();
  showToast(`${warranty.id} marked as claimed`);
}

function showWarrantyView(id) {
  const warranty = findBy('warranties', id);
  if (!warranty) return;
  openModal(`
    <div class="p-6">
      ${modalHeader('Warranty Details', warranty.id)}
      <div class="space-y-3 text-sm">
        <div class="flex justify-between border-b border-slate-100 pb-2"><span class="text-slate-500">Product</span><span class="font-medium">${escapeHtml(warranty.product)}</span></div>
        <div class="flex justify-between border-b border-slate-100 pb-2"><span class="text-slate-500">Serial</span><span class="font-mono">${escapeHtml(warranty.serial)}</span></div>
        <div class="flex justify-between border-b border-slate-100 pb-2"><span class="text-slate-500">Customer</span><span>${escapeHtml(warranty.customer)}</span></div>
        <div class="flex justify-between border-b border-slate-100 pb-2"><span class="text-slate-500">Purchased</span><span>${formatDate(warranty.purchaseDate)}</span></div>
        <div class="flex justify-between border-b border-slate-100 pb-2"><span class="text-slate-500">Expires</span><span>${formatDate(warranty.expiry)}</span></div>
        <div class="flex justify-between"><span class="text-slate-500">Status</span><span class="badge ${warranty.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}">${escapeHtml(warranty.status)}</span></div>
      </div>
      <div class="flex justify-end gap-3 pt-5">
        <button onclick="closeModal()" class="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg">Close</button>
        <button onclick="claimWarranty(${jsStr(warranty.id)})" class="px-4 py-2 text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 rounded-lg">File Claim</button>
      </div>
    </div>
  `);
}

// ==================== USERS ====================
function showUserModal(id) {
  const user = id != null ? findBy('users', id) : null;
  const roles = ['Administrator', 'Sales Staff', 'Inventory Manager', 'Accountant'];
  openModal(`
    <div class="p-6">
      ${modalHeader(user ? 'Edit User' : 'Add User')}
      <form onsubmit="event.preventDefault(); saveUser(${user ? user.id : 'null'})" class="space-y-4">
        <div>
          <label class="${labelClass}">Full Name</label>
          <input id="userName" required value="${escapeHtml(user ? user.name : '')}" class="${inputClass}" placeholder="Jane Doe" />
        </div>
        <div>
          <label class="${labelClass}">Email</label>
          <input id="userEmail" type="email" required value="${escapeHtml(user ? user.email : '')}" class="${inputClass}" placeholder="jane@techvault.com" />
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="${labelClass}">Role</label>
            <select id="userRole" class="${inputClass}">
              ${roles.map(r => `<option ${selected(r, user ? user.role : 'Sales Staff')}>${r}</option>`).join('')}
            </select>
          </div>
          <div>
            <label class="${labelClass}">Status</label>
            <select id="userStatus" class="${inputClass}">
              <option value="active" ${selected('active', user ? user.status : 'active')}>Active</option>
              <option value="inactive" ${selected('inactive', user ? user.status : '')}>Inactive</option>
            </select>
          </div>
        </div>
        ${modalFooter(user ? 'Save Changes' : 'Add User')}
      </form>
    </div>
  `);
}

function saveUser(id) {
  const name = formValue('userName');
  const email = formValue('userEmail');
  if (!name || !email) {
    showToast('Name and email are required');
    return;
  }
  const payload = {
    name,
    email,
    role: formValue('userRole') || 'Sales Staff',
    status: formValue('userStatus') || 'active',
  };
  if (id != null) {
    const user = findBy('users', id);
    if (user) Object.assign(user, payload);
  } else {
    data.users.push({ id: nextId(data.users), lastLogin: '—', ...payload });
  }
  saveData();
  closeModal();
  refreshPage();
  showToast(id != null ? 'User updated' : 'User added');
}

function toggleUserStatus(id) {
  const user = findBy('users', id);
  if (!user) return;
  user.status = user.status === 'active' ? 'inactive' : 'active';
  saveData();
  refreshPage();
  showToast(`${user.name} is now ${user.status}`);
}

// ==================== STOCK ====================
function showStockModal(type) {
  if (!data.products.length) {
    showToast('Add a product first');
    return;
  }
  const productOptions = data.products.map(p => `<option value="${p.id}">${escapeHtml(p.name)} (${p.stock} in stock)</option>`).join('');
  const isIn = type === 'in';
  openModal(`
    <div class="p-6">
      ${modalHeader(isIn ? 'Stock In' : 'Stock Out')}
      <form onsubmit="event.preventDefault(); saveStockMovement('${isIn ? 'in' : 'out'}')" class="space-y-4">
        <div>
          <label class="${labelClass}">Product</label>
          <select id="stockProduct" class="${inputClass}">${productOptions}</select>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="${labelClass}">Quantity</label>
            <input id="stockQty" type="number" min="1" required value="1" class="${inputClass}" />
          </div>
          <div>
            <label class="${labelClass}">Reference</label>
            <input id="stockRef" class="${inputClass}" placeholder="${isIn ? 'PO-XXXX' : 'INV-XXXX'}" />
          </div>
        </div>
        <div>
          <label class="${labelClass}">Notes</label>
          <textarea id="stockNotes" rows="2" class="${inputClass}" placeholder="Optional notes..."></textarea>
        </div>
        ${modalFooter(isIn ? 'Confirm Stock In' : 'Confirm Stock Out', isIn ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700')}
      </form>
    </div>
  `);
}

function saveStockMovement(type) {
  const product = data.products.find(p => String(p.id) === formValue('stockProduct'));
  const qty = formNumber('stockQty');
  if (!product) {
    showToast('Select a product');
    return;
  }
  if (qty <= 0) {
    showToast('Quantity must be greater than zero');
    return;
  }
  if (type === 'out' && product.stock < qty) {
    showToast(`Only ${product.stock} units of ${product.name} in stock`);
    return;
  }

  product.stock += type === 'in' ? qty : -qty;
  product.status = product.stock <= product.minStock ? 'low' : 'active';
  data.stockMovements.unshift({
    id: nextId(data.stockMovements),
    type,
    product: product.name,
    qty,
    ref: formValue('stockRef') || (type === 'in' ? 'MANUAL-IN' : 'MANUAL-OUT'),
    date: todayISO(),
    user: 'Admin',
  });

  saveData();
  closeModal();
  refreshPage();
  showToast(type === 'in' ? 'Stock in recorded' : 'Stock out recorded');
}

// ==================== DELETE / RESET ====================
const collectionLabels = {
  products: 'product',
  categories: 'category',
  suppliers: 'supplier',
  purchases: 'purchase order',
  sales: 'invoice',
  customers: 'customer',
  warranties: 'warranty',
  users: 'user',
};

function confirmDelete(collection, id) {
  const record = findBy(collection, id);
  if (!record) return;
  const name = record.name || record.id;
  const label = collectionLabels[collection] || 'record';
  openModal(`
    <div class="p-6">
      ${modalHeader('Delete ' + label)}
      <p class="text-sm text-slate-600">Are you sure you want to delete <span class="font-semibold">${escapeHtml(name)}</span>? This action cannot be undone.</p>
      <div class="flex justify-end gap-3 pt-6">
        <button onclick="closeModal()" class="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
        <button onclick="performDelete('${collection}', ${jsStr(id)})" class="px-4 py-2 text-sm font-medium text-white bg-rose-600 hover:bg-rose-700 rounded-lg">Delete</button>
      </div>
    </div>
  `);
}

function performDelete(collection, id) {
  if (!data[collection]) return;
  data[collection] = data[collection].filter(item => String(item.id) !== String(id));
  saveData();
  closeModal();
  refreshPage();
  showToast('Record deleted');
}

function confirmReset() {
  openModal(`
    <div class="p-6">
      ${modalHeader('Reset Demo Data')}
      <p class="text-sm text-slate-600">This will discard all changes you made and restore the original sample data. Continue?</p>
      <div class="flex justify-end gap-3 pt-6">
        <button onclick="closeModal()" class="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
        <button onclick="performReset()" class="px-4 py-2 text-sm font-medium text-white bg-rose-600 hover:bg-rose-700 rounded-lg">Reset Data</button>
      </div>
    </div>
  `);
}

function performReset() {
  resetData();
  closeModal();
  refreshPage();
  showToast('Sample data restored');
}

// ==================== CSV EXPORT ====================
function exportCsv(collection) {
  const rows = data[collection];
  if (!rows || !rows.length) {
    showToast('Nothing to export');
    return;
  }
  const headers = Object.keys(rows[0]);
  const escapeCell = value => `"${String(value ?? '').replace(/"/g, '""')}"`;
  const csv = [
    headers.map(escapeCell).join(','),
    ...rows.map(row => headers.map(key => escapeCell(row[key])).join(',')),
  ].join('\r\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `techvault-${collection}-${todayISO()}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  showToast(`${collection} exported`);
}
