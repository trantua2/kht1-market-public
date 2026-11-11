import {createHmac} from "node:crypto";
import {NextRequest,NextResponse} from "next/server";
import {currentEntitlement} from "@/lib/current-entitlement";
import {createAdminClient} from "@/lib/supabase/admin";
import {requiredEnv} from "@/lib/config";
import {projectMarketPage} from "@/lib/market-access";
import {publicMarketServer,resolveMarketServer,type MarketServer} from "@/lib/market-servers";

const EMPTY_MARKET={published_at:null,shop_count:0,item_count:0,shops:[]};
const integer=(value:string|null)=>value==null||value===""?undefined:Number(value);

export async function GET(request:NextRequest){
  const {user,entitlement}=await currentEntitlement();
  if(!user)return NextResponse.json({error:"Đăng nhập bắt buộc"},{status:401});
  if(!entitlement.features.includes("market.read"))return NextResponse.json({error:"Bạn cần gói tra cứu đang hoạt động"},{status:403});
  const db=createAdminClient();
  const {data:rateData,error:rateError}=await db.rpc("consume_market_rate_limit",{p_user_id:user.id,p_limit:30});
  if(rateError)return NextResponse.json({error:"Chưa thể kiểm tra giới hạn truy cập"},{status:503});
  const rate=Array.isArray(rateData)?rateData[0]:rateData;
  if(!rate?.allowed){
    const forwarded=request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()||"unknown";
    const ipHash=createHmac("sha256",requiredEnv("KHT_MARKET_INGEST_SECRET")).update(forwarded).digest("hex");
    await db.from("market_access_audit").insert({user_id:user.id,ip_hash:ipHash,user_agent:(request.headers.get("user-agent")||"").slice(0,500),reason:"rate_limit",request_count:rate?.request_count??null});
    return NextResponse.json({error:"Bạn thao tác quá nhanh. Hãy thử lại sau."},{status:429,headers:{"Retry-After":String(rate?.retry_after??60)}});
  }
  const params=request.nextUrl.searchParams;
  const {data:serverRows,error:serverError}=await db.from("market_servers").select("slug,code,name,is_active,is_default,display_order").eq("is_active",true).order("display_order");
  if(serverError)return NextResponse.json({error:serverError.message},{status:500});
  let server;
  try{server=resolveMarketServer((serverRows??[]) as MarketServer[],params.get("server"));}
  catch(reason){return NextResponse.json({error:reason instanceof Error?reason.message:"Chưa cấu hình máy chủ"},{status:503})}
  const {data,error}=await db.from("market_snapshots").select("payload").eq("server_slug",server.slug).order("published_at",{ascending:false}).limit(1).maybeSingle();
  if(error)return NextResponse.json({error:error.message},{status:500});
  try{
    const page=projectMarketPage((data?.payload??EMPTY_MARKET) as never,{
      fullOptions:entitlement.features.includes("market.options.full"),cursor:params.get("cursor"),limit:integer(params.get("limit"))??100,
      query:params.get("query")||undefined,city:params.get("city")||undefined,itemType:params.get("itemType")||undefined,element:params.get("element")||undefined,option:params.get("option")||undefined,
      min:integer(params.get("min")),max:integer(params.get("max")),priceMax:integer(params.get("priceMax")),priceCurrency:params.get("priceCurrency")||undefined,
    });
    return NextResponse.json({...page,server:publicMarketServer(server),servers:(serverRows??[]).map(row=>publicMarketServer(row as MarketServer))},{headers:{"Cache-Control":"private, no-store","X-RateLimit-Remaining":String(rate.remaining??0)}});
  }catch(reason){return NextResponse.json({error:reason instanceof Error?reason.message:"Bộ lọc không hợp lệ"},{status:400})}
}
