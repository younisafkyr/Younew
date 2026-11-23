import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { normalizePhone } from "@/lib/format";

export async function POST(req: Request) {
  const { phone, reason } = await req.json().catch(() => ({}));
  const p = normalizePhone(String(phone || ""));
  if (!p) return NextResponse.json({ error: "Téléphone obligatoire" }, { status: 400 });
  await db.blockedPhone.upsert({ where: { phone: p }, create: { phone: p, reason: reason || "" }, update: {} });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const id = Number(new URL(req.url).searchParams.get("id"));
  await db.blockedPhone.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
