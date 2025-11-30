import type { IRequest } from "../../types/index.ts";
import type { Response } from "express";
import { createContact, getContactById, getAllContacts, update, softDelete, permanentDelete } from "../../services/contacts/index.ts"

const addContact = async (req: IRequest, res: Response) => {
    const userId = req.userId;

    const { firstName, lastName, email, phoneNumber, company } = req.body;

    if (!firstName || !email ) {
        res.status(400).json({
            status: "Error",
            message: "Required fields are missing"
        });
        return;
    }
    try {
        const newContact = await createContact({ 
            firstName, 
            lastName, 
            email, 
            phoneNumber, 
            company 
        }, Number(userId))

        if (typeof newContact == 'number') {
            res.status(201).json({
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
    const userId = req.userId;
    const { contactId } = req.params;

    if (!contactId) {
        res.status(400).json({
            status: "Error",
            message: "Contact Id missing"
        });
        return;
    }

    try {
        const contact = await getContactById(Number(contactId), Number(userId));

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
    const userId = req.userId;

    try {
        const contactList = await getAllContacts(Number(userId))

        if (contactList.length == 0) {
            res.status(404).json({
                status: "Error",
                message: "Contacts not found",
                data: []
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
    const userId = req.userId;
    const { firstName, lastName, email, phoneNumber, company, notes } = req.body;

    if (!contactId) {
        res.status(400).json({
            status: "Error",
            message: "Contact Id missing"
        });
        return;
    }

    const updateContactData = {
        firstName: firstName, 
        lastName: lastName, 
        email, 
        phoneNumber, 
        company, 
        notes 
    };

    if (Object.values(updateContactData).every(v => v === undefined)) {
        return res.status(400).json({ status: "Error", message: "No fields to update" });
    }

    try {
        const result = await update(Number(contactId), Number(userId), updateContactData);

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
    const userId = req.userId;

    if (!contactId) {
        res.status(400).json({
            status: "Error",
            message: "Contact Id missing"
        });
        return;
    }

    try {
        await softDelete(Number(contactId), Number(userId));

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
    const userId = req.userId;

    if (!contactId) {
        res.status(400).json({
            status: "Error",
            message: "Contact Id missing"
        });
        return;
    }

    try {
        await permanentDelete(Number(contactId), Number(userId));

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