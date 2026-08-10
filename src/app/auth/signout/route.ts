import { NextResponse } from "next/server";

import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabaseClient();
    await supabase.auth.signOut();
  } catch {
    // Local preview mode has no Supabase session to clear.
  }

  return NextResponse.redirect(new URL("/", request.url), { status: 303 });
}
