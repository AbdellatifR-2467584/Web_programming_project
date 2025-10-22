document.addEventListener("DOMContentLoaded", async () => {
    const grids = document.getElementsByClassName("gridSearch");
    const postTitle = document.getElementById("postTitel")?.innerText || "";
    const res = await fetch(`/api/postsLike?q=${encodeURIComponent(postTitle)}`);
    const postsLike = await res.json();
    let currentPostId = null;
    const pathParts = window.location.pathname.split("/").filter(Boolean);
    if (pathParts[0] === "post" && !isNaN(pathParts[1])) {
        currentPostId = parseInt(pathParts[1]);
    }


    for (const grid of grids) {
        grid.innerHTML = postsLike
            .filter(post => post.id !== currentPostId)
            .map(post => `
        <div class="card" onclick="location.href='/post/${post.id}'">
            <img src="${post.image_path}" alt="Recipe">
        </div>
    `).join("");
        const images = grid.querySelectorAll("img");
        let loaded = 0;
        images.forEach(img => {
            if (img.complete) {
                loaded++;
            } else {
                img.addEventListener("load", () => {
                    loaded++;
                    if (loaded === images.length) resizeMasonry(grid);
                });
            }
        });
        if (loaded === images.length) resizeMasonry(grid);
    }
});

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