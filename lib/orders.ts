import { db } from "./db";
import { createParcel, trackParcel, findCityId } from "./ozon";
import { mapCarrierStatus, statusLabel } from "./statuses";

export async function setOrderStatus(orderId: number, status: string, message = "") {
  await db.order.update({ where: { id: orderId }, data: { status } });
  await db.orderHistory.create({ data: { orderId, status, message: message || statusLabel(status) } });
}

/** Envoie une commande confirmée chez Ozon Express. */
export async function shipOrder(orderId: number) {
  const order = await db.order.findUnique({ where: { id: orderId }, include: { items: true } });
  if (!order) throw new Error("Commande introuvable");
  if (order.trackingNumber) throw new Error("Commande déjà envoyée (" + order.trackingNumber + ")");
  if (order.status !== "CONFIRMED") throw new Error("Confirme la commande avant de l'envoyer à Ozon");

  const cityId = order.cityId || (await findCityId(order.city));
  if (!cityId) throw new Error(`Ville "${order.city}" introuvable chez Ozon. Corrige la ville de la commande.`);

  const nature = order.items
    .map((i) => `${i.quantity}x ${i.name}${i.size ? " " + i.size : ""}${i.color ? " " + i.color : ""}`)
    .join(", ");

  const { trackingNumber } = await createParcel({
    reference: order.reference,
    receiver: order.customerName,
    phone: order.phone,
    cityId,
    address: order.address,
    price: order.total,
    nature,
    note: order.note,
  });

  await db.order.update({
    where: { id: order.id },
    data: { trackingNumber, cityId, carrierStatus: "Nouveau colis", carrierSyncedAt: new Date() },
  });
  await setOrderStatus(order.id, "SHIPPED", `Colis créé chez Ozon Express : ${trackingNumber}`);
  return trackingNumber;
}

/** Met à jour le statut d'une commande depuis Ozon Express. */
export async function syncOrder(orderId: number) {
  const order = await db.order.findUnique({ where: { id: orderId } });
  if (!order?.trackingNumber) return null;
  const { status } = await trackParcel(order.trackingNumber);
  if (!status) return null;
  await db.order.update({
    where: { id: order.id },
    data: { carrierStatus: status, carrierSyncedAt: new Date() },
  });
  const mapped = mapCarrierStatus(status);
  if (mapped && mapped !== order.status) {
    await setOrderStatus(order.id, mapped, `Ozon Express : ${status}`);
  }
  return status;
}

const FINAL = ["DELIVERED", "RETURNED", "REFUSED", "CANCELLED"];

/** Synchronise toutes les commandes en cours de livraison. */
export async function syncAllShipped() {
  const orders = await db.order.findMany({
    where: { trackingNumber: { not: null }, status: { notIn: FINAL } },
    select: { id: true },
  });
  let ok = 0;
  const errors: string[] = [];
  for (const o of orders) {
    try {
      await syncOrder(o.id);
      ok++;
    } catch (e: any) {
      errors.push(`#${o.id}: ${e.message}`);
    }
  }
  return { total: orders.length, ok, errors };
}
