import type { Response } from "express";
import type { IRequest } from "../../types/index.js";
import { createReminder, getReminderById, updateReminder, getAllReminders, deleteReminder } from "../../services/reminders/index.js";
import { getUserEmail } from "../users/index.js";

const createUserReminder = async (req: IRequest, res: Response) => {
    const userId = req.userId;
    const userEmail = await getUserEmail(userId!);
    const { title, description, dueDate } = req.body;

    if (!userId || !title || !dueDate || !userEmail) {
        res.status(400).json({
            status: "Error",
            message: "Missing required fields"
        });
        return;
    }

    try {
        const reminder = await createReminder({
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

const getUserReminder = async (req: IRequest, res: Response) => {
    const userId = req.userId;
    const { reminderId } = req.params;

    if (!userId || !reminderId) return res.status(400).json({
        status: "Error",
        message: "Invalid Request"
    });

    try {
        const reminder = await getReminderById(Number(reminderId), userId);
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

const getReminders = async (req: IRequest, res: Response) => {
    const userId = req.userId;
    if (!userId) {
        res.status(401).json({
            status: "Error",
            message: "Unauthorized"
        });
        return;
    }

    try {
        const reminders = await getAllReminders(userId);
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

const updateUserReminder = async (req: IRequest, res: Response) => {
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
        const success = await updateReminder(Number(reminderId), userId, updates);
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

const deleteUserReminder = async (req: IRequest, res: Response) => {
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
        const success = await deleteReminder(Number(reminderId), userId);
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

export { createUserReminder, getUserReminder, getReminders, updateUserReminder, deleteUserReminder };