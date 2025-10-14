const input = document.getElementById("image");
const status = document.getElementById("file-status");
let postknop = document.querySelector("body > div > div > div > form > div.form-post-knop > button");
const previewContainer = document.getElementById("image-preview");
const previewImg = document.getElementById("preview-img");
const removeBtn = document.getElementById("remove-image");
const label = document.querySelector("body > div > div > div > form > div.form-image-upload > label");

input.addEventListener("change", () => {
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
