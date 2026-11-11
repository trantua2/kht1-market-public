import Link from "next/link";
import {SiteFooter} from "@/components/site-footer";
import {SiteHeader} from "@/components/site-header";

const steps=[
  ["01","Chọn máy chủ","Mỗi máy chủ có dữ liệu chợ riêng. Bắt đầu với S7 – Cửu Long."],
  ["02","Lọc vật phẩm","Tìm theo tên, hệ, option, khoảng chỉ số và mức giá mong muốn."],
  ["03","Đến đúng sạp","Xem thành, chủ sạp và tọa độ để mua món đồ ngay trong game."],
];

export function ProductTrailer(){return <main className="shell landing-page">
  <SiteHeader/>
  <section className="trailer-hero">
    <div className="trailer-copy"><p className="eyebrow">TRA CỨU CHỢ KHT1</p><h1>Tìm đúng món.<br/>Đến đúng sạp.</h1><p className="trailer-lead">Không cần chạy từng thành và mở từng gian hàng. Chọn máy chủ, lọc đúng thuộc tính rồi đi thẳng tới nơi đang bán.</p><div className="trailer-actions"><Link className="primary-link" href="/pricing">Xem bảng giá</Link><Link className="trailer-secondary" href="/login?next=/market">Đăng nhập</Link></div><div className="server-ribbon"><span>Đang hỗ trợ</span><strong>S7 – Cửu Long</strong></div></div>
    <div className="demo-window" aria-label="Dữ liệu minh họa"><header><div><span className="demo-live"/>Dữ liệu minh họa</div><strong>S7 – Cửu Long</strong></header><div className="demo-filters"><span>Tên món: Hạng Liên</span><span>Option: Kháng lôi</span><span>Giá ≤ 20 vạn</span></div><article className="demo-shop"><div className="demo-shop-head"><strong>Phong Vân Các</strong><span>Tương Dương · 198:204</span></div><div className="demo-item"><div><b>Hạng Liên Minh Nguyệt</b><small>Hệ Thủy · Cấp 10</small></div><strong>18 vạn</strong><ul><li>Sinh lực tối đa +145</li><li>Kháng lôi +12%</li><li>Phục hồi nội lực +3</li></ul></div></article><footer>Ví dụ mô phỏng · Dữ liệu thật chỉ dành cho tài khoản còn hạn</footer></div>
  </section>
  <section className="trailer-proof"><div><strong>Tên đồ &amp; giá bán</strong><span>So sánh nhanh trước khi vào game</span></div><div><strong>Option &amp; chỉ số</strong><span>Lọc đúng dòng thuộc tính cần săn</span></div><div><strong>Thành &amp; tọa độ</strong><span>Biết chính xác sạp cần tìm</span></div></section>
  <section className="trailer-workflow"><p className="eyebrow">TỪ NHU CẦU ĐẾN MÓN ĐỒ</p><h2>Ba bước, không đi chợ mò</h2><div className="workflow-grid">{steps.map(([number,title,body])=><article key={number}><span>{number}</span><h3>{title}</h3><p>{body}</p></article>)}</div></section>
  <section className="trailer-cta"><div><p className="eyebrow">S7 – CỬU LONG</p><h2>Chợ giang hồ trong một màn hình</h2><p>Thanh toán theo thời hạn, không tự động gia hạn. Một tài khoản sử dụng mọi máy chủ đang được hỗ trợ.</p></div><div className="trailer-actions"><Link className="primary-link" href="/pricing">Chọn gói sử dụng</Link><Link className="trailer-secondary" href="/login?next=/market">Đã có tài khoản</Link></div></section>
  <SiteFooter/>
</main>}
