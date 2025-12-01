
import { db } from "../../db/index.js";
import { contacts, interactions, reminders } from "../../db/schema.js";
import { eq, and, or, like, gte, lte, desc, sql } from "drizzle-orm";
import type { IContactInput, IUpdateInput, ISearchOptions, IContact } from "../../types/index.js";

const createContact = async (data: IContactInput, userId: number) => {
    if (!data.firstName && !data.email) {
        throw new Error("First name or email is required.");
    }

    try {
        const tagsArray = Array.isArray(data.tags) ? data.tags : (data.tags ? [data.tags] : []);
        const [result] = await db.insert(contacts).values({
            firstName: data.firstName || null,
            lastName: data.lastName || null,
            email: data.email || null,
            phoneNumber: data.phoneNumber || null,
            company: data.company || null,
            notes: data.notes || null,
            tags: tagsArray,
            userId: userId,
        }).$returningId();
        if (!result) {
            throw new Error("Failed to insert contact");
        }
        const newContact = await getContactById(result.id, userId);
        return newContact;
    } catch (error: any) {
        if (error?.code === "ER_CHECK_CONSTRAINT_VIOLATED") {
            throw new Error("Database constraint failed: first name or email is missing.");
        }
        if (error?.code === "ER_DUP_ENTRY") {
            throw new Error("A contact with this email already exists.");
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
        const toDate = new Date(options.dateTo);
        toDate.setHours(23, 59, 59, 999);
        conditions.push(lte(contacts.createdAt, toDate));
    }

    return await db.select()
        .from(contacts)
        .where(and(...conditions))
        .limit(options.limit || 20)
        .orderBy(desc(contacts.createdAt)); // Most recent matches first
}

const getTrashSites = async (userId: number) => {
    return db.select().from(contacts).where(and(
        eq(contacts.userId, userId),
        eq(contacts.inTrash, true),
        eq(contacts.isDeleted, false)
    ));
}

const restoreContact = async (userId: number, contactId: number) => {
    const result = await db.update(contacts).set({inTrash: false}).where(and(
        eq(contacts.id, contactId), 
        eq(contacts.userId, userId)
    ));

    return result.length > 0;
}

const getContactInteractions = async (contactId: number) => {
    return db.select().from(interactions).where(eq(interactions.contactId, contactId));
}

const createInteraction = async (userId: number, contactId: number, type: string, summary: string, date?: Date) => {
    const contact = await db.select().from(contacts).where(and(eq(contacts.id, contactId), eq(contacts.userId, userId)));
    if (!contact.length) {
        throw new Error("Contact not found");
    }

    await db.insert(interactions).values({
        userId,
        contactId: contactId,
        type: type,
        summary: summary,
        date: new Date(date || Date.now())
    });

    return { success: true, message: "Interaction logged." };
};

 const generateBriefing = async (userId: number, contactId: number) => {
    const contactResult = await db.select().from(contacts).where(and(eq(contacts.id, contactId), eq(contacts.userId, userId)));
    const contact = contactResult[0];

    if (!contact) {
        throw new Error("Contact not found");
    }

    const lastInteractions = await db.select().from(interactions)
        .where(and(eq(interactions.contactId, contactId), eq(interactions.userId, userId)))
        .orderBy(desc(interactions.date))
        .limit(5); // only need last 5 interactions

    // use fuzzy search to retrieve possible pednidng reminders for contact
    const pendingReminders = await db.select().from(reminders)
        .where(and(
            eq(reminders.userId, userId), 
            eq(reminders.status, "pending"),
            sql`description LIKE ${`%${contact.firstName}%`}` 
        ));

    return {
        profile: contact,
        history: lastInteractions,
        reminders: pendingReminders,
        ai_note: "Summarize this data for the user in a bulleted briefing format."
    };
};

const getStats = async (userId: number) => {
    const totalContacts = await db.select({ count: sql<number>`count(*)` })
        .from(contacts).where(eq(contacts.userId, userId));
    
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    const recentInteractions = await db.select({ count: sql<number>`count(*)` })
        .from(interactions)
        .where(and(
            eq(interactions.userId, userId),
            gte(interactions.date, startOfMonth)
        ));

    return {
        total_contacts: totalContacts[0]?.count ?? 0,
        interactions_this_month: recentInteractions[0]?.count ?? 0,
        message: "Here is your CRM overview."
    };
};

export { createContact, getContactById, getAllContacts, update, softDelete, permanentDelete, search, getTrashSites, restoreContact, getContactInteractions, createInteraction, generateBriefing, getStats };