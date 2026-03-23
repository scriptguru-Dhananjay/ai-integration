import OpenAI from "openai";
import { getDocument, hasDocument } from "../services/openaidocumentStore.js";
import { searchTool } from "../tools/searchTool.js";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});


function chunkText(text, size = 200) {
  const words = text.split(" ");
  const chunks = [];

  for (let i = 0; i < words.length; i += size) {
    chunks.push({
      id: `c${chunks.length + 1}`,
      text: words.slice(i, i + size).join(" ")
    });
  }

  return chunks;
}


function cosineSimilarity(a, b) {
  const dot = a.reduce((sum, val, i) => sum + val * b[i], 0);
  const magA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  const magB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
  return dot / (magA * magB);
}


const SYSTEM_PROMPT = `
You are a RAG assistant.

Rules:
- First try to answer using the provided context
- If context is insufficient, call the search tool
- AFTER receiving tool response:
  - You MUST use the tool result to answer
  - Extract only relevant facts
  - Do NOT copy raw results blindly
- Always return a helpful final answer
`;


const tools = [
  {
    type: "function",
    function: {
      name: "search",
      description: "Search the web for real-time information",
      parameters: {
        type: "object",
        properties: {
          query: { type: "string" }
        },
        required: ["query"]
      }
    }
  }
];


export async function askRagWithTool(question) {

  if (!question) throw { status: 400, message: "Question required" };
  if (!hasDocument()) throw { status: 400, message: "No document uploaded" };

  const doc = getDocument();
  const chunks = chunkText(doc);


  const chunkEmbeddings = await Promise.all(
    chunks.map(async (c) => {
      const res = await client.embeddings.create({
        model: "text-embedding-3-small",
        input: c.text
      });

      return {
        ...c,
        embedding: res.data[0].embedding
      };
    })
  );


  const queryEmbeddingRes = await client.embeddings.create({
    model: "text-embedding-3-small",
    input: question
  });

  const queryEmbedding = queryEmbeddingRes.data[0].embedding;


  const scoredChunks = chunkEmbeddings.map(c => ({
    ...c,
    score: cosineSimilarity(queryEmbedding, c.embedding)
  }));

  const topChunks = scoredChunks
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  const context = topChunks
    .map(c => `[${c.id}] ${c.text}`)
    .join("\n");


  const firstResponse = await client.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0,

    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: `
Context:
${context}

Question:
${question}
`
      }
    ],

    tools,
    tool_choice: "auto"
  });

  const message = firstResponse.choices[0].message;

  const usage1 = firstResponse.usage || {};


  if (!message.tool_calls) {
    return {
      answer: message.content,
      toolUsed: false,
      sourceChunks: topChunks.map(c => ({
        id: c.id,
        text: c.text
      })),
      tokens: usage1
    };
  }


  const toolCall = message.tool_calls[0];
  let toolResult;

  try {
    const args = JSON.parse(toolCall.function.arguments);

    if (toolCall.function.name === "search") {

      console.log("Tool Query:", args.query);

      const result = await searchTool.invoke(args.query);

      // Clean output
      toolResult = typeof result === "string"
        ? result
        : JSON.stringify(result);

      console.log("Tool Result:", toolResult);
    }

  } catch (err) {
    console.error(err);
    throw { status: 500, message: "Tool execution failed" };
  }


  const secondResponse = await client.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0,

    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: `
Context:
${context}

Question:
${question}
`
      },
      message,
      {
        role: "tool",
        tool_call_id: toolCall.id,
        content: toolResult
      }
    ]
  });

  const usage2 = secondResponse.usage || {};


  return {
    answer: secondResponse.choices[0].message.content,
    toolUsed: true,
    toolResult,
    sourceChunks: topChunks.map(c => ({
      id: c.id,
      text: c.text
    })),
    tokens: {
      prompt: (usage1.prompt_tokens || 0) + (usage2.prompt_tokens || 0),
      completion: (usage1.completion_tokens || 0) + (usage2.completion_tokens || 0),
      total: (usage1.total_tokens || 0) + (usage2.total_tokens || 0)
    }
  };
}