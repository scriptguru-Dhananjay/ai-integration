import express from "express";
import { emailAnalyze } from "../services/openaiEmailService.js";

const router = express.Router();

router.post("/analyze", async (req, res) => {
  const start = Date.now();

  try {
    const { email } = req.body;

    const result = await emailAnalyze(email);

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