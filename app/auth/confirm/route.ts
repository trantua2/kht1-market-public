import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { safeNextPath } from "@/lib/auth";
export async function GET(request:NextRequest) { const token_hash=request.nextUrl.searchParams.get("token_hash"); const type=request.nextUrl.searchParams.get("type") as "email"|"magiclink"|null; if(token_hash&&type){ const {error}=await (await createClient()).auth.verifyOtp({token_hash,type}); if(!error) return NextResponse.redirect(new URL(safeNextPath(request.nextUrl.searchParams.get("next")),request.url)); } return NextResponse.redirect(new URL("/login?error=invalid_link",request.url)); }
