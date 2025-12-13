window.addEventListener('DOMContentLoaded', () => {
    const body = document.body; // select the body element
    if (localStorage.getItem('darkmode') === 'enabled') {
        body.classList.add('dark-mode');
    }
});


function download_pdf() {
    const pdf = document.getElementById("post");
    const wasDark = document.body.classList.contains('dark-mode');
    if (wasDark) document.body.classList.remove('dark-mode');
    const title = pdf.dataset.title;
    html2pdf()
        .from(pdf)
        .save(title)
        .then(() => {
            pdf.classList.remove("force-light");
            if (wasDark) document.body.classList.add('dark-mode');
        });
}

async function clipboard_copy() {
    const titel = document.getElementById('postTitel').textContent.trim();

    const ingredientenLijstItems = document.querySelectorAll('.list-ingredienten li');
    let ingredientenTekst = '';
    ingredientenLijstItems.forEach(item => {
        ingredientenTekst += `- ${item.textContent.trim()}\n`;
    });

    const stappenLijstItems = document.querySelectorAll('.list-stappen li');
    let stappenTekst = '';
    stappenLijstItems.forEach((item, index) => {
        stappenTekst += `${index + 1}. ${item.textContent.trim()}\n`;
    });

    const volledigeTekst =
        `RECEPT: ${titel}\n\n` +
        `--- Ingrediënten ---\n` +
        ingredientenTekst +
        `\n--- Bereidingswijze ---\n` +
        stappenTekst;

    try {
        await navigator.clipboard.writeText(volledigeTekst);

        const knop = document.getElementById('clipboard');
        const origineleHTML = knop.innerHTML;

        knop.innerHTML = '<i class="bi bi-check-lg"></i>';
        knop.disabled = true; // Voorkom dubbelklikken

        setTimeout(() => {
            knop.innerHTML = origineleHTML;
            knop.disabled = false;
        }, 2000); // Reset na 2 seconden

    } catch (err) {
        console.error('Kopiëren mislukt:', err);
        alert('Fout: Het kopiëren naar het klembord is mislukt. Probeer het handmatig. (Zie console voor details)');
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const favoriteBtn = document.getElementById("favorite-btn");

    if (favoriteBtn) {
        favoriteBtn.addEventListener("click", async () => {
            const postId = favoriteBtn.dataset.postId;
            const icon = favoriteBtn.querySelector("i");

            // Optimistic UI update
            const isFilled = icon.classList.contains("bi-heart-fill");
            if (isFilled) {
                icon.classList.remove("bi-heart-fill");
                icon.classList.add("bi-heart");
                favoriteBtn.classList.remove("active");
            } else {
                icon.classList.remove("bi-heart");
                icon.classList.add("bi-heart-fill");
                favoriteBtn.classList.add("active");
            }

            try {
                const response = await fetch(`/post/${postId}/favorite`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" }
                });

                if (response.status === 401) {
                    alert("Je moet ingelogd zijn om favorieten op te slaan.");
                    // Revert UI
                    if (isFilled) {
                        icon.classList.add("bi-heart-fill");
                        icon.classList.remove("bi-heart");
                        favoriteBtn.classList.add("active");
                    } else {
                        icon.classList.add("bi-heart");
                        icon.classList.remove("bi-heart-fill");
                        favoriteBtn.classList.remove("active");
                    }
                    return;
                }

                const data = await response.json();

                // Ensure UI matches server state (just in case)
                if (data.favorited) {
                    icon.classList.remove("bi-heart");
                    icon.classList.add("bi-heart-fill");
                    favoriteBtn.classList.add("active");
                } else {
                    icon.classList.remove("bi-heart-fill");
                    icon.classList.add("bi-heart");
                    favoriteBtn.classList.remove("active");
                }

            } catch (error) {
                console.error("Error toggling favorite:", error);
                // Revert UI on error
                if (isFilled) {
                    icon.classList.remove("bi-heart");
                    icon.classList.add("bi-heart-fill");
                    favoriteBtn.classList.add("active");
                } else {
                    icon.classList.remove("bi-heart-fill");
                    icon.classList.add("bi-heart");
                    favoriteBtn.classList.remove("active");
                }
            }
        });
    }
});