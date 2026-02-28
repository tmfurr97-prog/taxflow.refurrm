import express, { Router, Request, Response } from "express";
import multer from "multer";
import { nanoid } from "nanoid";
import { storagePut } from "./storage";
import { getDb } from "./db";
import { returnDocuments, remoteReturns, receipts, users } from "../drizzle/schema";
import { eq, and } from "drizzle-orm";
import { sdk } from "./_core/sdk";
import { invokeLLM } from "./_core/llm";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
  fileFilter: (_req, file, cb) => {
    const allowed = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/heic",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only PDF, image, and Word documents are allowed"));
    }
  },
});

// AI auto-categorization: extract vendor, amount, date, category from filename + any text hint
async function aiCategorizeReceipt(fileName: string, textHint?: string): Promise<{
  vendor: string | null;
  amount: string | null;
  date: string | null;
  category: string;
  description: string;
  isDeductible: boolean;
}> {
  const prompt = `You are a receipt categorization AI. Given a receipt filename and optional text hint, extract:
- vendor (business name, or null if unknown)
- amount (dollar amount as string like "42.50", or null if unknown)
- date (YYYY-MM-DD format, or today's date if unknown)
- category (one of: "Office Supplies", "Meals & Entertainment", "Travel", "Software & Subscriptions", "Equipment", "Professional Services", "Utilities", "Marketing", "Medical", "Personal", "Other")
- description (brief 1-sentence description)
- isDeductible (true if business-related, false if personal)

Filename: "${fileName}"
${textHint ? `Additional context: ${textHint}` : ""}

Return valid JSON only. No markdown.`;

  try {
    const response = await invokeLLM({
      messages: [
        { role: "system", content: "You are a receipt categorization AI. Return valid JSON only." },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_object" },
    });
    const raw = response.choices[0]?.message?.content;
    const content = typeof raw === "string" ? raw : "{}";
    const parsed = JSON.parse(content);
    return {
      vendor: parsed.vendor || null,
      amount: parsed.amount || null,
      date: parsed.date || new Date().toISOString().slice(0, 10),
      category: parsed.category || "Other",
      description: parsed.description || fileName,
      isDeductible: parsed.isDeductible !== false,
    };
  } catch {
    return {
      vendor: null,
      amount: null,
      date: new Date().toISOString().slice(0, 10),
      category: "Other",
      description: fileName,
      isDeductible: true,
    };
  }
}

export function registerUploadRoutes(app: express.Application) {
  const router = Router();

  // POST /api/upload/return-document
  router.post(
    "/return-document",
    upload.single("file"),
    async (req: Request, res: Response) => {
      try {
        let user: Awaited<ReturnType<typeof sdk.authenticateRequest>>;
        try {
          user = await sdk.authenticateRequest(req as any);
        } catch {
          return res.status(401).json({ error: "Unauthorized" });
        }

        if (!req.file) {
          return res.status(400).json({ error: "No file provided" });
        }

        const { returnId, checklistItemId, checklistCategory } = req.body;
        if (!returnId) {
          return res.status(400).json({ error: "returnId is required" });
        }

        const db = await getDb();
        if (!db) return res.status(500).json({ error: "Database unavailable" });

        const [ret] = await db
          .select()
          .from(remoteReturns)
          .where(
            and(
              eq(remoteReturns.id, parseInt(returnId)),
              eq(remoteReturns.userId, user.id)
            )
          )
          .limit(1);

        if (!ret) {
          return res.status(404).json({ error: "Return not found" });
        }

        const safeFileName = req.file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_");
        const fileKey = `returns/${user.id}/${returnId}/${checklistItemId ?? "misc"}-${nanoid(8)}-${safeFileName}`;

        const { url } = await storagePut(fileKey, req.file.buffer, req.file.mimetype);

        const [result] = await db.insert(returnDocuments).values({
          returnId: parseInt(returnId),
          userId: user.id,
          checklistItemId: checklistItemId ?? null,
          checklistCategory: checklistCategory ?? null,
          fileName: req.file.originalname,
          fileUrl: url,
          fileKey,
          fileSize: req.file.size,
          mimeType: req.file.mimetype,
          status: "uploaded",
        });

        return res.json({
          success: true,
          document: {
            id: (result as any).insertId,
            fileName: req.file.originalname,
            fileUrl: url,
            fileKey,
            fileSize: req.file.size,
            mimeType: req.file.mimetype,
            checklistItemId,
            checklistCategory,
          },
        });
      } catch (err: any) {
        console.error("[Upload] Error:", err);
        return res.status(500).json({ error: err.message ?? "Upload failed" });
      }
    }
  );

  // DELETE /api/upload/return-document/:documentId
  router.delete("/return-document/:documentId", async (req: Request, res: Response) => {
    try {
      let user: Awaited<ReturnType<typeof sdk.authenticateRequest>>;
      try {
        user = await sdk.authenticateRequest(req as any);
      } catch {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const db = await getDb();
      if (!db) return res.status(500).json({ error: "Database unavailable" });

      const docId = parseInt(req.params.documentId);
      const [doc] = await db
        .select()
        .from(returnDocuments)
        .where(and(eq(returnDocuments.id, docId), eq(returnDocuments.userId, user.id)))
        .limit(1);

      if (!doc) return res.status(404).json({ error: "Document not found" });

      await db.delete(returnDocuments).where(eq(returnDocuments.id, docId));

      return res.json({ success: true });
    } catch (err: any) {
      return res.status(500).json({ error: err.message ?? "Delete failed" });
    }
  });

  // POST /api/upload/receipt
  // Uploads a receipt to S3, optionally AI auto-categorizes based on user preference
  router.post(
    "/receipt",
    upload.single("file"),
    async (req: Request, res: Response) => {
      try {
        let user: Awaited<ReturnType<typeof sdk.authenticateRequest>>;
        try {
          user = await sdk.authenticateRequest(req as any);
        } catch {
          return res.status(401).json({ error: "Unauthorized" });
        }
        if (!req.file) {
          return res.status(400).json({ error: "No file provided" });
        }
        const db = await getDb();
        if (!db) return res.status(500).json({ error: "Database unavailable" });

        const taxYear = parseInt(req.body.taxYear) || new Date().getFullYear();
        const safeFileName = req.file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_");
        const fileKey = `receipts/${user.id}/${taxYear}/${nanoid(8)}-${safeFileName}`;
        const { url } = await storagePut(fileKey, req.file.buffer, req.file.mimetype);

        // Check user's autoCategorize preference (default true)
        const [userRecord] = await db.select({ autoCategorize: users.autoCategorize })
          .from(users).where(eq(users.id, user.id)).limit(1);
        const shouldAutoCategorize = userRecord?.autoCategorize !== false;

        let vendor = req.body.vendor || null;
        let amount = req.body.amount || null;
        let date = req.body.date || new Date().toISOString().slice(0, 10);
        let category = req.body.category || null;
        let description = req.body.description || req.file.originalname;
        let isDeductible = true;
        let aiSuggested = false;

        // If user has AI auto-categorize on and no manual category provided, run AI
        if (shouldAutoCategorize && !req.body.category) {
          const aiResult = await aiCategorizeReceipt(req.file.originalname, req.body.textHint);
          vendor = vendor || aiResult.vendor;
          amount = amount || aiResult.amount;
          date = date || aiResult.date;
          category = aiResult.category;
          description = aiResult.description;
          isDeductible = aiResult.isDeductible;
          aiSuggested = true;
        }

        if (!category) category = "Uncategorized";

        const [result] = await db.insert(receipts).values({
          userId: user.id,
          taxYear,
          vendor,
          amount,
          date,
          category,
          description,
          imageUrl: url,
          imageKey: fileKey,
          isDeductible,
        });

        return res.json({
          success: true,
          aiSuggested,
          receipt: {
            id: (result as any).insertId,
            fileName: req.file.originalname,
            imageUrl: url,
            fileKey,
            taxYear,
            vendor,
            amount,
            date,
            category,
            description,
            isDeductible,
          },
        });
      } catch (err: any) {
        console.error("[Upload/Receipt] Error:", err);
        return res.status(500).json({ error: err.message ?? "Upload failed" });
      }
    }
  );

  app.use("/api/upload", router);
}
