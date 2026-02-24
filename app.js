import "dotenv/config";
import express from "express";
import chatRoute from "./routes/chat.js";

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Server is running");
});


app.use("/chat", chatRoute);


app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({
    error: "Internal server error",
  });
});

const PORT =  4000;

app.listen(PORT, () => {
  console.log(`Server running on  ${PORT}`);
});