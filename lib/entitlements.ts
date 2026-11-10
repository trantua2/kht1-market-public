export type Plan = "market" | "full";
export type SubscriptionStatus = "active" | "paused" | "revoked" | "expired";
export type Feature = "market.read" | "market.options.full" | "quest.run" | "agent.download";
export type Subscription = { plan: Plan; status: SubscriptionStatus; starts_at: string; expires_at: string };

const PLAN_FEATURES: Record<Plan, Feature[]> = {
  market: ["market.read"],
  full: ["market.read", "market.options.full", "quest.run", "agent.download"],
};

export function evaluateEntitlement(subscription: Subscription | null, now = new Date()) {
  const active = Boolean(subscription && subscription.status === "active" && new Date(subscription.starts_at) <= now && new Date(subscription.expires_at) > now);
  const status: SubscriptionStatus | "none" = subscription?.status==="active"&&new Date(subscription.expires_at)<=now?"expired":subscription?.status ?? "none";
  return { plan: active ? subscription!.plan : null, status, starts_at: subscription?.starts_at ?? null, expires_at: subscription?.expires_at ?? null, features: active ? PLAN_FEATURES[subscription!.plan] : [], server_time: now.toISOString() };
}

export function hasFeature(features: readonly Feature[], feature: Feature) { return features.includes(feature); }
