
import { db } from "../../db/index.ts";
import { contacts } from "../../db/schema.ts";
import { eq, and, or, like, gte, lte, desc } from "drizzle-orm";
import type { IContactInput, IUpdateInput, ISearchOptions } from "../../types/index.ts";

const createContact = async (data: IContactInput, userId: number): Promise<number> => {
    if (!data.firstName || !data.email) {
        throw new Error("First name or email is required.");
    }

    try {
        const newContactId = await db.insert(contacts).values({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email || null,
        phoneNumber: data.phoneNumber || null,
        company: data.company || null,
        notes: data.notes || null,
        userId: userId,
    }).$returningId();
        return Number(newContactId);
    } catch (error: any) {
            if (error?.code === "ER_CHECK_CONSTRAINT_VIOLATED") {
            throw new Error("Database constraint failed: first name or email is missing.");
        }
        throw error;
    }
}

const getContactById = async (contactId: number, userId: number) => {
    const contact = await db.select().from(contacts).where(and(
        eq(contacts.id, contactId),
        eq(contacts.userId, userId),
        eq(contacts.isDeleted, false),
        eq(contacts.inTrash, false)
    ));
    
    return contact[0] ?? null;
}

const getAllContacts = (userId: number) => {
    return db.select().from(contacts).where(and(
        eq(contacts.userId, userId),
        eq(contacts.inTrash, false),
        eq(contacts.isDeleted, false)
    ));
}

const update = async (contactId: number, userId: number, data: IUpdateInput): Promise<boolean> => {

    const updatePayload: Record<string, any> = {};
    if (data.firstName !== undefined) updatePayload.firstName = data.firstName;
    if (data.lastName !== undefined) updatePayload.lastName = data.lastName;
    if (data.email !== undefined) updatePayload.email = data.email || null;
    if (data.phoneNumber !== undefined) updatePayload.phoneNumber = data.phoneNumber || null;
    if (data.company !== undefined) updatePayload.company = data.company || null;
    if (data.notes !== undefined) updatePayload.notes = data.notes || null;
    
    if (Object.keys(updatePayload).length === 0) {
        return false;
    }

    const result = await db.update(contacts).set(updatePayload).where(and(
        eq(contacts.id, contactId), 
        eq(contacts.userId, userId)
    ));

    return result.length > 0;
}

const softDelete = async (contactId: number, userId: number) => {
    await db.update(contacts).set({inTrash: true}).where(and(eq(contacts.id, Number(contactId)), eq(contacts.userId, Number(userId))));
}

const permanentDelete = async (contactId: number, userId: number) => {
    await db.update(contacts).set({isDeleted: true}).where(and(eq(contacts.id, Number(contactId)), eq(contacts.userId, Number(userId))));
}

const search = async (options: ISearchOptions, userId: number) => {
    const conditions = [
        eq(contacts.userId, userId),
        eq(contacts.isDeleted, false),
        eq(contacts.inTrash, false)
    ];

    if (options.query && options.query.trim().length > 0) {
        // Split "Alex Smith HeyGov" into ["alex", "smith", "heygov"]
        const terms = options.query.trim().toLowerCase().split(/\s+/);
        
        for (const term of terms) {
            // Each term gets wrapped in %...% for partial matching
            const pattern = `%${term}%`;
            
            // Pushes an OR block to the main AND conditions
            // This ensures "Alex" must exist SOMEWHERE, AND "HeyGov" must exist SOMEWHERE
            conditions.push(or(
                like(contacts.firstName, pattern),
                like(contacts.lastName, pattern),
                like(contacts.email, pattern),
                like(contacts.company, pattern),
                like(contacts.phoneNumber, pattern),
                like(contacts.notes, pattern)
            )!);
        }
    }

    if (options.dateFrom) {
        conditions.push(gte(contacts.createdAt, new Date(options.dateFrom)));
    }
    if (options.dateTo) {
        conditions.push(lte(contacts.createdAt, new Date(options.dateTo)));
    }

    return await db.select()
        .from(contacts)
        .where(and(...conditions))
        .limit(options.limit || 20)
        .orderBy(desc(contacts.createdAt)); // Most recent matches first
}

export { createContact, getContactById, getAllContacts, update, softDelete, permanentDelete, search };