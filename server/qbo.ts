/**
 * QuickBooks Online integration
 * Handles OAuth2 flow, token refresh, and API calls.
 */
import OAuthClient from "intuit-oauth";
import { getDb } from "./db";
import { qboConnections } from "../drizzle/schema";
import { eq } from "drizzle-orm";

const QBO_CLIENT_ID = process.env.QBO_CLIENT_ID!;
const QBO_CLIENT_SECRET = process.env.QBO_CLIENT_SECRET!;
const QBO_ENVIRONMENT = (process.env.QBO_ENVIRONMENT ?? "sandbox") as "sandbox" | "production";

const REDIRECT_URI_PROD = "https://taxflow.refurrm.com/api/qbo/callback";
const REDIRECT_URI_DEV = "http://localhost:3000/api/qbo/callback";

export function getRedirectUri(origin?: string): string {
  if (origin && origin.includes("localhost")) return REDIRECT_URI_DEV;
  return REDIRECT_URI_PROD;
}

export function createOAuthClient(redirectUri: string) {
  return new OAuthClient({
    clientId: QBO_CLIENT_ID,
    clientSecret: QBO_CLIENT_SECRET,
    environment: QBO_ENVIRONMENT,
    redirectUri,
    logging: false,
  });
}

/** Build the Intuit authorization URL and a CSRF state token */
export function buildAuthUrl(redirectUri: string, state: string): string {
  const client = createOAuthClient(redirectUri);
  return client.authorizeUri({
    scope: [OAuthClient.scopes.Accounting],
    state,
  });
}

/** Exchange authorization code for tokens and store in DB */
export async function handleCallback(
  userId: number,
  url: string,
  redirectUri: string
): Promise<{ realmId: string; companyName: string }> {
  const client = createOAuthClient(redirectUri);
  const authResponse = await client.createToken(url);
  const token = authResponse.getJson() as {
    access_token: string;
    refresh_token: string;
    expires_in: number;
    x_refresh_token_expires_in: number;
    realmId: string;
  };

  const now = Date.now();
  const realmId = token.realmId ?? new URL(url).searchParams.get("realmId") ?? "";
  const accessExpiry = now + token.expires_in * 1000;
  const refreshExpiry = now + token.x_refresh_token_expires_in * 1000;

  // Fetch company name
  let companyName = "";
  try {
    const info = await getCompanyInfo(token.access_token, realmId);
    companyName = info ?? "";
  } catch {
    // non-fatal
  }

  // Upsert connection record
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  const existing = await db
    .select()
    .from(qboConnections)
    .where(eq(qboConnections.userId, userId))
    .limit(1);

  if (existing.length > 0) {
    await db
      .update(qboConnections)
      .set({
        realmId,
        companyName,
        accessToken: token.access_token,
        refreshToken: token.refresh_token,
        tokenExpiry: accessExpiry,
        refreshTokenExpiry: refreshExpiry,
        environment: QBO_ENVIRONMENT,
      })
      .where(eq(qboConnections.userId, userId));
  } else {
    await db.insert(qboConnections).values({
      userId,
      realmId,
      companyName,
      accessToken: token.access_token,
      refreshToken: token.refresh_token,
      tokenExpiry: accessExpiry,
      refreshTokenExpiry: refreshExpiry,
      environment: QBO_ENVIRONMENT,
    });
  }

  return { realmId, companyName };
}

/** Get a valid access token, refreshing if expired */
export async function getValidToken(userId: number): Promise<{ accessToken: string; realmId: string } | null> {
  const db = await getDb();
  if (!db) return null;
  const rows = await db
    .select()
    .from(qboConnections)
    .where(eq(qboConnections.userId, userId))
    .limit(1);

  if (rows.length === 0) return null;
  const conn = rows[0];

  // Check if refresh token is expired
  if (Date.now() > conn.refreshTokenExpiry) {
    // Refresh token expired — user must reconnect
    const db2 = await getDb();
    if (db2) await db2.delete(qboConnections).where(eq(qboConnections.userId, userId));
    return null;
  }

  // Refresh access token if expired (with 60s buffer)
  if (Date.now() > conn.tokenExpiry - 60_000) {
    const client = createOAuthClient(REDIRECT_URI_PROD);
    client.setToken({ refresh_token: conn.refreshToken } as Parameters<typeof client.setToken>[0]);
    const refreshed = await client.refreshUsingToken(conn.refreshToken);
    const newToken = refreshed.getJson() as {
      access_token: string;
      refresh_token: string;
      expires_in: number;
      x_refresh_token_expires_in: number;
    };
    const now = Date.now();
    const db3 = await getDb();
    if (!db3) throw new Error("Database unavailable");
    await db3
      .update(qboConnections)
      .set({
        accessToken: newToken.access_token,
        refreshToken: newToken.refresh_token,
        tokenExpiry: now + newToken.expires_in * 1000,
        refreshTokenExpiry: now + newToken.x_refresh_token_expires_in * 1000,
      })
      .where(eq(qboConnections.userId, userId));
    return { accessToken: newToken.access_token, realmId: conn.realmId };
  }

  return { accessToken: conn.accessToken, realmId: conn.realmId };
}

const BASE_URL = QBO_ENVIRONMENT === "sandbox"
  ? "https://sandbox-quickbooks.api.intuit.com"
  : "https://quickbooks.api.intuit.com";

async function qboGet(accessToken: string, realmId: string, path: string) {
  const url = `${BASE_URL}/v3/company/${realmId}/${path}`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json",
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`QBO API error ${res.status}: ${text}`);
  }
  return res.json();
}

async function qboReport(accessToken: string, realmId: string, reportName: string, params: Record<string, string> = {}) {
  const qs = new URLSearchParams(params).toString();
  const path = `reports/${reportName}${qs ? `?${qs}` : ""}`;
  return qboGet(accessToken, realmId, path);
}

export async function getCompanyInfo(accessToken: string, realmId: string): Promise<string> {
  const data = await qboGet(accessToken, realmId, "companyinfo/" + realmId);
  return data?.CompanyInfo?.CompanyName ?? "";
}

export async function fetchTransactions(
  accessToken: string,
  realmId: string,
  startDate: string,
  endDate: string
) {
  // Use the Purchase query to get expenses/payments
  const query = `SELECT * FROM Purchase WHERE TxnDate >= '${startDate}' AND TxnDate <= '${endDate}' MAXRESULTS 200`;
  const encoded = encodeURIComponent(query);
  const data = await qboGet(accessToken, realmId, `query?query=${encoded}`);
  return (data?.QueryResponse?.Purchase ?? []) as QBOPurchase[];
}

export async function fetchProfitLoss(
  accessToken: string,
  realmId: string,
  startDate: string,
  endDate: string
) {
  return qboReport(accessToken, realmId, "ProfitAndLoss", {
    start_date: startDate,
    end_date: endDate,
    accounting_method: "Accrual",
  });
}

export async function fetchBalanceSheet(
  accessToken: string,
  realmId: string,
  asOfDate: string
) {
  return qboReport(accessToken, realmId, "BalanceSheet", {
    start_date: asOfDate.slice(0, 7) + "-01",
    end_date: asOfDate,
    accounting_method: "Accrual",
  });
}

export interface QBOPurchase {
  Id: string;
  TxnDate: string;
  TotalAmt: number;
  EntityRef?: { name?: string };
  AccountRef?: { name?: string };
  Line?: Array<{
    Amount?: number;
    Description?: string;
    AccountBasedExpenseLineDetail?: { AccountRef?: { name?: string } };
  }>;
  PaymentType?: string;
  PrivateNote?: string;
}
