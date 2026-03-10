
import OpenAI from "openai";

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});


export async function processTicket(rawText) {
    if (!rawText) {
        throw { status: 400, message: "Text required" }
    }

    const response = await client.chat.completions.create({
        model: "gpt-4o-mini",
        temperature: 0,
        response_format: {
            type: "json_schema",
            json_schema: {
                name: "ticket_workflow",
                schema: {
                    type: "object",
                    additionalProperties: false,
                    required: ["company", "person", "product", "issue", "category", "summary"],
                    properties: {
                        company: {
                            type: ["string","null"]
                        },
                        person: {
                            type: ["string","null"]
                        },

                        product: {
                            type: "string",
                        },
                        issue: {
                            type: "string",
                        },
                        category: {
                            type: "string",
                            enum: ["bug", "feature", "question"]
                        },
                        summary: {
                            type: "string"
                        }
                    },
                },
            },
        },
        messages: [
            {
                role: "system",
                content: `
You are an AI support workflow assistant.

Tasks:
1 Extract the PERSON who reported the issue (if mentioned)
2 Extract the COMPANY name (if mentioned)
3 Extract the product mentioned
4 Extract the issue
5 Classify issue as bug, feature, or question
6 Generate a short 1–2 sentence summary

If PERSON or COMPANY are not mentioned, return null.

Return JSON only.
`,
            },
            {
                role: "user",
                content: rawText,
            },
        ],
    });

    const usage = response.usage || {};

    const tokens = {
        prompt: usage.prompt_tokens || 0,
        completion: usage.completion_tokens || 0,
        total: usage.total_tokens || 0,
    }

    console.log("Tokens Usage", tokens);

    const content = response.choices[0].message.content;

    let parsed;

    try {
        parsed = JSON.parse(content);
    }
    catch {
        throw { status: 500, message: "Invalid JSON" };
    }

    return {
        ...parsed,
        tokens,
    }

}