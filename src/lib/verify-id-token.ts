import { getAuth } from "@/lib/firebase-admin";

export async function verifyIdToken(authHeader?: string) {
  if (!authHeader) return null;
  const [type, token] = authHeader.split(" ", 2);
  if (!type || type.toLowerCase() !== "bearer" || !token) return null;
  try {
    const decoded = await getAuth().verifyIdToken(token);
    return decoded;
  } catch {
    return null;
  }
}
