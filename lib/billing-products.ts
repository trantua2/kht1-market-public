export type BillingProduct = {
  code: string;
  days: number;
  amount: number;
  label: string;
  badge?: string;
};

export const BILLING_PRODUCTS: readonly BillingProduct[] = [
  {code:"full_3d",days:3,amount:5_000,label:"3 ngày"},
  {code:"full_7d",days:7,amount:10_000,label:"7 ngày",badge:"Phổ biến"},
  {code:"full_15d",days:15,amount:20_000,label:"15 ngày"},
  {code:"full_30d",days:30,amount:35_000,label:"30 ngày",badge:"Tốt nhất"},
];

export function getBillingProduct(code: unknown): BillingProduct {
  const product=BILLING_PRODUCTS.find(item=>item.code===code);
  if(!product)throw new Error("Gói thanh toán không hợp lệ");
  return product;
}
