window.addEventListener('DOMContentLoaded', () => {
    const body = document.body; // select the body element
    if (localStorage.getItem('darkmode') === 'enabled') {
        body.classList.add('dark-mode');
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const postDiv = document.querySelector(".ingredienten");
    const ingredients = JSON.parse(postDiv.dataset.ingredients);
    const ul = document.querySelector(".list-ingredienten");
    for (const ingredient of ingredients) {
        if (ingredient != "") {
            const li = document.createElement("li");
            li.textContent = ingredient;
            ul.appendChild(li);
        }
    }
});


document.addEventListener('DOMContentLoaded', () => {
    const postDiv = document.querySelector(".instructies");
    const instructies = JSON.parse(postDiv.dataset.ingredients);
    const ol = document.querySelector(".list-stappen");
    for (const instructie of instructies) {
        if (instructie != "") {
            const li = document.createElement("li");
            li.textContent = instructie;
            ol.appendChild(li);
        }
    }
});


function download_pdf() {
    const pdf = document.getElementById("post");
    const title = pdf.dataset.title;
    html2pdf().from(pdf).save(title);
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

        knop.innerHTML = '<i class="bi bi-check-lg"></i> Gekopieerd!';
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