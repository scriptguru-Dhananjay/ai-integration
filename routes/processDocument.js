import express from "express";
import multer from "multer";
import { chunkText } from "../services/openaiChunkService.js";
import { createEmbedding } from "../services/openaiEmbeddingService.js";
import { addToVectorDB } from "../services/openaiVectorStore.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/", upload.single("file"), async (req, res) => {
    try {

        const text = req.file.buffer.toString("utf-8").trim();
        const chunks = chunkText(text);
        for (const chunk of chunks) {
            const embedding = await createEmbedding(chunk.text);

            addToVectorDB({
                chunkId: chunk.chunkId,
                text: chunk.text,
                embedding,
            });
        }
        res.json({message:"Document stored", chunks: chunks.length});
    }

    catch (err) {
        res.status(500).json({ error: err.message });
    }

})

export default router;