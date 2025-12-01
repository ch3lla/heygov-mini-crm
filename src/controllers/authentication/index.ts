
import "dotenv/config";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { db } from "../../db/index.js";
import { users } from "../../db/schema.js";
import { eq } from "drizzle-orm"
import type { Request, Response } from "express";

const JWT_SECRET: jwt.Secret = process.env.JWT_SECRET!;
const JWT_EXPIRY: jwt.SignOptions["expiresIn"] = `${Number(process.env.JWT_EXPIRY)}h` || "1h";
const BCRYPT_SALT_ROUNDS = Number(process.env.BCRYPT_SALT_ROUNDS) || 10;

const registerUser = async (req: Request, res: Response) => {
    const { firstName, lastName, email, phoneNumber, password, confirmPassword } = req.body;

    if (!firstName || !lastName || !password || !confirmPassword) {
        res.status(400).json({
            status: "Error",
            message: "Required fields missing"
        });
        return;
    }

    if (!email && !phoneNumber) {
        res.status(400).json({
            status: "Error",
            message: "Email or phone number must be present"
        });
        return;
    }

    try {
        const user = await db.select().from(users).where(eq(users.email, email));

        if (user.length > 0) {
            res.status(400).json({
            status: "Error",
            message: "This email already belongs to an account"
        });
        return;
        }
    } catch (error: any){
        return res.status(500).json({
            status: "Error",
            message: error.message || "Something went wrong"
        });
    }

    if (password !== confirmPassword) {
        res.status(400).json({
            status: "Error",
            message: "Passwords do not match"
        });
        return;
    }

    const hashedPassword = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
    const [newUser] = await db.insert(users).values({
        firstName,
        lastName,
        email: email || null,
        phoneNumber: phoneNumber || null,
        password: hashedPassword
    }).$returningId();

    if (newUser) {
        const token = jwt.sign({userId: newUser.id}, JWT_SECRET!, { expiresIn: JWT_EXPIRY }); // todo: fix
        return res.status(200).json({
            status: "Success",
            data: token
        });
    }

};

const login = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    if (!email && !password) {
        res.status(401).json({
            status: "Error",
            message: "Email or password is missing"
        });
        return;
    }

    try {
        const result = await db.select().from(users).where(eq(users.email, email));
        const user = result[0] ?? null;
        if (!user) {
            res.status(404).json({
                status: "Error",
                message: "This email does not belong to an account"
            }); 
            return;
        }

        const passwordsMatch = await bcrypt.compare(password, user.password);
        if (!passwordsMatch) {
            res.status(401).json({
                status: "Error",
                message: "Invalid password"
            }); 
            return;
        }
        const token = jwt.sign({userId: user.id}, JWT_SECRET, { expiresIn: JWT_EXPIRY }); // todo: fix
        return res.status(200).json({
            status: "Success",
            data: token
        });
    } catch (error: any){
        return res.status(500).json({
            status: "Error",
            message: error.message || "Something went wrong"
        });
    }
};

export { registerUser, login };