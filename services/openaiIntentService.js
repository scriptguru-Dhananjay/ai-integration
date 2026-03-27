import OpenAI from "openai";

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

const leads = [];

const PRICING = {
    input: 0.00015,
    output: 0.0006,
};

export async function intentDetect(text) {
    if (!process.env.OPENAI_API_KEY) {
        throw { status: 500, message: "OPEN AI api key is missing" };
    }

    const response = await client.chat.completions.create({
        model: "gpt-4o-mini",
        temperature: 0,
        messages: [
            {
                role: "system",
                content: `
            You are an intent classifier.
            DECISION RULES:
                Call createLead ONLY when the user:
                - wants a demo
                - wants to be contacted
                - shares contact info for follow-up
                - says things like "call me", "reach me", or "I'm interested"

                Do NOT call any tool if the user is just asking questions or chatting.

                FIELD EXTRACTION RULES (when calling createLead):
                - Extract name, email, and company if present
                - The "message" field must be a SHORT summary of the user's intent (max 20 words)
                - Do NOT copy the full user text
                - Do NOT add information not present in the user message
            `,
            },
            {
                role: "user",
                content: text,
            },
        ],
        tools: [
            {
                type: "function",
                function: {
                    name: "createLead",
                    description: 
                    "Called when a user expresses interest in being contacted, wants a demo, or shares their contact information for follow-up.",
                    parameters: {
                        type: "object",
                        additionalProperties: false,
                        required: ["name", "email", "company", "message"],
                        properties: {
                            name: { type: ["string", "null"] },
                            email: { type: ["string", "null"] },
                            company: { type: ["string", "null"] },
                            message: { type: "string" },
                        },
                    },
                },
            },
        ],
        tool_choice: "auto",
    });

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

    const message = response.choices[0].message;

    if (message.tool_calls?.length) {
        const toolCall = message.tool_calls[0];

        if (toolCall.function.name === "createLead") {
            let args;

            try {
                args = JSON.parse(toolCall.function.arguments);
            } catch {
                throw { status: 500, message: "Invalid tool arguments JSON" };
            }

            validateLeadArgs(args);

            leads.push(args);

            return {
                action: "createLead",
                args,
                tokens,
                costUsd: Number(costUsd.toFixed(6)),
            };
        }
    }

    return {
        action: "none",
        tokens,
        costUsd: Number(costUsd.toFixed(6)),
    };
}



function validateLeadArgs(obj) {
  const required = ["name", "email", "company", "message"];

  if (typeof obj !== "object" || obj === null) {
    throw { status: 500, message: "Invalid lead object" };
  }

  if (!required.every((k) => k in obj)) {
    throw { status: 500, message: "Missing lead fields" };
  }

  if (obj.name !== null && typeof obj.name !== "string") {
    throw { status: 500, message: "Invalid name" };
  }

  if (obj.email !== null && typeof obj.email !== "string") {
    throw { status: 500, message: "Invalid email" };
  }

  if (obj.company !== null && typeof obj.company !== "string") {
    throw { status: 500, message: "Invalid company" };
  }

  if (typeof obj.message !== "string") {
    throw { status: 500, message: "Invalid message" };
  }
}