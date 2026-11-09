"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/browser";

type Option = { label?: string; value?: number; unit?: string };
type Item = { name?: string; price?: number; currency?: string; element?: string; level?: number; options?: Option[] };
type Shop = { owner_name?: string; shop_name?: string; map_name?: string; x?: number; y?: number; items: Item[] };
type Snapshot = { published_at?: string | null; shop_count: number; item_count: number; snapshots?: Record<string,string | null>; shops: Shop[] };
type Filters = { query:string; city:string; itemType:string; element:string; option:string; min:string; max:string; priceMax:string; priceCurrency:string };

const EMPTY_FILTERS: Filters = { query:"",city:"",itemType:"",element:"",option:"",min:"",max:"",priceMax:"",priceCurrency:"coin" };
const MAX_RENDERED_ITEMS = 500;

function fold(value:unknown){return String(value??"").toLocaleLowerCase("vi-VN").replace(/đ/g,"d").normalize("NFD").replace(/[\u0300-\u036f]/g,"")}
function currencyKind(currency?:string){const value=fold(currency);if(["vnd","tien dong","dong","coin"].includes(value))return "coin";if(["silver","tien bac","bac"].includes(value))return "silver";return ""}
function formatPrice(value?:number,currency?:string){if(value==null)return "Chưa đọc được giá";if(currencyKind(currency)==="coin")return `${value.toLocaleString("vi-VN")} xu`;if(currencyKind(currency)==="silver")return `${new Intl.NumberFormat("vi-VN",{maximumFractionDigits:1}).format(value/10000)} vạn`;return `${value.toLocaleString("vi-VN")}${currency?` ${currency}`:""}`}
function elementClass(element?:string){return ({Kim:"element-kim",Mộc:"element-moc",Thủy:"element-thuy",Hỏa:"element-hoa",Thổ:"element-tho"} as Record<string,string>)[element??""]??"element-unknown"}
function jewelryType(name?:string){const value=fold(name);if(value.includes("gioi chi")||value.includes("nhan"))return "ring";if(value.includes("hang lien")||value.includes("day chuyen"))return "necklace";if(value.includes("ngoc boi"))return "pendant";if(value.includes("ho than phu"))return "charm";if(value.includes("huong nang"))return "sachet";return ""}
function optionText(option:Option){const value=option.value??0;return `${option.label??""} ${value>0?"+":""}${value}${option.unit==="percent"?"%":""}`}

function filteredShops(snapshot:Snapshot,filters:Filters){
  const min=filters.min===""?null:Number(filters.min),max=filters.max===""?null:Number(filters.max),priceMax=filters.priceMax===""?null:Number(filters.priceMax);
  return snapshot.shops.filter(shop=>!filters.city||shop.map_name===filters.city).map(shop=>({...shop,items:shop.items.filter(item=>{
    if(filters.query&&!fold(item.name).includes(fold(filters.query)))return false;
    if(filters.itemType&&jewelryType(item.name)!==filters.itemType)return false;
    if(filters.element==="__unknown__"?Boolean(item.element):filters.element!==""&&item.element!==filters.element)return false;
    if(priceMax!==null&&(item.price==null||currencyKind(item.currency)!==filters.priceCurrency||item.price>priceMax))return false;
    if(!filters.option)return true;
    return (item.options??[]).some(option=>option.label===filters.option&&(min===null||(option.value??0)>=min)&&(max===null||(option.value??0)<=max));
  })})).filter(shop=>shop.items.length);
}

function limitedShops(shops:Shop[]){let remaining=MAX_RENDERED_ITEMS;const result:Shop[]=[];for(const shop of shops){if(remaining<=0)break;const items=shop.items.slice(0,remaining);if(items.length)result.push({...shop,items});remaining-=items.length}return result}

export function MarketClient(){
  const [snapshot,setSnapshot]=useState<Snapshot>({shop_count:0,item_count:0,shops:[]});
  const [filters,setFilters]=useState<Filters>(EMPTY_FILTERS);
  const [error,setError]=useState("");
  const [loading,setLoading]=useState(true);
  useEffect(()=>{fetch("/api/market",{cache:"no-store"}).then(async response=>{const payload=await response.json();if(!response.ok)throw new Error(payload.error);setSnapshot(payload)}).catch(reason=>setError(reason instanceof Error?reason.message:"Không tải được dữ liệu")).finally(()=>setLoading(false))},[]);
  const cities=useMemo(()=>[...new Set(snapshot.shops.map(shop=>shop.map_name).filter((value):value is string=>Boolean(value)))].sort((a,b)=>a.localeCompare(b,"vi")),[snapshot]);
  const options=useMemo(()=>[...new Set(snapshot.shops.flatMap(shop=>shop.items.flatMap(item=>(item.options??[]).map(option=>option.label).filter((value):value is string=>Boolean(value)))))].sort((a,b)=>a.localeCompare(b,"vi")),[snapshot]);
  const matches=useMemo(()=>filteredShops(snapshot,filters),[snapshot,filters]);
  const rendered=useMemo(()=>limitedShops(matches),[matches]);
  const matchedItems=matches.reduce((sum,shop)=>sum+shop.items.length,0),renderedItems=rendered.reduce((sum,shop)=>sum+shop.items.length,0);
  const set=<K extends keyof Filters>(key:K,value:Filters[K])=>setFilters(current=>({...current,[key]:value}));
  async function signOut(){await createClient().auth.signOut();location.href="/login"}
  const summary=Object.entries(snapshot.snapshots??{}).map(([city,date])=>`${city}: ${date?new Date(date).toLocaleString("vi-VN"):"chưa quét"}`).join(" · ");

  return <main className="market-shell">
    <header className="hero">
      <div><p className="eyebrow">KIẾM HIỆP TÌNH 1 · SABO</p><h1>Sạp hàng KHT1</h1><p className="subtitle">Danh sách vật phẩm đang bán ở các sạp. Dữ liệu cập nhật theo từng lượt quét.</p></div>
      <div className="hero-side"><nav className="account-nav"><Link href="/market">Sản phẩm</Link><Link href="/account">Tài khoản</Link><Link href="/admin">Quản trị</Link><button type="button" onClick={signOut}>Đăng xuất</button></nav><div className={`status ${error?"error":loading?"":"ok"}`}><span className="dot"/><span>{error||(loading?"Đang tải dữ liệu…":`Cập nhật ${snapshot.published_at?new Date(snapshot.published_at).toLocaleString("vi-VN"):"không rõ"}`)}</span></div></div>
    </header>
    <section className="market panel">
      <div className="market-head"><div><h2>Dữ liệu mới nhất của các thành</h2><p className="hint">{loading?"Đang tải dữ liệu…":`${snapshot.shop_count} sạp · ${snapshot.item_count} món${summary?` · ${summary}`:""}`}</p></div></div>
      <div className="filter-grid">
        <label>Tên món<input type="search" placeholder="Toàn Thạch, Giới Chỉ…" value={filters.query} onChange={event=>set("query",event.target.value)}/></label>
        <label>Thành<select value={filters.city} onChange={event=>set("city",event.target.value)}><option value="">Tất cả thành</option>{cities.map(city=><option key={city}>{city}</option>)}</select></label>
        <label>Loại trang sức<select value={filters.itemType} onChange={event=>set("itemType",event.target.value)}><option value="">Tất cả loại</option><option value="ring">Nhẫn</option><option value="necklace">Hạng liên</option><option value="pendant">Ngọc bội</option><option value="charm">Hộ thân phù</option><option value="sachet">Hương nang</option></select></label>
        <label>Hệ<select value={filters.element} onChange={event=>set("element",event.target.value)}><option value="">Tất cả hệ</option><option>Kim</option><option>Mộc</option><option>Thủy</option><option>Hỏa</option><option>Thổ</option><option value="__unknown__">Chưa rõ hệ</option></select></label>
        <label>Option<select value={filters.option} onChange={event=>set("option",event.target.value)}><option value="">Tất cả option</option>{options.map(option=><option key={option}>{option}</option>)}</select></label>
        <label>Từ<input type="number" placeholder="Không giới hạn" value={filters.min} onChange={event=>set("min",event.target.value)}/></label><label>Đến<input type="number" placeholder="Không giới hạn" value={filters.max} onChange={event=>set("max",event.target.value)}/></label>
        <label>Giá tối đa<span className="price-filter-control"><input type="number" min="0" placeholder="Không giới hạn" value={filters.priceMax} onChange={event=>set("priceMax",event.target.value)}/><select aria-label="Đơn vị giá" value={filters.priceCurrency} onChange={event=>set("priceCurrency",event.target.value)}><option value="coin">Xu</option><option value="silver">Bạc</option></select></span></label>
        <button type="button" className="secondary" onClick={()=>setFilters(EMPTY_FILTERS)}>Reset bộ lọc</button>
      </div>
      <div className="section-title"><h2>Danh sách theo sạp</h2><span className="count">{matches.length} sạp · {matchedItems} món{matchedItems>renderedItems?` · hiển thị ${renderedItems} món đầu`:""}</span></div>
      {error?<div className="empty error">{error}</div>:!loading&&!matches.length?<div className="empty">{snapshot.shop_count?"Không có món nào khớp bộ lọc.":"Chưa có thành nào có dữ liệu quét."}</div>:null}
      <div className="shop-groups">{rendered.map((shop,index)=><article className="shop-group" key={`${shop.owner_name}-${shop.shop_name}-${index}`}><header className="shop-header"><div><h3>{shop.shop_name||"Sạp không tên"}</h3><span>Chủ sạp {shop.owner_name}</span></div><div className="shop-location">{shop.map_name||"Chưa rõ thành"} {shop.x??"?"}:{shop.y??"?"} · {shop.items.length} món</div></header><div className="table-scroll"><table className="item-table"><thead><tr><th>Tên đồ</th><th>Hệ</th><th>Cấp</th><th>Giá</th><th>Option</th></tr></thead><tbody>{shop.items.map((item,itemIndex)=><tr key={`${item.name}-${itemIndex}`}><td className="item-cell" data-label="Tên đồ"><strong className="item-name">{item.name}</strong><span className="item-meta"><span className={`element-label ${elementClass(item.element)}`}>{item.element||"Chưa rõ"}</span><span>{item.level==null?"Chưa rõ cấp":`Cấp ${item.level}`}</span></span></td><td data-label="Hệ"><span className={`element-label ${elementClass(item.element)}`}>{item.element||"Chưa rõ"}</span></td><td className="level" data-label="Cấp">{item.level??"—"}</td><td className="price" data-label="Giá">{formatPrice(item.price,item.currency)}</td><td className="options-cell" data-label="Option">{item.options?.length?<ul className="option-list">{item.options.map((option,optionIndex)=><li key={`${option.label}-${optionIndex}`}>{optionText(option)}</li>)}</ul>:<span className="meta">Chưa có option</span>}</td></tr>)}</tbody></table></div></article>)}</div>
    </section>
  </main>
}
