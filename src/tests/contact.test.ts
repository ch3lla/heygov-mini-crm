import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import { app } from "../index.js";
import jwt from "jsonwebtoken";
import * as contactService from "../services/contacts/index.js";

// Mock the entire Contact Service module
vi.mock("../services/contacts/index");

const generateToken = (userId: number) => {
    return jwt.sign({ userId: userId }, process.env.JWT_SECRET || "supersecret", { expiresIn: "1h" });
};

describe("Contacts Routes", () => {
    const userId = 1;
    const validToken = generateToken(userId);

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("POST /api/v1/contacts/add", () => {
        it("should create a contact successfully", async () => {
            // Mock service to return a new response
            const mockContactResponse = {
                id: 101,
                firstName: "Alice",
                lastName: "Wonderland",
                email: "alice@example.com",
                phoneNumber: null,
                company: null,
                userId: 1,
                notes: null,
                tags: [],
                inTrash: false,
                isDeleted: false,
                createdAt: new Date(),
                updatedAt: new Date()
            };
            vi.mocked(contactService.createContact).mockResolvedValue(mockContactResponse);

            const res = await request(app)
                .post("/api/v1/contacts/add")
                .set("Authorization", `Bearer ${validToken}`)
                .send({
                    firstName: "Alice",
                    lastName: "Wonderland",
                    email: "alice@example.com"
                });

            expect(res.status).toBe(201);
            expect(res.body.message).toBe("Contact addedd successfully");
        });

        it("should return 400 if required fields are missing", async () => {
            const res = await request(app)
                .post("/api/v1/contacts/add")
                .set("Authorization", `Bearer ${validToken}`)
                .send({
                    lastName: "NoFirstOrEmail"
                });

            expect(res.status).toBe(400);
            expect(res.body.message).toBe("Required fields are missing");
            // Ensure service was NOT called
            expect(contactService.createContact).not.toHaveBeenCalled();
        });

        it("should return 400 if DB constraint is violated (mocked service throw)", async () => {
            const error = new Error("Constraint");
            (error as any).code = "ER_CHECK_CONSTRAINT_VIOLATED";
            vi.mocked(contactService.createContact).mockRejectedValue(error);

            const res = await request(app)
                .post("/api/v1/contacts/add")
                .set("Authorization", `Bearer ${validToken}`)
                .send({ firstName: "Bob", email: "bob@test.com" });

            expect(res.status).toBe(400);
            expect(res.body.message).toBe("At least one of first name or email must be provided");
        });
    });

    describe("GET /api/v1/contacts/all", () => {
        it("should return list of contacts", async () => {
            const mockContacts = [{ id: 1, firstName: "Alice", userId: 1 }];
            vi.mocked(contactService.getAllContacts).mockResolvedValue(mockContacts as any);

            const res = await request(app)
                .get("/api/v1/contacts/all")
                .set("Authorization", `Bearer ${validToken}`);

            expect(res.status).toBe(200);
            expect(res.body.data).toHaveLength(1);
        });

        it("should return 404 if no contacts found", async () => {
            vi.mocked(contactService.getAllContacts).mockResolvedValue([]);

            const res = await request(app)
                .get("/api/v1/contacts/all")
                .set("Authorization", `Bearer ${validToken}`);

            expect(res.status).toBe(404);
            expect(res.body.message).toBe("Contacts not found");
        });
    });

    describe("GET /api/v1/contacts/:contactId", () => {
        it("should return contact details", async () => {
            const mockContact = { id: 5, firstName: "Bob", userId: 1 };
            vi.mocked(contactService.getContactById).mockResolvedValue(mockContact as any);

            const res = await request(app)
                .get("/api/v1/contacts/5")
                .set("Authorization", `Bearer ${validToken}`);

            expect(res.status).toBe(200);
            expect(res.body.data.id).toBe(5);
        });

        it("should return 404 if contact not found", async () => {
            vi.mocked(contactService.getContactById).mockResolvedValue(null);

            const res = await request(app)
                .get("/api/v1/contacts/999")
                .set("Authorization", `Bearer ${validToken}`);

            expect(res.status).toBe(404);
            expect(res.body.message).toBe("Contact not found");
        });
    });

    describe("PATCH /api/v1/contacts/update/:contactId", () => {
        it("should update contact successfully", async () => {
            const mockUpdatedContact = { 
                id: 1, 
                firstName: "Updated", 
                lastName: "User",
                email: "updated@example.com",
                phoneNumber: "123456789",
                company: "Test Co",
                notes: "Test notes",
                tags: [],
                inTrash: false,
                isDeleted: false,
                createdAt: new Date(),
                updatedAt: new Date(),
                userId: 1 
            };
            vi.mocked(contactService.update).mockResolvedValue(mockUpdatedContact);

            const res = await request(app)
                .patch("/api/v1/contacts/update/1")
                .set("Authorization", `Bearer ${validToken}`)
                .send({ firstName: "Updated" });

            expect(res.status).toBe(200);
            expect(res.body.message).toBe("Contact updated successfully");
        });

        it("should return 404 if service returns false (not found)", async () => {
            vi.mocked(contactService.update).mockResolvedValue(null);

            const res = await request(app)
                .patch("/api/v1/contacts/update/999")
                .set("Authorization", `Bearer ${validToken}`)
                .send({ firstName: "Updated" });

            expect(res.status).toBe(404);
            expect(res.body.message).toBe("Contact not found");
        });
    });

    describe("PATCH /api/v1/contacts/remove/:contactId", () => {
        it("should soft delete contact", async () => {
            vi.mocked(contactService.softDelete).mockResolvedValue(undefined);

            const res = await request(app)
                .patch("/api/v1/contacts/remove/1")
                .set("Authorization", `Bearer ${validToken}`);

            expect(res.status).toBe(204);
        });
    });
});
