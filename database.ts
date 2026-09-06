import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const dataDirectory = process.env.VERCEL
    ? path.join("/tmp", "cadence")
    : path.join(process.cwd(), "data");

if (!fs.existsSync(dataDirectory)) {
    fs.mkdirSync(dataDirectory, { recursive: true });
}

const databasePath = path.join(dataDirectory, "cadence.db");

const db = new Database(databasePath);

db.pragma("journal_mode = WAL");

db.exec(`
    CREATE TABLE IF NOT EXISTS media (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        type TEXT NOT NULL,
        genre TEXT,
        rating INTEGER DEFAULT 0,
        finished_at TEXT NOT NULL,
        created_at TEXT NOT NULL
    )
`);

export default db;