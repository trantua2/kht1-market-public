import { z } from "zod";
const serverSchema=z.object({
  slug:z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  code:z.string().trim().min(1).max(30),
  name:z.string().trim().min(1).max(100),
});
const schema=z.object({server:serverSchema,published_at:z.iso.datetime(),shop_count:z.number().int().nonnegative(),item_count:z.number().int().nonnegative(),shops:z.array(z.object({items:z.array(z.unknown())}).passthrough()).max(20000)}).passthrough();
export type MarketSnapshot=z.infer<typeof schema>;
export function parseMarketSnapshot(value:unknown){ const p=schema.parse(value); if(p.shops.length!==p.shop_count) throw new Error("shop_count không khớp"); const items=p.shops.reduce((n,s)=>n+s.items.length,0); if(items!==p.item_count) throw new Error("item_count không khớp"); return p; }
