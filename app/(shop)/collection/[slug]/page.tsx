import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import ProductCard from "@/components/ProductCard";

export default async function CollectionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const c = await db.collection.findUnique({
    where: { slug },
    include: { products: { where: { active: true }, orderBy: { createdAt: "desc" } } },
  });
  if (!c) notFound();
  return (
    <div className="container">
      <h1 className="section-title">{c.name}</h1>
      {c.products.length ? (
        <div className="grid">{c.products.map((p) => <ProductCard key={p.id} p={p} />)}</div>
      ) : (
        <p className="empty">Bientôt disponible</p>
      )}
    </div>
  );
}
