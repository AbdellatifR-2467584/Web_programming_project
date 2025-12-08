import express from "express";
import { isAuthenticated } from "../middleware/auth.js";
import { getAllUniqueIngredients, getPostsByIngredients } from "../db/posts.js";

const router = express.Router();

router.get("/my-ingredients", (req, res) => {
    try {
        const allIngredients = getAllUniqueIngredients();
        res.render("my-ingredients", {
            user: req.session.user,
            allIngredients: allIngredients
        });
    } catch (err) {
        console.error(err);
        res.status(500).send("Er ging iets mis bij het laden van de ingrediënten.");
    }
});


router.get("/api/recipes-by-ingredients", (req, res) => {
    try {
        const selectedIngredients = req.query.ingredients
            ? req.query.ingredients.split(',')
            : [];

        const posts = getPostsByIngredients(selectedIngredients);
        res.json(posts);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Kon recepten niet filteren." });
    }
});

export default router;
