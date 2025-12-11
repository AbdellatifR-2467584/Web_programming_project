import express from "express";
import bcrypt from "bcrypt";
import { getUserByUsername, createUser, getUserById } from "../db/users.js";
import send2FACodeSMS from "../utils/send2FACodeSMS.js";

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

        if (user.role === 'mod') {
            if (!user.phone_number) {
                // Fallback if no phone number set
                console.warn("Moderator has no phone number, skipping 2FA (INSECURE)");
                req.session.user = { id: user.id, username: user.username, role: user.role };
                return res.redirect("/");
            }

            // 1. Sla tijdelijk op wie er probeert in te loggen
            const code = Math.floor(100000 + Math.random() * 900000);
            req.session.pre2fa = { userId: user.id, code };
            console.log(code);
            // 2. Stuur de code
            //await send2FACodeSMS(user.phone_number, code);

            // 3. Stuur gebruiker naar invulscherm
            return res.redirect("/login/verify");
        }

        // Normale user: direct inloggen
        req.session.user = { id: user.id, username: user.username, role: user.role };
        res.redirect("/");
    } catch (err) {
        console.error(err);
        res.render("login", { error: "Er ging iets mis" });
    }
});

router.get("/login/verify", (req, res) => {
    if (!req.session.pre2fa) return res.redirect("/login");
    res.render("verify", { error: req.query.error === 'wrongcode' ? 'Verkeerde code' : null });
});

router.post("/login/verify", async (req, res) => {
    const { code } = req.body;

    if (!req.session.pre2fa)
        return res.redirect("/login?error=session");

    if (parseInt(code) === req.session.pre2fa.code) {
        // Succes - Fetch user to get full details (username, role)
        const user = await getUserById(req.session.pre2fa.userId);
        if (!user) {
            console.error("User not found after 2FA verification for ID:", req.session.pre2fa.userId);
            delete req.session.pre2fa; // Clear pre2fa session data
            return res.redirect("/login?error=user_not_found");
        }

        req.session.user = { id: user.id, username: user.username, role: user.role };
        delete req.session.pre2fa; // Clear pre2fa session data
        res.redirect("/");
    } else {
        res.redirect("/login/verify?error=wrongcode");
    }
});

// --- LOGOUT ---
router.get("/logout", (req, res) => {
    req.session.destroy(() => {
        res.redirect("/");
    });
});

export default router;
