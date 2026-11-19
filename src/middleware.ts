import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { isSiteLocale, LOCALE_COOKIE } from "@/i18n/locale";

/**
 * 고객용 페이지: ?lang=ko|es|en 이 붙어 오면 언어 쿠키를 저장하고 깨끗한 주소로 돌려보낸다.
 * /admin 경로 보호: Supabase 세션을 갱신하고, 로그인하지 않은 사용자는 로그인 화면으로 보낸다.
 * (관리자 권한 여부는 admin 레이아웃과 DB RLS에서 다시 확인한다.)
 */
export async function middleware(request: NextRequest) {
  if (!request.nextUrl.pathname.startsWith("/admin")) {
    const lang = request.nextUrl.searchParams.get("lang");
    if (!isSiteLocale(lang)) return NextResponse.next();
    const url = request.nextUrl.clone();
    url.searchParams.delete("lang");
    const res = NextResponse.redirect(url);
    res.cookies.set(LOCALE_COOKIE, lang, { path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax" });
    return res;
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(list) {
          list.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          list.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isLogin = request.nextUrl.pathname === "/admin/login";
  if (!user && !isLogin) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    url.search = "";
    return NextResponse.redirect(url);
  }

  response.headers.set("X-Robots-Tag", "noindex, nofollow");
  return response;
}

export const config = {
  matcher: ["/admin/:path*", { source: "/((?!admin|_next).*)", has: [{ type: "query", key: "lang" }] }],
};
