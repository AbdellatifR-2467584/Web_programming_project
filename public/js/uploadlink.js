document.querySelector(".recipe-form").addEventListener("submit", async (e) => {
    const url = document.getElementById("url").value;
    console.log('entreee');
    try {
    const response = await fetch('/api/fetchrecipe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
    });

    const data = await response.json(); // lees body één keer

    if (!response.ok) {
        throw new Error(data.error || 'Fout bij ophalen recept');
    }

    localStorage.setItem('parsedRecipe', JSON.stringify(data.recept));
    window.location.href = '/upload';
    } catch (error) {
    alert('Fout bij het ophalen van recept: ' + error.message);
    }
    
});