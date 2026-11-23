import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isValidPhone, makeReference, normalizePhone } from "@/lib/format";

// Commande saisie à la main (ex : client qui commande sur WhatsApp)
export async function POST(req: Request) {
  const b = await req.json().catch(() => ({}));
  const phone = normalizePhone(String(b.phone || ""));
  if (!b.customerName || !isValidPhone(phone) || !b.city || !b.address) {
    return NextResponse.json({ error: "Nom, téléphone valide, ville et adresse obligatoires" }, { status: 400 });
  }
  const product = b.productId ? await db.product.findUnique({ where: { id: Number(b.productId) } }) : null;
  const quantity = Math.max(1, Number(b.quantity) || 1);
  const total = b.total != null && b.total !== "" ? Number(b.total) : (product?.price || 0) * quantity;
  const order = await db.order.create({
    data: {
      reference: makeReference(),
      customerName: String(b.customerName),
      phone,
      city: String(b.city),
      address: String(b.address),
      note: String(b.note || ""),
      total,
      source: String(b.source || "Manuel"),
      status: "NEW",
      items: {
        create: [{
          productId: product?.id,
          name: product?.name || String(b.itemName || "Article"),
          size: b.size || null,
          color: b.color || null,
          quantity,
          price: product?.price || total / quantity,
        }],
      },
      history: { create: { status: "NEW", message: "Commande saisie à la main" } },
    },
  });
  return NextResponse.json({ ok: true, id: order.id });
}
