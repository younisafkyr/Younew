"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { STATUS_KEYS, STATUSES } from "@/lib/statuses";

type O = {
  id: number; status: string; customerName: string; phone: string; city: string; cityId: string;
  address: string; note: string; total: number; trackingNumber: string | null; carrierStatus: string | null;
  reference: string; items: string;
};

export default function OrderEditor({ order, ozonReady }: { order: O; ozonReady: boolean }) {
  const router = useRouter();
  const [f, setF] = useState(order);
  const [cities, setCities] = useState<{ id: string; name: string }[]>([]);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState("");

  useEffect(() => { fetch("/api/ozon/cities").then((r) => r.json()).then(setCities).catch(() => {}); }, []);

  const set = (k: keyof O) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setF({ ...f, [k]: e.target.value });

  async function call(method: string, body: any, label: string) {
    setBusy(label); setMsg(null);
    const r = await fetch(`/api/admin/orders/${order.id}`, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const d = await r.json().catch(() => ({}));
    setBusy("");
    setMsg(r.ok ? { ok: true, text: label + " ✓" + (d.trackingNumber ? ` — Tracking : ${d.trackingNumber}` : d.status ? ` — ${d.status}` : "") } : { ok: false, text: d.error || "Erreur" });
    router.refresh();
    return r.ok;
  }

  function onCity(e: React.ChangeEvent<HTMLInputElement>) {
    const c = cities.find((x) => x.name === e.target.value);
    setF({ ...f, city: e.target.value, cityId: c?.id || "" });
  }

  const save = () => call("PATCH", {
    customerName: f.customerName, phone: f.phone, city: f.city, cityId: f.cityId, address: f.address, note: f.note, total: f.total, status: f.status,
  }, "Enregistré");

  async function confirmAndShip() {
    if (f.status !== "CONFIRMED") {
      const ok = await call("PATCH", { customerName: f.customerName, phone: f.phone, city: f.city, cityId: f.cityId, address: f.address, note: f.note, total: f.total, status: "CONFIRMED" }, "Confirmée");
      if (!ok) return;
      setF({ ...f, status: "CONFIRMED" });
    }
    await call("POST", { action: "ship" }, "Envoyée à Ozon Express");
  }

  const wa = (text: string) => `https://wa.me/212${f.phone.replace(/^0/, "")}?text=${encodeURIComponent(text)}`;
  const confirmText = `السلام ${f.customerName} 👋\nمعاك YouNew. توصلنا بالطلب ديالك:\n${order.items}\nالمجموع: ${f.total} درهم\nالعنوان: ${f.address}، ${f.city}\nواش نأكدو الطلب؟`;
  const shipped = Boolean(order.trackingNumber);

  return (
    <>
      {msg && <div className={`flash ${msg.ok ? "ok" : "err"}`}>{msg.text}</div>}

      <div className="panel">
        <h2>Actions</h2>
        <div className="row">
          <a className="ab green" href={wa(confirmText)} target="_blank" rel="noopener">💬 Confirmer par WhatsApp</a>
          <a className="ab" href={`tel:${f.phone}`}>📞 Appeler</a>
          {!shipped && (
            <button className="ab dark" disabled={!!busy || !ozonReady || ["CANCELLED"].includes(f.status)} onClick={confirmAndShip}
              title={ozonReady ? "" : "Configure Ozon Express dans .env"}>
              🚚 {busy === "Envoyée à Ozon Express" ? "Envoi..." : "Confirmer & envoyer à Ozon"}
            </button>
          )}
          {shipped && (
            <button className="ab" disabled={!!busy} onClick={() => call("POST", { action: "track" }, "Suivi mis à jour")}>🔄 Actualiser le suivi</button>
          )}
          <button className="ab red" disabled={!!busy} onClick={() => confirm("Bloquer ce numéro ? Ses futures commandes seront ignorées.") && call("POST", { action: "block" }, "Client bloqué")}>⛔ Bloquer</button>
        </div>
        {!ozonReady && <p className="muted" style={{ marginBottom: 0 }}>⚠️ Ozon Express n'est pas encore configuré (Réglages).</p>}
        {shipped && (
          <p style={{ marginBottom: 0 }}>
            Ozon Express : <span className="mono">{order.trackingNumber}</span> — <strong>{order.carrierStatus || "—"}</strong>
          </p>
        )}
      </div>

      <div className="panel">
        <h2>Client & livraison</h2>
        <div className="form-grid">
          <div><label>Nom</label><input className="in" value={f.customerName} onChange={set("customerName")} disabled={shipped} /></div>
          <div><label>Téléphone</label><input className="in" value={f.phone} onChange={set("phone")} disabled={shipped} /></div>
          <div>
            <label>Ville {f.cityId ? <span className="muted">(Ozon #{f.cityId})</span> : <span style={{ color: "#d97706" }}>(à choisir dans la liste)</span>}</label>
            <input className="in" list="adm-cities" value={f.city} onChange={onCity} disabled={shipped} />
            <datalist id="adm-cities">{cities.map((c) => <option key={c.name} value={c.name} />)}</datalist>
          </div>
          <div><label>Total à encaisser (DH)</label><input className="in" type="number" value={f.total} onChange={(e) => setF({ ...f, total: Number(e.target.value) })} disabled={shipped} /></div>
          <div className="full"><label>Adresse</label><input className="in" value={f.address} onChange={set("address")} disabled={shipped} /></div>
          <div className="full"><label>Note (visible par le livreur)</label><textarea className="in" rows={2} value={f.note} onChange={set("note")} disabled={shipped} /></div>
          <div>
            <label>Statut</label>
            <select className="in" value={f.status} onChange={set("status")}>
              {STATUS_KEYS.map((k) => <option key={k} value={k}>{STATUSES[k].label}</option>)}
            </select>
          </div>
          <div style={{ display: "flex", alignItems: "end", gap: 8 }}>
            <button className="ab dark" onClick={save} disabled={!!busy}>Enregistrer</button>
            <button className="ab red" disabled={!!busy} onClick={async () => {
              if (confirm("Supprimer définitivement cette commande ?")) {
                await fetch(`/api/admin/orders/${order.id}`, { method: "DELETE" });
                window.location.href = "/admin/commandes";
              }
            }}>Supprimer</button>
          </div>
        </div>
      </div>
    </>
  );
}
