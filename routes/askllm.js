import express from "express";
import { handleAsk } from "../services/openaillmService.js";


const router = express.Router();

router.post("/", async(req, res) => {

    const {question} = req.body;

    try{
        const result =  await handleAsk(question);
        res.json(result);
    }
    catch (err){
        res.status(err.status || 500).json({error: err.message});
    }

});

export default router;