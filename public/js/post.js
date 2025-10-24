document.addEventListener('DOMContentLoaded', () => {
    const postDiv = document.querySelector(".ingredienten");
    const ingredients = JSON.parse(postDiv.dataset.ingredients);
    const ul = document.querySelector(".list-ingredienten");
    for (const ingredient of ingredients) {
        const li = document.createElement("li");
        li.textContent = ingredient;
        ul.appendChild(li);
    }
});
