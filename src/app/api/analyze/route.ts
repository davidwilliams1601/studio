import { NextRequest, NextResponse } from "next/server";
import { getStorage } from "@/lib/firebase-admin";
import Papa from "papaparse";

export async function POST(req: NextRequest) {
  const { bucketPath } = await req.json();
  if (!bucketPath) return NextResponse.json({ error: "bucketPath required" }, { status: 400 });

  try {
    const storage = getStorage();
    const file = storage.bucket().file(bucketPath);
    const [exists] = await file.exists();
    if (!exists) return NextResponse.json({ error: "File not found" }, { status: 404 });

    const [buf] = await file.download();
    const text = buf.toString("utf-8");
    const parsed = Papa.parse(text, { header: true, skipEmptyLines: true });
    if (parsed.errors?.length) {
      return NextResponse.json({ error: "CSV parse error", details: parsed.errors }, { status: 422 });
    }
    const rows = parsed.data as Record<string, string>[];
    return NextResponse.json({ ok: true, connectionCount: rows.length });
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? "Unknown error" }, { status: 500 });
  }
}
