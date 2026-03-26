Day 1:-Make node app  that calls the OpenAI API, returns plain text, and logs token usage for every request.

Endpoints:-https://ai-integration-pgd3.onrender.com/chat

Raw text:-
{
  "message": "hi"
}

Result:-
{"response":"Hello! How can I assist you today?","tokens":{"prompt":8,"completion":9,"total":17}}


Day 2:-Make a node app that takes raw text and returns structured JSON with fields: name, email, summary, sentiment. Use OpenAI structured output (JSON schema) so the response is always valid JSON with no extra fields.

Endpoints:-https://ai-integration-pgd3.onrender.com/extract

Raw text:-
{
    "text": "My name is Dhanannajy email Dhananjay@mail.com nice work"
}

Result:-
{"data":{"name":"Dhanannajy","email":"Dhananjay@mail.com","summary":"nice work","sentiment":"positive"},"tokens":{"prompt":245,"completion":28,"total":273}}


Day 3:-
Make a node app that uses OpenAI function/tool calling: the model detects user intent and returns a structured request to call a mock function (e.g. createLead). Your code then “calls” that mock function (e.g. logs or returns the arguments) and returns a clear result. No free text outside the tool-call structure

Endpoints:-https://ai-integration-pgd3.onrender.com/intent

Raw text:-
{
    "text":"John and Mike here. Contact john@test.com. Service was good."
}

Result:-
{"action":"createLead","args":{"name":"John","email":"john@test.com","company":null,"message":"Contact John for follow-up."},"tokens":{"prompt":241,"completion":33,"total":274}}

Day 4:-Make an AI Email Reply Generator API: input is email text; output is structured (tone, summary, suggested reply). Deploy so it’s callable via HTTP. Document 20 test cases and cost per request.

Endpoint:-https://ai-integration-pgd3.onrender.com/email/analyze

Raw text:-
{
    "email":"Hi support, My account has been locked and I cannot log in. Please help me regain access."

}

Result:-
{"tone":"urgent","summary":"The user is requesting immediate assistance to unlock their account as they are unable to log in.","suggestedReply":"Dear [User's Name],\n\nThank you for reaching out to us. We understand the urgency of your situation and are here to help. Please provide us with your account details so we can assist you in regaining access as quickly as possible.\n\nBest regards,\n[Your Name]\nSupport Team","tokens":{"prompt":120,"completion":94,"total":214},"costUsd":0.000074,"latencyMs":2420}


Day 5: Build a Node.js AI Knowledge Base Assistant where users upload documents and ask questions. The system should return answers strictly from the uploaded documents with the source chunk cited.

Currently, chunking, vector database, and RAG are not used. This is a basic approach to demonstrate file upload and answer extraction from the file.

Testing is limited to small paragraph files (under 300 characters) to avoid heavy load on the LLM.

Endpoints

Upload: https://ai-integration-pgd3.onrender.com/upload

Question: https://ai-integration-pgd3.onrender.com/question/ask


File Upload

Method: POST

Body → form-data

Key: file

Type: file

Currently supports only .txt files.


Ask Question
Body → raw (JSON)

{
  "question": "what is ai assistant do"
}

Sample Result:-
{
  "answer": "The AI Knowledge Base Assistant allows users to upload documents and ask questions. The system answers only from the uploaded document and provides the exact source snippet.",
  "sources": [
    {
      "snippet": "The AI Knowledge Base Assistant allows users to upload documents and ask questions."
    }
  ],
  "tokens": {
    "prompt": 190,
    "completion": 53,
    "total": 243
  },
  "latencyMs": 5865
}


Day 6: Build a Node.js AI Knowledge Base Assistant where users upload documents and ask questions. The system should return answers strictly from the uploaded documents with the source chunk cited.


End-points:-

Upload:-https://ai-integration-pgd3.onrender.com/processDocument

Question:-https://ai-integration-pgd3.onrender.com/ask




File Upload

Method: POST

Body → form-data

Key: file

Type: file

Currently supports only .txt files.


Sample result:-


{ "question":"What does an AI Knowledge Base Assistant allow users to do?" }


Response:-

{"answer":"An AI Knowledge Base Assistant allows users to upload documents and ask questions based strictly on those documents.","sources":[{"chunkId":"chunk_0","snippet":"An AI Knowledge Base Assistant is a system that allows users to upload documents and ask questions based strictly on those documents."}],"grounded":true,"hallucinated":false,"tokens":{"prompt":434,"completion":59,"total":493}}


Day 7:-Implement a guardrail module: input length limit, output schema validation, retry logic for transient failures, and timeout handling. AI knowldege base assistant 


End-points:-

Upload:-https://ai-integration-pgd3.onrender.com/processDocument

Question:-https://ai-integration-pgd3.onrender.com/ask


:-File Upload

Method: POST

Body → form-data

Key: file

Type: file

Currently supports only .txt files.


Sample result:-


{ "question":"What does an AI Knowledge Base Assistant allow users to do?" }


Response:-

{"answer":"An AI Knowledge Base Assistant allows users to upload documents and ask questions based strictly on those documents.","sources":[{"chunkId":"chunk_0","snippet":"An AI Knowledge Base Assistant is a system that allows users to upload documents and ask questions based strictly on those documents."}],"grounded":true,"hallucinated":false,"tokens":{"prompt":434,"completion":59,"total":493}}



:-A guardrail module was implemented in the AI knowldege based assistant to improve system reliability, prevent crashes, and ensure predictable responses when interacting with the LLM. Guardrails protect the API from invalid inputs, unexpected model outputs, and external API failures.

Input Length Validation
Output Schema Validation
Retry Logic
Timeout Handling



Day 8:-

Build an AI CRM Assistant that summarizes lead notes, suggests follow-up actions, and scores lead sentiment. one concrete follow-up, sentiment (positive/neutral/negative). Structured output.

Method POST:-

Endpoints:-https://ai-integration-pgd3.onrender.com/crm/analyze-lead

Example body:-

{
  "name": "Rahul Sharma",
  "company": "TechNova",
  "notes": "Interested in our enterprise plan. Asked about pricing and integration with Salesforce. Said they may finalize next month."
}


Response:-

{"summary":"Rahul Sharma from TechNova is interested in the enterprise plan and inquired about pricing and integration with Salesforce. He mentioned that a decision may be made next month.","suggestedFollowUp":"Send detailed pricing information and integration options with Salesforce to Rahul next week.","sentimentScore":"positive","tokens":{"prompt":158,"completions":61,"total":219},"latencyMs":1522}



Day 9:-Build a multi-step AI workflow: (1) extract data from raw text, (2) classify it, (3) generate a summary, (4) store the result in a DB. Pipeline must complete with > 90% success rate on test set.

Method POST:-

Endpoints:-https://ai-integration-pgd3.onrender.com/workflow/process-ticket

Example:-

body:-


{
"text":"The API documentation link on the help page leads to a 404 error."
}

Response:-
{"success":true,"ticket":{"company":null,"person":null,"product":"API documentation","issue":"The API documentation link on the help page leads to a 404 error.","category":"bug","summary":"The API documentation link on the help page is broken, resulting in a 404 error.","rawText":"The API documentation link on the help page leads to a 404 error.","tokens":{"prompt":182,"completion":56,"total":238},"_id":"69afd4eb5197810e69aac315","createdAt":"2026-03-10T08:23:07.172Z","__v":0},"latencyMs":1529}





Total:-20

Success:- 18

Failed:-2

Success rate:-90%




Two test cases failed:

Missing person in text:
When the text does not contain a person’s name and uses a generic term like "user", the system incorrectly extracts the person as "user" instead of leaving it empty.

Ambiguous classification:
When the text is ambiguous, the system fails to correctly determine whether the request is a feature or a question.

Solution:
Improve the prompt instructions and specify that the person/customer field should be null if no specific person is mentioned in the text. This will help the model avoid assigning generic terms like


Day 10:-Implement an agent pattern using LangChain for Node: an AI that can choose and use at least one tool (e.g. search) and return a final answer


LLM models can’t access real-time or external data on their own. When they need up-to-date information, they call a tool through LangChain. The tool (like a web search) fetches the data, LangChain passes it back to the LLM, and the LLM uses it to generate the response. In this way, LangChain acts as a mediator, bridging the gap between the LLM and external tools.


Working:-



User asks a question requiring real-time information.

LLM (model) checks for context and calls LangChain to use a tool.

LangChain invokes the web search tool, which fetches the data.

The tool returns the data to LangChain.

LangChain feeds this data back to the LLM.

LLM generates the final answer and sends it to the user.

:-Token consumption is higher when a tool is used because the LLM is effectively called three times during this process.



POST Method:-

Endpoint:-https://ai-integration-pgd3.onrender.com/agent





Example:-



body:-
 
User input:-

{
"message":"current weather of new delhi"
}


Resposne:-

{"answer":"The current weather in New Delhi is partly cloudy with a temperature of 33°C (91°F). The wind is blowing from the west-northwest at 12.6 km/h (7.8 mph), and the humidity is at 20%.","toolsUsed":["search"],"tokens":{"prompt":845,"completion":68,"total":913},"latencyMs":6855}



Day 11:-

Compare two GPT models (e.g. gpt-4o vs gpt-4o-mini) on the same set of prompts. Produce comparison report: cost per request, latency, simple quality assessment. Deliver cost/speed/quality table.


Endpoint:-https://ai-integration-pgd3.onrender.com/model


POST method:-


Example:-

body:-



{
"prompts": [
"hello "
]
}


resposne:-


{"results":{"count":2,"results":[{"model":"gpt-5-nano","temperature":1,"prompt":"hello ","latencyMs":2882,"tokens":{"prompt_tokens":8,"completion_tokens":246,"total_tokens":254,"prompt_tokens_details":{"cached_tokens":0,"audio_tokens":0},"completion_tokens_details":{"reasoning_tokens":192,"audio_tokens":0,"accepted_prediction_tokens":0,"rejected_prediction_tokens":0}},"cost":0.0000988,"output":"Hello! How can I help you today? If you’re not sure, tell me what you’re looking for—information, writing help, problem solving, coding, planning, or anything else—and I’ll tailor my answer."},{"model":"gpt-4o-mini","temperature":0,"prompt":"hello ","latencyMs":1226,"tokens":{"prompt_tokens":9,"completion_tokens":9,"total_tokens":18,"prompt_tokens_details":{"cached_tokens":0,"audio_tokens":0},"completion_tokens_details":{"reasoning_tokens":0,"audio_tokens":0,"accepted_prediction_tokens":0,"rejected_prediction_tokens":0}},"cost":0.000006749999999999999,"output":"Hello! How can I assist you today?"}],"summary":{"gpt-5-nano":{"requests":1,"totalCost":0.0000988,"totalLatency":2882,"totalTokens":254,"avgCost":0.0000988,"avgLatency":2882,"avgTokens":254},"gpt-4o-mini":{"requests":1,"totalCost":0.000006749999999999999,"totalLatency":1226,"totalTokens":18,"avgCost":0.000006749999999999999,"avgLatency":1226,"avgTokens":18}}}}






Comparison Note: GPT-5-nano vs GPT-4o-mini

Token Consumption & Cost

GPT-5-nano often uses more tokens than GPT-4o-mini for the same prompt.
Main reason: Nano is less precise and less concise, adds extra explanations, repetitions, and polite/introductory text.
Not due to temperature, reasoning tokens, or mini lacking reasoning.
More tokens → higher cost per request, even if nano’s per-token price is cheaper.

Efficiency

GPT-4o-mini is more efficient per task: compresses information, follows instructions strictly, avoids redundancy.
Nano may produce verbose outputs, making it slower and more expensive in practice.

Instruction Following

Nano may ignore strict instructions (e.g., “Answer in 2 sentences”) -> longer outputs.
Mini obeys output constraints better -> fewer tokens.

Reasoning & Intelligence

Both models are capable of reasoning.

Mini appears more intelligent and precise, nano is faster and lightweight but less concise.

Reasoning tokens alone do not determine output length or cost.


Note: GPT-5 series only supports temperature = 1 and does not support temperature = 0. As a result, GPT-5-nano tends to produce less concise answers with extra explanations, which increases token usage.


Business Case:

GPT-5-nano:

Suitable for high-volume tasks requiring fast responses.

Ideal for internal tools, lightweight automation, and scenarios where verbose or slightly longer outputs are acceptable.

GPT-4o-mini:

Best for simple chatbots and standard customer support.

Efficient for tasks that need concise, accurate, and structured responses.






Day 12:-build node app that every RAG answer is returned in a structured format: answer, confidence (high/medium/low), sources (list of chunk ids or snippets). Validate schema on every response; target 95%+ valid structured output.



Initial testing showed that the system produced hallucinated responses when the answer was not clearly available in the document. After refining the prompt, hallucinations were eliminated.

Now, when the answer is not present in the document, the system correctly returns "Answer not found in the document." Previously, ambiguous questions sometimes triggered hallucinated outputs, but after the prompt fix, the system no longer generates unsupported information.

When the answer exists in the document, the system consistently returns accurate, grounded responses based on the retrieved content.

Overall success rate is greater than 95%.



POST method:-



End-points:-


Upload:-https://ai-integration-pgd3.onrender.com/UploadDoc


Question:-https://ai-integration-pgd3.onrender.com/askRag/ask



:-File Upload


Method: POST


Body → form-data


Key: file


Type: file


Currently supports only .txt files.

Example:-

{ "question":"Documents split into what?" }


Response:-

{"answer":"Documents are split into smaller chunks.","confidence":"high","sources":[{"chunkId":"c3","snippet":"The system works using Retrieval-Augmented Generation (RAG). First, documents are split into smaller chunks."}],"attempts":1}



Day 13:-Combine RAG with function calling: user question to retrieve chunks and pass as context; model can optionally call a tool then produce final answer. 


Endpoint:-

Upload:-https://ai-integration-pgd3.onrender.com/UploadDoc

Question:-https://ai-integration-pgd3.onrender.com/rag/ask-tool


Example:-



:-File Upload

Method: POST

Body → form-data

Key: file

Type: file

Currently supports only .txt files.


{
"message": "Document stored",
"characters": 991
}
 

Sample result:-
 

{
"question": "What should the assistant respond if the answer is not present in the document"
}


Response:-


{"answer":"The assistant should reply: \"Answer not found in the document.\"","toolUsed":false,"tokens":{"prompt":358,"completion":14,"total":372}}



Day 14:-ombine RAG with function calling: user question to retrieve chunks and pass as context; model can optionally call a tool then produce final answer. used proper tool to fetch external information



:-Implemented proper prompt structuring to enable tool calling within the system.

:-Developed initial tool integration using Tavily Search for web-based information retrieval.

:-Configured the system to trigger tool calls when relevant context is not available in the document.

:-Ensured that, in such cases, the tool fetches external information to supplement the response.

Prompt i used:-


You are a RAG assistant.


Rules:
- First try to answer using the provided context
- If context is insufficient, call the search tool
- AFTER receiving tool response:
- You MUST use the tool result to answer
- Extract only relevant facts
- Do NOT copy raw results blindly
- Always return a helpful final answer

 

Endpoint:-

Upload:-https://ai-integration-pgd3.onrender.com/UploadDoc

Question:-https://ai-integration-pgd3.onrender.com/rag/ask-tool


Example:-




:-File Upload


Method: POST


Body → form-data


Key: file


Type: file


Currently supports only .txt files.



{
"message": "Document stored",
"characters": 991
}



Sample result:-


{
"question":"What is an AI Knowledge Base Assistant?"
}


Response:-



{"answer":"An AI Knowledge Base Assistant is a system that allows users to upload documents and ask questions based strictly on those documents. It operates using Retrieval-Augmented Generation (RAG), where documents are split into smaller chunks, converted into embeddings, and stored in a vector database. When a user asks a question, the system retrieves the most relevant chunks using cosine similarity based on the question's embedding. The assistant answers only from the retrieved context, ensuring strict grounding to reduce hallucinations, with a target hallucination rate below 10 percent.","toolUsed":false,"sourceChunks":[{"id":"c1","text":"AI Knowledge Base Assistant\n\nAn AI Knowledge Base Assistant is a system that allows users to upload documents and ask questions based strictly on those documents.\n\nThe system works using Retrieval-Augmented Generation (RAG). First, documents are split into smaller chunks. Each chunk is converted into embeddings and stored in a vector database.\n\nWhen a user asks a question, the system converts the question into an embedding and retrieves the most relevant chunks using cosine similarity.\n\nThe assistant must answer only from the retrieved context. If the answer is not present in the document, the assistant must reply: \"Answer not found in the document.\"\n\nThe system also returns the source chunk ID and snippet used to generate the answer.\n\nStrict grounding is important to reduce hallucinations. The target hallucination rate for the system should be below 10 percent.\n\nThis project typically uses the gpt-4o-mini model for generating answers and text-embedding-3-small for embeddings."}],"tokens":{"prompt_tokens":317,"completion_tokens":106,"total_tokens":423,"prompt_tokens_details":{"cached_tokens":0,"audio_tokens":0},"completion_tokens_details":{"reasoning_tokens":0,"audio_tokens":0,"accepted_prediction_tokens":0,"rejected_prediction_tokens":0}}}




Day 15:-Configure a timeout for LLM calls to ensure the system never hangs. If a timeout occurs, return a cached response (if available) or a degraded response (HTTP 504 or a clear error message). 

Currently, the cache does not expire automatically; it persists until the server is restarted or entries are manually deleted. This setup is intended for testing purposes only. In a production environment, cache entries should expire after a defined time period (TTL) to prevent stale data and manage memory efficiently.

For testing timeout scenarios, a short timeout (e.g., 1 second) is used. This helps simulate timeout errors and ensures the system correctly returns a 504 status response when the LLM call exceeds the allowed time.





Exmaple:-



Endpoint:-https://ai-integration-pgd3.onrender.com/askllm

Sample response:-

Question:-



{
"question": "What is AI assistant"
}


Reposne:-



{"source":"llm","answer":"An AI assistant is a software application that uses artificial intelligence to perform tasks, provide information, or assist users in various activities. These tasks can include answering questions, managing schedules, providing recommendations, and automating repetitive tasks. AI assistants can be found in various forms, such as chatbots, virtual assistants (like Siri or Alexa), and customer service tools. They aim to enhance user experience and improve efficiency through natural language processing and machine learning.","usage":{"prompt_tokens":39,"completion_tokens":88,"total_tokens":127,"prompt_tokens_details":{"cached_tokens":0,"audio_tokens":0},"completion_tokens_details":{"reasoning_tokens":0,"audio_tokens":0,"accepted_prediction_tokens":0,"rejected_prediction_tokens":0}}}



Day 15:-


Implement input and output validation across all RAG workflows. Additionally, test failure scenarios to identify potential crashes, and ensure proper error handling and recovery mechanisms are in place.


In this create middleware for input and output validation and add that validation in all rag and the endpoint will same as before



Day 16:-



Execute a stress test of 100 consecutive requests to the main LLM/RAG endpoint, identify any crashes, hangs, or resource leaks, and ensure the system handles all requests successfully after fixes.

Test Approach
Created a stress test script to send 100 requests (with small concurrency).
Captured:
Status Code
Response Time (Latency)
Errors / Failures
Ran an initial baseline test to identify issues.
Issue Identified
During the baseline run, the system experienced a crash under load.
Root cause:
Improper error handling / resource handling (e.g., timeout, memory, or unhandled promise).
Impact:
Some requests failed and service stability was affected.
Fix Implemented
Added proper:
Error handling
Timeout handling
Resource cleanup (no memory leak)
Ensured:
Service does not crash even under load
All failures are handled as controlled errors