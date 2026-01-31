// import path from "path";
// import { fileURLToPath } from 'url';
// import "dotenv/config";
// import { drizzle } from "drizzle-orm/mysql2";
// import mysql from "mysql2/promise";
// import fs from "fs";

// const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
// const __dirname = path.dirname(__filename);

// const caCertPath = path.resolve(__dirname, '../../ca.pem');
// const caCert = fs.readFileSync(caCertPath, 'utf-8');

// const mysqlConnection = await mysql.createConnection({
//   uri: process.env.DATABASE_URL!, 
//   ssl: {
//     ca: caCert, 
//     rejectUnauthorized: true, 
//   },
// });



// // // const caBuffer = Buffer.from(process.env.DB_CA!, "base64");

// // const caPath = path.resolve(__dirname, "../ca.pem"); 
// // const mysqlConnection = await mysql.createConnection({
// //     // host: process.env.DATABASE_HOST!,
// //     // user: process.env.DATABASE_USER!,
// //     // database: process.env.DATABASE_NAME!,
// //     // password: process.env.DATABASE_PASSWORD!,
// //     uri: process.env.DATABASE_URL!,
// //     ssl: {
// //         ca: fs.readFileSync(caPath)
// //     },
// //     connectTimeout: 10000,
// // });

// export const db = drizzle({ client: mysqlConnection, /* logger: true  */});

import "dotenv/config";
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise" // /promise supports promise requests, drizzle requires a promise request

const mysql_connection = await mysql.createConnection({
    host: process.env.DATABASE_HOST!,
    user: process.env.DATABASE_USER!,
    database: process.env.DATABASE_NAME!,
    password: process.env.DATABASE_PASSWORD!,
});

export const db = drizzle({ client: mysql_connection });
