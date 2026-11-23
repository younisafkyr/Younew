import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { slugify } from "@/lib/format";

export async function POST(req: Request) {
  const { name } = await req.json().catch(() => ({}));
  if (!name) return NextResponse.json({ error: "Nom obligatoire" }, { status: 400 });
  const slug = slugify(name);
  if (await db.collection.findUnique({ where: { slug } }))
    return NextResponse.json({ error: "Existe déjà" }, { status: 400 });
  const count = await db.collection.count();
  await db.collection.create({ data: { name: String(name), slug, position: count } });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const id = Number(new URL(req.url).searchParams.get("id"));
  await db.product.updateMany({ where: { collectionId: id }, data: { collectionId: null } });
  await db.collection.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
