import { createContact, search, update, softDelete } from "../../services/contacts/index.ts";

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
                return {
                    success: true,
                    message: `Email drafted to ${toolInput.recipientEmail}`,
                    draft: {
                        to: toolInput.recipientEmail,
                        subject: toolInput.subject,
                        body: toolInput.body
                    },
                    note: 'Email sending not yet implemented - this is a draft'
                };

            case 'set_reminder':
                // TODO: Implement reminder system (database table + cron job)
                return {
                    success: true,
                    message: 'Reminder set',
                    reminder: {
                        task: toolInput.taskDescription,
                        dueDate: toolInput.dueDateTime,
                        contactId: toolInput.contactId || null
                    },
                    note: 'Reminder system not yet implemented - this is a placeholder'
                };

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