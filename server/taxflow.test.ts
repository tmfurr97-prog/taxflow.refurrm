import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import { COOKIE_NAME } from "../shared/const";
import type { TrpcContext } from "./_core/context";

// Mock the database and LLM to avoid real connections in tests
vi.mock("./db", () => ({
  getDb: vi.fn().mockResolvedValue(null),
}));

vi.mock("./_core/llm", () => ({
  invokeLLM: vi.fn().mockResolvedValue({
    choices: [{ message: { content: "Mock LLM response" } }],
  }),
}));

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(): { ctx: TrpcContext; clearedCookies: Array<{ name: string; options: Record<string, unknown> }> } {
  const clearedCookies: Array<{ name: string; options: Record<string, unknown> }> = [];

  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user-openid",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "user",
    filingStatus: "single",
    state: "CA",
    selfEmployed: true,
    homeOwner: false,
    dependents: 0,
    subscriptionTier: "free",
    subscriptionStatus: "inactive",
    stripeCustomerId: null,
    referralCode: null,
    referredBy: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: (name: string, options: Record<string, unknown>) => {
        clearedCookies.push({ name, options });
      },
    } as TrpcContext["res"],
  };

  return { ctx, clearedCookies };
}

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

// ─── Auth Tests ───────────────────────────────────────────────────────────────
describe("auth.logout", () => {
  it("clears the session cookie and returns success", async () => {
    const { ctx, clearedCookies } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.auth.logout();

    expect(result).toEqual({ success: true });
    expect(clearedCookies).toHaveLength(1);
    expect(clearedCookies[0]?.name).toBe(COOKIE_NAME);
    expect(clearedCookies[0]?.options).toMatchObject({ maxAge: -1 });
  });

  it("returns null for unauthenticated user from auth.me", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.me();
    expect(result).toBeNull();
  });

  it("returns user for authenticated user from auth.me", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.me();
    expect(result?.email).toBe("test@example.com");
    expect(result?.name).toBe("Test User");
  });
});

// ─── TaxGPT Tests ─────────────────────────────────────────────────────────────
describe("taxgpt.chat", () => {
  it("returns an AI response for a tax question", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.taxgpt.chat({
      message: "What is the standard deduction for 2024?",
      sessionId: "test-session-123",
    });

    expect(result).toHaveProperty("message");
    expect(result).toHaveProperty("sessionId");
    expect(typeof result.message).toBe("string");
    expect(result.message.length).toBeGreaterThan(0);
  });

  it("requires authentication", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.taxgpt.chat({ message: "Test question" })
    ).rejects.toThrow();
  });

  it("returns empty history when DB is unavailable", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.taxgpt.history({});
    expect(Array.isArray(result)).toBe(true);
  });
});

// ─── Receipts Tests ───────────────────────────────────────────────────────────
describe("receipts", () => {
  it("returns empty array when DB is unavailable", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.receipts.list({ taxYear: 2024 });
    expect(Array.isArray(result)).toBe(true);
  });

  it("throws when creating receipt without DB", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.receipts.create({
        vendor: "Office Depot",
        amount: "45.99",
        date: "2024-03-15",
        category: "office_supplies",
      })
    ).rejects.toThrow("Database unavailable");
  });
});

// ─── Notary Tests ─────────────────────────────────────────────────────────────
describe("notary", () => {
  it("returns empty array when DB is unavailable", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.notary.list();
    expect(Array.isArray(result)).toBe(true);
  });

  it("throws when booking without DB", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.notary.book({
        sessionType: "RON",
        serviceType: "acknowledgment",
        scheduledAt: new Date(Date.now() + 86400000).toISOString(),
        signerName: "John Doe",
        signerEmail: "john@example.com",
      })
    ).rejects.toThrow("Database unavailable");
  });
});

// ─── Quarterly Tax Tests ──────────────────────────────────────────────────────
describe("quarterly.estimate", () => {
  it("returns estimated quarterly payments from AI", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Mock LLM to return valid JSON
    const { invokeLLM } = await import("./_core/llm");
    vi.mocked(invokeLLM).mockResolvedValueOnce({
      choices: [{
        message: {
          content: JSON.stringify({
            q1: 2500, q2: 2500, q3: 2500, q4: 2500,
            annualTotal: 10000, effectiveRate: 0.25,
            notes: "Based on self-employment income"
          })
        }
      }]
    } as any);

    const result = await caller.quarterly.estimate({
      annualIncome: 40000,
      state: "CA",
    });

    expect(result).toHaveProperty("q1");
    expect(result).toHaveProperty("annualTotal");
  });
});

// ─── Profile Tests ────────────────────────────────────────────────────────────
describe("profile.get", () => {
  it("returns the authenticated user's profile", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.profile.get();
    expect(result?.email).toBe("test@example.com");
    expect(result?.selfEmployed).toBe(true);
  });
});
