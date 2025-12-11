
import db from "./db/connection.js";
const users = db.prepare("SELECT * FROM users").all();
console.log(users);
