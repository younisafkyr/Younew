import { db } from "@/lib/db";
import BlockedManager from "@/components/admin/BlockedManager";
import { fmtDate } from "@/lib/period";

export default async function Blocked() {
  const list = await db.blockedPhone.findMany({ orderBy: { createdAt: "desc" } });
  return (
    <>
      <h1>Numéros bloqués</h1>
      <p className="adm-sub">Les commandes de ces numéros sont ignorées (faux clients, refus répétés...).</p>
      <BlockedManager list={list.map((b) => ({ id: b.id, phone: b.phone, reason: b.reason, date: fmtDate(b.createdAt) }))} />
    </>
  );
}
