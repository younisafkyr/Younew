import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "crypto";
import { SESSION_COOKIE, MAX_AGE, verifySessionToken } from "./session";
export { SESSION_COOKIE, createSessionToken, verifySessionToken } from "./session";

export function checkPassword(pw: string) {
  const real = process.env.ADMIN_PASSWORD || "";
  if (!real) return false;
  const a = createHmac("sha256", "pw").update(pw).digest();
  const b = createHmac("sha256", "pw").update(real).digest();
  return timingSafeEqual(a, b);
}

export async function isAdmin() {
  const c = await cookies();
  return verifySessionToken(c.get(SESSION_COOKIE)?.value);
}

export async function requireAdmin() {
  if (!(await isAdmin())) {
    throw new Response(JSON.stringify({ error: "Non autorisé" }), { status: 401 });
  }
}

export const sessionCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: MAX_AGE,
};
