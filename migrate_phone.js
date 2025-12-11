
import db from "./db/connection.js";

console.log("Starting migration (Phone Number)...");

try {
    db.prepare("ALTER TABLE users ADD COLUMN phone_number TEXT").run();
    console.log("Migration successful: Added 'phone_number' column to 'users' table.");
} catch (error) {
    if (error.message.includes("duplicate column name")) {
        console.log("Migration skipped: 'phone_number' column already exists.");
    } else {
        console.error("Migration failed:", error);
    }
}
