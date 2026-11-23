// Détecte d'où vient le client (pub Facebook, Instagram, TikTok...).
// Astuce : dans tes pubs, mets ?utm_source=facebook ou ?utm_source=instagram à la fin du lien.
export function detectSource(input: {
  utmSource?: string | null;
  fbclid?: string | null;
  ttclid?: string | null;
  gclid?: string | null;
  referrer?: string | null;
}): string {
  const u = (input.utmSource || "").toLowerCase();
  if (u) {
    if (u.includes("insta") || u === "ig") return "Instagram";
    if (u.includes("face") || u === "fb" || u.includes("meta")) return "Facebook";
    if (u.includes("tiktok") || u === "tt") return "TikTok";
    if (u.includes("google")) return "Google";
    if (u.includes("whats") || u === "wa") return "WhatsApp";
    if (u.includes("relance")) return "Relance";
    return u.charAt(0).toUpperCase() + u.slice(1);
  }
  const r = (input.referrer || "").toLowerCase();
  if (r.includes("instagram")) return "Instagram";
  if (input.fbclid || r.includes("facebook") || r.includes("fb.")) return "Facebook";
  if (input.ttclid || r.includes("tiktok")) return "TikTok";
  if (input.gclid || r.includes("google")) return "Google";
  if (r.includes("whatsapp") || r.includes("wa.me")) return "WhatsApp";
  return "Direct";
}
