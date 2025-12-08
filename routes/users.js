import express from "express";
import bcrypt from "bcrypt";
import { isAuthenticated } from "../middleware/auth.js";
import { getUserByUsername, updateUsername, getUserById, updatePassword } from "../db/users.js";
import { getAllPostsFromUser } from "../db/posts.js";

const router = express.Router();

router.get("/user/:username", isAuthenticated, (req, res) => {
    try {
        const user = getUserByUsername(req.params.username);
        if (!user) return res.status(404).send("User not found");

        const isOwner = req.session.user && req.session.user.username === user.username;
        const posts = getAllPostsFromUser(user.id);

        res.render("user", { user, posts, isOwner });
    } catch (err) {
        console.error("Error fetching user page:", err);
        res.status(500).send("Failed to load user");
    }
});

router.post("/user/change-username", isAuthenticated, (req, res) => {
    const { newUsername } = req.body;
    const userId = req.session.user.id;

    if (!newUsername) return res.status(400).json({ error: "Vul een nieuwe gebruikersnaam in." });

    const existingUser = getUserByUsername(newUsername);
    if (existingUser) return res.status(400).json({ error: "Deze gebruikersnaam is al in gebruik." });

    const result = updateUsername(userId, newUsername);
    if (result.changes === 0) return res.status(400).json({ error: "Geen gebruiker gevonden met dit ID." });

    req.session.user.username = newUsername;
    return res.json({ success: true, newUsername });
});

router.post("/user/change-password", isAuthenticated, async (req, res) => {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    const user = getUserById(req.session.user.id);

    if (!user) return res.status(400).json({ error: "Gebruiker niet gevonden" });
    if (!currentPassword || !newPassword || !confirmPassword)
        return res.status(400).json({ error: "Vul alle velden in" });
    if (newPassword !== confirmPassword)
        return res.status(400).json({ error: "Nieuw wachtwoord en bevestiging komen niet overeen" });

    const match = await bcrypt.compare(currentPassword, user.password);
    if (!match) return res.status(400).json({ error: "Huidig wachtwoord is incorrect" });

    const hashed = await bcrypt.hash(newPassword, 10);
    updatePassword(user.id, hashed);

    res.json({ success: true });
});

export default router;
