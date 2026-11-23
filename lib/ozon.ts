/**
 * Intégration Ozon Express (https://ozonexpress.ma)
 *
 * Les identifiants (Customer ID + API Key) se trouvent dans ton espace client Ozon Express,
 * rubrique "API". Si Ozon change un nom de champ, c'est UNIQUEMENT ce fichier à modifier.
 */
const BASE = process.env.OZON_BASE_URL || "https://api.ozonexpress.ma";

export function ozonConfigured() {
  return Boolean(process.env.OZON_CUSTOMER_ID && process.env.OZON_API_KEY);
}

function base() {
  return `${BASE}/customers/${encodeURIComponent(process.env.OZON_CUSTOMER_ID || "")}/${encodeURIComponent(
    process.env.OZON_API_KEY || ""
  )}`;
}

async function postForm(url: string, fields: Record<string, string>) {
  const body = new URLSearchParams(fields);
  const res = await fetch(url, {
    method: "POST",
    body,
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    cache: "no-store",
  });
  const text = await res.text();
  let json: any = null;
  try {
    json = JSON.parse(text);
  } catch {
    /* réponse non JSON */
  }
  if (!res.ok) throw new Error(`Ozon Express HTTP ${res.status}: ${text.slice(0, 300)}`);
  return json ?? { raw: text };
}

export type OzonCity = { id: string; name: string; fee?: number };

let cityCache: { at: number; list: OzonCity[] } | null = null;

export async function getOzonCities(): Promise<OzonCity[]> {
  if (cityCache && Date.now() - cityCache.at < 1000 * 60 * 60 * 12) return cityCache.list;
  const res = await fetch(`${BASE}/cities`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Ozon cities HTTP ${res.status}`);
  const data: any = await res.json();
  const raw = data?.CITIES ?? data?.cities ?? data;
  const values: any[] = Array.isArray(raw) ? raw : Object.values(raw || {});
  const list = values
    .map((c) => ({
      id: String(c.ID ?? c.id ?? ""),
      name: String(c.NAME ?? c.name ?? ""),
      fee: c["DELIVERED-PRICE"] != null ? Number(c["DELIVERED-PRICE"]) : undefined,
    }))
    .filter((c) => c.id && c.name)
    .sort((a, b) => a.name.localeCompare(b.name));
  cityCache = { at: Date.now(), list };
  return list;
}

export async function findCityId(cityName: string): Promise<string | null> {
  const norm = (s: string) =>
    s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z]/g, "");
  const n = norm(cityName);
  const cities = await getOzonCities();
  return cities.find((c) => norm(c.name) === n)?.id ?? null;
}

export type ParcelInput = {
  reference: string;
  receiver: string;
  phone: string;
  cityId: string;
  address: string;
  price: number;
  nature: string;
  note?: string;
};

/** Crée un colis chez Ozon Express. Retourne le numéro de suivi. */
export async function createParcel(p: ParcelInput): Promise<{ trackingNumber: string; raw: any }> {
  if (!ozonConfigured()) throw new Error("Ozon Express non configuré (OZON_CUSTOMER_ID / OZON_API_KEY)");
  const data = await postForm(`${base()}/add-parcel`, {
    "tracking-number": "",
    "parcel-receiver": p.receiver,
    "parcel-phone": p.phone,
    "parcel-city": p.cityId,
    "parcel-address": p.address,
    "parcel-note": p.note || "",
    "parcel-price": String(Math.round(p.price)),
    "parcel-nature": p.nature.slice(0, 120),
    "parcel-stock": "0",
    "parcel-open": process.env.OZON_PARCEL_OPEN ?? "1",
    "parcel-fragile": "0",
    "parcel-replace": "0",
  });
  const tn =
    data?.ADD_PARCEL?.["NEW-PARCEL"]?.["TRACKING-NUMBER"] ??
    data?.["NEW-PARCEL"]?.["TRACKING-NUMBER"] ??
    data?.["TRACKING-NUMBER"] ??
    data?.tracking_number;
  if (!tn) {
    const msg = data?.ADD_PARCEL?.MESSAGE ?? data?.MESSAGE ?? JSON.stringify(data).slice(0, 300);
    throw new Error(`Ozon Express a refusé le colis : ${msg}`);
  }
  return { trackingNumber: String(tn), raw: data };
}

/** Récupère le dernier statut d'un colis. */
export async function trackParcel(trackingNumber: string): Promise<{ status: string; raw: any }> {
  if (!ozonConfigured()) throw new Error("Ozon Express non configuré");
  const data = await postForm(`${base()}/tracking`, { "tracking-number": trackingNumber });
  const t = data?.TRACKING ?? data;
  const last =
    t?.LAST_TRACKING?.STATUT ??
    t?.LAST_TRACKING?.STATUS ??
    t?.["LAST-TRACKING"]?.STATUT ??
    t?.STATUT ??
    t?.status;
  return { status: last ? String(last) : "", raw: data };
}
