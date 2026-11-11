import {readFileSync} from "node:fs";
import {describe,expect,it} from "vitest";

const read=(path:string)=>readFileSync(new URL(`../${path}`,import.meta.url),"utf8");

describe("public product trailer",()=>{
  it("replaces the root redirect with a useful product preview",()=>{
    const page=read("app/page.tsx"),trailer=read("components/product-trailer.tsx");
    expect(page).not.toContain('redirect("/market")');
    expect(page).toContain("ProductTrailer");
    for(const text of ["Tìm đúng món","S7 – Cửu Long","Chọn máy chủ","Lọc vật phẩm","Đến đúng sạp","Xem bảng giá","Đăng nhập"]){
      expect(trailer).toContain(text);
    }
  });

  it("uses synthetic examples without reading protected market data",()=>{
    const trailer=read("components/product-trailer.tsx");
    expect(trailer).not.toContain("/api/market");
    expect(trailer).not.toContain("fetch(");
    expect(trailer).toContain("Dữ liệu minh họa");
  });
});
