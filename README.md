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