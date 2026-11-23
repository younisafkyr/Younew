import { headers } from "next/headers";
import { ozonConfigured } from "@/lib/ozon";
import SyncButton from "@/components/admin/SyncButton";

export default async function Settings() {
  const h = await headers();
  const host = h.get("x-forwarded-host") || h.get("host") || "ton-site.ma";
  const proto = h.get("x-forwarded-proto") || "https";
  const site = `${proto}://${host}`;
  const ok = ozonConfigured();
  return (
    <>
      <h1>Réglages & Ozon Express</h1>
      <p className="adm-sub">Les réglages se font dans le fichier <code>.env</code> du serveur.</p>

      <div className="panel" style={{ maxWidth: 820 }}>
        <h2>Ozon Express</h2>
        <p>Statut : {ok ? <strong style={{ color: "#16a34a" }}>✓ Connecté (Customer ID {process.env.OZON_CUSTOMER_ID})</strong> : <strong style={{ color: "#dc2626" }}>✗ Non configuré</strong>}</p>
        <ol style={{ lineHeight: 1.8, fontSize: 14 }}>
          <li>Connecte-toi sur ton espace client <a href="https://ozonexpress.ma" target="_blank" rel="noopener" style={{ color: "#2563eb" }}>Ozon Express</a> → rubrique <b>API</b>.</li>
          <li>Copie ton <b>Customer ID</b> et ta <b>API Key</b> dans <code>.env</code> : <code>OZON_CUSTOMER_ID</code> et <code>OZON_API_KEY</code>.</li>
          <li>Redémarre le site.</li>
          <li>Pour la mise à jour automatique des statuts, programme un cron toutes les heures sur :<br />
            <code style={{ wordBreak: "break-all" }}>{site}/api/ozon/sync?key=CRON_SECRET</code></li>
        </ol>
        <SyncButton />
      </div>

      <div className="panel" style={{ maxWidth: 820 }}>
        <h2>Suivre la source des commandes (pubs)</h2>
        <p style={{ fontSize: 14 }}>Ajoute ceci à la fin des liens de tes pubs pour savoir d'où vient chaque commande :</p>
        <ul style={{ fontSize: 14, lineHeight: 1.9 }}>
          <li>Facebook : <code>{site}/produit/xxx?utm_source=facebook</code></li>
          <li>Instagram : <code>{site}/produit/xxx?utm_source=instagram</code></li>
          <li>TikTok : <code>{site}/produit/xxx?utm_source=tiktok</code></li>
        </ul>
        <p className="muted">Sans utm, le site détecte quand même Facebook via fbclid et le referrer.</p>
      </div>

      <div className="panel" style={{ maxWidth: 820 }}>
        <h2>Boutique</h2>
        <p style={{ fontSize: 14 }}>Marque : <b>{process.env.NEXT_PUBLIC_BRAND}</b> · WhatsApp : <b>+{process.env.NEXT_PUBLIC_WHATSAPP}</b> · Frais de livraison facturés au client : <b>{process.env.SHIPPING_FEE || 0} DH</b></p>
      </div>
    </>
  );
}
