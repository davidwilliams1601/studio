import { getDb } from "@/lib/firebase-admin";
import type { SubscriptionTier } from "@/lib/subscription-tiers";
import { canCreateBackupForTier } from "./subscriptions";

export async function getMonthlyUsage(uid: string): Promise<number> {
  const db = getDb();
  const now = new Date();
  const y = now.getUTCFullYear();
  const m = now.getUTCMonth() + 1;
  const key = `${y}-${String(m).padStart(2, "0")}`;
  const ref = db.collection("usage").doc(uid).collection("months").doc(key);
  const snap = await ref.get();
  return (snap.exists ? (snap.data()?.count as number) : 0) || 0;
}

export async function recordBackupUsage(uid: string) {
  const db = getDb();
  const now = new Date();
  const y = now.getUTCFullYear();
  const m = now.getUTCMonth() + 1;
  const key = `${y}-${String(m).padStart(2, "0")}`;
  const ref = db.collection("usage").doc(uid).collection("months").doc(key);
  await db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    const count = (snap.exists ? (snap.data()?.count as number) : 0) || 0;
    tx.set(ref, { count: count + 1, updatedAt: Date.now() }, { merge: true });
  });
}

export async function canUserCreateBackup(uid: string, tier: SubscriptionTier) {
  const used = await getMonthlyUsage(uid);
  return canCreateBackupForTier(tier, used);
}
