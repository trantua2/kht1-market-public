import {readFileSync} from "node:fs";
import {describe,expect,it} from "vitest";

const source=readFileSync(new URL("../components/market-client.tsx",import.meta.url),"utf8");

describe("market server selector",()=>{
  it("keeps server in filter requests and resets results when changed",()=>{
    expect(source).toContain('server:string');
    expect(source).toContain('server:""');
    expect(source).toContain('set("server",event.target.value)');
    expect(source).toContain("setShops([])");
  });

  it("renders server selection before city and labels the masthead",()=>{
    expect(source.indexOf("Máy chủ<select")).toBeGreaterThan(-1);
    expect(source.indexOf("Máy chủ<select")).toBeLessThan(source.indexOf("Thành<select"));
    expect(source).toContain("page?.server.code");
    expect(source).toContain("page?.server.name");
  });
});
