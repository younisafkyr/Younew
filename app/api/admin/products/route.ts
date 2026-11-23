import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { productData } from "./shared";

export async function POST(req: Request) {
  const b = await req.json().catch(() => ({}));
  const data = productData(b);
  if (!data.name || !data.price) return NextResponse.json({ error: "Nom et prix obligatoires" }, { status: 400 });
  let slug = data.slug!;
  let n = 1;
  while (await db.product.findUnique({ where: { slug } })) slug = `${data.slug}-${++n}`;
  const p = await db.product.create({ data: { ...(data as any), slug } });
  return NextResponse.json({ ok: true, id: p.id });
}
