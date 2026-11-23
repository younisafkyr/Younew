import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { randomBytes } from "crypto";

const TYPES: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };

export async function POST(req: Request) {
  const form = await req.formData();
  const files = form.getAll("files").filter((f): f is File => f instanceof File);
  const dir = path.join(process.cwd(), "uploads");
  await mkdir(dir, { recursive: true });
  const urls: string[] = [];
  for (const f of files) {
    const ext = TYPES[f.type];
    if (!ext) return NextResponse.json({ error: "Format accepté : JPG, PNG, WEBP" }, { status: 400 });
    if (f.size > 8 * 1024 * 1024) return NextResponse.json({ error: "Image trop lourde (max 8 Mo)" }, { status: 400 });
    const name = `${Date.now()}-${randomBytes(4).toString("hex")}.${ext}`;
    await writeFile(path.join(dir, name), Buffer.from(await f.arrayBuffer()));
    urls.push(`/uploads/${name}`);
  }
  return NextResponse.json({ urls });
}
