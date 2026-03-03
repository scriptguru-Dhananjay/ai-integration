import "dotenv/config";
import express from "express";
import chatRoute from "./routes/chat.js";
import extractRoute from "./routes/extract.js";
import intentRoute from "./routes/intent.js";
import emailRoute from "./routes/email.js";
import uploadRoute from "./routes/upload.js";
import questionRoute from "./routes/question.js";
import askRoute from "./routes/ask.js";
import documentRoute from "./routes/processDocument.js";

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Server is running");
});


app.use("/chat", chatRoute);
app.use("/extract", extractRoute);
app.use("/intent", intentRoute);
app.use("/email", emailRoute);
app.use("/upload", uploadRoute);
app.use("/question", questionRoute);
app.use("/ask", askRoute);
app.use("/processDocument", documentRoute);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({
    error: "Internal server error",
  });
});

const PORT =  process.env.PORT;

app.listen(PORT, () => {
  console.log(`Server running on  ${PORT}`);
});