import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import { app } from "../index.ts";
import { db } from "../db/index.ts";
import jwt from "jsonwebtoken";

vi.mock("../db");

// Helper to create a valid token
const generateToken = (userId: number) => {
    return jwt.sign({ userId: userId }, process.env.JWT_SECRET || "supersecret", { expiresIn: "1h" });
};

describe("User Routes", () => {
    const validToken = generateToken(1);

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("GET /api/v1/user/profile", () => {
        it("should return user profile when authenticated", async () => {
            const mockUser = { id: 1, firstName: "John", lastName: "Doe", email: "john@test.com", password: "hashed" };
            const mockSelect = { from: vi.fn().mockReturnThis(), where: vi.fn().mockResolvedValue([mockUser]) };
            (db.select as any).mockReturnValue(mockSelect);

            const res = await request(app)
                .get("/api/v1/user/profile")
                .set("Authorization", `Bearer ${validToken}`);

            expect(res.status).toBe(200);
            expect(res.body.data).toHaveProperty("firstName", "John");
            expect(res.body.data).not.toHaveProperty("password"); // Should exclude password
        });

        it("should return 401 if no token provided", async () => {
            const res = await request(app).get("/api/v1/user/profile");
            expect(res.status).toBe(401);
            expect(res.body.message).toBe("Unauthorized");
        });
    });

    describe("PATCH /api/v1/user/profile", () => {
        it("should update user profile successfully", async () => {
            // Mock update chain
            const mockUpdate = { set: vi.fn().mockReturnThis(), where: vi.fn().mockResolvedValue({}) };
            (db.update as any).mockReturnValue(mockUpdate);

            const res = await request(app)
                .patch("/api/v1/user/profile")
                .set("Authorization", `Bearer ${validToken}`)
                .send({ firstName: "UpdatedName" });

            expect(res.status).toBe(200);
            expect(res.body.message).toBe("Profile updated");
        });

        it("should return 400 if no fields to update", async () => {
            const res = await request(app)
                .patch("/api/v1/user/profile")
                .set("Authorization", `Bearer ${validToken}`)
                .send({}); // Empty body

            expect(res.status).toBe(400);
            expect(res.body.message).toBe("No fields to update");
        });
    });
});