// ============================================================
// setup-db.js — zet de database in één keer op
// ============================================================
// Draait het bestand db/init.sql tegen je lokale MySQL-server:
// database aanmaken, tabellen aanmaken en testproducten invoegen.
//
// Gebruik:  npm run setup-db
// LET OP:   bestaande tabellen worden weggegooid en opnieuw
//           opgebouwd (zie de DROP TABLE-regels in init.sql).
//
// Dit is een los Node-script (geen Next.js), daarom require()
// in plaats van import.

const fs = require("fs");
const path = require("path");
const mysql = require("mysql2/promise");

// ---- .env.local inlezen (zonder extra dependency) ----
// Elke regel als "NAAM=waarde" wordt in process.env gezet,
// tenzij die variabele al bestaat.
const envPath = path.join(__dirname, "..", ".env.local");
if (fs.existsSync(envPath)) {
    for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
        const m = line.match(/^([A-Z_]+)=(.*)$/);
        if (m && process.env[m[1]] === undefined) {
            process.env[m[1]] = m[2];
        }
    }
}

async function main() {
    // Het hele SQL-bestand als één string inlezen
    const sql = fs.readFileSync(path.join(__dirname, "..", "db", "init.sql"), "utf8");

    // Verbinden ZONDER database te kiezen: de database bestaat
    // mogelijk nog niet, init.sql maakt hem zelf aan.
    const conn = await mysql.createConnection({
        host: process.env.DB_HOST || "localhost",
        port: Number(process.env.DB_PORT || 3306),
        user: process.env.DB_USER || "root",
        password: process.env.DB_PASSWORD || "",
        multipleStatements: true, // init.sql bevat veel statements achter elkaar
    });

    await conn.query(sql);
    await conn.end();

    console.log("✅ Database 'voetbalshop2' aangemaakt en gevuld met producten.");
}

main().catch((err) => {
    console.error("❌ Database setup mislukt:", err.message);
    process.exit(1); // exit-code 1 = mislukt (handig voor npm)
});
