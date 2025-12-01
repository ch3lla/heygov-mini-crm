import { describe, it, expect, vi, beforeEach } from "vitest";
import { db } from "../db/index.js";
import * as contactService from "../services/contacts/index.js";

vi.mock("../db/index.js", () => ({
    db: {
        select: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        insert: vi.fn().mockReturnThis(),
        values: vi.fn().mockReturnThis(),
        $returningId: vi.fn(),
    }
}));

describe("Advanced CRM Features: Meeting Prep Flow", () => {
    const TEST_USER_ID = 1;
    const TEST_CONTACT_ID = 101;

    beforeEach(() => {
        vi.clearAllMocks();
    });

    // STEP 1: Smart Tagging Verification
    describe("Feature: Smart Tagging via Contact Creation", () => {
        it("should save inferred tags when creating a contact", async () => {

            (db.insert(null as any).values as any).mockReturnValue({
                $returningId: vi.fn().mockResolvedValue([{ id: TEST_CONTACT_ID }])
            });
            const mockCreatedContact = {
                id: TEST_CONTACT_ID,
                firstName: "Sarah",
                tags: ["developer", "vip"]
            };
            
            (db.select as any).mockImplementation(() => ({
                from: () => ({
                    where: () => [mockCreatedContact]
                })
            }));

            const inputData = {
                firstName: "Sarah",
                email: "sarah@tech.com",
                tags: ["developer", "vip"] // Simulated LLM inference
            };

            await contactService.createContact(inputData, TEST_USER_ID);

            // Assert: Check if tags were passed to DB
            expect(db.insert).toHaveBeenCalled();
            expect(db.insert(null as any).values).toHaveBeenCalledWith(
                expect.objectContaining({
                    firstName: "Sarah",
                    tags: ["developer", "vip"]
                })
            );
        });
    });

    // STEP 2: Interaction Logging
    describe("Feature: Log Interaction with Contacts", () => {
        it("should log a call successfully", async () => {

            (db.select as any).mockReturnValue({
                from: () => ({
                    where: () => [{ id: TEST_CONTACT_ID }]
                })
            });
            (db.insert(null as any).values as any).mockResolvedValue([{ insertId: 500 }]);

            const interactionData = {
                contactId: TEST_CONTACT_ID,
                type: "call",
                summary: "Discussed Q4 Roadmap",
                date: new Date().toISOString()
            };

            const result = await contactService.createInteraction(TEST_USER_ID, interactionData.contactId, interactionData.type, interactionData.summary);

            expect(result.success).toBe(true);
            expect(db.insert).toHaveBeenCalled();
            expect(db.insert(null as any).values).toHaveBeenCalledWith(
                expect.objectContaining({
                    userId: TEST_USER_ID,
                    contactId: TEST_CONTACT_ID,
                    type: "call",
                    summary: "Discussed Q4 Roadmap"
                })
            );
        });

        it("should fail if contact does not exist", async () => {
            (db.select as any).mockReturnValue({
                from: () => ({
                    where: () => []
                })
            });

            await expect(
                contactService.createInteraction(TEST_USER_ID,  999, "test", "test")
            ).rejects.toThrow("Contact not found");
        });
    });

    // STEP 3: Meeting Briefing (The Synthesizer)
    describe("Feature: Generate Briefing of Contact", () => {
    it("should aggregate profile, interactions, and reminders", async () => {
        const mockProfile = { id: TEST_CONTACT_ID, firstName: "Sarah", company: "TechCorp" };
        const mockInteractions = [
            { id: 1, type: "call", summary: "Intro call", date: new Date() }
        ];
        const mockReminders = [
            { id: 2, title: "Send Contract", description: "Send to Sarah" }
        ];

        // Create separate chain mocks for each query
        const profileChain = {
            from: vi.fn().mockReturnThis(),
            where: vi.fn().mockResolvedValue([mockProfile])
        };

        const interactionsChain = {
            from: vi.fn().mockReturnThis(),
            where: vi.fn().mockReturnThis(),
            orderBy: vi.fn().mockReturnThis(),
            limit: vi.fn().mockResolvedValue(mockInteractions)
        };

        const remindersChain = {
            from: vi.fn().mockReturnThis(),
            where: vi.fn().mockResolvedValue(mockReminders)
        };

        // Mock db.select() to return different chains in sequence
        (db.select as any)
            .mockReturnValueOnce(profileChain)      // First call: Get Contact
            .mockReturnValueOnce(interactionsChain) // Second call: Get Interactions
            .mockReturnValueOnce(remindersChain);   // Third call: Get Reminders

        // Execute
        const briefing = await contactService.generateBriefing(TEST_USER_ID, TEST_CONTACT_ID);

        // Assert
        expect(briefing.profile).toEqual(mockProfile);
        expect(briefing.history).toHaveLength(1);
        expect(briefing.reminders).toHaveLength(1);
        expect(briefing.history[0]?.summary).toBe("Intro call");
        
        // Ensure all 3 queries were made
        expect(db.select).toHaveBeenCalledTimes(3);
        
        // Verify the chain was called correctly for interactions
        expect(interactionsChain.orderBy).toHaveBeenCalled();
        expect(interactionsChain.limit).toHaveBeenCalledWith(5);
    });
});
});