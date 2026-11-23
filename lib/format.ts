export function dh(n: number) {
  return (
    n.toLocaleString("fr-MA", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " DH"
  );
}

export function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function parseList(json: string | null | undefined): string[] {
  try {
    const v = JSON.parse(json || "[]");
    return Array.isArray(v) ? v.map(String) : [];
  } catch {
    return [];
  }
}

// Normalise un numéro marocain en 06XXXXXXXX / 07XXXXXXXX
export function normalizePhone(p: string) {
  let d = p.replace(/\D/g, "");
  if (d.startsWith("00212")) d = d.slice(5);
  if (d.startsWith("212")) d = d.slice(3);
  if (d.length === 9) d = "0" + d;
  return d;
}
export function isValidPhone(p: string) {
  return /^0[5-7]\d{8}$/.test(normalizePhone(p));
}

export function makeReference() {
  const now = new Date();
  const ymd =
    String(now.getDate()).padStart(2, "0") +
    String(now.getMonth() + 1).padStart(2, "0") +
    String(now.getFullYear()).slice(2);
  const rnd = String(Math.floor(Math.random() * 10_000_000)).padStart(7, "0");
  return `YN-${ymd}-${rnd}`;
}
