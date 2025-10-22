const input = document.getElementById("image");
const status = document.getElementById("file-status");
let postknop = document.querySelector("body > div > div > div > form > div.form-post-knop > button");
const previewContainer = document.getElementById("image-preview");
const previewImg = document.getElementById("preview-img");
const removeBtn = document.getElementById("remove-image");
const label = document.querySelector("body > div > div > div > form > div.form-image-upload > label");

input.addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader()
        reader.onload = function (e) {
            previewImg.src = e.target.result;
            previewContainer.style.display = "inline-block";
            status.textContent = file.name;
            label.style.display = "none";
        }
        postknop.style.backgroundColor = "#e60023";
        postknop.style.color = "white";
        reader.readAsDataURL(file);
    } else {
        previewContainer.style.display = "none"
        label.style.display = "inline-block";
        status.textContent = "Geen bestand geselecteerd";
        postknop.style.backgroundColor = "gray";
    }
});


removeBtn.addEventListener("click", () => {
    label.style.display = "inline-block";
    input.value = "";
    previewImg.src = "";
    previewContainer.style.display = "none";
    postknop.style.backgroundColor = "gray";
    status.textContent = "Geen bestand geselecteerd";
});

document.addEventListener('DOMContentLoaded', () => {
    const parsed = localStorage.getItem('parsedRecipe');
    if (parsed) {
        const recept = JSON.parse(parsed);
        document.getElementById('title').value = recept.title || '';
        document.getElementById('ingredients').value = recept.ingredients|| '';
        document.getElementById('steps').value = recept.steps|| '';

        // optioneel verwijderen van localStorage zodat het niet dubbel wordt geladen
        //localStorage.removeItem('parsedRecipe');
    }
});

document.getElementById('fetch-btn').addEventListener('click', async () => {
  const url = document.getElementById('recipe-url').value.trim();
  if (!url) return alert('Voer een geldige URL in.');

  try {
    const response = await fetch('/api/fetchrecipe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url })
    });

    if (!response.ok) {
      const errData = await response.json();
      throw new Error(errData.error || 'Fout bij ophalen recept');
    }

    const data = await response.json();
    const recept = data.recept;


    document.getElementById('title').value = recept.title || '';
    document.getElementById('ingredients').value = recept.ingredients|| '';
    document.getElementById('steps').value = recept.steps|| '';

  } catch (error) {
    alert('Fout bij ophalen recept: ' + error.message);
  }
});
