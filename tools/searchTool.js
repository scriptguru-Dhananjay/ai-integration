import { TavilySearchResults } from "@langchain/community/tools/tavily_search";

if (!process.env.TAVILY_API_KEY) {
  throw new Error("Tavily API key is missing");
}

const tool = new TavilySearchResults({
  apiKey: process.env.TAVILY_API_KEY,
  maxResults: 3
});


tool.name = "search";

export const searchTool = tool;