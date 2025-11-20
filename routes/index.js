import express from "express";
import { getAllPosts } from "../db/posts.js";

const router = express.Router();

router.get("/", (request, response) => {
    const posts = getAllPosts();
    response.render("index", { posts });
});

router.get("/v1", (request, response) => {
    response.redirect("/");
});

export default router;
