
import db from "./db/connection.js";

console.log("Starting migration...");

try {
    db.prepare("ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'user'").run();
    console.log("Migration successful: Added 'role' column to 'users' table.");
} catch (error) {
    if (error.message.includes("duplicate column name")) {
        console.log("Migration skipped: 'role' column already exists.");
    } else {
        console.error("Migration failed:", error);
    }
}
