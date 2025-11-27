import type { Request } from "express";
import type { JwtPayload } from "jsonwebtoken";

export interface IRequest extends Request {
    user_id?: number
}

export interface IUser {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string | null;
    createdAt: Date; 
    updatedAt: Date;
}

export interface IJwtPayload extends JwtPayload {
    user_id?: number
}