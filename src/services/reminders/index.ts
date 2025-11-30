import { db } from "../../db/index.ts";
import { reminders } from "../../db/schema.ts";
import { eq, and, desc } from "drizzle-orm";
import type { IReminderInput } from "../../types/index.ts";

export const createReminder = async (data: IReminderInput, userId: number) => {
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

export const getReminderById = async (id: number, userId: number) => {
    const result = await db.select()
        .from(reminders)
        .where(and(
            eq(reminders.id, id), 
            eq(reminders.userId, userId)
        ));
    
    return result[0] || null;
};

export const getAllReminders = async (userId: number) => {
    return await db.select()
        .from(reminders)
        .where(eq(reminders.userId, userId))
        .orderBy(desc(reminders.dueDate));
};

export const updateReminder = async (id: number, userId: number, data: Partial<IReminderInput>) => {
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

export const deleteReminder = async (id: number, userId: number) => {
    const [result] = await db.delete(reminders)
        .where(and(eq(reminders.id, id), eq(reminders.userId, userId)));
    
    return result.affectedRows > 0;
};