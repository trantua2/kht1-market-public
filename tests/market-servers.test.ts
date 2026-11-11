import {describe,expect,it} from "vitest";
import {resolveMarketServer,serverLabel,type MarketServer} from "../lib/market-servers";

const servers:MarketServer[]=[
  {slug:"s7-cuu-long",code:"S7",name:"Cửu Long",is_active:true,is_default:true,display_order:10},
  {slug:"s8-tay-giang",code:"S8",name:"Tây Giang",is_active:true,is_default:false,display_order:20},
  {slug:"s6-cu",code:"S6",name:"Máy chủ cũ",is_active:false,is_default:false,display_order:30},
];

describe("market servers",()=>{
  it("resolves an active requested server",()=>expect(resolveMarketServer(servers,"s8-tay-giang").slug).toBe("s8-tay-giang"));
  it("falls back to the active default",()=>expect(resolveMarketServer(servers,"unknown").slug).toBe("s7-cuu-long"));
  it("does not resolve an inactive requested server",()=>expect(resolveMarketServer(servers,"s6-cu").slug).toBe("s7-cuu-long"));
  it("requires an active default",()=>expect(()=>resolveMarketServer(servers.map(server=>({...server,is_default:false})),null)).toThrow("máy chủ mặc định"));
  it("formats the canonical public label",()=>expect(serverLabel(servers[0])).toBe("S7 – Cửu Long"));
});
