import type { Request } from "express";
import type { JwtPayload } from "jsonwebtoken";

export interface IRequest extends Request {
    userId?: number
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
    userId?: number
}

export interface IContactInput {
    firstName: string;
    lastName: string;
    email?: string | null;
    phoneNumber?: string | null;
    company?: string | null;
    notes?: string | null;
}

export interface IUpdateInput {
    firstName?: string;
    lastName?: string;
    email?: string | null;
    phoneNumber?: string | null;
    company?: string | null;
    notes?: string | null;
}

export interface ISearchOptions {
    query?: string;
    dateFrom?: string | Date;
    dateTo?: string | Date;
    limit?: number;
}

export interface IAgentResponse {
    type: string;
    id?: string;
    name?: string;
    args?: any;
    assistantMessage?: any;
    message?: string;
}

export interface IContact {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    company: string;
    notes: string;
    inTrash: boolean;
    createdAt: Date;
    updatedAt: Date;
}