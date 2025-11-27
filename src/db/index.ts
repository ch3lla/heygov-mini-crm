import dotenv from "dotenv";
dotenv.config()
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise" // /promise supports promise requests, drizzle requires a promise request

const mysql_connection = await mysql.createConnection({
    host: process.env.DATABASE_HOST!,
    user: process.env.DATABASE_USER!,
    database: process.env.DATABASE_NAME!,
    password: process.env.DATABASE_PASSWORD!,
});

export const db = drizzle({ client: mysql_connection });