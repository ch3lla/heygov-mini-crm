import { describe, it, expect, vi, beforeAll } from "vitest";
import { runAgent } from "../agent/index.js";
import * as executor from "../agent/executor/index.js";

vi.spyOn(executor, "executeCRMTool").mockImplementation(async (userId, name, input) => {
    return { success: true, mocked: true, message: "Tool executed successfully in test" };
});

const TEST_userId = 1; // dummy user id

describe("CRM Agent Intent Evals", () => {

    // TEST CASE 1: Creation Intent
    it("should correctly map 'Add Contact' intent", async () => {
        const query = "Add Alex Smith from HeyGov, his email is alex@heygov.com";
        const response = await runAgent(TEST_userId, query);

        // Assert 1: Did it use the right tool?
        const toolCall = response.toolResults.find(t => t.tool === "create_contact");
        expect(toolCall).toBeDefined();

        // Assert 2: Did it extract the right arguments?
        expect(toolCall?.input).toMatchObject({
            firstName: "Alex",
            lastName: "Smith",
            company: "HeyGov",
            email: "alex@heygov.com"
        });
    }, 20000);

    // TEST CASE 2: Ambiguous Search
    it("should sanitize search queries (removing 'startup')", async () => {
        const query = "Find the person from that startup I met, name starts with S";
        
        const response = await runAgent(TEST_userId, query);

        const toolCall = response.toolResults.find(t => t.tool === "search_contacts");
        expect(toolCall).toBeDefined();
        expect(toolCall?.input.query).not.toContain("startup");
        expect(toolCall?.input.query).toContain("S");
    }, 20000);

    // TEST CASE 3: Search with Date Inference
    it("should correctly infer 'last week' dates", async () => {
        const query = "Who did I add two weeks ago?";
        
        const response = await runAgent(TEST_userId, query);
        const toolCall = response.toolResults.find(t => t.tool === "search_contacts");
        
        expect(toolCall).toBeDefined();
        // Check if dateFrom is a valid YYYY-MM-DD string
        expect(toolCall?.input.dateFrom).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }, 20000);

    // TEST CASE 4: Clarification Rule (Ambiguity)
    it("should ask for clarification instead of acting on ambiguous intent", async () => {
        const query = "I need to email Alex";
        
        const response = await runAgent(TEST_userId, query);

        // console.log("amb response: ", response)

        // Assert: It should NOT call send_email
        const emailCall = response.toolResults.find(t => t.tool === "send_email");
        expect(emailCall).toBeUndefined();

        // Assert: The text reply should ask about reminders vs drafting
        expect(response.message.toLowerCase()).toMatch(/reminder|later|draft/i);
    }, 20000);

    // TEST CASE 5: Send Email Intent
    it("should correctly map 'Send Email' intent", async () => {
        const query = "Send an email to alex@heygov.com with subject 'Meeting' saying 'See you at 5pm'";
        
        const response = await runAgent(TEST_userId, query);

        // console.log("email res: ", response)

        // Assert 1: Did it use the right tool?
        const toolCall = response.toolResults.find(t => t.tool === "send_email");
        expect(toolCall).toBeDefined();

        // Assert 2: Did it extract the right arguments?
        expect(toolCall?.input).toMatchObject({
            recipientEmail: "alex@heygov.com",
            subject: "Meeting",
            body: "See you at 5pm"
        });
    }, 20000);

    // TEST CASE 6: Set Reminder Intent
    it("should correctly map 'Set Reminder' intent", async () => {
        const query = "Remind me to call Alex regarding the contract tomorrow at 10am";
        
        const response = await runAgent(TEST_userId, query);

        // console.log("reminder: ", response)

        // Assert 1: Did it use the right tool?
        const toolCall = response.toolResults.find(t => t.tool === "set_reminder");
        expect(toolCall).toBeDefined();

        // Assert 2: Check arguments
        expect(toolCall?.input).toMatchObject({
            taskDescription: expect.stringMatching(/call Alex/i),
        });
        
        // Assert 3: Date format check (ISO string or YYYY-MM-DD HH:mm)
        // Regex for ISO-like date (YYYY-MM-DD...)
        expect(toolCall?.input.dueDateTime).toMatch(/^\d{4}-\d{2}-\d{2}/);
    }, 20000);

    // TEST CASE 7: Create contact with minimum data
    it("should create contact with ONLY firstName and company", async () => {
        const query = "Add Alex, the CTO from MegaCorp";
        const response = await runAgent(TEST_userId, query);

        const toolCall = response.toolResults.find(t => t.tool === "create_contact");
        
        expect(toolCall).toBeDefined();
        expect(toolCall?.input).toMatchObject({
            firstName: "Alex",
            company: "MegaCorp"
        });
        
        expect(toolCall?.input.email).toBeUndefined();
    }, 20000);
});