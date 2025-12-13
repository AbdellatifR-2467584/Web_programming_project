window.addEventListener('DOMContentLoaded', () => {
    const body = document.body; // select the body element
    if (localStorage.getItem('darkmode') === 'enabled') {
        body.classList.add('dark-mode');
    }
});
document.addEventListener("DOMContentLoaded", async () => {
    const grids = document.getElementsByClassName("grid");

    // Fetch posts
    const urlParams = new URLSearchParams(window.location.search);
    const query = urlParams.get("q") || "";
    const apiUrl = query ? `/api/postsLike?q=${encodeURIComponent(query)}` : "/api/posts";
    const res = await fetch(apiUrl);
    const posts = await res.json();

    // Determine current post ID (if any)
    let currentPostId = null;
    const pathParts = window.location.pathname.split("/").filter(Boolean);
    if (pathParts[0] === "post" && !isNaN(pathParts[1])) {
        currentPostId = parseInt(pathParts[1]);
    }

    // Render cards
    Array.from(grids).forEach(grid => {
        grid.innerHTML = posts
            .filter(post => post.id !== currentPostId)
            .map(post => `
                <div class="card" onclick="location.href='/post/${post.id}'">
                    <img src="/${post.image_path}" alt="Recipe">
                    <button class="grid-favorite-btn ${post.isFavorited ? 'active' : ''}" 
                            onclick="toggleGridFavorite(event, '${post.id}')"
                            title="Opslaan als favoriet">
                        <i class="bi ${post.isFavorited ? 'bi-heart-fill' : 'bi-heart'}"></i>
                    </button>
                </div>
            `).join("");

        const images = grid.querySelectorAll("img");
        let loaded = 0;

        // Wait for images to load
        images.forEach(img => {
            if (img.complete) {
                loaded++;
            } else {
                img.addEventListener("load", () => {
                    loaded++;
                    if (loaded === images.length) {
                        checkMobileLayout(grid);
                        resizeMasonry(grid);
                    }
                });
            }
        });

        if (loaded === images.length) {
            checkMobileLayout(grid);
            resizeMasonry(grid);
        }
    });

    // Restore search input value
    const searchInput = document.querySelector(".searchinput");
    if (searchInput && query) {
        searchInput.value = query;
    }
});

// Resize masonry cards based on image heights
function resizeMasonry(grid) {
    const rowHeight = parseInt(window.getComputedStyle(grid).getPropertyValue('grid-auto-rows'));
    const rowGap = parseInt(window.getComputedStyle(grid).getPropertyValue('gap'));
    const items = grid.querySelectorAll('.card');

    items.forEach(item => {
        const img = item.querySelector('img');
        const itemHeight = img.getBoundingClientRect().height;
        const rowSpan = Math.ceil((itemHeight + rowGap) / (rowHeight + rowGap));
        item.style.gridRowEnd = `span ${rowSpan}`;
    });
}

// ✅ Recalculate on window resize to handle media queries
let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        const grids = document.getElementsByClassName("grid");
        Array.from(grids).forEach(grid => {
            checkMobileLayout(grid);
            resizeMasonry(grid);
        });
    }, 100);
});

function checkMobileLayout(grid) {
    if (window.innerWidth <= 768) {
        grid.style.gridTemplateColumns = "repeat(2, minmax(0, 1fr))";
        grid.style.gap = "0.5rem";
        grid.style.padding = "0.5rem";
    } else {
        grid.style.gridTemplateColumns = "";
        grid.style.gap = "";
        grid.style.padding = "";
    }
}

// Global function for grid favorite button
window.toggleGridFavorite = async function (event, postId) {
    event.stopPropagation(); // Prevent card click (navigation)
    event.preventDefault();

    const btn = event.currentTarget;
    const icon = btn.querySelector("i");

    // Optimistic UI
    const isFilled = icon.classList.contains("bi-heart-fill");
    if (isFilled) {
        icon.classList.remove("bi-heart-fill");
        icon.classList.add("bi-heart");
        btn.classList.remove("active");
    } else {
        icon.classList.remove("bi-heart");
        icon.classList.add("bi-heart-fill");
        btn.classList.add("active");
    }

    try {
        const response = await fetch(`/post/${postId}/favorite`, {
            method: "POST",
            headers: { "Content-Type": "application/json" }
        });

        if (response.status === 401) {
            alert("Je moet ingelogd zijn om favorieten op te slaan.");
            // Revert
            if (isFilled) {
                icon.classList.add("bi-heart-fill");
                icon.classList.remove("bi-heart");
                btn.classList.add("active");
            } else {
                icon.classList.add("bi-heart");
                icon.classList.remove("bi-heart-fill");
                btn.classList.remove("active");
            }
            return;
        }

        // Sync with server response
        const data = await response.json();
        if (data.favorited) {
            icon.classList.remove("bi-heart");
            icon.classList.add("bi-heart-fill");
            btn.classList.add("active");
        } else {
            icon.classList.remove("bi-heart-fill");
            icon.classList.add("bi-heart");
            btn.classList.remove("active");
        }

    } catch (err) {
        console.error("Error toggling favorite:", err);
        // Revert
        if (isFilled) {
            icon.classList.add("bi-heart-fill");
            icon.classList.remove("bi-heart");
            btn.classList.add("active");
        } else {
            icon.classList.add("bi-heart");
            icon.classList.remove("bi-heart-fill");
            btn.classList.remove("active");
        }
    }
};