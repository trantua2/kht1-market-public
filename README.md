# Trang public KHT1 Market

Thư mục này là web tĩnh, chỉ có phần danh sách vật phẩm (không có phần quét).
Dữ liệu đọc từ `market.json` cùng deployment. Web admin local tự cập nhật file,
commit và push khi bấm **Public dữ liệu lên web**.

`app.css` và `market-view.js` được chép từ `kht_market/static/` bằng
`python3 -m kht_market build-public` — đừng sửa trực tiếp ở đây.

Production: https://kht1-market-public.vercel.app

Vercel đã nối với nhánh `main` của repo `trantua2/kht1-market-public`.
Mỗi lần push giao diện hoặc dữ liệu lên `main`, Vercel tự deploy lại.
