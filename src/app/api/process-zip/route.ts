import { NextRequest, NextResponse } from "next/server";
import { getStorage } from "@/lib/firebase-admin";
import { verifyIdToken } from "@/lib/verify-id-token";
import unzipper from "unzipper";
import Papa from "papaparse";

function parseCsvString(text: string) {
  const { data, errors } = Papa.parse(text, { header: true, skipEmptyLines: true });
  if (errors?.length) throw new Error("CSV parse error");
  return data as Record<string, string>[];
}

export async function POST(req: NextRequest) {
  const decoded = await verifyIdToken(req.headers.get("authorization") || undefined);
  if (!decoded) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { bucketPath } = await req.json();
  if (!bucketPath) return NextResponse.json({ error: "bucketPath required" }, { status: 400 });

  const storage = getStorage();
  const file = storage.bucket().file(bucketPath);
  const [exists] = await file.exists();
  if (!exists) return NextResponse.json({ error: "File not found" }, { status: 404 });

  const stream = file.createReadStream();
  let connections: Record<string, string>[] = [];
  let messages: Record<string, string>[] = [];

  await new Promise<void>((resolve, reject) => {
    stream
      .pipe(unzipper.Parse())
      .on("entry", (entry: any) => {
        const name = entry.path.toLowerCase();
        if (name.endsWith("connections.csv")) {
          const chunks: Buffer[] = [];
          entry.on("data", (c: Buffer) => chunks.push(c));
          entry.on("end", () => {
            const text = Buffer.concat(chunks).toString("utf-8");
            connections = parseCsvString(text);
          });
          entry.on("error", reject);
        } else if (name.endsWith("messages.csv")) {
          const chunks: Buffer[] = [];
          entry.on("data", (c: Buffer) => chunks.push(c));
          entry.on("end", () => {
            const text = Buffer.concat(chunks).toString("utf-8");
            messages = parseCsvString(text);
          });
          entry.on("error", reject);
        } else {
          entry.autodrain();
        }
      })
      .on("error", reject)
      .on("close", () => resolve());
  });

  return NextResponse.json({
    ok: true,
    stats: { connectionCount: connections.length, messageCount: messages.length },
  });
}
