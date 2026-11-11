export type MarketServer={
  slug:string;
  code:string;
  name:string;
  is_active:boolean;
  is_default:boolean;
  display_order:number;
};

export type PublicMarketServer=Pick<MarketServer,"slug"|"code"|"name">;

export function resolveMarketServer(servers:MarketServer[],requestedSlug?:string|null):MarketServer{
  const active=servers.filter(server=>server.is_active);
  const requested=active.find(server=>server.slug===requestedSlug);
  if(requested)return requested;
  const fallback=active.find(server=>server.is_default);
  if(!fallback)throw new Error("Chưa cấu hình máy chủ mặc định");
  return fallback;
}

export function publicMarketServer(server:MarketServer):PublicMarketServer{
  return {slug:server.slug,code:server.code,name:server.name};
}

export function serverLabel(server:Pick<MarketServer,"code"|"name">){
  return `${server.code} – ${server.name}`;
}
