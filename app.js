import express from "express";
import { InitializePostsDatabase, createPost, getAllPosts, getPostInfoByID } from "./db/posts.js";

import path from "path";
import multer from "multer";

const app = express();
const port = process.env.PORT || 8080; // Set by Docker Entrypoint or use 8080

// set the view engine to ejs
app.set("view engine", "ejs");
app.set("views", "./views");

// process.env.DEPLOYMENT is set by Docker Entrypoint
if (!process.env.DEPLOYMENT) {
  console.info("Development mode");
  // Serve static files from the "views" directory
  app.use(express.static("./views"));
}


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

