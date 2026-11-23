// Périodes calculées à l'heure du Maroc (Africa/Casablanca)
const TZ = "Africa/Casablanca";

function tzOffsetMs(d: Date) {
  const s = d.toLocaleString("en-US", { timeZone: TZ });
  return new Date(s).getTime() - new Date(d.toLocaleString("en-US", { timeZone: "UTC" })).getTime();
}

function localParts(d: Date) {
  const p = new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit" })
    .format(d)
    .split("-")
    .map(Number);
  return { y: p[0], m: p[1], d: p[2] };
}

function startOfLocalDay(y: number, m: number, d: number) {
  const utc = Date.UTC(y, m - 1, d);
  return new Date(utc - tzOffsetMs(new Date(utc)));
}

export const PERIODS = {
  today: "Aujourd'hui",
  yesterday: "Hier",
  "7d": "7 jours",
  month: "Ce mois",
  lastmonth: "Mois dernier",
  all: "Tout",
} as const;
export type Period = keyof typeof PERIODS;

export function periodRange(p: string): { gte?: Date; lt?: Date } {
  const { y, m, d } = localParts(new Date());
  const today = startOfLocalDay(y, m, d);
  const day = 86400000;
  switch (p) {
    case "today": return { gte: today };
    case "yesterday": return { gte: new Date(today.getTime() - day), lt: today };
    case "7d": return { gte: new Date(today.getTime() - 6 * day) };
    case "month": return { gte: startOfLocalDay(y, m, 1) };
    case "lastmonth": {
      const py = m === 1 ? y - 1 : y;
      const pm = m === 1 ? 12 : m - 1;
      return { gte: startOfLocalDay(py, pm, 1), lt: startOfLocalDay(y, m, 1) };
    }
    default: return {};
  }
}

export function fmtDate(d: Date) {
  return d.toLocaleString("fr-FR", { timeZone: TZ, day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
}
