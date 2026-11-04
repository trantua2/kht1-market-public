# Trang public KHT1 Market

Thư mục này là web tĩnh, chỉ có phần danh sách vật phẩm (không có phần quét).
Dữ liệu đọc từ `market.json` trên Supabase Storage mà web local đẩy lên bằng nút
**Public dữ liệu lên web**.

`app.css` và `market-view.js` được chép từ `kht_market/static/` bằng
`python3 -m kht_market build-public` — đừng sửa trực tiếp ở đây.

Production: https://kht1-market-public.vercel.app

Vercel đã nối với nhánh `main` của repo `trantua2/kht1-market-public`.
Mỗi lần push thay đổi giao diện lên `main`, Vercel tự deploy lại. Dữ liệu chợ
vẫn được cập nhật độc lập qua `market.json` trên Supabase Storage.
