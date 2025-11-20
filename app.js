import express from "express";
import session from "express-session";
import 'dotenv/config';

import { InitializePostsDatabase } from "./db/posts.js";
import { InitializeUsersDatabase } from "./db/users.js";
import { InitializeCommentsDatabase } from "./db/comments.js";

import authRoutes from "./routes/auth.js";
import postRoutes from "./routes/posts.js";
import userRoutes from "./routes/users.js";
import commentRoutes from "./routes/comments.js";
import ingredientRoutes from "./routes/myIngredients.js";
import indexRoutes from "./routes/index.js";

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

// Routes
app.use(authRoutes);
app.use(postRoutes);
app.use(userRoutes);
app.use(commentRoutes);
app.use(ingredientRoutes);
app.use(indexRoutes);

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
InitializeCommentsDatabase();


app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});