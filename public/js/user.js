window.addEventListener('DOMContentLoaded', () => {
    const darkmodeSwitch = document.getElementById('darkmodeSwitch');
    const body = document.body;

    if (localStorage.getItem('darkmode') === 'enabled') {
        body.classList.add('dark-mode');
    }

    darkmodeSwitch.addEventListener('click', () => {
        body.classList.toggle('dark-mode');

        if (body.classList.contains('dark-mode')) {
            localStorage.setItem('darkmode', 'enabled');
        } else {
            localStorage.setItem('darkmode', 'disabled');
        }
    });
});


document.addEventListener('DOMContentLoaded', () => {
    const usernameBtn = document.getElementById('changeUsernameBtn');
    const passwordBtn = document.getElementById('changePasswordBtn');

    const usernameModal = document.getElementById('changeUsernameModal');
    const passwordModal = document.getElementById('changePasswordModal');

    const closeButtons = document.querySelectorAll('.modal .close');


    usernameBtn.addEventListener('click', () => {
        usernameModal.style.display = 'flex';
    });
    passwordBtn.addEventListener('click', () => {
        passwordModal.style.display = 'flex';
    });


    // Close modals when clicking X
    closeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const modal = btn.closest('.modal');
            modal.style.display = 'none';

            // Reset form inside modal
            const form = modal.querySelector('form');
            if (form) form.reset();

            // Clear error messages
            const errorDiv = modal.querySelector('div[id$="Error"]');
            if (errorDiv) errorDiv.textContent = '';
        });
    });

    // Close modals if clicking outside modal content
    window.addEventListener('click', (event) => {
        if (event.target.classList.contains('modal')) {
            event.target.style.display = 'none';

            // Reset form inside modal
            const form = event.target.querySelector('form');
            if (form) form.reset();

            // Clear error messages
            const errorDiv = event.target.querySelector('div[id$="Error"]');
            if (errorDiv) errorDiv.textContent = '';
        }
    });
});



document.addEventListener("DOMContentLoaded", () => {
    // ---- Username change ----
    const usernameForm = document.getElementById("changeUsernameForm");
    const usernameErrorDiv = document.getElementById("usernameError");

    usernameForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        usernameErrorDiv.textContent = "";

        const formData = new FormData(usernameForm);
        const newUsername = formData.get("newUsername");

        try {
            const response = await fetch("/user/change-username", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ newUsername })
            });

            const data = await response.json();

            if (data.error) {
                usernameErrorDiv.textContent = data.error;
            } else if (data.success) {
                document.getElementById("username").textContent = data.newUsername;
                document.getElementById("changeUsernameModal").style.display = "none";
            }
        } catch (err) {
            console.error(err);
            usernameErrorDiv.textContent = "Er ging iets mis, probeer opnieuw.";
        }
    });

    // ---- Password change ----
    const passwordForm = document.getElementById("changePasswordForm");
    const passwordErrorDiv = document.getElementById("passwordError");

    passwordForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        passwordErrorDiv.textContent = "";

        const formData = new FormData(passwordForm);
        const currentPassword = formData.get("currentPassword");
        const newPassword = formData.get("newPassword");
        const confirmPassword = formData.get("confirmPassword");

        try {
            const response = await fetch("/user/change-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ currentPassword, newPassword, confirmPassword })
            });

            const data = await response.json();

            if (data.error) {
                passwordErrorDiv.textContent = data.error;
            } else if (data.success) {
                passwordForm.reset();
                document.getElementById("changePasswordModal").style.display = "none";
                alert("Wachtwoord succesvol gewijzigd!");
            }
        } catch (err) {
            console.error(err);
            passwordErrorDiv.textContent = "Er ging iets mis, probeer opnieuw.";
        }
    });
});

document.addEventListener("DOMContentLoaded", () => {
    // ---- Profile Picture Upload & Preview ----
    const pfpImg = document.getElementById("profilepicture");
    const pfpInput = document.getElementById("pfpInput");

    // Modal elements
    const pfpModal = document.getElementById("changeProfilePictureModal");
    const pfpPreview = document.getElementById("pfpPreview");
    const savePfpBtn = document.getElementById("savePfpBtn");
    const cancelPfpBtn = document.getElementById("cancelPfpBtn");
    const pfpErrorDiv = document.getElementById("pfpError");

    // Helper to close modal
    function closePfpModal() {
        if (pfpModal) {
            pfpModal.style.display = "none";
            pfpInput.value = ""; // Clear input
            pfpPreview.src = "";
            pfpPreview.style.display = "none";
            if (pfpErrorDiv) pfpErrorDiv.textContent = "";
        }
    }

    if (pfpImg && pfpInput && pfpModal) {
        // Trigger file input
        pfpImg.addEventListener("click", () => {
            pfpInput.click();
        });

        // Handle file selection -> Show Preview Modal
        pfpInput.addEventListener("change", () => {
            const file = pfpInput.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    pfpPreview.src = e.target.result;
                    pfpPreview.style.display = "block";
                    pfpModal.style.display = "flex";
                };
                reader.readAsDataURL(file);
            }
        });

        // Handle Cancel
        if (cancelPfpBtn) {
            cancelPfpBtn.addEventListener("click", closePfpModal);
        }

        // Handle Save
        if (savePfpBtn) {
            savePfpBtn.addEventListener("click", async () => {
                const file = pfpInput.files[0];
                if (!file) {
                    closePfpModal();
                    return;
                }

                const formData = new FormData();
                formData.append("profilePicture", file);

                // Disable button to prevent double submit
                savePfpBtn.disabled = true;
                savePfpBtn.textContent = "Bezig...";

                try {
                    const response = await fetch("/user/upload-pfp", {
                        method: "POST",
                        body: formData
                    });

                    const data = await response.json();

                    if (data.success) {
                        // Update main pfp
                        pfpImg.src = `/resources/profilepictures/${data.filename}?t=${new Date().getTime()}`;
                        closePfpModal();
                    } else {
                        if (pfpErrorDiv) pfpErrorDiv.textContent = data.error || "Upload mislukt.";
                    }
                } catch (err) {
                    console.error("Error uploading profile picture:", err);
                    if (pfpErrorDiv) pfpErrorDiv.textContent = "Er ging iets mis.";
                } finally {
                    savePfpBtn.disabled = false;
                    savePfpBtn.textContent = "Opslaan";
                }
            });
        }
    }
});