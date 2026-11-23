import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { productData } from "../shared";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: Ctx) {
  const id = Number((await params).id);
  const data = productData(await req.json().catch(() => ({})));
  if (data.slug) {
    const other = await db.product.findUnique({ where: { slug: data.slug } });
    if (other && other.id !== id) data.slug = `${data.slug}-${id}`;
  }
  await db.product.update({ where: { id }, data });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_: Request, { params }: Ctx) {
  const id = Number((await params).id);
  await db.product.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
