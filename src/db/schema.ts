import { relations, sql } from "drizzle-orm";
import { mysqlTable, text, varchar, int, timestamp, check, boolean } from "drizzle-orm/mysql-core";

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
    firstName: varchar("first_name", { length: 100 }).notNull(),
    lastName: varchar("last_name", { length: 100 }).notNull(),
    email: varchar("email", { length: 150 }).unique(),
    phoneNumber: varchar("phone_number", { length: 150 }).notNull(),
    company: varchar("company", { length: 150 }),
    userId: int("user_id").notNull().references(() => users.id),
    inTrash: boolean('in_trash').default(false),
    isDeleted: boolean('is_deleted').default(false),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (t) => ({
    // constraint allowing either phone number or email to be presnet; at least one of them must be present
    phoneOrEmailPresent: check('phone_or_email_present', sql`email IS NOT NULL OR phone_number IS NOT NULL`),
}));

export const usersRelations = relations(users, ({ many }) => ({
    contacts: many(contacts),
}));