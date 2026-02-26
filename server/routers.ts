import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { invokeLLM } from "./_core/llm";
import { getDb } from "./db";
import { z } from "zod";
import {
  chatMessages, receipts, taxDocuments, transactions,
  quarterlyPayments, businessEntities, cryptoTransactions,
  auditItems, backups, notarySessions, efileSubmissions, mileageLogs
} from "../drizzle/schema";
import { eq, and, desc } from "drizzle-orm";
import { storagePut } from "./storage";
import { nanoid } from "nanoid";

// ─── TaxGPT AI Router ─────────────────────────────────────────────────────────
const taxgptRouter = router({
  chat: protectedProcedure
    .input(z.object({
      message: z.string().min(1).max(4000),
      sessionId: z.string().optional(),
      context: z.object({
        filingStatus: z.string().optional(),
        state: z.string().optional(),
        selfEmployed: z.boolean().optional(),
        income: z.number().optional(),
      }).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      const sessionId = input.sessionId || nanoid();

      // Build system prompt
      const systemPrompt = `You are TaxGPT, an expert AI tax assistant for SmartBooks24 by ReFurrm. 
You help gig workers, freelancers, individuals, and small businesses with year-round tax planning and preparation.
${input.context ? `User context: Filing status: ${input.context.filingStatus || 'unknown'}, State: ${input.context.state || 'unknown'}, Self-employed: ${input.context.selfEmployed ? 'yes' : 'no'}` : ''}
Provide accurate, helpful tax advice. Always recommend consulting a licensed tax professional for complex situations.
Be concise, friendly, and practical. Format responses with clear sections when helpful.`;

      // Get recent chat history
      let history: Array<{ role: "user" | "assistant"; content: string }> = [];
      if (db) {
        const recent = await db
          .select()
          .from(chatMessages)
          .where(and(
            eq(chatMessages.userId, ctx.user.id),
            eq(chatMessages.sessionId, sessionId)
          ))
          .orderBy(desc(chatMessages.createdAt))
          .limit(10);
        history = recent.reverse().map(m => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        }));
      }

      // Call LLM
      const response = await invokeLLM({
        messages: [
          { role: "system", content: systemPrompt },
          ...history,
          { role: "user", content: input.message },
        ],
      });

      const rawContent = response.choices[0]?.message?.content;
      const assistantMessage = typeof rawContent === 'string' ? rawContent : "I'm sorry, I couldn't process that request.";

      // Save to DB
      if (db) {
        await db.insert(chatMessages).values([
          { userId: ctx.user.id, sessionId, role: "user", content: input.message },
          { userId: ctx.user.id, sessionId, role: "assistant", content: assistantMessage },
        ]);
      }

      return { message: assistantMessage, sessionId };
    }),

  history: protectedProcedure
    .input(z.object({ sessionId: z.string().optional() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return [];
      const query = db.select().from(chatMessages)
        .where(eq(chatMessages.userId, ctx.user.id))
        .orderBy(desc(chatMessages.createdAt))
        .limit(50);
      return await query;
    }),
});

// ─── Receipts Router ──────────────────────────────────────────────────────────
const receiptsRouter = router({
  list: protectedProcedure
    .input(z.object({ taxYear: z.number().optional() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return [];
      const year = input.taxYear || new Date().getFullYear();
      return await db.select().from(receipts)
        .where(and(eq(receipts.userId, ctx.user.id), eq(receipts.taxYear, year)))
        .orderBy(desc(receipts.createdAt));
    }),

  create: protectedProcedure
    .input(z.object({
      vendor: z.string().optional(),
      amount: z.string().optional(),
      date: z.string().optional(),
      category: z.string().optional(),
      description: z.string().optional(),
      taxYear: z.number().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      const year = input.taxYear || new Date().getFullYear();
      await db.insert(receipts).values({
        userId: ctx.user.id,
        taxYear: year,
        vendor: input.vendor,
        amount: input.amount,
        date: input.date,
        category: input.category,
        description: input.description,
      });
      return { success: true };
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      await db.delete(receipts)
        .where(and(eq(receipts.id, input.id), eq(receipts.userId, ctx.user.id)));
      return { success: true };
    }),
});

// ─── Documents Router ─────────────────────────────────────────────────────────
const documentsRouter = router({
  list: protectedProcedure
    .input(z.object({ taxYear: z.number().optional() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return [];
      const year = input.taxYear || new Date().getFullYear();
      return await db.select().from(taxDocuments)
        .where(and(eq(taxDocuments.userId, ctx.user.id), eq(taxDocuments.taxYear, year)))
        .orderBy(desc(taxDocuments.createdAt));
    }),

  analyze: protectedProcedure
    .input(z.object({
      documentType: z.string(),
      fileName: z.string(),
      content: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const prompt = `Analyze this ${input.documentType} tax document named "${input.fileName}".
${input.content ? `Content: ${input.content.slice(0, 2000)}` : ''}
Extract key tax information and provide a summary of important values.
Return JSON with: { documentType, taxYear, keyFields: {}, summary, actionItems: [] }`;

      const response = await invokeLLM({
        messages: [
          { role: "system", content: "You are a tax document analyzer. Return valid JSON only." },
          { role: "user", content: prompt },
        ],
        response_format: { type: "json_object" },
      });

      const rawDoc = response.choices[0]?.message?.content;
      const content = typeof rawDoc === 'string' ? rawDoc : "{}";
      try {
        return JSON.parse(content);
      } catch {
        return { summary: "Document analyzed", keyFields: {}, actionItems: [] };
      }
    }),
});

// ─── Quarterly Tax Router ─────────────────────────────────────────────────────
const quarterlyRouter = router({
  list: protectedProcedure
    .input(z.object({ taxYear: z.number().optional() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return [];
      const year = input.taxYear || new Date().getFullYear();
      return await db.select().from(quarterlyPayments)
        .where(and(
          eq(quarterlyPayments.userId, ctx.user.id),
          eq(quarterlyPayments.taxYear, year)
        ))
        .orderBy(quarterlyPayments.quarter);
    }),

  markPaid: protectedProcedure
    .input(z.object({
      id: z.number(),
      paidAmount: z.string(),
      paidDate: z.string(),
      confirmationNumber: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      await db.update(quarterlyPayments)
        .set({
          paidAmount: input.paidAmount,
          paidDate: input.paidDate,
          confirmationNumber: input.confirmationNumber,
          status: "paid",
        })
        .where(and(
          eq(quarterlyPayments.id, input.id),
          eq(quarterlyPayments.userId, ctx.user.id)
        ));
      return { success: true };
    }),

  estimate: protectedProcedure
    .input(z.object({
      annualIncome: z.number(),
      deductions: z.number().optional(),
      state: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const response = await invokeLLM({
        messages: [
          { role: "system", content: "You are a tax calculator. Return valid JSON only." },
          {
            role: "user",
            content: `Calculate quarterly estimated tax payments for:
Annual income: $${input.annualIncome}
Deductions: $${input.deductions || 0}
State: ${input.state || 'unknown'}
Self-employed: yes (include SE tax)
Return JSON: { q1: number, q2: number, q3: number, q4: number, annualTotal: number, effectiveRate: number, notes: string }`
          },
        ],
        response_format: { type: "json_object" },
      });
      const rawQ = response.choices[0]?.message?.content;
      const content = typeof rawQ === 'string' ? rawQ : "{}";
      try {
        return JSON.parse(content);
      } catch {
        return { q1: 0, q2: 0, q3: 0, q4: 0, annualTotal: 0, effectiveRate: 0, notes: "Calculation unavailable" };
      }
    }),
});

// ─── Notary Router ────────────────────────────────────────────────────────────
const notaryRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];
    return await db.select().from(notarySessions)
      .where(eq(notarySessions.userId, ctx.user.id))
      .orderBy(desc(notarySessions.createdAt));
  }),

  book: protectedProcedure
    .input(z.object({
      sessionType: z.enum(["RON", "general"]),
      serviceType: z.string(),
      scheduledAt: z.string(),
      documentName: z.string().optional(),
      signerName: z.string(),
      signerEmail: z.string().email(),
      witnessRequired: z.boolean().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      const prices: Record<string, number> = {
        acknowledgment: 25, jurat: 25, oath: 15,
        affidavit: 35, power_of_attorney: 45, real_estate: 75,
        business_formation: 95, general: 25,
      };
      const price = prices[input.serviceType] || 25;
      await db.insert(notarySessions).values({
        userId: ctx.user.id,
        sessionType: input.sessionType,
        serviceType: input.serviceType,
        scheduledAt: new Date(input.scheduledAt),
        signerName: input.signerName,
        signerEmail: input.signerEmail,
        documentName: input.documentName,
        witnessRequired: input.witnessRequired || false,
        notes: input.notes,
        price: String(price),
        meetingLink: input.sessionType === "RON" ? `https://meet.taxflow.app/notary/${nanoid(8)}` : undefined,
      });
      return { success: true, price };
    }),

  cancel: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      await db.update(notarySessions)
        .set({ status: "cancelled" })
        .where(and(
          eq(notarySessions.id, input.id),
          eq(notarySessions.userId, ctx.user.id)
        ));
      return { success: true };
    }),
});

// ─── Business Entities Router ─────────────────────────────────────────────────
const entitiesRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];
    return await db.select().from(businessEntities)
      .where(eq(businessEntities.userId, ctx.user.id))
      .orderBy(desc(businessEntities.createdAt));
  }),

  create: protectedProcedure
    .input(z.object({
      entityName: z.string().min(1),
      entityType: z.string(),
      ein: z.string().optional(),
      state: z.string().optional(),
      formationDate: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      await db.insert(businessEntities).values({
        userId: ctx.user.id,
        entityName: input.entityName,
        entityType: input.entityType,
        ein: input.ein,
        state: input.state,
        formationDate: input.formationDate,
      });
      return { success: true };
    }),
});

// ─── Audit Defense Router ─────────────────────────────────────────────────────
const auditRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];
    return await db.select().from(auditItems)
      .where(eq(auditItems.userId, ctx.user.id))
      .orderBy(desc(auditItems.createdAt));
  }),

  create: protectedProcedure
    .input(z.object({
      taxYear: z.number(),
      irsNoticeType: z.string().optional(),
      noticeDate: z.string().optional(),
      responseDeadline: z.string().optional(),
      description: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      await db.insert(auditItems).values({
        userId: ctx.user.id,
        ...input,
      });
      return { success: true };
    }),

  getAdvice: protectedProcedure
    .input(z.object({
      noticeType: z.string(),
      description: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const response = await invokeLLM({
        messages: [
          { role: "system", content: "You are an IRS audit defense expert. Provide practical, actionable advice." },
          {
            role: "user",
            content: `I received an IRS notice: ${input.noticeType}. ${input.description || ''}
What should I do? Provide: 1) What this notice means, 2) Immediate action steps, 3) Documents to gather, 4) Timeline to respond.`
          },
        ],
      });
      return { advice: response.choices[0]?.message?.content || "Please consult a tax professional." };
    }),
});

// ─── E-File Router ────────────────────────────────────────────────────────────
const efileRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];
    return await db.select().from(efileSubmissions)
      .where(eq(efileSubmissions.userId, ctx.user.id))
      .orderBy(desc(efileSubmissions.createdAt));
  }),

  submit: protectedProcedure
    .input(z.object({
      taxYear: z.number(),
      submissionType: z.string(),
      stateCode: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      const confirmationNumber = `TF-${Date.now()}-${nanoid(6).toUpperCase()}`;
      await db.insert(efileSubmissions).values({
        userId: ctx.user.id,
        taxYear: input.taxYear,
        submissionType: input.submissionType,
        stateCode: input.stateCode,
        status: "submitted",
        confirmationNumber,
        submittedAt: new Date(),
      });
      return { success: true, confirmationNumber };
    }),
});

// ─── Academy Router ──────────────────────────────────────────────────────
const academyRouter = router({
  getProgress: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];
    const { academyProgress } = await import("../drizzle/schema");
    return db.select().from(academyProgress).where(eq(academyProgress.userId, ctx.user.id));
  }),

  markLessonComplete: protectedProcedure
    .input(z.object({ lessonSlug: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      const { academyProgress } = await import("../drizzle/schema");
      // Upsert — only insert if not already completed
      const existing = await db.select().from(academyProgress)
        .where(eq(academyProgress.userId, ctx.user.id))
        .limit(100);
      const alreadyDone = existing.some((p: { lessonSlug: string }) => p.lessonSlug === input.lessonSlug);
      if (!alreadyDone) {
        await db.insert(academyProgress).values({
          userId: ctx.user.id,
          lessonSlug: input.lessonSlug,
        });
      }
      return { success: true };
    }),

  captureLeadMagnet: publicProcedure
    .input(z.object({ email: z.string().email(), name: z.string().optional() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      const { leadMagnets } = await import("../drizzle/schema");
      await db.insert(leadMagnets).values({
        email: input.email,
        name: input.name ?? null,
        source: "academy",
      });
      // Notify owner of new lead
      const { notifyOwner } = await import("./_core/notification");
      await notifyOwner({
        title: "New Lead Magnet Signup",
        content: `${input.name ?? input.email} signed up for the Gig Worker Tax Starter Kit.`,
      });
      return { success: true };
    }),
});

// ─── Remote Returns Router ──────────────────────────────────────────────────────
const remoteReturnsRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database unavailable");
    const { remoteReturns } = await import("../drizzle/schema");
    return db.select().from(remoteReturns).where(eq(remoteReturns.userId, ctx.user.id));
  }),

  getById: protectedProcedure
    .input(z.object({ returnId: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      const { remoteReturns, returnDocuments } = await import("../drizzle/schema");
      const [ret] = await db.select().from(remoteReturns)
        .where(eq(remoteReturns.id, input.returnId))
        .limit(1);
      if (!ret || ret.userId !== ctx.user.id) throw new Error("Not found");
      const docs = await db.select().from(returnDocuments)
        .where(eq(returnDocuments.returnId, input.returnId));
      return { ...ret, documents: docs };
    }),

  create: protectedProcedure
    .input(z.object({
      taxYear: z.number(),
      isNewClient: z.boolean().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      const { remoteReturns } = await import("../drizzle/schema");
      const [result] = await db.insert(remoteReturns).values({
        userId: ctx.user.id,
        taxYear: input.taxYear,
        clientName: ctx.user.name,
        clientEmail: ctx.user.email,
        isNewClient: input.isNewClient ?? true,
        status: "draft",
        checklistProgress: {},
        checklistCompletePct: 0,
      });
      return { id: (result as any).insertId as number };
    }),

  saveProgress: protectedProcedure
    .input(z.object({
      returnId: z.number(),
      checklistProgress: z.record(z.string(), z.string()).optional(),
      checklistCompletePct: z.number().optional(),
      clientNotes: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      const { remoteReturns } = await import("../drizzle/schema");
      await db.update(remoteReturns)
        .set({
          checklistProgress: input.checklistProgress,
          checklistCompletePct: input.checklistCompletePct,
          clientNotes: input.clientNotes,
        })
        .where(eq(remoteReturns.id, input.returnId));
      return { success: true };
    }),

  submit: protectedProcedure
    .input(z.object({ returnId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      const { remoteReturns } = await import("../drizzle/schema");
      const [ret] = await db.select().from(remoteReturns)
        .where(eq(remoteReturns.id, input.returnId))
        .limit(1);
      if (!ret || ret.userId !== ctx.user.id) throw new Error("Not found");
      await db.update(remoteReturns)
        .set({ status: "submitted" })
        .where(eq(remoteReturns.id, input.returnId));
      // Notify the owner (preparer) of new submission
      const { notifyOwner } = await import("./_core/notification");
      await notifyOwner({
        title: "New Remote Return Submitted",
        content: `${ret.clientName ?? ctx.user.name} submitted their ${ret.taxYear} tax documents for review.`,
      });
      return { success: true };
    }),

  // Admin: update return status and add preparer notes
  updateStatus: protectedProcedure
    .input(z.object({
      returnId: z.number(),
      status: z.enum(["draft", "submitted", "docs_received", "in_review", "ready_to_sign", "filed", "rejected"]),
      preparerNotes: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") throw new Error("Forbidden");
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      const { remoteReturns } = await import("../drizzle/schema");
      await db.update(remoteReturns)
        .set({
          status: input.status,
          preparerNotes: input.preparerNotes,
          ...(input.status === "filed" ? { filedAt: new Date() } : {}),
        })
        .where(eq(remoteReturns.id, input.returnId));
      return { success: true };
    }),

  // Admin: list all submissions
  adminList: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user.role !== "admin") throw new Error("Forbidden");
    const db = await getDb();
    if (!db) throw new Error("Database unavailable");
    const { remoteReturns } = await import("../drizzle/schema");
    return db.select().from(remoteReturns).orderBy(remoteReturns.createdAt);
  }),
});

// ─── User Profile Router ──────────────────────────────────────────────────────
const profileRouter = router({
  get: protectedProcedure.query(async ({ ctx }) => {
    return ctx.user;
  }),

  update: protectedProcedure
    .input(z.object({
      filingStatus: z.string().optional(),
      state: z.string().optional(),
      selfEmployed: z.boolean().optional(),
      homeOwner: z.boolean().optional(),
      dependents: z.number().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      const { users } = await import("../drizzle/schema");
      await db.update(users)
        .set(input)
        .where(eq(users.id, ctx.user.id));
      return { success: true };
    }),
});

// ─── App Router ───────────────────────────────────────────────────────────────
export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  taxgpt: taxgptRouter,
  receipts: receiptsRouter,
  documents: documentsRouter,
  quarterly: quarterlyRouter,
  notary: notaryRouter,
  entities: entitiesRouter,
  audit: auditRouter,
  efile: efileRouter,
  profile: profileRouter,
   remoteReturns: remoteReturnsRouter,
  academy: academyRouter,
});
export type AppRouter = typeof appRouter;
