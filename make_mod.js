
import db from "./db/connection.js";

const username = process.argv[2];

if (!username) {
    console.error("Geef een username op: node make_mod.js <username>");
    process.exit(1);
}

const user = db.prepare("SELECT * FROM users WHERE username = ?").get(username);
if (!user) {
    console.error("User niet gevonden.");
    process.exit(1);
}

db.prepare("UPDATE users SET role = 'mod' WHERE id = ?").run(user.id);
console.log(`User ${username} is nu een moderator.`);
