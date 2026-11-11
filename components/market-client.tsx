"use client";

import {useEffect,useState} from "react";
import {SiteFooter} from "@/components/site-footer";
import {SiteHeader} from "@/components/site-header";

type Option={label?:string;value?:number;unit?:string};
type Item={name?:string;price?:number;currency?:string;element?:string;level?:number;options?:Option[];locked_option_count?:number};
type Shop={owner_name?:string;shop_name?:string;map_name?:string;x?:number;y?:number;items:Item[]};
type Server={slug:string;code:string;name:string};
type Page={published_at?:string|null;shop_count:number;item_count:number;total_items:number;tier:"normal"|"plus";next_cursor:string|null;server:Server;servers:Server[];filters:{cities:string[];options:string[]};shops:Shop[];snapshots?:Record<string,string|null>};
type Filters={server:string;query:string;city:string;itemType:string;element:string;option:string;min:string;max:string;priceMax:string;priceCurrency:string};
const EMPTY_FILTERS:Filters={server:"",query:"",city:"",itemType:"",element:"",option:"",min:"",max:"",priceMax:"",priceCurrency:"coin"};

function formatPrice(value?:number,currency?:string){if(value==null)return "Chưa đọc được giá";const kind=String(currency??"").toLowerCase();if(["vnd","coin","dong","tien dong"].includes(kind))return `${value.toLocaleString("vi-VN")} xu`;if(["silver","bac","tien bac"].includes(kind))return `${new Intl.NumberFormat("vi-VN",{maximumFractionDigits:1}).format(value/10000)} vạn`;return `${value.toLocaleString("vi-VN")}${currency?` ${currency}`:""}`}
function elementClass(element?:string){return ({Kim:"element-kim",Mộc:"element-moc",Thủy:"element-thuy",Hỏa:"element-hoa",Thổ:"element-tho"} as Record<string,string>)[element??""]??"element-unknown"}
function optionText(option:Option){const value=option.value??0;return `${option.label??""} ${value>0?"+":""}${value}${option.unit==="percent"?"%":""}`}
function mergeShops(current:Shop[],next:Shop[]){const result=current.map(shop=>({...shop,items:[...shop.items]}));for(const shop of next){const found=result.find(item=>item.owner_name===shop.owner_name&&item.shop_name===shop.shop_name&&item.map_name===shop.map_name&&item.x===shop.x&&item.y===shop.y);if(found)found.items.push(...shop.items);else result.push(shop)}return result}

export function MarketClient(){
  const [page,setPage]=useState<Page|null>(null),[shops,setShops]=useState<Shop[]>([]),[filters,setFilters]=useState<Filters>(EMPTY_FILTERS);
  const [loading,setLoading]=useState(true),[loadingMore,setLoadingMore]=useState(false),[error,setError]=useState("");
  const set=<K extends keyof Filters>(key:K,value:Filters[K])=>setFilters(current=>({...current,[key]:value}));
  function resetPrimaryFilters(){setShops([]);setFilters(current=>({...current,server:"",city:"",priceMax:"",priceCurrency:"coin"}))}
  function resetOptionFilters(){setShops([]);setFilters(current=>({...current,query:"",itemType:"",element:"",option:"",min:"",max:""}))}
  async function load(cursor?:string,append=false,signal?:AbortSignal){
    append?setLoadingMore(true):setLoading(true);setError("");
    const params=new URLSearchParams({limit:"100"});for(const [key,value] of Object.entries(filters))if(value!=="")params.set(key,value);if(cursor)params.set("cursor",cursor);
    try{const response=await fetch(`/api/market?${params}`,{cache:"no-store",signal});const payload=await response.json();if(!response.ok)throw new Error(payload.error||"Không tải được dữ liệu");setPage(payload);setShops(current=>append?mergeShops(current,payload.shops):payload.shops)}
    catch(reason){if((reason as Error).name!=="AbortError")setError(reason instanceof Error?reason.message:"Không tải được dữ liệu")}
    finally{append?setLoadingMore(false):setLoading(false)}
  }
  useEffect(()=>{const controller=new AbortController();const timer=setTimeout(()=>load(undefined,false,controller.signal),180);return()=>{clearTimeout(timer);controller.abort()}},[filters.server,filters.query,filters.city,filters.itemType,filters.element,filters.option,filters.min,filters.max,filters.priceMax,filters.priceCurrency]);
  const citySummary=Object.keys(page?.snapshots??{}).join(" · ");
  return <main className="market-shell">
    <SiteHeader signedIn hasAccess/>
    <section className={`market-status-strip ${error?"error":loading?"":"ok"}`}><div className="market-status-main"><strong>{page?.server.code} {page?.server.name?`– ${page.server.name}`:""}</strong><span>•</span><span>{page?.shop_count??0} sạp</span><span>•</span><span>{page?.item_count??0} món</span>{citySummary&&<><span>•</span><span>{citySummary}</span></>}</div><div className="market-status-update"><span className="dot"/><span>{error||(loading?"Đang tải…":`Cập nhật ${page?.published_at?new Date(page.published_at).toLocaleString("vi-VN"):"không rõ"}`)}</span></div></section>
    <section className="market compact-market">
      <div className="filter-sections">
        <section className="filter-section filter-primary"><header><h3>Khu vực &amp; giá</h3><button type="button" className="filter-reset" onClick={resetPrimaryFilters}>Đặt lại</button></header><div className="filter-fields">
          <label>Máy chủ<select value={filters.server||page?.server.slug||""} onChange={event=>{setShops([]);set("server",event.target.value)}}>{page?.servers.map(server=><option value={server.slug} key={server.slug}>{server.code} – {server.name}</option>)}</select></label>
          <label>Thành<select value={filters.city} onChange={event=>set("city",event.target.value)}><option value="">Tất cả thành</option>{page?.filters.cities.map(city=><option key={city}>{city}</option>)}</select></label>
          <label>Giá tối đa<input type="number" min="0" value={filters.priceMax} onChange={event=>set("priceMax",event.target.value)}/></label>
          <label>Loại tiền<select value={filters.priceCurrency} onChange={event=>set("priceCurrency",event.target.value)}><option value="coin">Xu</option><option value="silver">Bạc</option></select></label>
        </div></section>
        <section className="filter-section filter-options"><header><h3>Thuộc tính</h3><button type="button" className="filter-reset" onClick={resetOptionFilters}>Đặt lại</button></header><div className="filter-fields">
          <label>Tên món<input type="search" placeholder="Toàn Thạch, Giới Chỉ…" value={filters.query} onChange={event=>set("query",event.target.value)}/></label>
          <label>Loại trang sức<select value={filters.itemType} onChange={event=>set("itemType",event.target.value)}><option value="">Tất cả loại</option><option value="ring">Nhẫn</option><option value="necklace">Hạng liên</option><option value="pendant">Ngọc bội</option><option value="charm">Hộ thân phù</option><option value="sachet">Hương nang</option></select></label>
          <label>Hệ<select value={filters.element} onChange={event=>set("element",event.target.value)}><option value="">Tất cả hệ</option><option>Kim</option><option>Mộc</option><option>Thủy</option><option>Hỏa</option><option>Thổ</option><option value="__unknown__">Chưa rõ hệ</option></select></label>
          <label>Option<select value={filters.option} onChange={event=>set("option",event.target.value)}><option value="">Tất cả option</option>{page?.filters.options.map(option=><option key={option}>{option}</option>)}</select></label>
          <label>Chỉ số từ<input type="number" value={filters.min} onChange={event=>set("min",event.target.value)}/></label><label>Đến<input type="number" value={filters.max} onChange={event=>set("max",event.target.value)}/></label>
        </div></section>
      </div>
      <div className={`market-results ${loading?"is-loading":""}`} aria-busy={loading}>
        {loading&&<div className="market-loading-overlay" role="status" aria-live="polite"><span className="market-loading-spinner" aria-hidden="true"/><strong>Đang lọc dữ liệu…</strong></div>}
        <div className="section-title"><h2>Danh sách theo sạp</h2><span className="count">{page?.total_items??0} món phù hợp · đang hiện {shops.reduce((sum,shop)=>sum+shop.items.length,0)}</span></div>
        {error?<div className="empty error">{error}</div>:!loading&&!shops.length?<div className="empty">Không có món nào khớp bộ lọc.</div>:null}
        <div className="shop-groups shop-ledger">{shops.map((shop,index)=><article className="shop-group" key={`${shop.owner_name}-${shop.shop_name}-${index}`}><header className="shop-header"><div><h3>{shop.shop_name||"Sạp không tên"}</h3><span>Chủ sạp {shop.owner_name}</span></div><div className="shop-location">{shop.map_name||"Chưa rõ thành"} {shop.x??"?"}:{shop.y??"?"} · {shop.items.length} món</div></header><div className="table-scroll"><table className="item-table"><thead><tr><th>Tên đồ</th><th>Hệ</th><th>Cấp</th><th>Giá</th><th>Option</th></tr></thead><tbody>{shop.items.map((item,itemIndex)=><tr key={`${item.name}-${itemIndex}`}><td className="item-cell"><strong className="item-name">{item.name}</strong><span className="item-meta"><span className={`element-label ${elementClass(item.element)}`}>{item.element||"Chưa rõ"}</span><span>{item.level==null?"Chưa rõ cấp":`Cấp ${item.level}`}</span></span></td><td><span className={`element-label ${elementClass(item.element)}`}>{item.element||"Chưa rõ"}</span></td><td className="level">{item.level??"—"}</td><td className="price">{formatPrice(item.price,item.currency)}</td><td className="options-cell">{item.options?.length?<ul className="option-list">{item.options.map((option,i)=><li key={`${option.label}-${i}`}>{optionText(option)}</li>)}</ul>:<span className="meta">Chưa có option</span>}</td></tr>)}</tbody></table></div></article>)}</div>
        {page?.next_cursor&&<button className="load-more" type="button" disabled={loadingMore} onClick={()=>load(page.next_cursor??undefined,true)}>{loadingMore?"Đang tải…":"Xem thêm"}</button>}
      </div>
    </section>
    <SiteFooter/>
  </main>;
}
