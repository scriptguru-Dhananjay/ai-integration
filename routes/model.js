import express from "express";
import { compareModels } from "../services/openaimodelCompareService.js";

const router = express.Router();

router.post("/", async (req, res) => {

  try {

    const { prompts } = req.body;

    const results = await compareModels(prompts);

    res.json({
      count: results.length,
      results
    });

  } catch (err) {

    res.status(err.status || 500).json({
      error: err.message || "Internal Server Error"
    });

  }

});

export default router;