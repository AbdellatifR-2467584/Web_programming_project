import Database from "better-sqlite3";
import { getUserById } from "./users.js";

const db = new Database("comments.db", { verbose: console.log });

export function InitializeCommentsDatabase() {
    db.prepare(`
      CREATE TABLE IF NOT EXISTS comments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        postId INTEGER NOT NULL,
        userId INTEGER NOT NULL,
        content TEXT NOT NULL,
        created_at TEXT DEFAULT (datetime('now'))
      );
    `).run();
}

export function addComment(postId, userId, content) {
    const stmt = db.prepare(`
      INSERT INTO comments (postId, userId, content)
      VALUES (?, ?, ?)
    `);
    return stmt.run(postId, userId, content);
}

export function getCommentsByPostId(postId) {
    const rows = db.prepare(`
      SELECT * FROM comments
      WHERE postId = ?
      ORDER BY created_at ASC
    `).all(postId);

    // Attach username dynamically from users.db
    return rows.map(row => ({
        ...row,
        username: getUserById(row.userId)?.username || "Unknown"
    }));
}

export function deleteCommentById(commentId) {
    const stmt = db.prepare(`DELETE FROM comments WHERE id = ?`);
    return stmt.run(commentId);
}

export function getCommentById(commentId) {
    const row = db.prepare(`SELECT * FROM comments WHERE id = ?`).get(commentId);
    if (!row) return null;
    return {
        ...row,
        username: getUserById(row.userId)?.username || "Unknown"
    };
}
