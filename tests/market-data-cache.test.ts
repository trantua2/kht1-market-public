import {describe,expect,it} from "vitest";
import {AsyncTtlCache} from "../lib/market-data-cache";

describe("AsyncTtlCache",()=>{
  it("reuses a value until its ttl expires",async()=>{
    let now=0,calls=0;
    const cache=new AsyncTtlCache<string,number>({ttlMs:100,maxEntries:4,now:()=>now});
    const load=async()=>++calls;
    expect(await cache.get("s7",load)).toBe(1);
    expect(await cache.get("s7",load)).toBe(1);
    now=101;
    expect(await cache.get("s7",load)).toBe(2);
  });

  it("coalesces concurrent cache misses",async()=>{
    let resolve!: (value:number)=>void,calls=0;
    const pending=new Promise<number>(done=>{resolve=done});
    const cache=new AsyncTtlCache<string,number>({ttlMs:100,maxEntries:4});
    const load=()=>{calls++;return pending};
    const first=cache.get("s7",load),second=cache.get("s7",load);
    expect(calls).toBe(1);
    resolve(7);
    await expect(Promise.all([first,second])).resolves.toEqual([7,7]);
  });

  it("invalidates one key and bounds retained entries",async()=>{
    const cache=new AsyncTtlCache<string,string>({ttlMs:1000,maxEntries:2});
    await cache.get("s7",async()=>"seven");
    await cache.get("s8",async()=>"eight");
    await cache.get("s9",async()=>"nine");
    expect(cache.size).toBe(2);
    cache.invalidate("s9");
    expect(cache.size).toBe(1);
    await expect(cache.get("s9",async()=>"new-nine")).resolves.toBe("new-nine");
  });

  it("does not cache rejected loads",async()=>{
    const cache=new AsyncTtlCache<string,number>({ttlMs:100,maxEntries:2});
    await expect(cache.get("s7",async()=>{throw new Error("offline")})).rejects.toThrow("offline");
    await expect(cache.get("s7",async()=>9)).resolves.toBe(9);
  });
});
