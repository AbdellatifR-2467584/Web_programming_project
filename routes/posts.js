import 'dotenv/config';
import express from "express";
import fs from "fs";
import path from "path";
import OpenAI from "openai";
import fetch from "node-fetch";
import { isAuthenticated } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";
import { getAllPosts, getAllPostsLike, getPostInfoByID, updatePostById, deletePostById, createPost } from "../db/posts.js";
import { getUserById } from "../db/users.js";
import { extractYouTubeId } from "../utils/youtube.js";

const router = express.Router();
const openai = process.env.OPENAI_API_KEY
    ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
    : null;

router.get("/api/posts", (req, res) => {
    try {
        const posts = getAllPosts();
        res.json(posts);
    } catch (err) {
        console.error("Fout bij fetchen van posts: ", err);
        res.status(500).json({ error: "Failed to fetch posts" });
    }
});

router.get("/api/postsLike", (req, res) => {
    try {
        const like = req.query.q || "";
        const posts = getAllPostsLike(like);
        res.json(posts);
    } catch (err) {
        console.error("Fout bij fetchen van posts:", err);
        res.status(500).json({ error: "Failed to fetch posts" });
    }
});

router.get("/post/:id", (req, res) => {
    try {
        const post = getPostInfoByID(req.params.id);
        if (!post) return res.status(404).send("Post not found");
        const currentUser = req.session.user || null;
        res.render("post", { post, currentUser });
    } catch (err) {
        console.error("Error fetching post: ", err)
        res.status(500).send("Failed to load post");
    }
});

router.get('/post/:id/volgmee', async (req, res) => {
    try {
        const post = getPostInfoByID(req.params.id);
        if (!post) return res.status(404).send("Post not found");
        res.render('followAlong', { post });
    } catch (err) {
        console.error("Error fetching post: ", err)
        res.status(500).send("Failed to load post");
    }
});

router.get('/post/:id/edit', isAuthenticated, (req, res) => {
    const post = getPostInfoByID(req.params.id);
    if (!post) return res.status(404).send("Post not found");
    if (req.session.user.id !== post.userId) {
        return res.status(403).send("Je hebt geen toegang tot deze post");
    }

    res.render('upload', { post });
});

router.post('/post/:id/edit', isAuthenticated, upload.single('image'), (req, res) => {
    const post = getPostInfoByID(req.params.id);
    if (!post) return res.status(404).send("Post not found");

    if (req.session.user.id !== post.userId) {
        return res.status(403).send("Je hebt geen toegang tot deze post");
    }

    const { title, ingredients, steps, youtube_url, site_url } = req.body;
    // Use forward slashes for cross-platform compatibility
    const image_path = req.file ? "uploads/" + req.file.filename : post.image_path;

    updatePostById(post.id, {
        title,
        ingredients,
        steps,
        youtube_url,
        site_url,
        image_path
    });

    res.redirect(`/post/${post.id}`);
});

router.post("/post/:id/delete", isAuthenticated, (req, res) => {
    try {
        const post = getPostInfoByID(req.params.id);
        if (!post) return res.status(404).send("Post not found");

        if (req.session.user.id !== post.userId) {
            return res.status(403).send("Je hebt geen toegang om dit te verwijderen");
        }

        // Delete from DB
        deletePostById(post.id);

        // Delete image file
        if (post.image_path) {
            // Resolve path safely
            const filePath = path.join(process.cwd(), post.image_path);
            fs.unlink(filePath, (err) => {
                if (err) console.warn("Could not delete image file:", err);
            });
        }

        res.redirect(`/user/${req.session.user.username}`);
    } catch (err) {
        console.error("Error deleting post:", err);
        res.status(500).send("Fout bij verwijderen van post");
    }
});

router.get("/upload", isAuthenticated, (request, response) => {
    response.render("upload", { post: null });
});

router.get("/uploadlink", (request, response) => {
    response.render("uploadlink");
});

router.post("/upload", upload.single("image"), (request, response) => {
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

    const { title, ingredients, steps, youtube_url, post_url } = request.body;
    // Use forward slashes
    const image_path = request.file ? "uploads/" + request.file.filename : "";
    const videoId = extractYouTubeId(youtube_url);
    createPost({ userId, image_path, title, ingredients, steps, youtube_url: `https://www.youtube.com/embed/${videoId}`, post_url });
    response.redirect("/");
});

router.post("/api/fetchrecipe", async (req, res) => {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: "URL is required" });

    try {
        const htmlresponse = await fetch(url);
        const html = await htmlresponse.text();
        console.log(html);

        if (!openai) {
            return res.status(503).json({ error: "OpenAI API key not configured" });
        }

        const completion = await openai.chat.completions.create({
            model: "gpt-4.1-mini",
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
                      "post_url": "https://example.com/recept"
                    }
                    Het moet in het nederlands zijn.
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
    } catch (error) {
        console.error("Fout bij ophalen recept: ", error);
        return res.status(500).json({ error: "Fout bij ophalen recept ooooooooooo" });
    }
});

export default router;
