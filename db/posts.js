import db from "./connection.js";
import { getUserById } from "./users.js";

export function InitializePostsDatabase() {
  db.prepare(`
    CREATE TABLE IF NOT EXISTS posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      title TEXT,
      image_path TEXT,
      media_path TEXT,
      ingredients TEXT,
      steps TEXT,
      youtube_url TEXT,
      post_url TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
    );
  `).run();
}

export function createPost({ userId, title, image_path, media_path, ingredients, steps, youtube_url, post_url }) {
  // Filter lege inputs uit
  const cleanIngredients = (ingredients || []).filter(item => item && item.trim() !== "");
  const cleanSteps = (steps || []).filter(item => item && item.trim() !== "");
  const stmt = db.prepare(`
    INSERT INTO posts (userId, title, image_path, media_path, ingredients, steps, youtube_url, post_url)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  return stmt.run(userId, title, image_path, media_path || null, JSON.stringify(cleanIngredients), JSON.stringify(cleanSteps), youtube_url || null, post_url || null);
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
    username: user?.username || "Onbekend",
    user_profile_picture: user?.profile_picture || "default.png"
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

export function getAllPostsFromUser(id) {
  const stmt = db.prepare(`
    SELECT id, image_path
    FROM posts
    WHERE userId = ?
    ORDER BY id DESC
  `);
  return stmt.all(id);
}

export function deletePostById(id) {
  const stmt = db.prepare(`DELETE FROM posts WHERE id = ?`);
  stmt.run(id);
}

export function updatePostById(id, { title, ingredients, steps, youtube_url, post_url, image_path, media_path }) {
  const cleanIngredients = (ingredients || []).filter(item => item && item.trim() !== "");
  const cleanSteps = (steps || []).filter(item => item && item.trim() !== "");

  const stmt = db.prepare(`
    UPDATE posts SET
      title = ?,
      ingredients = ?,
      steps = ?,
      youtube_url = ?,
      post_url = ?,
      image_path = ?,
      media_path = ?
    WHERE id = ?
  `);

  return stmt.run(
    title,
    JSON.stringify(cleanIngredients),
    JSON.stringify(cleanSteps),
    youtube_url || null,
    post_url || null,
    image_path || null,
    media_path || null,
    id
  );
}

export function getAllUniqueIngredients() {
  const allIngredientRows = db.prepare(`SELECT ingredients FROM posts`).all();
  const ingredientSet = new Set();

  for (const row of allIngredientRows) {
    try {
      const ingredients = JSON.parse(row.ingredients);
      if (Array.isArray(ingredients)) {
        ingredients.forEach(ing => {
          if (ing && ing.trim() !== "") {
            // Normaliseer: kleine letters en trimmen
            ingredientSet.add(ing.trim().toLowerCase());
          }
        });
      }
    } catch (e) {
      console.error("Fout bij parsen van ingrediënten JSON:", e);
    }
  }
  // Sorteer de unieke ingrediënten alfabetisch
  return Array.from(ingredientSet).sort();
}

export function getPostsByIngredients(userIngredients = []) {
  // Maak een Set van de geselecteerde ingrediënten voor snelle lookups
  const userIngSet = new Set(userIngredients.map(i => i.toLowerCase().trim()));

  // Als er geen ingrediënten zijn geselecteerd, geef niets terug
  if (userIngSet.size === 0) {
    return [];
  }

  const allPosts = db.prepare('SELECT id, image_path, ingredients FROM posts').all();

  const matchingPosts = allPosts.filter(post => {
    try {
      const recipeIngredients = JSON.parse(post.ingredients);

      // Sla recepten over zonder (geldige) ingrediëntenlijst
      if (!Array.isArray(recipeIngredients) || recipeIngredients.length === 0) {
        return false;
      }

      // Controleer of ELK ingrediënt van het recept in de lijst van de gebruiker zit
      return recipeIngredients.every(rIng => {
        return rIng && userIngSet.has(rIng.trim().toLowerCase());
      });
    } catch (e) {
      return false; // Sla posts met ongeldige JSON over
    }
  });

  // Geef alleen de data terug die de grid nodig heeft
  return matchingPosts.map(p => ({ id: p.id, image_path: p.image_path }));
}
