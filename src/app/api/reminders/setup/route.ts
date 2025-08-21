import { NextResponse } from "next/server";
import { getDb } from "@/lib/firebase-admin";

export async function POST(req: Request) {
  const secret = req.headers.get("x-cron-secret");
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const db = getDb();
  await db.collection("system").doc("reminders").set({ lastSetup: Date.now() }, { merge: true });
  return NextResponse.json({ ok: true });
}
