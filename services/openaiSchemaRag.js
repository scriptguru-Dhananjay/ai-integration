import OpenAI from "openai";
import { getDocument, hasDocument } from "./openaidocumentStore.js";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const ragSchema = {
  name: "rag_answer",
  schema: {
    type: "object",
    additionalProperties: false,
    required: ["answer", "confidence", "sources"],
    properties: {
      answer: { type: "string" },
      confidence: {
        type: "string",
        enum: ["high", "medium", "low"]
      },
      sources: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          required: ["chunkId", "snippet"],
          properties: {
            chunkId: { type: "string" },
            snippet: { type: "string" }
          }
        }
      }
    }
  }
};

function chunkText(text) {
  const parts = text.split("\n").filter(Boolean);

  return parts.map((t, i) => ({
    id: `c${i + 1}`,
    text: t
  }));
}

function validateSchema(obj, chunks) {
  if (!obj.answer) throw new Error("Invalid answer");

  if (!["high", "medium", "low"].includes(obj.confidence))
    throw new Error("Invalid confidence");

  const validIds = new Set(chunks.map(c => c.id));

  for (const s of obj.sources) {
    if (!validIds.has(s.chunkId))
      throw new Error("Invalid chunkId");
  }
}

export async function askRag(question) {

  if (!question)
    throw { status: 400, message: "Question required" };

  if (!hasDocument())
    throw { status: 400, message: "No document uploaded" };

  const doc = getDocument();
  const chunks = chunkText(doc);

  const context = chunks
    .map(c => `[${c.id}] ${c.text}`)
    .join("\n");

  let attempts = 0;
  const MAX_RETRY = 2;

  while (attempts <= MAX_RETRY) {

    attempts++;

    try {

      const res = await client.chat.completions.create({
        model: "gpt-4o-mini",
        temperature: 0,
        response_format: {
          type: "json_schema",
          json_schema: ragSchema
        },
        messages: [
          {
            role: "system",
            content: `
Answer ONLY from the context.
Cite chunk IDs in sources.
If not found, say so.
Return JSON only.
`
          },
          {
            role: "user",
            content: `
Context:
${context}

Question:
${question}
`
          }
        ]
      });

      const usage = res.usage || {};
      const tokens = {
        prompt: usage.prompt_tokens || 0,
        completion: usage.completion_tokens || 0,
        total: usage.total_tokens || 0,
      };
      console.log("Tokens usage:", tokens);

      const content = res.choices[0].message.content;
      const parsed = JSON.parse(content);

      validateSchema(parsed, chunks);

      return {
        ...parsed,
        attempts
      };

    } catch (err) {

      console.error("OpenAI error:", err.message);


      if (err.status) {
        throw {
          status: err.status,
          message: err.message
        };
      }


      if (attempts > MAX_RETRY) {
        throw {
          status: 500,
          message: "Model returned invalid output repeatedly"
        };
      }
    }
  }
}