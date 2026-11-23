import { NextResponse } from "next/server";
import { getOzonCities } from "@/lib/ozon";
import { FALLBACK_CITIES } from "@/lib/cities";

export async function GET() {
  try {
    const list = await getOzonCities();
    if (list.length) return NextResponse.json(list.map(({ id, name }) => ({ id, name })));
  } catch {}
  return NextResponse.json(FALLBACK_CITIES);
}
