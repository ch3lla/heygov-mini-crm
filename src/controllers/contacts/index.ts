import type { IRequest } from "../../types/index.ts";
import { db } from "../../db/index.ts";
import { contacts } from "../../db/schema.ts"
import type { Response } from "express";
import { eq, and } from "drizzle-orm";

const addContact = async (req: IRequest, res: Response) => {
    const user_id = req.user_id;

    const { firstName, lastName, email, phoneNumber, company } = req.body;

    if (!firstName || !lastName ) {
        res.status(400).json({
            status: "Error",
            message: "Required fields are missing"
        });
        return;
    }

    if (!email && !phoneNumber) {
        res.status(400).json({
            status: "Error",
            message: "At least one of email or phone number must be provided"
        });
        return;
    }

    try {
        const newContact = await db.insert(contacts).values({
            firstName,
            lastName,
            email: email || null,
            phoneNumber: phoneNumber || null,
            company: company || null,
            userId: Number(user_id),
        }).$returningId();

        if (typeof newContact == 'number') {
            res.status(200).json({
                status: "Success",
                message: "Contact addedd successfully"
            });
            return;
        }
    } catch (error: any) {
        if (error?.code == "ER_CHECK_CONSTRAINT_VIOLATED") {
            res.status(400).json({
                status: "Error",
                message: "At least one of email or phone number must be provided"
            });
            return
        }
        res.status(500).json({
            status: "Error",
            message: error.message || "Something went wrong",
        });
    }
};

const getContact = async (req: IRequest, res: Response) => {
    const user_id = req.user_id;
    const { contactId } = req.params;

    if (!contactId) {
        res.status(400).json({
            status: "Error",
            message: "Contact Id missing"
        });
        return;
    }

    try {
        const contact = await db.select().from(contacts).where(and(eq(contacts.id, Number(contactId)), eq(contacts.userId, Number(user_id))));

        if (!contact) {
            res.status(404).json({
                status: "Error",
                message: "Contact not found"
            });
            return;
        }

        return res.status(200).json({
            status: "Success",
            data: contact
        });
    } catch (error: any){
        return res.status(500).json({
            status: "Error",
            message: error.message || "Something went wrong"
        });
    }
    
};

const getAllUserContacts = async (req: IRequest, res: Response) => {
    const user_id = req.user_id;

    try {
        const contactList = await db.select().from(contacts).where(and(
            eq(contacts.userId, Number(user_id)),
            eq(contacts.inTrash, false),
            eq(contacts.isDeleted, false)
        ));

        if (contactList.length == 0) {
            res.status(404).json({
                status: "Error",
                message: "Contacts not found"
            });
            return;
        }

        return res.status(200).json({
            status: "Success",
            data: contactList
        });
    } catch (error: any){
        return res.status(500).json({
            status: "Error",
            message: error.message || "Something went wrong"
        });
    }
    
};

const updateContact = async (req: IRequest, res: Response) => {
    const { contactId } = req.params;
    const user_id = req.user_id;
    const { first_name, last_name, email, phoneNumber, company, notes } = req.body;

    if (!contactId) {
        res.status(400).json({
            status: "Error",
            message: "Contact Id missing"
        });
        return;
    }

    const updateContactData: Record<string, string> = {};
    if (first_name !== undefined) updateContactData.firstName = first_name;
    if (last_name !== undefined) updateContactData.lastName = last_name;
    if (email !== undefined) updateContactData.email = email;
    if (phoneNumber !== undefined) updateContactData.phoneNumber = phoneNumber;
    if (company !== undefined) updateContactData.company = company;
    if (notes !== undefined) updateContactData.notes = notes;

    if (Object.keys(updateContactData).length == 0) {
        res.status(400).json({
            status: "Error",
            message: "No fields to update"
        });
        return;
    }

    try {
        const result = await db.update(contacts).set(updateContactData).where(and(eq(contacts.id, Number(contactId)), eq(contacts.userId, Number(user_id))));

        if (!result) {
            res.status(404).json({
                status: "Error",
                message: "Contact not found"
            });
            return;
        }

        return res.status(200).json({
            status: "Success",
            message: "Contact updated successfully"
        });
    } catch (error: any){
        return res.status(500).json({
            status: "Error",
            message: error.message || "Something went wrong"
        });
    }
};

const temporaryDeleteContact = async (req: IRequest, res: Response) => {
    const { contactId } = req.params;
    const user_id = req.user_id;

    if (!contactId) {
        res.status(400).json({
            status: "Error",
            message: "Contact Id missing"
        });
        return;
    }

    try {
        await db.update(contacts).set({inTrash: true}).where(and(eq(contacts.id, Number(contactId)), eq(contacts.userId, Number(user_id))));

        return res.status(204).json({
            status: "Success",
            message: "Contact deleted successfully"
        });
    } catch (error: any){
        return res.status(500).json({
            status: "Error",
            message: error.message || "Something went wrong"
        });
    }
};

const permanentlyDeleteContact = async (req: IRequest, res: Response) => {
    const { contactId } = req.params;
    const user_id = req.user_id;

    if (!contactId) {
        res.status(400).json({
            status: "Error",
            message: "Contact Id missing"
        });
        return;
    }

    try {
        await db.update(contacts).set({isDeleted: true}).where(and(eq(contacts.id, Number(contactId)), eq(contacts.userId, Number(user_id))));

        return res.status(204).json({
            status: "Success",
            message: "Contact deleted successfully"
        });
    } catch (error: any){
        return res.status(500).json({
            status: "Error",
            message: error.message || "Something went wrong"
        });
    }
};

export { addContact, getContact, getAllUserContacts, updateContact, temporaryDeleteContact, permanentlyDeleteContact };