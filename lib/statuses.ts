// Statuts internes des commandes (cycle COD Maroc)
export const STATUSES = {
  NEW: { label: "En attente", color: "#d97706" },
  CONFIRMED: { label: "Confirmée", color: "#2563eb" },
  NO_ANSWER: { label: "Injoignable", color: "#9333ea" },
  CANCELLED: { label: "Annulée", color: "#6b7280" },
  SHIPPED: { label: "Envoyée à Ozon", color: "#0891b2" },
  IN_TRANSIT: { label: "En cours de livraison", color: "#0d9488" },
  DELIVERED: { label: "Livrée", color: "#16a34a" },
  REFUSED: { label: "Refusée", color: "#dc2626" },
  RETURNED: { label: "Retournée", color: "#b91c1c" },
} as const;

export type Status = keyof typeof STATUSES;
export const STATUS_KEYS = Object.keys(STATUSES) as Status[];

export function statusLabel(s: string) {
  return (STATUSES as Record<string, { label: string }>)[s]?.label ?? s;
}
export function statusColor(s: string) {
  return (STATUSES as Record<string, { color: string }>)[s]?.color ?? "#6b7280";
}

// Traduit le statut texte renvoyé par Ozon Express vers notre statut interne.
export function mapCarrierStatus(raw: string): Status | null {
  const s = raw
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
  if (/livre/.test(s) && !/non livre|en cours/.test(s)) return "DELIVERED";
  if (/refus/.test(s)) return "REFUSED";
  if (/retour/.test(s)) return "RETURNED";
  if (/annul/.test(s)) return "CANCELLED";
  if (/distribution|en cours|expedi|transit|ramass|reçu|recu|pick/.test(s)) return "IN_TRANSIT";
  return null;
}
