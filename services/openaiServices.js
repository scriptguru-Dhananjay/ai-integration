import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const PRICING = {
    input: 0.00015,
    output: 0.0006,
};

export async function callOpenAI(message) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      throw { status: 500, message: "OpenAI API key is missing" };
    }

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: message,
        },
      ],
      temperature: 0,
    });

    const content = response.choices[0].message.content;

    const usage = response.usage || {};
    const tokens = {
      prompt: usage.prompt_tokens || 0,
      completion: usage.completion_tokens || 0,
      total: usage.total_tokens || 0,
    };

    console.log("Token Usage:", tokens);

     const costUsd =
        (tokens.prompt / 1000) * PRICING.input +
        (tokens.completion / 1000) * PRICING.output;

        console.log("Cost", costUsd);

    return {
      content,
      tokens,
      costUsd: Number(costUsd.toFixed(6)),
    };
  } catch (error) {
    if (error.status === 401) {
      throw { status: 401, message: "Invalid API key" };
    }

    throw {
      status: error.status || 500,
      message: error.message || "OpenAI API error",
    };
  }
}