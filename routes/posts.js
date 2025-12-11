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

router.post('/post/:id/edit', isAuthenticated, upload.fields([{ name: 'image', maxCount: 1 }, { name: 'media', maxCount: 1 }]), (req, res) => {
    const post = getPostInfoByID(req.params.id);
    if (!post) return res.status(404).send("Post not found");

    if (req.session.user.id !== post.userId) {
        return res.status(403).send("Je hebt geen toegang tot deze post");
    }

    const { title, ingredients, steps, youtube_url, site_url } = req.body;
    // Use forward slashes for cross-platform compatibility
    const image_path = req.files['image'] ? "uploads/" + req.files['image'][0].filename : post.image_path;
    const media_path = req.files['media'] ? "uploads/" + req.files['media'][0].filename : post.media_path;

    const videoId = extractYouTubeId(youtube_url);

    updatePostById(post.id, {
        title,
        ingredients,
        steps,
        youtube_url: videoId ? `https://www.youtube.com/embed/${videoId}` : "",
        site_url,
        image_path,
        media_path
    });

    res.redirect(`/post/${post.id}`);
});

router.post("/post/:id/delete", isAuthenticated, (req, res) => {
    try {
        const post = getPostInfoByID(req.params.id);
        if (!post) return res.status(404).send("Post not found");

        if (req.session.user.id !== post.userId && req.session.user.role !== 'mod') {
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

router.post("/upload", upload.fields([{ name: 'image', maxCount: 1 }, { name: 'media', maxCount: 1 }]), async (request, response) => {
    console.log("Session user:", request.session.user);

    const userId = request.session.user?.id;

    const { title, ingredients, steps, youtube_url, post_url, image_url_external } = request.body;

    let image_path = "";
    let media_path = "";

    try {
        if (request.files['image']) {
            image_path = "uploads/" + request.files['image'][0].filename;
        }
        else if (image_url_external) {
            console.log("AI Afbeelding downloaden van:", image_url_external);

            const res = await fetch(image_url_external);
            if (!res.ok) throw new Error(`Kon afbeelding niet downloaden: ${res.statusText}`);

            const arrayBuffer = await res.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);

            const filename = `ai-${Date.now()}-${Math.floor(Math.random() * 1000)}.jpg`;

            const uploadDir = path.join(process.cwd(), 'uploads');

            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, { recursive: true });
            }

            const filepath = path.join(uploadDir, filename);
            fs.writeFileSync(filepath, buffer);

            image_path = "uploads/" + filename;
        }

        if (request.files['media']) {
            media_path = "uploads/" + request.files['media'][0].filename;
        }

    } catch (error) {
        console.error("Fout bij verwerken afbeelding:", error);
    }

    const videoId = extractYouTubeId(youtube_url);

    createPost({
        userId,
        image_path,
        media_path,
        title,
        ingredients,
        steps,
        youtube_url: videoId ? `https://www.youtube.com/embed/${videoId}` : "",
        post_url
    });

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
                    content: `Je bent een expert in het extraheren van receptdata uit HTML.
                
                Jouw taak is JSON teruggeven in dit formaat:
                {
                "title": "string",
                "ingredients": ["array van strings"],
                "steps": ["array van strings (samengevat, kort en krachtig)"],
                "image_url": "string (URL)",
                "post_url": "string (URL)"
                }

                RICHTLIJNEN VOOR DE AFBEELDING (BELANGRIJK):
                1. Zoek EERST naar een <meta property="og:image"> tag. Dit is de meest betrouwbare afbeelding.
                2. Als die er niet is, zoek naar JSON-LD schema data ("@type": "Recipe") en pak de image url daaruit.
                3. Als laatste redmiddel: pak de src van de grootste <img> tag in de recept-container.
                4. Als je geen URL vindt geef me dan een url naar een foto die te maken heeft met het recept vootbeeld, zet het de naam in het engels. vergeet niet de p voor de title (/p/title):
                Gerecht is Spaghetti Bolo -> URL: "https://pollinations.ai/p/spaghetti-bolognese"
                5. Als de URL relatief is (begint met /), probeer hem compleet te maken met de basis-URL, maar verander niks aan de bestandsnaam.

                Algemene regels:
                - Taal: Nederlands.
                - Als stappen te lang zijn: vat samen.
                - Output moet valid JSON zijn.`
                },
                {
                    role: "user",
                    content: `Haal de data uit deze HTML.
                Basis URL van de pagina: ${url}
                
                HTML Content:
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
        console.log(recept)
        return res.status(200).json({ recept });
    } catch (error) {
        console.error("Fout bij ophalen recept: ", error);
        return res.status(500).json({ error: "Fout bij ophalen recept ooooooooooo" });
    }
});

export default router;
