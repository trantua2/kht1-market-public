export type BillingProduct = {
  code: string;
  plan: "market"|"full";
  days: number;
  amount: number;
  label: string;
  badge?: string;
};

export const BILLING_PRODUCTS: readonly BillingProduct[] = [
  {code:"market_3d",plan:"market",days:3,amount:3_000,label:"3 ngày"},
  {code:"market_7d",plan:"market",days:7,amount:6_000,label:"7 ngày"},
  {code:"market_15d",plan:"market",days:15,amount:12_000,label:"15 ngày",badge:"Phổ biến"},
  {code:"market_30d",plan:"market",days:30,amount:20_000,label:"30 ngày",badge:"Tiết kiệm nhất"},
];

export function getBillingProduct(code: unknown): BillingProduct {
  const product=BILLING_PRODUCTS.find(item=>item.code===code);
  if(!product)throw new Error("Gói thanh toán không hợp lệ");
  return product;
}
