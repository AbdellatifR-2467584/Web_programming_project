window.addEventListener('DOMContentLoaded', () => {
  const body = document.body;
  if (localStorage.getItem('darkmode') === 'enabled') {
    body.classList.add('dark-mode');
  }
});

window.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('.recipe-form');
  const titleInput = document.getElementById('title');
  const postUrlInput = document.getElementById('post_url');
  const youtubeInput = document.getElementById('youtube_url');
  const ingredientContainer = document.getElementById('ingredienten-lijst');
  const stepsContainer = document.getElementById('stappen-lijst');

  //Main Image Elements
  const imageInput = document.getElementById('image');
  const previewContainer = document.getElementById('image-preview');
  const previewImg = document.getElementById('preview-img');
  const removeBtn = document.getElementById('remove-image');
  const statusLabel = document.getElementById('file-status');
  const uploadLabel = document.getElementById('upload-label');

  //Walkthrough Media Elements
  const mediaInput = document.getElementById('media');
  const mediaPreviewContainer = document.getElementById('media-preview');
  const mediaContent = document.getElementById('media-content');
  const removeMediaBtn = document.getElementById('remove-media');
  const mediaStatusLabel = document.getElementById('media-status');
  const mediaLabel = document.getElementById('media-label');

  const submitBtn = form.querySelector('.submit-button');

  const postDataInput = document.getElementById('post-data');
  const postData = postDataInput && postDataInput.value ? JSON.parse(postDataInput.value) : null;

  //main img logica
  function resetImage() {
    uploadLabel.style.display = "flex";
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
        previewContainer.style.display = 'block';
        statusLabel.textContent = file.name;
        uploadLabel.style.display = "none";
        submitBtn.style.backgroundColor = "#e60023";
        submitBtn.style.color = "white";
      };
      reader.readAsDataURL(file);
    } else resetImage();
  });

  removeBtn.addEventListener('click', resetImage);

  //walkthrough media logica
  let accumulatedMediaFiles = [];
  let existingMediaPaths = [];

  function updateMediaInputFiles() {
    const dataTransfer = new DataTransfer();
    accumulatedMediaFiles.forEach(file => dataTransfer.items.add(file));
    mediaInput.files = dataTransfer.files;
    mediaStatusLabel.textContent = `${accumulatedMediaFiles.length + existingMediaPaths.length} bestand(en) geselecteerd`;
  }

  function updateExistingMediaInputs() {
    //verwijder oude inputs
    document.querySelectorAll('input[name="existing_media[]"]').forEach(el => el.remove());

    //voeg nieuwe inputs toe
    existingMediaPaths.forEach(path => {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = 'existing_media[]';
      input.value = path;
      form.appendChild(input);
    });
  }

  function renderMediaPreviews() {
    mediaContent.innerHTML = "";
    mediaContent.style.display = "flex";
    mediaContent.style.gap = "10px";
    mediaContent.style.overflowX = "auto";

    const createWrapper = (isExisting, index) => {
      const wrapper = document.createElement('div');
      wrapper.style.minWidth = "150px";
      wrapper.style.width = "150px";
      wrapper.style.height = "150px";
      wrapper.style.position = "relative";
      wrapper.style.borderRadius = "8px";
      wrapper.style.overflow = "hidden";
      wrapper.style.backgroundColor = "#f0f0f0";
      wrapper.style.flexShrink = "0";

      const removeBtn = document.createElement('button');
      removeBtn.innerHTML = '<i class="bi bi-x"></i>';
      removeBtn.className = 'remove-image';
      removeBtn.style.position = 'absolute';
      removeBtn.style.top = '5px';
      removeBtn.style.right = '5px';
      removeBtn.style.background = 'rgba(0,0,0,0.5)';
      removeBtn.style.color = '#fff';
      removeBtn.style.border = 'none';
      removeBtn.style.borderRadius = '50%';
      removeBtn.style.width = '24px';
      removeBtn.style.height = '24px';
      removeBtn.style.cursor = 'pointer';
      removeBtn.style.display = 'flex';
      removeBtn.style.alignItems = 'center';
      removeBtn.style.justifyContent = 'center';
      removeBtn.style.zIndex = '10';

      removeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        if (isExisting) {
          existingMediaPaths.splice(index, 1);
          updateExistingMediaInputs();
        } else {
          accumulatedMediaFiles.splice(index, 1);
          updateMediaInputFiles();
        }
        renderMediaPreviews();
        if (accumulatedMediaFiles.length === 0 && existingMediaPaths.length === 0) resetMedia();
      });

      wrapper.appendChild(removeBtn);
      return wrapper;
    };

    //render bestaande media
    existingMediaPaths.forEach((path, index) => {
      const wrapper = createWrapper(true, index);
      const normalized = new URL(path, window.location.origin).pathname;
      const isVideo = normalized.endsWith('.mp4') || normalized.endsWith('.webm') || normalized.endsWith('.mov');

      if (isVideo) {
        const video = document.createElement('video');
        video.src = normalized;
        video.controls = false;
        video.style.width = '100%';
        video.style.height = '100%';
        video.style.objectFit = 'cover';
        wrapper.appendChild(video);
      } else {
        const img = document.createElement('img');
        img.src = normalized;
        img.alt = "Existing Media";
        img.style.width = '100%';
        img.style.height = '100%';
        img.style.objectFit = 'cover';
        wrapper.appendChild(img);
      }
      mediaContent.appendChild(wrapper);
    });

    //render nieuwe files
    accumulatedMediaFiles.forEach((file, index) => {
      const fileType = file.type;
      const reader = new FileReader();
      const wrapper = createWrapper(false, index);

      mediaContent.appendChild(wrapper);

      reader.onload = ev => {
        if (fileType.startsWith('video/')) {
          const video = document.createElement('video');
          video.src = ev.target.result;
          video.controls = false;
          video.style.width = '100%';
          video.style.height = '100%';
          video.style.objectFit = 'cover';
          wrapper.appendChild(video);
        } else {
          const img = document.createElement('img');
          img.src = ev.target.result;
          img.alt = "New Media";
          img.style.width = '100%';
          img.style.height = '100%';
          img.style.objectFit = 'cover';
          wrapper.appendChild(img);
        }
      };
      reader.readAsDataURL(file);
    });

    //"+" knop voor meer media
    const addMoreBtn = document.createElement('div');
    addMoreBtn.style.minWidth = "150px";
    addMoreBtn.style.width = "150px";
    addMoreBtn.style.height = "150px";
    addMoreBtn.style.borderRadius = "8px";
    addMoreBtn.style.backgroundColor = "#e0e0e0";
    addMoreBtn.style.display = "flex";
    addMoreBtn.style.alignItems = "center";
    addMoreBtn.style.justifyContent = "center";
    addMoreBtn.style.cursor = "pointer";
    addMoreBtn.style.flexShrink = "0";
    addMoreBtn.innerHTML = '<i class="bi bi-plus-lg" style="font-size: 2rem; color: #666;"></i>';

    addMoreBtn.addEventListener('click', () => {
      mediaInput.click();
    });

    mediaContent.appendChild(addMoreBtn);

    mediaPreviewContainer.style.display = 'block';
    mediaLabel.style.display = "none";
  }

  function resetMedia() {
    mediaLabel.style.display = "flex";
    mediaInput.value = "";
    accumulatedMediaFiles = [];
    existingMediaPaths = [];
    updateExistingMediaInputs();
    mediaContent.innerHTML = "";
    mediaPreviewContainer.style.display = "none";
    mediaStatusLabel.textContent = "Geen bestand geselecteerd";
    mediaInput.disabled = false;
  }

  mediaInput.addEventListener('change', e => {
    const newFiles = Array.from(e.target.files);
    if (newFiles.length > 0) {
      accumulatedMediaFiles = [...accumulatedMediaFiles, ...newFiles];
      updateMediaInputFiles();
      renderMediaPreviews();
    }
  });

  removeMediaBtn.addEventListener('click', resetMedia);


  async function downloadImageToInput(imageUrl) {
    if (!imageUrl) return;

    // 1. Laat het plaatje zien in de browser (dit mag wel met CORS!)
    previewImg.src = imageUrl;
    previewContainer.style.display = 'block';

    // 2. Stop de URL in het verborgen veld
    const hiddenInput = document.getElementById('image_url_external');
    if (hiddenInput) {
      hiddenInput.value = imageUrl;
    }

    // 3. Update de labels
    statusLabel.textContent = "Afbeelding gevonden via AI";

    // We hebben geen fysiek bestand in de <input type="file">, 
    // dus we laten die met rust. De server moet straks checken op de URL.

    uploadLabel.style.display = 'none';
    submitBtn.style.backgroundColor = '#e60023';
    submitBtn.style.color = 'white';
  }

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


  //stappen logica
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

  function showExistingImage(imagePath) {
    if (!imagePath) return;

    // Create normalized path relative to the site root
    const normalized = new URL(imagePath, window.location.origin).pathname;

    console.log(normalized);
    previewImg.src = normalized;
    previewContainer.style.display = 'block';
    statusLabel.textContent = normalized.split('/').pop();
    imageInput.disabled = true;
    uploadLabel.style.display = 'none';
    submitBtn.style.backgroundColor = '#e60023';
    submitBtn.style.color = 'white';
  }

  function showExistingMedia(mediaPaths) {
    if (!mediaPaths) return;

    // Handle legacy single string vs new array
    const paths = Array.isArray(mediaPaths) ? mediaPaths : [mediaPaths];
    if (paths.length === 0) return;

    existingMediaPaths = paths;
    updateExistingMediaInputs();
    renderMediaPreviews();
    mediaStatusLabel.textContent = `${paths.length} bestand(en) geselecteerd`;
  }

  //date opvullen voor de edit
  if (postData) {
    form.action = `/post/${postData.id}/edit`;
    submitBtn.innerHTML = `<i class="bi bi-save"></i><br>`;

    titleInput.value = postData.title || '';
    postUrlInput.value = postData.post_url || '';
    youtubeInput.value = postData.youtube_url || '';

    if (postData.image_path) {
      showExistingImage(postData.image_path);
    }
    if (postData.media_path) {
      showExistingMedia(postData.media_path);
    }

    console.log("test");
    renderIngredients(postData.ingredients || []);
    renderSteps(postData.steps || []);
  } else {
    renderIngredients();
    renderSteps();
  }
  //ai fetch recipe
  document.getElementById('fetch-btn')?.addEventListener('click', async () => {
    const url = document.getElementById('recipe-url').value.trim();
    if (!url) return alert('Voer een geldige URL in.');
    const loading = document.getElementById('loading');

    try {
      loading.style.display = 'flex';
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

      if (recept.image_url) {
        downloadImageToInput(recept.image_url);
      }
    } catch (err) {
      alert('Fout bij ophalen recept: ' + err.message);

    } finally {
      loading.style.display = 'none';
    }
  });
});
