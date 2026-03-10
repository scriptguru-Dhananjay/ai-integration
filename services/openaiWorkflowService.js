import Ticket from "../models/ticketmodel.js";

import { processTicket } from "./openaiWorkflowAiService.js";


export async function runWorkflow(rawText) {
    try {
        const result = await processTicket(rawText);

        const ticket = await Ticket.create({
            ...result,
            rawText,
        });

        return {
            success: true,
            ticket,
        };
    }
    catch (error) {
        if (error.status === 401) {
            throw { status: 401, message: "Invalid API key" };
        }

        throw {
            status: error.status || 500,
            message: error.message || "OpenAI API error",
        };
    }


}