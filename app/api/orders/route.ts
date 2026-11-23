import { NextResponse } from "next/server";
import { cookies, headers } from "next/headers";
import { db } from "@/lib/db";
import { isValidPhone, makeReference, normalizePhone } from "@/lib/format";

type Item = { productId: number; quantity: number; size?: string; color?: string };

export async function POST(req: Request) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Requête invalide" }, { status: 400 });
  }
  const name = String(body.name || "").trim().slice(0, 100);
  const phone = normalizePhone(String(body.phone || ""));
  const city = String(body.city || "").trim().slice(0, 80);
  const cityId = body.cityId ? String(body.cityId).slice(0, 20) : null;
  const address = String(body.address || "").trim().slice(0, 300);
  const items: Item[] = Array.isArray(body.items) ? body.items.slice(0, 20) : [];

  if (name.length < 2) return NextResponse.json({ error: "الاسم ضروري" }, { status: 400 });
  if (!isValidPhone(phone)) return NextResponse.json({ error: "رقم الهاتف غير صحيح" }, { status: 400 });
  if (!city) return NextResponse.json({ error: "المدينة ضرورية" }, { status: 400 });
  if (address.length < 3) return NextResponse.json({ error: "العنوان ضروري" }, { status: 400 });
  if (!items.length) return NextResponse.json({ error: "السلة فارغة" }, { status: 400 });

  const blocked = await db.blockedPhone.findUnique({ where: { phone } });
  if (blocked) {
    // On ne dit pas au client qu'il est bloqué
    return NextResponse.json({ ok: true, reference: makeReference() });
  }

  // Anti-doublon : même numéro dans les 5 dernières minutes
  const recent = await db.order.findFirst({
    where: { phone, createdAt: { gt: new Date(Date.now() - 5 * 60 * 1000) } },
  });
  if (recent) return NextResponse.json({ ok: true, reference: recent.reference });

  // Les prix viennent TOUJOURS de la base, jamais du navigateur
  const ids = items.map((i) => Number(i.productId)).filter(Number.isInteger);
  const products = await db.product.findMany({ where: { id: { in: ids }, active: true } });
  const lines = [];
  for (const i of items) {
    const p = products.find((x) => x.id === Number(i.productId));
    if (!p) return NextResponse.json({ error: "منتج غير متوفر" }, { status: 400 });
    const quantity = Math.min(Math.max(1, Math.floor(Number(i.quantity) || 1)), 10);
    lines.push({
      productId: p.id,
      name: p.name,
      size: i.size ? String(i.size).slice(0, 20) : null,
      color: i.color ? String(i.color).slice(0, 30) : null,
      quantity,
      price: p.price,
    });
  }
  const shippingFee = Number(process.env.SHIPPING_FEE || 0);
  const total = lines.reduce((s, l) => s + l.price * l.quantity, 0) + shippingFee;

  const c = await cookies();
  const h = await headers();
  const source = String(c.get("yn_src")?.value || "Direct").slice(0, 30);
  const ip = (h.get("x-forwarded-for") || "").split(",")[0].trim() || null;

  const order = await db.order.create({
    data: {
      reference: makeReference(),
      customerName: name,
      phone,
      city,
      cityId,
      address,
      note: String(body.note || "").slice(0, 300),
      total,
      shippingFee,
      source,
      ip,
      items: { create: lines },
      history: { create: { status: "NEW", message: "Commande passée sur le site" } },
    },
  });
  return NextResponse.json({ ok: true, reference: order.reference, total });
}
