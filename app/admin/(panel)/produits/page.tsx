import Link from "next/link";
import { db } from "@/lib/db";
import { dh, parseList } from "@/lib/format";

export default async function Products() {
  const products = await db.product.findMany({ include: { collection: true }, orderBy: { createdAt: "desc" } });
  return (
    <>
      <div className="row" style={{ justifyContent: "space-between" }}>
        <h1>Produits</h1>
        <Link className="ab dark" href="/admin/produits/new">+ Ajouter un produit</Link>
      </div>
      <div className="panel" style={{ marginTop: 16 }}>
        <table className="t">
          <thead><tr><th></th><th>Produit</th><th>Collection</th><th>Prix</th><th>Tailles</th><th>Stock</th><th>Statut</th></tr></thead>
          <tbody>
            {products.map((p) => {
              const img = parseList(p.images)[0];
              return (
                <tr key={p.id}>
                  <td style={{ width: 54 }}>{img && <img src={img} alt="" style={{ width: 44, height: 58, objectFit: "cover", borderRadius: 6 }} />}</td>
                  <td><Link href={`/admin/produits/${p.id}`}><strong>{p.name}</strong></Link><div className="muted">/produit/{p.slug}</div></td>
                  <td>{p.collection?.name || <span className="muted">—</span>}</td>
                  <td>{dh(p.price)}{p.comparePrice ? <div className="muted"><s>{dh(p.comparePrice)}</s></div> : null}</td>
                  <td className="muted">{parseList(p.sizes).join(", ")}</td>
                  <td>{p.stock}</td>
                  <td>{p.active ? <span className="st" style={{ background: "#e8f6ee", color: "#146c43" }}>Actif</span> : <span className="st" style={{ background: "#eee", color: "#666" }}>Masqué</span>}</td>
                </tr>
              );
            })}
            {!products.length && <tr><td colSpan={7} className="muted" style={{ textAlign: "center", padding: 30 }}>Aucun produit</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}
