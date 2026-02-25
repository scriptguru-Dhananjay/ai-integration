import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function extractStructuredData(text) {
  if (!process.env.OPENAI_API_KEY) {
    throw { status: 500, message: "OpenAI API key is missing" };
  }

  const response = await client.chat.completions.create({
    model: "gpt-4o-mini", 
    temperature: 0,
    messages: [
      {
        role: "system",
        content:
          `Extract name, email, summary, and sentiment from the user's text. Return only valid JSON matching the schema. If a field is not present, use null or empty string as appropriate.
          Sentiment rules:
            - Determine sentiment for the OVERALL text, not just the selected person.
            - If both positive and negative opinions appear, return "neutral".
            - If mostly positive, return "positive".
            - If mostly negative, return "negative".

            Other Rules:
            - If multiple names or emails exist, choose the primary person (usually the sender).
            - If the primary person is unclear, choose the first occurrence.
            - Do NOT return arrays.
            - If a field is missing, use null.
            - Return only valid JSON matching the schema.`,
          
      },
      {
        role: "user",
        content: text,
      },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "extract_schema",
        schema: {
          type: "object",
          additionalProperties: false,
          required: ["name", "email", "summary", "sentiment"],
          properties: {
            name: {
              type: ["string", "null"],
            },
            email: {
              type: ["string", "null"],
            },
            summary: {
              type: "string",
            },
            sentiment: {
              type: "string",
              enum: ["positive", "negative", "neutral"],
            },
          },
        },
      },
    },
  });

  const content = response.choices[0].message.content;

  
  const usage = response.usage || {};
  const tokens = {
    prompt: usage.prompt_tokens || 0,
    completion: usage.completion_tokens || 0,
    total: usage.total_tokens || 0,
  };

  console.log("Tokens usage",tokens);


  let parsed;
  try {
    parsed = JSON.parse(content);
  } catch (err) {
    throw { status: 500, message: "Invalid JSON returned by model" };
  }

 
  validateExtractResponse(parsed);

  return {
    data: parsed,
    tokens,
  };
}

function validateExtractResponse(obj) {
  const allowedSentiments = ["positive", "negative", "neutral"];

  if (typeof obj !== "object" || obj === null) {
    throw { status: 500, message: "Response is not an object" };
  }

  const keys = Object.keys(obj);
  const allowedKeys = ["name", "email", "summary", "sentiment"];

 
  for (const key of keys) {
    if (!allowedKeys.includes(key)) {
      throw { status: 500, message: "Unexpected field in response" };
    }
  }


  if (!allowedKeys.every((k) => k in obj)) {
    throw { status: 500, message: "Missing required fields" };
  }

  if (
    obj.name !== null &&
    typeof obj.name !== "string"
  ) {
    throw { status: 500, message: "Invalid name type" };
  }

  if (
    obj.email !== null &&
    typeof obj.email !== "string"
  ) {
    throw { status: 500, message: "Invalid email type" };
  }

  if (typeof obj.summary !== "string") {
    throw { status: 500, message: "Invalid summary type" };
  }

  if (!allowedSentiments.includes(obj.sentiment)) {
    throw { status: 500, message: "Invalid sentiment value" };
  }
}