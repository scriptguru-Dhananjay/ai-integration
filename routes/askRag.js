import express from "express";
import { askRag } from "../services/openaiSchemaRag.js";
import validateInput from "../middleware/validateInput.js";

const router = express.Router();

router.post("/ask", validateInput, async (req, res) => {
  try {
    const { question } = req.body;

    const result = await askRag(question);

    res.json(result);

  } catch (err) {
    res.status(err.status || 500).json({
      error: err.message
    });
  }
});

export default router;