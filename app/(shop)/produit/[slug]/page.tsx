import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { db } from "@/lib/db";
import { dh, parseList } from "@/lib/format";
import Gallery from "@/components/Gallery";
import OrderForm from "@/components/OrderForm";
import { waLink } from "@/components/WhatsAppButton";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = await db.product.findUnique({ where: { slug: (await params).slug } });
  return p ? { title: p.name, openGraph: { images: parseList(p.images).slice(0, 1) } } : {};
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const p = await db.product.findUnique({ where: { slug } });
  if (!p || !p.active) notFound();
  const images = parseList(p.images);
  return (
    <div className="container">
      <div className="product">
        <Gallery images={images} alt={p.name} />
        <div>
          <h1 className="p-title">{p.name}</h1>
          <div className="price p-price">
            {p.comparePrice ? <s>{dh(p.comparePrice)}</s> : null}
            {dh(p.price)}
          </div>
          <OrderForm productId={p.id} price={p.price} sizes={parseList(p.sizes)} colors={parseList(p.colors)} />
          <p style={{ textAlign: "center", marginTop: 14 }}>
            <a href={waLink(`السلام، بغيت نسول على ${p.name}`)} target="_blank" rel="noopener" style={{ color: "#128c7e", fontWeight: 500 }}>
              💬 عندك سؤال؟ تواصلي معانا فالواتساب
            </a>
          </p>
          {p.description && <div className="desc" dir="auto">{p.description}</div>}
        </div>
      </div>
    </div>
  );
}
