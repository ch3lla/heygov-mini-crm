import { relations, sql } from "drizzle-orm";
import { mysqlTable, text, varchar, int, timestamp, check, boolean, json, unique } from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
    id: int("id").primaryKey().autoincrement(),
    firstName: varchar("first_name", { length: 100 }).notNull(),
    lastName: varchar("last_name", { length: 100 }).notNull(),
    password: text("password").notNull(),
    email: varchar("email", { length: 150 }).notNull().unique(),
    phoneNumber: varchar("phone_number", { length: 150 }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const contacts = mysqlTable("contacts", {
    id: int("id").primaryKey().autoincrement(),
    firstName: varchar("first_name", { length: 100 }),
    lastName: varchar("last_name", { length: 100 }),
    email: varchar("email", { length: 150 }),
    phoneNumber: varchar("phone_number", { length: 150 }),
    company: varchar("company", { length: 150 }),
    userId: int("user_id").notNull().references(() => users.id),
    notes: varchar("notes", { length: 255}),
    tags: json("tags").$type<string[]>().default([]),
    inTrash: boolean('in_trash').default(false),
    isDeleted: boolean('is_deleted').default(false),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (t) => ({
    nameOrEmailPresent: check('name_or_email_present', sql`email IS NOT NULL OR first_name IS NOT NULL`),
    uniqueEmailPerUser: unique("unique_email_per_user").on(t.userId, t.email),
}));

export const reminders = mysqlTable("reminders", {
    id: int("id").primaryKey().autoincrement(),
    userId: int("user_id").notNull().references(() => users.id),
    userEmail: varchar("user_email", { length: 150 }).notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description"),
    dueDate: timestamp("due_date").notNull(),
    status: varchar("status", { length: 20 }).default('pending'), // pending, sent, failed
    sentAt: timestamp("sent_at"),
    createdAt: timestamp("created_at").defaultNow(),
});

export const interactions = mysqlTable("interactions", {
    id: int("id").primaryKey().autoincrement(),
    userId: int("user_id").notNull().references(() => users.id),
    contactId: int("contact_id").notNull().references(() => contacts.id),
    type: varchar("type", { length: 50 }), // 'call', 'email', 'meeting', 'lunch'
    summary: text("summary"),
    date: timestamp("date").defaultNow(),
});

export const usersRelations = relations(users, ({ many }) => ({
    contacts: many(contacts),
    interactions: many(interactions),
}));

export const contactRelations = relations(contacts, ({many}) => ({
    interactions: many(interactions),
}));

export const interactionsRelations = relations(interactions, ({ one }) => ({
    contact: one(contacts, {
        fields: [interactions.contactId],
        references: [contacts.id],
    }),
}));