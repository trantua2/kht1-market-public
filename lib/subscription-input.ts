import { z } from "zod";

const schema = z.object({
  user_id: z.string().uuid(), plan: z.enum(["market", "full"]),
  status: z.enum(["active", "paused", "revoked", "expired"]),
  starts_at: z.iso.datetime(), expires_at: z.iso.datetime(),
  source: z.enum(["manual", "complimentary", "payment", "promotion"]),
  note: z.string().trim().max(500).optional().default(""),
});
export type SubscriptionInput = z.infer<typeof schema>;
export function calculateExtension(currentExpiry:string|null|undefined,days:number,now=new Date()) { if(!Number.isInteger(days)||days<1||days>3650)throw new Error("Số ngày phải từ 1 đến 3650");const current=currentExpiry?new Date(currentExpiry):now;const base=current>now?current:now;return new Date(base.getTime()+days*86400000); }
export function parseSubscriptionInput(value: unknown): SubscriptionInput {
  const parsed = schema.parse(value);
  if (new Date(parsed.expires_at) <= new Date(parsed.starts_at)) throw new Error("Ngày hết hạn phải sau ngày bắt đầu");
  return parsed;
}
