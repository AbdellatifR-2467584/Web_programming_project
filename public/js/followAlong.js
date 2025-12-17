window.addEventListener('DOMContentLoaded', () => {
    const body = document.body;
    if (localStorage.getItem('darkmode') === 'enabled') {
        body.classList.add('dark-mode');
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const ingredientenDiv = document.querySelector('.ingredienten');
    const ingredientList = ingredientenDiv.querySelector('.list-ingredienten');
    const ingredients = JSON.parse(ingredientenDiv.dataset.ingredients);

    const selectAllBtn = document.getElementById('selectAllBtn');
    const startCookingBtn = document.getElementById('startCookingBtn');

    //ingredienten lijst
    ingredients.forEach((ingredient, i) => {
        const li = document.createElement('li');
        li.innerHTML = `<input type="checkbox" id="ingredient-${i}"> <label for="ingredient-${i}">${ingredient}</label>`;
        ingredientList.appendChild(li);
    });
    //alles selecteren
    selectAllBtn.addEventListener('click', () => {
        const checkboxes = ingredientList.querySelectorAll('input[type="checkbox"]');
        const allChecked = Array.from(checkboxes).every(cb => cb.checked);

        checkboxes.forEach(cb => cb.checked = !allChecked);
        selectAllBtn.textContent = allChecked ? 'Alles selecteren' : 'Alles deselecteren';
    });
    //start knop
    startCookingBtn.addEventListener('click', () => {
        const checkboxes = ingredientList.querySelectorAll('input[type="checkbox"]');
        const allChecked = Array.from(checkboxes).every(cb => cb.checked);
        //check dat alle knoppen gechecked zijn
        if (!allChecked) {
            alert('Vink alle ingrediënten aan om verder te gaan!');
            return;
        }
        ingredientenDiv.style.display = 'none';
        startSteps();
    });

    //stappen
    function startSteps() {
        const stappenDiv = document.querySelector('.instructies');
        const steps = JSON.parse(stappenDiv.dataset.steps);
        const stepText = document.getElementById('currentStep');
        const stepCount = document.getElementById('stepCount');
        const progressBar = document.getElementById('progressBar');
        const prevBtn = document.getElementById('prevStep');
        const nextBtn = document.getElementById('nextStep');
        const replayBtn = document.getElementById('replayBtn');
        const ttsToggle = document.getElementById('ttsToggle');

        let currentStep = 0;
        let wakeLock = null;

        stappenDiv.style.display = 'flex';

        //voorkomen dat apparaat vanzelf uitvalt
        async function requestWakeLock() {
            try {
                wakeLock = await navigator.wakeLock.request('screen');
                console.log('Screen Wake Lock active');
            } catch (err) {
                console.error(`${err.name}, ${err.message}`);
            }
        }
        requestWakeLock();

        function speak(text) {
            if (!ttsToggle.checked) return;
            window.speechSynthesis.cancel(); //stop vorige
            const utterance = new SpeechSynthesisUtterance(text);
            window.speechSynthesis.speak(utterance);
        }

        function updateUI() {
            //update de text
            if (currentStep < steps.length) {
                stepText.textContent = steps[currentStep];
                stepCount.textContent = currentStep + 1;

                //update progress bar
                const progress = ((currentStep + 1) / steps.length) * 100;
                progressBar.style.width = `${progress}%`;

                //update bttns
                prevBtn.disabled = currentStep === 0;
                nextBtn.innerHTML = currentStep === steps.length - 1 ? 'Klaar <i class="bi bi-check-lg"></i>' : 'Volgende <i class="bi bi-arrow-right"></i>';

                //spreek
                speak(steps[currentStep]);
            } else {
                finishCooking();
            }
        }

        function finishCooking() {
            stappenDiv.innerHTML = `
                <h2>Gefeliciteerd!</h2>
                <p>Je hebt het gerecht succesvol bereid.</p>
                <button class="action-btn" onclick="window.location.href='/post/${document.querySelector('#postTitel').dataset.id}'">Terug naar recept</button>
            `;
            if (wakeLock) wakeLock.release();
        }

        //volgonde bttn evnet listener
        nextBtn.addEventListener('click', () => {
            if (currentStep < steps.length) {
                currentStep++;
                if (currentStep === steps.length) {
                    finishCooking();
                } else {
                    updateUI();
                }
            }
        });
        //terug naar vorige
        prevBtn.addEventListener('click', () => {
            if (currentStep > 0) {
                currentStep--;
                updateUI();
            }
        });
        //opnieuw stap uitspreken
        replayBtn.addEventListener('click', () => {
            speak(steps[currentStep]);
        });

        //eerste call
        updateUI();
    }
});
