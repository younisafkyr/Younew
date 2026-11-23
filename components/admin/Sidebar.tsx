"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/admin/commandes", label: "🛒  Commandes", badge: true },
  { href: "/admin/commandes/nouvelle", label: "➕  Nouvelle commande" },
  { href: "/admin/produits", label: "📦  Produits" },
  { href: "/admin/collections", label: "🗂️  Collections" },
  { href: "/admin/bloques", label: "⛔  Bloqués" },
  { href: "/admin/reglages", label: "⚙️  Réglages & Ozon" },
];

export default function Sidebar({ pending }: { pending: number }) {
  const path = usePathname();
  const active = (h: string) =>
    h === "/admin/commandes" ? path === h || /^\/admin\/commandes\/\d+/.test(path) : path.startsWith(h);
  return (
    <aside className="adm-side">
      <div className="brand">YOUNEW <small>ADMIN</small></div>
      {LINKS.map((l) => (
        <Link key={l.href} href={l.href} className={active(l.href) ? "on" : ""}>
          {l.label}
          {l.badge && pending > 0 && <span className="pill">{pending}</span>}
        </Link>
      ))}
      <a href="/" target="_blank">🌐  Voir la boutique</a>
      <form action="/api/auth/logout" method="post">
        <button>↩  Déconnexion</button>
      </form>
    </aside>
  );
}
