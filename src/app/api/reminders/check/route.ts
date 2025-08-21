import { NextResponse } from "next/server";
import { getDb } from "@/lib/firebase-admin";

export async function GET(req: Request) {
  const secret = req.headers.get("x-cron-secret");
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const db = getDb();
  const snapshot = await db.collection("users").limit(1).get();
  return NextResponse.json({ ok: true, usersScanned: snapshot.size });
}
