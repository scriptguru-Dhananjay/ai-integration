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









