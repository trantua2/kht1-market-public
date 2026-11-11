import {readFileSync} from "node:fs";
import {describe,expect,it} from "vitest";

const source=readFileSync(new URL("../components/market-client.tsx",import.meta.url),"utf8");
const css=readFileSync(new URL("../app/globals.css",import.meta.url),"utf8");

describe("market filter groups",()=>{
  it("separates primary market context from item attributes",()=>{
    expect(source).toContain('className="filter-group filter-primary"');
    expect(source).toContain('className="filter-group filter-options"');
    expect(source).toContain("Bộ lọc chính");
    expect(source).toContain("Thuộc tính vật phẩm");
    expect(source.indexOf("Máy chủ<select")).toBeLessThan(source.indexOf("Thuộc tính vật phẩm"));
    expect(source.indexOf("Giá tối đa<input")).toBeLessThan(source.indexOf("Thuộc tính vật phẩm"));
    expect(source.indexOf("Tên món<input")).toBeGreaterThan(source.indexOf("Thuộc tính vật phẩm"));
  });

  it("resets each group without replacing the other group",()=>{
    expect(source).toContain("function resetPrimaryFilters()");
    expect(source).toContain('server:"",city:"",priceMax:"",priceCurrency:"coin"');
    expect(source).toContain("function resetOptionFilters()");
    expect(source).toContain('query:"",itemType:"",element:"",option:"",min:"",max:""');
    expect(source).toContain("Reset bộ lọc chính");
    expect(source).toContain("Reset thuộc tính");
  });

  it("styles both groups responsively",()=>{
    expect(css).toContain(".filter-groups");
    expect(css).toContain(".filter-primary");
    expect(css).toContain(".filter-options");
  });
});
