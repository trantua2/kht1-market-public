import {readFileSync} from "node:fs";
import {describe,expect,it} from "vitest";

const read=(path:string)=>readFileSync(new URL(`../${path}`,import.meta.url),"utf8");

describe("membership-aware public navigation",()=>{
  it("prefetches destinations and hides pricing for active access",()=>{
    const header=read("components/site-header.tsx");
    expect(header).toContain("hasAccess");
    expect(header).toContain("prefetch");
    expect(header).toContain("!hasAccess");
  });

  it("redirects active members away from pricing",()=>{
    const pricing=read("app/pricing/page.tsx");
    expect(pricing).toContain('redirect("/account")');
    expect(pricing).toContain("hasMarketAccess");
  });

  it("shows friendly labels and suppresses active renewal",()=>{
    const account=read("app/account/page.tsx");
    expect(account).toContain("planLabel");
    expect(account).toContain("statusLabel");
    expect(account).toContain("!hasAccess");
  });

  it("uses Vietnamese package labels in admin controls",()=>{
    const editor=read("components/subscription-editor.tsx");
    expect(editor).toContain("Gói tra cứu");
    expect(editor).toContain("Gói hội viên");
    expect(editor).toContain("Đang sử dụng");
    expect(editor).not.toContain(">Full<");
    expect(editor).not.toContain(">Active<");
  });

  it("contains no Sabo branding in public UI",()=>{
    for(const path of ["app/login/page.tsx","components/site-header.tsx","components/site-footer.tsx"]){
      expect(read(path).toLowerCase(),path).not.toContain("sabo");
    }
  });
});
