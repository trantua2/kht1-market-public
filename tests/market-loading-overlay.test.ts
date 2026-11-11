import {readFileSync} from "node:fs";
import {describe,expect,it} from "vitest";

const source=readFileSync(new URL("../components/market-client.tsx",import.meta.url),"utf8");
const css=readFileSync(new URL("../app/globals.css",import.meta.url),"utf8");

describe("market loading overlay",()=>{
  it("covers results only while a request is active",()=>{
    const filters=source.indexOf('className="filter-sections"');
    const results=source.indexOf('className={`market-results');
    expect(filters).toBeGreaterThan(-1);
    expect(results).toBeGreaterThan(filters);
    expect(source).toContain('loading&&<div className="market-loading-overlay"');
    expect(source).toContain('role="status"');
    expect(source).toContain('aria-live="polite"');
    expect(source).toContain("Đang lọc dữ liệu…");
  });

  it("defines a veil and animated spinner without hiding the result layout",()=>{
    for(const marker of [".market-results",".market-results.is-loading",".market-loading-overlay",".market-loading-spinner","@keyframes market-spin"]){
      expect(css).toContain(marker);
    }
  });
});
