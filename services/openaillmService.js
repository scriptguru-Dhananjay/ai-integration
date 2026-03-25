import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const cache = new Map();
const inFlight = new Map();

async function callLLM(question) {
  const prompt = `
You are a helpful AI assistant.
Answer clearly and concisely.

Question: ${question}
`;

  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0,
    messages: [
      { role: "system", content: "You are a helpful assistant." },
      { role: "user", content: prompt }
    ]
  });

  const answer = response.choices[0].message.content;

  const usage = response.usage || {};

  console.log("LLM CALL");
  console.log("Prompt Tokens:", usage.prompt_tokens);
  console.log("Completion Tokens:", usage.completion_tokens);
  console.log("Total Tokens:", usage.total_tokens);

  return {
    answer,
    usage
  };
}

function withTimeout(promise, ms) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("TIMEOUT")), ms);

    promise
      .then((res) => {
        clearTimeout(timer);
        resolve(res);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });
}

export async function handleAsk(question) {
  
  if (cache.has(question)) {
    console.log("CACHE HIT");
    return {
      source: "cache",
      answer: cache.get(question).answer,
      usage: cache.get(question).usage || null
    };
  }

 
  if (inFlight.has(question)) {
    console.log("IN-FLIGHT REQUEST");
    const result = await inFlight.get(question);
    return { source: "in-flight", ...result };
  }

  try {
    console.log("CALLING LLM...");

    const request = withTimeout(callLLM(question), 8000);
    inFlight.set(question, request);

    const result = await request;

    cache.set(question, result);
    inFlight.delete(question);

    return {
      source: "llm",
      ...result
    };

  } catch (err) {
    inFlight.delete(question);

    if (err.message === "TIMEOUT") {
      console.log("TIMEOUT OCCURRED");

      if (cache.has(question)) {
        console.log("FALLBACK CACHE USED");
        return {
          source: "fallback-cache",
          answer: cache.get(question).answer,
          usage: cache.get(question).usage || null
        };
      }

      throw { status: 504, message: "Timeout" };
    }

    console.log("LLM ERROR:", err.message);
    throw { status: 500, message: "LLM Error" };
  }
}