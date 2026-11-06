// ==================== NAVIGATION ====================
const pageMeta = {
  dashboard: { title: 'Dashboard', subtitle: 'Overview of your computer shop' },
  products: { title: 'Products', subtitle: 'Manage product catalog & pricing' },
  categories: { title: 'Categories', subtitle: 'Organize products by category' },
  inventory: { title: 'Stock In / Out', subtitle: 'Track inventory movements' },
  suppliers: { title: 'Suppliers', subtitle: 'Manage vendor relationships' },
  purchasing: { title: 'Purchasing', subtitle: 'Purchase orders & receiving' },
  sales: { title: 'Sales', subtitle: 'Invoices and transactions' },
  customers: { title: 'Customers', subtitle: 'Customer database & history' },
  warranty: { title: 'Warranty Tracking', subtitle: 'Serial numbers & claims' },
  reports: { title: 'Reports', subtitle: 'Analytics and exports' },
  users: { title: 'User Management', subtitle: 'Roles and access control' },
};

let currentPage = 'dashboard';

function navigate(page) {
  if (!pages[page] || !pageMeta[page]) return;
  currentPage = page;

  document.querySelectorAll('.sidebar-link').forEach(el => {
    el.classList.remove('active');
    el.classList.add('text-slate-600');
  });
  const link = document.querySelector(`[data-page="${page}"]`);
  if (link) {
    link.classList.add('active');
    link.classList.remove('text-slate-600');
  }

  document.getElementById('pageTitle').textContent = pageMeta[page].title;
  document.getElementById('pageSubtitle').textContent = pageMeta[page].subtitle;
  document.getElementById('content').innerHTML = pages[page]();

  if (page === 'dashboard') initSalesChart();
  if (page === 'reports') initCategoryChart();

  const sidebar = document.getElementById('sidebar');
  if (sidebar && window.innerWidth < 1024) sidebar.classList.add('hidden');
}

document.querySelectorAll('.sidebar-link').forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    navigate(link.dataset.page);
  });
});

const menuToggle = document.getElementById('menuToggle');
if (menuToggle) {
  menuToggle.addEventListener('click', () => {
    document.getElementById('sidebar').classList.toggle('hidden');
  });
}

// ==================== CHARTS ====================
let salesChartInstance = null;
let categoryChartInstance = null;

function initSalesChart() {
  const ctx = document.getElementById('salesChart');
  if (!ctx) return;
  if (salesChartInstance) salesChartInstance.destroy();
  salesChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      datasets: [{
        label: 'Sales ($)',
        data: [1200, 1900, 1500, 2800, 2200, 3100, 2450],
        borderColor: '#2563eb',
        backgroundColor: 'rgba(37, 99, 235, 0.08)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#2563eb',
        pointRadius: 4,
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: {
        y: { beginAtZero: true, grid: { color: '#f1f5f9' }, ticks: { callback: v => '$' + v } },
        x: { grid: { display: false } }
      }
    }
  });
}

function initCategoryChart() {
  const ctx = document.getElementById('categoryChart');
  if (!ctx) return;
  if (categoryChartInstance) categoryChartInstance.destroy();
  categoryChartInstance = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['GPUs', 'CPUs', 'Storage', 'Memory', 'Motherboards', 'Others'],
      datasets: [{
        data: [35, 22, 15, 12, 8, 8],
        backgroundColor: ['#2563eb', '#7c3aed', '#059669', '#d97706', '#dc2626', '#64748b'],
        borderWidth: 0,
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { position: 'bottom', labels: { boxWidth: 12, padding: 15 } } },
      cutout: '65%'
    }
  });
}

// ==================== FILTERS ====================
function filterProducts() {
  const q = (document.getElementById('productSearch')?.value || '').toLowerCase().trim();
  const cat = document.getElementById('catFilter')?.value || '';
  document.querySelectorAll('.product-row').forEach(row => {
    const matchName = row.dataset.name.includes(q);
    const matchCat = !cat || row.dataset.cat === cat;
    row.style.display = matchName && matchCat ? '' : 'none';
  });
}

function filterInventory() {
  const q = (document.getElementById('inventorySearch')?.value || '').toLowerCase().trim();
  const type = document.getElementById('inventoryTypeFilter')?.value || '';
  const rows = document.querySelectorAll('.inventory-row');
  let visible = 0;

  rows.forEach(row => {
    const matchText =
      row.dataset.product.includes(q) ||
      row.dataset.ref.includes(q) ||
      row.dataset.user.includes(q);
    const matchType = !type || row.dataset.type === type;
    const show = matchText && matchType;
    row.style.display = show ? '' : 'none';
    if (show) visible++;
  });

  const countEl = document.getElementById('inventoryResultCount');
  const emptyEl = document.getElementById('inventoryEmpty');
  if (countEl) countEl.textContent = `${visible} record${visible !== 1 ? 's' : ''}`;
  if (emptyEl) emptyEl.classList.toggle('hidden', visible > 0);
}

// ==================== DASHBOARD GLOBAL SEARCH ====================
function handleDashboardSearch(query) {
  const box = document.getElementById('dashboardSearchResults');
  if (!box) return;

  const q = (query || '').trim().toLowerCase();
  if (!q) {
    box.classList.add('hidden');
    box.innerHTML = '';
    return;
  }

  const results = [];

  data.products.forEach(p => {
    if (p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q)) {
      results.push({
        type: 'Product',
        icon: 'fa-box',
        color: 'bg-brand-50 text-brand-600',
        title: p.name,
        subtitle: `${p.sku} · Stock: ${p.stock} · ${formatCurrency(p.price)}`,
        page: 'products'
      });
    }
  });

  data.customers.forEach(c => {
    if (c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) || c.phone.includes(q)) {
      results.push({
        type: 'Customer',
        icon: 'fa-user',
        color: 'bg-violet-50 text-violet-600',
        title: c.name,
        subtitle: `${c.email} · ${c.orders} orders · ${formatCurrency(c.spent)}`,
        page: 'customers'
      });
    }
  });

  data.sales.forEach(s => {
    if (s.id.toLowerCase().includes(q) || s.customer.toLowerCase().includes(q)) {
      results.push({
        type: 'Invoice',
        icon: 'fa-receipt',
        color: 'bg-emerald-50 text-emerald-600',
        title: s.id,
        subtitle: `${s.customer} · ${formatCurrency(s.total)} · ${s.status}`,
        page: 'sales'
      });
    }
  });

  data.warranties.forEach(w => {
    if (w.id.toLowerCase().includes(q) || w.serial.toLowerCase().includes(q) || w.product.toLowerCase().includes(q) || w.customer.toLowerCase().includes(q)) {
      results.push({
        type: 'Warranty',
        icon: 'fa-shield-alt',
        color: 'bg-amber-50 text-amber-600',
        title: w.id,
        subtitle: `${w.product} · ${w.serial} · ${w.status}`,
        page: 'warranty'
      });
    }
  });

  data.purchases.forEach(p => {
    if (p.id.toLowerCase().includes(q) || p.supplier.toLowerCase().includes(q)) {
      results.push({
        type: 'Purchase Order',
        icon: 'fa-shopping-cart',
        color: 'bg-blue-50 text-blue-600',
        title: p.id,
        subtitle: `${p.supplier} · ${formatCurrency(p.total)} · ${p.status}`,
        page: 'purchasing'
      });
    }
  });

  if (results.length === 0) {
    box.innerHTML = `
      <div class="px-5 py-8 text-center text-slate-500 text-sm">
        <i class="fas fa-search text-2xl mb-2 opacity-40"></i>
        <p>No results for “${escapeHtml(query)}”</p>
      </div>`;
    box.classList.remove('hidden');
    return;
  }

  const limited = results.slice(0, 10);
  box.innerHTML = limited.map(r => `
    <button
      onclick="document.getElementById('dashboardSearchResults')?.classList.add('hidden'); navigate('${r.page}');"
      class="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 text-left transition border-b border-slate-50 last:border-0"
    >
      <div class="w-9 h-9 rounded-lg ${r.color} flex items-center justify-center flex-shrink-0">
        <i class="fas ${r.icon} text-sm"></i>
      </div>
      <div class="min-w-0 flex-1">
        <div class="flex items-center gap-2">
          <span class="text-sm font-medium text-slate-900 truncate">${escapeHtml(r.title)}</span>
          <span class="badge bg-slate-100 text-slate-500 flex-shrink-0">${r.type}</span>
        </div>
        <p class="text-xs text-slate-500 truncate mt-0.5">${escapeHtml(r.subtitle)}</p>
      </div>
      <i class="fas fa-chevron-right text-slate-300 text-xs"></i>
    </button>
  `).join('') + (results.length > 10 ? `
    <div class="px-4 py-2.5 text-xs text-slate-500 bg-slate-50 text-center">
      +${results.length - 10} more results
    </div>` : '');

  box.classList.remove('hidden');
}

document.addEventListener('click', (e) => {
  const box = document.getElementById('dashboardSearchResults');
  const input = document.getElementById('dashboardSearch');
  if (box && input && !box.contains(e.target) && e.target !== input && !input.contains(e.target)) {
    box.classList.add('hidden');
  }
});

document.addEventListener('keydown', (e) => {
  if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
    const input = document.getElementById('dashboardSearch');
    if (input) {
      e.preventDefault();
      input.focus();
    }
  }
  if (e.key === 'Escape') {
    const box = document.getElementById('dashboardSearchResults');
    if (box) box.classList.add('hidden');
  }
});

// ==================== HEADER SEARCH ====================
const globalSearch = document.getElementById('globalSearch');
if (globalSearch) {
  globalSearch.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      const q = globalSearch.value.trim();
      navigate('products');
      const input = document.getElementById('productSearch');
      if (input) {
        input.value = q;
        filterProducts();
      }
    }
  });
}

// ==================== INIT ====================
navigate('dashboard');
