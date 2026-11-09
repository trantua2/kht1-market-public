import { z } from "zod";
const schema=z.object({published_at:z.iso.datetime(),shop_count:z.number().int().nonnegative(),item_count:z.number().int().nonnegative(),shops:z.array(z.object({items:z.array(z.unknown())}).passthrough()).max(20000)}).passthrough();
export type MarketSnapshot=z.infer<typeof schema>;
export function parseMarketSnapshot(value:unknown){ const p=schema.parse(value); if(p.shops.length!==p.shop_count) throw new Error("shop_count không khớp"); const items=p.shops.reduce((n,s)=>n+s.items.length,0); if(items!==p.item_count) throw new Error("item_count không khớp"); return p; }
