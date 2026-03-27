import OpenAI from "openai";
import { createEmbedding } from "./openaiEmbeddingService.js";
import { searchSimilar } from "./openaiVectorStore.js";
import { checkHallucination } from "./openaiHallucinationCheck.js";
import { guardrail } from "./openaiGuardrailService.js";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});


const PRICING = {
    input: 0.00015,
    output: 0.0006,
};

export async function askQuestion(question) {

  if (!process.env.OPENAI_API_KEY) {
    throw { status: 500, message: "OPEN AI key is missing" };
  }

  if (!question || typeof question !== "string") {
    throw { status: 400, message: "question is required" };
  }

 
  if (question.length > 200) {
    throw { status: 400, message: "Question is too long" };
  }

  const queryEmbedding = await createEmbedding(question);

  const topChunks = searchSimilar(queryEmbedding, 3);

  if (!topChunks.length) {
    return {
      answer: "Answer not found in the document.",
      sources: [],
      grounded: true,
      hallucinated: false,
      tokens: { prompt: 0, completion: 0, total: 0 },
    };
  }

    console.log("Top chunks", topChunks);

  const context = topChunks
    .map(
      (c) => `CHUNK_ID: ${c.chunkId}
TEXT: ${c.text}`
    )
    .join("\n\n");


  const response = await guardrail(async (controller) => {

    return await client.chat.completions.create(
      {
        model: "gpt-4o-mini",
        temperature: 0,

        response_format: {
          type: "json_schema",
          json_schema: {
            name: "kb_answer",
            schema: {
              type: "object",
              additionalProperties: false,
              required: ["answer", "sources"],
              properties: {
                answer: { type: "string" },
                sources: {
                  type: "array",
                  items: {
                    type: "object",
                    additionalProperties: false,
                    required: ["chunkId", "snippet"],
                    properties: {
                      chunkId: { type: "string" },
                      snippet: { type: "string" },
                    },
                  },
                },
              },
            },
          },
        },

        messages: [
          {
            role: "system",
            content: `
YYou are a strict knowledge base assistant.

RULES (VERY IMPORTANT):
- Answer ONLY from the provided context
- Do NOT use outside knowledge
- If answer not found, say: "Answer not found in the document."
- Always cite the supporting chunk
- Be concise
            `,
          },
          {
            role: "user",
            content: `
CONTEXT:
${context}

QUESTION:
${question}
            `,
          },
        ],
      },
      {
        signal: controller.signal,
      }
    );

  }, question);

  const usage = response.usage || {};

  const tokens = {
    prompt: usage.prompt_tokens || 0,
    completion: usage.completion_tokens || 0,
    total: usage.total_tokens || 0,
  };

    console.log("Tokens usage", tokens);

     const costUsd =
        (tokens.prompt / 1000) * PRICING.input +
        (tokens.completion / 1000) * PRICING.output;

        console.log("Cost", costUsd);

  const content = response.choices?.[0]?.message?.content || "";
  

  let parsed;

  try {
    parsed = JSON.parse(content);
  } catch {
    throw { status: 500, message: "Invalid JSON from model" };
  }

  if (!Array.isArray(parsed.sources)) {
    throw { status: 500, message: "Invalid sources format" };
  }

  const validChunkIds = new Set(topChunks.map(c => c.chunkId));

  parsed.sources = parsed.sources.filter(src =>
    validChunkIds.has(src.chunkId)
  );

  const hallucinated = checkHallucination(parsed, topChunks);

  return {
    ...parsed,
    grounded: !hallucinated,
    hallucinated,
    tokens,
    costUsd: Number(costUsd.toFixed(6)),
  };
}