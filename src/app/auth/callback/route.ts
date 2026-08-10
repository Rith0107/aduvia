import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const tokenHash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type") as EmailOtpType | null;
  const requestedNext = url.searchParams.get("next");
  const next = requestedNext?.startsWith("/") && !requestedNext.startsWith("//") ? requestedNext : "/today";

  try {
    const supabase = await createServerSupabaseClient();
    const result = code
      ? await supabase.auth.exchangeCodeForSession(code)
      : tokenHash && type
        ? await supabase.auth.verifyOtp({ token_hash: tokenHash, type })
        : { error: new Error("Missing authentication token.") };
    if (!result.error) return NextResponse.redirect(new URL(next, url.origin));
  } catch { /* The error redirect below gives the user a recoverable path. */ }

  const login = new URL("/login", url.origin);
  login.searchParams.set("error", "confirmation_failed");
  return NextResponse.redirect(login);
}
