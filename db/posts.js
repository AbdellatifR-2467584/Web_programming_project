import Database from "better-sqlite3";
import { getUserById } from "./users.js";

const db = new Database("posts.db", { verbose: console.log });

export function InitializePostsDatabase() {
  db.prepare(`
    CREATE TABLE IF NOT EXISTS posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      title TEXT,
      image_path TEXT,
      ingredients TEXT,
      steps TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );
  `).run();
}

export function createPost({ userId, title, image_path, ingredients, steps }) {
  const stmt = db.prepare(`
    INSERT INTO posts (userId, title, image_path, ingredients, steps)
    VALUES (?, ?, ?, ?, ?)
  `);
  return stmt.run(userId, title, image_path, JSON.stringify(ingredients), JSON.stringify(steps));
}
export function getAllPosts() {
  return db.prepare(`
    SELECT id, image_path
    FROM posts
    ORDER BY id DESC
  `).all();
}

export function getAllPostsLike(like) {
  const likeTerm = like?.trim() || "";
  const pattern = `%${likeTerm}%`;

  return db.prepare(`
    SELECT id, image_path
    FROM posts
    WHERE title LIKE ?
    ORDER BY id DESC
  `).all(pattern);
}




export function getPostInfoByID(id) {

  const post = db.prepare(`SELECT * FROM posts WHERE id = ?`).get(id);
  if (!post) return null;

  const user = getUserById(post.userId);

  return {
    ...post,
    ingredients: JSON.parse(post.ingredients),
    steps: JSON.parse(post.steps),
    username: user?.username || "Onbekend"
  };
}

export function getPostBySearch(searchTerm) {
  const stmt = db.prepare(`
    SELECT posts.*, users.username 
    FROM posts
    JOIN users ON posts.user_id = users.id
    WHERE posts.title LIKE ?
    ORDER BY posts.id DESC
  `);
  return stmt.all(`%${searchTerm}%`);
}