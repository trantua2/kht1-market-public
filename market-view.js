// Phần danh sách chợ dùng chung cho web local (app.js) và trang public (public/index.html).
// Cần các phần tử #shop-groups, #empty, #count và bộ lọc #filter-*.
const $ = (selector) => document.querySelector(selector);
const shopGroups = $('#shop-groups');
const empty = $('#empty');
const count = $('#count');
let marketSnapshot = {shops: [], shop_count: 0, item_count: 0, snapshots: {}};
const MAX_RENDERED_ITEMS = 500;

function escapeHtml(value) {
  const node = document.createElement('span');
  node.textContent = value == null ? '' : String(value);
  return node.innerHTML;
}

function fold(value) {
  return String(value || '').toLocaleLowerCase('vi-VN')
    .replace(/đ/g, 'd')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function formatMarketPrice(value, currency) {
  if (value == null) return 'Chưa đọc được giá';
  const normalized = fold(currency);
  const formatter = new Intl.NumberFormat('vi-VN');
  if (['vnd', 'tien dong', 'dong', 'coin'].includes(normalized)) {
    return `${formatter.format(value)} xu`;
  }
  if (['silver', 'tien bac', 'bac'].includes(normalized)) {
    const van = new Intl.NumberFormat('vi-VN', {maximumFractionDigits: 1}).format(value / 10000);
    return `${van} vạn`;
  }
  const suffix = currency ? ` ${currency}` : '';
  return `${formatter.format(value)}${suffix}`;
}

function elementClass(element) {
  return ({
    Kim: 'element-kim',
    Mộc: 'element-moc',
    Thủy: 'element-thuy',
    Hỏa: 'element-hoa',
    Thổ: 'element-tho',
  })[element] || 'element-unknown';
}

function optionText(option) {
  const sign = option.value > 0 ? '+' : '';
  const unit = option.unit === 'percent' ? '%' : '';
  return `${option.label} ${sign}${option.value}${unit}`;
}

function jewelryType(name) {
  const normalized = fold(name);
  if (normalized.includes('gioi chi') || normalized.includes('nhan')) return 'ring';
  if (normalized.includes('hang lien') || normalized.includes('day chuyen')) return 'necklace';
  if (normalized.includes('ngoc boi')) return 'pendant';
  if (normalized.includes('ho than phu')) return 'charm';
  if (normalized.includes('huong nang')) return 'sachet';
  return '';
}

function currentFilters() {
  const minValue = $('#filter-min').value;
  const maxValue = $('#filter-max').value;
  return {
    query: $('#filter-query').value.trim(),
    itemType: $('#filter-item-type').value,
    element: $('#filter-element').value,
    option: $('#filter-option').value,
    min: minValue === '' ? null : Number(minValue),
    max: maxValue === '' ? null : Number(maxValue),
  };
}

function filterSnapshot(snapshot, filters) {
  return snapshot.shops.map((shop) => ({
    ...shop,
    items: shop.items.filter((item) => {
      const queryText = fold(item.name);
      if (filters.query && !queryText.includes(fold(filters.query))) return false;
      if (filters.itemType && jewelryType(item.name) !== filters.itemType) return false;
      if (filters.element === '__unknown__') {
        if (item.element) return false;
      } else if (filters.element && item.element !== filters.element) {
        return false;
      }
      if (!filters.option) return true;
      return (item.options || []).some((option) => {
        if (option.label !== filters.option) return false;
        if (filters.min !== null && option.value < filters.min) return false;
        if (filters.max !== null && option.value > filters.max) return false;
        return true;
      });
    }),
  })).filter((shop) => shop.items.length);
}

function limitRenderedShops(shops, maximum = MAX_RENDERED_ITEMS) {
  const visible = [];
  let remaining = maximum;
  for (const shop of shops) {
    if (remaining <= 0) break;
    const items = shop.items.slice(0, remaining);
    if (items.length) visible.push({...shop, items});
    remaining -= items.length;
  }
  return visible;
}

function renderShops(shops) {
  const itemCount = shops.reduce((total, shop) => total + shop.items.length, 0);
  const renderedShops = limitRenderedShops(shops);
  const renderedItemCount = renderedShops.reduce(
    (total, shop) => total + shop.items.length,
    0,
  );
  count.textContent = itemCount > renderedItemCount
    ? `${shops.length} sạp · ${itemCount} món · hiển thị ${renderedItemCount} món đầu`
    : `${shops.length} sạp · ${itemCount} món`;
  empty.hidden = shops.length > 0;
  empty.textContent = marketSnapshot.shop_count
    ? 'Không có món nào khớp bộ lọc.'
    : 'Ba thành chưa có dữ liệu quét.';
  shopGroups.replaceChildren(...renderedShops.map((shop) => {
    const article = document.createElement('article');
    article.className = 'shop-group';
    const rows = shop.items.map((item) => {
      const options = (item.options || []).length
        ? `<ul class="option-list">${item.options.map(
          (option) => `<li>${escapeHtml(optionText(option))}</li>`,
        ).join('')}</ul>`
        : '<span class="meta">Chưa có option</span>';
      const element = escapeHtml(item.element || 'Chưa rõ');
      const level = item.level == null ? '—' : escapeHtml(item.level);
      const mobileLevel = item.level == null ? 'Chưa rõ cấp' : `Cấp ${level}`;
      return `<tr>
        <td class="item-cell" data-label="Tên đồ">
          <strong class="item-name">${escapeHtml(item.name)}</strong>
          <span class="item-meta">
            <span class="element-label ${elementClass(item.element)}">${element}</span>
            <span>${mobileLevel}</span>
          </span>
        </td>
        <td data-label="Hệ"><span class="element-label ${elementClass(item.element)}">${element}</span></td>
        <td class="level" data-label="Cấp">${level}</td>
        <td class="price" data-label="Giá">${escapeHtml(formatMarketPrice(item.price, item.currency))}</td>
        <td class="options-cell" data-label="Option">${options}</td>
      </tr>`;
    }).join('');
    article.innerHTML = `
      <header class="shop-header">
        <div><h3>${escapeHtml(shop.shop_name || 'Sạp không tên')}</h3><span>Chủ sạp ${escapeHtml(shop.owner_name)}</span></div>
        <div class="shop-location">${escapeHtml(shop.map_name || 'Chưa rõ thành')} ${shop.x ?? '?'}:${shop.y ?? '?'} · ${shop.items.length} món</div>
      </header>
      <div class="table-scroll"><table class="item-table">
        <thead><tr><th>Tên đồ</th><th>Hệ</th><th>Cấp</th><th>Giá</th><th>Option</th></tr></thead>
        <tbody>${rows}</tbody>
      </table></div>`;
    return article;
  }));
}

function applyFilters() {
  renderShops(filterSnapshot(marketSnapshot, currentFilters()));
}

function populateOptionFilter(snapshot) {
  const select = $('#filter-option');
  const selected = select.value;
  const labels = [...new Set(snapshot.shops.flatMap(
    (shop) => shop.items.flatMap(
      (item) => (item.options || []).map((option) => option.label),
    ),
  ))].sort((left, right) => left.localeCompare(right, 'vi'));
  select.replaceChildren(new Option('Tất cả option', ''));
  labels.forEach((label) => select.add(new Option(label, label)));
  if (labels.includes(selected)) select.value = selected;
}

['#filter-query', '#filter-min', '#filter-max'].forEach((selector) => {
  $(selector).addEventListener('input', applyFilters);
});
['#filter-item-type', '#filter-element', '#filter-option'].forEach((selector) => {
  $(selector).addEventListener('change', applyFilters);
});

function resetMarketFilters() {
  $('#filter-query').value = '';
  $('#filter-item-type').value = '';
  $('#filter-element').value = '';
  $('#filter-option').value = '';
  $('#filter-min').value = '';
  $('#filter-max').value = '';
  applyFilters();
}

$('#filter-reset').addEventListener('click', resetMarketFilters);

function setMarketSnapshot(snapshot) {
  marketSnapshot = snapshot;
  populateOptionFilter(marketSnapshot);
  applyFilters();
}

function marketSummaryText(snapshot) {
  const snapshots = Object.entries(snapshot.snapshots || {}).map(
    ([city, completedAt]) => `${city}: ${completedAt ? new Date(completedAt).toLocaleString('vi-VN') : 'chưa quét'}`,
  );
  return `${snapshot.shop_count} sạp · ${snapshot.item_count} món · ${snapshots.join(' · ')}`;
}
