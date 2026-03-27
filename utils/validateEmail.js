export default function validateEmailAnalysis(obj) {
  if (!obj || typeof obj !== "object") {
    throw { status: 500, message: "Invalid response object" };
  }

  const enums = {
    category: ["Support", "Sales", "Spam", "General"],
    intent: ["Complaint", "Inquiry", "Request", "Feedback"],
    priority: ["High", "Medium", "Low"],
    tone: ["formal", "neutral", "urgent"],
  };

  for (const [key, values] of Object.entries(enums)) {
    if (!values.includes(obj[key])) {
      throw { status: 500, message: `Invalid ${key}` };
    }
  }

  if (typeof obj.summary !== "string") {
    throw { status: 500, message: "Invalid summary" };
  }

  if (typeof obj.suggestedReply !== "string") {
    throw { status: 500, message: "Invalid suggestedReply" };
  }

  if (typeof obj.entities !== "object") {
    throw { status: 500, message: "Invalid entities object" };
  }
}