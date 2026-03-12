/**
 * QuickBooks Online OAuth2 Express routes
 * GET  /api/qbo/connect    — redirect user to Intuit authorization page
 * GET  /api/qbo/callback   — exchange code for tokens, redirect back to app
 * POST /api/qbo/disconnect — revoke tokens and remove connection
 */
import type { Express, Request, Response } from "express";
import crypto from "crypto";
import { buildAuthUrl, handleCallback, getRedirectUri } from "./qbo";
import { getDb } from "./db";
import { qboConnections } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import { sdk } from "./_core/sdk";

// In-memory CSRF state store (keyed by state token, value = userId)
const pendingStates = new Map<string, { userId: number; origin: string }>();

export function registerQboRoutes(app: Express) {
  // Initiate OAuth — user must be logged in
  app.get("/api/qbo/connect", async (req: Request, res: Response) => {
    try {
      let user;
      try {
        user = await sdk.authenticateRequest(req);
      } catch {
        return res.status(401).json({ error: "Not authenticated" });
      }
      if (!user) return res.status(401).json({ error: "Not authenticated" });

      const origin = (req.query.origin as string) || "https://taxflow.refurrm.com";
      const state = crypto.randomBytes(16).toString("hex");
      pendingStates.set(state, { userId: user.id, origin });

      // Clean up old states after 10 minutes
      setTimeout(() => pendingStates.delete(state), 10 * 60 * 1000);

      const redirectUri = getRedirectUri(origin);
      const authUrl = buildAuthUrl(redirectUri, state);
      return res.redirect(authUrl);
    } catch (err) {
      console.error("[QBO] Connect error:", err);
      return res.status(500).json({ error: "Failed to initiate QuickBooks connection" });
    }
  });

  // OAuth callback from Intuit
  app.get("/api/qbo/callback", async (req: Request, res: Response) => {
    try {
      const state = req.query.state as string;
      const code = req.query.code as string;
      const realmId = req.query.realmId as string;
      const error = req.query.error as string;

      if (error) {
        console.error("[QBO] Auth error from Intuit:", error);
        return res.redirect("/profile?qbo=error&reason=" + encodeURIComponent(error));
      }

      if (!state || !pendingStates.has(state)) {
        return res.redirect("/profile?qbo=error&reason=invalid_state");
      }

      const { userId, origin } = pendingStates.get(state)!;
      pendingStates.delete(state);

      const redirectUri = getRedirectUri(origin);
      const fullUrl = `${origin}/api/qbo/callback?${new URLSearchParams(req.query as Record<string, string>).toString()}`;

      await handleCallback(userId, fullUrl, redirectUri);

      return res.redirect(`${origin}/profile?qbo=connected`);
    } catch (err) {
      console.error("[QBO] Callback error:", err);
      return res.redirect("/profile?qbo=error&reason=callback_failed");
    }
  });

  // Disconnect
  app.post("/api/qbo/disconnect", async (req: Request, res: Response) => {
    try {
      let user;
      try {
        user = await sdk.authenticateRequest(req);
      } catch {
        return res.status(401).json({ error: "Not authenticated" });
      }
      if (!user) return res.status(401).json({ error: "Not authenticated" });

      const db = await getDb();
      if (db) {
        await db.delete(qboConnections).where(eq(qboConnections.userId, user.id));
      }
      return res.json({ success: true });
    } catch (err) {
      console.error("[QBO] Disconnect error:", err);
      return res.status(500).json({ error: "Failed to disconnect" });
    }
  });
}
