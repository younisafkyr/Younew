"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SyncButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  async function run() {
    setBusy(true);
    const r = await fetch("/api/admin/sync", { method: "POST" });
    const d = await r.json().catch(() => ({}));
    setBusy(false);
    if (!r.ok) alert(d.error || "Erreur");
    else alert(`Suivi Ozon mis à jour : ${d.ok}/${d.total} colis${d.errors?.length ? `\n\nErreurs :\n${d.errors.slice(0, 5).join("\n")}` : ""}`);
    router.refresh();
  }
  return <button className="ab" onClick={run} disabled={busy}>{busy ? "Synchronisation..." : "🔄 Suivi Ozon"}</button>;
}
