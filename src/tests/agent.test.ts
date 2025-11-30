import { describe, it, expect, vi, beforeAll } from "vitest";
import { runAgent } from "../agent/index.ts";
import * as executor from "../agent/executor/index.ts";

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
    }, 20000); // Increase timeout for LLM API calls

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

        // Assert: It should NOT call send_email
        const emailCall = response.toolResults.find(t => t.tool === "send_email");
        expect(emailCall).toBeUndefined();

        // Assert: The text reply should ask about reminders vs drafting
        expect(response.message.toLowerCase()).toContain(/reminder|later/);
    }, 20000);
});