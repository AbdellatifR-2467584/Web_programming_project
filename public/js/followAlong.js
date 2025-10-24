

document.addEventListener('DOMContentLoaded', () => {
    const ingredientenDiv = document.querySelector('.ingredienten');
    const ingredientList = ingredientenDiv.querySelector('.list-ingredienten');
    const ingredients = JSON.parse(ingredientenDiv.dataset.ingredients);

    ingredients.forEach((ingredient, i) => {
        const li = document.createElement('li');
        li.innerHTML = `<input type="checkbox" id="ingredient-${i}"> <label for="ingredient-${i}">${ingredient}</label>`;
        ingredientList.appendChild(li);
    });

    const volgendeBtn = document.createElement('button');
    volgendeBtn.textContent = 'Volgende';
    ingredientenDiv.appendChild(volgendeBtn);

    volgendeBtn.addEventListener('click', () => {
        const allChecked = ingredients.every((_, i) => document.getElementById(`ingredient-${i}`).checked);
        if (!allChecked) {
            alert('Vink alle ingrediënten aan om verder te gaan!');
            return;
        }
        ingredientenDiv.style.display = 'none';
        startSteps();
    });

    function startSteps() {
        const stappenDiv = document.querySelector('.instructies');
        const steps = JSON.parse(stappenDiv.dataset.steps);
        const stepText = document.getElementById('currentStep');
        let currentStep = 0;

        stappenDiv.style.display = 'block';

        function speak(text) {
            const utterance = new SpeechSynthesisUtterance(text);
            window.speechSynthesis.speak(utterance);
        }

        function showStep() {
            if (currentStep < steps.length) {
                stepText.textContent = steps[currentStep];
                speak(steps[currentStep]);
            } else {
                stepText.textContent = 'Gefeliciteerd, je bent klaar!';
                document.getElementById('nextStep').style.display = 'none';

                const terugBtn = document.createElement('button');
                terugBtn.textContent = 'Ga terug naar post';
                terugBtn.style.marginTop = '20px';
                terugBtn.addEventListener('click', () => {
                    const postId = document.querySelector('#postTitel').dataset.id;
                    window.location.href = `/post/${postId}`;
                });

                stappenDiv.appendChild(terugBtn);
            }
        }

        document.getElementById('nextStep').addEventListener('click', () => {
            currentStep++;
            showStep();
        });

        showStep();
    }
});
