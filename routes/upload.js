import express from "express";
import multer from "multer";
import { setDocument } from "../services/openaiStore.js";


const router = express.Router();
const upload = multer();

router.post("/",upload.single("file"), (req,res) => {
    try{
        if(!req.file){
            return res.status(400).json({
                error:"no file uploaded",
            });
        }

        if(!req.file.originalname.toLowerCase().endsWith(".txt")){
            return res.status(400).json({
                error:"upload only txt file",
            });
        }

        const text = req.file.buffer.toString("utf-8").trim();

        if(!text){
            return res.status(400).json({
                error:"File is empty"
            });
        }
        setDocument(text);
        res.json({
            message:"text stored",
            characters:text.length,
        });
    }
    catch(err){
        console.log(err);
        res.status(500).json({error:err.message});
    }

})

export default router;