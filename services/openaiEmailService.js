import OpenAI from "openai";

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});


const PRICING = {
    input: 0.00015,
    output: 0.0006,
};

export async function emailAnalyze(text) {
    if (!process.env.OPENAI_API_KEY) {
        throw { status: 500, message: "OpenAI API key is missing" };
    }


    if (!text || typeof text !== "string") {
        throw { status: 400, message: "Email text is required" };
    }

    if (text.length > 8000) {
        throw { status: 400, message: "Email exceeds 8000 character limit" };
    }

    const response = await client.chat.completions.create({
        model: "gpt-4o-mini",
        temperature: 0,
        messages: [
            {
                role: "system",
                content: `
                    Analyze the email and return:
                    - tone (formal | neutral | urgent)
                    - one sentence summary
                    - suggested professional reply

                    Return only valid JSON matching the schema.
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
                    required: ["tone", "summary", "suggestedReply"],
                    properties: {
                        tone: {
                            type: "string",
                            enum: ["formal", "neutral", "urgent"],
                        },
                        summary: { type: "string" },
                        suggestedReply: { type: "string" },
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
    
    console.log("Toekn Usage:",tokens);

    const costUsd =
        (tokens.prompt / 1000) * PRICING.input +
        (tokens.completion / 1000) * PRICING.output;

        console.log("Cost", costUsd);

    const content = response.choices[0].message.content;

    let parsed;
    try {
        parsed = JSON.parse(content);
    } catch {
        throw { status: 500, message: "Invalid JSON returned by model" };
    }

    validateEmailAnalysis(parsed);

    return {
        ...parsed,
        tokens,
        costUsd: Number(costUsd.toFixed(6)),
    };
}

function validateEmailAnalysis(obj) {
    if (!obj || typeof obj !== "object") {
        throw { status: 500, message: "Invalid response object" };
    }

    const rules = [
        { field: "tone", check: (v) => ["formal", "neutral", "urgent"].includes(v) },
        { field: "summary", check: (v) => typeof v === "string" },
        { field: "suggestedReply", check: (v) => typeof v === "string" },
    ];

    for (const { field, check } of rules) {
        if (!(field in obj) || !check(obj[field])) {
            throw { status: 500, message: `Invalid or missing field: ${field}` };
        }
    }
}