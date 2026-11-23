import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { parseList } from "@/lib/format";
import ProductForm from "@/components/admin/ProductForm";

export default async function EditProduct({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const collections = await db.collection.findMany({ orderBy: { position: "asc" } });
  if (id === "new") {
    return (<><h1>Nouveau produit</h1><ProductForm collections={collections} /></>);
  }
  const p = await db.product.findUnique({ where: { id: Number(id) } });
  if (!p) notFound();
  return (
    <>
      <h1>{p.name}</h1>
      <ProductForm
        collections={collections}
        product={{
          id: p.id, name: p.name, description: p.description, price: String(p.price),
          comparePrice: p.comparePrice != null ? String(p.comparePrice) : "", images: parseList(p.images),
          sizes: parseList(p.sizes).join(", "), colors: parseList(p.colors).join(", "), stock: String(p.stock),
          active: p.active, badge: p.badge || "", collectionId: p.collectionId ? String(p.collectionId) : "",
        }}
      />
    </>
  );
}
