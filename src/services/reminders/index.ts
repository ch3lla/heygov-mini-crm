import { db } from "../../db/index.js";
import { reminders } from "../../db/schema.js";
import { eq, and, desc } from "drizzle-orm";
import type { IReminderInput } from "../../types/index.js";

const createReminder = async (data: IReminderInput, userId: number) => {
    try {
        const [result] = await db.insert(reminders).values({
            userId,
            userEmail: data.userEmail,
            title: data.title,
            description: data.description,
            dueDate: new Date(data.dueDate),
            status: 'pending'
        }).$returningId();

        if (result?.id) {
            return await getReminderById(result.id, userId);
        }
    } catch (error: any) {
        throw new Error(error.message || "Failed to create reminder");
    }
};

const getReminderById = async (id: number, userId: number) => {
    const result = await db.select()
        .from(reminders)
        .where(and(
            eq(reminders.id, id), 
            eq(reminders.userId, userId)
        ));
    
    return result[0] || null;
};

const getAllReminders = async (userId: number) => {
    return await db.select()
        .from(reminders)
        .where(eq(reminders.userId, userId))
        .orderBy(desc(reminders.dueDate));
};

const updateReminder = async (id: number, userId: number, data: Partial<IReminderInput>) => {
    const updateData: any = {};
    if (data.title) updateData.title = data.title;
    if (data.description) updateData.description = data.description;
    if (data.dueDate) updateData.dueDate = new Date(data.dueDate);
    if (data.userEmail) updateData.userEmail = data.userEmail;

    if (Object.keys(updateData).length === 0) return false;

    const [result] = await db.update(reminders)
        .set(updateData)
        .where(and(eq(reminders.id, id), eq(reminders.userId, userId)));

    return result.affectedRows > 0;
};

const deleteReminder = async (id: number, userId: number) => {
    const [result] = await db.delete(reminders)
        .where(and(eq(reminders.id, id), eq(reminders.userId, userId)));
    
    return result.affectedRows > 0;
};

export { createReminder, getReminderById, updateReminder, getAllReminders, deleteReminder }