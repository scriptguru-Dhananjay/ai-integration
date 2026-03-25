const MAX_LENGTH = 100;

export default function validateInput(req, res, next) {


  const { question } = req.body || {};


  if (!req.body) {
    return res.status(400).json({ error: "Request body is missing" });
  }


  if (typeof question !== "string") {
    return res.status(400).json({ error: "Input should be a string" });
  }


  if (!question.trim()) {
    return res.status(400).json({ error: "Input should not be empty" });
  }


  if (question.length > MAX_LENGTH) {
    return res.status(400).json({ error: "Input too long" });
  }

  req.body.question = question.trim();

  next();
}