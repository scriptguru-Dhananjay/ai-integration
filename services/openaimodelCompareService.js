import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const MODELS = [
  { name: "gpt-5-nano", temperature: 1 },
  { name: "gpt-4o-mini", temperature: 0 }
];

const PRICING = {
  "gpt-5-nano": { in: 0.05, out: 0.40 },
  "gpt-4o-mini": { in: 0.15, out: 0.60 }
};

function calcCost(model, usage) {
  const price = PRICING[model];

  return (
    (usage.prompt_tokens * price.in) / 1_000_000 +
    (usage.completion_tokens * price.out) / 1_000_000
  );
}

export async function compareModels(prompts) {

  if (!Array.isArray(prompts) || prompts.length === 0) {
    throw { status: 400, message: "Prompts required" };
  }

  const results = [];
  const summary = {};

  for (const { name: model, temperature } of MODELS) {

    for (const prompt of prompts) {

      const start = Date.now();

      const res = await client.chat.completions.create({
        model,
        temperature,
        messages: [{ role: "user", content: prompt }]
      });

      const latency = Date.now() - start;
      const usage = res.usage;
      const cost = calcCost(model, usage);

      const item = {
        model,
        temperature,
        prompt,
        latencyMs: latency,
        tokens: usage,
        cost,
        output: res.choices[0].message.content
      };

      results.push(item);

   
      if (!summary[model]) {
        summary[model] = {
          requests: 0,
          totalCost: 0,
          totalLatency: 0,
          totalTokens: 0
        };
      }

      summary[model].requests++;
      summary[model].totalCost += cost;
      summary[model].totalLatency += latency;
      summary[model].totalTokens += usage.total_tokens;
    }
  }


  for (const model in summary) {
    const s = summary[model];

    s.avgCost = s.totalCost / s.requests;
    s.avgLatency = s.totalLatency / s.requests;
    s.avgTokens = s.totalTokens / s.requests;
  }

  return {
    count: results.length,
    results,
    summary
  };
}