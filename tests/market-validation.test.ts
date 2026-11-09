import { describe, expect, it } from "vitest";
import { parseMarketSnapshot } from "../lib/market-validation";
describe("market snapshot",()=>{
  it("accepts a consistent snapshot",()=>expect(parseMarketSnapshot({published_at:"2026-11-09T00:00:00Z",shop_count:1,item_count:1,shops:[{items:[{}]}]}).shop_count).toBe(1));
  it("rejects inconsistent counts",()=>expect(()=>parseMarketSnapshot({published_at:"2026-11-09T00:00:00Z",shop_count:2,item_count:1,shops:[{items:[{}]}]})).toThrow("shop_count"));
});
