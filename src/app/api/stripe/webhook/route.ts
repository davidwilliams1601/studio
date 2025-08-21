import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { getDb } from "@/lib/firebase-admin";
import { tierForPriceId } from "@/lib/tier-map";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const signature = req.headers.get("stripe-signature");
  const whSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!whSecret) return NextResponse.json({ error: "Missing STRIPE_WEBHOOK_SECRET" }, { status: 500 });
  if (!signature) return NextResponse.json({ error: "Missing Stripe-Signature" }, { status: 400 });

  const stripe = getStripe();
  const raw = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(raw, signature, whSecret);
  } catch (err: any) {
    return NextResponse.json({ error: `Invalid signature: ${err.message}` }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const uid = session.client_reference_id as string | undefined;
        const full = await stripe.checkout.sessions.retrieve(session.id, { expand: ["line_items.data.price"] });
        const priceId = full.line_items?.data?.[0]?.price?.id || null;
        const tier = tierForPriceId(priceId);
        if (uid && tier) {
          const db = getDb();
          await db.collection("users").doc(uid).set(
            {
              tier,
              stripe: {
                customerId: (session.customer as string) || null,
                lastCheckoutSessionId: session.id,
              },
              updatedAt: Date.now(),
            },
            { merge: true }
          );
        }
        break;
      }
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        const priceId = (sub.items?.data?.[0]?.price?.id as string) || null;
        const tier = tierForPriceId(priceId);
        const customerId = sub.customer as string;
        if (tier) {
          const db = getDb();
          const mapSnap = await db.collection("stripeCustomers").doc(customerId).get();
          const uid = (mapSnap.exists && (mapSnap.data()?.uid as string)) || null;
          if (uid) {
            await db.collection("users").doc(uid).set(
              { tier, stripe: { customerId }, updatedAt: Date.now() },
              { merge: true }
            );
          }
        }
        break;
      }
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const customerId = sub.customer as string;
        const db = getDb();
        const mapSnap = await db.collection("stripeCustomers").doc(customerId).get();
        const uid = (mapSnap.exists && (mapSnap.data()?.uid as string)) || null;
        if (uid) {
          await db.collection("users").doc(uid).set(
            { tier: "free", stripe: { customerId }, updatedAt: Date.now() },
            { merge: true }
          );
        }
        break;
      }
      default:
        break;
    }
    return NextResponse.json({ received: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? "Webhook error" }, { status: 500 });
  }
}
