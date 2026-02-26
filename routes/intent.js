import express from "express";
import { intentDetect } from "../services/openaiIntentService.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({
        error: "Text is required",
      });
    }

    const result = await intentDetect(text);

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(err.status || 500).json({
      error: err.message || "Internal server error",
    });
  }
});

export default router;