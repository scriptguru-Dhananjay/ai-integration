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

