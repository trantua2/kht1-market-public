"use client";
import {useState} from "react";
import type {BillingProduct} from "@/lib/billing-products";

export function PricingCards({products,signedIn}:{products:readonly BillingProduct[];signedIn:boolean}){
  const [busy,setBusy]=useState<string|null>(null);const [error,setError]=useState("");
  async function buy(code:string){
    if(!signedIn){location.href=`/login?next=${encodeURIComponent("/pricing")}`;return}
    setBusy(code);setError("");
    try{const response=await fetch("/api/billing/checkout",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({product_code:code})});const payload=await response.json();if(!response.ok)throw new Error(payload.error||"Không tạo được thanh toán");location.href=payload.checkout_url}
    catch(reason){setError(reason instanceof Error?reason.message:"Không tạo được thanh toán");setBusy(null)}
  }
  return <>
    <div className="pricing-grid">{products.map(product=><article className={`price-card ${product.code==="full_30d"?"featured":""}`} key={product.code}>
      {product.badge&&<span className="price-badge">{product.badge}</span>}<h2>{product.label}</h2><p className="price-value">{product.amount.toLocaleString("vi-VN")}đ</p><p>{Math.round(product.amount/product.days).toLocaleString("vi-VN")}đ/ngày</p>
      <button onClick={()=>buy(product.code)} disabled={busy!==null}>{busy===product.code?"Đang tạo QR…":"Mua gói"}</button>
    </article>)}</div>
    {error&&<p className="billing-error" role="alert">{error}</p>}
  </>;
}
