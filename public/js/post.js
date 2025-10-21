document.addEventListener('DOMContentLoaded', () => {
    const post = document.querySelector(".ingredienten");
    let raw = JSON.parse(post.dataset.ingredients);
    raw = raw.replace(/^"(.*)"$/, '$1');
    const ingredients = JSON.parse(raw);
    const ul = document.querySelector(".list-ingredienten");
    for (const ingredient of ingredients) {
        let li = document.createElement("li");
        li.appendChild(document.createTextNode(ingredient));
        ul.appendChild(li);
    }
});