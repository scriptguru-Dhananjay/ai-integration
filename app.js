import "dotenv/config";
import express from "express";
import rateLimit from "express-rate-limit";
import { connectDB } from "./config/db.js";
import chatRoute from "./routes/chat.js";
import extractRoute from "./routes/extract.js";
import intentRoute from "./routes/intent.js";
import emailRoute from "./routes/email.js";
import uploadRoute from "./routes/upload.js";
import questionRoute from "./routes/question.js";
import askRoute from "./routes/ask.js";
import documentRoute from "./routes/processDocument.js";
import crmRoute from "./routes/crm.js";
import workflowRoute from "./routes/workflow.js";
import agentRoute from "./routes/agent.js";
import modelRoute from "./routes/model.js";
import uploadRouteDoc from "./routes/uploadDoc.js";
import askRagRoute from "./routes/askRag.js";
import ragRoute from "./routes/rag.js";
import askllmRoute from "./routes/askllm.js";


const app = express();
connectDB();  
app.use(express.json());


const limiter = rateLimit({
  windowMs: 30 * 1000,
  max: 3,
  message: "Too many requests"
})

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
app.use("/crm", crmRoute);
app.use("/workflow", workflowRoute);
app.use("/agent",agentRoute);
app.use("/model",modelRoute);
app.use("/uploadDoc", uploadRouteDoc);
app.use("/askRag", askRagRoute);
app.use("/rag",ragRoute);
app.use("/askllm", askllmRoute);

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