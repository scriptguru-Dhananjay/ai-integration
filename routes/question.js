import express from "express";
import { askDocument } from "../services/openaiDocumentService.js";

const router = express.Router();

router.post("/ask", async (req, res) => {
  const start = Date.now();

  try {
    const { question } = req.body;

    const result = await askDocument(question);

    const latencyMs = Date.now() - start;

    res.json({
      ...result,
      latencyMs,
    });
  } catch (err) {
    res.status(err.status || 500).json({
      error: err.message || "Internal server error",
    });
  }
});

export default router;