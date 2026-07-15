// Zet de database op: draait db/init.sql tegen de lokale MySQL-server.
// Gebruik: npm run setup-db
const fs = require("fs");
const path = require("path");
const mysql = require("mysql2/promise");

// .env.local inlezen (zonder extra dependency)
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
    const sql = fs.readFileSync(path.join(__dirname, "..", "db", "init.sql"), "utf8");

    const conn = await mysql.createConnection({
        host: process.env.DB_HOST || "localhost",
        port: Number(process.env.DB_PORT || 3306),
        user: process.env.DB_USER || "root",
        password: process.env.DB_PASSWORD || "",
        multipleStatements: true,
    });

    await conn.query(sql);
    await conn.end();

    console.log("✅ Database 'voetbalshop2' aangemaakt en gevuld met producten.");
}

main().catch((err) => {
    console.error("❌ Database setup mislukt:", err.message);
    process.exit(1);
});
