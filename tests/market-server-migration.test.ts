import {readFileSync} from "node:fs";
import {describe,expect,it} from "vitest";

const migration=()=>readFileSync(new URL("../supabase/migrations/202611100003_market_servers.sql",import.meta.url),"utf8");

describe("market server migration",()=>{
  it("creates the catalogue and assigns existing snapshots to S7",()=>{
    const sql=migration();
    expect(sql).toContain("create table public.market_servers");
    expect(sql).toContain("'s7-cuu-long'");
    expect(sql).toMatch(/update public\.market_snapshots[\s\S]+server_slug\s*=\s*'s7-cuu-long'/);
    expect(sql).toContain("alter column server_slug set not null");
    expect(sql).toContain("references public.market_servers(slug)");
    expect(sql).toMatch(/create index[\s\S]+market_snapshots\s*\(server_slug,\s*published_at desc\)/);
  });
});
