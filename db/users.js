import db from "./connection.js";

export function InitializeUsersDatabase() {
  db.prepare(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'user',
      phone_number TEXT,
      email TEXT UNIQUE,
      two_factor_enabled INTEGER DEFAULT 0,
      two_factor_method TEXT DEFAULT 'email',
      created_at TEXT DEFAULT (datetime('now')),
      profile_picture TEXT DEFAULT 'default.png'
    ) STRICT;
  `).run();

  try {
    db.prepare(`ALTER TABLE users ADD COLUMN profile_picture TEXT DEFAULT 'default.png'`).run();
  } catch (e) {
    // Column likely already exists
  }

  try {
    db.prepare(`ALTER TABLE users ADD COLUMN email TEXT`).run();
  } catch (e) {
    // Column likely already exists
  }

  try {
    db.prepare(`CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email ON users(email)`).run();
  } catch (e) {
    // Index likely already exists
  }

  try {
    db.prepare(`ALTER TABLE users ADD COLUMN two_factor_enabled INTEGER DEFAULT 0`).run();
  } catch (e) { }

  try {
    db.prepare(`ALTER TABLE users ADD COLUMN two_factor_method TEXT DEFAULT 'email'`).run();
  } catch (e) { }
}

export function createUser(username, hashedPassword, phone_number = null, email = null) {
  const stmt = db.prepare(`
    INSERT INTO users (username, password, phone_number, email)
    VALUES (?, ?, ?, ?)
  `);
  return stmt.run(username, hashedPassword, phone_number, email);
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

export function updateEmail(userId, email) {
  const stmt = db.prepare(`
    UPDATE users
    SET email = ?
    WHERE id = ?
  `);
  return stmt.run(email, userId);
}

export function updatePhone(userId, phone) {
  const stmt = db.prepare(`
    UPDATE users
    SET phone_number = ?
    WHERE id = ?
  `);
  return stmt.run(phone, userId);
}

export function getUserByEmail(email) {
  return db.prepare(`
    SELECT * FROM users WHERE email = ?
  `).get(email);
}

export function getUserByPhone(phone) {
  return db.prepare(`
    SELECT * FROM users WHERE phone_number = ?
  `).get(phone);
}

export function updateTwoFactor(userId, enabled, method) {
  const stmt = db.prepare(`
    UPDATE users
    SET two_factor_enabled = ?, two_factor_method = ?
    WHERE id = ?
  `);
  return stmt.run(enabled ? 1 : 0, method, userId);
}

