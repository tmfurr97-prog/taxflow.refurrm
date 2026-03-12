import { describe, expect, it } from "vitest";

const QBO_DISCOVERY_SANDBOX = "https://developer.api.intuit.com/.well-known/openid_sandbox_configuration";
const QBO_DISCOVERY_PROD = "https://developer.api.intuit.com/.well-known/openid_configuration";

describe("QuickBooks Online credentials", () => {
  it("QBO_CLIENT_ID env var is set and non-empty", () => {
    const clientId = process.env.QBO_CLIENT_ID;
    expect(clientId).toBeDefined();
    expect(clientId!.length).toBeGreaterThan(10);
  });

  it("QBO_CLIENT_SECRET env var is set and non-empty", () => {
    const clientSecret = process.env.QBO_CLIENT_SECRET;
    expect(clientSecret).toBeDefined();
    expect(clientSecret!.length).toBeGreaterThan(10);
  });

  it("QBO_ENVIRONMENT is sandbox or production", () => {
    const env = process.env.QBO_ENVIRONMENT ?? "sandbox";
    expect(["sandbox", "production"]).toContain(env);
  });

  it("Intuit sandbox discovery document is reachable", async () => {
    const res = await fetch(QBO_DISCOVERY_SANDBOX);
    expect(res.ok).toBe(true);
    const json = await res.json() as Record<string, unknown>;
    expect(json).toHaveProperty("authorization_endpoint");
    expect(json).toHaveProperty("token_endpoint");
  });

  it("Intuit production discovery document is reachable", async () => {
    const res = await fetch(QBO_DISCOVERY_PROD);
    expect(res.ok).toBe(true);
    const json = await res.json() as Record<string, unknown>;
    expect(json).toHaveProperty("authorization_endpoint");
    expect(json).toHaveProperty("token_endpoint");
  });
});
