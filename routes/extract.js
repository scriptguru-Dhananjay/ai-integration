import express from "express";
import { extractStructuredData } from "../services/openaiExtractService.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({
        error: "Text is required",
      });
    }
    if (text.length > 100) {
      return res.status(400).json({
        error: "Text too long",
      });
    }

    const result = await extractStructuredData(text);

    res.json({
      data: result.data,
      tokens: result.tokens,
    });
  } catch (err) {
    console.error(err);
    res.status(err.status || 500).json({
      error: err.message || "Internal server error",
    });
  }
});

export default router;