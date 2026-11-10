import {readFileSync} from "node:fs";
import {describe,expect,it} from "vitest";

const read=(path:string)=>readFileSync(new URL(`../${path}`,import.meta.url),"utf8");

describe("navigation response",()=>{
  it("uses verified claims instead of a user network lookup",()=>{
    const source=read("lib/current-entitlement.ts");
    expect(source).toContain("auth.getClaims()");
    expect(source).not.toContain("auth.getUser()");
  });

  it("provides immediate route-level loading feedback",()=>{
    expect(read("app/loading.tsx")).toContain("route-loading");
    expect(read("app/globals.css")).toContain(".route-loading");
  });
});
