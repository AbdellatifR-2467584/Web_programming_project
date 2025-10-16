document.querySelector(".recipe-form").addEventListener("submit", async () => {
    const url = document.getElementById('url').value.trim();
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

    localStorage.setItem('parsedRecipe', JSON.stringify(recept));
    window.location.href = '/upload';
    } catch (error) {
    alert('Fout bij het ophalen van recept: ' + error.message);
    }
    
});