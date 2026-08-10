import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const protectedRoutes = ["/today", "/habits", "/quests", "/insights", "/check-in", "/account"];
const authRoutes = ["/login", "/signup"];

export async function updateSession(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Keep local design work accessible until a Supabase project is configured.
  if (!url || !key) return NextResponse.next({ request });

  let response = NextResponse.next({ request });
  const supabase = createServerClient(url, key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (items) => {
        items.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        items.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  const { data } = await supabase.auth.getClaims();
  const signedIn = Boolean(data?.claims?.sub);
  const pathname = request.nextUrl.pathname;

  if (!signedIn && protectedRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`))) {
    const destination = request.nextUrl.clone();
    destination.pathname = "/login";
    destination.searchParams.set("next", pathname);
    return NextResponse.redirect(destination);
  }

  if (signedIn && authRoutes.includes(pathname)) {
    const destination = request.nextUrl.clone();
    destination.pathname = "/today";
    destination.search = "";
    return NextResponse.redirect(destination);
  }

  return response;
}
