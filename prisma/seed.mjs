// Données de départ : collections + quelques produits d'exemple (à modifier depuis /admin)
import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();

const collections = ["Ensemble Sport", "Ensemble Hijab Sport", "Robes", "Soldes"];
const img = () => "/placeholder.svg";

const products = [
  { name: "Ensemble Hijab Sport Beige", col: 1, price: 290, comparePrice: 349, color: "c8b08a" },
  { name: "Ensemble Hijab Sport Gris", col: 1, price: 290, comparePrice: 349, color: "8d9096" },
  { name: "Ensemble Hijab Sport Bleu Ciel", col: 1, price: 290, comparePrice: 349, color: "9fb8c8" },
  { name: "Ensemble Hijab Sport Vert Sauge", col: 1, price: 290, comparePrice: 349, color: "7d8a6a" },
  { name: "Ensemble Sport Noir", col: 0, price: 249, comparePrice: 299, color: "222222" },
  { name: "Ensemble Sport Marron", col: 0, price: 249, comparePrice: 299, color: "6b4a3a" },
];

const slug = (s) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

const existing = await db.collection.count();
if (existing) {
  console.log("Base déjà initialisée, rien à faire.");
} else {
  const cols = [];
  for (const [i, name] of collections.entries()) {
    cols.push(await db.collection.create({ data: { name, slug: slug(name), position: i } }));
  }
  for (const p of products) {
    await db.product.create({
      data: {
        name: p.name,
        slug: slug(p.name),
        price: p.price,
        comparePrice: p.comparePrice,
        images: JSON.stringify([img(p.color)]),
        sizes: JSON.stringify(["L", "XL", "XXL", "3XL"]),
        stock: 50,
        badge: "جديد",
        collectionId: cols[p.col].id,
        description: "✅ قماش رياضي مريح وخفيف\n✅ مناسب للرياضة والخرجات\n✅ التوصيل لجميع المدن والدفع عند الاستلام",
      },
    });
  }
  console.log("✓ Collections et produits d'exemple créés");
}
await db.$disconnect();
