import Database from "better-sqlite3";

const db = new Database("database.db", { verbose: console.log });

// Enable WAL mode and Foreign Keys globally
db.pragma("journal_mode = WAL;");
db.pragma("foreign_keys = true;");

export default db;
