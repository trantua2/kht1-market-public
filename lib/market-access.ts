type Option={label?:string;value?:number;unit?:string};
type Item={name?:string;price?:number;currency?:string;element?:string;level?:number;options?:Option[];locked_option_count?:number};
type Shop={owner_name?:string;shop_name?:string;map_name?:string;x?:number;y?:number;items:Item[]};
type Snapshot={published_at?:string|null;shop_count:number;item_count:number;snapshots?:Record<string,string|null>;shops:Shop[]};

export type MarketFilters={
  query?:string;city?:string;itemType?:string;element?:string;option?:string;
  min?:number;max?:number;priceMax?:number;priceCurrency?:string;
};
export type MarketPageOptions=MarketFilters&{fullOptions:boolean;cursor?:string|null;limit?:number};

const NORMAL_OPTION_LABELS=new Set([
  "Sức mạnh","Thân pháp","Sinh khí","Nội công","Thể lực tối đa","Sinh lực tối đa","Nội lực tối đa",
  "Thời gian làm chậm","Thời gian làm choáng","Thời gian trúng độc","Thời gian phục hồi",
  "Kháng lôi","Kháng băng","Kháng hỏa","Kháng độc","Phòng thủ vật lý",
  "Phục hồi thể lực mỗi nửa giây","Phục hồi sinh lực mỗi nửa giây","Phục hồi nội lực mỗi nửa giây",
]);

export function isNormalOption(label:unknown){return typeof label==="string"&&NORMAL_OPTION_LABELS.has(label.trim())}

function fold(value:unknown){return String(value??"").toLocaleLowerCase("vi-VN").replace(/đ/g,"d").normalize("NFD").replace(/[\u0300-\u036f]/g,"")}
function jewelryType(name?:string){const value=fold(name);if(value.includes("gioi chi")||value.includes("nhan"))return "ring";if(value.includes("hang lien")||value.includes("day chuyen"))return "necklace";if(value.includes("ngoc boi"))return "pendant";if(value.includes("ho than phu"))return "charm";if(value.includes("huong nang"))return "sachet";return ""}
function currencyKind(currency?:string){const value=fold(currency);if(["vnd","tien dong","dong","coin"].includes(value))return "coin";if(["silver","tien bac","bac"].includes(value))return "silver";return ""}

function visibleOptions(item:Item,fullOptions:boolean){return (item.options??[]).filter(option=>fullOptions||isNormalOption(option.label))}
function matches(item:Item,shop:Shop,options:MarketPageOptions){
  if(options.query&&!fold(item.name).includes(fold(options.query)))return false;
  if(options.city&&shop.map_name!==options.city)return false;
  if(options.itemType&&jewelryType(item.name)!==options.itemType)return false;
  if(options.element==="__unknown__"?Boolean(item.element):options.element&&item.element!==options.element)return false;
  if(options.priceMax!==undefined&&(item.price==null||currencyKind(item.currency)!==(options.priceCurrency||"coin")||item.price>options.priceMax))return false;
  if(options.option){
    const candidates=visibleOptions(item,options.fullOptions);
    if(!candidates.some(option=>option.label===options.option&&(options.min===undefined||(option.value??0)>=options.min)&&(options.max===undefined||(option.value??0)<=options.max)))return false;
  }
  return true;
}

function projectItem(item:Item,fullOptions:boolean):Item{
  if(fullOptions)return {...item,options:[...(item.options??[])]};
  const options=visibleOptions(item,false),locked=(item.options??[]).length-options.length;
  return {...item,options,...(locked?{locked_option_count:locked}:{})};
}

export function projectMarketPage(snapshot:Snapshot,options:MarketPageOptions){
  const limit=options.limit??100;
  if(!Number.isInteger(limit)||limit<1||limit>100)throw new Error("limit phải từ 1 đến 100");
  for(const value of [options.min,options.max,options.priceMax])if(value!==undefined&&!Number.isFinite(value))throw new Error("Bộ lọc số không hợp lệ");
  const offset=options.cursor?Number(options.cursor):0;
  if(!Number.isInteger(offset)||offset<0)throw new Error("cursor không hợp lệ");
  const rows=snapshot.shops.flatMap((shop,shopIndex)=>shop.items.filter(item=>matches(item,shop,options)).map(item=>({shop,shopIndex,item})));
  const slice=rows.slice(offset,offset+limit),shops:Shop[]=[];
  for(const row of slice){
    const previous=shops.at(-1);
    if(previous&&(previous as Shop&{_index?:number})._index===row.shopIndex)previous.items.push(projectItem(row.item,options.fullOptions));
    else shops.push({...row.shop,_index:row.shopIndex,items:[projectItem(row.item,options.fullOptions)]} as Shop&{_index:number});
  }
  for(const shop of shops)delete (shop as Shop&{_index?:number})._index;
  const availableOptions=[...new Set(snapshot.shops.flatMap(shop=>shop.items.flatMap(item=>visibleOptions(item,options.fullOptions).map(option=>option.label).filter((label):label is string=>Boolean(label)))))].sort((a,b)=>a.localeCompare(b,"vi"));
  const cities=[...new Set(snapshot.shops.map(shop=>shop.map_name).filter((city):city is string=>Boolean(city)))].sort((a,b)=>a.localeCompare(b,"vi"));
  return {published_at:snapshot.published_at??null,shop_count:snapshot.shop_count,item_count:snapshot.item_count,snapshots:snapshot.snapshots??{},total_items:rows.length,shops,next_cursor:offset+slice.length<rows.length?String(offset+slice.length):null,filters:{cities,options:availableOptions},tier:options.fullOptions?"plus":"normal"};
}
