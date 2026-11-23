import { NextResponse } from "next/server";
import { syncAllShipped } from "@/lib/orders";

// À appeler toutes les heures par un cron : GET /api/ozon/sync?key=CRON_SECRET
export async function GET(req: Request) {
  const key = new URL(req.url).searchParams.get("key");
  if (!process.env.CRON_SECRET || key !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  return NextResponse.json(await syncAllShipped());
}
