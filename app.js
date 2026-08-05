const state = { laptops: [], accessories: [] };

const byId = id => document.getElementById(id);
const els = {
  grid: byId('laptopGrid'), accessoryGrid: byId('accessoryGrid'), empty: byId('emptyState'),
  resultCount: byId('resultCount'), accessoryCount: byId('accessoryCount'), search: byId('searchInput'),
  brand: byId('brandFilter'), condition: byId('conditionFilter'), processor: byId('processorFilter'),
  ram: byId('ramFilter'), storage: byId('storageFilter'), price: byId('priceFilter'), sort: byId('sortFilter'),
  clear: byId('clearFilters'), filterToggle: byId('filterToggle'), filterPanel: byId('filterPanel'),
  filterBadge: byId('filterBadge')
};

const formatPrice = value => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);
const unique = values => [...new Set(values.filter(Boolean))].sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
const escapeHtml = value => String(value ?? '').replace(/[&<>'"]/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character]);

function populateSelect(select, values) {
  values.forEach(value => select.add(new Option(value, value)));
}

function buildSearchText(item) {
  return [item.brand, item.model, item.processor, item.ram, item.storage, item.graphics, item.display, item.condition, item.operatingSystem, ...(item.features || [])].filter(Boolean).join(' ').toLowerCase();
}

function filteredLaptops() {
  const query = els.search.value.trim().toLowerCase();
  const maxPrice = Number(els.price.value || Infinity);
  return state.laptops.filter(item => (!query || buildSearchText(item).includes(query)) &&
    (!els.brand.value || item.brand === els.brand.value) && (!els.condition.value || item.condition === els.condition.value) &&
    (!els.processor.value || item.processorFamily === els.processor.value) && (!els.ram.value || item.ram === els.ram.value) &&
    (!els.storage.value || item.storage === els.storage.value) && item.price <= maxPrice)
    .sort((a, b) => els.sort.value === 'price-asc' ? a.price - b.price : els.sort.value === 'price-desc' ? b.price - a.price :
      els.sort.value === 'brand' ? `${a.brand} ${a.model}`.localeCompare(`${b.brand} ${b.model}`) : new Date(b.addedAt) - new Date(a.addedAt));
}

function laptopCard(item) {
  return `<article class="product-card"><div class="card-visual ${escapeHtml(item.brand.toLowerCase())}"><span class="condition-badge">${escapeHtml(item.condition)}</span><div class="brand-mark">${escapeHtml(item.brand)}</div></div><div class="card-body"><h2>${escapeHtml(item.model)}</h2><dl class="spec-list"><div><dt>Processor</dt><dd>${escapeHtml(item.processor)}</dd></div><div><dt>Memory</dt><dd>${escapeHtml(item.ram)}</dd></div><div><dt>Storage</dt><dd>${escapeHtml(item.storage)}</dd></div><div><dt>Graphics</dt><dd>${escapeHtml(item.graphics || 'Integrated graphics')}</dd></div></dl><div class="card-footer"><div><small>${escapeHtml(item.priceLabel || 'Selling price')}</small><div class="price">${formatPrice(item.price)}</div>${item.mrp ? `<div class="mrp">MRP ${formatPrice(item.mrp)}</div>` : ''}</div></div></div></article>`;
}

function accessoryCard(item) {
  return `<article class="product-card accessory-card"><div class="accessory-visual"><span>${escapeHtml(item.category)}</span><strong>${escapeHtml(item.name.split(' ').map(word => word[0]).slice(0, 2).join(''))}</strong></div><div class="card-body"><div class="stock-label">${escapeHtml(item.stock)}</div><h2>${escapeHtml(item.name)}</h2><dl class="spec-list"><div><dt>Works with</dt><dd>${escapeHtml(item.compatibility)}</dd></div><div><dt>Condition</dt><dd>${escapeHtml(item.condition)}</dd></div></dl><div class="card-footer"><div><small>Selling price</small><div class="price">${formatPrice(item.price)}</div></div></div></div></article>`;
}

function renderLaptops() {
  const items = filteredLaptops();
  els.grid.innerHTML = items.map(laptopCard).join('');
  els.empty.hidden = items.length !== 0;
  els.resultCount.textContent = `${items.length} laptop${items.length === 1 ? '' : 's'} available`;
  const activeCount = [els.search, els.brand, els.condition, els.processor, els.ram, els.storage, els.price].filter(input => input.value).length;
  els.filterBadge.hidden = activeCount === 0;
  els.filterBadge.textContent = activeCount;
}

function showTab(name, updateHash = true) {
  document.querySelectorAll('[data-panel]').forEach(panel => { const active = panel.dataset.panel === name; panel.hidden = !active; panel.classList.toggle('active', active); });
  document.querySelectorAll('[data-tab]').forEach(tab => { const active = tab.dataset.tab === name; tab.classList.toggle('active', active); tab.setAttribute('aria-current', active ? 'page' : 'false'); });
  if (updateHash) history.replaceState(null, '', `#${name}`);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function attachEvents() {
  document.querySelectorAll('[data-tab]').forEach(tab => tab.addEventListener('click', () => showTab(tab.dataset.tab)));
  document.querySelectorAll('[data-tab-link]').forEach(link => link.addEventListener('click', event => { event.preventDefault(); showTab(link.dataset.tabLink); }));
  [els.search, els.brand, els.condition, els.processor, els.ram, els.storage, els.price, els.sort].forEach(input => input.addEventListener(input.tagName === 'INPUT' ? 'input' : 'change', renderLaptops));
  els.filterToggle.addEventListener('click', () => { const open = els.filterPanel.hidden; els.filterPanel.hidden = !open; els.filterToggle.setAttribute('aria-expanded', String(open)); });
  els.clear.addEventListener('click', () => { [els.search, els.brand, els.condition, els.processor, els.ram, els.storage, els.price].forEach(input => { input.value = ''; }); els.sort.value = 'newest'; renderLaptops(); });
}

async function init() {
  attachEvents();
  const initialTab = ['laptops', 'accessories'].includes(location.hash.slice(1)) ? location.hash.slice(1) : 'laptops';
  showTab(initialTab, false);
  try {
    const [laptopResponse, accessoryResponse] = await Promise.all([fetch('laptops.json'), fetch('accessories.json')]);
    if (!laptopResponse.ok || !accessoryResponse.ok) throw new Error('Inventory files could not be loaded');
    [state.laptops, state.accessories] = await Promise.all([laptopResponse.json(), accessoryResponse.json()]);
    populateSelect(els.brand, unique(state.laptops.map(item => item.brand)));
    populateSelect(els.condition, unique(state.laptops.map(item => item.condition)));
    populateSelect(els.processor, unique(state.laptops.map(item => item.processorFamily)));
    populateSelect(els.ram, unique(state.laptops.map(item => item.ram)));
    populateSelect(els.storage, unique(state.laptops.map(item => item.storage)));
    renderLaptops();
    els.accessoryGrid.innerHTML = state.accessories.map(accessoryCard).join('');
    els.accessoryCount.textContent = `${state.accessories.length} accessories available`;
  } catch (error) {
    els.resultCount.textContent = error.message;
    els.accessoryCount.textContent = error.message;
  }
}

byId('year').textContent = new Date().getFullYear();
init();
