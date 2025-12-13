import db from "./connection.js";

export function InitializeUsersDatabase() {
  db.prepare(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'user',
      phone_number TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      profile_picture TEXT DEFAULT 'default.png'
    ) STRICT;
  `).run();

    try {
      db.prepare(`ALTER TABLE users ADD COLUMN profile_picture TEXT DEFAULT 'default.png'`).run();
    } catch (e) {
      // Column likely already exists
    }
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

export function updateUsername(userId, newUsername) {
  const stmt = db.prepare(`
    UPDATE users
    SET username = ?
    WHERE id = ?
  `);
  return stmt.run(newUsername, userId);
}



export function updatePassword(userId, hashedPassword) {
  const stmt = db.prepare(`
    UPDATE users
    SET password = ?
    WHERE id = ?
  `);
    return stmt.run(hashedPassword, userId);
}

export function updateProfilePicture(userId, filename) {
  const stmt = db.prepare(`
    UPDATE users
    SET profile_picture = ?
    WHERE id = ?
  `);
  return stmt.run(filename, userId);
}

