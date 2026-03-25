import express from "express";
import { askRagWithTool } from "../services/openaiRagToolService.js";
import validateInput from "../middleware/validateInput.js";

const router = express.Router();

router.post("/ask-tool", validateInput, async (req, res) => {
  try {
    const { question } = req.body;

    const result = await askRagWithTool(question);

    res.json(result);

  } catch (err) {
    res.status(err.status || 500).json({
      error: err.message
    });
  }
});

export default router;