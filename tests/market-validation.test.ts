import { describe, expect, it } from "vitest";
import { parseMarketSnapshot } from "../lib/market-validation";
describe("market snapshot",()=>{
  const server={slug:"s7-cuu-long",code:"S7",name:"Cửu Long"};
  it("accepts a consistent snapshot with canonical server metadata",()=>expect(parseMarketSnapshot({server,published_at:"2026-11-09T00:00:00Z",shop_count:1,item_count:1,shops:[{items:[{}]}]}).server).toEqual(server));
  it("requires server metadata",()=>expect(()=>parseMarketSnapshot({published_at:"2026-11-09T00:00:00Z",shop_count:0,item_count:0,shops:[]})).toThrow());
  it("rejects inconsistent counts",()=>expect(()=>parseMarketSnapshot({server,published_at:"2026-11-09T00:00:00Z",shop_count:2,item_count:1,shops:[{items:[{}]}]})).toThrow("shop_count"));
});
