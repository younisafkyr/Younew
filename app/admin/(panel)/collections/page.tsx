import { db } from "@/lib/db";
import CollectionsManager from "@/components/admin/CollectionsManager";

export default async function Collections() {
  const cols = await db.collection.findMany({ orderBy: { position: "asc" }, include: { _count: { select: { products: true } } } });
  return (
    <>
      <h1>Collections</h1>
      <p className="adm-sub">Ce sont les liens du menu de la boutique (ex : Ensemble Sport, Ensemble Hijab Sport, Robes, Soldes).</p>
      <CollectionsManager cols={cols.map((c) => ({ id: c.id, name: c.name, slug: c.slug, count: c._count.products }))} />
    </>
  );
}
