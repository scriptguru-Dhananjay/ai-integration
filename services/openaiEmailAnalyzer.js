import OpenAI from "openai";


const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const PRICING = {
  input: 0.00015,
  output: 0.0006,
};

export async function emailAnalyzeService(text) {


  if (!process.env.OPENAI_API_KEY) {
    throw { status: 500, message: "OpenAI API key is missing" };
  }

  if (text === undefined || text === null) {
    throw { status: 400, message: "Email is required" };
  }

  if (typeof text !== "string") {
    throw { status: 400, message: "Email must be a string" };
  }

  if (text.trim().length === 0) {
    throw { status: 400, message: "Email cannot be empty" };
  }

  if (text.length > 5000) {
    throw { status: 413, message: "Email exceeds 5000 character limit" };
  }

  try {
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0,
      messages: [
        {
          role: "system",
          content: `
Analyze the email and return structured JSON with:
- category: Support | Sales | Spam | General
- intent: Complaint | Inquiry | Request | Feedback
- priority: High | Medium | Low
- tone: formal | neutral | urgent
- summary: one sentence summary
- suggestedReply: professional reply
- entities: extract useful fields like orderId, name, dates if present

Spam Rules:
- Mark as Spam if email contains:
  - fake offers, prizes, lottery, "win money"
  - suspicious links
  - urgency like "act now", "limited time"
  - excessive caps or symbols (!!! $$$)
  - unknown sender asking for sensitive info

- Be strict: If highly suspicious → category = Spam

Rules:
- Always return valid JSON
- If no entity found, return empty object {}
`,
        },
        {
          role: "user",
          content: text,
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "email_analysis",
          schema: {
            type: "object",
            additionalProperties: false,
            required: [
              "category",
              "intent",
              "priority",
              "tone",
              "summary",
              "suggestedReply",
              "entities",
            ],
            properties: {
              category: {
                type: "string",
                enum: ["Support", "Sales", "Spam", "General"],
              },
              intent: {
                type: "string",
                enum: ["Complaint", "Inquiry", "Request", "Feedback"],
              },
              priority: {
                type: "string",
                enum: ["High", "Medium", "Low"],
              },
              tone: {
                type: "string",
                enum: ["formal", "neutral", "urgent"],
              },
              summary: { type: "string" },
              suggestedReply: { type: "string" },
              entities: {
                type: "object",
                additionalProperties: true,
              },
            },
          },
        },
      },
    });


    const usage = response.usage || {};
    const tokens = {
      prompt: usage.prompt_tokens || 0,
      completion: usage.completion_tokens || 0,
      total: usage.total_tokens || 0,
    };  

    console.log("Token Usgae", tokens);

    const costUsd =
      (tokens.prompt / 1000) * PRICING.input +
      (tokens.completion / 1000) * PRICING.output;


      console.log("Token Cost", costUsd);

    const content = response?.choices?.[0]?.message?.content;

    if (!content) {
      throw { status: 502, message: "Empty response from AI service" };
    }

    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch {
      throw { status: 502, message: "Invalid JSON returned by model" };
    }

    validateEmailAnalysis(parsed);

    return {
      ...parsed,
      tokens,
      costUsd: Number(costUsd.toFixed(6)),
    };

  } catch (err) {
    console.error("Email Analyze Error:", err);

    if (err?.status) throw err;

    if (err?.response) {
      throw {
        status: err.response.status || 502,
        message: "AI service error",
      };
    }

    if (err?.code === "ETIMEDOUT") {
      throw {
        status: 504,
        message: "AI request timeout",
      };
    }

    throw {
      status: 500,
      message: "Failed to analyze email",
    };
  }
}

function validateEmailAnalysis(obj) {
  if (!obj || typeof obj !== "object") {
    throw { status: 500, message: "Invalid response object" };
  }

  const enums = {
    category: ["Support", "Sales", "Spam", "General"],
    intent: ["Complaint", "Inquiry", "Request", "Feedback"],
    priority: ["High", "Medium", "Low"],
    tone: ["formal", "neutral", "urgent"],
  };

  for (const [key, values] of Object.entries(enums)) {
    if (!values.includes(obj[key])) {
      throw { status: 500, message: `Invalid ${key}` };
    }
  }

  if (typeof obj.summary !== "string") {
    throw { status: 500, message: "Invalid summary" };
  }

  if (typeof obj.suggestedReply !== "string") {
    throw { status: 500, message: "Invalid suggestedReply" };
  }

  if (typeof obj.entities !== "object") {
    throw { status: 500, message: "Invalid entities object" };
  }
}