window.addEventListener('DOMContentLoaded', () => {
    const body = document.body;
    if (localStorage.getItem('darkmode') === 'enabled') {
        body.classList.add('dark-mode');
    }
});


document.addEventListener("DOMContentLoaded", async () => {
    //elementen en data ophalen
    const grids = document.getElementsByClassName("gridSearch");
    const postTitle = document.getElementById("postTitel")?.innerText || "";
    //vraag api of posts zijn die op deze lijken
    const res = await fetch(`/api/postsLike?q=${encodeURIComponent(postTitle)}`);
    const postsLike = await res.json();
    let currentPostId = null;
    const pathParts = window.location.pathname.split("/").filter(Boolean);
    //slaat het ID van de huidige post op, zodat die niet opnieuw getoond wordt.
    if (pathParts[0] === "post" && !isNaN(pathParts[1])) {
        currentPostId = parseInt(pathParts[1]);
    }

    //loopt door alle grids
    for (const grid of grids) {
        grid.innerHTML = postsLike
            .filter(post => post.id !== currentPostId)
            .map(post => `
        <div class="card" onclick="location.href='/post/${post.id}'">
            <img src="/${post.image_path}" alt="Recipe">
        </div>
    `).join(""); //maakt per post een kaart met een afbeelding => klikken = naar post
        const images = grid.querySelectorAll("img"); //Wachten tot alle afbeeldingen geladen zijn
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
        if (loaded === images.length) resizeMasonry(grid); //alles geladen dan resizen
    }
});

function resizeMasonry(grid) {
    const rowHeight = parseInt(window.getComputedStyle(grid).getPropertyValue('grid-auto-rows'));
    const rowGap = parseInt(window.getComputedStyle(grid).getPropertyValue('gap'));
    const items = grid.querySelectorAll('.card');

    items.forEach(item => {
        const img = item.querySelector('img');
        const itemHeight = img.getBoundingClientRect().height;
        const rowSpan = Math.ceil((itemHeight + rowGap) / (rowHeight + rowGap)); //berekent hoeveel grid-rijen de kaart nodig heeft.
        item.style.gridRowEnd = `span ${rowSpan}`;
    });
}