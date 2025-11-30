import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import { app } from "../index.ts";
import { db } from "../db/index.ts";
import jwt from "jsonwebtoken";
import * as reminderService from "../services/reminders/index.ts";

vi.mock("../services/reminders/index.ts");
vi.mock("../db/index.ts");

const generateToken = (userId: number) => {
    return jwt.sign({ userId: userId }, process.env.JWT_SECRET || "supersecret", { expiresIn: "1h" });
};

describe("Reminder Controller Unit Tests", () => {
    const userId = 1;
    const validToken = generateToken(userId);
    
    // Sample Data
    const mockReminder = {
        id: 101,
        userId: userId,
        userEmail: "test@example.com",
        title: "Call Alex",
        description: "Discuss project",
        dueDate: "2025-12-05T14:30:00.000Z",
        status: "pending",
        createdAt: new Date(),
        sentAt: null
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("POST /api/v1/reminder/add", () => {
        it("should create a reminder successfully when input is valid", async () => {
            const mockUserSelect = { from: vi.fn().mockReturnThis(), where: vi.fn().mockResolvedValue([{ email: "test@example.com" }]) };
            (db.select as any).mockReturnValue(mockUserSelect);

            vi.mocked(reminderService.createReminder).mockResolvedValue(mockReminder as any);

            const res = await request(app)
                .post("/api/v1/reminder/add")
                .set("Authorization", `Bearer ${validToken}`)
                .send({
                    title: "Call Alex",
                    description: "Discuss project",
                    dueDate: "2025-12-05T14:30:00.000Z"
                });

            expect(res.status).toBe(201);
            expect(res.body).toEqual({
                status: "Success",
                data: JSON.parse(JSON.stringify(mockReminder))
            });
            expect(reminderService.createReminder).toHaveBeenCalledWith(
                expect.objectContaining({
                    title: "Call Alex",
                    userEmail: "test@example.com"
                }), 
                userId
            );
        });

        it("should return 400 if required fields (title) are missing", async () => {
            const mockUserSelect = { from: vi.fn().mockReturnThis(), where: vi.fn().mockResolvedValue([{ email: "test@example.com" }]) };
            (db.select as any).mockReturnValue(mockUserSelect);

            const res = await request(app)
                .post("/api/v1/reminder/add")
                .set("Authorization", `Bearer ${validToken}`)
                .send({
                    dueDate: "2025-12-05T14:30:00.000Z",
                    description: "No title provided"
                });

            expect(res.status).toBe(400);
            expect(res.body.message).toMatch(/Missing required fields/);
            expect(reminderService.createReminder).not.toHaveBeenCalled();
        });

        it("should return 400 if dueDate is missing", async () => {
             const mockUserSelect = { from: vi.fn().mockReturnThis(), where: vi.fn().mockResolvedValue([{ email: "test@example.com" }]) };
            (db.select as any).mockReturnValue(mockUserSelect);

            const res = await request(app)
                .post("/api/v1/reminder/add")
                .set("Authorization", `Bearer ${validToken}`)
                .send({
                    title: "No Date",
                });

            expect(res.status).toBe(400);
        });

        it("should return 500 if the service throws an error", async () => {
            const mockUserSelect = { from: vi.fn().mockReturnThis(), where: vi.fn().mockResolvedValue([{ email: "test@example.com" }]) };
            (db.select as any).mockReturnValue(mockUserSelect);

            vi.mocked(reminderService.createReminder).mockRejectedValue(new Error("Database error"));

            const res = await request(app)
                .post("/api/v1/reminder/add")
                .set("Authorization", `Bearer ${validToken}`)
                .send({
                    title: "Call Alex",
                    dueDate: "2025-12-05T14:30:00.000Z"
                });

            expect(res.status).toBe(500);
            expect(res.body.message).toBe("Database error");
        });
    });

    describe("GET /api/v1/reminder/all", () => {
        it("should return a list of reminders for the authenticated user", async () => {
            const mockList = [mockReminder, { ...mockReminder, id: 102, title: "Second Reminder" }];
            vi.mocked(reminderService.getAllReminders).mockResolvedValue(mockList as any);

            const res = await request(app)
                .get("/api/v1/reminder/all")
                .set("Authorization", `Bearer ${validToken}`);

            expect(res.status).toBe(200);
            expect(res.body.status).toBe("Success");
            expect(res.body.data).toHaveLength(2);
            expect(res.body.data[0].title).toBe("Call Alex");
            expect(reminderService.getAllReminders).toHaveBeenCalledWith(userId);
        });

        it("should return an empty array if no reminders found", async () => {
            vi.mocked(reminderService.getAllReminders).mockResolvedValue([]);

            const res = await request(app)
                .get("/api/v1/reminder/all")
                .set("Authorization", `Bearer ${validToken}`);

            expect(res.status).toBe(200);
            expect(res.body.data).toEqual([]);
        });

        it("should return 401 if token is invalid", async () => {
            const res = await request(app)
                .get("/api/v1/reminder/all")
                .set("Authorization", "Bearer invalid_token");

            expect(res.status).toBe(401);
        });
    });

    describe("GET /api/v1/reminder/:id", () => {
        it("should return a specific reminder if it exists", async () => {
            vi.mocked(reminderService.getReminderById).mockResolvedValue(mockReminder as any);

            const res = await request(app)
                .get("/api/v1/reminder/101")
                .set("Authorization", `Bearer ${validToken}`);

            expect(res.status).toBe(200);
            expect(res.body.data.id).toBe(101);
            expect(reminderService.getReminderById).toHaveBeenCalledWith(101, userId);
        });

        it("should return 404 if reminder is not found", async () => {
            vi.mocked(reminderService.getReminderById).mockResolvedValue(null);

            const res = await request(app)
                .get("/api/v1/reminder/999")
                .set("Authorization", `Bearer ${validToken}`);

            expect(res.status).toBe(404);
            expect(res.body.message).toBe("Reminder not found");
        });

        it("should return 400 for invalid ID parameter", async () => {
            vi.mocked(reminderService.getReminderById).mockResolvedValue(null);

            const res = await request(app)
                .get("/api/v1/reminder/abc") // Invalid ID format
                .set("Authorization", `Bearer ${validToken}`);
            expect(res.status).toBe(404); 
        });
    });

    describe("PATCH /api/v1/reminder/:id", () => {
        it("should update a reminder successfully", async () => {
            vi.mocked(reminderService.updateReminder).mockResolvedValue(true);

            const res = await request(app)
                .patch("/api/v1/reminder/101")
                .set("Authorization", `Bearer ${validToken}`)
                .send({ title: "Updated Title" });

            expect(res.status).toBe(200);
            expect(res.body.message).toBe("Reminder updated");
            expect(reminderService.updateReminder).toHaveBeenCalledWith(101, userId, { title: "Updated Title" });
        });

        it("should return 404 if reminder update fails (not found/no access)", async () => {
            vi.mocked(reminderService.updateReminder).mockResolvedValue(false);

            const res = await request(app)
                .patch("/api/v1/reminder/999")
                .set("Authorization", `Bearer ${validToken}`)
                .send({ title: "Updated Title" });

            expect(res.status).toBe(404);
            expect(res.body.message).toMatch(/not found/);
        });
    });

    describe("DELETE /api/v1/reminder/:id", () => {
        it("should delete a reminder successfully", async () => {
            vi.mocked(reminderService.deleteReminder).mockResolvedValue(true);

            const res = await request(app)
                .delete("/api/v1/reminder/101")
                .set("Authorization", `Bearer ${validToken}`);

            expect(res.status).toBe(200);
            expect(res.body.message).toBe("Reminder deleted");
            expect(reminderService.deleteReminder).toHaveBeenCalledWith(101, userId);
        });

        it("should return 404 if delete fails (not found)", async () => {
            vi.mocked(reminderService.deleteReminder).mockResolvedValue(false);

            const res = await request(app)
                .delete("/api/v1/reminder/999")
                .set("Authorization", `Bearer ${validToken}`);

            expect(res.status).toBe(404);
            expect(res.body.message).toBe("Reminder not found");
        });
    });
});