// this ai agent should be able to create, update, delete and retrieve contacts from nlp
// additional features: this ai agent should be able to execute actions from nlp such as 
    // sending out emails
    // setting remindars e.t.c

const crmTools = [
    {
        name: "create_contact",
        description: "Create a new contact in the CRM. Use this when the user explicitly wants to add or save a person's details. You must ensure either an email OR a phone number is provided.",
        input_schema: {
            type: "object",
            properties: {
            firstName: {
                type: "string",
                description: "The contact's first name."
            },
            lastName: {
                type: "string",
                description: "The contact's last name."
            },
            email: {
                type: "string",
                description: "The contact's email address."
            },
            phoneNumber: {
                type: "string",
                description: "The contact's phone number."
            },
            company: {
                type: "string",
                description: "The company the contact works for."
            },
            notes: { 
                type: "string",
                description: "Any initial notes about the contact."
            }
            },
            required: ["firstName"]
        }
    },
    {
    name: "search_contacts",
    description: "Search for contacts using a natural language query or specific filters. Use this for finding people by name, company, date added (e.g., 'last week'), or vague descriptions.",
    input_schema: {
        type: "object",
        properties: {
        query: {
            type: "string",
            description: "The text to search for across names, companies, and emails. (e.g., 'Alex', 'HeyGov', 'Developer'). Optional if searching by date only."
        },
        dateFrom: {
            type: "string",
            description: "The start date for the search range in YYYY-MM-DD format. (e.g., if user says 'last week', calculate the date 7 days ago)."
        },
        dateTo: {
            type: "string",
            description: "The end date for the search range in YYYY-MM-DD format. Defaults to today if not specified."
        },
        limit: {
            type: "integer",
            description: "The maximum number of results to return.",
            default: 5
        }
        }
    }
    },
    {
        name: "update_contact",
        description: "Update details for an existing contact. You must have a valid contactId to use this tool. If you don't have an ID, search for the contact first.",
        input_schema: {
            type: "object",
            properties: {
            contactId: {
                type: "integer",
                description: "The unique ID of the contact to update."
            },
            firstName: { type: "string" },
            lastName: { type: "string" },
            email: { type: "string" },
            phoneNumber: { type: "string" },
            company: { type: "string" },
            notes: { type: "string" }
            },
            required: ["contactId"]
        }
    },
    {
        name: "delete_contact",
        description: "Soft delete a contact (move to trash). You must have a valid contactId to use this tool. If you don't have an ID, search for the contact first.",
        input_schema: {
            type: "object",
            properties: {
            contactId: {
                type: "integer",
                description: "The unique ID of the contact to delete."
            }
            },
            required: ["contactId"]
        }
    },
    {
        name: "send_email",
        description: "Draft or send an email to a contact. Requires the contact's email address.",
        input_schema: {
            type: "object",
            properties: {
                recipientEmail: { type: "string", description: "The email address to send to." },
                subject: { type: "string", description: "The email subject line." },
                body: { type: "string", description: "The content of the email." }
            },
            required: ["recipientEmail", "subject", "body"]
        }
    },
    {
        name: "set_reminder",
        description: "Set a follow-up reminder for the user regarding a specific contact or task.",
        input_schema: {
            type: "object",
            properties: {
                title: { type: "string", description: "The title of the reminder related to the task"},
                taskDescription: { type: "string", description: "What to remind the user about (e.g., 'Call Alex')." },
                dueDateTime: { type: "string", description: "ISO timestamp or YYYY-MM-DD HH:mm string for when the reminder is due." }
            },
            required: ["taskDescription", "dueDateTime"]
        }
    }
];

export { crmTools };