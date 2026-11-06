// ==================== UTILITIES ====================
function formatCurrency(n) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(Number(n) || 0);
}

function formatDate(d) {
  if (!d) return '—';
  const date = new Date(d);
  if (Number.isNaN(date.getTime())) return String(d);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function jsStr(value) {
  return "'" + String(value).replace(/\\/g, '\\\\').replace(/'/g, "\\'") + "'";
}

function initials(name) {
  return String(name || '?')
    .split(' ')
    .filter(Boolean)
    .map(part => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

let toastTimer = null;
function showToast(msg) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  document.getElementById('toastMsg').textContent = msg;
  toast.classList.remove('hidden');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.add('hidden'), 2800);
}

function openModal(html) {
  const root = document.getElementById('modalRoot');
  document.getElementById('modalContent').innerHTML = html;
  root.classList.remove('hidden');
  root.classList.add('flex');
}

function closeModal() {
  const root = document.getElementById('modalRoot');
  root.classList.add('hidden');
  root.classList.remove('flex');
  document.getElementById('modalContent').innerHTML = '';
}

function formValue(id) {
  const el = document.getElementById(id);
  return el ? el.value.trim() : '';
}

function formNumber(id, fallback = 0) {
  const value = Number(formValue(id));
  return Number.isFinite(value) ? value : fallback;
}

document.getElementById('modalRoot').addEventListener('click', e => {
  if (e.target.id === 'modalRoot') closeModal();
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeModal();
});
