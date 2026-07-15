import mysql from "mysql2/promise";

// Eén gedeelde connection pool voor de hele app.
// globalThis voorkomt dat hot-reload in dev steeds nieuwe pools aanmaakt.
const pool =
    globalThis._dbPool ??
    mysql.createPool({
        host: process.env.DB_HOST || "localhost",
        port: Number(process.env.DB_PORT || 3306),
        user: process.env.DB_USER || "root",
        password: process.env.DB_PASSWORD || "",
        database: process.env.DB_NAME || "voetbalshop2",
        waitForConnections: true,
        connectionLimit: 10,
    });

globalThis._dbPool = pool;

export default pool;
