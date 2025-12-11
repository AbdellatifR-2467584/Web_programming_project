import express from "express";
import bcrypt from "bcrypt";
import { getUserByUsername, createUser } from "../db/users.js";

const router = express.Router();

// --- REGISTER ---
router.get("/register", (req, res) => {
    res.render("register", { error: null });
});

router.post("/register", async (req, res) => {
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
router.get("/login", (req, res) => {
    res.render("login", { error: null });
});

router.post("/login", async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.render("login", { error: "Vul alle velden in" });

    try {
        const user = getUserByUsername(username);
        if (!user) return res.render("login", { error: "Onbekende username" });

        const match = await bcrypt.compare(password, user.password);
        if (!match) return res.render("login", { error: "Verkeerd wachtwoord" });

        // Login success
        req.session.user = { id: user.id, username: user.username, role: user.role };
        res.redirect("/");
    } catch (err) {
        console.error(err);
        res.render("login", { error: "Er ging iets mis" });
    }
});

// --- LOGOUT ---
router.get("/logout", (req, res) => {
    req.session.destroy(() => {
        res.redirect("/");
    });
});

export default router;
