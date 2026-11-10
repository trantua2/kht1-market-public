import {readFileSync} from "node:fs";
import {describe,expect,it} from "vitest";

const read=(path:string)=>readFileSync(new URL(`../${path}`,import.meta.url),"utf8");

describe("Plus payment and abuse controls",()=>{
  it("persists the purchased plan on payment orders",()=>{
    const route=read("app/api/billing/checkout/route.ts");
    expect(route).toContain("target_plan:product.plan");
  });

  it("migrates existing Full access and completes payments using target_plan",()=>{
    const migration=read("supabase/migrations/202611100002_plus_market_access.sql");
    expect(migration).toContain("plus_tier_initial_downgrade");
    expect(migration).toContain("set plan='market'");
    expect(migration).toContain("payment_row.target_plan");
    expect(migration).toContain("market_rate_limits");
    expect(migration).toContain("market_access_audit");
    expect(migration).toContain("consume_market_rate_limit");
  });

  it("disables browser source maps and adds security headers",()=>{
    const config=read("next.config.ts");
    expect(config).toContain("productionBrowserSourceMaps: false");
    expect(config).toContain("X-Content-Type-Options");
    expect(config).toContain("Referrer-Policy");
  });

  it("projects paginated market data after a durable rate check",()=>{
    const route=read("app/api/market/route.ts");
    expect(route).toContain("consume_market_rate_limit");
    expect(route).toContain("projectMarketPage");
    expect(route).toContain('Cache-Control":"private, no-store"');
    expect(route).toContain("market_access_audit");
  });

  it("renders synthetic locked blocks and a Plus upsell",()=>{
    const client=read("components/market-client.tsx");
    expect(client).toContain("locked_option_count");
    expect(client).toContain("plus-lock-block");
    expect(client).toContain("plus-modal");
    expect(client).toContain("full_30d");
    expect(client).not.toContain("Mở khóa {item.locked_option_count} dòng Plus");
  });
});
