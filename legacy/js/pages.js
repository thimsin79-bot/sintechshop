// ==================== PAGE RENDERERS ====================
const pages = {
  dashboard() {
    const totalProducts = data.products.length;
    const lowStock = data.products.filter(p => p.stock <= p.minStock).length;
    const totalSales = data.sales.filter(s => s.status === 'completed').reduce((sum, item) => sum + item.total, 0);
    const totalStockValue = data.products.reduce((sum, p) => sum + p.stock * p.cost, 0);

    return `
      <div class="fade-in space-y-6">
        <div class="relative">
          <div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-1.5 flex items-center gap-2 focus-within:ring-2 focus-within:ring-brand-500 focus-within:border-brand-500 transition">
            <div class="pl-3 text-slate-400"><i class="fas fa-search"></i></div>
            <input
              type="text"
              id="dashboardSearch"
              placeholder="Search products, SKUs, customers, invoices, warranties..."
              class="flex-1 py-2.5 px-2 text-sm bg-transparent focus:outline-none placeholder:text-slate-400"
              oninput="handleDashboardSearch(this.value)"
              onfocus="handleDashboardSearch(this.value)"
              autocomplete="off"
            />
            <kbd class="hidden sm:inline-flex items-center gap-1 px-2 py-1 text-[10px] font-medium text-slate-400 bg-slate-100 rounded border border-slate-200 mr-1">⌘K</kbd>
          </div>
          <div id="dashboardSearchResults" class="hidden absolute z-30 top-full left-0 right-0 mt-2 bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden max-h-80 overflow-y-auto"></div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          <div class="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm card-hover">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-slate-500 font-medium">Total Products</p>
                <p class="text-2xl font-bold mt-1">${totalProducts}</p>
                <p class="text-xs text-emerald-600 mt-1"><i class="fas fa-arrow-up"></i> 4 new this month</p>
              </div>
              <div class="w-12 h-12 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center text-xl"><i class="fas fa-box"></i></div>
            </div>
          </div>
          <div class="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm card-hover">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-slate-500 font-medium">Low Stock Alerts</p>
                <p class="text-2xl font-bold mt-1 text-amber-600">${lowStock}</p>
                <p class="text-xs text-slate-500 mt-1">Needs restocking</p>
              </div>
              <div class="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-xl"><i class="fas fa-exclamation-triangle"></i></div>
            </div>
          </div>
          <div class="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm card-hover">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-slate-500 font-medium">Sales (This Week)</p>
                <p class="text-2xl font-bold mt-1">${formatCurrency(totalSales)}</p>
                <p class="text-xs text-emerald-600 mt-1"><i class="fas fa-arrow-up"></i> 12% vs last week</p>
              </div>
              <div class="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl"><i class="fas fa-dollar-sign"></i></div>
            </div>
          </div>
          <div class="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm card-hover">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-slate-500 font-medium">Inventory Value</p>
                <p class="text-2xl font-bold mt-1">${formatCurrency(totalStockValue)}</p>
                <p class="text-xs text-slate-500 mt-1">At cost price</p>
              </div>
              <div class="w-12 h-12 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center text-xl"><i class="fas fa-warehouse"></i></div>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div class="xl:col-span-2 bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
            <div class="flex items-center justify-between mb-4">
              <h3 class="font-semibold text-slate-800">Sales Overview</h3>
              <select class="text-sm border border-slate-200 rounded-lg px-3 py-1.5 bg-slate-50">
                <option>Last 7 days</option>
                <option>Last 30 days</option>
              </select>
            </div>
            <canvas id="salesChart" height="120"></canvas>
          </div>

          <div class="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
            <h3 class="font-semibold text-slate-800 mb-4">Low Stock Items</h3>
            <div class="space-y-3">
              ${data.products.filter(p => p.stock <= p.minStock).map(p => `
                <div class="flex items-center justify-between p-3 bg-amber-50 rounded-xl border border-amber-100">
                  <div class="min-w-0">
                    <p class="text-sm font-medium truncate">${escapeHtml(p.name)}</p>
                    <p class="text-xs text-slate-500">${escapeHtml(p.sku)}</p>
                  </div>
                  <span class="badge bg-amber-200 text-amber-800">${p.stock} left</span>
                </div>
              `).join('') || '<p class="text-sm text-slate-500">All stocks healthy</p>'}
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div class="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
            <div class="flex items-center justify-between mb-4">
              <h3 class="font-semibold text-slate-800">Recent Sales</h3>
              <button onclick="navigate('sales')" class="text-xs text-brand-600 font-medium hover:underline">View all</button>
            </div>
            <div class="overflow-x-auto">
              <table class="w-full text-sm">
                <thead>
                  <tr class="text-left text-slate-500 border-b border-slate-100">
                    <th class="pb-3 font-medium">Invoice</th>
                    <th class="pb-3 font-medium">Customer</th>
                    <th class="pb-3 font-medium">Total</th>
                    <th class="pb-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  ${data.sales.slice(0, 5).map(s => `
                    <tr class="table-row border-b border-slate-50 cursor-pointer" onclick="showSaleView(${jsStr(s.id)})">
                      <td class="py-3 font-medium text-brand-600">${escapeHtml(s.id)}</td>
                      <td class="py-3">${escapeHtml(s.customer)}</td>
                      <td class="py-3">${formatCurrency(s.total)}</td>
                      <td class="py-3"><span class="badge ${s.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}">${escapeHtml(s.status)}</span></td>
                    </tr>
                  `).join('') || '<tr><td colspan="4" class="py-6 text-center text-slate-500">No sales yet</td></tr>'}
                </tbody>
              </table>
            </div>
          </div>
          <div class="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
            <div class="flex items-center justify-between mb-4">
              <h3 class="font-semibold text-slate-800">Recent Stock Movements</h3>
              <button onclick="navigate('inventory')" class="text-xs text-brand-600 font-medium hover:underline">View all</button>
            </div>
            <div class="space-y-3">
              ${data.stockMovements.slice(0, 5).map(m => `
                <div class="flex items-center gap-3 p-3 rounded-xl bg-slate-50">
                  <div class="w-9 h-9 rounded-lg flex items-center justify-center ${m.type === 'in' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}">
                    <i class="fas fa-arrow-${m.type === 'in' ? 'down' : 'up'}"></i>
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium truncate">${escapeHtml(m.product)}</p>
                    <p class="text-xs text-slate-500">${escapeHtml(m.ref)} • ${formatDate(m.date)}</p>
                  </div>
                  <span class="text-sm font-semibold ${m.type === 'in' ? 'text-emerald-600' : 'text-rose-600'}">${m.type === 'in' ? '+' : '-'}${m.qty}</span>
                </div>
              `).join('') || '<p class="text-sm text-slate-500">No stock movements yet</p>'}
            </div>
          </div>
        </div>
      </div>
    `;
  },

  products() {
    return `
      <div class="fade-in space-y-5">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div class="flex items-center gap-3">
            <div class="relative">
              <i class="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm"></i>
              <input type="text" id="productSearch" placeholder="Search products..." class="pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 w-64 bg-white" oninput="filterProducts()" />
            </div>
            <select id="catFilter" class="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white" onchange="filterProducts()">
              <option value="">All Categories</option>
              ${data.categories.map(c => `<option value="${escapeHtml(c.name)}">${escapeHtml(c.name)}</option>`).join('')}
            </select>
          </div>
          <button onclick="showProductModal()" class="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium px-4 py-2.5 rounded-xl shadow-sm shadow-brand-500/30 transition">
            <i class="fas fa-plus"></i> Add Product
          </button>
        </div>

        <div class="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-sm" id="productsTable">
              <thead class="bg-slate-50 text-slate-500">
                <tr class="text-left">
                  <th class="px-5 py-3.5 font-medium">SKU / Product</th>
                  <th class="px-5 py-3.5 font-medium">Category</th>
                  <th class="px-5 py-3.5 font-medium">Stock</th>
                  <th class="px-5 py-3.5 font-medium">Cost</th>
                  <th class="px-5 py-3.5 font-medium">Price</th>
                  <th class="px-5 py-3.5 font-medium">Warranty</th>
                  <th class="px-5 py-3.5 font-medium">Status</th>
                  <th class="px-5 py-3.5 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                ${data.products.map(p => `
                  <tr class="table-row border-t border-slate-50 product-row" data-name="${escapeHtml((p.name + ' ' + p.sku + ' ' + p.brand).toLowerCase())}" data-cat="${escapeHtml(p.category)}">
                    <td class="px-5 py-3.5">
                      <div class="font-medium text-slate-900">${escapeHtml(p.name)}</div>
                      <div class="text-xs text-slate-500">${escapeHtml(p.sku)}</div>
                    </td>
                    <td class="px-5 py-3.5"><span class="badge bg-slate-100 text-slate-600">${escapeHtml(p.category)}</span></td>
                    <td class="px-5 py-3.5">
                      <span class="font-semibold ${p.stock <= p.minStock ? 'text-amber-600' : 'text-slate-800'}">${p.stock}</span>
                      <span class="text-xs text-slate-400">/ ${p.minStock} min</span>
                    </td>
                    <td class="px-5 py-3.5">${formatCurrency(p.cost)}</td>
                    <td class="px-5 py-3.5 font-medium">${formatCurrency(p.price)}</td>
                    <td class="px-5 py-3.5">${p.warranty} mo</td>
                    <td class="px-5 py-3.5">
                      <span class="badge ${p.stock <= p.minStock ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}">
                        ${p.stock <= p.minStock ? 'Low Stock' : 'In Stock'}
                      </span>
                    </td>
                    <td class="px-5 py-3.5 text-right whitespace-nowrap">
                      <button onclick="showProductModal(${p.id})" class="text-slate-400 hover:text-brand-600 p-1.5" title="Edit"><i class="fas fa-edit"></i></button>
                      <button onclick="confirmDelete('products', ${p.id})" class="text-slate-400 hover:text-rose-600 p-1.5" title="Delete"><i class="fas fa-trash"></i></button>
                    </td>
                  </tr>
                `).join('') || '<tr><td colspan="8" class="px-5 py-10 text-center text-slate-500">No products yet. Add your first product.</td></tr>'}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  },

  categories() {
    const countFor = name => data.products.filter(p => p.category === name).length;
    return `
      <div class="fade-in space-y-5">
        <div class="flex justify-between items-center">
          <p class="text-sm text-slate-500">${data.categories.length} categories</p>
          <button onclick="showCategoryModal()" class="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium px-4 py-2.5 rounded-xl shadow-sm transition">
            <i class="fas fa-plus"></i> Add Category
          </button>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          ${data.categories.map(c => `
            <div class="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm card-hover">
              <div class="flex items-start justify-between">
                <div class="w-11 h-11 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center text-lg"><i class="fas fa-tag"></i></div>
                <div class="flex gap-1">
                  <button onclick="showCategoryModal(${c.id})" class="text-slate-400 hover:text-brand-600 p-1" title="Edit"><i class="fas fa-edit text-sm"></i></button>
                  <button onclick="confirmDelete('categories', ${c.id})" class="text-slate-400 hover:text-rose-600 p-1" title="Delete"><i class="fas fa-trash text-sm"></i></button>
                </div>
              </div>
              <h3 class="font-semibold mt-4 text-slate-900">${escapeHtml(c.name)}</h3>
              <p class="text-sm text-slate-500 mt-1">${escapeHtml(c.description || '')}</p>
              <div class="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                <span class="text-xs text-slate-500">${countFor(c.name)} products</span>
                <button onclick="viewCategoryProducts(${c.id})" class="text-xs text-brand-600 font-medium hover:underline">View products →</button>
              </div>
            </div>
          `).join('') || '<p class="text-sm text-slate-500">No categories yet.</p>'}
        </div>
      </div>
    `;
  },

  inventory() {
    return `
      <div class="fade-in space-y-5">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div class="flex flex-col sm:flex-row gap-3 flex-1">
            <div class="relative flex-1 max-w-md">
              <i class="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm"></i>
              <input
                type="text"
                id="inventorySearch"
                placeholder="Search by product, reference, user..."
                class="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent bg-white"
                oninput="filterInventory()"
              />
            </div>
            <select id="inventoryTypeFilter" class="text-sm border border-slate-200 rounded-xl px-3 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500" onchange="filterInventory()">
              <option value="">All Types</option>
              <option value="in">Stock In</option>
              <option value="out">Stock Out</option>
            </select>
          </div>
          <div class="flex gap-3">
            <button onclick="showStockModal('in')" class="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium px-5 py-2.5 rounded-xl shadow-sm transition">
              <i class="fas fa-arrow-down"></i> Stock In
            </button>
            <button onclick="showStockModal('out')" class="inline-flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-700 text-white text-sm font-medium px-5 py-2.5 rounded-xl shadow-sm transition">
              <i class="fas fa-arrow-up"></i> Stock Out
            </button>
          </div>
        </div>

        <div class="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div class="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 class="font-semibold">Stock Movement History</h3>
            <span id="inventoryResultCount" class="text-xs text-slate-500">${data.stockMovements.length} records</span>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead class="bg-slate-50 text-slate-500">
                <tr class="text-left">
                  <th class="px-5 py-3.5 font-medium">Type</th>
                  <th class="px-5 py-3.5 font-medium">Product</th>
                  <th class="px-5 py-3.5 font-medium">Qty</th>
                  <th class="px-5 py-3.5 font-medium">Reference</th>
                  <th class="px-5 py-3.5 font-medium">Date</th>
                  <th class="px-5 py-3.5 font-medium">User</th>
                </tr>
              </thead>
              <tbody id="inventoryTableBody">
                ${data.stockMovements.map(m => `
                  <tr class="table-row border-t border-slate-50 inventory-row" data-product="${escapeHtml(m.product.toLowerCase())}" data-ref="${escapeHtml(String(m.ref).toLowerCase())}" data-user="${escapeHtml(String(m.user).toLowerCase())}" data-type="${escapeHtml(m.type)}">
                    <td class="px-5 py-3.5">
                      <span class="badge ${m.type === 'in' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}">
                        <i class="fas fa-arrow-${m.type === 'in' ? 'down' : 'up'} mr-1"></i>${m.type.toUpperCase()}
                      </span>
                    </td>
                    <td class="px-5 py-3.5 font-medium">${escapeHtml(m.product)}</td>
                    <td class="px-5 py-3.5 font-semibold ${m.type === 'in' ? 'text-emerald-600' : 'text-rose-600'}">${m.type === 'in' ? '+' : '-'}${m.qty}</td>
                    <td class="px-5 py-3.5 text-brand-600">${escapeHtml(m.ref)}</td>
                    <td class="px-5 py-3.5">${formatDate(m.date)}</td>
                    <td class="px-5 py-3.5">${escapeHtml(m.user)}</td>
                  </tr>
                `).join('') || '<tr><td colspan="6" class="px-5 py-10 text-center text-slate-500">No stock movements yet</td></tr>'}
              </tbody>
            </table>
          </div>
          <div id="inventoryEmpty" class="hidden px-5 py-10 text-center text-slate-500 text-sm">
            <i class="fas fa-search text-2xl mb-2 opacity-40"></i>
            <p>No stock movements match your search</p>
          </div>
        </div>
      </div>
    `;
  },

  suppliers() {
    return `
      <div class="fade-in space-y-5">
        <div class="flex justify-between items-center">
          <p class="text-sm text-slate-500">${data.suppliers.length} suppliers</p>
          <button onclick="showSupplierModal()" class="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium px-4 py-2.5 rounded-xl shadow-sm transition">
            <i class="fas fa-plus"></i> Add Supplier
          </button>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
          ${data.suppliers.map(s => `
            <div class="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm card-hover">
              <div class="flex items-start justify-between">
                <div class="flex items-center gap-3">
                  <div class="w-12 h-12 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center text-lg font-bold">${initials(s.name)}</div>
                  <div>
                    <h3 class="font-semibold text-slate-900">${escapeHtml(s.name)}</h3>
                    <p class="text-xs text-slate-500">${escapeHtml(s.city)}</p>
                  </div>
                </div>
                <span class="badge ${s.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}">${escapeHtml(s.status)}</span>
              </div>
              <div class="mt-4 space-y-2 text-sm">
                <p class="flex items-center gap-2 text-slate-600"><i class="fas fa-user w-4 text-slate-400"></i> ${escapeHtml(s.contact)}</p>
                <p class="flex items-center gap-2 text-slate-600"><i class="fas fa-envelope w-4 text-slate-400"></i> ${escapeHtml(s.email)}</p>
                <p class="flex items-center gap-2 text-slate-600"><i class="fas fa-phone w-4 text-slate-400"></i> ${escapeHtml(s.phone)}</p>
              </div>
              <div class="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                <span class="text-xs text-slate-500">${s.products} linked products</span>
                <div class="flex gap-3">
                  <button onclick="navigate('purchasing')" class="text-xs text-brand-600 font-medium hover:underline">Orders</button>
                  <button onclick="showSupplierModal(${s.id})" class="text-xs text-slate-500 hover:text-brand-600" title="Edit"><i class="fas fa-edit"></i></button>
                  <button onclick="confirmDelete('suppliers', ${s.id})" class="text-xs text-slate-500 hover:text-rose-600" title="Delete"><i class="fas fa-trash"></i></button>
                </div>
              </div>
            </div>
          `).join('') || '<p class="text-sm text-slate-500">No suppliers yet.</p>'}
        </div>
      </div>
    `;
  },

  purchasing() {
    return `
      <div class="fade-in space-y-5">
        <div class="flex justify-between items-center">
          <p class="text-sm text-slate-500">${data.purchases.length} purchase orders</p>
          <button onclick="showPurchaseModal()" class="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium px-4 py-2.5 rounded-xl shadow-sm transition">
            <i class="fas fa-plus"></i> New Purchase Order
          </button>
        </div>
        <div class="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead class="bg-slate-50 text-slate-500">
                <tr class="text-left">
                  <th class="px-5 py-3.5 font-medium">PO Number</th>
                  <th class="px-5 py-3.5 font-medium">Supplier</th>
                  <th class="px-5 py-3.5 font-medium">Date</th>
                  <th class="px-5 py-3.5 font-medium">Items</th>
                  <th class="px-5 py-3.5 font-medium">Total</th>
                  <th class="px-5 py-3.5 font-medium">Status</th>
                  <th class="px-5 py-3.5 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                ${data.purchases.map(p => `
                  <tr class="table-row border-t border-slate-50">
                    <td class="px-5 py-3.5 font-medium text-brand-600">${escapeHtml(p.id)}</td>
                    <td class="px-5 py-3.5">${escapeHtml(p.supplier)}</td>
                    <td class="px-5 py-3.5">${formatDate(p.date)}</td>
                    <td class="px-5 py-3.5">${p.items}</td>
                    <td class="px-5 py-3.5 font-semibold">${formatCurrency(p.total)}</td>
                    <td class="px-5 py-3.5">
                      <span class="badge ${
                        p.status === 'received' ? 'bg-emerald-100 text-emerald-700' :
                        p.status === 'partial' ? 'bg-amber-100 text-amber-700' :
                        'bg-blue-100 text-blue-700'
                      }">${escapeHtml(p.status)}</span>
                    </td>
                    <td class="px-5 py-3.5 text-right whitespace-nowrap">
                      <button onclick="showPurchaseView(${jsStr(p.id)})" class="text-slate-400 hover:text-brand-600 p-1.5" title="View"><i class="fas fa-eye"></i></button>
                      <button onclick="receivePurchase(${jsStr(p.id)})" class="text-slate-400 hover:text-emerald-600 p-1.5" title="Mark as received"><i class="fas fa-check"></i></button>
                      <button onclick="confirmDelete('purchases', ${jsStr(p.id)})" class="text-slate-400 hover:text-rose-600 p-1.5" title="Delete"><i class="fas fa-trash"></i></button>
                    </td>
                  </tr>
                `).join('') || '<tr><td colspan="7" class="px-5 py-10 text-center text-slate-500">No purchase orders yet</td></tr>'}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  },

  sales() {
    return `
      <div class="fade-in space-y-5">
        <div class="flex justify-between items-center">
          <p class="text-sm text-slate-500">${data.sales.length} recent invoices</p>
          <button onclick="showSaleModal()" class="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium px-4 py-2.5 rounded-xl shadow-sm transition">
            <i class="fas fa-plus"></i> New Sale
          </button>
        </div>
        <div class="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead class="bg-slate-50 text-slate-500">
                <tr class="text-left">
                  <th class="px-5 py-3.5 font-medium">Invoice</th>
                  <th class="px-5 py-3.5 font-medium">Customer</th>
                  <th class="px-5 py-3.5 font-medium">Date</th>
                  <th class="px-5 py-3.5 font-medium">Items</th>
                  <th class="px-5 py-3.5 font-medium">Total</th>
                  <th class="px-5 py-3.5 font-medium">Payment</th>
                  <th class="px-5 py-3.5 font-medium">Status</th>
                  <th class="px-5 py-3.5 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                ${data.sales.map(s => `
                  <tr class="table-row border-t border-slate-50">
                    <td class="px-5 py-3.5 font-medium text-brand-600">${escapeHtml(s.id)}</td>
                    <td class="px-5 py-3.5">${escapeHtml(s.customer)}</td>
                    <td class="px-5 py-3.5">${formatDate(s.date)}</td>
                    <td class="px-5 py-3.5">${s.items}</td>
                    <td class="px-5 py-3.5 font-semibold">${formatCurrency(s.total)}</td>
                    <td class="px-5 py-3.5 capitalize">${escapeHtml(s.payment)}</td>
                    <td class="px-5 py-3.5">
                      <span class="badge ${s.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}">${escapeHtml(s.status)}</span>
                    </td>
                    <td class="px-5 py-3.5 text-right whitespace-nowrap">
                      <button onclick="showSaleView(${jsStr(s.id)})" class="text-slate-400 hover:text-brand-600 p-1.5" title="View"><i class="fas fa-eye"></i></button>
                      <button onclick="printSale(${jsStr(s.id)})" class="text-slate-400 hover:text-brand-600 p-1.5" title="Print"><i class="fas fa-print"></i></button>
                      ${s.status !== 'refunded'
                        ? `<button onclick="refundSale(${jsStr(s.id)})" class="text-slate-400 hover:text-amber-600 p-1.5" title="Refund"><i class="fas fa-rotate-left"></i></button>`
                        : ''}
                    </td>
                  </tr>
                `).join('') || '<tr><td colspan="8" class="px-5 py-10 text-center text-slate-500">No sales yet</td></tr>'}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  },

  customers() {
    return `
      <div class="fade-in space-y-5">
        <div class="flex justify-between items-center">
          <p class="text-sm text-slate-500">${data.customers.length} customers</p>
          <button onclick="showCustomerModal()" class="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium px-4 py-2.5 rounded-xl shadow-sm transition">
            <i class="fas fa-plus"></i> Add Customer
          </button>
        </div>
        <div class="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead class="bg-slate-50 text-slate-500">
                <tr class="text-left">
                  <th class="px-5 py-3.5 font-medium">Customer</th>
                  <th class="px-5 py-3.5 font-medium">Contact</th>
                  <th class="px-5 py-3.5 font-medium">Type</th>
                  <th class="px-5 py-3.5 font-medium">Orders</th>
                  <th class="px-5 py-3.5 font-medium">Total Spent</th>
                  <th class="px-5 py-3.5 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                ${data.customers.map(c => `
                  <tr class="table-row border-t border-slate-50">
                    <td class="px-5 py-3.5">
                      <div class="flex items-center gap-3">
                        <div class="w-9 h-9 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-xs font-bold">${initials(c.name)}</div>
                        <div>
                          <div class="font-medium">${escapeHtml(c.name)}</div>
                          <div class="text-xs text-slate-500">${escapeHtml(c.email)}</div>
                        </div>
                      </div>
                    </td>
                    <td class="px-5 py-3.5">${escapeHtml(c.phone)}</td>
                    <td class="px-5 py-3.5">
                      <span class="badge ${c.type === 'wholesale' ? 'bg-violet-100 text-violet-700' : 'bg-slate-100 text-slate-600'}">${escapeHtml(c.type)}</span>
                    </td>
                    <td class="px-5 py-3.5">${c.orders}</td>
                    <td class="px-5 py-3.5 font-semibold">${formatCurrency(c.spent)}</td>
                    <td class="px-5 py-3.5 text-right whitespace-nowrap">
                      <button onclick="showCustomerView(${c.id})" class="text-slate-400 hover:text-brand-600 p-1.5" title="View"><i class="fas fa-eye"></i></button>
                      <button onclick="showCustomerModal(${c.id})" class="text-slate-400 hover:text-brand-600 p-1.5" title="Edit"><i class="fas fa-edit"></i></button>
                      <button onclick="confirmDelete('customers', ${c.id})" class="text-slate-400 hover:text-rose-600 p-1.5" title="Delete"><i class="fas fa-trash"></i></button>
                    </td>
                  </tr>
                `).join('') || '<tr><td colspan="6" class="px-5 py-10 text-center text-slate-500">No customers yet</td></tr>'}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  },

  warranty() {
    return `
      <div class="fade-in space-y-5">
        <div class="flex justify-between items-center">
          <p class="text-sm text-slate-500">${data.warranties.length} warranty records</p>
          <button onclick="showWarrantyModal()" class="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium px-4 py-2.5 rounded-xl shadow-sm transition">
            <i class="fas fa-plus"></i> Register Warranty
          </button>
        </div>
        <div class="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead class="bg-slate-50 text-slate-500">
                <tr class="text-left">
                  <th class="px-5 py-3.5 font-medium">Warranty ID</th>
                  <th class="px-5 py-3.5 font-medium">Product / Serial</th>
                  <th class="px-5 py-3.5 font-medium">Customer</th>
                  <th class="px-5 py-3.5 font-medium">Purchase</th>
                  <th class="px-5 py-3.5 font-medium">Expiry</th>
                  <th class="px-5 py-3.5 font-medium">Status</th>
                  <th class="px-5 py-3.5 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                ${data.warranties.map(w => `
                  <tr class="table-row border-t border-slate-50">
                    <td class="px-5 py-3.5 font-medium text-brand-600">${escapeHtml(w.id)}</td>
                    <td class="px-5 py-3.5">
                      <div class="font-medium">${escapeHtml(w.product)}</div>
                      <div class="text-xs text-slate-500 font-mono">${escapeHtml(w.serial)}</div>
                    </td>
                    <td class="px-5 py-3.5">${escapeHtml(w.customer)}</td>
                    <td class="px-5 py-3.5">${formatDate(w.purchaseDate)}</td>
                    <td class="px-5 py-3.5">${formatDate(w.expiry)}</td>
                    <td class="px-5 py-3.5">
                      <span class="badge ${w.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}">${escapeHtml(w.status)}</span>
                    </td>
                    <td class="px-5 py-3.5 text-right whitespace-nowrap">
                      <button onclick="claimWarranty(${jsStr(w.id)})" class="text-slate-400 hover:text-amber-600 p-1.5" title="Claim"><i class="fas fa-file-medical"></i></button>
                      <button onclick="showWarrantyView(${jsStr(w.id)})" class="text-slate-400 hover:text-brand-600 p-1.5" title="View"><i class="fas fa-eye"></i></button>
                      <button onclick="confirmDelete('warranties', ${jsStr(w.id)})" class="text-slate-400 hover:text-rose-600 p-1.5" title="Delete"><i class="fas fa-trash"></i></button>
                    </td>
                  </tr>
                `).join('') || '<tr><td colspan="7" class="px-5 py-10 text-center text-slate-500">No warranty records yet</td></tr>'}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  },

  reports() {
    const completed = data.sales.filter(s => s.status === 'completed');
    const unitsSold = completed.reduce((sum, s) => sum + s.items, 0);
    const avgOrder = completed.length ? completed.reduce((sum, s) => sum + s.total, 0) / completed.length : 0;
    const grossProfit = completed.reduce((sum, s) => sum + s.total, 0) * 0.28;

    return `
      <div class="fade-in space-y-6">
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div class="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
            <p class="text-sm text-slate-500">Gross Profit (Week)</p>
            <p class="text-2xl font-bold mt-1 text-emerald-600">${formatCurrency(grossProfit)}</p>
            <p class="text-xs text-slate-500 mt-1">Margin ~28%</p>
          </div>
          <div class="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
            <p class="text-sm text-slate-500">Units Sold</p>
            <p class="text-2xl font-bold mt-1">${unitsSold}</p>
            <p class="text-xs text-emerald-600 mt-1"><i class="fas fa-arrow-up"></i> Across completed invoices</p>
          </div>
          <div class="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
            <p class="text-sm text-slate-500">Avg. Order Value</p>
            <p class="text-2xl font-bold mt-1">${formatCurrency(avgOrder)}</p>
            <p class="text-xs text-slate-500 mt-1">Retail + Wholesale</p>
          </div>
        </div>

        <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div class="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
            <h3 class="font-semibold mb-4">Sales by Category</h3>
            <canvas id="categoryChart" height="200"></canvas>
          </div>
          <div class="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
            <h3 class="font-semibold mb-4">Top Selling Products</h3>
            <div class="space-y-3">
              ${[
                { name: 'NVIDIA RTX 4090 24GB', sold: 8, revenue: 12792 },
                { name: 'AMD Ryzen 9 7950X', sold: 11, revenue: 6039 },
                { name: 'Samsung 990 PRO 2TB', sold: 14, revenue: 2646 },
                { name: 'Corsair Vengeance 32GB', sold: 18, revenue: 2322 },
                { name: 'ASUS ROG Strix X670E-E', sold: 5, revenue: 2495 },
              ].map((p, i) => `
                <div class="flex items-center gap-3">
                  <span class="w-6 h-6 rounded-full bg-brand-50 text-brand-700 text-xs font-bold flex items-center justify-center">${i + 1}</span>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium truncate">${escapeHtml(p.name)}</p>
                    <p class="text-xs text-slate-500">${p.sold} units</p>
                  </div>
                  <span class="text-sm font-semibold">${formatCurrency(p.revenue)}</span>
                </div>
              `).join('')}
            </div>
          </div>
        </div>

        <div class="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <h3 class="font-semibold mb-4">Export Reports</h3>
          <div class="flex flex-wrap gap-3">
            <button onclick="exportCsv('sales')" class="inline-flex items-center gap-2 border border-slate-200 hover:bg-slate-50 text-sm font-medium px-4 py-2 rounded-xl transition">
              <i class="fas fa-file-excel text-emerald-600"></i> Sales Report
            </button>
            <button onclick="exportCsv('products')" class="inline-flex items-center gap-2 border border-slate-200 hover:bg-slate-50 text-sm font-medium px-4 py-2 rounded-xl transition">
              <i class="fas fa-file-excel text-emerald-600"></i> Inventory Report
            </button>
            <button onclick="exportCsv('purchases')" class="inline-flex items-center gap-2 border border-slate-200 hover:bg-slate-50 text-sm font-medium px-4 py-2 rounded-xl transition">
              <i class="fas fa-file-excel text-emerald-600"></i> Purchase Report
            </button>
            <button onclick="exportCsv('warranties')" class="inline-flex items-center gap-2 border border-slate-200 hover:bg-slate-50 text-sm font-medium px-4 py-2 rounded-xl transition">
              <i class="fas fa-file-pdf text-rose-600"></i> Warranty Report
            </button>
          </div>
        </div>
      </div>
    `;
  },

  users() {
    return `
      <div class="fade-in space-y-5">
        <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
          <p class="text-sm text-slate-500">${data.users.length} system users</p>
          <div class="flex gap-3">
            <button onclick="confirmReset()" class="inline-flex items-center gap-2 border border-slate-200 hover:bg-slate-50 text-slate-600 text-sm font-medium px-4 py-2.5 rounded-xl transition">
              <i class="fas fa-rotate-left"></i> Reset Demo Data
            </button>
            <button onclick="showUserModal()" class="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium px-4 py-2.5 rounded-xl shadow-sm transition">
              <i class="fas fa-plus"></i> Add User
            </button>
          </div>
        </div>
        <div class="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead class="bg-slate-50 text-slate-500">
                <tr class="text-left">
                  <th class="px-5 py-3.5 font-medium">User</th>
                  <th class="px-5 py-3.5 font-medium">Role</th>
                  <th class="px-5 py-3.5 font-medium">Last Login</th>
                  <th class="px-5 py-3.5 font-medium">Status</th>
                  <th class="px-5 py-3.5 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                ${data.users.map(u => `
                  <tr class="table-row border-t border-slate-50">
                    <td class="px-5 py-3.5">
                      <div class="flex items-center gap-3">
                        <div class="w-9 h-9 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-xs font-bold">${initials(u.name)}</div>
                        <div>
                          <div class="font-medium">${escapeHtml(u.name)}</div>
                          <div class="text-xs text-slate-500">${escapeHtml(u.email)}</div>
                        </div>
                      </div>
                    </td>
                    <td class="px-5 py-3.5"><span class="badge bg-brand-50 text-brand-700">${escapeHtml(u.role)}</span></td>
                    <td class="px-5 py-3.5 text-slate-600">${escapeHtml(u.lastLogin || '—')}</td>
                    <td class="px-5 py-3.5">
                      <span class="badge ${u.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}">${escapeHtml(u.status)}</span>
                    </td>
                    <td class="px-5 py-3.5 text-right whitespace-nowrap">
                      <button onclick="showUserModal(${u.id})" class="text-slate-400 hover:text-brand-600 p-1.5" title="Edit"><i class="fas fa-edit"></i></button>
                      <button onclick="toggleUserStatus(${u.id})" class="text-slate-400 hover:text-amber-600 p-1.5" title="${u.status === 'active' ? 'Deactivate' : 'Activate'}"><i class="fas ${u.status === 'active' ? 'fa-user-slash' : 'fa-user-check'}"></i></button>
                      <button onclick="confirmDelete('users', ${u.id})" class="text-slate-400 hover:text-rose-600 p-1.5" title="Delete"><i class="fas fa-trash"></i></button>
                    </td>
                  </tr>
                `).join('') || '<tr><td colspan="5" class="px-5 py-10 text-center text-slate-500">No users yet</td></tr>'}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  }
};
