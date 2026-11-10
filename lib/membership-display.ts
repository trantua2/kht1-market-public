import type {Feature,Plan,SubscriptionStatus} from "@/lib/entitlements";

export function planLabel(plan:Plan|null){return plan==="market"?"Gói tra cứu":plan==="full"?"Gói hội viên":"Chưa đăng ký"}
export function statusLabel(status:SubscriptionStatus|"none"){return ({active:"Đang sử dụng",paused:"Tạm dừng",expired:"Đã hết hạn",revoked:"Đã thu hồi",none:"Chưa đăng ký"} as const)[status]}
export function hasMarketAccess(features:readonly Feature[]){return features.includes("market.read")}
