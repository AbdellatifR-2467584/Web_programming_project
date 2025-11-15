export default function initComments(postId) {
    const postDiv = document.getElementById("post");
    const currentUserData = postDiv?.dataset?.currentUser;
    const currentUser = currentUserData ? JSON.parse(currentUserData) : null;

    const commentList = document.getElementById("comment-list");
    const commentInput = document.getElementById("comment-input");
    const commentSubmit = document.getElementById("comment-submit");

    async function loadComments() {
        if (!commentList) return;
        try {
            const res = await fetch(`/api/post/${postId}/comments`);
            const comments = await res.json();

            commentList.innerHTML = comments.map(c => {
                const deleteBtn = (currentUser && currentUser.id === c.userId)
                    ? `<span class="delete-comment" data-id="${c.id}" title="Delete">
                <i class="bi bi-trash"></i>
           </span>`
                    : '';

                return `<div class="comment">
                <p>
                    <strong>${c.username}:</strong> ${c.content}
                    <span class="delete-wrapper">${deleteBtn}</span>
                </p>
            </div>`;
            }).join("");

            // attach delete listeners
            document.querySelectorAll(".delete-comment").forEach(btn => {
                btn.addEventListener("click", async () => {
                    const commentId = btn.dataset.id;
                    try {
                        await fetch(`/api/comments/${commentId}`, { method: "DELETE" });
                        loadComments();
                    } catch (err) {
                        console.error("Failed to delete comment:", err);
                    }
                });
            });

        } catch (err) {
            console.error("Failed to load comments:", err);
        }
    }

    if (commentSubmit && commentInput) {
        commentSubmit.addEventListener("click", async () => {
            const content = commentInput.value.trim();
            if (!content) return;

            try {
                await fetch(`/api/post/${postId}/comments`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ content })
                });
                commentInput.value = "";
                loadComments();
            } catch (err) {
                console.error("Failed to post comment:", err);
            }
        });
    }

    loadComments();
}
