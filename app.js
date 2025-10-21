import express from "express";
import fetch from "node-fetch";
import OpenAI from "openai";
import path from "path";
import multer from "multer";
import 'dotenv/config';
import { InitializePostsDatabase, createPost, getAllPosts, getPostInfoByID, getAllPostsLike } from "./db/posts.js";


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
// send LLM antwoord van recept


// get uploaded images

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

app.use("/uploads", express.static("uploads"));

// Middleware for serving static files
app.use(express.static("public"));

// Middleware for parsing JSON bodies
app.use(express.json());

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
  const { title, ingredients, steps } = request.body;
  const imagePath = "\\" + request.file.path;

  createPost({ imagePath, title, ingredients, steps });
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
                      "steps": ["array van strings"]
                    }
                    Als een veld ontbreekt, vul het aan met een lege string of lege array.
                    Zorg dat het antwoord samengevat is GEEN lang antwoord gwn kort en krachtig, als de stappen teveel zijn vat het samen.`
        },
        {
          role: "user",
          content: `Haal uit de volgende HTML de titel, ingrediënten en stappen van het recept. Geef JSON terug:
          HTML:
          ${html}`
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
InitializePostsDatabase();



app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

//