import { Express, Request, Response } from "express";
import express from "express";
import { getStripe } from "./stripe";
import { ENV } from "./_core/env";
import { getDb } from "./db";
import { users } from "../drizzle/schema";
import { eq } from "drizzle-orm";

export function registerStripeWebhook(app: Express) {
  // MUST use raw body parser for Stripe webhook signature verification
  app.post(
    "/api/stripe/webhook",
    express.raw({ type: "application/json" }),
    async (req: Request, res: Response) => {
      const sig = req.headers["stripe-signature"];

      // Handle test events from Stripe dashboard verification
      let event: any;
      try {
        const stripe = getStripe();
        event = stripe.webhooks.constructEvent(
          req.body,
          sig as string,
          ENV.stripeWebhookSecret
        );
      } catch (err: any) {
        console.error("[Webhook] Signature verification failed:", err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
      }

      // CRITICAL: Test events must return verified: true
      if (event.id.startsWith("evt_test_")) {
        console.log("[Webhook] Test event detected, returning verification response");
        return res.json({ verified: true });
      }

      console.log(`[Webhook] Event received: ${event.type} (${event.id})`);

      const db = await getDb();
      if (!db) {
        console.warn("[Webhook] Database not available");
        return res.json({ received: true });
      }

      try {
        switch (event.type) {
          case "checkout.session.completed": {
            const session = event.data.object;
            const userId = session.metadata?.user_id;
            const customerId = session.customer as string;
            const subscriptionId = session.subscription as string;

            if (userId && customerId) {
              await db
                .update(users)
                .set({
                  stripeCustomerId: customerId,
                  stripeSubscriptionId: subscriptionId || null,
                  subscriptionStatus: "active",
                })
                .where(eq(users.id, parseInt(userId)));
              console.log(`[Webhook] User ${userId} checkout completed`);
            }
            break;
          }

          case "customer.subscription.updated": {
            const sub = event.data.object;
            const customerId = sub.customer as string;
            const status = sub.status; // active, past_due, canceled, etc.

            // Map Stripe price to our tier
            const priceId = sub.items?.data?.[0]?.price?.id;
            const tierMap: Record<string, string> = {
              "price_1T57Mb2a3IaVlQ9NdmGgig3A": "essential",
              "price_1T57N02a3IaVlQ9N81W4Xojb": "essential",
              "price_1T57N02a3IaVlQ9NQce8qo5A": "pro",
              "price_1T57N02a3IaVlQ9NH9BhFZW5": "pro",
              "price_1T57N02a3IaVlQ9NdQ46UXy1": "business",
              "price_1T57N02a3IaVlQ9NIdzp6FLC": "business",
            };
            const tier = tierMap[priceId] || "essential";

            await db
              .update(users)
              .set({
                subscriptionStatus: status,
                subscriptionTier: (status === "active" ? tier : "free") as any,
              })
              .where(eq(users.stripeCustomerId, customerId));
            console.log(`[Webhook] Subscription updated for customer ${customerId}: ${status}`);
            break;
          }

          case "customer.subscription.deleted": {
            const sub = event.data.object;
            const customerId = sub.customer as string;

            await db
              .update(users)
              .set({
                subscriptionStatus: "canceled",
                subscriptionTier: "free",
                stripeSubscriptionId: null,
              })
              .where(eq(users.stripeCustomerId, customerId));
            console.log(`[Webhook] Subscription canceled for customer ${customerId}`);
            break;
          }

          case "invoice.payment_failed": {
            const invoice = event.data.object;
            const customerId = invoice.customer as string;

            await db
              .update(users)
              .set({ subscriptionStatus: "past_due" })
              .where(eq(users.stripeCustomerId, customerId));
            console.log(`[Webhook] Payment failed for customer ${customerId}`);
            break;
          }

          default:
            console.log(`[Webhook] Unhandled event type: ${event.type}`);
        }
      } catch (err) {
        console.error("[Webhook] Error processing event:", err);
      }

      res.json({ received: true });
    }
  );
}
