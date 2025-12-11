
import db from "./db/connection.js";
const users = db.prepare("SELECT username, role FROM users").all();
console.log(users);
