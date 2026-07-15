// ============================================================
// db.js — de verbinding met de MySQL-database
// ============================================================
// We gebruiken een "connection pool": een groepje herbruikbare
// databaseverbindingen. Dat is sneller dan voor elke query een
// nieuwe verbinding openen en weer sluiten.
//
// Gebruik in een server component of API-route:
//   import pool from "@/lib/db";
//   const [rows] = await pool.query("SELECT * FROM products");
//
// LET OP: dit bestand werkt alleen op de server (pages/API-routes),
// nooit in de browser — daar is geen directe database-toegang.

import mysql from "mysql2/promise";

// De instellingen komen uit .env.local (zie ook .env.example).
// globalThis voorkomt dat hot-reload in dev steeds nieuwe pools aanmaakt:
// bij elke codewijziging herlaadt Next.js dit bestand, maar de pool
// die al bestaat wordt dan hergebruikt.
const pool =
    globalThis._dbPool ??
    mysql.createPool({
        host: process.env.DB_HOST || "localhost",
        port: Number(process.env.DB_PORT || 3306),
        user: process.env.DB_USER || "root",
        password: process.env.DB_PASSWORD || "",
        database: process.env.DB_NAME || "voetbalshop2",
        waitForConnections: true, // wachten als alle verbindingen bezet zijn
        connectionLimit: 10,      // maximaal 10 verbindingen tegelijk
    });

globalThis._dbPool = pool;

export default pool;
