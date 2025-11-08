import express from "express";
import fetch from "node-fetch";
import OpenAI from "openai";
import path from "path";
import multer from "multer";
import session from "express-session";
import bcrypt from "bcrypt";
import 'dotenv/config';
import { InitializePostsDatabase, createPost, getAllPosts, getPostInfoByID, getAllPostsLike } from "./db/posts.js";
import { InitializeUsersDatabase, createUser, getUserByUsername, getUserById } from "./db/users.js";
import { extractYouTubeId } from './utils/youtube.js';


const app = express();
const port = process.env.PORT || 8080; // Set by Docker Entrypoint or use 8080

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
// set the view engine to ejs
app.set("view engine", "ejs");
app.set("views", "./views");

// process.env.DEPLOYMENT is set by Docker Entrypoint
if (!process.env.DEPLOYMENT) {
  console.info("Development mode");
  // Serve static files from the "views" directory
  app.use(express.static("./views"));
}

// Session middleware
app.use(session({
  secret: process.env.SESSION_SECRET || "supersecretkey",
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 * 24 } // 1 dag
}));

// Middleware om user in EJS beschikbaar te maken
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  next();
});

app.use("/uploads", express.static("uploads"));

// Middleware for serving static files
app.use(express.static("public"));

// Middleware for parsing JSON bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Middleware for debug logging
app.use((request, response, next) => {
  console.log(
    `Request URL: ${request.url} @ ${new Date().toLocaleString("nl-BE")}`
  );
  next();
});

const storage = multer.diskStorage({
  destination: (request, file, cb) => cb(null, "uploads/"),
  filename: (request, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

// Your routes here ...
app.get("/api/posts", (req, res) => {
  try {
    const posts = getAllPosts();
    res.json(posts);
  } catch (err) {
    console.error("Fout bij fetchen van posts: ", err);
    res.status(500).json({ error: "Failed to fetch posts" });
  }

});

app.get("/api/postsLike", (req, res) => {
  try {
    const like = req.query.q || "";
    const posts = getAllPostsLike(like);
    res.json(posts);
  } catch (err) {
    console.error("Fout bij fetchen van posts:", err);
    res.status(500).json({ error: "Failed to fetch posts" });
  }
});


app.get("/post/:id", (req, res) => {
  try {
    const post = getPostInfoByID(req.params.id);
    if (!post) return res.status(404).send("Post not found");

    res.render("post", { post }); // Render post.ejs with the post data
  } catch (err) {
    console.error("Error fetching post: ", err)
    res.status(500).send("Failed to load post");
  }
});

app.get('/post/:id/volgmee', async (req, res) => {
  try {
    const post = getPostInfoByID(req.params.id);
    if (!post) return res.status(404).send("Post not found");
    res.render('followAlong', { post });
  } catch (err) {
    console.error("Error fetching post: ", err)
    res.status(500).send("Failed to load post");
  }
});


app.get("/", (request, response) => {
  const posts = getAllPosts();
  response.render("index", { posts });
});

app.get("/v1", (request, response) => {
  response.redirect("/");
});

app.get("/upload", (request, response) => {
  response.render("upload");
});

app.get("/uploadlink", (request, response) => {
  response.render("uploadlink");
});



app.post("/upload", upload.single("image"), (request, response) => {
  console.log("Session user:", request.session.user);

  const userId = request.session.user?.id;
  if (!userId) {
    console.log("Niet ingelogd, redirecting naar /login");
    return response.redirect("/login");
  }


  const user = getUserById(userId);
  if (!user) {
    console.log("User bestaat niet in users.db");
    return request.status(400).send("Ongeldige gebruiker");
  }


  const { title, ingredients, steps, youtube_url, site_url } = request.body;
  const image_path = "\\" + request.file.path;
  const videoId = extractYouTubeId(youtube_url);
  createPost({ userId, image_path, title, ingredients, steps, youtube_url: `https://www.youtube.com/embed/${videoId}`, site_url });
  response.redirect("/");
});


app.post("/api/fetchrecipe", async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: "URL is required" });

  try {
    const htmlresponse = await fetch(url);
    const html = await htmlresponse.text();
    console.log(html);

    const completion = await openai.chat.completions.create({
      model: "gpt-4.1",
      messages: [
        {
          role: "system",
          content: `Je bent een assistent die recepten structureert in JSON.
                    Het antwoord MOET altijd geldig JSON zijn met deze structuur:
                    {
                      "title": "string",
                      "ingredients": ["array van strings"],
                      "steps": ["array van strings"],
                      "image_url": "https://example.com/spaghetti.jpg",
                      "post_url": "https://example.com/spaghetti.jpg"
                    }
                    Als een veld ontbreekt, vul het aan met een lege string of lege array.
                    Zorg dat het antwoord samengevat is GEEN lang antwoord gwn kort en krachtig, als de stappen teveel zijn vat het samen. Als je geen afbleeding kan vinden vul dan een afbeelding die overeenkomt met het recept. Voeg ook url van het recept toe die zal ik meesturen naast de HTML`
        },
        {
          role: "user",
          content: `Haal uit de volgende HTML de titel, ingrediënten, stappen, url en url van de foto van het recept. Geef JSON terug:
          HTML:
          ${html}
          URL:
          ${url}`
        },
      ],
      response_format: { type: "json_object" }
    });

    let recept;
    if (typeof completion.choices[0].message.content === 'string') {
      try {
        recept = JSON.parse(completion.choices[0].message.content);
        console.log("recept is geen JSON----------------");
      } catch {
        // fallback, gewoon tekst teruggeven
        recept = { title: "", ingredients: [], steps: [] };
        console.log("recept is geen JSON----------------");
      }
    } else {
      recept = completion.choices[0].message.content;
      console.log("recept is al JSON----------------");
    }

    return res.status(200).json({ recept });
    console.log("Na return statement"); // This will never be executed
  } catch (error) {
    console.error("Fout bij ophalen recept: ", error);
    return res.status(500).json({ error: "Fout bij ophalen recept ooooooooooo" });
  }
});

// --- REGISTER ---
app.get("/register", (req, res) => {
  res.render("register", { error: null });
});

app.post("/register", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.render("register", { error: "Vul alle velden in" });

  try {
    const existingUser = getUserByUsername(username);
    if (existingUser) return res.render("register", { error: "Username bestaat al" });

    const hashedPassword = await bcrypt.hash(password, 10);
    createUser(username, hashedPassword);
    res.redirect("/login");
  } catch (err) {
    console.error(err);
    res.render("register", { error: "Er ging iets mis" });
  }
});

// --- LOGIN ---
app.get("/login", (req, res) => {
  res.render("login", { error: null });
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.render("login", { error: "Vul alle velden in" });

  try {
    const user = getUserByUsername(username);
    if (!user) return res.render("login", { error: "Onbekende username" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.render("login", { error: "Verkeerd wachtwoord" });

    // Login success
    req.session.user = { id: user.id, username: user.username };
    res.redirect("/");
  } catch (err) {
    console.error(err);
    res.render("login", { error: "Er ging iets mis" });
  }
});

// --- LOGOUT ---
app.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/login");
  });
});

// --- Middleware om routes te beschermen ---
function isAuthenticated(req, res, next) {
  if (req.session.user) return next();
  res.redirect("/login");
}

// Middleware for unknown routes
// Must be last in pipeline
app.use((request, response, next) => {
  response.status(404).send("Sorry can't find that!");
});

// Middleware for error handling
app.use((error, request, response, next) => {
  console.error(error.stack);
  response.status(500).send("Something broke!");
});

// App starts here
InitializeUsersDatabase();
InitializePostsDatabase();



app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

//