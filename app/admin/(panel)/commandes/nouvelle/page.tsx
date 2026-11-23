import { db } from "@/lib/db";
import NewOrderForm from "@/components/admin/NewOrderForm";

export default async function NewOrder() {
  const products = await db.product.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true, price: true, sizes: true } });
  return (
    <>
      <h1>Nouvelle commande</h1>
      <p className="adm-sub">Pour les clients qui commandent par WhatsApp, Instagram DM ou téléphone.</p>
      <NewOrderForm products={products} />
    </>
  );
}
