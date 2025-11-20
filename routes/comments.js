import express from "express";
import { isAuthenticated } from "../middleware/auth.js";
import { addComment, getCommentsByPostId, getCommentById, deleteCommentById } from "../db/comments.js";

const router = express.Router();

router.post("/api/post/:id/comments", isAuthenticated, (req, res) => {
    try {
        const postId = req.params.id;
        const userId = req.session.user.id;
        const { content } = req.body;

        if (!content || content.trim() === "") {
            return res.status(400).json({ error: "Comment mag niet leeg zijn" });
        }

        addComment(postId, userId, content.trim());
        const comments = getCommentsByPostId(postId);
        res.json(comments);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Kon comment niet toevoegen" });
    }
});

router.get("/api/post/:id/comments", (req, res) => {
    const postId = parseInt(req.params.id, 10);
    const comments = getCommentsByPostId(postId);
    res.json(comments);
});

router.delete("/api/comments/:id", isAuthenticated, (req, res) => {
    try {
        const commentId = parseInt(req.params.id, 10);
        const comment = getCommentById(commentId);

        if (!comment) return res.status(404).json({ error: "Comment not found" });
        if (comment.userId !== req.session.user.id)
            return res.status(403).json({ error: "Not allowed to delete this comment" });

        deleteCommentById(commentId);
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to delete comment" });
    }
});

export default router;
