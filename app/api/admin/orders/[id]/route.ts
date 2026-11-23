import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { setOrderStatus, shipOrder, syncOrder } from "@/lib/orders";
import { STATUS_KEYS } from "@/lib/statuses";
import { normalizePhone } from "@/lib/format";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: Ctx) {
  const id = Number((await params).id);
  const body = await req.json().catch(() => ({}));
  const order = await db.order.findUnique({ where: { id } });
  if (!order) return NextResponse.json({ error: "Introuvable" }, { status: 404 });

  const data: Record<string, any> = {};
  for (const f of ["customerName", "city", "address", "note"] as const) {
    if (typeof body[f] === "string") data[f] = body[f].trim().slice(0, 300);
  }
  if (typeof body.phone === "string") data.phone = normalizePhone(body.phone);
  if (typeof body.cityId === "string") data.cityId = body.cityId || null;
  if (body.total != null && !order.trackingNumber) data.total = Number(body.total);
  if (Object.keys(data).length) await db.order.update({ where: { id }, data });

  if (body.status && body.status !== order.status) {
    if (!STATUS_KEYS.includes(body.status)) return NextResponse.json({ error: "Statut invalide" }, { status: 400 });
    await setOrderStatus(id, body.status, body.message || "");
  }
  return NextResponse.json({ ok: true });
}

export async function POST(req: Request, { params }: Ctx) {
  const id = Number((await params).id);
  const { action } = await req.json().catch(() => ({}));
  try {
    if (action === "ship") return NextResponse.json({ ok: true, trackingNumber: await shipOrder(id) });
    if (action === "track") return NextResponse.json({ ok: true, status: await syncOrder(id) });
    if (action === "block") {
      const o = await db.order.findUnique({ where: { id } });
      if (o) {
        await db.blockedPhone.upsert({
          where: { phone: o.phone },
          create: { phone: o.phone, reason: `Commande ${o.reference}` },
          update: {},
        });
        if (o.status === "NEW") await setOrderStatus(id, "CANCELLED", "Client bloqué");
      }
      return NextResponse.json({ ok: true });
    }
    return NextResponse.json({ error: "Action inconnue" }, { status: 400 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}

export async function DELETE(_: Request, { params }: Ctx) {
  const id = Number((await params).id);
  await db.order.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
