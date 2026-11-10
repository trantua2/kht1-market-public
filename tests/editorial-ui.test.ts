import {readFileSync} from "node:fs";
import {describe,expect,it} from "vitest";

const read=(path:string)=>readFileSync(new URL(`../${path}`,import.meta.url),"utf8");

describe("Võ Lâm editorial public UI",()=>{
  it("provides one shared public header and footer",()=>{
    expect(read("components/site-header.tsx")).toContain("site-header");
    expect(read("components/site-header.tsx")).toContain("KHT1 Market");
    expect(read("components/site-footer.tsx")).toContain("site-footer");
  });

  it("applies the shared shell to all commercial routes",()=>{
    for(const path of ["app/market/page.tsx","app/pricing/page.tsx","app/account/page.tsx","app/payment/result/page.tsx","app/desktop/connect/page.tsx"]){
      const source=read(path);
      expect(source, path).toContain("SiteHeader");
      expect(source, path).toContain("SiteFooter");
    }
  });

  it("keeps shop grouping in the editorial market catalogue",()=>{
    const source=read("components/market-client.tsx");
    expect(source).toContain("shop-ledger");
    expect(source).toContain("filter-toolbar");
    expect(source).toContain("shop.owner_name");
    expect(source).toContain("shop.x");
  });

  it("defines the approved parchment visual tokens and responsive rules",()=>{
    const css=read("app/globals.css");
    for(const marker of ["--paper","--ink","--cinnabar","--antique-gold",".site-header",".shop-ledger",".service-certificate","@media(max-width:760px)"]){
      expect(css).toContain(marker);
    }
  });
});
