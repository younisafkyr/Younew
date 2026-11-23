import Link from "next/link";
import { db } from "@/lib/db";
import ProductCard from "@/components/ProductCard";

export default async function Home() {
  const collections = await db.collection.findMany({
    orderBy: { position: "asc" },
    include: { products: { where: { active: true }, orderBy: { createdAt: "desc" }, take: 8 } },
  });
  const withProducts = collections.filter((c) => c.products.length);
  return (
    <>
      <section className="hero">
        <h1>Nouvelle collection</h1>
        <p dir="rtl">ملابس رياضية عصرية — جودة عالية وثمن مناسب</p>
        {withProducts[0] && (
          <Link className="btn" href={`/collection/${withProducts[0].slug}`}>Découvrir</Link>
        )}
      </section>
      <div className="container">
        {withProducts.length === 0 && <p className="empty">Ajoute tes premiers produits depuis /admin</p>}
        {withProducts.map((c) => (
          <section key={c.id}>
            <h2 className="section-title">
              <Link href={`/collection/${c.slug}`}>{c.name}</Link>
            </h2>
            <div className="grid">{c.products.map((p) => <ProductCard key={p.id} p={p} />)}</div>
          </section>
        ))}
      </div>
    </>
  );
}
