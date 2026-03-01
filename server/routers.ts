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
  auditItems, backups, notarySessions, efileSubmissions, mileageLogs,
  users, promoCodes, promoRedemptions, homeOfficeData, taxIntakeSubmissions
} from "../drizzle/schema";
import { eq, and, desc } from "drizzle-orm";
import { storagePut } from "./storage";
import { nanoid } from "nanoid";
import { getStripe } from "./stripe";
import { STRIPE_PLANS, ALACARTE_ITEMS, type AlacarteKey } from "../shared/stripeProducts";

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

  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      vendor: z.string().nullable().optional(),
      amount: z.string().nullable().optional(),
      date: z.string().optional(),
      category: z.string().optional(),
      description: z.string().optional(),
      isDeductible: z.boolean().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      const { id, ...fields } = input;
      await db.update(receipts)
        .set(fields)
        .where(and(eq(receipts.id, id), eq(receipts.userId, ctx.user.id)));
      return { success: true };
    }),

  bulkCreate: protectedProcedure
    .input(z.object({
      rows: z.array(z.object({
        vendor: z.string().optional(),
        amount: z.string().optional(),
        date: z.string().optional(),
        category: z.string().optional(),
        description: z.string().optional(),
      })),
      taxYear: z.number().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      const year = input.taxYear || new Date().getFullYear();
      if (input.rows.length === 0) return { inserted: 0 };
      await db.insert(receipts).values(
        input.rows.map(r => ({
          userId: ctx.user.id,
          taxYear: year,
          vendor: r.vendor || undefined,
          amount: r.amount || undefined,
          date: r.date || undefined,
          category: r.category || undefined,
          description: r.description || undefined,
        }))
      );
      return { inserted: input.rows.length };
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
    return db.select().from(remoteReturns).orderBy(desc(remoteReturns.createdAt));
  }),
  // Admin: get a single return with all documents
  adminGetById: protectedProcedure
    .input(z.object({ returnId: z.number() }))
    .query(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") throw new Error("Forbidden");
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      const { remoteReturns, returnDocuments } = await import("../drizzle/schema");
      const [ret] = await db.select().from(remoteReturns)
        .where(eq(remoteReturns.id, input.returnId)).limit(1);
      if (!ret) throw new Error("Not found");
      const docs = await db.select().from(returnDocuments)
        .where(eq(returnDocuments.returnId, input.returnId));
      return { ...ret, documents: docs };
    }),
  // Delete a document (user can delete their own)
  deleteDocument: protectedProcedure
    .input(z.object({ documentId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      const { returnDocuments } = await import("../drizzle/schema");
      const [doc] = await db.select().from(returnDocuments)
        .where(and(eq(returnDocuments.id, input.documentId), eq(returnDocuments.userId, ctx.user.id)))
        .limit(1);
      if (!doc) throw new Error("Document not found");
      await db.delete(returnDocuments).where(eq(returnDocuments.id, input.documentId));
      return { success: true };
    }),
});
// ─── User Profile Routerr ──────────────────────────────────────────────────────
const profileRouter = router({
  get: protectedProcedure.query(async ({ ctx }) => {
    return ctx.user;
  }),
  update: protectedProcedure
    .input(z.object({
      // Personal info
      firstName: z.string().optional(),
      middleInitial: z.string().max(4).optional(),
      lastName: z.string().optional(),
      dateOfBirth: z.string().optional(),
      phone: z.string().optional(),
      ssnLast4: z.string().max(4).optional(),
      // Address
      streetAddress: z.string().optional(),
      aptSuite: z.string().optional(),
      city: z.string().optional(),
      zip: z.string().optional(),
      // Business
      businessName: z.string().optional(),
      businessType: z.string().optional(),
      ein: z.string().optional(),
      // Tax profile
      filingStatus: z.string().optional(),
      state: z.string().optional(),
      selfEmployed: z.boolean().optional(),
      homeOwner: z.boolean().optional(),
      dependents: z.number().optional(),
      autoCategorize: z.boolean().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      await db.update(users)
        .set(input)
        .where(eq(users.id, ctx.user.id));
      return { success: true };
    }),
});

// ─── Billing Router ─────────────────────────────────────────────────────────
const billingRouter = router({
  getSubscription: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return null;
    const result = await db.select({
      subscriptionTier: users.subscriptionTier,
      subscriptionStatus: users.subscriptionStatus,
      stripeCustomerId: users.stripeCustomerId,
      stripeSubscriptionId: users.stripeSubscriptionId,
    }).from(users).where(eq(users.id, ctx.user.id)).limit(1);
    return result[0] || null;
  }),

  createCheckout: protectedProcedure
    .input(z.object({
      priceId: z.string(),
      origin: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const stripe = getStripe();
      const session = await stripe.checkout.sessions.create({
        mode: "subscription",
        payment_method_types: ["card"],
        line_items: [{ price: input.priceId, quantity: 1 }],
        customer_email: ctx.user.email || undefined,
        client_reference_id: ctx.user.id.toString(),
        metadata: {
          user_id: ctx.user.id.toString(),
          customer_email: ctx.user.email || "",
          customer_name: ctx.user.name || "",
        },
        success_url: `${input.origin}/dashboard?subscription=success`,
        cancel_url: `${input.origin}/pricing?canceled=true`,
        allow_promotion_codes: true,
      });
      return { url: session.url };
    }),

  createAlacarteCheckout: protectedProcedure
    .input(z.object({
      itemKey: z.string(),
      origin: z.string(),
      metadata: z.record(z.string(), z.string()).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const stripe = getStripe();
      const item = ALACARTE_ITEMS[input.itemKey as AlacarteKey];
      if (!item) throw new Error("Invalid item");
      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        payment_method_types: ["card"],
        line_items: [{
          price_data: {
            currency: "usd",
            unit_amount: item.amount,
            product_data: { name: item.name },
          },
          quantity: 1,
        }],
        customer_email: ctx.user.email || undefined,
        client_reference_id: ctx.user.id.toString(),
        metadata: {
          user_id: ctx.user.id.toString(),
          item_key: input.itemKey,
          ...input.metadata,
        },
        success_url: `${input.origin}/dashboard?payment=success`,
        cancel_url: `${input.origin}/pricing?canceled=true`,
        allow_promotion_codes: true,
      });
      return { url: session.url };
    }),

  cancelSubscription: protectedProcedure.mutation(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database unavailable");
    const result = await db.select({ stripeSubscriptionId: users.stripeSubscriptionId })
      .from(users).where(eq(users.id, ctx.user.id)).limit(1);
    const subId = result[0]?.stripeSubscriptionId;
    if (!subId) throw new Error("No active subscription");
    const stripe = getStripe();
    await stripe.subscriptions.cancel(subId);
    await db.update(users)
      .set({ subscriptionStatus: "canceled", subscriptionTier: "free", stripeSubscriptionId: null })
      .where(eq(users.id, ctx.user.id));
    return { success: true };
  }),
});

// ─── Promo Codes Router ─────────────────────────────────────────────────────
const promoCodesRouter = router({
  // Admin: generate a new promo code
  generate: protectedProcedure
    .input(z.object({
      label: z.string().optional(),
      maxUses: z.number().min(1).max(100).default(1),
      tierGrant: z.string().default("beta_pro"),
      expiresInDays: z.number().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") throw new Error("Forbidden");
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      const code = `BETA-${nanoid(8).toUpperCase()}`;
      const expiresAt = input.expiresInDays
        ? new Date(Date.now() + input.expiresInDays * 86400000)
        : undefined;
      await db.insert(promoCodes).values({
        code,
        label: input.label,
        tierGrant: input.tierGrant,
        maxUses: input.maxUses,
        usedCount: 0,
        isActive: true,
        createdBy: ctx.user.id,
        expiresAt,
      });
      return { code };
    }),

  // Admin: list all promo codes with redemption info
  adminList: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user.role !== "admin") throw new Error("Forbidden");
    const db = await getDb();
    if (!db) return [];
    const codes = await db.select().from(promoCodes).orderBy(desc(promoCodes.createdAt));
    // For each code, get redemptions
    const results = await Promise.all(codes.map(async (c) => {
      const redemptions = await db
        .select({ userId: promoRedemptions.userId, redeemedAt: promoRedemptions.redeemedAt })
        .from(promoRedemptions)
        .where(eq(promoRedemptions.codeId, c.id));
      return { ...c, redemptions };
    }));
    return results;
  }),

  // Admin: revoke a code
  revoke: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") throw new Error("Forbidden");
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      await db.update(promoCodes).set({ isActive: false }).where(eq(promoCodes.id, input.id));
      return { success: true };
    }),

  // User: redeem a promo code
  redeem: protectedProcedure
    .input(z.object({ code: z.string().min(1).max(64) }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      const normalizedCode = input.code.trim().toUpperCase();
      // Find the code
      const [promoCode] = await db.select().from(promoCodes)
        .where(eq(promoCodes.code, normalizedCode)).limit(1);
      if (!promoCode) throw new Error("Invalid promo code");
      if (!promoCode.isActive) throw new Error("This promo code has been deactivated");
      if (promoCode.expiresAt && promoCode.expiresAt < new Date()) throw new Error("This promo code has expired");
      if (promoCode.usedCount >= promoCode.maxUses) throw new Error("This promo code has reached its usage limit");
      // Check if user already redeemed this code
      const [existing] = await db.select().from(promoRedemptions)
        .where(and(eq(promoRedemptions.codeId, promoCode.id), eq(promoRedemptions.userId, ctx.user.id)))
        .limit(1);
      if (existing) throw new Error("You have already redeemed this code");
      // Apply the tier grant
      await db.update(users)
        .set({ subscriptionTier: promoCode.tierGrant as "free" | "essential" | "pro" | "business", subscriptionStatus: "beta" })
        .where(eq(users.id, ctx.user.id));
      // Record redemption
      await db.insert(promoRedemptions).values({ codeId: promoCode.id, userId: ctx.user.id });
      // Increment used count
      await db.update(promoCodes)
        .set({ usedCount: promoCode.usedCount + 1 })
        .where(eq(promoCodes.id, promoCode.id));
      return { success: true, tierGrant: promoCode.tierGrant, message: `Beta Pro access activated! Welcome to TaxFlow.` };
    }),

  // User: check if they have an active promo redemption
  myRedemption: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return null;
    const [redemption] = await db.select({
      code: promoCodes.code,
      label: promoCodes.label,
      tierGrant: promoCodes.tierGrant,
      redeemedAt: promoRedemptions.redeemedAt,
    })
      .from(promoRedemptions)
      .innerJoin(promoCodes, eq(promoRedemptions.codeId, promoCodes.id))
      .where(eq(promoRedemptions.userId, ctx.user.id))
      .limit(1);
    return redemption || null;
  }),
});

// ─── Mileage Router ──────────────────────────────────────────────────────────
const mileageRouter = router({
  list: protectedProcedure
    .input(z.object({ taxYear: z.number().optional() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return [];
      const year = input.taxYear || new Date().getFullYear();
      return await db.select().from(mileageLogs)
        .where(and(eq(mileageLogs.userId, ctx.user.id), eq(mileageLogs.taxYear, year)))
        .orderBy(desc(mileageLogs.createdAt));
    }),

  create: protectedProcedure
    .input(z.object({
      date: z.string(),
      startLocation: z.string().optional(),
      endLocation: z.string().optional(),
      miles: z.string(),
      purpose: z.string().optional(),
      category: z.enum(["business", "medical", "charity", "personal"]).default("business"),
      taxYear: z.number().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      const year = input.taxYear || new Date().getFullYear();
      await db.insert(mileageLogs).values({
        userId: ctx.user.id,
        taxYear: year,
        date: input.date,
        startLocation: input.startLocation,
        endLocation: input.endLocation,
        miles: input.miles,
        purpose: input.purpose,
        category: input.category,
      });
      return { success: true };
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      await db.delete(mileageLogs)
        .where(and(eq(mileageLogs.id, input.id), eq(mileageLogs.userId, ctx.user.id)));
      return { success: true };
    }),
});

// ─── Home Office Router ───────────────────────────────────────────────────────
const homeOfficeRouter = router({
  get: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return null;
    const [record] = await db.select().from(homeOfficeData)
      .where(eq(homeOfficeData.userId, ctx.user.id)).limit(1);
    return record || null;
  }),

  save: protectedProcedure
    .input(z.object({
      taxYear: z.number().optional(),
      officeSquareFeet: z.string().optional(),
      totalHomeSqFt: z.string().optional(),
      monthlyRentOrMortgage: z.string().optional(),
      monthlyUtilities: z.string().optional(),
      useRegularMethod: z.boolean().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      const year = input.taxYear || new Date().getFullYear();
      const existing = await db.select({ id: homeOfficeData.id }).from(homeOfficeData)
        .where(eq(homeOfficeData.userId, ctx.user.id)).limit(1);
      if (existing.length > 0) {
        await db.update(homeOfficeData)
          .set({ ...input, taxYear: year })
          .where(eq(homeOfficeData.userId, ctx.user.id));
      } else {
        await db.insert(homeOfficeData).values({
          userId: ctx.user.id,
          taxYear: year,
          officeSquareFeet: input.officeSquareFeet,
          totalHomeSqFt: input.totalHomeSqFt,
          monthlyRentOrMortgage: input.monthlyRentOrMortgage,
          monthlyUtilities: input.monthlyUtilities,
          useRegularMethod: input.useRegularMethod ?? true,
        });
      }
      return { success: true };
    }),
});

// ─── Tax Intake Router (public, no account required) ─────────────────────────
const intakeRouter = router({
  create: publicProcedure
    .input(z.object({
      taxYear: z.number(),
      firstName: z.string().optional(),
      middleInitial: z.string().optional(),
      lastName: z.string().optional(),
      email: z.string().email().optional(),
      phone: z.string().optional(),
      dateOfBirth: z.string().optional(),
      ssnLast4: z.string().max(4).optional(),
      streetAddress: z.string().optional(),
      aptSuite: z.string().optional(),
      city: z.string().optional(),
      state: z.string().max(2).optional(),
      zip: z.string().optional(),
      filingStatus: z.enum(["single","married_jointly","married_separately","head_of_household","qualifying_widow"]).optional(),
      spouseFirstName: z.string().optional(),
      spouseLastName: z.string().optional(),
      spouseDob: z.string().optional(),
      spouseSsnLast4: z.string().max(4).optional(),
      dependents: z.any().optional(),
      incomeDocs: z.any().optional(),
      deductions: z.any().optional(),
      donations: z.any().optional(),
      additionalNotes: z.string().max(2000).optional(),
      paymentType: z.enum(["free_consult","basic_filing"]).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      const userId = ctx.user?.id ?? null;
      const result = await db.insert(taxIntakeSubmissions).values({
        userId,
        taxYear: input.taxYear,
        firstName: input.firstName,
        middleInitial: input.middleInitial,
        lastName: input.lastName,
        email: input.email,
        phone: input.phone,
        dateOfBirth: input.dateOfBirth,
        ssnLast4: input.ssnLast4,
        streetAddress: input.streetAddress,
        aptSuite: input.aptSuite,
        city: input.city,
        state: input.state,
        zip: input.zip,
        filingStatus: input.filingStatus,
        spouseFirstName: input.spouseFirstName,
        spouseLastName: input.spouseLastName,
        spouseDob: input.spouseDob,
        spouseSsnLast4: input.spouseSsnLast4,
        dependents: input.dependents ?? [],
        incomeDocs: input.incomeDocs ?? [],
        deductions: input.deductions ?? {},
        donations: input.donations ?? [],
        additionalNotes: input.additionalNotes,
        paymentType: input.paymentType,
        status: "submitted",
      });
      return { success: true, id: (result as any).insertId };
    }),

  aiReview: publicProcedure
    .input(z.object({
      filingStatus: z.string().optional(),
      hasDependents: z.boolean().optional(),
      incomeDocs: z.array(z.object({ type: z.string(), uploaded: z.boolean() })).optional(),
      deductions: z.record(z.string(), z.any()).optional(),
      donations: z.array(z.any()).optional(),
      selfEmployed: z.boolean().optional(),
      hasSpouse: z.boolean().optional(),
    }))
    .mutation(async ({ input }) => {
      const prompt = `You are a tax preparer reviewing a client intake form. Identify any missing or incomplete items.

Filing status: ${input.filingStatus || 'not provided'}
Has dependents: ${input.hasDependents ? 'yes' : 'no'}
Has spouse: ${input.hasSpouse ? 'yes' : 'no'}
Self-employed: ${input.selfEmployed ? 'yes' : 'no'}
Income documents: ${JSON.stringify(input.incomeDocs || [])}
Deductions provided: ${JSON.stringify(input.deductions || {})}
Donations: ${(input.donations || []).length} entries

Return a JSON object with:
- missing: string[] (list of missing required items, e.g. "W-2 not uploaded", "Spouse SSN missing")
- warnings: string[] (optional but recommended items, e.g. "No retirement contributions listed")
- ready: boolean (true if the return looks complete enough to proceed)
- summary: string (1-2 sentence plain English summary for the client)`;

      const response = await invokeLLM({
        messages: [
          { role: "system", content: "You are a professional tax preparer. Return valid JSON only." },
          { role: "user", content: prompt },
        ],
        response_format: { type: "json_object" },
      });
      const raw = response.choices[0]?.message?.content;
      try {
        return JSON.parse(typeof raw === 'string' ? raw : '{}');
      } catch {
        return { missing: [], warnings: [], ready: true, summary: "Your intake looks complete." };
      }
    }),

  adminList: protectedProcedure
    .input(z.object({
      status: z.string().optional(),
      taxYear: z.number().optional(),
      paymentType: z.string().optional(),
    }).optional())
    .query(async ({ ctx, input }) => {
      if (ctx.user.role !== 'admin') throw new Error('Forbidden');
      const db = await getDb();
      if (!db) return [];
      const conditions = [];
      if (input?.status) conditions.push(eq(taxIntakeSubmissions.status, input.status as any));
      if (input?.taxYear) conditions.push(eq(taxIntakeSubmissions.taxYear, input.taxYear));
      if (input?.paymentType) conditions.push(eq(taxIntakeSubmissions.paymentType, input.paymentType as any));
      const query = db.select().from(taxIntakeSubmissions)
        .orderBy(desc(taxIntakeSubmissions.createdAt));
      if (conditions.length > 0) {
        return await db.select().from(taxIntakeSubmissions)
          .where(and(...conditions))
          .orderBy(desc(taxIntakeSubmissions.createdAt));
      }
      return await query;
    }),
  updateStatus: protectedProcedure
    .input(z.object({
      id: z.number(),
      status: z.enum(["draft", "submitted", "in_review", "ready_to_sign", "filed"]),
    }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== 'admin') throw new Error('Forbidden');
      const db = await getDb();
      if (!db) throw new Error('Database unavailable');
      await db.update(taxIntakeSubmissions)
        .set({ status: input.status })
        .where(eq(taxIntakeSubmissions.id, input.id));
      return { success: true };
    }),
  addNote: protectedProcedure
    .input(z.object({
      id: z.number(),
      note: z.string().max(5000),
    }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== 'admin') throw new Error('Forbidden');
      const db = await getDb();
      if (!db) throw new Error('Database unavailable');
      await db.update(taxIntakeSubmissions)
        .set({ preparerNotes: input.note })
        .where(eq(taxIntakeSubmissions.id, input.id));
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
  billing: billingRouter,
  promoCodes: promoCodesRouter,
  mileage: mileageRouter,
  homeOffice: homeOfficeRouter,
  intake: intakeRouter,
});
export type AppRouter = typeof appRouter;
