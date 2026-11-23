"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

type F = {
  id?: number; name: string; description: string; price: string; comparePrice: string; images: string[];
  sizes: string; colors: string; stock: string; active: boolean; badge: string; collectionId: string;
};

const EMPTY: F = { name: "", description: "", price: "", comparePrice: "", images: [], sizes: "S, M, L, XL, XXL", colors: "", stock: "0", active: true, badge: "جديد", collectionId: "" };

export default function ProductForm({ product, collections }: { product?: F; collections: { id: number; name: string }[] }) {
  const router = useRouter();
  const [f, setF] = useState<F>(product || { ...EMPTY, collectionId: collections[0] ? String(collections[0].id) : "" });
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [url, setUrl] = useState("");
  const set = (k: keyof F) => (e: React.ChangeEvent<any>) => setF({ ...f, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value });

  async function upload(files: FileList | null) {
    if (!files?.length) return;
    const fd = new FormData();
    Array.from(files).forEach((file) => fd.append("files", file));
    setBusy(true);
    const r = await fetch("/api/admin/upload", { method: "POST", body: fd });
    const d = await r.json().catch(() => ({}));
    setBusy(false);
    if (!r.ok) return setErr(d.error || "Erreur upload");
    setF((x) => ({ ...x, images: [...x.images, ...d.urls] }));
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setErr(""); setBusy(true);
    const r = await fetch(product?.id ? `/api/admin/products/${product.id}` : "/api/admin/products", {
      method: product?.id ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(f),
    });
    const d = await r.json().catch(() => ({}));
    setBusy(false);
    if (!r.ok) return setErr(d.error || "Erreur");
    router.push("/admin/produits");
    router.refresh();
  }

  async function remove() {
    if (!product?.id || !confirm("Supprimer ce produit ?")) return;
    await fetch(`/api/admin/products/${product.id}`, { method: "DELETE" });
    router.push("/admin/produits");
    router.refresh();
  }

  const move = (i: number, d: number) => {
    const imgs = [...f.images];
    const j = i + d;
    if (j < 0 || j >= imgs.length) return;
    [imgs[i], imgs[j]] = [imgs[j], imgs[i]];
    setF({ ...f, images: imgs });
  };

  return (
    <form className="panel" onSubmit={save} style={{ maxWidth: 820, marginTop: 16 }}>
      {err && <div className="flash err">{err}</div>}
      <div className="form-grid">
        <div className="full"><label>Nom du produit</label><input className="in" required value={f.name} onChange={set("name")} placeholder="Ensemble Hijab Sport Beige" /></div>
        <div><label>Prix (DH)</label><input className="in" required type="number" step="0.01" value={f.price} onChange={set("price")} /></div>
        <div><label>Prix barré (DH, optionnel)</label><input className="in" type="number" step="0.01" value={f.comparePrice} onChange={set("comparePrice")} /></div>
        <div>
          <label>Collection</label>
          <select className="in" value={f.collectionId} onChange={set("collectionId")}>
            <option value="">—</option>
            {collections.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div><label>Badge (ex : جديد, -20%)</label><input className="in" value={f.badge} onChange={set("badge")} /></div>
        <div><label>Tailles (séparées par des virgules)</label><input className="in" value={f.sizes} onChange={set("sizes")} /></div>
        <div><label>Couleurs (optionnel)</label><input className="in" value={f.colors} onChange={set("colors")} /></div>
        <div><label>Stock</label><input className="in" type="number" value={f.stock} onChange={set("stock")} /></div>
        <div style={{ display: "flex", alignItems: "end" }}>
          <label style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 14 }}><input type="checkbox" checked={f.active} onChange={set("active")} /> Visible sur la boutique</label>
        </div>
        <div className="full">
          <label>Photos (la 1ère = photo principale)</label>
          <div className="imgs" style={{ margin: "6px 0" }}>
            {f.images.map((src, i) => (
              <div key={src + i}>
                <img src={src} alt="" />
                <button type="button" onClick={() => setF({ ...f, images: f.images.filter((_, k) => k !== i) })}>✕</button>
                <button type="button" style={{ top: "auto", bottom: 3, right: "auto", left: 3 }} onClick={() => move(i, -1)}>‹</button>
              </div>
            ))}
          </div>
          <div className="row">
            <input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={(e) => upload(e.target.files)} />
            <input className="in" style={{ flex: 1 }} placeholder="ou colle un lien d'image https://..." value={url} onChange={(e) => setUrl(e.target.value)} />
            <button type="button" className="ab" onClick={() => { if (url) { setF({ ...f, images: [...f.images, url] }); setUrl(""); } }}>Ajouter</button>
          </div>
        </div>
        <div className="full"><label>Description</label><textarea className="in" rows={6} value={f.description} onChange={set("description")} /></div>
      </div>
      <div className="row" style={{ marginTop: 14 }}>
        <button className="ab dark" disabled={busy}>{busy ? "..." : "Enregistrer"}</button>
        {product?.id && <button type="button" className="ab red" onClick={remove}>Supprimer</button>}
      </div>
    </form>
  );
}
