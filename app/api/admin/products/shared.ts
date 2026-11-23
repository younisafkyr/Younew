import { slugify } from "@/lib/format";

const list = (v: any) =>
  JSON.stringify(
    (Array.isArray(v) ? v : String(v || "").split(/[,\n]/)).map((s: string) => String(s).trim()).filter(Boolean)
  );

export function productData(b: any) {
  const d: Record<string, any> = {};
  if (b.name != null) {
    d.name = String(b.name).trim();
    d.slug = slugify(b.slug || d.name) || "produit";
  }
  if (b.description != null) d.description = String(b.description);
  if (b.price != null) d.price = Number(b.price);
  if (b.comparePrice !== undefined) d.comparePrice = b.comparePrice === "" || b.comparePrice == null ? null : Number(b.comparePrice);
  if (b.images != null) d.images = list(b.images);
  if (b.sizes != null) d.sizes = list(b.sizes);
  if (b.colors != null) d.colors = list(b.colors);
  if (b.stock != null) d.stock = Number(b.stock) || 0;
  if (b.active != null) d.active = Boolean(b.active);
  if (b.badge !== undefined) d.badge = b.badge || null;
  if (b.collectionId !== undefined) d.collectionId = b.collectionId ? Number(b.collectionId) : null;
  return d;
}
