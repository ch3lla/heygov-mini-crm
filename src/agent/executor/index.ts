import { createContact, search, update, softDelete } from "../../services/contacts/index.js";
import { sendEmail } from "../../services/email/index.js";
import { createReminder } from "../../services/reminders/index.js";
import { getUserEmail } from "../../controllers/users/index.js";

export const executeCRMTool = async ( userId: number, toolName: string, toolInput: any): Promise<any> => {
    try {
        switch (toolName) {
            case 'create_contact':
                if (!toolInput.firstName && toolInput.email) {
                    throw new Error('firstName is required to create a contact');
                }

                const contactId = await createContact(toolInput, userId);
                
                return {
                    success: true,
                    contactId,
                    message: `Contact ${toolInput.firstName} ${toolInput.lastName || ''} created successfully`
                };

            case 'search_contacts':
                if (!toolInput.query) {
                    throw new Error('query parameter is required for search');
                }

                const searchOptions = {
                    query: toolInput.query,
                    dateFrom: toolInput.dateFrom,
                    dateTo: toolInput.dateTo,
                    limit: toolInput.limit
                }

                const results = await search(searchOptions, userId);

                return {
                    success: true,
                    count: results.length,
                    contacts: results
                };

            case 'update_contact':
                if (!toolInput.contactId) {
                    throw new Error('contactId is required to update a contact');
                }

                const { contactId: updateId, ...updateData } = toolInput;
                
                const updated = await update(updateId, userId, updateData);
                
                if (!updated) {
                    throw new Error('Contact not found or no fields to update');
                }

                return {
                    success: true,
                    message: 'Contact updated successfully'
                };

            case 'delete_contact':
                if (!toolInput.contactId) {
                    throw new Error('contactId is required to delete a contact');
                }

                await softDelete(toolInput.contactId, userId);

                return {
                    success: true,
                    message: 'Contact moved to trash'
                };

            case 'send_email':
                // TODO: Implement email sending (Nodemailer, SendGrid, etc.)
                if (!toolInput.recipientEmail && !toolInput.subject && !toolInput.body){
                    throw new Error("Required fields are missing");
                }

                const res = await sendEmail(toolInput.recipientEmail, toolInput.subject, toolInput.body);
                if (res == true) {
                    return {
                        success: true,
                        message: `Email sent to ${toolInput.recipientEmail}`
                    }
                } else {
                    return {
                        success: false,
                        message: "Failed to send Email"
                    }
                }
            case 'set_reminder':
                if (!toolInput.contactId && !toolInput.title && !toolInput.taskDescription && !toolInput.dueDateTime){
                    throw new Error("Required fields are missing");
                }

                const userEmail = await getUserEmail(userId!) as string;
                const result = await createReminder({
                    title: toolInput.title, 
                    description: toolInput.taskDescription, 
                    dueDate: toolInput.dueDateTime,
                    userEmail
                }, userId);

                if (result != null) {
                    return {
                        success: false,
                        message: "Reminder set successfully"
                    }
                } else {
                    return {
                        success: true,
                        message: "Failed to set Reminder"
                    }
                }

            default:
                throw new Error(`Unknown tool: ${toolName}`);
        }
    } catch (error: any) {
        return {
            success: false,
            error: error.message || 'Tool execution failed'
        };
    }
};