
import express from "express";
import multer from "multer";
import { setDocument } from "../services/openaidocumentStore.js";

const router = express.Router();
const upload = multer();

router.post(
  "/",
  (req, res, next) => {
    upload.single("file")(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        return res.status(400).json({ error: `Upload error: ${err.message}` });
      }
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      next();
    });
  },
  (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }
      if (!req.file.originalname.toLowerCase().endsWith(".txt")) {
        return res.status(400).json({ error: "Upload only .txt file" });
      }
      const text = req.file.buffer.toString("utf-8").trim();
      if (!text) {
        return res.status(400).json({ error: "File is empty" });
      }
      setDocument(text);
      res.json({ message: "Document stored", characters: text.length });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

export default router;