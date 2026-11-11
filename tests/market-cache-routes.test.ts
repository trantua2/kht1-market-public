import {readFileSync} from "node:fs";
import {describe,expect,it} from "vitest";

const read=(path:string)=>readFileSync(new URL(`../${path}`,import.meta.url),"utf8");

describe("cached market routes",()=>{
  it("loads catalogue and snapshot through the shared cache",()=>{
    const web=read("app/api/market/route.ts"),desktop=read("app/api/desktop/market/route.ts");
    for(const source of [web,desktop]){
      expect(source).toContain("getActiveMarketServers");
      expect(source).toContain("getLatestMarketSnapshot");
      expect(source).not.toContain('from("market_snapshots")');
    }
  });

  it("overlaps rate-limit and catalogue work on web requests",()=>{
    const source=read("app/api/market/route.ts");
    expect(source).toContain("Promise.all");
    expect(source).toContain("ratePromise");
    expect(source).toContain("serversPromise");
  });

  it("invalidates a server snapshot after ingest",()=>{
    const source=read("app/api/admin/market-ingest/route.ts");
    expect(source).toContain("invalidateMarketSnapshot(snapshot.server.slug)");
  });
});
