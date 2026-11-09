// Trang public: chỉ đọc market.json đã public, không có phần quét.
const statusEl = $('#status');

function setStatus(text, kind) {
  statusEl.classList.remove('ok', 'error');
  if (kind) statusEl.classList.add(kind);
  statusEl.querySelector('span:last-child').textContent = text;
}

async function loadPublishedMarket() {
  const url = window.KHT_MARKET_DATA_URL;
  if (!url || url.includes('YOUR-PROJECT')) {
    setStatus('Chưa cấu hình nguồn dữ liệu (config.js)', 'error');
    return;
  }
  try {
    // Tham số thời gian để không lấy bản cũ trong cache trình duyệt / CDN.
    const response = await fetch(`${url}?t=${Date.now()}`, {cache: 'no-store'});
    if (!response.ok) throw new Error(`Không tải được dữ liệu (HTTP ${response.status})`);
    const snapshot = await response.json();
    setMarketSnapshot(snapshot);
    $('#market-summary').textContent = marketSummaryText(snapshot);
    const published = snapshot.published_at
      ? new Date(snapshot.published_at).toLocaleString('vi-VN')
      : 'không rõ';
    setStatus(`Cập nhật ${published}`, 'ok');
  } catch (error) {
    setStatus(error.message, 'error');
  }
}

loadPublishedMarket();
