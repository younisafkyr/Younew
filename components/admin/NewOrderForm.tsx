"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { parseList } from "@/lib/format";

type P = { id: number; name: string; price: number; sizes: string };

export default function NewOrderForm({ products }: { products: P[] }) {
  const router = useRouter();
  const [cities, setCities] = useState<{ id: string; name: string }[]>([]);
  const [f, setF] = useState({ customerName: "", phone: "", city: "", address: "", note: "", productId: products[0]?.id ? String(products[0].id) : "", size: "", quantity: "1", total: "", source: "WhatsApp" });
  const [err, setErr] = useState("");
  useEffect(() => { fetch("/api/ozon/cities").then((r) => r.json()).then(setCities).catch(() => {}); }, []);
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<any>) => setF({ ...f, [k]: e.target.value });
  const product = products.find((p) => String(p.id) === f.productId);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    const r = await fetch("/api/admin/orders", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(f) });
    const d = await r.json().catch(() => ({}));
    if (!r.ok) return setErr(d.error || "Erreur");
    router.push(`/admin/commandes/${d.id}`);
  }

  return (
    <form className="panel" onSubmit={submit} style={{ maxWidth: 720 }}>
      {err && <div className="flash err">{err}</div>}
      <div className="form-grid">
        <div><label>Nom du client</label><input className="in" required value={f.customerName} onChange={set("customerName")} /></div>
        <div><label>Téléphone</label><input className="in" required value={f.phone} onChange={set("phone")} /></div>
        <div>
          <label>Ville</label>
          <input className="in" required list="new-cities" value={f.city} onChange={set("city")} />
          <datalist id="new-cities">{cities.map((c) => <option key={c.name} value={c.name} />)}</datalist>
        </div>
        <div>
          <label>Source</label>
          <select className="in" value={f.source} onChange={set("source")}>
            {["WhatsApp", "Instagram", "Facebook", "TikTok", "Téléphone", "Relance", "Manuel"].map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div className="full"><label>Adresse</label><input className="in" required value={f.address} onChange={set("address")} /></div>
        <div>
          <label>Produit</label>
          <select className="in" value={f.productId} onChange={set("productId")}>
            {products.map((p) => <option key={p.id} value={p.id}>{p.name} — {p.price} DH</option>)}
          </select>
        </div>
        <div>
          <label>Taille</label>
          <select className="in" value={f.size} onChange={set("size")}>
            <option value="">—</option>
            {parseList(product?.sizes).map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div><label>Quantité</label><input className="in" type="number" min={1} value={f.quantity} onChange={set("quantity")} /></div>
        <div><label>Total (vide = prix × quantité)</label><input className="in" type="number" placeholder={product ? String(product.price * Number(f.quantity || 1)) : ""} value={f.total} onChange={set("total")} /></div>
        <div className="full"><label>Note</label><input className="in" value={f.note} onChange={set("note")} /></div>
      </div>
      <button className="ab dark" style={{ marginTop: 14 }}>Créer la commande</button>
    </form>
  );
}
