import Link from "next/link";

export default function Home() {
  return <main className="shell"><h1>KHT1 Market</h1><p>Dữ liệu sạp và công cụ hỗ trợ KHT1.</p><div className="actions"><Link href="/market">Xem sản phẩm</Link><Link href="/login">Đăng nhập</Link></div></main>;
}
