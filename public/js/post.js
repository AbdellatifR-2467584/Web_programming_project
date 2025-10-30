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
    const pdf = document.getElementById("post")
    const title = pdf.dataset.title;
    console.log(title)
    html2pdf().from(pdf).save(title);
}
