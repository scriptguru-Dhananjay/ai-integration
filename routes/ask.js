import express from "express";
import { askQuestion } from "../services/openaiRagService.js";
import validateInput from "../middleware/validateInput.js";

const router = express.Router();

router.post("/",  validateInput, async (req, res) => {
  try {
    const result = await askQuestion(req.body.question);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;