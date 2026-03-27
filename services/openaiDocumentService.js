import OpenAI from "openai";
import { getDocument, hasDocument } from "./openaiStore.js";

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const PRICING = {
    input: 0.00015,
    output: 0.0006,
}

export async function askDocument(question) {
    if (!process.env.OPENAI_API_KEY) {
        throw { status: 500, message: "OPEN AI key is missing" };
    }

    if (!hasDocument()) {
        throw { status: 500, message: "no doxument uploaded" };
    }

    if (!question || typeof question !== "string") {
        throw { status: 400, message: "question is required" };
    }

    const documentText = getDocument();

    if (documentText.length > 300) {
        throw { status: 400, message: "Document to large" };
    }

    const response = await client.chat.completions.create({
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
                                required: ["snippet"],
                                properties: {                                
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
    You are a strict knowledge base assistant.

    RULES (VERY IMPORTANT):
    - Answer ONLY from the provided document
    - Do NOT use outside knowledge
    - If answer not found, say: "Answer not found in the document."
    - Always cite the supporting text
    - Be concise
            `,
            },
            {
                role: "user",
                content: `
    DOCUMENT:
    ${documentText}

    QUESTION:
    ${question}
            `,
            },
        ],
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

    const content = response.choices[0].message.content;

    let parsed;

    try {
        parsed = JSON.parse(content);
    } catch {
        throw { status: 500, message: "Invalid JSON from model" };
    }


    if (!Array.isArray(parsed.sources)) {
        throw { status: 500, message: "Invalid sources format" };
    }

    return {
        ...parsed,
        tokens,
         costUsd: Number(costUsd.toFixed(6)),
    };
}