import Link from "next/link";
import { dh, parseList } from "@/lib/format";

type P = { slug: string; name: string; price: number; comparePrice: number | null; images: string; sizes: string; badge: string | null };

export default function ProductCard({ p }: { p: P }) {
  const img = parseList(p.images)[0];
  const sizes = parseList(p.sizes);
  return (
    <Link href={`/produit/${p.slug}`} className="card">
      <div className="card-img">
        {img ? <img src={img} alt={p.name} loading="lazy" /> : null}
        {p.badge ? <span className="badge">{p.badge}</span> : null}
      </div>
      {sizes.length > 0 && (
        <div className="sizes">{sizes.map((s) => <span key={s}>{s}</span>)}</div>
      )}
      <div className="card-name">{p.name}</div>
      <div className="price">
        {p.comparePrice ? <s>{dh(p.comparePrice)}</s> : null}
        {dh(p.price)}
      </div>
    </Link>
  );
}
