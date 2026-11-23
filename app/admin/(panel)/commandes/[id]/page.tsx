import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { dh } from "@/lib/format";
import { fmtDate } from "@/lib/period";
import { statusColor, statusLabel } from "@/lib/statuses";
import { ozonConfigured } from "@/lib/ozon";
import OrderEditor from "@/components/admin/OrderEditor";

export default async function OrderPage({ params }: { params: Promise<{ id: string }> }) {
  const id = Number((await params).id);
  if (!Number.isInteger(id)) notFound();
  const o = await db.order.findUnique({
    where: { id },
    include: { items: true, history: { orderBy: { createdAt: "desc" } } },
  });
  if (!o) notFound();
  const blocked = await db.blockedPhone.findUnique({ where: { phone: o.phone } });
  const previous = await db.order.count({ where: { phone: o.phone, id: { not: o.id } } });
  const color = statusColor(o.status);

  return (
    <>
      <Link href="/admin/commandes" className="muted">← Commandes</Link>
      <div className="row" style={{ margin: "8px 0 16px" }}>
        <h1 className="mono" style={{ fontSize: 20 }}>#{o.reference}</h1>
        <span className="st" style={{ background: color + "1a", color }}>{statusLabel(o.status)}</span>
        <span className="src">{o.source}</span>
        {blocked && <span className="st" style={{ background: "#fdecec", color: "#b42318" }}>Client bloqué</span>}
        {previous > 0 && <Link className="muted" href={`/admin/commandes?p=all&q=${o.phone}`}>{previous} autre(s) commande(s) de ce numéro</Link>}
      </div>

      <div className="two">
        <div>
          <OrderEditor
            order={{
              id: o.id, status: o.status, customerName: o.customerName, phone: o.phone, city: o.city,
              cityId: o.cityId || "", address: o.address, note: o.note, total: o.total,
              trackingNumber: o.trackingNumber, carrierStatus: o.carrierStatus, reference: o.reference,
              items: o.items.map((i) => `${i.quantity}x ${i.name}${i.size ? " " + i.size : ""}${i.color ? " " + i.color : ""}`).join(", "),
            }}
            ozonReady={ozonConfigured()}
          />
        </div>
        <div>
          <div className="panel">
            <h2>Articles</h2>
            <table className="t">
              <tbody>
                {o.items.map((i) => (
                  <tr key={i.id}>
                    <td>{i.name}<div className="muted">{[i.size, i.color].filter(Boolean).join(" · ")}</div></td>
                    <td>×{i.quantity}</td>
                    <td style={{ textAlign: "right" }}>{dh(i.price * i.quantity)}</td>
                  </tr>
                ))}
                {o.shippingFee > 0 && <tr><td>Livraison</td><td /><td style={{ textAlign: "right" }}>{dh(o.shippingFee)}</td></tr>}
                <tr><td><strong>Total à encaisser</strong></td><td /><td style={{ textAlign: "right" }}><strong>{dh(o.total)}</strong></td></tr>
              </tbody>
            </table>
          </div>
          <div className="panel">
            <h2>Historique</h2>
            <ul className="timeline">
              {o.history.map((h) => (
                <li key={h.id}>
                  <strong>{statusLabel(h.status)}</strong> — {h.message}
                  <div className="muted">{fmtDate(h.createdAt)}</div>
                </li>
              ))}
            </ul>
            <p className="muted">IP : {o.ip || "—"} · Créée le {fmtDate(o.createdAt)}</p>
          </div>
        </div>
      </div>
    </>
  );
}
