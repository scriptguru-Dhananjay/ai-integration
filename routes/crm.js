import express from "express";
import { analyzeLead } from "../services/openaicrmService.js";

const router = express.Router();

router.post("/analyze-lead", async (req, res) => {
    const start = Date.now();

    try {
        const result = await analyzeLead(req.body);

        const latencyMs = Date.now() - start;

        res.json({
            ...result,
            latencyMs,
        });
    }
    catch (err) {
        res.status(err.status || 500).json({
            error: err.message || "Internal Server error",
        });
    }

});

export default router;