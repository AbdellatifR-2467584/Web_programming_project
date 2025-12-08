window.addEventListener('DOMContentLoaded', () => {
    const body = document.body;
    if (localStorage.getItem('darkmode') === 'enabled') {
        body.classList.add('dark-mode');
    }
});

document.addEventListener("DOMContentLoaded", () => {
    const searchInput = document.getElementById("ingredient-search");
    const ingredientList = document.getElementById("ingredient-list");
    const findButton = document.getElementById("find-recipes-btn");
    const recipesGrid = document.getElementById("recipes-grid");
    const labels = ingredientList.querySelectorAll(".ingredient-label");
    const loadMoreBtn = document.getElementById("load-more-btn");
    let visibleLimit = 20;


    function applyLimit() {
        const query = searchInput.value.toLowerCase().trim();

        // Als we aan het zoeken zijn, negeer de limiet en verberg de knop
        if (query.length > 0) {
            loadMoreBtn.classList.add("hidden");
            return;
        }

        // Als we NIET zoeken, pas de 'Toon meer' logica toe
        labels.forEach((label, index) => {
            if (index >= visibleLimit) {
                label.classList.add("hidden");
            } else {
                label.classList.remove("hidden");
            }
        });

        // Verberg knop als alles getoond is
        if (visibleLimit >= labels.length) {
            loadMoreBtn.classList.add("hidden");
        } else {
            loadMoreBtn.classList.remove("hidden");
            loadMoreBtn.innerText = "Toon meer ingrediënten";
        }
    }

    // Voer direct uit bij laden
    applyLimit();

    // Event listener voor de knop
    loadMoreBtn.addEventListener("click", () => {
        visibleLimit += 20; // Laat er 20 meer zien
        applyLimit();
    });


    searchInput.addEventListener("input", () => {
        const query = searchInput.value.toLowerCase().trim();
        if (searchInput.value.trim() === "") {
            applyLimit(); // Herstel de 'batch' weergave als zoekbalk leeg is
        } else {
            loadMoreBtn.classList.add("hidden"); // Verberg knop tijdens typen
        }
        labels.forEach(label => {
            const ingredientName = label.querySelector("span").textContent.toLowerCase();
            if (ingredientName.includes(query)) {
                label.classList.remove("hidden");
            } else {
                label.classList.add("hidden");
            }
        });
    });

    findButton.addEventListener("click", async () => {
        const checkedInputs = ingredientList.querySelectorAll('input[type="checkbox"]:checked');
        const selectedIngredients = Array.from(checkedInputs).map(input => input.value);

        if (selectedIngredients.length === 0) {
            recipesGrid.innerHTML = "<p>Selecteer ten minste één ingrediënt.</p>";
            return;
        }

        const queryString = new URLSearchParams({ ingredients: selectedIngredients.join(',') }).toString();

        try {
            const res = await fetch(`/api/recipes-by-ingredients?${queryString}`);
            if (!res.ok) {
                throw new Error("Er ging iets mis bij het ophalen van de recepten.");
            }
            const posts = await res.json();

            renderGrid(posts);

        } catch (err) {
            console.error(err);
            recipesGrid.innerHTML = "<p>Kon geen recepten ophalen. Probeer het later opnieuw.</p>";
        }
    });

    function renderGrid(posts) {
        if (!posts || posts.length === 0) {
            recipesGrid.innerHTML = "<p>Geen recepten gevonden die je kunt maken met deze ingrediënten.</p>";
            return;
        }

        recipesGrid.innerHTML = posts.map(post => `
            <div class="card" onclick="location.href='/post/${post.id}'">
                <img src="${post.image_path}" alt="Recipe">
            </div>
        `).join("");

        const images = recipesGrid.querySelectorAll("img");
        let loaded = 0;
        images.forEach(img => {
            if (img.complete) {
                loaded++;
            } else {
                img.addEventListener("load", () => {
                    loaded++;
                    if (loaded === images.length) {
                        resizeMasonry(recipesGrid);
                    }
                });
            }
        });
        if (loaded === images.length) {
            resizeMasonry(recipesGrid);
        }
    }

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

    window.addEventListener("resize", () => resizeMasonry(recipesGrid));
});