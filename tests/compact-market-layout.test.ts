import {readFileSync} from "node:fs";
import {describe,expect,it} from "vitest";

const source=readFileSync(new URL("../components/market-client.tsx",import.meta.url),"utf8");
const css=readFileSync(new URL("../app/globals.css",import.meta.url),"utf8");

describe("compact market layout",()=>{
  it("starts with useful market status instead of a decorative masthead",()=>{
    expect(source).not.toContain("catalogue-masthead");
    expect(source).not.toContain("Chợ giang hồ");
    expect(source).not.toContain("Dữ liệu mới nhất");
    expect(source).toContain("market-status-strip");
    expect(source).toContain("page?.server.code");
    expect(source).toContain("page?.shop_count");
    expect(source).toContain("page?.item_count");
  });

  it("uses two plain filter sections without nested cards or kicker labels",()=>{
    expect(source).not.toContain("filter-group filter-primary");
    expect(source).not.toContain("filter-group filter-options");
    expect(source).not.toContain("filter-kicker");
    expect(source).toContain('className="filter-section filter-primary"');
    expect(source).toContain('className="filter-section filter-options"');
    expect(source).toContain("Khu vực &amp; giá");
    expect(source).toContain("Thuộc tính");
    expect(source.match(/>Đặt lại</g)).toHaveLength(2);
  });

  it("styles the status strip and rule-separated sections",()=>{
    expect(css).toContain(".market-status-strip");
    expect(css).toContain(".filter-section+.filter-section");
  });
});
