import express from "express";
import { callOpenAI } from "../services/openaiServices.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({
        error: "Message  required",
      });
    }

    const result = await callOpenAI(message);

    res.json({
      response: result.content,
      tokens: result.tokens,
    });
  } catch (error) {
    res.status(error.status || 500).json({
      error: error.message || "Something wrong",
    });
  }
});

export default router;