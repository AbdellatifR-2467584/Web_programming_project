document.addEventListener("DOMContentLoaded", () => {
    const homeButton = document.querySelector(".bi.bi-house");
    const uploadButton = document.querySelector(".bi.bi-upload");
    const uploadLinkButton = document.querySelector(".bi.bi-link-45deg");

    homeButton.addEventListener("click", () => {
        window.location.href = "/";
    });

    uploadButton.addEventListener("click", () => {
        window.location.href = "/upload";
    });

    uploadLinkButton.addEventListener("click", () => {
        window.location.href = "/uploadlink";
    });

    const searchForm = document.querySelector(".searchform");
    const searchInput = document.querySelector(".searchinput");

    searchForm.addEventListener("submit", async (event) => {
    event.preventDefault(); // voorkomt herladen van de pagina

    const query = searchInput.value.trim();
    const grid = document.querySelector(".grid");

    if (query) {
        const res = await fetch(`/api/postsLike?q=${encodeURIComponent(query)}`);
        const posts = await res.json();

        grid.innerHTML = posts.map(post => `
            <div class="card" onclick="location.href='/post/${post.id}'">
                <img src="${post.image_path}" alt="Recipe">
            </div>
        `).join("");

        resizeMasonry(grid);
    } else {
        // Als het zoekveld leeg is, toon opnieuw alle posts
        const res = await fetch("/api/posts");
        const posts = await res.json();

        grid.innerHTML = posts.map(post => `
            <div class="card" onclick="location.href='/post/${post.id}'">
                <img src="${post.image_path}" alt="Recipe">
            </div>
        `).join("");

        resizeMasonry(grid);
    }
    });
});


document.addEventListener("DOMContentLoaded", async () => {
    const grids = document.getElementsByClassName("grid");
    const res = await fetch("/api/posts");
    const posts = await res.json();
    for (const grid of grids) {
        grid.innerHTML = posts.map(post => `
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
