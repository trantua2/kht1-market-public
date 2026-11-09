import { timingSafeEqual } from "node:crypto";
import { NextRequest } from "next/server";
import { requiredEnv } from "@/lib/config";

export function requireInternalSecret(request:NextRequest){
  const actual=request.headers.get("authorization")?.replace(/^Bearer\s+/i,"")??"";
  const expected=requiredEnv("KHT_ADMIN_API_SECRET");
  const left=Buffer.from(actual),right=Buffer.from(expected);
  return left.length===right.length&&timingSafeEqual(left,right);
}
