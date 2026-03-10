import express from "express";
import { runWorkflow } from "../services/openaiWorkflowService.js";


const router = express.Router();

router.post("/process-ticket", async (req, res) => {

    const start = Date.now();

    try {

        const { text } = req.body;

        const result = await runWorkflow(text);


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