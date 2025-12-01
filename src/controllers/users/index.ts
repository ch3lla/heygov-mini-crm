import type { Response } from "express";
import type { IRequest } from "../../types/index.ts";
import { db } from "../../db/index.ts";
import { users } from "../../db/schema.ts";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

const BCRYPT_SALT_ROUNDS = process.env.BCRYPT_SALT_ROUNDS || 10;

const getUserProfile = async (req: IRequest, res: Response) => {
    const userId = req.userId;

    try {
    const result = await db.select().from(users).where(eq(users.id, Number(userId)));
    const user = result[0];
    if (!user) {
        res.status(404).json({
            status: "Error",
            message: "User not found"
        });
        return;
    }

    const { password, ...rest } = user;
    return res.status(200).json({
        status: "Success",
        data: rest
    });
    } catch (error: any) {
    return res.status(500).json({
        status: "Error",
        message: error.message || "Something went wrong" 
    });
    }
};

const updateUserProfile = async (req: IRequest, res: Response) => {
    const userId = req.userId;

    const { firstName, lastName, email, phoneNumber, password } = req.body;

    const updateUserData: any = {};
    if (firstName) updateUserData.firstName = firstName;
    if (lastName) updateUserData.lastName = lastName;
    if (email) updateUserData.email = email;
    if (phoneNumber) updateUserData.phoneNumber = phoneNumber;
    if (password) updateUserData.password = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);

    if (Object.keys(updateUserData).length == 0) {
        res.status(400).json({
            status: "Error",
            message: "No fields to update"
        });
        return;
    }

    try {
        await db.update(users).set(updateUserData).where(eq(users.id, Number(userId)));

        return res.status(200).json({
            status: "Success",
            message: "Profile updated"
        });
    } catch (error: any) {
        return res.status(500).json({
            status: "Error",
            message: error.message || "Something went wrong" });
    }
};

const deleteUser = async (req: IRequest, res: Response) => {
    const userId = req.userId;
    try {
        await db.delete(users).where(eq(users.id, Number(userId)));
        return res.status(200).json({
            status: "Success",
            message: "User deleted"
        });
    } catch (error: any) {
        return res.status(500).json({ status: "Error", message: error.message });
    }
};

const getUserEmail = async (userId: number) => {
    if (!userId) {
        return null;
    }
    return (await db.select().from(users).where(eq(users.id, Number(userId))))[0]?.email
}

export { getUserProfile, updateUserProfile, deleteUser, getUserEmail }