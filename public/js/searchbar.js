document.addEventListener("DOMContentLoaded", () => {

    const searchForm = document.querySelector(".searchform");
    const searchInput = document.querySelector(".searchinput");

    if (searchForm && searchInput) {
        // Haal query op uit de URL, zodat input behouden blijft
        const urlParams = new URLSearchParams(window.location.search);
        const queryParam = urlParams.get("q");
        if (queryParam) {
            searchInput.value = queryParam;
        }

        searchForm.addEventListener("submit", (event) => {
            event.preventDefault();
            const query = searchInput.value.trim();
            // Redirect altijd naar de homepagina met query als parameter
            window.location.href = `/?q=${encodeURIComponent(query)}`;
        });

        // Optioneel: live search op homepage grid
        searchForm.addEventListener("input", async (event) => {
            event.preventDefault();

            const query = searchInput.value.trim();
            const grid = document.querySelector(".grid");

            if (!grid) return;

            const apiUrl = query ? `/api/postsLike?q=${encodeURIComponent(query)}` : "/api/posts";
            const res = await fetch(apiUrl);
            const posts = await res.json();

            grid.innerHTML = posts.map(post => `
                <div class="card" onclick="location.href='/post/${post.id}'">
                    <img src="/${post.image_path}" alt="Recipe">
                </div>
            `).join("");

            if (typeof resizeMasonry === 'function') {
                resizeMasonry(grid);
            }
        });
    }
});
