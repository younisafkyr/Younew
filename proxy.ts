import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/session";
import { detectSource } from "@/lib/source";

export function proxy(req: NextRequest) {
  const { pathname, searchParams } = req.nextUrl;

  // Protection de l'espace admin
  const isAdminPage = pathname.startsWith("/admin") && pathname !== "/admin/login";
  const isAdminApi = pathname.startsWith("/api/admin");
  if (isAdminPage || isAdminApi) {
    if (!verifySessionToken(req.cookies.get(SESSION_COOKIE)?.value)) {
      if (isAdminApi) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }
    return NextResponse.next();
  }

  // Mémorise la source du visiteur (Facebook / Instagram / TikTok...) pendant 7 jours
  const res = NextResponse.next();
  const hasTracking =
    searchParams.get("utm_source") || searchParams.get("fbclid") || searchParams.get("ttclid") || searchParams.get("gclid");
  const referrer = req.headers.get("referer") || "";
  const externalRef = referrer && !referrer.includes(req.nextUrl.host);
  if (hasTracking || (externalRef && !req.cookies.get("yn_src"))) {
    const src = detectSource({
      utmSource: searchParams.get("utm_source"),
      fbclid: searchParams.get("fbclid"),
      ttclid: searchParams.get("ttclid"),
      gclid: searchParams.get("gclid"),
      referrer,
    });
    res.cookies.set("yn_src", src, { maxAge: 60 * 60 * 24 * 7, path: "/", sameSite: "lax" });
  }
  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|uploads|favicon.ico).*)"],
};
