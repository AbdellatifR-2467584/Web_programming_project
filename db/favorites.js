import db from "./connection.js";

export function InitializeFavoritesDatabase() {
    db.prepare(`
    CREATE TABLE IF NOT EXISTS favorites (
      user_id INTEGER NOT NULL,
      post_id INTEGER NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      PRIMARY KEY (user_id, post_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
    );
  `).run();
}

export function toggleFavorite(userId, postId) {
    // Check if exists
    const exists = db.prepare(`SELECT 1 FROM favorites WHERE user_id = ? AND post_id = ?`).get(userId, postId);

    if (exists) {
        db.prepare(`DELETE FROM favorites WHERE user_id = ? AND post_id = ?`).run(userId, postId);
        return false; // Removed
    } else {
        db.prepare(`INSERT INTO favorites (user_id, post_id) VALUES (?, ?)`).run(userId, postId);
        return true; // Added
    }
}

export function isFavorited(userId, postId) {
    const result = db.prepare(`SELECT 1 FROM favorites WHERE user_id = ? AND post_id = ?`).get(userId, postId);
    return !!result;
}

export function getFavoritesByUser(userId) {
    return db.prepare(`
    SELECT posts.id, posts.image_path, posts.title
    FROM favorites
    JOIN posts ON favorites.post_id = posts.id
    WHERE favorites.user_id = ?
    ORDER BY favorites.created_at DESC
  `).all(userId);
}

export function getPostFavoriteCount(postId) {
    const result = db.prepare(`SELECT COUNT(*) as count FROM favorites WHERE post_id = ?`).get(postId);
    return result ? result.count : 0;
}
