import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { dh } from "@/lib/format";
import { PERIODS, periodRange, fmtDate } from "@/lib/period";
import { STATUSES, STATUS_KEYS, statusColor, statusLabel } from "@/lib/statuses";
import SyncButton from "@/components/admin/SyncButton";
import QuickStatus from "@/components/admin/QuickStatus";

type SP = Promise<{ p?: string; s?: string; src?: string; q?: string }>;

export default async function Orders({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const period = sp.p && sp.p in PERIODS ? sp.p : "today";
  const range = periodRange(period);
  const base: Prisma.OrderWhereInput = { createdAt: range };

  const where: Prisma.OrderWhereInput = { ...base };
  if (sp.s) where.status = sp.s;
  if (sp.src) where.source = sp.src;
  if (sp.q) {
    const q = sp.q.trim();
    where.OR = [
      { customerName: { contains: q } },
      { phone: { contains: q } },
      { city: { contains: q } },
      { reference: { contains: q } },
      { trackingNumber: { contains: q } },
    ];
  }

  const [orders, byStatus, bySource, deliveredBySource] = await Promise.all([
    db.order.findMany({ where, include: { items: true }, orderBy: { createdAt: "desc" }, take: 300 }),
    db.order.groupBy({ by: ["status"], where: base, _count: true, _sum: { total: true } }),
    db.order.groupBy({ by: ["source"], where: base, _count: true }),
    db.order.groupBy({ by: ["source"], where: { ...base, status: "DELIVERED" }, _count: true }),
  ]);

  const count = (s: string) => byStatus.find((b) => b.status === s)?._count ?? 0;
  const total = byStatus.reduce((a, b) => a + b._count, 0);
  const delivered = count("DELIVERED");
  const ca = byStatus.filter((b) => b.status !== "CANCELLED").reduce((a, b) => a + (b._sum.total || 0), 0);
  const caDelivered = byStatus.find((b) => b.status === "DELIVERED")?._sum.total || 0;
  const finished = delivered + count("RETURNED") + count("REFUSED");
  const rate = finished ? Math.round((delivered / finished) * 100) : 0;

  const link = (patch: Record<string, string | undefined>) => {
    const u = new URLSearchParams();
    const merged = { p: period, s: sp.s, src: sp.src, q: sp.q, ...patch };
    for (const [k, v] of Object.entries(merged)) if (v) u.set(k, v);
    return `/admin/commandes?${u}`;
  };

  return (
    <>
      <div className="row" style={{ justifyContent: "space-between" }}>
        <div>
          <h1>Commandes</h1>
          <p className="adm-sub">Commandes passées sur le site et saisies à la main.</p>
        </div>
        <div className="row">
          <SyncButton />
          <Link className="ab dark" href="/admin/commandes/nouvelle">+ Nouvelle commande</Link>
        </div>
      </div>

      <div className="tabs">
        {Object.entries(PERIODS).map(([k, label]) => (
          <Link key={k} href={link({ p: k })} className={period === k ? "on" : ""}>{label}</Link>
        ))}
      </div>

      <div className="stats">
        <div className="stat"><small>Total commandes</small><div>{total}</div></div>
        <div className="stat"><small>En attente</small><div style={{ color: "#d97706" }}>{count("NEW")}</div></div>
        <div className="stat"><small>Confirmées</small><div style={{ color: "#2563eb" }}>{count("CONFIRMED")}</div></div>
        <div className="stat"><small>Chez Ozon</small><div style={{ color: "#0891b2" }}>{count("SHIPPED") + count("IN_TRANSIT")}</div></div>
        <div className="stat"><small>Livrées</small><div style={{ color: "#16a34a" }}>{delivered}</div></div>
        <div className="stat"><small>Taux de livraison</small><div>{rate}%</div></div>
        <div className="stat"><small>Chiffre d'affaires</small><div style={{ fontSize: 20 }}>{dh(ca)}</div></div>
        <div className="stat"><small>Encaissé (livré)</small><div style={{ fontSize: 20 }}>{dh(caDelivered)}</div></div>
      </div>

      <div className="panel">
        <h2>Répartition par source</h2>
        <p className="muted" style={{ marginTop: -6 }}>Clique une source pour filtrer le tableau.</p>
        <table className="t">
          <thead><tr><th>Source</th><th>Commandes</th><th>Livrées</th><th>Taux de livraison</th></tr></thead>
          <tbody>
            {bySource.sort((a, b) => b._count - a._count).map((s) => {
              const d = deliveredBySource.find((x) => x.source === s.source)?._count ?? 0;
              return (
                <tr key={s.source}>
                  <td><Link className="src" href={link({ src: sp.src === s.source ? undefined : s.source })}>{s.source}{sp.src === s.source ? " ✕" : ""}</Link></td>
                  <td>{s._count}</td>
                  <td>{d}</td>
                  <td>{s._count ? Math.round((d / s._count) * 100) : 0}%</td>
                </tr>
              );
            })}
            {!bySource.length && <tr><td colSpan={4} className="muted">Aucune commande sur cette période</td></tr>}
          </tbody>
        </table>
      </div>

      <div className="panel">
        <form className="row" style={{ marginBottom: 12 }}>
          <input type="hidden" name="p" value={period} />
          {sp.src && <input type="hidden" name="src" value={sp.src} />}
          <input className="in" style={{ flex: 1, minWidth: 200 }} name="q" defaultValue={sp.q} placeholder="Rechercher par nom, ID, téléphone, ville, tracking..." />
          <select className="in" style={{ width: "auto" }} name="s" defaultValue={sp.s || ""}>
            <option value="">Tous les statuts</option>
            {STATUS_KEYS.map((k) => <option key={k} value={k}>{STATUSES[k].label} ({count(k)})</option>)}
          </select>
          <button className="ab dark">Filtrer</button>
        </form>

        <table className="t">
          <thead>
            <tr><th>Commande</th><th>Client</th><th>Articles</th><th>Total</th><th>Statut</th><th>Source</th><th>Ozon</th><th>Date</th></tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id}>
                <td><Link className="mono" href={`/admin/commandes/${o.id}`}>#{o.reference}</Link></td>
                <td>
                  <Link href={`/admin/commandes/${o.id}`}><strong>{o.customerName}</strong></Link>
                  <div className="muted">{o.city} · <a href={`tel:${o.phone}`}>{o.phone}</a></div>
                </td>
                <td>
                  {o.items.map((i) => (
                    <div key={i.id} style={{ fontSize: 12 }}>{i.name}{i.size ? ` · ${i.size}` : ""}{i.color ? ` · ${i.color}` : ""}{i.quantity > 1 ? ` ×${i.quantity}` : ""}</div>
                  ))}
                </td>
                <td style={{ whiteSpace: "nowrap" }}><strong>{dh(o.total)}</strong></td>
                <td><QuickStatus id={o.id} status={o.status} locked={Boolean(o.trackingNumber)} /></td>
                <td className="src">{o.source}</td>
                <td>{o.trackingNumber ? <><span className="mono">{o.trackingNumber}</span><div className="muted">{o.carrierStatus}</div></> : <span className="muted">—</span>}</td>
                <td className="muted" style={{ whiteSpace: "nowrap" }}>{fmtDate(o.createdAt)}</td>
              </tr>
            ))}
            {!orders.length && <tr><td colSpan={8} className="muted" style={{ padding: 30, textAlign: "center" }}>Aucune commande</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}
