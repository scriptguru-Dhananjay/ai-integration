import OpenAI from "openai";

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function analyzeLead({ name, company, notes }) {
    if (!name || !company || !notes) {
        throw { status: 400, message: "Required filed missing" };
    }

    const response = await client.chat.completions.create({
        model: "gpt-4o-mini",
        temperature: 0,

        response_format: {
            type: "json_schema",
            json_schema: {
                name: "crm_lead_analysis",
                schema: {
                    type: "object",
                    additionalProperties: false,
                    required: ["summary", "suggestedFollowUp", "sentimentScore"],
                    properties: {
                        summary: {
                            type: "string"
                        },
                        suggestedFollowUp: {
                            type: "string"
                        },
                        sentimentScore: {
                            type: "string",
                            enum: ["positive", "neutral", "negative"]
                        },
                    },
                },
            },
        },

        messages: [
            {
                role: "system",
                content: `
You are an AI CRM assistant.

Tasks:
1. Summarize lead notes in 2-3 sentences.
2. Suggest ONE concrete follow-up action.
3. Classify sentiment as: positive, neutral, or negative.

Return structured JSON only.
`,
            },
            {
                role: "user",
                content: `
Lead Information

Name: ${name}
Company: ${company}

Notes:
${notes}
`,
            },
        ],
    });

    const usage = response.usage || {};

    const tokens = {
        prompt: usage.prompt_tokens || 0,
        completions: usage.completion_tokens || 0,
        total: usage.total_tokens || 0,
    };

    console.log("Tokens Usage", tokens);

    const content = response.choices[0].message.content;

    let parsed;

    try {
        parsed = JSON.parse(content);
    } catch {
        throw { status: 500, message: "Invalid json" };
    }

    return {
        ...parsed,
        tokens,
    };
}