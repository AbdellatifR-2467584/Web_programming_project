document.addEventListener("DOMContentLoaded", () => {

    const searchForm = document.querySelector(".searchform");
    const searchInput = document.querySelector(".searchinput");

    if (searchForm && searchInput) {
        //haal query op uit de URL, zodat input behouden blijft
        const urlParams = new URLSearchParams(window.location.search);
        const queryParam = urlParams.get("q");
        if (queryParam) {
            searchInput.value = queryParam;
        }

        searchForm.addEventListener("submit", (event) => {
            event.preventDefault();
            const query = searchInput.value.trim();
            //redirect altijd naar de homepagina met query als parameter
            window.location.href = `/?q=${encodeURIComponent(query)}`;
        });

        //live search op de homepage ==> enter is niet nodig dan
        if (window.location.pathname !== "/") return;
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
            `).join(""); //map met posts van grid

            if (typeof resizeMasonry === 'function') {
                resizeMasonry(grid); //resize op basis van de geupdatete grid
            }
        });
    }
});
