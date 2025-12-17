import express from "express";
import bcrypt from "bcrypt";
import { getUserByUsername, createUser, getUserById } from "../db/users.js";
import send2FACodeSMS from "../utils/send2FACodeSMS.js";
import sgMail from '@sendgrid/mail';
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const router = express.Router();

//registers
router.get("/register", (req, res) => {
    res.render("register", { error: null });
});

router.post("/register", async (req, res) => {
    const { username, password, contact } = req.body;
    if (!username || !password || !contact) return res.render("register", { error: "Vul alle velden in" });

    try {
        const existingUser = getUserByUsername(username);
        if (existingUser) return res.render("register", { error: "Username bestaat al" });

        const hashedPassword = await bcrypt.hash(password, 10);

        let phoneNumber = null;
        let email = null;

        if (contact.includes('@')) {
            email = contact;
        } else {
            //valideer gsm nummer
            //verwijder dashes en spaces
            const cleanContact = contact.replace(/[\s-]/g, '');
            if (!cleanContact.startsWith('+32')) {
                return res.render("register", { error: "Telefoonnummer moet beginnen met +32." });
            }
            if (!/^\+\d+$/.test(cleanContact)) {
                return res.render("register", { error: "Ongeldig telefoonnummer formaat." });
            }
            phoneNumber = cleanContact;
        }

        createUser(username, hashedPassword, phoneNumber, email);
        res.redirect("/login");
    } catch (err) {
        if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
            return res.render("register", { error: "Gebruiker met dit emailadres of gebruikersnaam bestaat al." });
        }
        console.error(err);
        res.render("register", { error: "Er ging iets mis" });
    }
});

//login
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

        if (user.role === 'mod' || user.two_factor_enabled) {

            // Generate Code
            const code = Math.floor(100000 + Math.random() * 900000);
            req.session.pre2fa = { userId: user.id, code };
            console.log("Generated 2FA Code:", code);

            let method = user.two_factor_method || 'email';


            if (method === 'sms') {
                if (!user.phone_number) {
                    console.warn("User needs SMS 2FA but has no phone number.");
                    if (user.role === 'mod' && !user.two_factor_enabled) {
                        console.warn("Moderator has no phone number, skipping 2FA (INSECURE)");
                        req.session.user = { id: user.id, username: user.username, role: user.role, profile_picture: user.profile_picture };
                        return res.redirect("/");
                    }
                    return res.render("login", { error: "Geen telefoonnummer ingesteld voor 2FA." });
                }
                const smsSent = await send2FACodeSMS(user.phone_number, code);
                if (!smsSent) {
                    console.log("SMS failed or not configured. Use console code.");
                }

            } else if (method === 'email') {
                if (!user.email) {
                    return res.render("login", { error: "Geen email ingesteld voor 2FA." });
                }

                if (!process.env.SENDGRID_API_KEY) {
                    console.log("SENDGRID_API_KEY missing. 2FA Code in console:", code);
                } else {
                    const msg = {
                        to: user.email,
                        from: 'ryadabdellatif@gmail.com',
                        subject: 'Jouw 2FA Verificatiecode',
                        text: `Je verificatiecode is: ${code}`,
                        html: `<strong>Je verificatiecode is: ${code}</strong>`,
                    };

                    try {
                        await sgMail.send(msg);
                    } catch (error) {
                        console.error("SendGrid Error:", error);
                        if (error.response) {
                            console.error(error.response.body);
                        }
                        return res.render("login", { error: "Kon email niet verzenden." });
                    }
                }
            }

            // 3. Stuur gebruiker naar invulscherm
            return res.redirect("/login/verify");
        }

        // Normale user: direct inloggen
        req.session.user = { id: user.id, username: user.username, role: user.role, profile_picture: user.profile_picture };
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

        req.session.user = { id: user.id, username: user.username, role: user.role, profile_picture: user.profile_picture };
        delete req.session.pre2fa; // Clear pre2fa session data
        res.redirect("/");
    } else {
        res.redirect("/login/verify?error=wrongcode");
    }
});

//log uit
router.get("/logout", (req, res) => {
    req.session.destroy(() => {
        res.redirect("/");
    });
});

export default router;
