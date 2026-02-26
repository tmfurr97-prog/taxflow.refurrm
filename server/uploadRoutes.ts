import express, { Router, Request, Response } from "express";
import multer from "multer";
import { nanoid } from "nanoid";
import { storagePut } from "./storage";
import { getDb } from "./db";
import { returnDocuments, remoteReturns } from "../drizzle/schema";
import { eq, and } from "drizzle-orm";
import { sdk } from "./_core/sdk";

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

export function registerUploadRoutes(app: express.Application) {
  const router = Router();

  // POST /api/upload/return-document
  // Uploads a document for a specific checklist item in a remote return
  router.post(
    "/return-document",
    upload.single("file"),
    async (req: Request, res: Response) => {
      try {
        // Authenticate user
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

        // Verify the return belongs to this user
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

        // Build a safe file key
        const safeFileName = req.file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_");
        const fileKey = `returns/${user.id}/${returnId}/${checklistItemId ?? "misc"}-${nanoid(8)}-${safeFileName}`;

        // Upload to S3
        const { url } = await storagePut(fileKey, req.file.buffer, req.file.mimetype);

        // Save document record to DB
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

  app.use("/api/upload", router);
}
