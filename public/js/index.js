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

    searchForm.addEventListener("submit", (event) => {
        event.preventDefault(); // voorkomt herladen van de pagina

        const query = searchInput.value.trim();

        if (query) {
            // hier ga je de grid refreshen met zoekresultaat in de database


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
    }
});
