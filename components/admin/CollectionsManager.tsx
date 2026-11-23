"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CollectionsManager({ cols }: { cols: { id: number; name: string; slug: string; count: number }[] }) {
  const router = useRouter();
  const [name, setName] = useState("");
  async function add(e: React.FormEvent) {
    e.preventDefault();
    const r = await fetch("/api/admin/collections", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name }) });
    if (!r.ok) alert((await r.json()).error);
    setName("");
    router.refresh();
  }
  async function del(id: number) {
    if (!confirm("Supprimer cette collection ? (les produits restent)")) return;
    await fetch(`/api/admin/collections?id=${id}`, { method: "DELETE" });
    router.refresh();
  }
  return (
    <div className="panel" style={{ maxWidth: 640 }}>
      <form className="row" onSubmit={add} style={{ marginBottom: 12 }}>
        <input className="in" style={{ flex: 1 }} required placeholder="Nom de la collection" value={name} onChange={(e) => setName(e.target.value)} />
        <button className="ab dark">Ajouter</button>
      </form>
      <table className="t">
        <tbody>
          {cols.map((c) => (
            <tr key={c.id}>
              <td><strong>{c.name}</strong><div className="muted">/collection/{c.slug}</div></td>
              <td className="muted">{c.count} produit(s)</td>
              <td style={{ textAlign: "right" }}><button className="ab red" onClick={() => del(c.id)}>Supprimer</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
