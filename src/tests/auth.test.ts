import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import { app } from "../index.ts"; // Ensure app is exported from src/index.ts
import { db } from "../db/index.ts";
import bcrypt from "bcryptjs";

// Mock Database and Bcrypt
vi.mock("../db");
vi.mock("bcryptjs");

describe("Authentication Routes", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("POST /api/v1/auth/register", () => {
        it("should register a user successfully and return a token", async () => {
            // Mock DB: Check existing user (return empty) -> Insert user (return ID)
            const mockSelect = { from: vi.fn().mockReturnThis(), where: vi.fn().mockResolvedValue([]) };
            const mockInsert = { values: vi.fn().mockReturnThis(), $returningId: vi.fn().mockResolvedValue([ { id: 1 } ]) };
            
            (db.select as any).mockReturnValue(mockSelect);
            (db.insert as any).mockReturnValue(mockInsert);
            (bcrypt.hash as any).mockResolvedValue("hashed_password");

            const res = await request(app).post("/api/v1/auth/register").send({
                firstName: "Test",
                lastName: "User",
                email: "test@example.com",
                password: "password123",
                confirmPassword: "password123",
                phoneNumber: "1234567890"
            });

            expect(res.status).toBe(200);
            expect(res.body.status).toBe("Success");
            expect(res.body.data).toBeDefined(); // The JWT Token
        });

        it("should fail if passwords do not match", async () => {
            // Mock DB to return empty (user doesn't exist)
            const mockSelect = { from: vi.fn().mockReturnThis(), where: vi.fn().mockResolvedValue([]) };
            (db.select as any).mockReturnValue(mockSelect);

            const res = await request(app).post("/api/v1/auth/register").send({
                firstName: "Test",
                lastName: "User",
                email: "test@example.com",
                password: "password123",
                confirmPassword: "wrongpassword",
            });

            expect(res.status).toBe(400);
            expect(res.body.message).toBe("Passwords do not match");
        });

        it("should fail if email already exists", async () => {
            // Mock DB to return an existing user
            const mockSelect = { from: vi.fn().mockReturnThis(), where: vi.fn().mockResolvedValue([{ id: 1 }]) };
            (db.select as any).mockReturnValue(mockSelect);

            const res = await request(app).post("/api/v1/auth/register").send({
                firstName: "Test",
                lastName: "User",
                email: "existing@example.com",
                password: "password123",
                confirmPassword: "password123",
            });

            expect(res.status).toBe(400);
            expect(res.body.message).toBe("This email already belongs to an account");
        });
    });

    describe("POST /api/v1/auth/login", () => {
        it("should login successfully with valid credentials", async () => {
            // Mock DB to find user
            const mockUser = { id: 1, email: "test@example.com", password: "hashed_password" };
            const mockSelect = { from: vi.fn().mockReturnThis(), where: vi.fn().mockResolvedValue([mockUser]) };
            (db.select as any).mockReturnValue(mockSelect);
            
            // Mock Bcrypt compare to true
            (bcrypt.compare as any).mockResolvedValue(true);

            const res = await request(app).post("/api/v1/auth/login").send({
                email: "test@example.com",
                password: "password123"
            });

            expect(res.status).toBe(200);
            expect(res.body.status).toBe("Success");
            expect(res.body.data).toBeDefined();
        });

        it("should fail with invalid credentials", async () => {
            const mockUser = { id: 1, email: "test@example.com", password: "hashed_password" };
            const mockSelect = { from: vi.fn().mockReturnThis(), where: vi.fn().mockResolvedValue([mockUser]) };
            (db.select as any).mockReturnValue(mockSelect);
            
            // Mock Bcrypt compare to false
            (bcrypt.compare as any).mockResolvedValue(false);

            const res = await request(app).post("/api/v1/auth/login").send({
                email: "test@example.com",
                password: "wrongpassword"
            });

            expect(res.status).toBe(401);
            expect(res.body.message).toBe("Invalid password");
        });

        it("should fail if user does not exist", async () => {
            const mockSelect = { from: vi.fn().mockReturnThis(), where: vi.fn().mockResolvedValue([]) };
            (db.select as any).mockReturnValue(mockSelect);

            const res = await request(app).post("/api/v1/auth/login").send({
                email: "nonexistent@example.com",
                password: "password123"
            });

            expect(res.status).toBe(404);
            expect(res.body.message).toBe("This email does not belong to an account");
        });
    });
});