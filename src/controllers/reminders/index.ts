import type { Response } from "express";
import type { IRequest } from "../../types/index.ts";
import * as reminderService from "../../services/reminders/index.ts";
import { db } from "../../db/index.ts";
import { users } from "../../db/schema.ts";
import { eq } from "drizzle-orm"

export const createReminder = async (req: IRequest, res: Response) => {
    const userId = req.userId;
    const userEmail = (await db.select().from(users).where(eq(users.id, Number(userId))))[0]?.email!;
    console.log("Email: ", userEmail)
    const { title, description, dueDate } = req.body;

    if (!userId || !title || !dueDate || !userEmail) {
        res.status(400).json({
            status: "Error",
            message: "Missing required fields"
        });
        return;
    }

    try {
        const reminder = await reminderService.createReminder({
            title,
            description,
            dueDate,
            userEmail
        }, userId);

        res.status(201).json({
            status: "Success",
            data: reminder
        });
    } catch (error: any) {
        res.status(500).json({
            status: "Error",
            message: error.message
        });
    }
};

export const getReminder = async (req: IRequest, res: Response) => {
    const userId = req.userId;
    const { reminderId } = req.params;

    if (!userId || !id) return res.status(400).json({
        status: "Error",
        message: "Invalid Request"
    });

    try {
        const reminder = await reminderService.getReminderById(Number(id), userId);
        if (!reminder) {
            res.status(404).json({
                status: "Error",
                message: "Reminder not found"
            });
            return;
        }

        res.status(200).json({
            status: "Success",
            data: reminder
        });
    } catch (error: any) {
        res.status(500).json({
            status: "Error",
            message: error.message
        });
    }
};

export const getReminders = async (req: IRequest, res: Response) => {
    const userId = req.userId;
    if (!userId) {
        res.status(401).json({
            status: "Error",
            message: "Unauthorized"
        });
        return;
    }

    try {
        const reminders = await reminderService.getAllReminders(userId);
        res.status(200).json({
            status: "Success",
            data: reminders
        });
    } catch (error: any) {
        res.status(500).json({
            status: "Error",
            message: error.message
        });
    }
};

export const updateReminder = async (req: IRequest, res: Response) => {
    const userId = req.userId;
    const { reminderId } = req.params;
    const updates = req.body;

    if (!userId || !reminderId) {
        res.status(400).json({
            status: "Error",
            message: "Invalid Request"
        });
        return;
    }

    try {
        const success = await reminderService.updateReminder(Number(reminderId), userId, updates);
        if (!success) { 
            res.status(404).json({
                status: "Error",
                message: "Reminder not found or no changes made"
            });
            return;
        }

        res.status(200).json({
            status: "Success",
            message: "Reminder updated"
        });
    } catch (error: any) {
        res.status(500).json({
            status: "Error",
            message: error.message
        });
    }
};

export const deleteReminder = async (req: IRequest, res: Response) => {
    const userId = req.userId;
    const { reminderId } = req.params;

    if (!userId || !reminderId) {
        res.status(400).json({
            status: "Error",
            message: "Invalid Request"
        });
        return;
    }

    try {
        const success = await reminderService.deleteReminder(Number(reminderId), userId);
        if (!success) {
            res.status(404).json({
                status: "Error",
                message: "Reminder not found"
            });
            return;
        }

        res.status(200).json({
            status: "Success",
            message: "Reminder deleted"
        });
    } catch (error: any) {
        res.status(500).json({
            status: "Error",
            message: error.message
        });
    }
};