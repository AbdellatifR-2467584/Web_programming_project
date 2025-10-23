import Database from "better-sqlite3";

const db = new Database("users.db", { verbose: console.log });

export function InitializeUsersDatabase() {
    db.pragma("journal_mode = WAL;");
    db.pragma("foreign_keys = true;");

    db.prepare(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    ) STRICT;
  `).run();
}

export function createUser(username, hashedPassword) {
    const stmt = db.prepare(`
    INSERT INTO users (username, password)
    VALUES (?, ?)
  `);
    return stmt.run(username, hashedPassword);
}

export function getUserByUsername(username) {
    return db.prepare(`
    SELECT * FROM users WHERE username = ?
  `).get(username);
}

export function getUserById(id) {
    return db.prepare(`
    SELECT * FROM users WHERE id = ?
  `).get(id);
}
