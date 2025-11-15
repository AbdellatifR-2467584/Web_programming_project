window.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('.recipe-form');
  const titleInput = document.getElementById('title');
  const postUrlInput = document.getElementById('post_url');
  const youtubeInput = document.getElementById('youtube_url');
  const ingredientContainer = document.getElementById('ingredienten-lijst');
  const stepsContainer = document.getElementById('stappen-lijst');
  const imageInput = document.getElementById('image');
  const previewContainer = document.getElementById('image-preview');
  const previewImg = document.getElementById('preview-img');
  const removeBtn = document.getElementById('remove-image');
  const statusLabel = document.getElementById('file-status');
  const uploadLabel = document.querySelector('.custom-file-button');
  const submitBtn = form.querySelector('.submit-button');

  const postDataInput = document.getElementById('post-data');
  const postData = postDataInput && postDataInput.value ? JSON.parse(postDataInput.value) : null;

  // ---------------- IMAGE LOGIC ----------------
  function resetImage() {
    uploadLabel.style.display = "inline-block";
    imageInput.value = "";
    previewImg.src = "";
    previewContainer.style.display = "none";
    submitBtn.style.backgroundColor = "gray";
    statusLabel.textContent = "Geen bestand geselecteerd";
    imageInput.disabled = false;
  }

  imageInput.addEventListener('change', e => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = e => {
        previewImg.src = e.target.result;
        previewContainer.style.display = 'inline-block';
        statusLabel.textContent = file.name;
        uploadLabel.style.display = "none";
        submitBtn.style.backgroundColor = "#e60023";
        submitBtn.style.color = "white";
      };
      reader.readAsDataURL(file);
    } else resetImage();
  });

  removeBtn.addEventListener('click', resetImage);

  async function setImageFromUrl(imageUrl) {
    if (!imageUrl) return;
    try {
      const res = await fetch(imageUrl);
      const blob = await res.blob();
      const file = new File([blob], 'recipe.jpg', { type: blob.type });
      const dt = new DataTransfer();
      dt.items.add(file);
      imageInput.files = dt.files;

      previewImg.src = URL.createObjectURL(blob);
      previewContainer.style.display = 'block';
      statusLabel.textContent = file.name;
      imageInput.disabled = true;
      uploadLabel.style.display = 'none';
      submitBtn.style.backgroundColor = '#e60023';
      submitBtn.style.color = 'white';
    } catch (err) {
      console.error('Kon afbeelding niet laden:', err);
      statusLabel.textContent = 'Afbeelding kon niet geladen worden';
    }
  }

  // ---------------- INGREDIENT LOGIC ----------------
  function renderIngredients(ingredients = []) {
    ingredientContainer.innerHTML = '';

    // Top empty row with + button (always stays at top)
    const topRow = document.createElement('div');
    topRow.className = 'standaard-row';
    topRow.innerHTML = `<input type="text" name="ingredients[]" placeholder="Ingrediënt"><button type="button" class="add">+</button>`;
    ingredientContainer.appendChild(topRow);

    // Existing ingredients below with - buttons
    ingredients.forEach(ing => {
      const row = document.createElement('div');
      row.className = 'standaard-row';
      row.innerHTML = `<input type="text" name="ingredients[]" value="${ing}" placeholder="Ingrediënt"><button type="button" class="remove">-</button>`;
      ingredientContainer.appendChild(row);
    });

    // Focus on the top input
    topRow.querySelector('input').focus();
  }

  // Event delegation for ingredients
  ingredientContainer.addEventListener('click', e => {
    if (e.target.classList.contains('add')) {
      const topRow = ingredientContainer.querySelector('.add').parentElement;
      const input = topRow.querySelector('input');
      const value = input.value.trim();
      if (!value) return;

      // Create a new ingredient row below top row
      const row = document.createElement('div');
      row.className = 'standaard-row';
      row.innerHTML = `<input type="text" name="ingredients[]" value="${value}" placeholder="Ingrediënt"><button type="button" class="remove">-</button>`;
      ingredientContainer.appendChild(row);

      // Clear top input and keep focus
      input.value = '';
      input.focus();
    } else if (e.target.classList.contains('remove')) {
      e.target.parentElement.remove();
    }
  });

  // Press Enter on top input to add ingredient
  ingredientContainer.addEventListener('keypress', e => {
    if (e.key === 'Enter' && e.target.matches('input[name="ingredients[]"]') && e.target.value.trim() !== "") {
      e.preventDefault();
      const addBtn = ingredientContainer.querySelector('.add');
      addBtn.click();
    }
  });


  // ---------------- STEPS LOGIC ----------------
  function renderSteps(steps = []) {
    stepsContainer.innerHTML = '';
    steps.forEach((step, i) => {
      const row = document.createElement('div');
      row.className = 'stappen-row';
      const isLast = i === steps.length - 1;
      row.innerHTML = `<input type="text" name="steps[]" value="${step}" placeholder="Type hier je stap"><button type="button" class="${isLast ? 'add' : 'remove'}">${isLast ? '+' : '-'}</button>`;
      stepsContainer.appendChild(row);
    });
    if (!steps.length) {
      // Ensure at least one row with +
      const row = document.createElement('div');
      row.className = 'stappen-row';
      row.innerHTML = `<input type="text" name="steps[]" placeholder="Type hier je stap"><button type="button" class="add">+</button>`;
      stepsContainer.appendChild(row);
    }
  }

  stepsContainer.addEventListener('click', e => {
    if (e.target.classList.contains('add')) {
      const row = document.createElement('div');
      row.className = 'stappen-row';
      row.innerHTML = `<input type="text" name="steps[]" placeholder="Type hier je stap"><button type="button" class="add">+</button>`;
      // Convert previous + to -
      const prevAdd = stepsContainer.querySelectorAll('.add');
      if (prevAdd.length > 0) prevAdd[prevAdd.length - 1].outerHTML = '<button type="button" class="remove">-</button>';
      stepsContainer.appendChild(row);
      row.querySelector('input').focus();
    } else if (e.target.classList.contains('remove')) {
      e.target.parentElement.remove();
    }
  });

  stepsContainer.addEventListener('keypress', e => {
    if (e.key === 'Enter' && e.target.matches('input[name="steps[]"]') && e.target.value.trim() !== "") {
      e.preventDefault();
      const lastAdd = stepsContainer.querySelector('.add:last-of-type');
      lastAdd?.click();
    }
  });
  function setImageFromUrl(imagePath) {
    if (!imagePath) return;

    // Normalize backslashes and ensure it starts with /
    const normalizedPath = '/' + imagePath.replace(/\\/g, '/').replace(/^\/+/, '');
    console.log(normalizedPath);
    console.log("test");
    previewImg.src = normalizedPath; // directly set src
    previewContainer.style.display = 'block';
    statusLabel.textContent = normalizedPath.split('/').pop();
    imageInput.disabled = true;
    uploadLabel.style.display = 'none';
    submitBtn.style.backgroundColor = '#e60023';
    submitBtn.style.color = 'white';
  }
  // ---------------- PREFILL DATA ----------------
  if (postData) {
    form.action = `/post/${postData.id}/edit`;
    submitBtn.innerHTML = `<i class="bi bi-save"></i><br>`;

    titleInput.value = postData.title || '';
    postUrlInput.value = postData.post_url || '';
    youtubeInput.value = postData.youtube_url || '';

    if (postData.image_path) {
      setImageFromUrl(postData.image_path);
    }
    console.log("test");
    renderIngredients(postData.ingredients || []);
    renderSteps(postData.steps || []);
  } else {
    renderIngredients();
    renderSteps();
  }
  // ---------------- FETCH RECIPE ----------------
  document.getElementById('fetch-btn')?.addEventListener('click', async () => {
    const url = document.getElementById('recipe-url').value.trim();
    if (!url) return alert('Voer een geldige URL in.');

    try {
      const res = await fetch('/api/fetchrecipe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Fout bij ophalen recept');
      }
      const data = await res.json();
      const recept = data.recept;

      titleInput.value = recept.title || '';
      postUrlInput.value = url;
      document.querySelector(".form-recept-url").classList.add("visible");
      youtubeInput.value = recept.youtube_url || '';

      renderIngredients(recept.ingredients || []);
      renderSteps(recept.steps || []);

      if (recept.image_url) setImageFromUrl(recept.image_url);
    } catch (err) {
      alert('Fout bij ophalen recept: ' + err.message);

    }
  });
});
