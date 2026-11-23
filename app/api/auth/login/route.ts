import { NextResponse } from "next/server";
import { checkPassword, createSessionToken, SESSION_COOKIE, sessionCookieOptions } from "@/lib/auth";

const attempts = new Map<string, { n: number; at: number }>();

export async function POST(req: Request) {
  const ip = (req.headers.get("x-forwarded-for") || "local").split(",")[0];
  const a = attempts.get(ip);
  if (a && a.n >= 5 && Date.now() - a.at < 15 * 60 * 1000) {
    return NextResponse.json({ error: "Trop de tentatives, réessaie dans 15 min" }, { status: 429 });
  }
  const { password } = await req.json().catch(() => ({ password: "" }));
  if (!checkPassword(String(password || ""))) {
    attempts.set(ip, { n: (a?.n || 0) + 1, at: Date.now() });
    return NextResponse.json({ error: "Mot de passe incorrect" }, { status: 401 });
  }
  attempts.delete(ip);
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, createSessionToken(), sessionCookieOptions);
  return res;
}
