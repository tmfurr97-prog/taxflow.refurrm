import {
  int, mysqlEnum, mysqlTable, text, timestamp,
  varchar, decimal, boolean, json
} from "drizzle-orm/mysql-core";

// ─── Users ───────────────────────────────────────────────────────────────────
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  // Tax profile
  filingStatus: varchar("filingStatus", { length: 32 }),
  state: varchar("state", { length: 2 }),
  selfEmployed: boolean("selfEmployed").default(false),
  homeOwner: boolean("homeOwner").default(false),
  dependents: int("dependents").default(0),
  // Subscription
  subscriptionTier: mysqlEnum("subscriptionTier", ["free", "essential", "pro", "business"]).default("free"),
  subscriptionStatus: varchar("subscriptionStatus", { length: 32 }).default("inactive"),
  stripeCustomerId: varchar("stripeCustomerId", { length: 64 }),
  stripeSubscriptionId: varchar("stripeSubscriptionId", { length: 64 }),
  // Referral
  referralCode: varchar("referralCode", { length: 16 }),
  referredBy: varchar("referredBy", { length: 16 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ─── Tax Documents ────────────────────────────────────────────────────────────
export const taxDocuments = mysqlTable("tax_documents", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  taxYear: int("taxYear").notNull(),
  documentType: varchar("documentType", { length: 32 }).notNull(), // W-2, 1099-NEC, 1099-K, etc.
  fileName: varchar("fileName", { length: 255 }),
  fileUrl: varchar("fileUrl", { length: 1024 }),
  fileKey: varchar("fileKey", { length: 512 }),
  status: mysqlEnum("status", ["pending", "processing", "verified", "rejected"]).default("pending"),
  extractedData: json("extractedData"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// ─── Receipts ─────────────────────────────────────────────────────────────────
export const receipts = mysqlTable("receipts", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  taxYear: int("taxYear").notNull(),
  vendor: varchar("vendor", { length: 255 }),
  amount: decimal("amount", { precision: 10, scale: 2 }),
  date: varchar("date", { length: 32 }),
  category: varchar("category", { length: 64 }),
  description: text("description"),
  imageUrl: varchar("imageUrl", { length: 1024 }),
  imageKey: varchar("imageKey", { length: 512 }),
  isDeductible: boolean("isDeductible").default(true),
  ocrData: json("ocrData"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ─── Mileage Logs ─────────────────────────────────────────────────────────────
export const mileageLogs = mysqlTable("mileage_logs", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  taxYear: int("taxYear").notNull(),
  date: varchar("date", { length: 32 }),
  startLocation: varchar("startLocation", { length: 255 }),
  endLocation: varchar("endLocation", { length: 255 }),
  miles: decimal("miles", { precision: 8, scale: 2 }),
  purpose: varchar("purpose", { length: 255 }),
  category: varchar("category", { length: 64 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ─── Transactions (Bank / Plaid) ──────────────────────────────────────────────
export const transactions = mysqlTable("transactions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  plaidTransactionId: varchar("plaidTransactionId", { length: 128 }),
  accountId: varchar("accountId", { length: 128 }),
  amount: decimal("amount", { precision: 10, scale: 2 }),
  date: varchar("date", { length: 32 }),
  description: varchar("description", { length: 512 }),
  merchantName: varchar("merchantName", { length: 255 }),
  category: varchar("category", { length: 64 }),
  taxCategory: varchar("taxCategory", { length: 64 }),
  isDeductible: boolean("isDeductible").default(false),
  isReviewed: boolean("isReviewed").default(false),
  receiptId: int("receiptId"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ─── Business Entities ────────────────────────────────────────────────────────
export const businessEntities = mysqlTable("business_entities", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  entityName: varchar("entityName", { length: 255 }).notNull(),
  entityType: varchar("entityType", { length: 32 }).notNull(), // LLC, S-Corp, C-Corp, Sole Prop
  ein: varchar("ein", { length: 20 }),
  state: varchar("state", { length: 2 }),
  formationDate: varchar("formationDate", { length: 32 }),
  registeredAgent: varchar("registeredAgent", { length: 255 }),
  status: mysqlEnum("status", ["active", "inactive", "dissolved"]).default("active"),
  complianceData: json("complianceData"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// ─── Quarterly Tax Payments ───────────────────────────────────────────────────
export const quarterlyPayments = mysqlTable("quarterly_payments", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  taxYear: int("taxYear").notNull(),
  quarter: int("quarter").notNull(), // 1-4
  dueDate: varchar("dueDate", { length: 32 }),
  estimatedAmount: decimal("estimatedAmount", { precision: 10, scale: 2 }),
  paidAmount: decimal("paidAmount", { precision: 10, scale: 2 }),
  paidDate: varchar("paidDate", { length: 32 }),
  confirmationNumber: varchar("confirmationNumber", { length: 64 }),
  status: mysqlEnum("status", ["upcoming", "due", "paid", "overdue"]).default("upcoming"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ─── Crypto Transactions ──────────────────────────────────────────────────────
export const cryptoTransactions = mysqlTable("crypto_transactions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  taxYear: int("taxYear").notNull(),
  asset: varchar("asset", { length: 32 }),
  transactionType: varchar("transactionType", { length: 32 }), // buy, sell, trade, earn
  quantity: decimal("quantity", { precision: 18, scale: 8 }),
  priceUsd: decimal("priceUsd", { precision: 18, scale: 2 }),
  totalUsd: decimal("totalUsd", { precision: 18, scale: 2 }),
  costBasis: decimal("costBasis", { precision: 18, scale: 2 }),
  gainLoss: decimal("gainLoss", { precision: 18, scale: 2 }),
  holdingPeriod: varchar("holdingPeriod", { length: 16 }), // short, long
  exchange: varchar("exchange", { length: 64 }),
  date: varchar("date", { length: 32 }),
  txHash: varchar("txHash", { length: 128 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ─── Audit Defense ────────────────────────────────────────────────────────────
export const auditItems = mysqlTable("audit_items", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  taxYear: int("taxYear").notNull(),
  irsNoticeType: varchar("irsNoticeType", { length: 64 }),
  noticeDate: varchar("noticeDate", { length: 32 }),
  responseDeadline: varchar("responseDeadline", { length: 32 }),
  status: mysqlEnum("status", ["open", "in_progress", "resolved", "closed"]).default("open"),
  description: text("description"),
  documentUrl: varchar("documentUrl", { length: 1024 }),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// ─── Backups ──────────────────────────────────────────────────────────────────
export const backups = mysqlTable("backups", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  backupType: varchar("backupType", { length: 32 }), // full, receipts, documents
  fileUrl: varchar("fileUrl", { length: 1024 }),
  fileKey: varchar("fileKey", { length: 512 }),
  fileSize: int("fileSize"),
  status: mysqlEnum("status", ["creating", "ready", "failed"]).default("creating"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ─── Notary Sessions ──────────────────────────────────────────────────────────
export const notarySessions = mysqlTable("notary_sessions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  sessionType: varchar("sessionType", { length: 32 }).notNull(), // RON, general
  serviceType: varchar("serviceType", { length: 64 }), // acknowledgment, jurat, etc.
  scheduledAt: timestamp("scheduledAt"),
  completedAt: timestamp("completedAt"),
  status: mysqlEnum("status", ["scheduled", "in_progress", "completed", "cancelled"]).default("scheduled"),
  documentName: varchar("documentName", { length: 255 }),
  documentUrl: varchar("documentUrl", { length: 1024 }),
  documentKey: varchar("documentKey", { length: 512 }),
  signerName: varchar("signerName", { length: 255 }),
  signerEmail: varchar("signerEmail", { length: 320 }),
  witnessRequired: boolean("witnessRequired").default(false),
  price: decimal("price", { precision: 8, scale: 2 }),
  notes: text("notes"),
  meetingLink: varchar("meetingLink", { length: 512 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// ─── TaxGPT Chat History ──────────────────────────────────────────────────────
export const chatMessages = mysqlTable("chat_messages", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  sessionId: varchar("sessionId", { length: 64 }),
  role: mysqlEnum("role", ["user", "assistant", "system"]).notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ─── Remote Returns (Human-Assisted Filing) ─────────────────────────────────
export const remoteReturns = mysqlTable("remote_returns", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  taxYear: int("taxYear").notNull(),
  // Client info snapshot
  clientName: varchar("clientName", { length: 255 }),
  clientEmail: varchar("clientEmail", { length: 320 }),
  filingStatus: varchar("filingStatus", { length: 32 }),
  state: varchar("state", { length: 2 }),
  // Checklist progress (stored as JSON: { [itemId]: 'not_started' | 'uploaded' | 'na' })
  checklistProgress: json("checklistProgress"),
  checklistCompletePct: int("checklistCompletePct").default(0),
  // Client notes to preparer
  clientNotes: text("clientNotes"),
  // Preparer notes back to client
  preparerNotes: text("preparerNotes"),
  // Return status workflow
  status: mysqlEnum("status", [
    "draft",           // Client started checklist
    "submitted",       // Client submitted for review
    "docs_received",   // Preparer confirmed all docs
    "in_review",       // Preparer actively working
    "ready_to_sign",   // Return complete, awaiting signature
    "filed",           // E-filed with IRS
    "rejected"         // IRS rejected, needs correction
  ]).default("draft"),
  // New client flag (no prior filing history with us)
  isNewClient: boolean("isNewClient").default(true),
  // Pricing
  quotedPrice: decimal("quotedPrice", { precision: 8, scale: 2 }),
  paidAt: timestamp("paidAt"),
  // Completed return
  completedReturnUrl: varchar("completedReturnUrl", { length: 1024 }),
  completedReturnKey: varchar("completedReturnKey", { length: 512 }),
  efileConfirmation: varchar("efileConfirmation", { length: 64 }),
  filedAt: timestamp("filedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type RemoteReturn = typeof remoteReturns.$inferSelect;
export type InsertRemoteReturn = typeof remoteReturns.$inferInsert;

// ─── Return Documents (files uploaded for a remote return) ───────────────────
export const returnDocuments = mysqlTable("return_documents", {
  id: int("id").autoincrement().primaryKey(),
  returnId: int("returnId").notNull(),
  userId: int("userId").notNull(),
  // Which checklist item this satisfies
  checklistItemId: varchar("checklistItemId", { length: 64 }),
  checklistCategory: varchar("checklistCategory", { length: 64 }),
  // File info
  fileName: varchar("fileName", { length: 255 }).notNull(),
  fileUrl: varchar("fileUrl", { length: 1024 }).notNull(),
  fileKey: varchar("fileKey", { length: 512 }).notNull(),
  fileSize: int("fileSize"),
  mimeType: varchar("mimeType", { length: 128 }),
  // Preparer review
  status: mysqlEnum("status", ["uploaded", "verified", "needs_reupload"]).default("uploaded"),
  preparerComment: text("preparerComment"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ReturnDocument = typeof returnDocuments.$inferSelect;
export type InsertReturnDocument = typeof returnDocuments.$inferInsert;

// ─── E-File Submissions ───────────────────────────────────────────────────────
// ─── SmartBooks Academy Tables ──────────────────────────────────────────────
export const academyCourses = mysqlTable("academy_courses", {
  id: int("id").autoincrement().primaryKey(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  title: text("title").notNull(),
  description: text("description"),
  track: varchar("track", { length: 64 }).notNull(), // gig_worker | freelancer | bookkeeping | business
  icon: varchar("icon", { length: 64 }),
  isPremium: int("isPremium").default(0).notNull(), // 0=free, 1=premium
  sortOrder: int("sortOrder").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const academyLessons = mysqlTable("academy_lessons", {
  id: int("id").autoincrement().primaryKey(),
  courseId: int("courseId").notNull(),
  slug: varchar("slug", { length: 100 }).notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(), // markdown content
  duration: varchar("duration", { length: 32 }), // e.g. "5 min"
  isPremium: int("isPremium").default(0).notNull(),
  upsellType: varchar("upsellType", { length: 64 }), // remote_returns | notary | upgrade
  sortOrder: int("sortOrder").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const academyProgress = mysqlTable("academy_progress", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  lessonSlug: varchar("lessonSlug", { length: 100 }).notNull(),
  completedAt: timestamp("completedAt").defaultNow().notNull(),
});

export const leadMagnets = mysqlTable("lead_magnets", {
  id: int("id").autoincrement().primaryKey(),
  email: varchar("email", { length: 320 }).notNull(),
  name: varchar("name", { length: 255 }),
  source: varchar("source", { length: 64 }).default("academy"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ─── Promo Codes (Beta Access) ───────────────────────────────────────────────
export const promoCodes = mysqlTable("promo_codes", {
  id: int("id").autoincrement().primaryKey(),
  code: varchar("code", { length: 32 }).notNull().unique(),
  label: varchar("label", { length: 128 }), // e.g. "Beta Tester - Jane"
  tierGrant: varchar("tierGrant", { length: 32 }).notNull().default("beta_pro"),
  maxUses: int("maxUses").notNull().default(1),
  usedCount: int("usedCount").notNull().default(0),
  expiresAt: timestamp("expiresAt"),
  isActive: boolean("isActive").notNull().default(true),
  createdBy: int("createdBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type PromoCode = typeof promoCodes.$inferSelect;
export type InsertPromoCode = typeof promoCodes.$inferInsert;

export const promoRedemptions = mysqlTable("promo_redemptions", {
  id: int("id").autoincrement().primaryKey(),
  codeId: int("codeId").notNull(),
  userId: int("userId").notNull(),
  redeemedAt: timestamp("redeemedAt").defaultNow().notNull(),
});
export type PromoRedemption = typeof promoRedemptions.$inferSelect;

export const efileSubmissions = mysqlTable("efile_submissions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  taxYear: int("taxYear").notNull(),
  submissionType: varchar("submissionType", { length: 32 }), // federal, state
  stateCode: varchar("stateCode", { length: 2 }),
  status: mysqlEnum("status", ["draft", "validating", "submitted", "accepted", "rejected"]).default("draft"),
  confirmationNumber: varchar("confirmationNumber", { length: 64 }),
  submittedAt: timestamp("submittedAt"),
  acceptedAt: timestamp("acceptedAt"),
  rejectionReason: text("rejectionReason"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
