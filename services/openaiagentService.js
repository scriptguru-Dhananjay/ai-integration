import { ChatOpenAI } from "@langchain/openai";
import { createOpenAIFunctionsAgent, AgentExecutor } from "langchain/agents";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { searchTool } from "../tools/searchTool.js";

export async function runAgent(userInput) {

    if (!userInput || typeof userInput !== "string") {
        throw { status: 400, message: "Invalid input message" };
    }

    if (!process.env.OPENAI_API_KEY) {
        throw { status: 400, message: "OPENAI API key is missing" };
    }

    try {

        const tools = [searchTool];

        let token = {
            prompt: 0,
            completion: 0,
            total: 0
        };

        const llm = new ChatOpenAI({
            model: "gpt-4o-mini",
            temperature: 0,
            apiKey: process.env.OPENAI_API_KEY,
            callbacks: [
                {
                    handleLLMEnd(output) {
                        const usage = output?.llmOutput?.tokenUsage;

                        if (usage) {
                            token.prompt += usage.promptTokens || 0;
                            token.completion += usage.completionTokens || 0;
                            token.total += usage.totalTokens || 0;

                            console.log("Token usgae", token);
                        }
                    }
                }
            ]
        });

        const prompt = ChatPromptTemplate.fromMessages([
            [
                "system",
                `You are an AI assistant.
Use tools only if the question requires real-time or external information.
Otherwise answer directly.
Keep answers concise.`
            ],
            ["human", "{input}"],
            ["placeholder", "{agent_scratchpad}"]
        ]);

        const agent = await createOpenAIFunctionsAgent({
            llm,
            tools,
            prompt
        });

        const executor = new AgentExecutor({
            agent,
            tools,
            returnIntermediateSteps: true
        });

        const result = await executor.invoke({
            input: userInput
        });

        console.log("Final Answer:", result.output);
        console.log("Intermediate Steps:", result.intermediateSteps);
        console.log("LLM Output:", result.llmOutput);
        console.log("Agent Result:", JSON.stringify(result, null, 2));

        const toolsUsed =
            result.intermediateSteps?.map(step => step.action.tool) || [];

        return {
            answer: result.output,
            toolsUsed,
            tokens: token
        };

    } catch (err) {
        ƒ

        console.error("Agent failed:", err);

        throw {
            status: err.status || 500,
            message: err.message || "Agent processing failed"
        };
    }
}