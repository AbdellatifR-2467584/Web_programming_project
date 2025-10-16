import Database from "better-sqlite3";

const db = new Database("posts.db", { verbose: console.log });

export function InitializePostsDatabase() {
  db.pragma("journal_mode = WAL;");
  db.pragma("busy_timeout = 5000;");
  db.pragma("synchronous = NORMAL;");
  db.pragma("cache_size = 1000000000;");
  db.pragma("foreign_keys = true;");
  db.pragma("temp_store = memory;");

  db.prepare(`
    CREATE TABLE IF NOT EXISTS posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      image_path TEXT NOT NULL,
      title TEXT NOT NULL,
      ingredients TEXT NOT NULL,
      steps TEXT NOT NULL
    ) STRICT
  `).run();
}

export function createPost({ imagePath, title, ingredients, steps }) {
  const stmt = db.prepare(`
    INSERT INTO posts (image_path, title, ingredients, steps)
    VALUES (?, ?, ?, ?)
  `);
  return stmt.run(imagePath, title, ingredients, steps);
}

export function getAllPosts() {
  return db.prepare(`
    SELECT id, image_path
    FROM posts
    ORDER BY id DESC
  `).all();
}

export function getAllPostsLike(like) {
  const pattern = `%${like}%`;
  return db.prepare(`
    SELECT 
      id, 
      image_path,
      title,
      CASE
        WHEN title LIKE ? THEN 1
        ELSE 0
      END AS is_match,
      INSTR(LOWER(title), LOWER(?)) AS position
    FROM posts
    ORDER BY 
      is_match DESC,
      position ASC,
      id DESC
  `).all(pattern, like);
}


export function getPostInfoByID(id) {
  return db.prepare(`
    SELECT *
    FROM posts
    WHERE id = ?
  `).get(id);
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