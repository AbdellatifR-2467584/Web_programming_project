// Select input and status span
const input = document.getElementById("image");
const status = document.getElementById("file-status");

// Listen for file changes
input.addEventListener("change", () => {
    if (input.files.length > 0) {
        status.textContent = `Bestand geselecteerd: ${input.files[0].name}`;
    } else {
        status.textContent = "Geen bestand geselecteerd";
    }
});