import {readFileSync} from "node:fs";
import {describe,expect,it} from "vitest";

const read=(path:string)=>readFileSync(new URL(`../${path}`,import.meta.url),"utf8");

describe("server-aware market routes",()=>{
  it("persists ingest under a verified server",()=>{
    const source=read("app/api/admin/market-ingest/route.ts");
    expect(source).toContain('from("market_servers")');
    expect(source).toContain("snapshot.server.slug");
    expect(source).toContain("server_slug:snapshot.server.slug");
    expect(source).toContain("server.code!==snapshot.server.code");
  });

  it("scopes the web market and returns server choices",()=>{
    const source=read("app/api/market/route.ts");
    expect(source).toContain('params.get("server")');
    expect(source).toContain("getLatestMarketSnapshot(server.slug)");
    expect(source).toContain("servers:");
    expect(source).toContain("server:publicMarketServer(server)");
  });

  it("scopes the desktop market by server",()=>{
    const source=read("app/api/desktop/market/route.ts");
    expect(source).toContain('request.nextUrl.searchParams.get("server")');
    expect(source).toContain("getLatestMarketSnapshot(server.slug)");
  });
});
