"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { STATUS_KEYS, STATUSES, statusColor, statusLabel } from "@/lib/statuses";

// Avant l'envoi à Ozon : on change le statut directement depuis la liste.
const PRE = ["NEW", "CONFIRMED", "NO_ANSWER", "CANCELLED"];

export default function QuickStatus({ id, status, locked }: { id: number; status: string; locked: boolean }) {
  const router = useRouter();
  const [v, setV] = useState(status);
  const color = statusColor(v);
  if (locked || !PRE.includes(status)) {
    return <span className="st" style={{ background: color + "1a", color }}>{statusLabel(status)}</span>;
  }
  async function change(next: string) {
    setV(next);
    const r = await fetch(`/api/admin/orders/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: next }) });
    if (!r.ok) { setV(status); alert("Erreur"); }
    router.refresh();
  }
  return (
    <select value={v} onChange={(e) => change(e.target.value)} className="st" style={{ background: color + "1a", color, border: 0 }}>
      {STATUS_KEYS.filter((k) => PRE.includes(k)).map((k) => <option key={k} value={k}>{STATUSES[k].label}</option>)}
    </select>
  );
}
