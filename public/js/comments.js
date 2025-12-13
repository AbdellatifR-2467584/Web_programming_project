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
                const deleteBtn = (currentUser && (currentUser.id === c.userId || currentUser.role === 'mod'))
                    ? `<span class="delete-comment" data-id="${c.id}" title="Delete">
                <i class="bi bi-trash3-fill"></i>
           </span>`
                    : '';

                return `<div class="comment">
                    <a href="/user/${c.username}" class="comment-pfp-link">
                        <img src="/resources/profilepictures/${c.user_profile_picture}" alt="${c.username}" class="comment-pfp">
                    </a>
                    <div class="comment-content">
                        <strong>
                            <a href="/user/${c.username}" class="comment-user-link">
                                ${c.username}
                            </a>
                        </strong>
                        <span class="comment-text">${c.content}</span>
                    </div>
                    ${deleteBtn}
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
