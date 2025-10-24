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
    document.getElementById('ingredients').value = recept.ingredients || '';
    document.getElementById('steps').value = recept.steps || '';

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
    document.getElementById('ingredients').value = recept.ingredients || '';
    document.getElementById('steps').value = recept.steps || '';
    document.getElementById('post_url').value = recept.post_url || '';
    document.querySelector('.form-recept-url').classList.add('visible');
    if (recept.image_url) {
      setImageFromUrl(recept.image_url);
  }

  } catch (error) {
    alert('Fout bij ophalen recept: ' + error.message);
  }
});

document.addEventListener("DOMContentLoaded", () => {
  const AddButton = document.getElementById("add");
  const ingredientinput = document.getElementById("ingredients")
  const ingredientenLijst = document.getElementById("ingredienten-lijst");
  if (!ingredientenLijst) return;
  function AddButtonfunc() {
    const newRow = document.createElement('div');
    newRow.classList.add('ingredienten-row');
    newRow.innerHTML = `
      <input type="text" name="ingredients[]" placeholder="Ingrediënt" required>
      <button type="button" class="remove">-</button>
    `;
    ingredientenLijst.appendChild(newRow);
    ingredientenLijst.lastElementChild.children[0].value = ingredientenLijst.children[0].children[0].value;
    ingredientenLijst.children[0].children[0].value = "";

  }
  AddButton.addEventListener('click', () => {
    AddButtonfunc();
  });

  ingredientinput.addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
      if (ingredientinput != "") {
        event.preventDefault();
        AddButtonfunc();
      }

    }
  });

  ingredientenLijst.addEventListener('click', (e) => {
    if (e.target.classList.contains('remove')) {
      e.target.parentElement.remove();
    }
  });
});

async function setImageFromUrl(imageUrl) {
    if (!imageUrl) return;

    try {
        const response = await fetch(imageUrl);
        const blob = await response.blob();

        // Maak een virtuele File
        const file = new File([blob], 'recipe.jpg', { type: blob.type });

        // Simuleer een echte file upload
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        const input = document.getElementById('image');
        input.files = dataTransfer.files;

        // Toon preview
        const previewImg = document.getElementById('preview-img');
        const previewContainer = document.getElementById('image-preview');
        previewImg.src = URL.createObjectURL(blob);
        previewContainer.style.display = 'block';

        // Update status label
        document.getElementById('file-status').textContent = file.name;

        // 🔒 Disable upload knop zodat gebruiker geen andere foto kan kiezen
        input.disabled = true;
        const label = document.querySelector('.custom-file-button');
        label.style.display = 'none';
    } catch (error) {
        console.error('Kon afbeelding niet laden:', error);
        document.getElementById('file-status').textContent = 'Afbeelding kon niet geladen worden';
    }
}

