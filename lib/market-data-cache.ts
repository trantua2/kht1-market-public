import {createAdminClient} from "@/lib/supabase/admin";
import type {MarketServer} from "@/lib/market-servers";

type Entry<V>={promise:Promise<V>;expiresAt:number};

export class AsyncTtlCache<K,V>{
  private readonly entries=new Map<K,Entry<V>>();
  private readonly ttlMs:number;
  private readonly maxEntries:number;
  private readonly now:()=>number;

  constructor(options:{ttlMs:number;maxEntries:number;now?:()=>number}){
    this.ttlMs=options.ttlMs;
    this.maxEntries=options.maxEntries;
    this.now=options.now??Date.now;
  }

  get size(){return this.entries.size}

  async get(key:K,loader:()=>Promise<V>):Promise<V>{
    const current=this.entries.get(key),time=this.now();
    if(current&&current.expiresAt>time)return current.promise;
    if(current)this.entries.delete(key);
    this.prune(time);
    while(this.entries.size>=this.maxEntries){
      const oldest=this.entries.keys().next().value as K|undefined;
      if(oldest===undefined)break;
      this.entries.delete(oldest);
    }
    const entry:Entry<V>={promise:Promise.resolve(loader()),expiresAt:Number.POSITIVE_INFINITY};
    this.entries.set(key,entry);
    try{
      const value=await entry.promise;
      entry.expiresAt=this.now()+this.ttlMs;
      return value;
    }catch(reason){
      if(this.entries.get(key)===entry)this.entries.delete(key);
      throw reason;
    }
  }

  invalidate(key:K){this.entries.delete(key)}

  private prune(time:number){
    for(const [key,entry] of this.entries)if(entry.expiresAt<=time)this.entries.delete(key);
  }
}

const serversCache=new AsyncTtlCache<string,MarketServer[]>({ttlMs:300_000,maxEntries:1});
const snapshotsCache=new AsyncTtlCache<string,unknown|null>({ttlMs:30_000,maxEntries:8});

export function getActiveMarketServers(){
  return serversCache.get("active",async()=>{
    const {data,error}=await createAdminClient().from("market_servers").select("slug,code,name,is_active,is_default,display_order").eq("is_active",true).order("display_order");
    if(error)throw error;
    return (data??[]) as MarketServer[];
  });
}

export function getLatestMarketSnapshot(serverSlug:string){
  return snapshotsCache.get(serverSlug,async()=>{
    const {data,error}=await createAdminClient().from("market_snapshots").select("payload").eq("server_slug",serverSlug).order("published_at",{ascending:false}).limit(1).maybeSingle();
    if(error)throw error;
    return data?.payload??null;
  });
}

export function invalidateMarketSnapshot(serverSlug:string){snapshotsCache.invalidate(serverSlug)}
export function invalidateMarketServers(){serversCache.invalidate("active")}
