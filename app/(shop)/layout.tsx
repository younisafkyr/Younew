import Link from "next/link";
import { db } from "@/lib/db";
import WhatsAppButton from "@/components/WhatsAppButton";

export const dynamic = "force-dynamic";

export default async function ShopLayout({ children }: { children: React.ReactNode }) {
  const collections = await db.collection.findMany({ orderBy: { position: "asc" } });
  const brand = process.env.NEXT_PUBLIC_BRAND || "YouNew";
  return (
    <>
      <div className="announce" dir="rtl">🚚 التوصيل لجميع المدن المغربية — الدفع عند الاستلام 💵</div>
      <header className="header">
        <div className="container">
          <div className="header-top">
            <Link href="/" className="logo">
              {brand.slice(0, 3).toUpperCase()}<b>{brand.slice(3).toUpperCase()}</b>
            </Link>
          </div>
          <nav className="nav">
            {collections.map((c) => (
              <Link key={c.id} href={`/collection/${c.slug}`} className={/sold|promo/i.test(c.name) ? "sale" : ""}>
                {c.name}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <main>{children}</main>
      <footer className="footer">
        <div className="container">
          © {new Date().getFullYear()} {brand} — Paiement à la livraison partout au Maroc
        </div>
      </footer>
      <WhatsAppButton />
    </>
  );
}
