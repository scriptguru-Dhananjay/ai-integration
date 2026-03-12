import express from "express";
import { runAgent } from "../services/openaiagentService.js";

const router = express.Router();


router.post("/", async (req, res) => {

    const start = Date.now();

    try{

        const {message} = req.body;

        if(!message){
            return res.status(400).json({
                error : "Field is required"
            });
        }

        const result = await runAgent(message);

        const latencyMs = Date.now() - start;

        res.json({
            ...result,
            latencyMs
        })
    }
    catch(err){
        console.log(err);
        
        res.status(err.status || 500).json({
            error: err.message || "internal server error"
        });
    }

})

export default router;