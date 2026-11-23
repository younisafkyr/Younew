import { NextResponse } from "next/server";
import { syncAllShipped } from "@/lib/orders";

export async function POST() {
  try {
    return NextResponse.json(await syncAllShipped());
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
