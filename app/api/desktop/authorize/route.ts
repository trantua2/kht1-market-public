import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { hashOpaqueToken, newOpaqueToken, validateDesktopAuthorizeRequest } from "@/lib/desktop-auth";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {data:{user}} = await supabase.auth.getUser();
  if (!user) return NextResponse.json({error:"Đăng nhập bắt buộc"},{status:401});
  try {
    const input = validateDesktopAuthorizeRequest(await request.json());
    const code = newOpaqueToken();
    const expiresAt = new Date(Date.now()+5*60_000).toISOString();
    const {error} = await createAdminClient().from("desktop_auth_codes").insert({
      user_id:user.id, code_hash:hashOpaqueToken(code), pkce_challenge:input.challenge,
      callback_url:input.callback.toString(), expires_at:expiresAt,
    });
    if (error) throw error;
    input.callback.searchParams.set("code",code);
    input.callback.searchParams.set("state",input.state);
    return NextResponse.json({redirect_to:input.callback.toString()});
  } catch (error) {
    return NextResponse.json({error:error instanceof Error?error.message:"Yêu cầu không hợp lệ"},{status:400});
  }
}
