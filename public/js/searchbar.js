document.addEventListener("DOMContentLoaded", () => {

    const searchForm = document.querySelector(".searchform");
    const searchInput = document.querySelector(".searchinput");

    if (searchForm && searchInput) {
        searchForm.addEventListener("submit", (event) => {
            event.preventDefault(); 
            //rederict naar index en vul in de searchbar de searchinput in
        });
        searchForm.addEventListener("input", async (event) => {
            event.preventDefault();

            const query = searchInput.value.trim();
            const grid = document.querySelector(".grid");

            if (!grid) return;

            if (query) {
                const res = await fetch(`/api/postsLike?q=${encodeURIComponent(query)}`);
                const posts = await res.json();

                grid.innerHTML = posts.map(post => `
                <div class="card" onclick="location.href='/post/${post.id}'">
                    <img src="/${post.image_path}" alt="Recipe">
                </div>
            `).join("");

                if (typeof resizeMasonry === 'function') {
                    resizeMasonry(grid);
                }
            } else {
                const res = await fetch("/api/posts");
                const posts = await res.json();

                grid.innerHTML = posts.map(post => `
                <div class="card" onclick="location.href='/post/${post.id}'">
                    <img src="/${post.image_path}" alt="Recipe">
                </div>
            `).join("");

                if (typeof resizeMasonry === 'function') {
                    resizeMasonry(grid);
                }
            }
        });
    }
});
