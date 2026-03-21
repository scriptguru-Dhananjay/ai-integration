import OpenAI from "openai";
import { getDocument, hasDocument } from "../services/openaidocumentStore.js";

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

function chunkText(text) {
    return text.split("\n").filter(Boolean).map((t, i) => ({
        id: `c${i + 1}`,
        text: t
    }));
}


async function fetchAdditionalDoc(query) {
    return `Extra info about "${query}": No useful data found.`;
}

const SYSTEM_PROMPT = `
You are a RAG assistant.

Rules:
- First try to answer using the provided context
- If context is insufficient, call the tool
- AFTER receiving tool response:
  - You MUST use the tool result to answer the question
  - Do NOT say "not found" if tool provides useful info
  - Combine context + tool result if needed
- Always return a final helpful answer
`;

export async function askRagWithTool(question) {

  if (!question) throw { status: 400, message: "Question required" };
  if (!hasDocument()) throw { status: 400, message: "No document uploaded" };

  const doc = getDocument();
  const chunks = chunkText(doc);

  const context = chunks
    .map(c => `[${c.id}] ${c.text}`)
    .join("\n");


  const firstResponse = await client.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0,

    messages: [
      {
        role: "system",
        content: SYSTEM_PROMPT
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
    ],

    tools: [
      {
        type: "function",
        function: {
          name: "fetch_additional_doc",
          description: "Fetch extra information if context is insufficient",
          parameters: {
            type: "object",
            properties: {
              query: { type: "string" }
            },
            required: ["query"]
          }
        }
      }
    ],

    tool_choice: "auto"
  });

  const message = firstResponse.choices[0].message;

  const usage1 = firstResponse.usage || {
    prompt_tokens: 0,
    completion_tokens: 0,
    total_tokens: 0
  };


  if (!message.tool_calls) {

    console.log("Tokens usage", {
      prompt: usage1.prompt_tokens,
      completion: usage1.completion_tokens,
      total: usage1.total_tokens
    });

    return {
      answer: message.content,
      toolUsed: false,
      tokens: {
        prompt: usage1.prompt_tokens,
        completion: usage1.completion_tokens,
        total: usage1.total_tokens
      }
    };
  }


  const toolCall = message.tool_calls[0];

  let toolResult;

  try {
    const args = JSON.parse(toolCall.function.arguments);

    if (toolCall.function.name === "fetch_additional_doc") {
      toolResult = await fetchAdditionalDoc(args.query);
    }

  } catch {
    throw { status: 500, message: "Invalid tool args" };
  }

 
  const secondResponse = await client.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0,

    messages: [
      {
        role: "system",
        content: SYSTEM_PROMPT
      },
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


  const usage2 = secondResponse.usage || {
    prompt_tokens: 0,
    completion_tokens: 0,
    total_tokens: 0
  };

  const tokens = {
    prompt: usage1.prompt_tokens + usage2.prompt_tokens,
    completion: usage1.completion_tokens + usage2.completion_tokens,
    total: usage1.total_tokens + usage2.total_tokens
  };

  console.log("Tokens usage", tokens);

  return {
    answer: secondResponse.choices[0].message.content,
    toolUsed: true,
    toolResult,
    tokens
  };
}