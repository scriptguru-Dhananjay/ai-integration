import express from "express";
import { emailAnalyzeService } from "../services/openaiEmailAnalyzer.js";

const router = express.Router();


router.get("/health", (req, res) => {
    res.status(200).json({
        status: "Live",
        service: "email-intelligence",
    });
});


router.post("/analyze", async (req, res) => {
    const start = Date.now();

    try {

        if (!req.body || typeof req.body !== "object") {
            return res.status(400).json({
                error: "Invalid request body",
            });
        }

        const { email } = req.body;


        if (email === undefined || email === null) {
            return res.status(400).json({
                error: "Email is required",
            });
        }

        if (typeof email !== "string") {
            return res.status(400).json({
                error: "Email must be a string",
            });
        }

        if (email.trim().length === 0) {
            return res.status(400).json({
                error: "Email cannot be empty",
            });
        }

        if (email.length > 5000) {
            return res.status(413).json({
                error: "Email too long (max 5000 characters)",
            });
        }


        const result = await emailAnalyzeService(email);

        const latencyMs = Date.now() - start;


        return res.status(200).json({
            success: true,
            data: result,
            latencyMs,
        });

    } catch (err) {
        const latencyMs = Date.now() - start;

        console.error("/analyze error:", err);


        if (err?.status) {
            return res.status(err.status).json({
                success: false,
                error: err.message,
                latencyMs,
            });
        }


        if (err?.response) {
            return res.status(err.response.status || 502).json({
                success: false,
                error: "AI service error",
                details: err.response.data || null,
                latencyMs,
            });
        }


        if (err?.code === "ETIMEDOUT") {
            return res.status(504).json({
                success: false,
                error: "Request timeout",
                latencyMs,
            });
        }


        return res.status(500).json({
            success: false,
            error: "Internal server error",
            latencyMs,
        });
    }
});

export default router;