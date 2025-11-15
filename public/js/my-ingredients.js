document.addEventListener("DOMContentLoaded", () => {
    const searchInput = document.getElementById("ingredient-search");
    const ingredientList = document.getElementById("ingredient-list");
    const findButton = document.getElementById("find-recipes-btn");
    const recipesGrid = document.getElementById("recipes-grid");
    const labels = ingredientList.querySelectorAll(".ingredient-label");

    // 1. Logica voor het filteren van de ingrediëntenlijst
    searchInput.addEventListener("input", () => {
        const query = searchInput.value.toLowerCase().trim();
        labels.forEach(label => {
            const ingredientName = label.querySelector("span").textContent.toLowerCase();
            if (ingredientName.includes(query)) {
                label.classList.remove("hidden");
            } else {
                label.classList.add("hidden");
            }
        });
    });

    // 2. Logica voor het ophalen en weergeven van recepten
    findButton.addEventListener("click", async () => {
        const checkedInputs = ingredientList.querySelectorAll('input[type="checkbox"]:checked');
        const selectedIngredients = Array.from(checkedInputs).map(input => input.value);

        if (selectedIngredients.length === 0) {
            recipesGrid.innerHTML = "<p>Selecteer ten minste één ingrediënt.</p>";
            return;
        }

        // Bouw de query string
        const queryString = new URLSearchParams({ ingredients: selectedIngredients.join(',') }).toString();
        
        try {
            const res = await fetch(`/api/recipes-by-ingredients?${queryString}`);
            if (!res.ok) {
                throw new Error("Er ging iets mis bij het ophalen van de recepten.");
            }
            const posts = await res.json();

            // Render het grid
            renderGrid(posts);

        } catch (err) {
            console.error(err);
            recipesGrid.innerHTML = "<p>Kon geen recepten ophalen. Probeer het later opnieuw.</p>";
        }
    });

    // 3. Functie om het grid te vullen
    function renderGrid(posts) {
        if (!posts || posts.length === 0) {
            recipesGrid.innerHTML = "<p>Geen recepten gevonden die je kunt maken met deze ingrediënten.</p>";
            return;
        }

        // Gebruik dezelfde grid-opmaak als in je andere bestanden
        recipesGrid.innerHTML = posts.map(post => `
            <div class="card" onclick="location.href='/post/${post.id}'">
                <img src="${post.image_path}" alt="Recipe">
            </div>
        `).join("");

        // Roep de Masonry-functie aan nadat de afbeeldingen zijn geladen
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

    // 4. Masonry-logica (gekopieerd uit index.js/grid.js voor consistentie)
    //    Zorg ervoor dat deze functie hier beschikbaar is.
    function resizeMasonry(grid) {
        if (!grid) return;
        
        const rowHeight = parseInt(window.getComputedStyle(grid).getPropertyValue('grid-auto-rows'));
        const rowGap = parseInt(window.getComputedStyle(grid).getPropertyValue('gap'));
        const items = grid.querySelectorAll('.card');

        items.forEach(item => {
            const img = item.querySelector('img');
            if (img) {
                // Wacht tot het img element een 'echte' hoogte heeft
                const itemHeight = img.getBoundingClientRect().height;
                if (itemHeight > 0) {
                    const rowSpan = Math.ceil((itemHeight + rowGap) / (rowHeight + rowGap));
                    item.style.gridRowEnd = `span ${rowSpan}`;
                }
            }
        });
    }

    // Roep resizeMasonry ook aan bij het wijzigen van het venster
    window.addEventListener("resize", () => resizeMasonry(recipesGrid));
});